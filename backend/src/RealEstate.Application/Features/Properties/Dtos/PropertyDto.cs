using RealEstate.Domain.Enums;

namespace RealEstate.Application.Features.Properties.Dtos;

public class PropertyDto
{
    public Guid Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public PropertyType Type { get; set; }

    public ListingType ListingType { get; set; }

    public PropertyStatus Status { get; set; }

    public decimal Price { get; set; }

    public string Currency { get; set; } = string.Empty;

    public string AddressLine { get; set; } = string.Empty;

    public string City { get; set; } = string.Empty;

    public string? State { get; set; }

    public string Country { get; set; } = string.Empty;

    public string? PostalCode { get; set; }

    public double? Latitude { get; set; }

    public double? Longitude { get; set; }

    public int Bedrooms { get; set; }

    public int Bathrooms { get; set; }

    public double AreaSqft { get; set; }

    public int? YearBuilt { get; set; }

    public List<string> Amenities { get; set; } = new();

    public bool IsFeatured { get; set; }

    public string? VirtualTourUrl { get; set; }

    public Guid AgentId { get; set; }

    public string AgentName { get; set; } = string.Empty;

    public Guid? AgencyId { get; set; }

    public string? AgencyName { get; set; }

    public List<PropertyImageDto> Images { get; set; } = new();

    public DateTime CreatedAtUtc { get; set; }
}

public class PropertyImageDto
{
    public Guid Id { get; set; }

    public string Url { get; set; } = string.Empty;

    public bool IsCover { get; set; }

    public int SortOrder { get; set; }
}
