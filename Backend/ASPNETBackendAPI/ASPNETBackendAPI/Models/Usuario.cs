using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ASPNETBackendAPI.Models
{
    [Table("usuarios")]
    public class Usuario
    {
        [Key]
        [Column("usuario_id")]
        public int UsuarioId { get; set; }

        [Column("nombre_usuario")]
        [Required]
        [MaxLength(50)]
        public string NombreUsuario { get; set; }

        [Column("contrasena")]
        [Required]
        [MaxLength(200)]
        public string Contrasena { get; set; }

        [Column("rol")]
        [Required]
        [MaxLength(30)]
        public string Rol { get; set; }

        [Column("veterinario_id")]
        public int? VeterinarioId { get; set; }
        public Veterinario? Veterinario { get; set; }
    }
}
