using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;

namespace RealEstate.Application.Features.Properties.Commands.SetPropertyFeatured;

/// <summary>SuperAdmin-only editorial toggle — no ownership check, this is a platform decision, not the agent's.</summary>
public class SetPropertyFeaturedCommand : IRequest
{
    public Guid PropertyId { get; set; }

    public bool IsFeatured { get; set; }
}

public class SetPropertyFeaturedCommandHandler : IRequestHandler<SetPropertyFeaturedCommand>
{
    private readonly IApplicationDbContext _context;

    public SetPropertyFeaturedCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(SetPropertyFeaturedCommand request, CancellationToken cancellationToken)
    {
        var property = await _context.Properties
            .FirstOrDefaultAsync(p => p.Id == request.PropertyId, cancellationToken)
            ?? throw new KeyNotFoundException("Property not found.");

        property.IsFeatured = request.IsFeatured;

        await _context.SaveChangesAsync(cancellationToken);
    }
}
