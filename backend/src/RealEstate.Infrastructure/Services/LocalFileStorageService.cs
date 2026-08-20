using RealEstate.Application.Common.Interfaces;

namespace RealEstate.Infrastructure.Services;

/// <summary>
/// Saves files to disk under {webRootPath}/uploads/properties. Deliberately takes a
/// plain path string rather than IWebHostEnvironment, so Infrastructure doesn't need
/// an ASP.NET Core hosting reference — the API layer resolves the real path once at
/// startup (see DependencyInjection.AddInfrastructure).
/// </summary>
public class LocalFileStorageService : IFileStorageService
{
    private readonly string _webRootPath;

    public LocalFileStorageService(string webRootPath)
    {
        _webRootPath = webRootPath;
    }

    public async Task<string> SaveAsync(byte[] content, string fileName, string contentType, CancellationToken cancellationToken)
    {
        var extension = Path.GetExtension(fileName);
        var safeFileName = $"{Guid.NewGuid()}{extension}";

        var folder = Path.Combine(_webRootPath, "uploads", "properties");
        Directory.CreateDirectory(folder);

        var fullPath = Path.Combine(folder, safeFileName);
        await File.WriteAllBytesAsync(fullPath, content, cancellationToken);

        // Forward slashes regardless of OS — this becomes a URL path, not a filesystem path.
        return $"/uploads/properties/{safeFileName}";
    }

    public void Delete(string url)
    {
        var relativePath = url.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
        var fullPath = Path.Combine(_webRootPath, relativePath);

        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
        }
    }
}
