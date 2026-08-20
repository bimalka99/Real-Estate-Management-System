using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Application.Features.Contact.Dtos;

namespace RealEstate.Application.Features.Admin.Queries.GetContactMessages;

public class GetContactMessagesQuery : IRequest<List<ContactMessageDto>>
{
}

public class GetContactMessagesQueryHandler : IRequestHandler<GetContactMessagesQuery, List<ContactMessageDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetContactMessagesQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<ContactMessageDto>> Handle(GetContactMessagesQuery request, CancellationToken cancellationToken)
    {
        return await _context.ContactMessages
            .AsNoTracking()
            .OrderByDescending(c => c.CreatedAtUtc)
            .ProjectTo<ContactMessageDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
    }
}
