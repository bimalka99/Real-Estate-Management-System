using RealEstate.Domain.Common;
using RealEstate.Domain.Enums;

namespace RealEstate.Domain.Entities;

public class User : BaseEntity
{
    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public string? PhoneNumber { get; set; }

    public string? AvatarUrl { get; set; }

    public string? Bio { get; set; }

    public UserRole Role { get; set; } = UserRole.Client;

    public bool IsEmailVerified { get; set; }

    /// <summary>Hash of the current pending email-verification token, if one has been sent.</summary>
    public string? EmailVerificationTokenHash { get; set; }

    public DateTime? EmailVerificationTokenExpiresAtUtc { get; set; }

    /// <summary>Hash of the current pending password-reset token, if one has been requested.</summary>
    public string? PasswordResetTokenHash { get; set; }

    public DateTime? PasswordResetTokenExpiresAtUtc { get; set; }

    /// <summary>
    /// Whether TOTP-based two-factor authentication is active. While a setup is in
    /// progress but not yet confirmed, this stays false even though <see cref="TwoFactorSecretEncrypted"/>
    /// may already hold the pending secret.
    /// </summary>
    public bool TwoFactorEnabled { get; set; }

    /// <summary>
    /// The TOTP shared secret, encrypted at rest via ASP.NET Core Data Protection
    /// (never stored or logged in plaintext). Null until a setup has been initiated.
    /// </summary>
    public string? TwoFactorSecretEncrypted { get; set; }

    public ICollection<UserRecoveryCode> RecoveryCodes { get; set; } = new List<UserRecoveryCode>();

    /// <summary>
    /// Hash of the current refresh token, if one has been issued. Stored hashed
    /// (never the raw token) so a database read alone can't be used to log in.
    /// A single active refresh token per user — issuing a new one invalidates the last.
    /// </summary>
    public string? RefreshTokenHash { get; set; }

    public DateTime? RefreshTokenExpiresAtUtc { get; set; }

    /// <summary>
    /// Set when the user is an Agent belonging to an Agency. Null for clients/admins.
    /// </summary>
    public Guid? AgencyId { get; set; }

    public Agency? Agency { get; set; }

    public ICollection<Property> Listings { get; set; } = new List<Property>();

    public ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();

    public ICollection<Inquiry> SentInquiries { get; set; } = new List<Inquiry>();

    /// <summary>Reviews written about this user as an agent.</summary>
    public ICollection<Review> ReceivedReviews { get; set; } = new List<Review>();

    /// <summary>Reviews this user has written about agents.</summary>
    public ICollection<Review> WrittenReviews { get; set; } = new List<Review>();

    public string FullName => $"{FirstName} {LastName}".Trim();
}
