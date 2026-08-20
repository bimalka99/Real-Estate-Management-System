using RealEstate.Domain.Common;

namespace RealEstate.Domain.Entities;

public enum InquiryStatus
{
    New = 0,
    Contacted = 1,
    ViewingScheduled = 2,
    Closed = 3
}

/// <summary>
/// A lead/message sent by a (prospective) client about a property, e.g. a
/// contact-agent form submission or a request to schedule a viewing.
/// </summary>
public class Inquiry : BaseEntity
{
    public Guid PropertyId { get; set; }

    public Property Property { get; set; } = null!;

    /// <summary>
    /// The registered user who sent the inquiry, if they were logged in.
    /// </summary>
    public Guid? SenderId { get; set; }

    public User? Sender { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string? Phone { get; set; }

    public string Message { get; set; } = string.Empty;

    public DateTime? PreferredViewingDate { get; set; }

    public InquiryStatus Status { get; set; } = InquiryStatus.New;
}
