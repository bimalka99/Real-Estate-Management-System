using MediatR;
using Microsoft.Extensions.Configuration;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Application.Features.Auth.Dtos;
using RealEstate.Domain.Entities;
using RealEstate.Domain.Enums;

namespace RealEstate.Application.Features.Auth.Commands.Register;

public class RegisterCommand : IRequest<AuthResponseDto>
{
    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;

    /// <summary>
    /// Self-registration is limited to Client or Agent (validated) — AgencyAdmin/
    /// SuperAdmin accounts are provisioned separately, not through public signup.
    /// </summary>
    public UserRole Role { get; set; } = UserRole.Client;
}

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, AuthResponseDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenService _tokenService;
    private readonly IEmailSender _emailSender;
    private readonly IConfiguration _configuration;

    public RegisterCommandHandler(
        IApplicationDbContext context,
        IPasswordHasher passwordHasher,
        ITokenService tokenService,
        IEmailSender emailSender,
        IConfiguration configuration)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
        _emailSender = emailSender;
        _configuration = configuration;
    }

    public async Task<AuthResponseDto> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        var user = new User
        {
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            Email = normalizedEmail,
            PasswordHash = _passwordHasher.Hash(request.Password),
            Role = request.Role,
        };

        var accessToken = _tokenService.GenerateAccessToken(user);
        var refreshToken = _tokenService.GenerateRefreshToken();
        user.RefreshTokenHash = _tokenService.HashRefreshToken(refreshToken);
        user.RefreshTokenExpiresAtUtc = DateTime.UtcNow.AddDays(_tokenService.RefreshTokenExpiryDays);

        // Account is usable immediately (soft gate, not a hard block) — verification just
        // clears the "unverified" banner client-side. See EmailVerificationTokenHash doc.
        var verificationToken = _tokenService.GenerateSecureToken();
        user.EmailVerificationTokenHash = _tokenService.HashSecureToken(verificationToken);
        user.EmailVerificationTokenExpiresAtUtc = DateTime.UtcNow.AddHours(24);

        _context.Users.Add(user);
        await _context.SaveChangesAsync(cancellationToken);

        var frontendBaseUrl = _configuration["Frontend:BaseUrl"] ?? "http://localhost:3000";
        var verificationLink = $"{frontendBaseUrl}/verify-email?uid={user.Id}&token={verificationToken}";
        await _emailSender.SendEmailVerificationAsync(user.Email, user.FirstName, verificationLink, cancellationToken);

        return new AuthResponseDto
        {
            AccessToken = accessToken.Token,
            AccessTokenExpiresAtUtc = accessToken.ExpiresAtUtc,
            RefreshToken = refreshToken,
            User = new UserDto
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Role = user.Role,
                AgencyId = user.AgencyId,
                IsEmailVerified = user.IsEmailVerified,
                TwoFactorEnabled = user.TwoFactorEnabled,
            },
        };
    }
}
