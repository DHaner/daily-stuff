using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DailyStuff.Server.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddReminderAndAttachments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FileKey",
                table: "TodoTasks",
                type: "character varying(80)",
                maxLength: 80,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FileName",
                table: "TodoTasks",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReminderAt",
                table: "TodoTasks",
                type: "character varying(16)",
                maxLength: 16,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PhotoKey",
                table: "JournalEntries",
                type: "character varying(80)",
                maxLength: 80,
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: "comida",
                column: "Icon",
                value: "UtensilsCrossed");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: "compras",
                column: "Icon",
                value: "ShoppingBag");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: "educacion",
                column: "Icon",
                value: "GraduationCap");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: "freelance",
                column: "Icon",
                value: "Laptop");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: "hogar",
                column: "Icon",
                value: "House");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: "inversiones",
                column: "Icon",
                value: "TrendingUp");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: "negocio",
                column: "Icon",
                value: "Briefcase");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: "ocio",
                column: "Icon",
                value: "Clapperboard");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: "otros",
                column: "Icon",
                value: "Ellipsis");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: "otros_ingreso",
                column: "Icon",
                value: "Landmark");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: "reembolso",
                column: "Icon",
                value: "RefreshCcw");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: "regalo",
                column: "Icon",
                value: "Gift");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: "salario",
                column: "Icon",
                value: "Wallet");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: "salud",
                column: "Icon",
                value: "HeartPulse");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: "servicios",
                column: "Icon",
                value: "Zap");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: "transporte",
                column: "Icon",
                value: "Car");

            migrationBuilder.UpdateData(
                table: "JournalLabels",
                keyColumn: "Id",
                keyValue: new Guid("0f1c0a00-0000-4000-8000-000000000001"),
                column: "Icon",
                value: "Briefcase");

            migrationBuilder.UpdateData(
                table: "JournalLabels",
                keyColumn: "Id",
                keyValue: new Guid("0f1c0a00-0000-4000-8000-000000000002"),
                column: "Icon",
                value: "Dumbbell");

            migrationBuilder.UpdateData(
                table: "JournalLabels",
                keyColumn: "Id",
                keyValue: new Guid("0f1c0a00-0000-4000-8000-000000000003"),
                column: "Icon",
                value: "House");

            migrationBuilder.UpdateData(
                table: "JournalLabels",
                keyColumn: "Id",
                keyValue: new Guid("0f1c0a00-0000-4000-8000-000000000004"),
                column: "Icon",
                value: "PartyPopper");

            migrationBuilder.UpdateData(
                table: "JournalLabels",
                keyColumn: "Id",
                keyValue: new Guid("0f1c0a00-0000-4000-8000-000000000005"),
                column: "Icon",
                value: "Moon");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FileKey",
                table: "TodoTasks");

            migrationBuilder.DropColumn(
                name: "FileName",
                table: "TodoTasks");

            migrationBuilder.DropColumn(
                name: "ReminderAt",
                table: "TodoTasks");

            migrationBuilder.DropColumn(
                name: "PhotoKey",
                table: "JournalEntries");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: "comida",
                column: "Icon",
                value: "restaurant");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: "compras",
                column: "Icon",
                value: "shopping");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: "educacion",
                column: "Icon",
                value: "school");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: "freelance",
                column: "Icon",
                value: "laptop");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: "hogar",
                column: "Icon",
                value: "home");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: "inversiones",
                column: "Icon",
                value: "trending");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: "negocio",
                column: "Icon",
                value: "work");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: "ocio",
                column: "Icon",
                value: "movie");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: "otros",
                column: "Icon",
                value: "more");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: "otros_ingreso",
                column: "Icon",
                value: "bank");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: "reembolso",
                column: "Icon",
                value: "refresh");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: "regalo",
                column: "Icon",
                value: "gift");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: "salario",
                column: "Icon",
                value: "wallet");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: "salud",
                column: "Icon",
                value: "health");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: "servicios",
                column: "Icon",
                value: "bolt");

            migrationBuilder.UpdateData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: "transporte",
                column: "Icon",
                value: "car");

            migrationBuilder.UpdateData(
                table: "JournalLabels",
                keyColumn: "Id",
                keyValue: new Guid("0f1c0a00-0000-4000-8000-000000000001"),
                column: "Icon",
                value: "work");

            migrationBuilder.UpdateData(
                table: "JournalLabels",
                keyColumn: "Id",
                keyValue: new Guid("0f1c0a00-0000-4000-8000-000000000002"),
                column: "Icon",
                value: "fitness");

            migrationBuilder.UpdateData(
                table: "JournalLabels",
                keyColumn: "Id",
                keyValue: new Guid("0f1c0a00-0000-4000-8000-000000000003"),
                column: "Icon",
                value: "home");

            migrationBuilder.UpdateData(
                table: "JournalLabels",
                keyColumn: "Id",
                keyValue: new Guid("0f1c0a00-0000-4000-8000-000000000004"),
                column: "Icon",
                value: "party");

            migrationBuilder.UpdateData(
                table: "JournalLabels",
                keyColumn: "Id",
                keyValue: new Guid("0f1c0a00-0000-4000-8000-000000000005"),
                column: "Icon",
                value: "moon");
        }
    }
}
