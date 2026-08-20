using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Application.Features.Agencies.Dtos;

namespace RealEstate.Application.Features.Agencies.Queries.GetAgencyById;

public class GetAgencyByIdQuery : IRequest<AgencyDetailDto?>
{
    public Guid Id { get; set; }

    public GetAgencyByIdQuery(Guid id)
    {
        Id = id;
    }
}

public class GetAgencyByIdQueryHandler : IRequestHandler<GetAgencyByIdQuery, AgencyDetailDto?>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetAgencyByIdQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<AgencyDetailDto?> Handle(GetAgencyByIdQuery request, CancellationToken cancellationToken)
    {
        return await _context.Agencies
            .AsNoTracking()
            .Where(a => a.Id == request.Id)
            .ProjectTo<AgencyDetailDto>(_mapper.ConfigurationProvider)
            .FirstOrDefaultAsync(cancellationToken);
    }
}
