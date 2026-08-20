using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Exceptions;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Application.Features.Agencies.Dtos;
using RealEstate.Domain.Entities;
using RealEstate.Domain.Enums;

namespace RealEstate.Application.Features.Agencies.Queries.GetJoinRequestsForAgency;

/// <summary>The pending join requests for one agency — only that agency's AgencyAdmin (or a SuperAdmin) may see them.</summary>
public class GetJoinRequestsForAgencyQuery : IRequest<List<AgencyJoinRequestDto>>
{
    public Guid AgencyId { get; set; }

    public Guid RequestingUserId { get; set; }
}

public class GetJoinRequestsForAgencyQueryHandler : IRequestHandler<GetJoinRequestsForAgencyQuery, List<AgencyJoinRequestDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetJoinRequestsForAgencyQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<AgencyJoinRequestDto>> Handle(GetJoinRequestsForAgencyQuery request, CancellationToken cancellationToken)
    {
        var requestingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == request.RequestingUserId, cancellationToken)
            ?? throw new KeyNotFoundException("User not found.");

        var isPrivileged = requestingUser.Role == UserRole.SuperAdmin;
        var isThisAgencysAdmin = requestingUser.Role == UserRole.AgencyAdmin && requestingUser.AgencyId == request.AgencyId;

        if (!isPrivileged && !isThisAgencysAdmin)
        {
            throw new ForbiddenAccessException("You can only view join requests for your own agency.");
        }

        return await _context.AgencyJoinRequests
            .AsNoTracking()
            .Where(r => r.AgencyId == request.AgencyId && r.Status == AgencyJoinRequestStatus.Pending)
            .OrderBy(r => r.CreatedAtUtc)
            .ProjectTo<AgencyJoinRequestDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
    }
}
