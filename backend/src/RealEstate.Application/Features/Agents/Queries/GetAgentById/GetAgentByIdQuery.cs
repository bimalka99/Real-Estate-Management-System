using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Application.Features.Agents.Dtos;
using RealEstate.Domain.Enums;

namespace RealEstate.Application.Features.Agents.Queries.GetAgentById;

public class GetAgentByIdQuery : IRequest<AgentDto?>
{
    public Guid Id { get; set; }

    public GetAgentByIdQuery(Guid id)
    {
        Id = id;
    }
}

public class GetAgentByIdQueryHandler : IRequestHandler<GetAgentByIdQuery, AgentDto?>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetAgentByIdQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<AgentDto?> Handle(GetAgentByIdQuery request, CancellationToken cancellationToken)
    {
        // ProjectTo (translated to SQL) rather than loading the entity + Map() — the latter
        // would need an explicit .Include(u => u.Listings) or ListingCount silently reads an
        // unloaded (always-empty) navigation and reports 0 regardless of the real count.
        return await _context.Users
            .AsNoTracking()
            .Where(u => u.Id == request.Id && (u.Role == UserRole.Agent || u.Role == UserRole.AgencyAdmin))
            .ProjectTo<AgentDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync(cancellationToken);
    }
}
