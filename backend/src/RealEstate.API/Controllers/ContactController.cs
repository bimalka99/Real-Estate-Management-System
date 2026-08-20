using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RealEstate.Application.Features.Contact.Commands.CreateContactMessage;

namespace RealEstate.API.Controllers;

[ApiController]
[Route("api/contact")]
public class ContactController : ControllerBase
{
    private readonly ISender _sender;

    public ContactController(ISender sender)
    {
        _sender = sender;
    }

    /// <summary>
    /// Submit a general "contact us" message — not tied to any specific property
    /// (see /api/inquiries for that). Open to anonymous visitors.
    /// </summary>
    [HttpPost]
    [AllowAnonymous]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Guid>> Create(CreateContactMessageCommand command, CancellationToken cancellationToken)
    {
        var id = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(Create), new { id }, id);
    }
}
