using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Exceptions;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Enums;

namespace RealEstate.Application.Features.Admin.Commands.UpdateUserRole;

public class UpdateUserRoleCommand : IRequest
{
    public Guid UserId { get; set; }

    public UserRole NewRole { get; set; }

    /// <summary>Set by the controller from the JWT claims — a SuperAdmin can't change their own role this way.</summary>
    public Guid RequestingUserId { get; set; }
}

public class UpdateUserRoleCommandHandler : IRequestHandler<UpdateUserRoleCommand>
{
    private readonly IApplicationDbContext _context;

    public UpdateUserRoleCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(UpdateUserRoleCommand request, CancellationToken cancellationToken)
    {
        if (request.UserId == request.RequestingUserId)
        {
            throw new ForbiddenAccessException("You can't change your own role.");
        }

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken)
            ?? throw new KeyNotFoundException("User not found.");

        user.Role = request.NewRole;

        await _context.SaveChangesAsync(cancellationToken);
    }
}
