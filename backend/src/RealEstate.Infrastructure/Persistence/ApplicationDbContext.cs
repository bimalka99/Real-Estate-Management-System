using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;

namespace RealEstate.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();

    public DbSet<Agency> Agencies => Set<Agency>();

    public DbSet<Property> Properties => Set<Property>();

    public DbSet<PropertyImage> PropertyImages => Set<PropertyImage>();

    public DbSet<Favorite> Favorites => Set<Favorite>();

    public DbSet<Inquiry> Inquiries => Set<Inquiry>();

    public DbSet<PropertyPriceHistory> PropertyPriceHistories => Set<PropertyPriceHistory>();

    public DbSet<Review> Reviews => Set<Review>();

    public DbSet<UserRecoveryCode> UserRecoveryCodes => Set<UserRecoveryCode>();

    public DbSet<ContactMessage> ContactMessages => Set<ContactMessage>();

    public DbSet<AgencyJoinRequest> AgencyJoinRequests => Set<AgencyJoinRequest>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

        // Soft-delete query filters on the main aggregate roots.
        modelBuilder.Entity<User>().HasQueryFilter(u => !u.IsDeleted);
        modelBuilder.Entity<Property>().HasQueryFilter(p => !p.IsDeleted);
        modelBuilder.Entity<Agency>().HasQueryFilter(a => !a.IsDeleted);

        // Mirror the Property filter on its required children so a soft-deleted
        // property doesn't leave orphaned-looking rows visible when these are
        // queried directly (EF Core warns if this isn't kept in sync).
        modelBuilder.Entity<PropertyImage>().HasQueryFilter(i => !i.Property.IsDeleted);
        modelBuilder.Entity<Favorite>().HasQueryFilter(f => !f.Property.IsDeleted);
        modelBuilder.Entity<Inquiry>().HasQueryFilter(i => !i.Property.IsDeleted);
        modelBuilder.Entity<PropertyPriceHistory>().HasQueryFilter(h => !h.Property.IsDeleted);

        // Same reasoning — mirror the User filter on Review, which requires both a
        // (soft-deletable) Agent and Reviewer.
        modelBuilder.Entity<Review>().HasQueryFilter(r => !r.Agent.IsDeleted && !r.Reviewer.IsDeleted);

        // ...and on UserRecoveryCode, which requires a (soft-deletable) User.
        modelBuilder.Entity<UserRecoveryCode>().HasQueryFilter(c => !c.User.IsDeleted);

        // ...and on AgencyJoinRequest, which requires both a (soft-deletable) Agency and User.
        modelBuilder.Entity<AgencyJoinRequest>().HasQueryFilter(r => !r.Agency.IsDeleted && !r.User.IsDeleted);
    }

    public override int SaveChanges()
    {
        ApplyAuditTimestamps();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        ApplyAuditTimestamps();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void ApplyAuditTimestamps()
    {
        foreach (var entry in ChangeTracker.Entries<Domain.Common.BaseEntity>())
        {
            if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAtUtc = DateTime.UtcNow;
            }
        }
    }
}
