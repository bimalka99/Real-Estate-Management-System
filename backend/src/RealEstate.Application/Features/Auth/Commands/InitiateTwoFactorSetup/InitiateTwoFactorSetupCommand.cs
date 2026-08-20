using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Exceptions;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Application.Features.Auth.Dtos;

namespace RealEstate.Application.Features.Auth.Commands.InitiateTwoFactorSetup;

public class InitiateTwoFactorSetupCommand : IRequest<TwoFactorSetupDto>
{
    /// <summary>Set by the controller from the caller's JWT — never trusted from the request body.</summary>
    public Guid RequestingUserId { get; set; }
}

public class InitiateTwoFactorSetupCommandHandler : IRequestHandler<InitiateTwoFactorSetupCommand, TwoFactorSetupDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ITotpService _totpService;

    public InitiateTwoFactorSetupCommandHandler(IApplicationDbContext context, ITotpService totpService)
    {
        _context = context;
        _totpService = totpService;
    }

    public async Task<TwoFactorSetupDto> Handle(InitiateTwoFactorSetupCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == request.RequestingUserId, cancellationToken)
            ?? throw new BadRequestException("Account not found.");

        if (user.TwoFactorEnabled)
        {
            throw new BadRequestException("Two-factor authentication is already enabled. Disable it before setting up a new device.");
        }

        // Overwrites any previous, never-confirmed pending secret — only the most recent
        // /2fa/setup call's secret can be confirmed via /2fa/enable.
        var secret = _totpService.GenerateSecret();
        user.TwoFactorSecretEncrypted = _totpService.EncryptSecret(secret);
        await _context.SaveChangesAsync(cancellationToken);

        var setup = _totpService.BuildSetup(secret, user.Email);

        return new TwoFactorSetupDto
        {
            ManualEntryKey = setup.ManualEntryKey,
            OtpAuthUri = setup.OtpAuthUri,
            QrCodeImageBase64 = setup.QrCodeImageBase64,
        };
    }
}
