using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;

namespace RealEstate.Application.Features.Favorites.Commands.AddFavorite;

public class AddFavoriteCommand : IRequest
{
    public Guid UserId { get; set; }

    public Guid PropertyId { get; set; }
}

public class AddFavoriteCommandHandler : IRequestHandler<AddFavoriteCommand>
{
    private readonly IApplicationDbContext _context;

    public AddFavoriteCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(AddFavoriteCommand request, CancellationToken cancellationToken)
    {
        var alreadyFavorited = await _context.Favorites
            .AnyAsync(f => f.UserId == request.UserId && f.PropertyId == request.PropertyId, cancellationToken);

        if (alreadyFavorited)
        {
            return; // Idempotent — favoriting an already-favorited property is a no-op, not an error.
        }

        var propertyExists = await _context.Properties.AnyAsync(p => p.Id == request.PropertyId, cancellationToken);
        if (!propertyExists)
        {
            throw new KeyNotFoundException("Property not found.");
        }

        _context.Favorites.Add(new Favorite { UserId = request.UserId, PropertyId = request.PropertyId });
        await _context.SaveChangesAsync(cancellationToken);
    }
}
