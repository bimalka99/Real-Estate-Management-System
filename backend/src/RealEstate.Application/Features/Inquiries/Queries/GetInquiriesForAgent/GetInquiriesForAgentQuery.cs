using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Application.Features.Inquiries.Dtos;

namespace RealEstate.Application.Features.Inquiries.Queries.GetInquiriesForAgent;

/// <summary>
/// Returns inquiries submitted on any property listed by the given agent —
/// this is the lead list an agent sees for their own portfolio.
/// </summary>
public class GetInquiriesForAgentQuery : IRequest<List<InquiryDto>>
{
    public Guid AgentId { get; set; }

    public GetInquiriesForAgentQuery(Guid agentId)
    {
        AgentId = agentId;
    }
}

public class GetInquiriesForAgentQueryHandler : IRequestHandler<GetInquiriesForAgentQuery, List<InquiryDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetInquiriesForAgentQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<InquiryDto>> Handle(GetInquiriesForAgentQuery request, CancellationToken cancellationToken)
    {
        return await _context.Inquiries
            .AsNoTracking()
            .Where(i => i.Property.AgentId == request.AgentId)
            .OrderByDescending(i => i.CreatedAtUtc)
            .ProjectTo<InquiryDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);
    }
}
