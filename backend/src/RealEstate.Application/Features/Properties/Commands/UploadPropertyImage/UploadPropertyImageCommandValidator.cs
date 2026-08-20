using FluentValidation;

namespace RealEstate.Application.Features.Properties.Commands.UploadPropertyImage;

public class UploadPropertyImageCommandValidator : AbstractValidator<UploadPropertyImageCommand>
{
    private static readonly string[] AllowedContentTypes =
    {
        "image/jpeg", "image/png", "image/webp", "image/gif",
    };

    private const int MaxSizeBytes = 8 * 1024 * 1024; // 8MB

    public UploadPropertyImageCommandValidator()
    {
        RuleFor(x => x.PropertyId).NotEmpty();

        RuleFor(x => x.Content)
            .Must(c => c.Length > 0).WithMessage("The uploaded file is empty.")
            .Must(c => c.Length <= MaxSizeBytes).WithMessage("Images must be 8MB or smaller.");

        RuleFor(x => x.ContentType)
            .Must(ct => AllowedContentTypes.Contains(ct))
            .WithMessage("Only JPEG, PNG, WEBP, and GIF images are allowed.");
    }
}
