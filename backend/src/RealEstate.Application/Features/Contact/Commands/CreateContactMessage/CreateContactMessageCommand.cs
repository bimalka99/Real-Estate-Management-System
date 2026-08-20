using MediatR;
using RealEstate.Application.Common.Interfaces;
using RealEstate.Domain.Entities;

namespace RealEstate.Application.Features.Contact.Commands.CreateContactMessage;

public class CreateContactMessageCommand : IRequest<Guid>
{
    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string? Phone { get; set; }

    public string Message { get; set; } = string.Empty;
}

public class CreateContactMessageCommandHandler : IRequestHandler<CreateContactMessageCommand, Guid>
{
    private readonly IApplicationDbContext _context;

    public CreateContactMessageCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateContactMessageCommand request, CancellationToken cancellationToken)
    {
        var message = new ContactMessage
        {
            Name = request.Name.Trim(),
            Email = request.Email.Trim().ToLowerInvariant(),
            Phone = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone.Trim(),
            Message = request.Message.Trim(),
        };

        _context.ContactMessages.Add(message);
        await _context.SaveChangesAsync(cancellationToken);

        return message.Id;
    }
}
