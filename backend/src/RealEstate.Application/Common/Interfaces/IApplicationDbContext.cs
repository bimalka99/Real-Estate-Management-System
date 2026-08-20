using Microsoft.EntityFrameworkCore;
using RealEstate.Domain.Entities;

namespace RealEstate.Application.Common.Interfaces;

/// <summary>
/// Abstraction over the persistence layer so the Application layer can depend
/// on this interface rather than the concrete EF Core DbContext in Infrastructure.
/// </summary>
public interface IApplicationDbContext
{
    DbSet<User> Users { get; }

    DbSet<Agency> Agencies { get; }

    DbSet<Property> Properties { get; }

    DbSet<PropertyImage> PropertyImages { get; }

    DbSet<Favorite> Favorites { get; }

    DbSet<Inquiry> Inquiries { get; }

    DbSet<PropertyPriceHistory> PropertyPriceHistories { get; }

    DbSet<Review> Reviews { get; }

    DbSet<UserRecoveryCode> UserRecoveryCodes { get; }

    DbSet<ContactMessage> ContactMessages { get; }

    DbSet<AgencyJoinRequest> AgencyJoinRequests { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
