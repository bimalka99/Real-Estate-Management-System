using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Exceptions;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;
using RealEstate.Domain.Enums;

namespace RealEstate.Application.Features.Agencies.Commands.CreateAgency;

public class CreateAgencyCommand : IRequest<Guid>
{
    /// <summary>Set by the controller from the JWT claims.</summary>
    public Guid RequestingUserId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string? Website { get; set; }

    public string? PhoneNumber { get; set; }

    public string? Email { get; set; }
}

public class CreateAgencyCommandHandler : IRequestHandler<CreateAgencyCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateAgencyCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateAgencyCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == request.RequestingUserId, cancellationToken)
            ?? throw new KeyNotFoundException("User not found.");

        if (user.AgencyId is not null)
        {
            throw new ForbiddenAccessException(
                "You already belong to an agency — leave it before creating a new one.");
        }

        var agency = new Agency
        {
            Name = request.Name,
            Description = request.Description,
            Website = request.Website,
            PhoneNumber = request.PhoneNumber,
            Email = request.Email,
        };

        _context.Agencies.Add(agency);

        // The creator becomes the agency's admin, running its roster and listings.
        user.AgencyId = agency.Id;
        user.Role = UserRole.AgencyAdmin;

        await _context.SaveChangesAsync(cancellationToken);

        return agency.Id;
    }
}
