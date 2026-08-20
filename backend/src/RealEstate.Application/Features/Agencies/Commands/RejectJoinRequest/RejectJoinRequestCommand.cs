using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Exceptions;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;
using RealEstate.Domain.Enums;

namespace RealEstate.Application.Features.Agencies.Commands.RejectJoinRequest;

public class RejectJoinRequestCommand : IRequest
{
    public Guid RequestId { get; set; }

    public Guid RequestingUserId { get; set; }
}

public class RejectJoinRequestCommandHandler : IRequestHandler<RejectJoinRequestCommand>
{
    private readonly IApplicationDbContext _context;

    public RejectJoinRequestCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(RejectJoinRequestCommand request, CancellationToken cancellationToken)
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

        joinRequest.Status = AgencyJoinRequestStatus.Rejected;
        joinRequest.RespondedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
    }
}
