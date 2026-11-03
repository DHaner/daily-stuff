namespace DailyStuff.Server.Data;

/// <summary>Stores uploaded files (journal photos, task attachments) on disk, under <c>Storage:Path</c>.</summary>
public class FileStore(IConfiguration configuration, IWebHostEnvironment environment)
{
    private string Root => Path.GetFullPath(configuration["Storage:Path"] ?? "uploads", environment.ContentRootPath);

    private string PathOf(string folder, string key) => Path.Combine(Root, folder, Path.GetFileName(key));

    /// <summary>Saves the stream under a new random key (keeping a sanitized extension) and returns the key.</summary>
    public async Task<string> SaveAsync(string folder, string originalName, Stream content)
    {
        var extension = Path.GetExtension(originalName).ToLowerInvariant();
        if (extension.Length > 8 || !extension.All(c => c == '.' || char.IsAsciiLetterOrDigit(c))) extension = "";

        var key = $"{Guid.NewGuid():N}{extension}";
        Directory.CreateDirectory(Path.Combine(Root, folder));
        await using var file = File.Create(PathOf(folder, key));
        await content.CopyToAsync(file);
        return key;
    }

    public FileStream? Open(string folder, string key)
    {
        var path = PathOf(folder, key);
        return File.Exists(path) ? File.OpenRead(path) : null;
    }

    public void Delete(string folder, string? key)
    {
        if (key is null) return;
        var path = PathOf(folder, key);
        if (File.Exists(path)) File.Delete(path);
    }
}
