using RealEstate.Domain.Common;

namespace RealEstate.Domain.Entities;

public class PropertyPriceHistory : BaseEntity
{
    public Guid PropertyId { get; set; }

    public Property Property { get; set; } = null!;

    public decimal Price { get; set; }

    public DateTime EffectiveAtUtc { get; set; } = DateTime.UtcNow;
}
