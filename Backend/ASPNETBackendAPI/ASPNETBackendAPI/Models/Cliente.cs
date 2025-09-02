using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ASPNETBackendAPI.Models
{
    [Table("clientes")]
    public class Cliente
    {
        [Key]
        [Column("cliente_id")]
        public int ClienteId { get; set; }

        [Column("nombre_completo")]
        [Required]
        [MaxLength(120)]
        public string NombreCompleto { get; set; }

        [Column("telefono")]
        [MaxLength(30)]
        public string? Telefono { get; set; }

        [Column("email")]
        [MaxLength(120)]
        public string? Email { get; set; }

        [Column("direccion")]
        [MaxLength(200)]
        public string? Direccion { get; set; }

        public ICollection<Mascota> Mascotas { get; set; } = new List<Mascota>();
    }
}
