using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Exceptions;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Enums;

namespace RealEstate.Application.Features.Agencies.Commands.UpdateAgency;

public class UpdateAgencyCommand : IRequest
{
    public Guid Id { get; set; }

    /// <summary>Set by the controller from the JWT claims.</summary>
    public Guid RequestingUserId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string? Website { get; set; }

    public string? PhoneNumber { get; set; }

    public string? Email { get; set; }

    public string? LogoUrl { get; set; }
}

public class UpdateAgencyCommandHandler : IRequestHandler<UpdateAgencyCommand>
{
    private readonly IApplicationDbContext _context;

    public UpdateAgencyCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(UpdateAgencyCommand request, CancellationToken cancellationToken)
    {
        var agency = await _context.Agencies
            .FirstOrDefaultAsync(a => a.Id == request.Id, cancellationToken)
            ?? throw new KeyNotFoundException("Agency not found.");

        var requestingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == request.RequestingUserId, cancellationToken)
            ?? throw new KeyNotFoundException("User not found.");

        // A SuperAdmin may manage any agency; otherwise you must be the AgencyAdmin of
        // *this specific* agency — a rank-and-file Agent member can't edit it.
        var isPrivileged = requestingUser.Role == UserRole.SuperAdmin;
        var isThisAgencysAdmin = requestingUser.Role == UserRole.AgencyAdmin && requestingUser.AgencyId == agency.Id;

        if (!isPrivileged && !isThisAgencysAdmin)
        {
            throw new ForbiddenAccessException("You can only manage your own agency.");
        }

        agency.Name = request.Name;
        agency.Description = request.Description;
        agency.Website = request.Website;
        agency.PhoneNumber = request.PhoneNumber;
        agency.Email = request.Email;
        agency.LogoUrl = request.LogoUrl;

        await _context.SaveChangesAsync(cancellationToken);
    }
}
