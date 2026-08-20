using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Application.Features.Agencies.Dtos;
using RealEstate.Domain.Entities;

namespace RealEstate.Application.Features.Agencies.Queries.GetMyJoinRequest;

/// <summary>
/// The caller's own currently-pending join request, if any — lets the frontend show
/// "request pending" state on whichever agency page they visit, or after a refresh,
/// without needing to know in advance which agency they applied to.
/// </summary>
public class GetMyJoinRequestQuery : IRequest<AgencyJoinRequestDto?>
{
    public Guid RequestingUserId { get; set; }
}

public class GetMyJoinRequestQueryHandler : IRequestHandler<GetMyJoinRequestQuery, AgencyJoinRequestDto?>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetMyJoinRequestQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<AgencyJoinRequestDto?> Handle(GetMyJoinRequestQuery request, CancellationToken cancellationToken)
    {
        return await _context.AgencyJoinRequests
            .AsNoTracking()
            .Where(r => r.UserId == request.RequestingUserId && r.Status == AgencyJoinRequestStatus.Pending)
            .ProjectTo<AgencyJoinRequestDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync(cancellationToken);
    }
}
