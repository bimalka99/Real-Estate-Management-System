using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using RealEstate.Application.Common.Interfaces;

namespace RealEstate.Application.Features.Auth.Commands.ForgotPassword;

public class ForgotPasswordCommand : IRequest<Unit>
{
    public string Email { get; set; } = string.Empty;
}

public class ForgotPasswordCommandHandler : IRequestHandler<ForgotPasswordCommand, Unit>
{
    private readonly IApplicationDbContext _context;
    private readonly ITokenService _tokenService;
    private readonly IEmailSender _emailSender;
    private readonly IConfiguration _configuration;

    public ForgotPasswordCommandHandler(
        IApplicationDbContext context,
        ITokenService tokenService,
        IEmailSender emailSender,
        IConfiguration configuration)
    {
        _context = context;
        _tokenService = tokenService;
        _emailSender = emailSender;
        _configuration = configuration;
    }

    public async Task<Unit> Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail, cancellationToken);

        // Deliberately a no-op (not an error) for an unknown email — same anti-enumeration
        // reasoning as LoginCommandHandler's shared "invalid email or password" message.
        // The controller always returns the same generic "check your email" response.
        if (user is null)
        {
            return Unit.Value;
        }

        var resetToken = _tokenService.GenerateSecureToken();
        user.PasswordResetTokenHash = _tokenService.HashSecureToken(resetToken);
        user.PasswordResetTokenExpiresAtUtc = DateTime.UtcNow.AddHours(1);

        await _context.SaveChangesAsync(cancellationToken);

        var frontendBaseUrl = _configuration["Frontend:BaseUrl"] ?? "http://localhost:3000";
        var resetLink = $"{frontendBaseUrl}/reset-password?uid={user.Id}&token={resetToken}";
        await _emailSender.SendPasswordResetAsync(user.Email, user.FirstName, resetLink, cancellationToken);

        return Unit.Value;
    }
}
