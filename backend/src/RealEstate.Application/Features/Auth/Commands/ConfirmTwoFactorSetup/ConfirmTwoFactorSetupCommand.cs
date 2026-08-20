using System.Security.Cryptography;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Exceptions;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Application.Features.Auth.Dtos;
using RealEstate.Domain.Entities;

namespace RealEstate.Application.Features.Auth.Commands.ConfirmTwoFactorSetup;

public class ConfirmTwoFactorSetupCommand : IRequest<TwoFactorRecoveryCodesDto>
{
    /// <summary>Set by the controller from the caller's JWT — never trusted from the request body.</summary>
    public Guid RequestingUserId { get; set; }

    public string Code { get; set; } = string.Empty;
}

public class ConfirmTwoFactorSetupCommandHandler : IRequestHandler<ConfirmTwoFactorSetupCommand, TwoFactorRecoveryCodesDto>
{
    // Excludes 0/O and 1/I/L — characters easy to misread when a user is copying a
    // recovery code down by hand.
    private const string RecoveryCodeAlphabet = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
    private const int RecoveryCodeCount = 8;

    private readonly IApplicationDbContext _context;
    private readonly ITotpService _totpService;
    private readonly ITokenService _tokenService;

    public ConfirmTwoFactorSetupCommandHandler(
        IApplicationDbContext context,
        ITotpService totpService,
        ITokenService tokenService)
    {
        _context = context;
        _totpService = totpService;
        _tokenService = tokenService;
    }

    public async Task<TwoFactorRecoveryCodesDto> Handle(ConfirmTwoFactorSetupCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .Include(u => u.RecoveryCodes)
            .FirstOrDefaultAsync(u => u.Id == request.RequestingUserId, cancellationToken)
            ?? throw new BadRequestException("Account not found.");

        if (user.TwoFactorEnabled)
        {
            throw new BadRequestException("Two-factor authentication is already enabled.");
        }

        if (user.TwoFactorSecretEncrypted is null)
        {
            throw new BadRequestException("Start two-factor setup first (POST /api/auth/2fa/setup).");
        }

        var secret = _totpService.DecryptSecret(user.TwoFactorSecretEncrypted);
        if (!_totpService.ValidateCode(secret, request.Code))
        {
            throw new BadRequestException("Invalid code. Check your authenticator app and try again.");
        }

        user.TwoFactorEnabled = true;

        // Regenerating: clear out any leftover codes from a previous enable/disable cycle.
        foreach (var existing in user.RecoveryCodes)
        {
            _context.UserRecoveryCodes.Remove(existing);
        }

        var plainCodes = new List<string>(RecoveryCodeCount);
        for (var i = 0; i < RecoveryCodeCount; i++)
        {
            var plainCode = GenerateRecoveryCode();
            plainCodes.Add(plainCode);

            _context.UserRecoveryCodes.Add(new UserRecoveryCode
            {
                UserId = user.Id,
                CodeHash = _tokenService.HashSecureToken(plainCode),
            });
        }

        await _context.SaveChangesAsync(cancellationToken);

        return new TwoFactorRecoveryCodesDto { RecoveryCodes = plainCodes };
    }

    private static string GenerateRecoveryCode()
    {
        Span<char> chars = stackalloc char[8];
        for (var i = 0; i < chars.Length; i++)
        {
            chars[i] = RecoveryCodeAlphabet[RandomNumberGenerator.GetInt32(RecoveryCodeAlphabet.Length)];
        }

        return $"{new string(chars[..4])}-{new string(chars[4..])}";
    }
}
