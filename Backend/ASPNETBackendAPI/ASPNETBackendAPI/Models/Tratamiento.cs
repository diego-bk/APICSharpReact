using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ASPNETBackendAPI.Models
{
    [Table("tratamientos")]
    public class Tratamiento
    {
        [Key]
        [Column("tratamiento_id")]
        public int TratamientoId { get; set; }

        [Column("cita_id")]
        public int CitaId { get; set; }
        public Cita Cita { get; set; }

        [Column("descripcion")]
        [Required]
        [MaxLength(300)]
        public string Descripcion { get; set; }

        [Column("costo")]
        public decimal Costo { get; set; }

        [Column("notas")]
        [MaxLength(300)]
        public string? Notas { get; set; }
    }
}
