using DailyStuff.Server.Data;
using DailyStuff.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DailyStuff.Server.Controllers;

[ApiController]
[Route("api/todo-lists")]
public class TodoListsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<List<TodoList>> List() =>
        await db.TodoLists.AsNoTracking().OrderBy(l => l.CreatedAt).ToListAsync();

    [HttpPost]
    public async Task<ActionResult<TodoList>> Create(TodoListRequest request)
    {
        var list = new TodoList
        {
            Id = Guid.NewGuid(),
            Name = request.Name.Trim(),
            Icon = request.Icon,
            Color = request.Color,
            CreatedAt = DateTime.UtcNow,
        };
        db.TodoLists.Add(list);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(List), list);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<TodoList>> Update(Guid id, TodoListRequest request)
    {
        var list = await db.TodoLists.FindAsync(id);
        if (list is null) return NotFound();

        list.Name = request.Name.Trim();
        list.Icon = request.Icon;
        list.Color = request.Color;
        await db.SaveChangesAsync();
        return list;
    }

    /// <summary>Tasks of a deleted list are kept; they just stop belonging to a list.</summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var list = await db.TodoLists.FindAsync(id);
        if (list is null) return NotFound();

        await using var tx = await db.Database.BeginTransactionAsync();
        await db.TodoTasks.Where(t => t.ListId == id).ExecuteUpdateAsync(s => s.SetProperty(t => t.ListId, (Guid?)null));
        db.TodoLists.Remove(list);
        await db.SaveChangesAsync();
        await tx.CommitAsync();
        return NoContent();
    }
}
