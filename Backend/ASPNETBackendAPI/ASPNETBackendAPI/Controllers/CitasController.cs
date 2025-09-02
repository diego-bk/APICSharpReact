using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ASPNETBackendAPI.Models;

namespace ASPNETBackendAPI.Controllers
{
    public class CitaDto
    {
        public int? CitaId { get; set; }
        public int MascotaId { get; set; }
        public int VeterinarioId { get; set; }
        public DateTime FechaHora { get; set; }
        public string Estado { get; set; } = "Programada";
    }

    [ApiController]
    [Route("api/[controller]")]
    public class CitasController : ControllerBase
    {
        private readonly AppDbContext _context;
        public CitasController(AppDbContext context) => _context = context;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetAll()
        {
            var citas = await _context.Citas
                .Include(c => c.Mascota)
                .ThenInclude(m => m.Cliente)
                .Include(c => c.Veterinario)
                .Select(c => new {
                    c.CitaId,
                    c.MascotaId,
                    c.VeterinarioId,
                    c.FechaHora,
                    c.Estado,
                    Mascota = new {
                        c.Mascota.MascotaId,
                        c.Mascota.Nombre,
                        Cliente = c.Mascota.Cliente != null ? new {
                            c.Mascota.Cliente.ClienteId,
                            c.Mascota.Cliente.NombreCompleto
                        } : null
                    },
                    Veterinario = new {
                        c.Veterinario.VeterinarioId,
                        c.Veterinario.NombreCompleto
                    }
                })
                .ToListAsync();
            
            return Ok(citas);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<object>> Get(int id)
        {
            var cita = await _context.Citas
                .Include(c => c.Mascota)
                .ThenInclude(m => m.Cliente)
                .Include(c => c.Veterinario)
                .Where(c => c.CitaId == id)
                .Select(c => new {
                    c.CitaId,
                    c.MascotaId,
                    c.VeterinarioId,
                    c.FechaHora,
                    c.Estado,
                    Mascota = new {
                        c.Mascota.MascotaId,
                        c.Mascota.Nombre,
                        Cliente = c.Mascota.Cliente != null ? new {
                            c.Mascota.Cliente.ClienteId,
                            c.Mascota.Cliente.NombreCompleto
                        } : null
                    },
                    Veterinario = new {
                        c.Veterinario.VeterinarioId,
                        c.Veterinario.NombreCompleto
                    }
                })
                .FirstOrDefaultAsync();
                
            if (cita == null) return NotFound();
            return Ok(cita);
        }

        [HttpPost]
        public async Task<ActionResult<object>> Post(CitaDto citaDto)
        {
            var cita = new Cita
            {
                MascotaId = citaDto.MascotaId,
                VeterinarioId = citaDto.VeterinarioId,
                FechaHora = citaDto.FechaHora,
                Estado = citaDto.Estado ?? "Programada"
            };

            _context.Citas.Add(cita);
            await _context.SaveChangesAsync();
            
            // Retornar solo los datos necesarios sin referencias cíclicas
            var citaResult = await _context.Citas
                .Include(c => c.Mascota)
                .ThenInclude(m => m.Cliente)
                .Include(c => c.Veterinario)
                .Where(c => c.CitaId == cita.CitaId)
                .Select(c => new {
                    c.CitaId,
                    c.MascotaId,
                    c.VeterinarioId,
                    c.FechaHora,
                    c.Estado,
                    Mascota = new {
                        c.Mascota.MascotaId,
                        c.Mascota.Nombre,
                        Cliente = c.Mascota.Cliente != null ? new {
                            c.Mascota.Cliente.ClienteId,
                            c.Mascota.Cliente.NombreCompleto
                        } : null
                    },
                    Veterinario = new {
                        c.Veterinario.VeterinarioId,
                        c.Veterinario.NombreCompleto
                    }
                })
                .FirstOrDefaultAsync();
                
            return CreatedAtAction(nameof(Get), new { id = cita.CitaId }, citaResult);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, CitaDto citaDto)
        {
            if (citaDto.CitaId.HasValue && id != citaDto.CitaId.Value) 
                return BadRequest();

            var cita = await _context.Citas.FindAsync(id);
            if (cita == null) return NotFound();

            cita.MascotaId = citaDto.MascotaId;
            cita.VeterinarioId = citaDto.VeterinarioId;
            cita.FechaHora = citaDto.FechaHora;
            cita.Estado = citaDto.Estado ?? "Programada";

            try 
            { 
                await _context.SaveChangesAsync(); 
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Citas.Any(e => e.CitaId == id)) return NotFound();
                throw;
            }
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var cita = await _context.Citas.FindAsync(id);
            if (cita == null) return NotFound();
            _context.Citas.Remove(cita);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
