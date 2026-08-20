using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Application.Features.Agencies.Dtos;

namespace RealEstate.Application.Features.Agencies.Queries.GetAgencies;

/// <summary>Public directory of agencies.</summary>
public class GetAgenciesQuery : IRequest<List<AgencyDto>>
{
}

public class GetAgenciesQueryHandler : IRequestHandler<GetAgenciesQuery, List<AgencyDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetAgenciesQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<AgencyDto>> Handle(GetAgenciesQuery request, CancellationToken cancellationToken)
    {
        return await _context.Agencies
            .AsNoTracking()
            .OrderByDescending(a => a.Listings.Count)
            .ProjectTo<AgencyDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
    }
}
