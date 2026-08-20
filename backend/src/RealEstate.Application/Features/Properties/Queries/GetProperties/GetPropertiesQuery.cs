using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Application.Common.Models;
using RealEstate.Application.Features.Properties.Dtos;
using RealEstate.Domain.Enums;

namespace RealEstate.Application.Features.Properties.Queries.GetProperties;

public class GetPropertiesQuery : IRequest<PaginatedList<PropertyDto>>
{
    public string? City { get; set; }

    public PropertyType? Type { get; set; }

    public ListingType? ListingType { get; set; }

    public PropertyStatus? Status { get; set; }

    public decimal? MinPrice { get; set; }

    public decimal? MaxPrice { get; set; }

    public int? MinBedrooms { get; set; }

    public bool? IsFeatured { get; set; }

    /// <summary>Filter to a single agent's portfolio — used both for public agent-profile
    /// pages and for an agent's own "My Listings" dashboard view.</summary>
    public Guid? AgentId { get; set; }

    /// <summary>Filter to all listings across an agency's agents — used on agency profile pages.</summary>
    public Guid? AgencyId { get; set; }

    public int PageNumber { get; set; } = 1;

    public int PageSize { get; set; } = 12;
}

public class GetPropertiesQueryHandler : IRequestHandler<GetPropertiesQuery, PaginatedList<PropertyDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetPropertiesQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<PaginatedList<PropertyDto>> Handle(GetPropertiesQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Properties.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.City))
        {
            // Provider-agnostic case-insensitive match (Application shouldn't depend on
            // the Npgsql-specific EF.Functions.ILike, which lives in the Infrastructure package).
            var city = request.City.ToLower();
            query = query.Where(p => p.City.ToLower().Contains(city));
        }

        if (request.Type.HasValue)
        {
            query = query.Where(p => p.Type == request.Type);
        }

        if (request.ListingType.HasValue)
        {
            query = query.Where(p => p.ListingType == request.ListingType);
        }

        if (request.Status.HasValue)
        {
            query = query.Where(p => p.Status == request.Status);
        }

        if (request.MinPrice.HasValue)
        {
            query = query.Where(p => p.Price >= request.MinPrice);
        }

        if (request.MaxPrice.HasValue)
        {
            query = query.Where(p => p.Price <= request.MaxPrice);
        }

        if (request.MinBedrooms.HasValue)
        {
            query = query.Where(p => p.Bedrooms >= request.MinBedrooms);
        }

        if (request.IsFeatured.HasValue)
        {
            query = query.Where(p => p.IsFeatured == request.IsFeatured);
        }

        if (request.AgentId.HasValue)
        {
            query = query.Where(p => p.AgentId == request.AgentId);
        }

        if (request.AgencyId.HasValue)
        {
            query = query.Where(p => p.AgencyId == request.AgencyId);
        }

        query = query.OrderByDescending(p => p.IsFeatured).ThenByDescending(p => p.CreatedAtUtc);

        var projected = query.ProjectTo<PropertyDto>(_mapper.ConfigurationProvider);

        return await PaginatedList<PropertyDto>.CreateAsync(projected, request.PageNumber, request.PageSize);
    }
}
