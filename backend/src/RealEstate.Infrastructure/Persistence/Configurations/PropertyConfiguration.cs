using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RealEstate.Domain.Entities;

namespace RealEstate.Infrastructure.Persistence.Configurations;

public class PropertyConfiguration : IEntityTypeConfiguration<Property>
{
    public void Configure(EntityTypeBuilder<Property> builder)
    {
        builder.ToTable("Properties");

        builder.Property(p => p.Title).HasMaxLength(200).IsRequired();
        builder.Property(p => p.Description).IsRequired();
        builder.Property(p => p.Currency).HasMaxLength(3).IsRequired();
        builder.Property(p => p.Price).HasPrecision(18, 2);

        builder.Property(p => p.AddressLine).HasMaxLength(300).IsRequired();
        builder.Property(p => p.City).HasMaxLength(100).IsRequired();
        builder.Property(p => p.State).HasMaxLength(100);
        builder.Property(p => p.Country).HasMaxLength(100).IsRequired();
        builder.Property(p => p.PostalCode).HasMaxLength(20);

        // Stored as a native Postgres text[] column via the Npgsql provider.
        builder.Property(p => p.Amenities).HasColumnType("text[]");

        builder.HasIndex(p => p.City);
        builder.HasIndex(p => p.Status);
        builder.HasIndex(p => p.Type);
        builder.HasIndex(p => p.Price);

        builder.HasMany(p => p.Images)
            .WithOne(i => i.Property)
            .HasForeignKey(i => i.PropertyId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(p => p.Inquiries)
            .WithOne(i => i.Property)
            .HasForeignKey(i => i.PropertyId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(p => p.PriceHistory)
            .WithOne(h => h.Property)
            .HasForeignKey(h => h.PropertyId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
