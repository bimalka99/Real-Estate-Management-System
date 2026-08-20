using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Application.Features.Auth.Dtos;

namespace RealEstate.Application.Features.Auth.Commands.VerifyTwoFactor;

public class VerifyTwoFactorCommand : IRequest<AuthResponseDto>
{
    public string ChallengeToken { get; set; } = string.Empty;

    /// <summary>Either a 6-digit TOTP code or an <c>XXXX-XXXX</c> recovery code.</summary>
    public string Code { get; set; } = string.Empty;
}

public class VerifyTwoFactorCommandHandler : IRequestHandler<VerifyTwoFactorCommand, AuthResponseDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ITokenService _tokenService;
    private readonly ITotpService _totpService;

    public VerifyTwoFactorCommandHandler(
        IApplicationDbContext context,
        ITokenService tokenService,
        ITotpService totpService)
    {
        _context = context;
        _tokenService = tokenService;
        _totpService = totpService;
    }

    public async Task<AuthResponseDto> Handle(VerifyTwoFactorCommand request, CancellationToken cancellationToken)
    {
        var userId = _tokenService.ValidateTwoFactorChallengeToken(request.ChallengeToken);
        if (userId is null)
        {
            throw new UnauthorizedAccessException("This sign-in attempt has expired. Please log in again.");
        }

        var user = await _context.Users
            .Include(u => u.RecoveryCodes)
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

        if (user is null || !user.TwoFactorEnabled || user.TwoFactorSecretEncrypted is null)
        {
            throw new UnauthorizedAccessException("This sign-in attempt has expired. Please log in again.");
        }

        var secret = _totpService.DecryptSecret(user.TwoFactorSecretEncrypted);
        var isValidTotp = _totpService.ValidateCode(secret, request.Code);

        var usedRecoveryCode = isValidTotp
            ? null
            : user.RecoveryCodes.FirstOrDefault(c =>
                c.UsedAtUtc is null && c.CodeHash == _tokenService.HashSecureToken(request.Code.Trim().ToUpperInvariant()));

        if (!isValidTotp && usedRecoveryCode is null)
        {
            throw new UnauthorizedAccessException("Invalid code.");
        }

        if (usedRecoveryCode is not null)
        {
            usedRecoveryCode.UsedAtUtc = DateTime.UtcNow;
        }

        var accessToken = _tokenService.GenerateAccessToken(user);
        var refreshToken = _tokenService.GenerateRefreshToken();
        user.RefreshTokenHash = _tokenService.HashRefreshToken(refreshToken);
        user.RefreshTokenExpiresAtUtc = DateTime.UtcNow.AddDays(_tokenService.RefreshTokenExpiryDays);

        await _context.SaveChangesAsync(cancellationToken);

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
