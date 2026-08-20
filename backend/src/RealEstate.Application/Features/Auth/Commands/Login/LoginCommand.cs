using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Application.Features.Auth.Dtos;

namespace RealEstate.Application.Features.Auth.Commands.Login;

public class LoginCommand : IRequest<LoginResultDto>
{
    public string Email { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;
}

public class LoginCommandHandler : IRequestHandler<LoginCommand, LoginResultDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenService _tokenService;

    public LoginCommandHandler(
        IApplicationDbContext context,
        IPasswordHasher passwordHasher,
        ITokenService tokenService)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
    }

    public async Task<LoginResultDto> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail, cancellationToken);

        // Deliberately the same error for "no such user" and "wrong password" —
        // distinguishing them lets an attacker enumerate registered emails.
        if (user is null || !_passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        // Password is correct, but that alone isn't enough for a 2FA account — hand back
        // a short-lived challenge token instead of real access. The frontend then prompts
        // for a TOTP/recovery code and redeems it at POST /api/auth/2fa/verify.
        if (user.TwoFactorEnabled)
        {
            return new LoginResultDto
            {
                RequiresTwoFactor = true,
                TwoFactorChallengeToken = _tokenService.GenerateTwoFactorChallengeToken(user.Id),
            };
        }

        var accessToken = _tokenService.GenerateAccessToken(user);
        var refreshToken = _tokenService.GenerateRefreshToken();
        user.RefreshTokenHash = _tokenService.HashRefreshToken(refreshToken);
        user.RefreshTokenExpiresAtUtc = DateTime.UtcNow.AddDays(_tokenService.RefreshTokenExpiryDays);

        await _context.SaveChangesAsync(cancellationToken);

        return new LoginResultDto
        {
            RequiresTwoFactor = false,
            Auth = new AuthResponseDto
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
            },
        };
    }
}
