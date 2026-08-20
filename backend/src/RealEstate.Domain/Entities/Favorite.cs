using RealEstate.Domain.Common;

namespace RealEstate.Domain.Entities;

/// <summary>
/// Join entity representing a user's saved/favorited property.
/// </summary>
public class Favorite : BaseEntity
{
    public Guid UserId { get; set; }

    public User User { get; set; } = null!;

    public Guid PropertyId { get; set; }

    public Property Property { get; set; } = null!;
}
