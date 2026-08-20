using RealEstate.Domain.Common;

namespace RealEstate.Domain.Entities;

/// <summary>
/// A general "contact us" submission — not tied to any property or agent (see
/// Inquiry for that). Visible only to SuperAdmins via the admin dashboard; there's
/// no per-agent routing since it isn't about a specific listing.
/// </summary>
public class ContactMessage : BaseEntity
{
    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string? Phone { get; set; }

    public string Message { get; set; } = string.Empty;

    public bool IsRead { get; set; }
}
