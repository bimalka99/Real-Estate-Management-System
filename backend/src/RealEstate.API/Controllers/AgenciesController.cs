using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RealEstate.Application.Features.Agencies.Commands.ApproveJoinRequest;
using RealEstate.Application.Features.Agencies.Commands.CreateAgency;
using RealEstate.Application.Features.Agencies.Commands.JoinAgency;
using RealEstate.Application.Features.Agencies.Commands.LeaveAgency;
using RealEstate.Application.Features.Agencies.Commands.RejectJoinRequest;
using RealEstate.Application.Features.Agencies.Commands.UpdateAgency;
using RealEstate.Application.Features.Agencies.Dtos;
using RealEstate.Application.Features.Agencies.Queries.GetAgencies;
using RealEstate.Application.Features.Agencies.Queries.GetAgencyById;
using RealEstate.Application.Features.Agencies.Queries.GetJoinRequestsForAgency;
using RealEstate.Application.Features.Agencies.Queries.GetMyJoinRequest;

namespace RealEstate.API.Controllers;

[ApiController]
[Route("api/agencies")]
public class AgenciesController : ControllerBase
{
    private readonly ISender _sender;

    public AgenciesController(ISender sender)
    {
        _sender = sender;
    }

    /// <summary>Public directory of agencies.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<AgencyDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<AgencyDto>>> GetAgencies(CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetAgenciesQuery(), cancellationToken);
        return Ok(result);
    }

    /// <summary>A single agency's public profile, including its agent roster.</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(AgencyDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AgencyDetailDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var agency = await _sender.Send(new GetAgencyByIdQuery(id), cancellationToken);
        return agency is null ? NotFound() : Ok(agency);
    }

    /// <summary>
    /// Create a new agency. The caller becomes its AgencyAdmin. Fails if the caller
    /// already belongs to an agency.
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Agent,AgencyAdmin,SuperAdmin")]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<Guid>> Create(CreateAgencyCommand command, CancellationToken cancellationToken)
    {
        command.RequestingUserId = GetCurrentUserId();

        var id = await _sender.Send(command, cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id }, id);
    }

    /// <summary>Update an agency's own profile info. Only that agency's AgencyAdmin (or a SuperAdmin) may do this.</summary>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "AgencyAdmin,SuperAdmin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, UpdateAgencyCommand command, CancellationToken cancellationToken)
    {
        command.Id = id;
        command.RequestingUserId = GetCurrentUserId();

        await _sender.Send(command, cancellationToken);

        return NoContent();
    }

    /// <summary>
    /// Request to join an agency. Creates a Pending request for that agency's
    /// AgencyAdmin to approve or reject — not instant membership. Fails if you already
    /// belong to an agency or already have another request pending.
    /// </summary>
    [HttpPost("{id:guid}/join")]
    [Authorize(Roles = "Agent,AgencyAdmin,SuperAdmin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Join(Guid id, CancellationToken cancellationToken)
    {
        await _sender.Send(new JoinAgencyCommand { AgencyId = id, RequestingUserId = GetCurrentUserId() }, cancellationToken);
        return NoContent();
    }

    /// <summary>Leave your current agency. A no-op if you don't belong to one.</summary>
    [HttpPost("leave")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Leave(CancellationToken cancellationToken)
    {
        await _sender.Send(new LeaveAgencyCommand { RequestingUserId = GetCurrentUserId() }, cancellationToken);
        return NoContent();
    }

    /// <summary>The caller's own currently-pending join request, if any.</summary>
    [HttpGet("my-join-request")]
    [Authorize]
    [ProducesResponseType(typeof(AgencyJoinRequestDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<ActionResult<AgencyJoinRequestDto>> GetMyJoinRequest(CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetMyJoinRequestQuery { RequestingUserId = GetCurrentUserId() }, cancellationToken);
        return result is null ? NoContent() : Ok(result);
    }

    /// <summary>The pending join requests for one agency. Only that agency's AgencyAdmin (or a SuperAdmin) may view them.</summary>
    [HttpGet("{id:guid}/join-requests")]
    [Authorize(Roles = "AgencyAdmin,SuperAdmin")]
    [ProducesResponseType(typeof(List<AgencyJoinRequestDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<List<AgencyJoinRequestDto>>> GetJoinRequests(Guid id, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(
            new GetJoinRequestsForAgencyQuery { AgencyId = id, RequestingUserId = GetCurrentUserId() }, cancellationToken);
        return Ok(result);
    }

    /// <summary>Approve a pending join request — adds the applicant to the agency.</summary>
    [HttpPost("join-requests/{requestId:guid}/approve")]
    [Authorize(Roles = "AgencyAdmin,SuperAdmin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ApproveJoinRequest(Guid requestId, CancellationToken cancellationToken)
    {
        await _sender.Send(new ApproveJoinRequestCommand { RequestId = requestId, RequestingUserId = GetCurrentUserId() }, cancellationToken);
        return NoContent();
    }

    /// <summary>Reject a pending join request.</summary>
    [HttpPost("join-requests/{requestId:guid}/reject")]
    [Authorize(Roles = "AgencyAdmin,SuperAdmin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RejectJoinRequest(Guid requestId, CancellationToken cancellationToken)
    {
        await _sender.Send(new RejectJoinRequestCommand { RequestId = requestId, RequestingUserId = GetCurrentUserId() }, cancellationToken);
        return NoContent();
    }

    private Guid GetCurrentUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.Parse(value!);
    }
}
