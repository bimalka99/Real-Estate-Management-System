using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;

namespace RealEstate.Application.Features.Favorites.Commands.RemoveFavorite;

public class RemoveFavoriteCommand : IRequest
{
    public Guid UserId { get; set; }

    public Guid PropertyId { get; set; }
}

public class RemoveFavoriteCommandHandler : IRequestHandler<RemoveFavoriteCommand>
{
    private readonly IApplicationDbContext _context;

    public RemoveFavoriteCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(RemoveFavoriteCommand request, CancellationToken cancellationToken)
    {
        var favorite = await _context.Favorites
            .FirstOrDefaultAsync(f => f.UserId == request.UserId && f.PropertyId == request.PropertyId, cancellationToken);

        if (favorite is null)
        {
            return; // Idempotent — removing a favorite that isn't there is a no-op, not an error.
        }

        _context.Favorites.Remove(favorite);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
