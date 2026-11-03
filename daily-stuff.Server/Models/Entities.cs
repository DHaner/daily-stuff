using System.Text.Json.Serialization;

namespace DailyStuff.Server.Models;

public enum TransactionKind
{
    Expense,
    Income,
}

public enum Mood
{
    Good,
    Normal,
    Meh,
    Bad,
    Awful,
}

public class Category
{
    /// <summary>Slug such as <c>comida</c>; see <see cref="Categories"/> for the fallbacks.</summary>
    public string Id { get; set; } = "";
    public TransactionKind Kind { get; set; }
    public string Label { get; set; } = "";
    /// <summary>Lucide icon name, e.g. <c>UtensilsCrossed</c>; clients fall back to a generic icon for names they do not know.</summary>
    public string Icon { get; set; } = "";
    /// <summary>Hex color, e.g. <c>#3b82f6</c>.</summary>
    public string Color { get; set; } = "";
    public int Position { get; set; }
}

public static class Categories
{
    public const string FallbackExpense = "otros";
    public const string FallbackIncome = "otros_ingreso";

    public static string FallbackFor(TransactionKind kind) =>
        kind == TransactionKind.Expense ? FallbackExpense : FallbackIncome;
}

/// <summary>An expense or an income, told apart by <see cref="Kind"/>.</summary>
public class Transaction
{
    public Guid Id { get; set; }
    public TransactionKind Kind { get; set; }
    public string Concept { get; set; } = "";
    public decimal Amount { get; set; }
    public string Description { get; set; } = "";
    public string CategoryId { get; set; } = "";
    public DateOnly Date { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class JournalLabel
{
    public Guid Id { get; set; }
    public string Name { get; set; } = "";
    public string Icon { get; set; } = "";
    public string Color { get; set; } = "";
    public DateTime CreatedAt { get; set; }
}

/// <summary>One entry per day.</summary>
public class JournalEntry
{
    public Guid Id { get; set; }
    public DateOnly Date { get; set; }
    public Mood Mood { get; set; }
    public string Note { get; set; } = "";
    public List<JournalLabel> Labels { get; set; } = [];
    /// <summary>Stored file name of the entry photo (see <c>FileStore</c>), if any.</summary>
    public string? PhotoKey { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class TodoList
{
    public Guid Id { get; set; }
    public string Name { get; set; } = "";
    public string Icon { get; set; } = "";
    public string Color { get; set; } = "";
    public DateTime CreatedAt { get; set; }
}

public class TodoTask
{
    public Guid Id { get; set; }
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
    public Guid? ListId { get; set; }
    public DateOnly? DueDate { get; set; }
    /// <summary>Local date-time of the reminder, <c>yyyy-MM-ddTHH:mm</c>. Notifications are scheduled by the device.</summary>
    public string? ReminderAt { get; set; }
    /// <summary>Original name of the attached file.</summary>
    public string? FileName { get; set; }
    /// <summary>Stored file name of the attachment (see <c>FileStore</c>).</summary>
    [JsonIgnore] public string? FileKey { get; set; }
    public bool HasFile => FileKey is not null;
    public bool Completed { get; set; }
    public bool Favorite { get; set; }
    public DateTime CreatedAt { get; set; }
}
