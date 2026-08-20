using Microsoft.AspNetCore.DataProtection;
using OtpNet;
using QRCoder;
using RealEstate.Application.Common.Interfaces;

namespace RealEstate.Infrastructure.Services;

public class TotpService : ITotpService
{
    private const string Issuer = "Aurelia Estates";
    private readonly IDataProtector _protector;

    public TotpService(IDataProtectionProvider dataProtectionProvider)
    {
        // A purpose string scopes the protector so keys used elsewhere in the app
        // (there are none yet, but this is the standard Data Protection convention)
        // can never accidentally decrypt a 2FA secret or vice versa.
        _protector = dataProtectionProvider.CreateProtector("RealEstate.TwoFactorSecret.v1");
    }

    public string GenerateSecret()
    {
        var key = KeyGeneration.GenerateRandomKey(20); // 160 bits, the RFC 4226/6238 recommendation
        return Base32Encoding.ToString(key);
    }

    public TwoFactorSetup BuildSetup(string secretBase32, string accountEmail)
    {
        var otpAuthUri =
            $"otpauth://totp/{Uri.EscapeDataString(Issuer)}:{Uri.EscapeDataString(accountEmail)}" +
            $"?secret={secretBase32}&issuer={Uri.EscapeDataString(Issuer)}&algorithm=SHA1&digits=6&period=30";

        var qrGenerator = new QRCodeGenerator();
        var qrData = qrGenerator.CreateQrCode(otpAuthUri, QRCodeGenerator.ECCLevel.Q);
        // PngByteQRCode (not the System.Drawing-backed QRCode class) so this works
        // cross-platform, including in a Linux container at deploy time.
        var pngQrCode = new PngByteQRCode(qrData);
        var pngBytes = pngQrCode.GetGraphic(20);

        return new TwoFactorSetup(
            ManualEntryKey: secretBase32,
            OtpAuthUri: otpAuthUri,
            QrCodeImageBase64: Convert.ToBase64String(pngBytes));
    }

    public bool ValidateCode(string secretBase32, string code)
    {
        if (string.IsNullOrWhiteSpace(code))
        {
            return false;
        }

        var totp = new Totp(Base32Encoding.ToBytes(secretBase32));
        // One 30s step of tolerance each way, to absorb clock drift between the
        // server and the user's phone without meaningfully widening the guess window.
        return totp.VerifyTotp(code, out _, new VerificationWindow(previous: 1, future: 1));
    }

    public string EncryptSecret(string plainSecret) => _protector.Protect(plainSecret);

    public string DecryptSecret(string encryptedSecret) => _protector.Unprotect(encryptedSecret);
}
