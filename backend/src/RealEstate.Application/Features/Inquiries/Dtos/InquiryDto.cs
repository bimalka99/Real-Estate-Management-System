using RealEstate.Domain.Entities;

namespace RealEstate.Application.Features.Inquiries.Dtos;

public class InquiryDto
{
    public Guid Id { get; set; }

    public Guid PropertyId { get; set; }

    public string PropertyTitle { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string? Phone { get; set; }

    public string Message { get; set; } = string.Empty;

    public DateTime? PreferredViewingDate { get; set; }

    public InquiryStatus Status { get; set; }

    public DateTime CreatedAtUtc { get; set; }
}
