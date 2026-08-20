using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RealEstate.Domain.Entities;

namespace RealEstate.Infrastructure.Persistence.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users");

        builder.Property(u => u.FirstName).HasMaxLength(100).IsRequired();
        builder.Property(u => u.LastName).HasMaxLength(100).IsRequired();
        builder.Property(u => u.Email).HasMaxLength(256).IsRequired();
        builder.Property(u => u.PasswordHash).IsRequired();
        builder.Property(u => u.PhoneNumber).HasMaxLength(30);
        builder.Property(u => u.RefreshTokenHash).HasMaxLength(64); // hex-encoded SHA-256
        builder.Property(u => u.EmailVerificationTokenHash).HasMaxLength(64);
        builder.Property(u => u.PasswordResetTokenHash).HasMaxLength(64);

        builder.HasIndex(u => u.Email).IsUnique();

        builder.HasOne(u => u.Agency)
            .WithMany(a => a.Agents)
            .HasForeignKey(u => u.AgencyId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(u => u.Listings)
            .WithOne(p => p.Agent)
            .HasForeignKey(p => p.AgentId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
