using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;

namespace RealEstate.Application.Features.Inquiries.Commands.CreateInquiry;

public class CreateInquiryCommand : IRequest<Guid>
{
    public Guid PropertyId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string? Phone { get; set; }

    public string Message { get; set; } = string.Empty;

    public DateTime? PreferredViewingDate { get; set; }

    /// <summary>Set by the controller from the JWT claims when the caller is logged in; null for anonymous visitors.</summary>
    public Guid? SenderId { get; set; }
}

public class CreateInquiryCommandHandler : IRequestHandler<CreateInquiryCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateInquiryCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateInquiryCommand request, CancellationToken cancellationToken)
    {
        var propertyExists = await _context.Properties
            .AnyAsync(p => p.Id == request.PropertyId, cancellationToken);

        if (!propertyExists)
        {
            throw new KeyNotFoundException("Property not found.");
        }

        var inquiry = new Inquiry
        {
            PropertyId = request.PropertyId,
            SenderId = request.SenderId,
            Name = request.Name.Trim(),
            Email = request.Email.Trim().ToLowerInvariant(),
            Phone = request.Phone,
            Message = request.Message.Trim(),
            PreferredViewingDate = request.PreferredViewingDate,
            Status = InquiryStatus.New,
        };

        _context.Inquiries.Add(inquiry);
        await _context.SaveChangesAsync(cancellationToken);

        return inquiry.Id;
    }
}
