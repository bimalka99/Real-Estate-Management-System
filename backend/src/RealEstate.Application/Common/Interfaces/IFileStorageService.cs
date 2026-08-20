namespace RealEstate.Application.Common.Interfaces;

/// <summary>
/// Abstraction over wherever uploaded files actually live. Current implementation
/// (see Infrastructure/Services/LocalFileStorageService) writes to local disk under
/// wwwroot/uploads — fine for local dev, but not production-scalable (ephemeral /
/// doesn't share across instances). Swapping to cloud storage (e.g. Cloudinary, S3,
/// Azure Blob) later only means writing a new implementation of this interface.
/// </summary>
public interface IFileStorageService
{
    /// <summary>Saves the content and returns the public URL it can be served from.</summary>
    Task<string> SaveAsync(byte[] content, string fileName, string contentType, CancellationToken cancellationToken);

    /// <summary>Best-effort delete — should not throw if the file is already gone.</summary>
    void Delete(string url);
}
