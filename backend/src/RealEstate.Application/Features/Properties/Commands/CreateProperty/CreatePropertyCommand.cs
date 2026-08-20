using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;
using RealEstate.Domain.Enums;

namespace RealEstate.Application.Features.Properties.Commands.CreateProperty;

public class CreatePropertyCommand : IRequest<Guid>
{
    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public PropertyType Type { get; set; }

    public ListingType ListingType { get; set; }

    public decimal Price { get; set; }

    public string Currency { get; set; } = "USD";

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

    /// <summary>
    /// The agent creating this listing. Set by the controller from the authenticated
    /// user's claims — never trust a client-supplied agent id here, or any caller
    /// could create listings under someone else's identity.
    /// </summary>
    public Guid AgentId { get; set; }
}

public class CreatePropertyCommandHandler : IRequestHandler<CreatePropertyCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreatePropertyCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreatePropertyCommand request, CancellationToken cancellationToken)
    {
        var agent = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == request.AgentId, cancellationToken)
            ?? throw new KeyNotFoundException("Agent not found.");

        var property = new Property
        {
            Title = request.Title,
            Description = request.Description,
            Type = request.Type,
            ListingType = request.ListingType,
            Status = PropertyStatus.ForSale,
            Price = request.Price,
            Currency = request.Currency,
            AddressLine = request.AddressLine,
            City = request.City,
            State = request.State,
            Country = request.Country,
            PostalCode = request.PostalCode,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            Bedrooms = request.Bedrooms,
            Bathrooms = request.Bathrooms,
            AreaSqft = request.AreaSqft,
            YearBuilt = request.YearBuilt,
            Amenities = request.Amenities,
            AgentId = agent.Id,
            // Derived from the agent's own record, never from client input — an agent
            // can only ever list properties under the agency they actually belong to.
            AgencyId = agent.AgencyId,
        };

        property.PriceHistory.Add(new PropertyPriceHistory
        {
            Price = request.Price,
            EffectiveAtUtc = DateTime.UtcNow
        });

        _context.Properties.Add(property);
        await _context.SaveChangesAsync(cancellationToken);

        return property.Id;
    }
}
