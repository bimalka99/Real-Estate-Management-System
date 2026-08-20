using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RealEstate.Application.Features.Agents.Dtos;
using RealEstate.Application.Features.Agents.Queries.GetAgentById;
using RealEstate.Application.Features.Agents.Queries.GetAgents;
using RealEstate.Application.Features.Reviews.Commands.CreateReview;
using RealEstate.Application.Features.Reviews.Dtos;
using RealEstate.Application.Features.Reviews.Queries.GetReviewsForAgent;

namespace RealEstate.API.Controllers;

/// <summary>Public agent directory — no authentication required, same as browsing properties.</summary>
[ApiController]
[Route("api/agents")]
public class AgentsController : ControllerBase
{
    private readonly ISender _sender;

    public AgentsController(ISender sender)
    {
        _sender = sender;
    }

    /// <summary>List all agents and agency admins, most-listings-first.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<AgentDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<AgentDto>>> GetAgents(CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetAgentsQuery(), cancellationToken);
        return Ok(result);
    }

    /// <summary>A single agent's public profile.</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(AgentDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AgentDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var agent = await _sender.Send(new GetAgentByIdQuery(id), cancellationToken);
        return agent is null ? NotFound() : Ok(agent);
    }

    /// <summary>Reviews left for this agent, newest first.</summary>
    [HttpGet("{id:guid}/reviews")]
    [ProducesResponseType(typeof(List<ReviewDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<ReviewDto>>> GetReviews(Guid id, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetReviewsForAgentQuery(id), cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Leave a review for this agent. Any authenticated user may review any agent once
    /// (except themselves) — there's no requirement to have worked with them first in this MVP.
    /// </summary>
    [HttpPost("{id:guid}/reviews")]
    [Authorize]
    [ProducesResponseType(typeof(ReviewDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ReviewDto>> CreateReview(Guid id, CreateReviewCommand command, CancellationToken cancellationToken)
    {
        command.AgentId = id;
        command.ReviewerId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var review = await _sender.Send(command, cancellationToken);

        return CreatedAtAction(nameof(GetReviews), new { id }, review);
    }
}
