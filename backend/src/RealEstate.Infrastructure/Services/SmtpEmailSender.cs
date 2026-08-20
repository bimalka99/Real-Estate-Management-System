using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using MimeKit;
using RealEstate.Application.Common.Interfaces;

namespace RealEstate.Infrastructure.Services;

/// <summary>
/// Real email delivery via SMTP (MailKit), used once Email:Smtp:Host is configured —
/// see DependencyInjection.AddInfrastructure. Works with any standard SMTP provider
/// (SendGrid, Mailgun, Amazon SES, a Gmail app password, etc.).
/// </summary>
public class SmtpEmailSender : IEmailSender
{
    private readonly IConfiguration _configuration;

    public SmtpEmailSender(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public Task SendEmailVerificationAsync(string toEmail, string firstName, string verificationLink, CancellationToken cancellationToken)
    {
        var body = $"""
            <h2>Welcome to Aurelia Estates, {firstName}</h2>
            <p>Confirm your email address to finish setting up your account:</p>
            <p><a href="{verificationLink}">Verify email</a></p>
            <p>This link expires in 24 hours.</p>
            """;

        return SendAsync(toEmail, "Verify your email — Aurelia Estates", body, cancellationToken);
    }

    public Task SendPasswordResetAsync(string toEmail, string firstName, string resetLink, CancellationToken cancellationToken)
    {
        var body = $"""
            <h2>Reset your password</h2>
            <p>Hi {firstName}, someone requested a password reset for this account. If that was you:</p>
            <p><a href="{resetLink}">Reset password</a></p>
            <p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
            """;

        return SendAsync(toEmail, "Reset your password — Aurelia Estates", body, cancellationToken);
    }

    private async Task SendAsync(string toEmail, string subject, string htmlBody, CancellationToken cancellationToken)
    {
        var fromAddress = _configuration["Email:FromAddress"] ?? "no-reply@aureliaestates.example";
        var fromName = _configuration["Email:FromName"] ?? "Aurelia Estates";

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(fromName, fromAddress));
        message.To.Add(MailboxAddress.Parse(toEmail));
        message.Subject = subject;
        message.Body = new BodyBuilder { HtmlBody = htmlBody }.ToMessageBody();

        var host = _configuration["Email:Smtp:Host"]
            ?? throw new InvalidOperationException("Email:Smtp:Host is not configured.");
        var port = int.TryParse(_configuration["Email:Smtp:Port"], out var p) ? p : 587;
        var useSsl = bool.TryParse(_configuration["Email:Smtp:UseSsl"], out var ssl) ? ssl : true;
        var username = _configuration["Email:Smtp:Username"];
        var password = _configuration["Email:Smtp:Password"];

        using var client = new SmtpClient();
        await client.ConnectAsync(host, port, useSsl ? SecureSocketOptions.StartTls : SecureSocketOptions.None, cancellationToken);

        if (!string.IsNullOrWhiteSpace(username))
        {
            await client.AuthenticateAsync(username, password ?? string.Empty, cancellationToken);
        }

        await client.SendAsync(message, cancellationToken);
        await client.DisconnectAsync(true, cancellationToken);
    }
}
