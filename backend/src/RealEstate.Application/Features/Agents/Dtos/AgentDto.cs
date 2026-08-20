namespace RealEstate.Application.Features.Agents.Dtos;

public class AgentDto
{
    public Guid Id { get; set; }

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string? PhoneNumber { get; set; }

    public string? AvatarUrl { get; set; }

    public string? Bio { get; set; }

    public Guid? AgencyId { get; set; }

    public string? AgencyName { get; set; }

    public int ListingCount { get; set; }

    public double? AverageRating { get; set; }

    public int ReviewCount { get; set; }
}
