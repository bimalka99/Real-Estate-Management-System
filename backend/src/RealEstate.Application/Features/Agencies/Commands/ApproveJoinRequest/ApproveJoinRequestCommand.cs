using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Exceptions;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;
using RealEstate.Domain.Enums;

namespace RealEstate.Application.Features.Agencies.Commands.ApproveJoinRequest;

public class ApproveJoinRequestCommand : IRequest
{
    public Guid RequestId { get; set; }

    public Guid RequestingUserId { get; set; }
}

public class ApproveJoinRequestCommandHandler : IRequestHandler<ApproveJoinRequestCommand>
{
    private readonly IApplicationDbContext _context;

    public ApproveJoinRequestCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(ApproveJoinRequestCommand request, CancellationToken cancellationToken)
    {
        var joinRequest = await _context.AgencyJoinRequests
            .FirstOrDefaultAsync(r => r.Id == request.RequestId, cancellationToken)
            ?? throw new KeyNotFoundException("Join request not found.");

        var requestingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == request.RequestingUserId, cancellationToken)
            ?? throw new KeyNotFoundException("User not found.");

        var isPrivileged = requestingUser.Role == UserRole.SuperAdmin;
        var isThisAgencysAdmin = requestingUser.Role == UserRole.AgencyAdmin && requestingUser.AgencyId == joinRequest.AgencyId;

        if (!isPrivileged && !isThisAgencysAdmin)
        {
            throw new ForbiddenAccessException("You can only respond to join requests for your own agency.");
        }

        if (joinRequest.Status != AgencyJoinRequestStatus.Pending)
        {
            throw new BadRequestException("This request has already been responded to.");
        }

        var applicant = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == joinRequest.UserId, cancellationToken)
            ?? throw new KeyNotFoundException("Applicant account not found.");

        // Guards the edge case where the applicant joined another agency in the time
        // between requesting and this approval — JoinAgencyCommand only blocks a *new*
        // request while one is pending, it can't prevent this race entirely.
        if (applicant.AgencyId is not null)
        {
            throw new BadRequestException("This applicant already belongs to an agency.");
        }

        applicant.AgencyId = joinRequest.AgencyId;

        joinRequest.Status = AgencyJoinRequestStatus.Approved;
        joinRequest.RespondedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
    }
}
