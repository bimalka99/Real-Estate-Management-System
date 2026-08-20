using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Exceptions;
using RealEstate.Application.Common.Interfaces;

namespace RealEstate.Application.Features.Properties.Commands.SetCoverPropertyImage;

public class SetCoverPropertyImageCommand : IRequest
{
    public Guid PropertyId { get; set; }

    public Guid ImageId { get; set; }

    public Guid RequestingUserId { get; set; }
}

public class SetCoverPropertyImageCommandHandler : IRequestHandler<SetCoverPropertyImageCommand>
{
    private readonly IApplicationDbContext _context;

    public SetCoverPropertyImageCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(SetCoverPropertyImageCommand request, CancellationToken cancellationToken)
    {
        var property = await _context.Properties
            .FirstOrDefaultAsync(p => p.Id == request.PropertyId, cancellationToken)
            ?? throw new KeyNotFoundException("Property not found.");

        if (property.AgentId != request.RequestingUserId)
        {
            throw new ForbiddenAccessException("You can only manage images on your own listings.");
        }

        var images = await _context.PropertyImages
            .Where(i => i.PropertyId == request.PropertyId)
            .ToListAsync(cancellationToken);

        var target = images.FirstOrDefault(i => i.Id == request.ImageId)
            ?? throw new KeyNotFoundException("Image not found.");

        foreach (var image in images)
        {
            image.IsCover = image.Id == target.Id;
        }

        await _context.SaveChangesAsync(cancellationToken);
    }
}
