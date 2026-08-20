using RealEstate.Application.Features.Agents.Dtos;

namespace RealEstate.Application.Features.Agencies.Dtos;

public class AgencyDto
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? LogoUrl { get; set; }

    public string? Description { get; set; }

    public string? Website { get; set; }

    public string? PhoneNumber { get; set; }

    public string? Email { get; set; }

    public int AgentCount { get; set; }

    public int ListingCount { get; set; }
}

/// <summary>Fuller version used for a single agency's own profile page — includes its roster.</summary>
public class AgencyDetailDto : AgencyDto
{
    public List<AgentDto> Agents { get; set; } = new();
}
