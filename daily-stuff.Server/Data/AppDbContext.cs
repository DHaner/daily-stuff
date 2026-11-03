using DailyStuff.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace DailyStuff.Server.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<JournalLabel> JournalLabels => Set<JournalLabel>();
    public DbSet<JournalEntry> JournalEntries => Set<JournalEntry>();
    public DbSet<TodoList> TodoLists => Set<TodoList>();
    public DbSet<TodoTask> TodoTasks => Set<TodoTask>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Category>(e =>
        {
            e.Property(x => x.Kind).HasConversion<string>().HasMaxLength(16);
            e.Property(x => x.Label).HasMaxLength(40);
            e.Property(x => x.Icon).HasMaxLength(40);
            e.Property(x => x.Color).HasMaxLength(7);
            e.HasData(SeedData.Categories);
        });

        modelBuilder.Entity<Transaction>(e =>
        {
            e.Property(x => x.Kind).HasConversion<string>().HasMaxLength(16);
            e.Property(x => x.Concept).HasMaxLength(120);
            e.Property(x => x.Description).HasMaxLength(1000);
            e.Property(x => x.Amount).HasPrecision(14, 2);
            e.HasOne<Category>().WithMany().HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.Restrict);
            e.HasIndex(x => x.Date);
        });

        modelBuilder.Entity<JournalLabel>(e =>
        {
            e.Property(x => x.Name).HasMaxLength(24);
            e.Property(x => x.Icon).HasMaxLength(40);
            e.Property(x => x.Color).HasMaxLength(7);
            e.HasData(SeedData.JournalLabels);
        });

        modelBuilder.Entity<JournalEntry>(e =>
        {
            e.Property(x => x.Mood).HasConversion<string>().HasMaxLength(16);
            e.Property(x => x.PhotoKey).HasMaxLength(80);
            e.HasIndex(x => x.Date).IsUnique();
            e.HasMany(x => x.Labels).WithMany();
        });

        modelBuilder.Entity<TodoList>(e =>
        {
            e.Property(x => x.Name).HasMaxLength(30);
            e.Property(x => x.Icon).HasMaxLength(40);
            e.Property(x => x.Color).HasMaxLength(7);
        });

        modelBuilder.Entity<TodoTask>(e =>
        {
            e.Property(x => x.Title).HasMaxLength(200);
            e.Property(x => x.Description).HasMaxLength(2000);
            e.Property(x => x.ReminderAt).HasMaxLength(16);
            e.Property(x => x.FileName).HasMaxLength(255);
            e.Property(x => x.FileKey).HasMaxLength(80);
            e.HasOne<TodoList>().WithMany().HasForeignKey(x => x.ListId).OnDelete(DeleteBehavior.SetNull);
            e.HasIndex(x => x.DueDate);
        });
    }
}
