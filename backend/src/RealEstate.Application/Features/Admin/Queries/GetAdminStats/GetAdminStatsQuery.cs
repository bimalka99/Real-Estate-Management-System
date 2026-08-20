using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Application.Features.Admin.Dtos;
using RealEstate.Domain.Enums;

namespace RealEstate.Application.Features.Admin.Queries.GetAdminStats;

public class GetAdminStatsQuery : IRequest<AdminStatsDto>
{
}

public class GetAdminStatsQueryHandler : IRequestHandler<GetAdminStatsQuery, AdminStatsDto>
{
    private readonly IApplicationDbContext _context;

    public GetAdminStatsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<AdminStatsDto> Handle(GetAdminStatsQuery request, CancellationToken cancellationToken)
    {
        return new AdminStatsDto
        {
            TotalUsers = await _context.Users.CountAsync(cancellationToken),
            TotalAgents = await _context.Users.CountAsync(u => u.Role == UserRole.Agent || u.Role == UserRole.AgencyAdmin, cancellationToken),
            TotalClients = await _context.Users.CountAsync(u => u.Role == UserRole.Client, cancellationToken),
            TotalProperties = await _context.Properties.CountAsync(cancellationToken),
            TotalAgencies = await _context.Agencies.CountAsync(cancellationToken),
            TotalInquiries = await _context.Inquiries.CountAsync(cancellationToken),
            TotalReviews = await _context.Reviews.CountAsync(cancellationToken),
        };
    }
}
