using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RealEstate.Domain.Entities;

namespace RealEstate.Infrastructure.Persistence.Configurations;

public class AgencyConfiguration : IEntityTypeConfiguration<Agency>
{
    public void Configure(EntityTypeBuilder<Agency> builder)
    {
        builder.ToTable("Agencies");

        builder.Property(a => a.Name).HasMaxLength(200).IsRequired();
        builder.Property(a => a.Email).HasMaxLength(256);
        builder.Property(a => a.Website).HasMaxLength(300);

        builder.HasMany(a => a.Listings)
            .WithOne(p => p.Agency)
            .HasForeignKey(p => p.AgencyId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
