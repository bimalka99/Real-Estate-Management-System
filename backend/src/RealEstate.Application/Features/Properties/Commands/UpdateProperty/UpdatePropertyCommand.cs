using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Exceptions;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;
using RealEstate.Domain.Enums;

namespace RealEstate.Application.Features.Properties.Commands.UpdateProperty;

public class UpdatePropertyCommand : IRequest
{
    /// <summary>Route id — which property to update.</summary>
    public Guid Id { get; set; }

    /// <summary>Set by the controller from the JWT claims — used for the ownership check, never trusted from the body.</summary>
    public Guid RequestingUserId { get; set; }

    /// <summary>Set by the controller from the JWT claims — a SuperAdmin may moderate any listing.</summary>
    public UserRole RequestingUserRole { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public PropertyType Type { get; set; }

    public ListingType ListingType { get; set; }

    public PropertyStatus Status { get; set; }

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

    public bool IsFeatured { get; set; }
}

public class UpdatePropertyCommandHandler : IRequestHandler<UpdatePropertyCommand>
{
    private readonly IApplicationDbContext _context;

    public UpdatePropertyCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(UpdatePropertyCommand request, CancellationToken cancellationToken)
    {
        var property = await _context.Properties
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken)
            ?? throw new KeyNotFoundException("Property not found.");

        var isOwner = property.AgentId == request.RequestingUserId;
        var isPrivileged = request.RequestingUserRole == UserRole.SuperAdmin;

        if (!isOwner && !isPrivileged)
        {
            throw new ForbiddenAccessException("You can only edit your own listings.");
        }

        if (property.Price != request.Price)
        {
            // Added directly to its own DbSet (rather than via property.PriceHistory.Add(...))
            // so EF Core's change tracker unambiguously marks it as a new insert. Adding a new
            // child with a pre-assigned client-side key (see BaseEntity.Id) to a navigation
            // collection of an already-tracked parent can otherwise be misdetected as an
            // update-to-an-existing-row, which fails with a DbUpdateConcurrencyException
            // (0 rows matched) since no such row exists yet.
            _context.PropertyPriceHistories.Add(new PropertyPriceHistory
            {
                PropertyId = property.Id,
                Price = request.Price,
                EffectiveAtUtc = DateTime.UtcNow,
            });
        }

        property.Title = request.Title;
        property.Description = request.Description;
        property.Type = request.Type;
        property.ListingType = request.ListingType;
        property.Status = request.Status;
        property.Price = request.Price;
        property.Currency = request.Currency;
        property.AddressLine = request.AddressLine;
        property.City = request.City;
        property.State = request.State;
        property.Country = request.Country;
        property.PostalCode = request.PostalCode;
        property.Latitude = request.Latitude;
        property.Longitude = request.Longitude;
        property.Bedrooms = request.Bedrooms;
        property.Bathrooms = request.Bathrooms;
        property.AreaSqft = request.AreaSqft;
        property.YearBuilt = request.YearBuilt;
        property.Amenities = request.Amenities;
        property.IsFeatured = request.IsFeatured;

        await _context.SaveChangesAsync(cancellationToken);
    }
}
