using DailyStuff.Server.Models;

namespace DailyStuff.Server.Data;

/// <summary>Starter rows (the same ones the mobile app used to seed; icons are Lucide names) so the app is usable from day one.</summary>
public static class SeedData
{
    private static Category Cat(string id, TransactionKind kind, string label, string icon, string color, int position) =>
        new() { Id = id, Kind = kind, Label = label, Icon = icon, Color = color, Position = position };

    public static readonly Category[] Categories =
    [
        Cat("comida", TransactionKind.Expense, "Comida", "UtensilsCrossed", "#f97316", 0),
        Cat("transporte", TransactionKind.Expense, "Transporte", "Car", "#0ea5e9", 1),
        Cat("hogar", TransactionKind.Expense, "Hogar", "House", "#14b8a6", 2),
        Cat("compras", TransactionKind.Expense, "Compras", "ShoppingBag", "#a855f7", 3),
        Cat("salud", TransactionKind.Expense, "Salud", "HeartPulse", "#ef4444", 4),
        Cat("ocio", TransactionKind.Expense, "Ocio", "Clapperboard", "#ec4899", 5),
        Cat("servicios", TransactionKind.Expense, "Servicios", "Zap", "#eab308", 6),
        Cat("educacion", TransactionKind.Expense, "Educación", "GraduationCap", "#22c55e", 7),
        Cat(Models.Categories.FallbackExpense, TransactionKind.Expense, "Otros", "Ellipsis", "#94a3b8", 1000),
        Cat("salario", TransactionKind.Income, "Salario", "Wallet", "#22c55e", 0),
        Cat("freelance", TransactionKind.Income, "Freelance", "Laptop", "#0ea5e9", 1),
        Cat("inversiones", TransactionKind.Income, "Inversiones", "TrendingUp", "#a855f7", 2),
        Cat("negocio", TransactionKind.Income, "Negocio", "Briefcase", "#f97316", 3),
        Cat("regalo", TransactionKind.Income, "Regalo", "Gift", "#ec4899", 4),
        Cat("reembolso", TransactionKind.Income, "Reembolso", "RefreshCcw", "#eab308", 5),
        Cat(Models.Categories.FallbackIncome, TransactionKind.Income, "Otros", "Landmark", "#94a3b8", 1000),
    ];

    private static readonly DateTime SeedDate = new(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);

    private static JournalLabel Label(string id, string name, string icon, string color) =>
        new() { Id = Guid.Parse(id), Name = name, Icon = icon, Color = color, CreatedAt = SeedDate };

    public static readonly JournalLabel[] JournalLabels =
    [
        Label("0f1c0a00-0000-4000-8000-000000000001", "Trabajo", "Briefcase", "#3b82f6"),
        Label("0f1c0a00-0000-4000-8000-000000000002", "Ejercicio", "Dumbbell", "#22c55e"),
        Label("0f1c0a00-0000-4000-8000-000000000003", "Familia", "House", "#ec4899"),
        Label("0f1c0a00-0000-4000-8000-000000000004", "Amigos", "PartyPopper", "#f59e0b"),
        Label("0f1c0a00-0000-4000-8000-000000000005", "Descanso", "Moon", "#8b5cf6"),
    ];
}
