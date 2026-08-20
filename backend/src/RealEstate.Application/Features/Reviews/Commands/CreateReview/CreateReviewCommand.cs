using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Exceptions;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Application.Features.Reviews.Dtos;
using RealEstate.Domain.Entities;
using RealEstate.Domain.Enums;

namespace RealEstate.Application.Features.Reviews.Commands.CreateReview;

public class CreateReviewCommand : IRequest<ReviewDto>
{
    public Guid AgentId { get; set; }

    /// <summary>Set by the controller from the JWT claims.</summary>
    public Guid ReviewerId { get; set; }

    public int Rating { get; set; }

    public string Comment { get; set; } = string.Empty;
}

public class CreateReviewCommandHandler : IRequestHandler<CreateReviewCommand, ReviewDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public CreateReviewCommandHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<ReviewDto> Handle(CreateReviewCommand request, CancellationToken cancellationToken)
    {
        if (request.ReviewerId == request.AgentId)
        {
            throw new ForbiddenAccessException("You can't review yourself.");
        }

        var agent = await _context.Users.FirstOrDefaultAsync(
            u => u.Id == request.AgentId && (u.Role == UserRole.Agent || u.Role == UserRole.AgencyAdmin),
            cancellationToken)
            ?? throw new KeyNotFoundException("Agent not found.");

        var alreadyReviewed = await _context.Reviews.AnyAsync(
            r => r.AgentId == request.AgentId && r.ReviewerId == request.ReviewerId,
            cancellationToken);

        if (alreadyReviewed)
        {
            throw new ForbiddenAccessException("You've already reviewed this agent.");
        }

        var review = new Review
        {
            AgentId = agent.Id,
            ReviewerId = request.ReviewerId,
            Rating = request.Rating,
            Comment = request.Comment,
        };

        _context.Reviews.Add(review);
        await _context.SaveChangesAsync(cancellationToken);

        // Re-fetch through the mapped projection so ReviewerName/AvatarUrl are populated
        // (the just-added `review` has no loaded Reviewer navigation to map from directly).
        return await _context.Reviews
            .AsNoTracking()
            .Where(r => r.Id == review.Id)
            .ProjectTo<ReviewDto>(_mapper.ConfigurationProvider)
            .SingleAsync(cancellationToken);
    }
}
