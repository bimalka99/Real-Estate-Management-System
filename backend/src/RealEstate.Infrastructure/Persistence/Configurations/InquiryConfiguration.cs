using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RealEstate.Domain.Entities;

namespace RealEstate.Infrastructure.Persistence.Configurations;

public class InquiryConfiguration : IEntityTypeConfiguration<Inquiry>
{
    public void Configure(EntityTypeBuilder<Inquiry> builder)
    {
        builder.ToTable("Inquiries");

        builder.Property(i => i.Name).HasMaxLength(150).IsRequired();
        builder.Property(i => i.Email).HasMaxLength(256).IsRequired();
        builder.Property(i => i.Phone).HasMaxLength(30);
        builder.Property(i => i.Message).IsRequired();

        builder.HasOne(i => i.Sender)
            .WithMany(u => u.SentInquiries)
            .HasForeignKey(i => i.SenderId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
