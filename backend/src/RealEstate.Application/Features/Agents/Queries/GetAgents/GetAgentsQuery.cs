using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Application.Features.Agents.Dtos;
using RealEstate.Domain.Enums;

namespace RealEstate.Application.Features.Agents.Queries.GetAgents;

/// <summary>Public directory of agents (and agency admins, who can also list properties).</summary>
public class GetAgentsQuery : IRequest<List<AgentDto>>
{
}

public class GetAgentsQueryHandler : IRequestHandler<GetAgentsQuery, List<AgentDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetAgentsQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<AgentDto>> Handle(GetAgentsQuery request, CancellationToken cancellationToken)
    {
        return await _context.Users
            .AsNoTracking()
            .Where(u => u.Role == UserRole.Agent || u.Role == UserRole.AgencyAdmin)
            .OrderByDescending(u => u.Listings.Count)
            .ProjectTo<AgentDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
    }
}
