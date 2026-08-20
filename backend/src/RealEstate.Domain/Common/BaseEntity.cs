namespace RealEstate.Domain.Common;

/// <summary>
/// Base class for all entities that provides a strongly-typed identifier
/// and standard audit fields.
/// </summary>
public abstract class BaseEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAtUtc { get; set; }

    public bool IsDeleted { get; set; }
}
