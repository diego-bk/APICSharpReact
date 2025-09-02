using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ASPNETBackendAPI.Models
{
    [Table("veterinarios")]
    public class Veterinario
    {
        [Key]
        [Column("veterinario_id")]
        public int VeterinarioId { get; set; }

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

        [Column("especialidad")]
        [MaxLength(80)]
        public string? Especialidad { get; set; }

        public ICollection<Cita> Citas { get; set; } = new List<Cita>();
        public ICollection<Usuario> Usuarios { get; set; } = new List<Usuario>();
    }
}
