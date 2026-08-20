namespace RealEstate.Application.Common.Interfaces;

public record TwoFactorSetup(string ManualEntryKey, string OtpAuthUri, string QrCodeImageBase64);

/// <summary>
/// TOTP (RFC 6238, Google Authenticator-compatible) two-factor authentication.
/// No SMS/email provider is required — the shared secret lives entirely between our
/// server and the user's authenticator app.
/// </summary>
public interface ITotpService
{
    /// <summary>Generates a new random Base32 TOTP secret (not yet persisted or encrypted).</summary>
    string GenerateSecret();

    /// <summary>
    /// Builds the <c>otpauth://</c> URI and a scannable QR code (PNG, base64) for the given
    /// plaintext secret, so an authenticator app can be enrolled during setup.
    /// </summary>
    TwoFactorSetup BuildSetup(string secretBase32, string accountEmail);

    /// <summary>Checks a 6-digit code against the secret, allowing one 30s step of clock drift either way.</summary>
    bool ValidateCode(string secretBase32, string code);

    /// <summary>Encrypts a plaintext secret for storage (ASP.NET Core Data Protection).</summary>
    string EncryptSecret(string plainSecret);

    /// <summary>Reverses <see cref="EncryptSecret"/>.</summary>
    string DecryptSecret(string encryptedSecret);
}
