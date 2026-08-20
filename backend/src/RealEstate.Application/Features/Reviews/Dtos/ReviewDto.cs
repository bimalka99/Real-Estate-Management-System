namespace RealEstate.Application.Features.Reviews.Dtos;

public class ReviewDto
{
    public Guid Id { get; set; }

    public Guid AgentId { get; set; }

    public Guid ReviewerId { get; set; }

    public string ReviewerName { get; set; } = string.Empty;

    public string? ReviewerAvatarUrl { get; set; }

    public int Rating { get; set; }

    public string Comment { get; set; } = string.Empty;

    public DateTime CreatedAtUtc { get; set; }
}
