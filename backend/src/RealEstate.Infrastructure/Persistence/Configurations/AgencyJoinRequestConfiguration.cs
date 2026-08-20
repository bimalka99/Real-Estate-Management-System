using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RealEstate.Domain.Entities;

namespace RealEstate.Infrastructure.Persistence.Configurations;

public class AgencyJoinRequestConfiguration : IEntityTypeConfiguration<AgencyJoinRequest>
{
    public void Configure(EntityTypeBuilder<AgencyJoinRequest> builder)
    {
        builder.ToTable("AgencyJoinRequests");

        builder.HasOne(r => r.Agency)
            .WithMany()
            .HasForeignKey(r => r.AgencyId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(r => r.User)
            .WithMany()
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Only one PENDING request per user+agency at a time — a partial/filtered index
        // rather than a blanket unique constraint, since past Approved/Rejected rows are
        // kept as history and a user may reasonably request the same agency again later.
        // Status is stored as its underlying int (Pending = 0) — no HasConversion applied.
        builder.HasIndex(r => new { r.AgencyId, r.UserId })
            .IsUnique()
            .HasFilter("\"Status\" = 0");
    }
}
