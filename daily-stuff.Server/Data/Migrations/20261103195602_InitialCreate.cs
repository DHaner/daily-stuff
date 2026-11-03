using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace DailyStuff.Server.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    Kind = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    Label = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    Icon = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    Color = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: false),
                    Position = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "JournalEntries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    Mood = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    Note = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JournalEntries", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "JournalLabels",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(24)", maxLength: 24, nullable: false),
                    Icon = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    Color = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JournalLabels", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TodoLists",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Icon = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    Color = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TodoLists", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Transactions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Kind = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    Concept = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(14,2)", precision: 14, scale: 2, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    CategoryId = table.Column<string>(type: "text", nullable: false),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Transactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Transactions_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "JournalEntryJournalLabel",
                columns: table => new
                {
                    JournalEntryId = table.Column<Guid>(type: "uuid", nullable: false),
                    LabelsId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JournalEntryJournalLabel", x => new { x.JournalEntryId, x.LabelsId });
                    table.ForeignKey(
                        name: "FK_JournalEntryJournalLabel_JournalEntries_JournalEntryId",
                        column: x => x.JournalEntryId,
                        principalTable: "JournalEntries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_JournalEntryJournalLabel_JournalLabels_LabelsId",
                        column: x => x.LabelsId,
                        principalTable: "JournalLabels",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TodoTasks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    ListId = table.Column<Guid>(type: "uuid", nullable: true),
                    DueDate = table.Column<DateOnly>(type: "date", nullable: true),
                    Completed = table.Column<bool>(type: "boolean", nullable: false),
                    Favorite = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TodoTasks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TodoTasks_TodoLists_ListId",
                        column: x => x.ListId,
                        principalTable: "TodoLists",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "Color", "Icon", "Kind", "Label", "Position" },
                values: new object[,]
                {
                    { "comida", "#f97316", "restaurant", "Expense", "Comida", 0 },
                    { "compras", "#a855f7", "shopping", "Expense", "Compras", 3 },
                    { "educacion", "#22c55e", "school", "Expense", "Educación", 7 },
                    { "freelance", "#0ea5e9", "laptop", "Income", "Freelance", 1 },
                    { "hogar", "#14b8a6", "home", "Expense", "Hogar", 2 },
                    { "inversiones", "#a855f7", "trending", "Income", "Inversiones", 2 },
                    { "negocio", "#f97316", "work", "Income", "Negocio", 3 },
                    { "ocio", "#ec4899", "movie", "Expense", "Ocio", 5 },
                    { "otros", "#94a3b8", "more", "Expense", "Otros", 1000 },
                    { "otros_ingreso", "#94a3b8", "bank", "Income", "Otros", 1000 },
                    { "reembolso", "#eab308", "refresh", "Income", "Reembolso", 5 },
                    { "regalo", "#ec4899", "gift", "Income", "Regalo", 4 },
                    { "salario", "#22c55e", "wallet", "Income", "Salario", 0 },
                    { "salud", "#ef4444", "health", "Expense", "Salud", 4 },
                    { "servicios", "#eab308", "bolt", "Expense", "Servicios", 6 },
                    { "transporte", "#0ea5e9", "car", "Expense", "Transporte", 1 }
                });

            migrationBuilder.InsertData(
                table: "JournalLabels",
                columns: new[] { "Id", "Color", "CreatedAt", "Icon", "Name" },
                values: new object[,]
                {
                    { new Guid("0f1c0a00-0000-4000-8000-000000000001"), "#3b82f6", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "work", "Trabajo" },
                    { new Guid("0f1c0a00-0000-4000-8000-000000000002"), "#22c55e", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "fitness", "Ejercicio" },
                    { new Guid("0f1c0a00-0000-4000-8000-000000000003"), "#ec4899", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "home", "Familia" },
                    { new Guid("0f1c0a00-0000-4000-8000-000000000004"), "#f59e0b", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "party", "Amigos" },
                    { new Guid("0f1c0a00-0000-4000-8000-000000000005"), "#8b5cf6", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "moon", "Descanso" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_JournalEntries_Date",
                table: "JournalEntries",
                column: "Date",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_JournalEntryJournalLabel_LabelsId",
                table: "JournalEntryJournalLabel",
                column: "LabelsId");

            migrationBuilder.CreateIndex(
                name: "IX_TodoTasks_DueDate",
                table: "TodoTasks",
                column: "DueDate");

            migrationBuilder.CreateIndex(
                name: "IX_TodoTasks_ListId",
                table: "TodoTasks",
                column: "ListId");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_CategoryId",
                table: "Transactions",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_Date",
                table: "Transactions",
                column: "Date");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "JournalEntryJournalLabel");

            migrationBuilder.DropTable(
                name: "TodoTasks");

            migrationBuilder.DropTable(
                name: "Transactions");

            migrationBuilder.DropTable(
                name: "JournalEntries");

            migrationBuilder.DropTable(
                name: "JournalLabels");

            migrationBuilder.DropTable(
                name: "TodoLists");

            migrationBuilder.DropTable(
                name: "Categories");
        }
    }
}
