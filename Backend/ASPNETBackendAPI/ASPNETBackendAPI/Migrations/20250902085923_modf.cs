using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ASPNETBackendAPI.Migrations
{
    /// <inheritdoc />
    public partial class modf : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_mascotas_clientes_cliente_id",
                table: "mascotas");

            migrationBuilder.AddForeignKey(
                name: "FK_mascotas_clientes_cliente_id",
                table: "mascotas",
                column: "cliente_id",
                principalTable: "clientes",
                principalColumn: "cliente_id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_mascotas_clientes_cliente_id",
                table: "mascotas");

            migrationBuilder.AddForeignKey(
                name: "FK_mascotas_clientes_cliente_id",
                table: "mascotas",
                column: "cliente_id",
                principalTable: "clientes",
                principalColumn: "cliente_id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
