using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Application.Features.Properties.Dtos;

namespace RealEstate.Application.Features.Favorites.Queries.GetMyFavorites;

public class GetMyFavoritesQuery : IRequest<List<PropertyDto>>
{
    public Guid UserId { get; set; }

    public GetMyFavoritesQuery(Guid userId)
    {
        UserId = userId;
    }
}

public class GetMyFavoritesQueryHandler : IRequestHandler<GetMyFavoritesQuery, List<PropertyDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetMyFavoritesQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<PropertyDto>> Handle(GetMyFavoritesQuery request, CancellationToken cancellationToken)
    {
        return await _context.Favorites
            .AsNoTracking()
            .Where(f => f.UserId == request.UserId)
            .OrderByDescending(f => f.CreatedAtUtc)
            .Select(f => f.Property)
            .ProjectTo<PropertyDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
    }
}
