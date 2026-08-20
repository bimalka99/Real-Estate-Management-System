using RealEstate.Domain.Common;

namespace RealEstate.Domain.Entities;

/// <summary>
/// A single one-time 2FA recovery code, issued in a batch of 8 when a user confirms
/// TOTP setup. Stored hashed (same reasoning as <see cref="User.RefreshTokenHash"/>) —
/// the plaintext codes are shown to the user exactly once, at generation time.
/// </summary>
public class UserRecoveryCode : BaseEntity
{
    public Guid UserId { get; set; }

    public User User { get; set; } = null!;

    public string CodeHash { get; set; } = string.Empty;

    public DateTime? UsedAtUtc { get; set; }
}
