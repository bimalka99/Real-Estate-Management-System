using RealEstate.Domain.Common;

namespace RealEstate.Domain.Entities;

public class Agency : BaseEntity
{
    public string Name { get; set; } = string.Empty;

    public string? LogoUrl { get; set; }

    public string? Description { get; set; }

    public string? Website { get; set; }

    public string? PhoneNumber { get; set; }

    public string? Email { get; set; }

    public ICollection<User> Agents { get; set; } = new List<User>();

    public ICollection<Property> Listings { get; set; } = new List<Property>();
}
