using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Exceptions;
using RealEstate.Application.Common.Interfaces;

namespace RealEstate.Application.Features.Properties.Commands.DeletePropertyImage;

public class DeletePropertyImageCommand : IRequest
{
    public Guid PropertyId { get; set; }

    public Guid ImageId { get; set; }

    public Guid RequestingUserId { get; set; }
}

public class DeletePropertyImageCommandHandler : IRequestHandler<DeletePropertyImageCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly IFileStorageService _fileStorage;

    public DeletePropertyImageCommandHandler(IApplicationDbContext context, IFileStorageService fileStorage)
    {
        _context = context;
        _fileStorage = fileStorage;
    }

    public async Task Handle(DeletePropertyImageCommand request, CancellationToken cancellationToken)
    {
        var property = await _context.Properties
            .FirstOrDefaultAsync(p => p.Id == request.PropertyId, cancellationToken)
            ?? throw new KeyNotFoundException("Property not found.");

        if (property.AgentId != request.RequestingUserId)
        {
            throw new ForbiddenAccessException("You can only manage images on your own listings.");
        }

        var image = await _context.PropertyImages
            .FirstOrDefaultAsync(i => i.Id == request.ImageId && i.PropertyId == request.PropertyId, cancellationToken)
            ?? throw new KeyNotFoundException("Image not found.");

        var wasCover = image.IsCover;

        _fileStorage.Delete(image.Url);
        _context.PropertyImages.Remove(image);
        await _context.SaveChangesAsync(cancellationToken);

        // Promote another image to cover so the listing doesn't silently lose one.
        if (wasCover)
        {
            var nextImage = await _context.PropertyImages
                .Where(i => i.PropertyId == request.PropertyId)
                .OrderBy(i => i.SortOrder)
                .FirstOrDefaultAsync(cancellationToken);

            if (nextImage is not null)
            {
                nextImage.IsCover = true;
                await _context.SaveChangesAsync(cancellationToken);
            }
        }
    }
}
