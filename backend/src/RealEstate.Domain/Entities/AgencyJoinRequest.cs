using RealEstate.Domain.Common;

namespace RealEstate.Domain.Entities;

public enum AgencyJoinRequestStatus
{
    Pending = 0,
    Approved = 1,
    Rejected = 2
}

/// <summary>
/// A request from an Agent to join an Agency, awaiting that agency's AgencyAdmin to
/// approve or reject it — see JoinAgencyCommand. Replaces the earlier self-serve
/// "join instantly" behavior.
/// </summary>
public class AgencyJoinRequest : BaseEntity
{
    public Guid AgencyId { get; set; }

    public Agency Agency { get; set; } = null!;

    public Guid UserId { get; set; }

    public User User { get; set; } = null!;

    public AgencyJoinRequestStatus Status { get; set; } = AgencyJoinRequestStatus.Pending;

    public DateTime? RespondedAtUtc { get; set; }
}
