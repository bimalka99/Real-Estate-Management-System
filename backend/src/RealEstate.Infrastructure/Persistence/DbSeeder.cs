using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;
using RealEstate.Domain.Enums;

namespace RealEstate.Infrastructure.Persistence;

/// <summary>
/// Bootstraps the very first SuperAdmin account — there's no other way to get one,
/// since self-registration only allows Client/Agent roles (see RegisterCommandValidator).
/// Runs once at startup; a no-op once any SuperAdmin already exists.
/// </summary>
public static class DbSeeder
{
    public static async Task SeedSuperAdminAsync(
        IApplicationDbContext context,
        IPasswordHasher passwordHasher,
        IConfiguration configuration,
        ILogger logger)
    {
        var alreadyHasSuperAdmin = await context.Users.AnyAsync(u => u.Role == UserRole.SuperAdmin);
        if (alreadyHasSuperAdmin)
        {
            return;
        }

        var email = configuration["Admin:Email"];
        var password = configuration["Admin:Password"];

        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
        {
            logger.LogWarning(
                "No SuperAdmin account exists yet and Admin:Email/Admin:Password aren't configured — " +
                "skipping bootstrap. Set them (e.g. via `dotnet user-secrets set`) and restart to create one.");
            return;
        }

        var admin = new User
        {
            FirstName = "Admin",
            LastName = "User",
            Email = email.Trim().ToLowerInvariant(),
            PasswordHash = passwordHasher.Hash(password),
            Role = UserRole.SuperAdmin,
            IsEmailVerified = true,
        };

        context.Users.Add(admin);
        await context.SaveChangesAsync(CancellationToken.None);

        logger.LogWarning("Bootstrapped SuperAdmin account: {Email}", email);
    }
}
