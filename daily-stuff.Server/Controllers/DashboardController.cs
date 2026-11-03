using System.Globalization;
using DailyStuff.Server.Data;
using DailyStuff.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DailyStuff.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController(AppDbContext db) : ControllerBase
{
    private const int TrendMonths = 6;

    /// <param name="month"><c>yyyy-MM</c>; defaults to the current month.</param>
    [HttpGet]
    public async Task<ActionResult<DashboardResponse>> Get([FromQuery] string? month)
    {
        var today = DateOnly.FromDateTime(DateTime.Now);
        var first = new DateOnly(today.Year, today.Month, 1);
        if (month is not null)
        {
            if (!DateOnly.TryParseExact(month + "-01", "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out first))
                return Problem("El mes debe tener el formato yyyy-MM.", statusCode: StatusCodes.Status400BadRequest);
        }
        var last = first.AddMonths(1).AddDays(-1);

        var monthTransactions = db.Transactions.AsNoTracking().Where(t => t.Date >= first && t.Date <= last);

        var totals = await monthTransactions
            .GroupBy(t => t.Kind)
            .Select(g => new { Kind = g.Key, Total = g.Sum(t => t.Amount) })
            .ToListAsync();
        var income = totals.FirstOrDefault(t => t.Kind == TransactionKind.Income)?.Total ?? 0;
        var expense = totals.FirstOrDefault(t => t.Kind == TransactionKind.Expense)?.Total ?? 0;

        var expenseTotals = await monthTransactions
            .Where(t => t.Kind == TransactionKind.Expense)
            .GroupBy(t => t.CategoryId)
            .Select(g => new { CategoryId = g.Key, Amount = g.Sum(t => t.Amount) })
            .ToListAsync();
        var categories = await db.Categories.AsNoTracking().ToDictionaryAsync(c => c.Id);
        var byCategory = expenseTotals
            .Where(t => categories.ContainsKey(t.CategoryId))
            .Select(t => new CategoryTotal(t.CategoryId, categories[t.CategoryId].Label, categories[t.CategoryId].Color, t.Amount))
            .OrderByDescending(c => c.Amount)
            .ToList();

        var trendStart = first.AddMonths(-(TrendMonths - 1));
        var trendRows = await db.Transactions.AsNoTracking()
            .Where(t => t.Date >= trendStart && t.Date <= last)
            .GroupBy(t => new { t.Date.Year, t.Date.Month, t.Kind })
            .Select(g => new { g.Key.Year, g.Key.Month, g.Key.Kind, Total = g.Sum(t => t.Amount) })
            .ToListAsync();
        var trend = Enumerable.Range(0, TrendMonths).Select(i =>
        {
            var m = trendStart.AddMonths(i);
            decimal Sum(TransactionKind kind) =>
                trendRows.Where(r => r.Year == m.Year && r.Month == m.Month && r.Kind == kind).Sum(r => r.Total);
            return new MonthTrend(m.ToString("yyyy-MM", CultureInfo.InvariantCulture), Sum(TransactionKind.Income), Sum(TransactionKind.Expense));
        }).ToList();

        var recent = await monthTransactions
            .OrderByDescending(t => t.Date).ThenByDescending(t => t.CreatedAt)
            .Take(8)
            .ToListAsync();

        var pendingTasks = await db.TodoTasks.CountAsync(t => !t.Completed);
        var dueTasks = await db.TodoTasks.AsNoTracking()
            .Where(t => !t.Completed && t.DueDate != null && t.DueDate <= today)
            .OrderBy(t => t.DueDate).ThenBy(t => t.CreatedAt)
            .Take(6)
            .ToListAsync();

        var moods = await db.JournalEntries.AsNoTracking()
            .Where(e => e.Date >= first && e.Date <= last)
            .GroupBy(e => e.Mood)
            .Select(g => new MoodCount(g.Key, g.Count()))
            .ToListAsync();

        return new DashboardResponse(
            first.ToString("yyyy-MM", CultureInfo.InvariantCulture),
            income, expense, income - expense,
            byCategory, trend, recent,
            pendingTasks, dueTasks,
            moods.Sum(m => m.Count), moods);
    }
}
