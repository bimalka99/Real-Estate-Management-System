using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;

namespace RealEstate.Application.Features.Favorites.Queries.GetMyFavoriteIds;

/// <summary>
/// A lightweight id-only list — lets the frontend know which property cards
/// should render a filled-in heart without fetching full property data.
/// </summary>
public class GetMyFavoriteIdsQuery : IRequest<List<Guid>>
{
    public Guid UserId { get; set; }

    public GetMyFavoriteIdsQuery(Guid userId)
    {
        UserId = userId;
    }
}

public class GetMyFavoriteIdsQueryHandler : IRequestHandler<GetMyFavoriteIdsQuery, List<Guid>>
{
    private readonly IApplicationDbContext _context;

    public GetMyFavoriteIdsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Guid>> Handle(GetMyFavoriteIdsQuery request, CancellationToken cancellationToken)
    {
        return await _context.Favorites
            .AsNoTracking()
            .Where(f => f.UserId == request.UserId)
            .Select(f => f.PropertyId)
            .ToListAsync(cancellationToken);
    }
}
