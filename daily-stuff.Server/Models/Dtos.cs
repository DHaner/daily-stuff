using System.ComponentModel.DataAnnotations;

namespace DailyStuff.Server.Models;

public class CategoryRequest
{
    public TransactionKind Kind { get; set; }
    [Required, StringLength(40)] public string Label { get; set; } = "";
    [Required, StringLength(40)] public string Icon { get; set; } = "";
    [Required, RegularExpression("^#[0-9a-fA-F]{6}$")] public string Color { get; set; } = "";
}

public class TransactionRequest
{
    public TransactionKind Kind { get; set; }
    [Required, StringLength(120)] public string Concept { get; set; } = "";
    [Range(0, 999_999_999.99)] public decimal Amount { get; set; }
    [StringLength(1000)] public string Description { get; set; } = "";
    [Required] public string CategoryId { get; set; } = "";
    public DateOnly Date { get; set; }
}

public class JournalLabelRequest
{
    [Required, StringLength(24)] public string Name { get; set; } = "";
    [Required, StringLength(40)] public string Icon { get; set; } = "";
    [Required, RegularExpression("^#[0-9a-fA-F]{6}$")] public string Color { get; set; } = "";
}

public class JournalEntryRequest
{
    public Mood Mood { get; set; }
    [StringLength(10_000)] public string Note { get; set; } = "";
    public List<Guid> LabelIds { get; set; } = [];
}

public record JournalEntryResponse(
    Guid Id, DateOnly Date, Mood Mood, string Note, List<Guid> LabelIds, bool HasPhoto, DateTime CreatedAt, DateTime UpdatedAt);

public class TodoListRequest
{
    [Required, StringLength(30)] public string Name { get; set; } = "";
    [Required, StringLength(40)] public string Icon { get; set; } = "";
    [Required, RegularExpression("^#[0-9a-fA-F]{6}$")] public string Color { get; set; } = "";
}

public class TodoTaskRequest
{
    [Required, StringLength(200)] public string Title { get; set; } = "";
    [StringLength(2000)] public string Description { get; set; } = "";
    public Guid? ListId { get; set; }
    public DateOnly? DueDate { get; set; }
    [RegularExpression(@"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$")] public string? ReminderAt { get; set; }
    public bool Favorite { get; set; }
}

public record CategoryTotal(string CategoryId, string Label, string Color, decimal Amount);

public record MonthTrend(string Month, decimal Income, decimal Expense);

public record MoodCount(Mood Mood, int Count);

public record DashboardResponse(
    string Month,
    decimal Income,
    decimal Expense,
    decimal Balance,
    List<CategoryTotal> ExpensesByCategory,
    List<MonthTrend> Trend,
    List<Transaction> RecentTransactions,
    int PendingTasks,
    List<TodoTask> DueTasks,
    int JournalEntries,
    List<MoodCount> Moods);
