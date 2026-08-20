using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Application.Features.Admin.Dtos;

namespace RealEstate.Application.Features.Admin.Queries.GetAllUsers;

public class GetAllUsersQuery : IRequest<List<AdminUserDto>>
{
}

public class GetAllUsersQueryHandler : IRequestHandler<GetAllUsersQuery, List<AdminUserDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetAllUsersQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<AdminUserDto>> Handle(GetAllUsersQuery request, CancellationToken cancellationToken)
    {
        return await _context.Users
            .AsNoTracking()
            .OrderByDescending(u => u.CreatedAtUtc)
            .ProjectTo<AdminUserDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
    }
}
