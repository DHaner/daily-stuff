using DailyStuff.Server.Data;
using DailyStuff.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DailyStuff.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransactionsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<List<Transaction>> List(
        [FromQuery] DateOnly? from, [FromQuery] DateOnly? to, [FromQuery] TransactionKind? kind, [FromQuery] string? categoryId)
    {
        var query = db.Transactions.AsNoTracking();
        if (from is not null) query = query.Where(t => t.Date >= from);
        if (to is not null) query = query.Where(t => t.Date <= to);
        if (kind is not null) query = query.Where(t => t.Kind == kind);
        if (!string.IsNullOrEmpty(categoryId)) query = query.Where(t => t.CategoryId == categoryId);
        return await query.OrderByDescending(t => t.Date).ThenByDescending(t => t.CreatedAt).ToListAsync();
    }

    /// <summary>Days that already have a transaction of the given kind, used to dot the calendar.</summary>
    [HttpGet("days")]
    public async Task<List<DateOnly>> Days([FromQuery] TransactionKind? kind)
    {
        var query = db.Transactions.AsNoTracking().AsQueryable();
        if (kind is not null) query = query.Where(t => t.Kind == kind);
        return await query.Select(t => t.Date).Distinct().OrderByDescending(d => d).ToListAsync();
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<Transaction>> Get(Guid id) =>
        await db.Transactions.AsNoTracking().FirstOrDefaultAsync(t => t.Id == id) is { } t ? t : NotFound();

    [HttpPost]
    public async Task<ActionResult<Transaction>> Create(TransactionRequest request)
    {
        if (await InvalidCategory(request) is { } error) return error;

        var now = DateTime.UtcNow;
        var transaction = new Transaction { Id = Guid.NewGuid(), CreatedAt = now, UpdatedAt = now };
        Apply(transaction, request);
        db.Transactions.Add(transaction);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = transaction.Id }, transaction);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<Transaction>> Update(Guid id, TransactionRequest request)
    {
        var transaction = await db.Transactions.FindAsync(id);
        if (transaction is null) return NotFound();
        if (await InvalidCategory(request) is { } error) return error;

        Apply(transaction, request);
        transaction.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return transaction;
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await db.Transactions.Where(t => t.Id == id).ExecuteDeleteAsync();
        return deleted == 0 ? NotFound() : NoContent();
    }

    private static void Apply(Transaction transaction, TransactionRequest request)
    {
        transaction.Kind = request.Kind;
        transaction.Concept = request.Concept.Trim();
        transaction.Amount = request.Amount;
        transaction.Description = request.Description.Trim();
        transaction.CategoryId = request.CategoryId;
        transaction.Date = request.Date;
    }

    private async Task<ActionResult?> InvalidCategory(TransactionRequest request)
    {
        var exists = await db.Categories.AnyAsync(c => c.Id == request.CategoryId && c.Kind == request.Kind);
        return exists ? null : Problem("La categoría no existe o no corresponde al tipo de movimiento.", statusCode: StatusCodes.Status400BadRequest);
    }
}
