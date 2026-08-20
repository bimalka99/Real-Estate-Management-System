namespace RealEstate.Application.Common.Interfaces;

/// <summary>
/// Sends transactional account emails. The Infrastructure implementation is chosen at
/// startup based on whether real SMTP credentials are configured (see DependencyInjection.
/// AddInfrastructure) — no real mail server is required for local development.
/// </summary>
public interface IEmailSender
{
    Task SendEmailVerificationAsync(string toEmail, string firstName, string verificationLink, CancellationToken cancellationToken);

    Task SendPasswordResetAsync(string toEmail, string firstName, string resetLink, CancellationToken cancellationToken);
}
