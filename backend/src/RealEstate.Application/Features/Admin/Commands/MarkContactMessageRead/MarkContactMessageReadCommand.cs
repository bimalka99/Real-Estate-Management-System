using MediatR;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.Common.Interfaces;

namespace RealEstate.Application.Features.Admin.Commands.MarkContactMessageRead;

public class MarkContactMessageReadCommand : IRequest
{
    public Guid Id { get; set; }
}

public class MarkContactMessageReadCommandHandler : IRequestHandler<MarkContactMessageReadCommand>
{
    private readonly IApplicationDbContext _context;

    public MarkContactMessageReadCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(MarkContactMessageReadCommand request, CancellationToken cancellationToken)
    {
        var message = await _context.ContactMessages.FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken)
            ?? throw new KeyNotFoundException("Message not found.");

        message.IsRead = true;
        await _context.SaveChangesAsync(cancellationToken);
    }
}
