using RealEstate.Domain.Entities;

namespace RealEstate.Application.Features.Agencies.Dtos;

public class AgencyJoinRequestDto
{
    public Guid Id { get; set; }

    public Guid AgencyId { get; set; }

    public string AgencyName { get; set; } = string.Empty;

    public Guid UserId { get; set; }

    public string UserName { get; set; } = string.Empty;

    public string UserEmail { get; set; } = string.Empty;

    public AgencyJoinRequestStatus Status { get; set; }

    public DateTime CreatedAtUtc { get; set; }
}
