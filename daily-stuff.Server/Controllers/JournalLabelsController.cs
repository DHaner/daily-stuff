using DailyStuff.Server.Data;
using DailyStuff.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DailyStuff.Server.Controllers;

[ApiController]
[Route("api/journal/labels")]
public class JournalLabelsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<List<JournalLabel>> List() =>
        await db.JournalLabels.AsNoTracking().OrderBy(l => l.Name).ToListAsync();

    [HttpPost]
    public async Task<ActionResult<JournalLabel>> Create(JournalLabelRequest request)
    {
        var label = new JournalLabel
        {
            Id = Guid.NewGuid(),
            Name = request.Name.Trim(),
            Icon = request.Icon,
            Color = request.Color,
            CreatedAt = DateTime.UtcNow,
        };
        db.JournalLabels.Add(label);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(List), label);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<JournalLabel>> Update(Guid id, JournalLabelRequest request)
    {
        var label = await db.JournalLabels.FindAsync(id);
        if (label is null) return NotFound();

        label.Name = request.Name.Trim();
        label.Icon = request.Icon;
        label.Color = request.Color;
        await db.SaveChangesAsync();
        return label;
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var label = await db.JournalLabels.FindAsync(id);
        if (label is null) return NotFound();

        db.JournalLabels.Remove(label);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
