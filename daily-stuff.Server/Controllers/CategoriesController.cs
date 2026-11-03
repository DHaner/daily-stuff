using DailyStuff.Server.Data;
using DailyStuff.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DailyStuff.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<List<Category>> List() =>
        await db.Categories.AsNoTracking().OrderBy(c => c.Kind).ThenBy(c => c.Position).ThenBy(c => c.Label).ToListAsync();

    [HttpPost]
    public async Task<ActionResult<Category>> Create(CategoryRequest request)
    {
        // New categories go after the existing ones but before the "Otros" fallback (position 1000).
        var last = await db.Categories
            .Where(c => c.Kind == request.Kind && c.Position < 1000)
            .MaxAsync(c => (int?)c.Position);

        var category = new Category
        {
            Id = $"cat-{Guid.NewGuid():N}"[..12],
            Kind = request.Kind,
            Label = request.Label.Trim(),
            Icon = request.Icon,
            Color = request.Color,
            Position = (last ?? -1) + 1,
        };
        db.Categories.Add(category);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(List), category);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<Category>> Update(string id, CategoryRequest request)
    {
        var category = await db.Categories.FindAsync(id);
        if (category is null) return NotFound();

        category.Label = request.Label.Trim();
        category.Icon = request.Icon;
        category.Color = request.Color;
        await db.SaveChangesAsync();
        return category;
    }

    /// <summary>Deletes a category, moving everything that used it to the fallback of its kind.</summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var category = await db.Categories.FindAsync(id);
        if (category is null) return NotFound();
        if (id is Models.Categories.FallbackExpense or Models.Categories.FallbackIncome)
            return Problem("La categoría de respaldo no se puede eliminar.", statusCode: StatusCodes.Status409Conflict);

        var fallback = Models.Categories.FallbackFor(category.Kind);
        await using var tx = await db.Database.BeginTransactionAsync();
        await db.Transactions.Where(t => t.CategoryId == id).ExecuteUpdateAsync(s => s.SetProperty(t => t.CategoryId, fallback));
        db.Categories.Remove(category);
        await db.SaveChangesAsync();
        await tx.CommitAsync();
        return NoContent();
    }
}
