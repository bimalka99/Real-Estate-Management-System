using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Exceptions;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Application.Features.Properties.Dtos;
using RealEstate.Domain.Entities;

namespace RealEstate.Application.Features.Properties.Commands.UploadPropertyImage;

public class UploadPropertyImageCommand : IRequest<PropertyImageDto>
{
    public Guid PropertyId { get; set; }

    /// <summary>Set by the controller from the JWT claims — used for the ownership check.</summary>
    public Guid RequestingUserId { get; set; }

    public byte[] Content { get; set; } = Array.Empty<byte>();

    public string FileName { get; set; } = string.Empty;

    public string ContentType { get; set; } = string.Empty;
}

public class UploadPropertyImageCommandHandler : IRequestHandler<UploadPropertyImageCommand, PropertyImageDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IFileStorageService _fileStorage;
    private readonly IMapper _mapper;

    public UploadPropertyImageCommandHandler(IApplicationDbContext context, IFileStorageService fileStorage, IMapper mapper)
    {
        _context = context;
        _fileStorage = fileStorage;
        _mapper = mapper;
    }

    public async Task<PropertyImageDto> Handle(UploadPropertyImageCommand request, CancellationToken cancellationToken)
    {
        var property = await _context.Properties
            .FirstOrDefaultAsync(p => p.Id == request.PropertyId, cancellationToken)
            ?? throw new KeyNotFoundException("Property not found.");

        if (property.AgentId != request.RequestingUserId)
        {
            throw new ForbiddenAccessException("You can only add images to your own listings.");
        }

        var url = await _fileStorage.SaveAsync(request.Content, request.FileName, request.ContentType, cancellationToken);

        var existingCount = await _context.PropertyImages.CountAsync(i => i.PropertyId == property.Id, cancellationToken);

        // Added directly to its own DbSet, not via property.Images.Add(...) — see the note
        // in UpdatePropertyCommandHandler on why that pattern misbehaves for an
        // already-tracked parent (this Property was just loaded above, not newly created).
        var image = new PropertyImage
        {
            PropertyId = property.Id,
            Url = url,
            IsCover = existingCount == 0, // first image uploaded becomes the cover automatically
            SortOrder = existingCount,
        };

        _context.PropertyImages.Add(image);
        await _context.SaveChangesAsync(cancellationToken);

        return _mapper.Map<PropertyImageDto>(image);
    }
}
