using DailyStuff.Server.Data;
using DailyStuff.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.EntityFrameworkCore;

namespace DailyStuff.Server.Controllers;

[ApiController]
[Route("api/todo-tasks")]
public class TodoTasksController(AppDbContext db, FileStore files) : ControllerBase
{
    private const string FileFolder = "tasks";
    private const long MaxFileBytes = 25 * 1024 * 1024;

    [HttpGet]
    public async Task<List<TodoTask>> List() =>
        await db.TodoTasks.AsNoTracking()
            .OrderBy(t => t.DueDate == null).ThenBy(t => t.DueDate).ThenBy(t => t.CreatedAt)
            .ToListAsync();

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TodoTask>> Get(Guid id) =>
        await db.TodoTasks.AsNoTracking().FirstOrDefaultAsync(t => t.Id == id) is { } task ? task : NotFound();

    [HttpPost]
    public async Task<ActionResult<TodoTask>> Create(TodoTaskRequest request)
    {
        if (await MissingList(request.ListId)) return Problem("La lista no existe.", statusCode: StatusCodes.Status400BadRequest);

        var task = new TodoTask { Id = Guid.NewGuid(), CreatedAt = DateTime.UtcNow };
        Apply(task, request);
        db.TodoTasks.Add(task);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = task.Id }, task);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<TodoTask>> Update(Guid id, TodoTaskRequest request)
    {
        var task = await db.TodoTasks.FindAsync(id);
        if (task is null) return NotFound();
        if (await MissingList(request.ListId)) return Problem("La lista no existe.", statusCode: StatusCodes.Status400BadRequest);

        Apply(task, request);
        await db.SaveChangesAsync();
        return task;
    }

    [HttpPut("{id:guid}/completed")]
    public async Task<ActionResult<TodoTask>> SetCompleted(Guid id, [FromBody] bool completed)
    {
        var task = await db.TodoTasks.FindAsync(id);
        if (task is null) return NotFound();

        task.Completed = completed;
        await db.SaveChangesAsync();
        return task;
    }

    [HttpPut("{id:guid}/favorite")]
    public async Task<ActionResult<TodoTask>> SetFavorite(Guid id, [FromBody] bool favorite)
    {
        var task = await db.TodoTasks.FindAsync(id);
        if (task is null) return NotFound();

        task.Favorite = favorite;
        await db.SaveChangesAsync();
        return task;
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var task = await db.TodoTasks.FindAsync(id);
        if (task is null) return NotFound();

        db.TodoTasks.Remove(task);
        await db.SaveChangesAsync();
        files.Delete(FileFolder, task.FileKey);
        return NoContent();
    }

    [HttpGet("{id:guid}/file")]
    public async Task<IActionResult> GetFile(Guid id)
    {
        var task = await db.TodoTasks.AsNoTracking().FirstOrDefaultAsync(t => t.Id == id);
        var stream = task?.FileKey is null ? null : files.Open(FileFolder, task.FileKey);
        if (task is null || stream is null) return NotFound();

        var name = task.FileName ?? task.FileKey!;
        new FileExtensionContentTypeProvider().TryGetContentType(name, out var contentType);
        return File(stream, contentType ?? "application/octet-stream", name);
    }

    [HttpPut("{id:guid}/file")]
    [RequestSizeLimit(MaxFileBytes)]
    public async Task<ActionResult<TodoTask>> SetFile(Guid id, IFormFile file)
    {
        var task = await db.TodoTasks.FindAsync(id);
        if (task is null) return NotFound();

        var previous = task.FileKey;
        var name = Path.GetFileName(file.FileName);
        await using (var content = file.OpenReadStream())
            task.FileKey = await files.SaveAsync(FileFolder, name, content);
        task.FileName = name.Length > 255 ? name[..255] : name;
        await db.SaveChangesAsync();

        files.Delete(FileFolder, previous);
        return task;
    }

    [HttpDelete("{id:guid}/file")]
    public async Task<ActionResult<TodoTask>> DeleteFile(Guid id)
    {
        var task = await db.TodoTasks.FindAsync(id);
        if (task is null) return NotFound();

        var previous = task.FileKey;
        task.FileKey = null;
        task.FileName = null;
        await db.SaveChangesAsync();

        files.Delete(FileFolder, previous);
        return task;
    }

    private static void Apply(TodoTask task, TodoTaskRequest request)
    {
        task.Title = request.Title.Trim();
        task.Description = request.Description.Trim();
        task.ListId = request.ListId;
        task.DueDate = request.DueDate;
        task.ReminderAt = request.ReminderAt;
        task.Favorite = request.Favorite;
    }

    private async Task<bool> MissingList(Guid? listId) =>
        listId is not null && !await db.TodoLists.AnyAsync(l => l.Id == listId);
}
