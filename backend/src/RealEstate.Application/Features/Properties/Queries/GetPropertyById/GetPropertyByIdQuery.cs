using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Application.Features.Properties.Dtos;

namespace RealEstate.Application.Features.Properties.Queries.GetPropertyById;

public class GetPropertyByIdQuery : IRequest<PropertyDto?>
{
    public Guid Id { get; set; }

    public GetPropertyByIdQuery(Guid id)
    {
        Id = id;
    }
}

public class GetPropertyByIdQueryHandler : IRequestHandler<GetPropertyByIdQuery, PropertyDto?>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetPropertyByIdQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<PropertyDto?> Handle(GetPropertyByIdQuery request, CancellationToken cancellationToken)
    {
        var property = await _context.Properties
            .AsNoTracking()
            .Include(p => p.Images)
            .Include(p => p.Agent)
            .Include(p => p.Agency)
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        return property is null ? null : _mapper.Map<PropertyDto>(property);
    }
}
