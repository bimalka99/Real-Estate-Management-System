using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Infrastructure.Persistence;
using RealEstate.Infrastructure.Services;

namespace RealEstate.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration,
        string contentRootPath)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException(
                "Connection string 'DefaultConnection' was not found. Set it via appsettings, " +
                "user-secrets, or the ConnectionStrings__DefaultConnection environment variable.");

        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(connectionString, npgsqlOptions =>
                npgsqlOptions.EnableRetryOnFailure(maxRetryCount: 3)));

        services.AddScoped<IApplicationDbContext>(provider =>
            provider.GetRequiredService<ApplicationDbContext>());

        services.AddSingleton<IPasswordHasher, PasswordHasher>();
        services.AddSingleton<ITokenService, TokenService>();

        var webRootPath = Path.Combine(contentRootPath, "wwwroot");
        services.AddSingleton<IFileStorageService>(new LocalFileStorageService(webRootPath));

        // Data Protection persists its keyring to disk under wwwroot/.dataprotection-keys —
        // fine for a single local dev instance; a real deployment with multiple instances or
        // redeploys needs a shared/durable key store (e.g. blob storage) or existing encrypted
        // 2FA secrets become unreadable after a restart. Flagged here, not solved — same class
        // of dev-vs-prod tradeoff as local Postgres and local disk image storage.
        services.AddDataProtection()
            .PersistKeysToFileSystem(new DirectoryInfo(Path.Combine(webRootPath, ".dataprotection-keys")));
        services.AddSingleton<ITotpService, TotpService>();

        // No real mail server required for local dev — DevEmailSender logs the link and
        // writes the email to disk instead. Set Email:Smtp:Host (appsettings/user-secrets)
        // to switch to real delivery via SmtpEmailSender.
        var smtpHost = configuration["Email:Smtp:Host"];
        if (string.IsNullOrWhiteSpace(smtpHost))
        {
            services.AddSingleton<IEmailSender>(provider =>
                new DevEmailSender(webRootPath, provider.GetRequiredService<ILogger<DevEmailSender>>()));
        }
        else
        {
            services.AddSingleton<IEmailSender, SmtpEmailSender>();
        }

        return services;
    }
}
