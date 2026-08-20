using RealEstate.Domain.Common;

namespace RealEstate.Domain.Entities;

/// <summary>A rating + comment a client leaves for an agent they've worked with.</summary>
public class Review : BaseEntity
{
    public Guid AgentId { get; set; }

    public User Agent { get; set; } = null!;

    public Guid ReviewerId { get; set; }

    public User Reviewer { get; set; } = null!;

    /// <summary>1-5, enforced both app-side (FluentValidation) and DB-side (check constraint).</summary>
    public int Rating { get; set; }

    public string Comment { get; set; } = string.Empty;
}
