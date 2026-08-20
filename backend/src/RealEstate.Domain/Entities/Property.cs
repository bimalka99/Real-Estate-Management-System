using RealEstate.Domain.Common;
using RealEstate.Domain.Enums;

namespace RealEstate.Domain.Entities;

public class Property : BaseEntity
{
    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public PropertyType Type { get; set; }

    public ListingType ListingType { get; set; }

    public PropertyStatus Status { get; set; } = PropertyStatus.ForSale;

    public decimal Price { get; set; }

    public string Currency { get; set; } = "USD";

    // Location
    public string AddressLine { get; set; } = string.Empty;

    public string City { get; set; } = string.Empty;

    public string? State { get; set; }

    public string Country { get; set; } = string.Empty;

    public string? PostalCode { get; set; }

    public double? Latitude { get; set; }

    public double? Longitude { get; set; }

    // Specs
    public int Bedrooms { get; set; }

    public int Bathrooms { get; set; }

    public double AreaSqft { get; set; }

    public double? LotSizeSqft { get; set; }

    public int? YearBuilt { get; set; }

    public int? ParkingSpaces { get; set; }

    public List<string> Amenities { get; set; } = new();

    public bool IsFeatured { get; set; }

    public int ViewCount { get; set; }

    public string? VirtualTourUrl { get; set; }

    // Ownership
    public Guid AgentId { get; set; }

    public User Agent { get; set; } = null!;

    public Guid? AgencyId { get; set; }

    public Agency? Agency { get; set; }

    // Relations
    public ICollection<PropertyImage> Images { get; set; } = new List<PropertyImage>();

    public ICollection<Favorite> FavoritedBy { get; set; } = new List<Favorite>();

    public ICollection<Inquiry> Inquiries { get; set; } = new List<Inquiry>();

    public ICollection<PropertyPriceHistory> PriceHistory { get; set; } = new List<PropertyPriceHistory>();
}
