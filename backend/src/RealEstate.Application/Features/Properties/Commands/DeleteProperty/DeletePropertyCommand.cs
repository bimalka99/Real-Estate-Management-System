using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Exceptions;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Enums;

namespace RealEstate.Application.Features.Properties.Commands.DeleteProperty;

public class DeletePropertyCommand : IRequest
{
    public Guid Id { get; set; }

    /// <summary>Set by the controller from the JWT claims — used for the ownership check.</summary>
    public Guid RequestingUserId { get; set; }

    /// <summary>Set by the controller from the JWT claims — a SuperAdmin may moderate any listing.</summary>
    public UserRole RequestingUserRole { get; set; }
}

public class DeletePropertyCommandHandler : IRequestHandler<DeletePropertyCommand>
{
    private readonly IApplicationDbContext _context;

    public DeletePropertyCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(DeletePropertyCommand request, CancellationToken cancellationToken)
    {
        var property = await _context.Properties
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken)
            ?? throw new KeyNotFoundException("Property not found.");

        var isOwner = property.AgentId == request.RequestingUserId;
        var isPrivileged = request.RequestingUserRole == UserRole.SuperAdmin;

        if (!isOwner && !isPrivileged)
        {
            throw new ForbiddenAccessException("You can only delete your own listings.");
        }

        // Soft delete — keeps the row (and its Inquiries/Favorites/PriceHistory) for
        // history/audit purposes; the global query filter hides it from normal reads.
        property.IsDeleted = true;

        await _context.SaveChangesAsync(cancellationToken);
    }
}
