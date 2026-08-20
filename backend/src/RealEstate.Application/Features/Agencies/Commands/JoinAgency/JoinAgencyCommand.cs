using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Exceptions;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;

namespace RealEstate.Application.Features.Agencies.Commands.JoinAgency;

/// <summary>
/// Requests to join an agency — creates a Pending <see cref="AgencyJoinRequest"/> for
/// that agency's AgencyAdmin to approve or reject (see ApproveJoinRequestCommand /
/// RejectJoinRequestCommand), rather than joining immediately. Replaces the earlier
/// self-serve "join instantly" MVP behavior.
/// </summary>
public class JoinAgencyCommand : IRequest
{
    public Guid AgencyId { get; set; }

    public Guid RequestingUserId { get; set; }
}

public class JoinAgencyCommandHandler : IRequestHandler<JoinAgencyCommand>
{
    private readonly IApplicationDbContext _context;

    public JoinAgencyCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(JoinAgencyCommand request, CancellationToken cancellationToken)
    {
        var agencyExists = await _context.Agencies.AnyAsync(a => a.Id == request.AgencyId, cancellationToken);
        if (!agencyExists)
        {
            throw new KeyNotFoundException("Agency not found.");
        }

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == request.RequestingUserId, cancellationToken)
            ?? throw new KeyNotFoundException("User not found.");

        if (user.AgencyId is not null)
        {
            throw new ForbiddenAccessException(
                "You already belong to an agency — leave it before requesting to join another.");
        }

        var hasPendingRequest = await _context.AgencyJoinRequests.AnyAsync(
            r => r.UserId == request.RequestingUserId && r.Status == AgencyJoinRequestStatus.Pending,
            cancellationToken);

        if (hasPendingRequest)
        {
            throw new BadRequestException(
                "You already have a pending join request. Wait for a response before requesting another.");
        }

        _context.AgencyJoinRequests.Add(new AgencyJoinRequest
        {
            AgencyId = request.AgencyId,
            UserId = request.RequestingUserId,
        });

        await _context.SaveChangesAsync(cancellationToken);
    }
}
