using DailyStuff.Server.Data;
using DailyStuff.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.EntityFrameworkCore;

namespace DailyStuff.Server.Controllers;

[ApiController]
[Route("api/journal/entries")]
public class JournalEntriesController(AppDbContext db, FileStore files) : ControllerBase
{
    private const string PhotoFolder = "journal";
    private const long MaxPhotoBytes = 25 * 1024 * 1024;

    [HttpGet]
    public async Task<List<JournalEntryResponse>> List([FromQuery] DateOnly? from, [FromQuery] DateOnly? to)
    {
        var query = db.JournalEntries.AsNoTracking().AsQueryable();
        if (from is not null) query = query.Where(e => e.Date >= from);
        if (to is not null) query = query.Where(e => e.Date <= to);

        return await query
            .OrderByDescending(e => e.Date)
            .Select(e => new JournalEntryResponse(
                e.Id, e.Date, e.Mood, e.Note, e.Labels.Select(l => l.Id).ToList(), e.PhotoKey != null, e.CreatedAt, e.UpdatedAt))
            .ToListAsync();
    }

    /// <summary>Days that already have an entry, used to dot the calendar.</summary>
    [HttpGet("days")]
    public async Task<List<DateOnly>> Days() =>
        await db.JournalEntries.AsNoTracking().OrderByDescending(e => e.Date).Select(e => e.Date).ToListAsync();

    [HttpGet("{date}")]
    public async Task<ActionResult<JournalEntryResponse>> Get(DateOnly date)
    {
        var entry = await db.JournalEntries.AsNoTracking().Include(e => e.Labels).FirstOrDefaultAsync(e => e.Date == date);
        return entry is null ? NotFound() : ToResponse(entry);
    }

    /// <summary>A day holds at most one entry, so saving either creates it or overwrites the existing one.</summary>
    [HttpPut("{date}")]
    public async Task<ActionResult<JournalEntryResponse>> Save(DateOnly date, JournalEntryRequest request)
    {
        var labelIds = request.LabelIds.Distinct().ToList();
        var labels = await db.JournalLabels.Where(l => labelIds.Contains(l.Id)).ToListAsync();
        if (labels.Count != labelIds.Count) return Problem("Alguna etiqueta no existe.", statusCode: StatusCodes.Status400BadRequest);

        var entry = await db.JournalEntries.Include(e => e.Labels).FirstOrDefaultAsync(e => e.Date == date);
        var now = DateTime.UtcNow;
        if (entry is null)
        {
            entry = new JournalEntry { Id = Guid.NewGuid(), Date = date, CreatedAt = now };
            db.JournalEntries.Add(entry);
        }

        entry.Mood = request.Mood;
        entry.Note = request.Note.Trim();
        entry.Labels = labels;
        entry.UpdatedAt = now;
        await db.SaveChangesAsync();

        return ToResponse(entry);
    }

    [HttpDelete("{date}")]
    public async Task<IActionResult> Delete(DateOnly date)
    {
        var entry = await db.JournalEntries.FirstOrDefaultAsync(e => e.Date == date);
        if (entry is null) return NotFound();

        db.JournalEntries.Remove(entry);
        await db.SaveChangesAsync();
        files.Delete(PhotoFolder, entry.PhotoKey);
        return NoContent();
    }

    [HttpGet("{date}/photo")]
    public async Task<IActionResult> GetPhoto(DateOnly date)
    {
        var key = await db.JournalEntries.AsNoTracking().Where(e => e.Date == date).Select(e => e.PhotoKey).FirstOrDefaultAsync();
        var stream = key is null ? null : files.Open(PhotoFolder, key);
        if (stream is null) return NotFound();

        // The client appends the entry's updatedAt as `?v=`, so a given URL never changes.
        Response.Headers.CacheControl = "private, max-age=31536000, immutable";
        new FileExtensionContentTypeProvider().TryGetContentType(key!, out var contentType);
        return File(stream, contentType ?? "application/octet-stream");
    }

    [HttpPut("{date}/photo")]
    [RequestSizeLimit(MaxPhotoBytes)]
    public async Task<ActionResult<JournalEntryResponse>> SetPhoto(DateOnly date, IFormFile file)
    {
        if (!file.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
            return Problem("El archivo debe ser una imagen.", statusCode: StatusCodes.Status400BadRequest);

        var entry = await db.JournalEntries.Include(e => e.Labels).FirstOrDefaultAsync(e => e.Date == date);
        if (entry is null) return NotFound();

        var previous = entry.PhotoKey;
        await using (var content = file.OpenReadStream())
            entry.PhotoKey = await files.SaveAsync(PhotoFolder, file.FileName, content);
        entry.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        files.Delete(PhotoFolder, previous);
        return ToResponse(entry);
    }

    [HttpDelete("{date}/photo")]
    public async Task<ActionResult<JournalEntryResponse>> DeletePhoto(DateOnly date)
    {
        var entry = await db.JournalEntries.Include(e => e.Labels).FirstOrDefaultAsync(e => e.Date == date);
        if (entry is null) return NotFound();

        var previous = entry.PhotoKey;
        entry.PhotoKey = null;
        entry.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        files.Delete(PhotoFolder, previous);
        return ToResponse(entry);
    }

    private static JournalEntryResponse ToResponse(JournalEntry entry) => new(
        entry.Id, entry.Date, entry.Mood, entry.Note, entry.Labels.Select(l => l.Id).ToList(),
        entry.PhotoKey is not null, entry.CreatedAt, entry.UpdatedAt);
}
