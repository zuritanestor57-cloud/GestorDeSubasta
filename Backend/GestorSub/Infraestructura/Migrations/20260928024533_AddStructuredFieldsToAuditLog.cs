using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infraestructura.Migrations
{
    /// <inheritdoc />
    public partial class AddStructuredFieldsToAuditLog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AdminUserId",
                table: "AuditLogs",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AuctionId",
                table: "AuditLogs",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Reason",
                table: "AuditLogs",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_AdminUserId",
                table: "AuditLogs",
                column: "AdminUserId");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_AuctionId",
                table: "AuditLogs",
                column: "AuctionId");

            migrationBuilder.AddForeignKey(
                name: "FK_AuditLogs_Auctions_AuctionId",
                table: "AuditLogs",
                column: "AuctionId",
                principalTable: "Auctions",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_AuditLogs_Users_AdminUserId",
                table: "AuditLogs",
                column: "AdminUserId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AuditLogs_Auctions_AuctionId",
                table: "AuditLogs");

            migrationBuilder.DropForeignKey(
                name: "FK_AuditLogs_Users_AdminUserId",
                table: "AuditLogs");

            migrationBuilder.DropIndex(
                name: "IX_AuditLogs_AdminUserId",
                table: "AuditLogs");

            migrationBuilder.DropIndex(
                name: "IX_AuditLogs_AuctionId",
                table: "AuditLogs");

            migrationBuilder.DropColumn(
                name: "AdminUserId",
                table: "AuditLogs");

            migrationBuilder.DropColumn(
                name: "AuctionId",
                table: "AuditLogs");

            migrationBuilder.DropColumn(
                name: "Reason",
                table: "AuditLogs");
        }
    }
}
