using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StealthVault.Migrations
{
    /// <inheritdoc />
    public partial class Add_SecretType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "Secrets",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Type",
                table: "Secrets");
        }
    }
}
