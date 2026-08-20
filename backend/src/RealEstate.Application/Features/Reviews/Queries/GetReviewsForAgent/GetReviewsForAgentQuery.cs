using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Application.Features.Reviews.Dtos;

namespace RealEstate.Application.Features.Reviews.Queries.GetReviewsForAgent;

public class GetReviewsForAgentQuery : IRequest<List<ReviewDto>>
{
    public Guid AgentId { get; set; }

    public GetReviewsForAgentQuery(Guid agentId)
    {
        AgentId = agentId;
    }
}

public class GetReviewsForAgentQueryHandler : IRequestHandler<GetReviewsForAgentQuery, List<ReviewDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetReviewsForAgentQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<ReviewDto>> Handle(GetReviewsForAgentQuery request, CancellationToken cancellationToken)
    {
        return await _context.Reviews
            .AsNoTracking()
            .Where(r => r.AgentId == request.AgentId)
            .OrderByDescending(r => r.CreatedAtUtc)
            .ProjectTo<ReviewDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
    }
}
