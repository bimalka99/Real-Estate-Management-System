using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RealEstate.Application.Common.Models;
using RealEstate.Application.Features.Properties.Commands.CreateProperty;
using RealEstate.Application.Features.Properties.Commands.DeleteProperty;
using RealEstate.Application.Features.Properties.Commands.DeletePropertyImage;
using RealEstate.Application.Features.Properties.Commands.SetCoverPropertyImage;
using RealEstate.Application.Features.Properties.Commands.UpdateProperty;
using RealEstate.Application.Features.Properties.Commands.UploadPropertyImage;
using RealEstate.Application.Features.Properties.Dtos;
using RealEstate.Application.Features.Properties.Queries.GetProperties;
using RealEstate.Application.Features.Properties.Queries.GetPropertyById;
using RealEstate.Domain.Enums;

namespace RealEstate.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PropertiesController : ControllerBase
{
    private readonly ISender _sender;

    public PropertiesController(ISender sender)
    {
        _sender = sender;
    }

    /// <summary>
    /// Search and browse property listings with optional filters and pagination.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedList<PropertyDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PaginatedList<PropertyDto>>> GetProperties(
        [FromQuery] string? city,
        [FromQuery] PropertyType? type,
        [FromQuery] ListingType? listingType,
        [FromQuery] PropertyStatus? status,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        [FromQuery] int? minBedrooms,
        [FromQuery] bool? isFeatured,
        [FromQuery] Guid? agentId,
        [FromQuery] Guid? agencyId,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 12,
        CancellationToken cancellationToken = default)
    {
        var result = await _sender.Send(new GetPropertiesQuery
        {
            City = city,
            Type = type,
            ListingType = listingType,
            Status = status,
            MinPrice = minPrice,
            MaxPrice = maxPrice,
            MinBedrooms = minBedrooms,
            IsFeatured = isFeatured,
            AgentId = agentId,
            AgencyId = agencyId,
            PageNumber = pageNumber,
            PageSize = pageSize
        }, cancellationToken);

        return Ok(result);
    }

    /// <summary>
    /// Get the full detail of a single property listing.
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(PropertyDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PropertyDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var property = await _sender.Send(new GetPropertyByIdQuery(id), cancellationToken);

        return property is null ? NotFound() : Ok(property);
    }

    /// <summary>
    /// Create a new property listing. Requires an Agent, AgencyAdmin or SuperAdmin token —
    /// the listing is created under the calling agent's own identity, regardless of
    /// whatever agentId is present in the request body.
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Agent,AgencyAdmin,SuperAdmin")]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<Guid>> Create(CreatePropertyCommand command, CancellationToken cancellationToken)
    {
        command.AgentId = GetCurrentUserId();

        var id = await _sender.Send(command, cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id }, id);
    }

    /// <summary>
    /// Update an existing property listing. Only the agent who owns the listing may edit it.
    /// </summary>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Agent,AgencyAdmin,SuperAdmin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, UpdatePropertyCommand command, CancellationToken cancellationToken)
    {
        command.Id = id;
        command.RequestingUserId = GetCurrentUserId();
        command.RequestingUserRole = GetCurrentUserRole();

        await _sender.Send(command, cancellationToken);

        return NoContent();
    }

    /// <summary>
    /// Delete (soft-delete) a property listing. Only the agent who owns the listing (or a SuperAdmin, moderating) may delete it.
    /// </summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Agent,AgencyAdmin,SuperAdmin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _sender.Send(new DeletePropertyCommand
        {
            Id = id,
            RequestingUserId = GetCurrentUserId(),
            RequestingUserRole = GetCurrentUserRole(),
        }, cancellationToken);

        return NoContent();
    }

    /// <summary>
    /// Upload a new image for a listing. The first image uploaded automatically
    /// becomes the cover photo. Only the owning agent may add images.
    /// </summary>
    [HttpPost("{id:guid}/images")]
    [Authorize(Roles = "Agent,AgencyAdmin,SuperAdmin")]
    [RequestSizeLimit(10_000_000)]
    [ProducesResponseType(typeof(PropertyImageDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PropertyImageDto>> UploadImage(Guid id, IFormFile? file, CancellationToken cancellationToken)
    {
        if (file is null || file.Length == 0)
        {
            return BadRequest(new { title = "No file was uploaded.", status = StatusCodes.Status400BadRequest });
        }

        await using var memoryStream = new MemoryStream();
        await file.CopyToAsync(memoryStream, cancellationToken);

        var dto = await _sender.Send(new UploadPropertyImageCommand
        {
            PropertyId = id,
            RequestingUserId = GetCurrentUserId(),
            Content = memoryStream.ToArray(),
            FileName = file.FileName,
            ContentType = file.ContentType,
        }, cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id }, dto);
    }

    /// <summary>
    /// Delete an image from a listing. Only the owning agent may remove images.
    /// </summary>
    [HttpDelete("{id:guid}/images/{imageId:guid}")]
    [Authorize(Roles = "Agent,AgencyAdmin,SuperAdmin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteImage(Guid id, Guid imageId, CancellationToken cancellationToken)
    {
        await _sender.Send(new DeletePropertyImageCommand
        {
            PropertyId = id,
            ImageId = imageId,
            RequestingUserId = GetCurrentUserId(),
        }, cancellationToken);

        return NoContent();
    }

    /// <summary>
    /// Set which image is the listing's cover photo. Only the owning agent may change this.
    /// </summary>
    [HttpPut("{id:guid}/images/{imageId:guid}/cover")]
    [Authorize(Roles = "Agent,AgencyAdmin,SuperAdmin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SetCoverImage(Guid id, Guid imageId, CancellationToken cancellationToken)
    {
        await _sender.Send(new SetCoverPropertyImageCommand
        {
            PropertyId = id,
            ImageId = imageId,
            RequestingUserId = GetCurrentUserId(),
        }, cancellationToken);

        return NoContent();
    }

    private Guid GetCurrentUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.Parse(value!);
    }

    private UserRole GetCurrentUserRole()
    {
        var value = User.FindFirstValue(ClaimTypes.Role);
        return Enum.Parse<UserRole>(value!);
    }
}
