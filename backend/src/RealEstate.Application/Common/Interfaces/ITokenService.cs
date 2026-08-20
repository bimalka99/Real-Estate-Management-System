using RealEstate.Domain.Entities;

namespace RealEstate.Application.Common.Interfaces;

public record AccessTokenResult(string Token, DateTime ExpiresAtUtc);

public interface ITokenService
{
    AccessTokenResult GenerateAccessToken(User user);

    /// <summary>
    /// A cryptographically random opaque string (not a JWT) used to obtain a new
    /// access token later. Only its hash is persisted (see <see cref="User.RefreshTokenHash"/>).
    /// </summary>
    string GenerateRefreshToken();

    /// <summary>
    /// One-way hash of a refresh token for storage/comparison. Uses a fast hash
    /// (SHA-256) rather than bcrypt — the token is already high-entropy random
    /// data, unlike a user-chosen password, so slow hashing isn't needed here.
    /// </summary>
    string HashRefreshToken(string refreshToken);

    /// <summary>Configured lifetime (in days) for issued refresh tokens (Jwt:RefreshTokenDays).</summary>
    int RefreshTokenExpiryDays { get; }

    /// <summary>
    /// A generic cryptographically random opaque string, same shape/entropy as
    /// <see cref="GenerateRefreshToken"/> but used for single-purpose, short-lived
    /// tokens (email verification, password reset) rather than sessions.
    /// </summary>
    string GenerateSecureToken();

    /// <summary>One-way hash of a secure token for storage/comparison (see <see cref="GenerateSecureToken"/>).</summary>
    string HashSecureToken(string token);

    /// <summary>
    /// A short-lived (5 minute), single-purpose JWT proving "this caller just supplied
    /// the correct password for this user" without granting any actual API access —
    /// issued after a successful password check when the account has 2FA enabled, and
    /// redeemed at <c>POST /api/auth/2fa/verify</c> for the real access/refresh pair.
    /// </summary>
    string GenerateTwoFactorChallengeToken(Guid userId);

    /// <summary>
    /// Validates a token from <see cref="GenerateTwoFactorChallengeToken"/> and returns the
    /// user id it was issued for, or null if the token is missing, expired, malformed, or not
    /// actually a 2FA-challenge token.
    /// </summary>
    Guid? ValidateTwoFactorChallengeToken(string challengeToken);
}
