using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RealEstate.Application.Features.Admin.Commands.BanUser;
using RealEstate.Application.Features.Admin.Commands.MarkContactMessageRead;
using RealEstate.Application.Features.Admin.Commands.UpdateUserRole;
using RealEstate.Application.Features.Admin.Dtos;
using RealEstate.Application.Features.Admin.Queries.GetAdminStats;
using RealEstate.Application.Features.Admin.Queries.GetAllUsers;
using RealEstate.Application.Features.Admin.Queries.GetContactMessages;
using RealEstate.Application.Features.Contact.Dtos;
using RealEstate.Application.Features.Properties.Commands.SetPropertyFeatured;
using RealEstate.Domain.Enums;

namespace RealEstate.API.Controllers;

/// <summary>Platform administration — everything here is SuperAdmin-only.</summary>
[ApiController]
[Route("api/admin")]
[Authorize(Roles = "SuperAdmin")]
public class AdminController : ControllerBase
{
    private readonly ISender _sender;

    public AdminController(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet("stats")]
    [ProducesResponseType(typeof(AdminStatsDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<AdminStatsDto>> GetStats(CancellationToken cancellationToken)
    {
        return Ok(await _sender.Send(new GetAdminStatsQuery(), cancellationToken));
    }

    [HttpGet("users")]
    [ProducesResponseType(typeof(List<AdminUserDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<AdminUserDto>>> GetUsers(CancellationToken cancellationToken)
    {
        return Ok(await _sender.Send(new GetAllUsersQuery(), cancellationToken));
    }

    public class UpdateRoleRequest
    {
        public UserRole Role { get; set; }
    }

    /// <summary>Change any user's role. Can't be used on your own account.</summary>
    [HttpPut("users/{id:guid}/role")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateUserRole(Guid id, UpdateRoleRequest request, CancellationToken cancellationToken)
    {
        await _sender.Send(new UpdateUserRoleCommand
        {
            UserId = id,
            NewRole = request.Role,
            RequestingUserId = GetCurrentUserId(),
        }, cancellationToken);

        return NoContent();
    }

    /// <summary>Ban (soft-delete) a user. Can't be used on your own account. No un-ban in this MVP.</summary>
    [HttpDelete("users/{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> BanUser(Guid id, CancellationToken cancellationToken)
    {
        await _sender.Send(new BanUserCommand { UserId = id, RequestingUserId = GetCurrentUserId() }, cancellationToken);

        return NoContent();
    }

    public class SetFeaturedRequest
    {
        public bool IsFeatured { get; set; }
    }

    /// <summary>Feature or unfeature any listing on the homepage — an editorial decision, not the agent's.</summary>
    [HttpPut("properties/{id:guid}/featured")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SetPropertyFeatured(Guid id, SetFeaturedRequest request, CancellationToken cancellationToken)
    {
        await _sender.Send(new SetPropertyFeaturedCommand { PropertyId = id, IsFeatured = request.IsFeatured }, cancellationToken);

        return NoContent();
    }

    /// <summary>General "contact us" submissions (see /api/contact), newest first.</summary>
    [HttpGet("contact-messages")]
    [ProducesResponseType(typeof(List<ContactMessageDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<ContactMessageDto>>> GetContactMessages(CancellationToken cancellationToken)
    {
        return Ok(await _sender.Send(new GetContactMessagesQuery(), cancellationToken));
    }

    [HttpPut("contact-messages/{id:guid}/read")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> MarkContactMessageRead(Guid id, CancellationToken cancellationToken)
    {
        await _sender.Send(new MarkContactMessageReadCommand { Id = id }, cancellationToken);
        return NoContent();
    }

    private Guid GetCurrentUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
