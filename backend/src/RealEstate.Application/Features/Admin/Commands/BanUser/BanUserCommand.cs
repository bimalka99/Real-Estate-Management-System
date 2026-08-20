using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Exceptions;
using RealEstate.Application.Common.Interfaces;

namespace RealEstate.Application.Features.Admin.Commands.BanUser;

/// <summary>
/// Soft-deletes a user (bans them) — no un-ban flow in this MVP. Note this also
/// hides any properties they list: Property's join to Agent is an inner join
/// against the (also soft-delete-filtered) Users table, so a banned agent's
/// listings stop appearing in search results too. Treated as a feature, not a bug,
/// for moderation purposes.
/// </summary>
public class BanUserCommand : IRequest
{
    public Guid UserId { get; set; }

    /// <summary>Set by the controller from the JWT claims — can't ban yourself.</summary>
    public Guid RequestingUserId { get; set; }
}

public class BanUserCommandHandler : IRequestHandler<BanUserCommand>
{
    private readonly IApplicationDbContext _context;

    public BanUserCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(BanUserCommand request, CancellationToken cancellationToken)
    {
        if (request.UserId == request.RequestingUserId)
        {
            throw new ForbiddenAccessException("You can't ban yourself.");
        }

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken)
            ?? throw new KeyNotFoundException("User not found.");

        user.IsDeleted = true;

        await _context.SaveChangesAsync(cancellationToken);
    }
}
