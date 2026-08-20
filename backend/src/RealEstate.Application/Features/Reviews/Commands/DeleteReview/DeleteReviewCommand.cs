using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Exceptions;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Enums;

namespace RealEstate.Application.Features.Reviews.Commands.DeleteReview;

public class DeleteReviewCommand : IRequest
{
    public Guid Id { get; set; }

    /// <summary>Set by the controller from the JWT claims.</summary>
    public Guid RequestingUserId { get; set; }

    public UserRole RequestingUserRole { get; set; }
}

public class DeleteReviewCommandHandler : IRequestHandler<DeleteReviewCommand>
{
    private readonly IApplicationDbContext _context;

    public DeleteReviewCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(DeleteReviewCommand request, CancellationToken cancellationToken)
    {
        var review = await _context.Reviews
            .FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken)
            ?? throw new KeyNotFoundException("Review not found.");

        var isOwnReview = review.ReviewerId == request.RequestingUserId;
        var isPrivileged = request.RequestingUserRole == UserRole.SuperAdmin;

        if (!isOwnReview && !isPrivileged)
        {
            throw new ForbiddenAccessException("You can only delete your own reviews.");
        }

        _context.Reviews.Remove(review);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
