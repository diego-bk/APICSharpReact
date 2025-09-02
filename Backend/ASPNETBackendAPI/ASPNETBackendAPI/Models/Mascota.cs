using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ASPNETBackendAPI.Models
{
    [Table("mascotas")]
    public class Mascota
    {
        [Key]
        [Column("mascota_id")]
        public int MascotaId { get; set; }

        [Column("cliente_id")]
        public int ClienteId { get; set; }

        [Column("nombre")]
        [Required]
        [MaxLength(80)]
        public string Nombre { get; set; }

        [Column("especie")]
        [Required]
        [MaxLength(40)]
        public string Especie { get; set; }

        [Column("fecha_nacimiento")]
        public DateTime? FechaNacimiento { get; set; }

        public ICollection<Cita> Citas { get; set; } = new List<Cita>();

        [System.Text.Json.Serialization.JsonIgnore]
        public Cliente? Cliente { get; set; }
    }
}
