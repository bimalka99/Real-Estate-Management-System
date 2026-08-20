using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RealEstate.Domain.Entities;

namespace RealEstate.Infrastructure.Persistence.Configurations;

public class ReviewConfiguration : IEntityTypeConfiguration<Review>
{
    public void Configure(EntityTypeBuilder<Review> builder)
    {
        builder.ToTable("Reviews", t => t.HasCheckConstraint("CK_Reviews_Rating", "\"Rating\" >= 1 AND \"Rating\" <= 5"));

        builder.Property(r => r.Comment).IsRequired().HasMaxLength(2000);

        // One review per reviewer per agent.
        builder.HasIndex(r => new { r.ReviewerId, r.AgentId }).IsUnique();

        builder.HasOne(r => r.Agent)
            .WithMany(u => u.ReceivedReviews)
            .HasForeignKey(r => r.AgentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.Reviewer)
            .WithMany(u => u.WrittenReviews)
            .HasForeignKey(r => r.ReviewerId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
