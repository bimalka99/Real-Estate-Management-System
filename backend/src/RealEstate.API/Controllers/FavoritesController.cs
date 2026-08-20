using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RealEstate.Application.Features.Favorites.Commands.AddFavorite;
using RealEstate.Application.Features.Favorites.Commands.RemoveFavorite;
using RealEstate.Application.Features.Favorites.Queries.GetMyFavoriteIds;
using RealEstate.Application.Features.Favorites.Queries.GetMyFavorites;
using RealEstate.Application.Features.Properties.Dtos;

namespace RealEstate.API.Controllers;

[ApiController]
[Route("api/favorites")]
[Authorize]
public class FavoritesController : ControllerBase
{
    private readonly ISender _sender;

    public FavoritesController(ISender sender)
    {
        _sender = sender;
    }

    /// <summary>The current user's favorited properties, full detail.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<PropertyDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<PropertyDto>>> GetMine(CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetMyFavoritesQuery(GetCurrentUserId()), cancellationToken);
        return Ok(result);
    }

    /// <summary>Just the property ids the current user has favorited — cheap to call on every listing page.</summary>
    [HttpGet("ids")]
    [ProducesResponseType(typeof(List<Guid>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<Guid>>> GetMineIds(CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetMyFavoriteIdsQuery(GetCurrentUserId()), cancellationToken);
        return Ok(result);
    }

    /// <summary>Favorite a property. Idempotent — favoriting twice has no extra effect.</summary>
    [HttpPost("{propertyId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Add(Guid propertyId, CancellationToken cancellationToken)
    {
        await _sender.Send(new AddFavoriteCommand { UserId = GetCurrentUserId(), PropertyId = propertyId }, cancellationToken);
        return NoContent();
    }

    /// <summary>Unfavorite a property. Idempotent — removing a non-favorite has no effect.</summary>
    [HttpDelete("{propertyId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Remove(Guid propertyId, CancellationToken cancellationToken)
    {
        await _sender.Send(new RemoveFavoriteCommand { UserId = GetCurrentUserId(), PropertyId = propertyId }, cancellationToken);
        return NoContent();
    }

    private Guid GetCurrentUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
