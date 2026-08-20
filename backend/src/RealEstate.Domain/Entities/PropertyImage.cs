using RealEstate.Domain.Common;

namespace RealEstate.Domain.Entities;

public class PropertyImage : BaseEntity
{
    public Guid PropertyId { get; set; }

    public Property Property { get; set; } = null!;

    public string Url { get; set; } = string.Empty;

    public bool IsCover { get; set; }

    public int SortOrder { get; set; }
}
