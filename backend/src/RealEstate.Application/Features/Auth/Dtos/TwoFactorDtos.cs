namespace RealEstate.Application.Features.Auth.Dtos;

/// <summary>Returned by <c>POST /api/auth/2fa/setup</c> — enroll an authenticator app, then confirm with a code.</summary>
public class TwoFactorSetupDto
{
    /// <summary>Plain Base32 secret, for accounts that can't scan a QR code.</summary>
    public string ManualEntryKey { get; set; } = string.Empty;

    public string OtpAuthUri { get; set; } = string.Empty;

    /// <summary>Base64-encoded PNG — render as <c>data:image/png;base64,{this}</c>.</summary>
    public string QrCodeImageBase64 { get; set; } = string.Empty;
}

/// <summary>
/// Returned once by <c>POST /api/auth/2fa/enable</c> — these plaintext codes are never
/// retrievable again after this response (only their hashes are persisted).
/// </summary>
public class TwoFactorRecoveryCodesDto
{
    public List<string> RecoveryCodes { get; set; } = new();
}
