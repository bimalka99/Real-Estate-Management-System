using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Enums;

namespace RealEstate.Application.Features.Agencies.Commands.LeaveAgency;

/// <summary>
/// Leaves the caller's current agency. If they were its AgencyAdmin, they're demoted
/// back to Agent — there's no ownership-transfer flow in this MVP, so the agency
/// itself is simply left without an admin (its remaining agents/listings are untouched).
/// </summary>
public class LeaveAgencyCommand : IRequest
{
    public Guid RequestingUserId { get; set; }
}

public class LeaveAgencyCommandHandler : IRequestHandler<LeaveAgencyCommand>
{
    private readonly IApplicationDbContext _context;

    public LeaveAgencyCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(LeaveAgencyCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == request.RequestingUserId, cancellationToken)
            ?? throw new KeyNotFoundException("User not found.");

        if (user.AgencyId is null)
        {
            return; // Idempotent — leaving when you're not in an agency is a no-op.
        }

        user.AgencyId = null;

        if (user.Role == UserRole.AgencyAdmin)
        {
            user.Role = UserRole.Agent;
        }

        await _context.SaveChangesAsync(cancellationToken);
    }
}
