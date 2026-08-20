using RealEstate.Domain.Enums;

namespace RealEstate.Application.Features.Admin.Dtos;

public class AdminUserDto
{
    public Guid Id { get; set; }

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public UserRole Role { get; set; }

    public bool IsEmailVerified { get; set; }

    public string? AgencyName { get; set; }

    public DateTime CreatedAtUtc { get; set; }
}

public class AdminStatsDto
{
    public int TotalUsers { get; set; }

    public int TotalAgents { get; set; }

    public int TotalClients { get; set; }

    public int TotalProperties { get; set; }

    public int TotalAgencies { get; set; }

    public int TotalInquiries { get; set; }

    public int TotalReviews { get; set; }
}
