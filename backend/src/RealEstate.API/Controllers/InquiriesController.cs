using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RealEstate.Application.Features.Inquiries.Commands.CreateInquiry;
using RealEstate.Application.Features.Inquiries.Dtos;
using RealEstate.Application.Features.Inquiries.Queries.GetInquiriesForAgent;

namespace RealEstate.API.Controllers;

[ApiController]
[Route("api/inquiries")]
public class InquiriesController : ControllerBase
{
    private readonly ISender _sender;

    public InquiriesController(ISender sender)
    {
        _sender = sender;
    }

    /// <summary>
    /// Submit an inquiry about a property (e.g. "Contact Agent" / "Request a Viewing").
    /// Open to anonymous visitors; if the caller happens to be logged in, the inquiry
    /// is linked to their account automatically.
    /// </summary>
    [HttpPost]
    [AllowAnonymous]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Guid>> Create(CreateInquiryCommand command, CancellationToken cancellationToken)
    {
        if (User.Identity?.IsAuthenticated == true)
        {
            var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (Guid.TryParse(idClaim, out var senderId))
            {
                command.SenderId = senderId;
            }
        }

        var id = await _sender.Send(command, cancellationToken);

        return CreatedAtAction(nameof(Create), new { id }, id);
    }

    /// <summary>
    /// The inquiries (leads) submitted on the calling agent's own listings.
    /// </summary>
    [HttpGet("mine")]
    [Authorize(Roles = "Agent,AgencyAdmin,SuperAdmin")]
    [ProducesResponseType(typeof(List<InquiryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<InquiryDto>>> GetMine(CancellationToken cancellationToken)
    {
        var agentId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var result = await _sender.Send(new GetInquiriesForAgentQuery(agentId), cancellationToken);

        return Ok(result);
    }
}
