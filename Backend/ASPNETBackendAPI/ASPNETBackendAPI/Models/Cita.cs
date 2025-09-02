using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ASPNETBackendAPI.Models
{
    [Table("citas")]
    public class Cita
    {
        [Key]
        [Column("cita_id")]
        public int CitaId { get; set; }

        [Column("mascota_id")]
        public int MascotaId { get; set; }
        public Mascota Mascota { get; set; }

        [Column("veterinario_id")]
        public int VeterinarioId { get; set; }
        public Veterinario Veterinario { get; set; }

        [Column("fecha_hora")]
        public DateTime FechaHora { get; set; }

        [Column("estado")]
        [Required]
        [MaxLength(20)]
        public string Estado { get; set; }

        public ICollection<Tratamiento> Tratamientos { get; set; } = new List<Tratamiento>();
    }
}
