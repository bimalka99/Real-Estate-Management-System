using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using RealEstate.Application.Common.Exceptions;
using RealEstate.Application.Common.Interfaces;

namespace RealEstate.Application.Features.Auth.Commands.ResendVerificationEmail;

public class ResendVerificationEmailCommand : IRequest<Unit>
{
    /// <summary>Set by the controller from the caller's JWT — never trusted from the request body.</summary>
    public Guid RequestingUserId { get; set; }
}

public class ResendVerificationEmailCommandHandler : IRequestHandler<ResendVerificationEmailCommand, Unit>
{
    private readonly IApplicationDbContext _context;
    private readonly ITokenService _tokenService;
    private readonly IEmailSender _emailSender;
    private readonly IConfiguration _configuration;

    public ResendVerificationEmailCommandHandler(
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

    public async Task<Unit> Handle(ResendVerificationEmailCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == request.RequestingUserId, cancellationToken)
            ?? throw new BadRequestException("Account not found.");

        if (user.IsEmailVerified)
        {
            throw new BadRequestException("This email address is already verified.");
        }

        var verificationToken = _tokenService.GenerateSecureToken();
        user.EmailVerificationTokenHash = _tokenService.HashSecureToken(verificationToken);
        user.EmailVerificationTokenExpiresAtUtc = DateTime.UtcNow.AddHours(24);

        await _context.SaveChangesAsync(cancellationToken);

        var frontendBaseUrl = _configuration["Frontend:BaseUrl"] ?? "http://localhost:3000";
        var verificationLink = $"{frontendBaseUrl}/verify-email?uid={user.Id}&token={verificationToken}";
        await _emailSender.SendEmailVerificationAsync(user.Email, user.FirstName, verificationLink, cancellationToken);

        return Unit.Value;
    }
}
