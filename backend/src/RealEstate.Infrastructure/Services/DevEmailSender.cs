using Microsoft.Extensions.Logging;
using RealEstate.Application.Common.Interfaces;

namespace RealEstate.Infrastructure.Services;

/// <summary>
/// Default email sender when no real SMTP server is configured (see DependencyInjection.
/// AddInfrastructure) — no signup with an email provider required for local development.
/// Logs the link at Warning level (visible in the `dotnet run` console without raising log
/// verbosity, same convention as DbSeeder's admin-bootstrap message) and writes the full
/// HTML body to disk so it can be opened in a browser. Swap for SmtpEmailSender by setting
/// Email:Smtp:Host in config once a real provider (SendGrid, Mailgun, Gmail app password, etc.)
/// is available.
/// </summary>
public class DevEmailSender : IEmailSender
{
    private readonly string _webRootPath;
    private readonly ILogger<DevEmailSender> _logger;

    public DevEmailSender(string webRootPath, ILogger<DevEmailSender> logger)
    {
        _webRootPath = webRootPath;
        _logger = logger;
    }

    public Task SendEmailVerificationAsync(string toEmail, string firstName, string verificationLink, CancellationToken cancellationToken)
    {
        var body = $"""
            <h2>Welcome to Aurelia Estates, {firstName}</h2>
            <p>Confirm your email address to finish setting up your account:</p>
            <p><a href="{verificationLink}">{verificationLink}</a></p>
            <p>This link expires in 24 hours.</p>
            """;

        return WriteAsync(toEmail, "Verify your email — Aurelia Estates", body, verificationLink, cancellationToken);
    }

    public Task SendPasswordResetAsync(string toEmail, string firstName, string resetLink, CancellationToken cancellationToken)
    {
        var body = $"""
            <h2>Reset your password</h2>
            <p>Hi {firstName}, someone requested a password reset for this account. If that was you:</p>
            <p><a href="{resetLink}">{resetLink}</a></p>
            <p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
            """;

        return WriteAsync(toEmail, "Reset your password — Aurelia Estates", body, resetLink, cancellationToken);
    }

    private async Task WriteAsync(string toEmail, string subject, string htmlBody, string actionLink, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "[DEV EMAIL] To: {ToEmail} | Subject: {Subject} | Link: {Link}",
            toEmail, subject, actionLink);

        var folder = Path.Combine(_webRootPath, "dev-emails");
        Directory.CreateDirectory(folder);

        var safeEmail = string.Concat(toEmail.Split(Path.GetInvalidFileNameChars()));
        var fileName = $"{DateTime.UtcNow:yyyyMMdd-HHmmss}-{safeEmail}.html";
        await File.WriteAllTextAsync(Path.Combine(folder, fileName), htmlBody, cancellationToken);
    }
}
