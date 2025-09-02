using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ASPNETBackendAPI.Models;

namespace ASPNETBackendAPI.Controllers
{
    public class TratamientoDto
    {
        public int? TratamientoId { get; set; }
        public int CitaId { get; set; }
        public string Descripcion { get; set; } = string.Empty;
        public decimal Costo { get; set; }
        public string? Notas { get; set; }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class TratamientosController : ControllerBase
    {
        private readonly AppDbContext _context;
        public TratamientosController(AppDbContext context) => _context = context;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetAll()
        {
            var tratamientos = await _context.Tratamientos
                .Include(t => t.Cita)
                .ThenInclude(c => c.Mascota)
                .ThenInclude(m => m.Cliente)
                .Include(t => t.Cita)
                .ThenInclude(c => c.Veterinario)
                .Select(t => new {
                    t.TratamientoId,
                    t.CitaId,
                    t.Descripcion,
                    t.Costo,
                    t.Notas,
                    Cita = new {
                        t.Cita.CitaId,
                        t.Cita.FechaHora,
                        t.Cita.Estado,
                        Mascota = new {
                            t.Cita.Mascota.MascotaId,
                            t.Cita.Mascota.Nombre,
                            Cliente = t.Cita.Mascota.Cliente != null ? new {
                                t.Cita.Mascota.Cliente.ClienteId,
                                t.Cita.Mascota.Cliente.NombreCompleto
                            } : null
                        },
                        Veterinario = new {
                            t.Cita.Veterinario.VeterinarioId,
                            t.Cita.Veterinario.NombreCompleto
                        }
                    }
                })
                .ToListAsync();
            
            return Ok(tratamientos);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<object>> Get(int id)
        {
            var tratamiento = await _context.Tratamientos
                .Include(t => t.Cita)
                .ThenInclude(c => c.Mascota)
                .ThenInclude(m => m.Cliente)
                .Include(t => t.Cita)
                .ThenInclude(c => c.Veterinario)
                .Where(t => t.TratamientoId == id)
                .Select(t => new {
                    t.TratamientoId,
                    t.CitaId,
                    t.Descripcion,
                    t.Costo,
                    t.Notas,
                    Cita = new {
                        t.Cita.CitaId,
                        t.Cita.FechaHora,
                        t.Cita.Estado,
                        Mascota = new {
                            t.Cita.Mascota.MascotaId,
                            t.Cita.Mascota.Nombre,
                            Cliente = t.Cita.Mascota.Cliente != null ? new {
                                t.Cita.Mascota.Cliente.ClienteId,
                                t.Cita.Mascota.Cliente.NombreCompleto
                            } : null
                        },
                        Veterinario = new {
                            t.Cita.Veterinario.VeterinarioId,
                            t.Cita.Veterinario.NombreCompleto
                        }
                    }
                })
                .FirstOrDefaultAsync();
                
            if (tratamiento == null) return NotFound();
            return Ok(tratamiento);
        }

        [HttpPost]
        public async Task<ActionResult<object>> Post(TratamientoDto tratamientoDto)
        {
            var tratamiento = new Tratamiento
            {
                CitaId = tratamientoDto.CitaId,
                Descripcion = tratamientoDto.Descripcion,
                Costo = tratamientoDto.Costo,
                Notas = tratamientoDto.Notas
            };

            _context.Tratamientos.Add(tratamiento);
            await _context.SaveChangesAsync();
            
            // Retornar el tratamiento con información completa
            var tratamientoResult = await _context.Tratamientos
                .Include(t => t.Cita)
                .ThenInclude(c => c.Mascota)
                .ThenInclude(m => m.Cliente)
                .Include(t => t.Cita)
                .ThenInclude(c => c.Veterinario)
                .Where(t => t.TratamientoId == tratamiento.TratamientoId)
                .Select(t => new {
                    t.TratamientoId,
                    t.CitaId,
                    t.Descripcion,
                    t.Costo,
                    t.Notas,
                    Cita = new {
                        t.Cita.CitaId,
                        t.Cita.FechaHora,
                        t.Cita.Estado,
                        Mascota = new {
                            t.Cita.Mascota.MascotaId,
                            t.Cita.Mascota.Nombre,
                            Cliente = t.Cita.Mascota.Cliente != null ? new {
                                t.Cita.Mascota.Cliente.ClienteId,
                                t.Cita.Mascota.Cliente.NombreCompleto
                            } : null
                        },
                        Veterinario = new {
                            t.Cita.Veterinario.VeterinarioId,
                            t.Cita.Veterinario.NombreCompleto
                        }
                    }
                })
                .FirstOrDefaultAsync();
                
            return CreatedAtAction(nameof(Get), new { id = tratamiento.TratamientoId }, tratamientoResult);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, TratamientoDto tratamientoDto)
        {
            if (tratamientoDto.TratamientoId.HasValue && id != tratamientoDto.TratamientoId.Value)
                return BadRequest();

            var tratamiento = await _context.Tratamientos.FindAsync(id);
            if (tratamiento == null) return NotFound();

            tratamiento.CitaId = tratamientoDto.CitaId;
            tratamiento.Descripcion = tratamientoDto.Descripcion;
            tratamiento.Costo = tratamientoDto.Costo;
            tratamiento.Notas = tratamientoDto.Notas;

            try 
            { 
                await _context.SaveChangesAsync(); 
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Tratamientos.Any(e => e.TratamientoId == id)) return NotFound();
                throw;
            }
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var tratamiento = await _context.Tratamientos.FindAsync(id);
            if (tratamiento == null) return NotFound();
            _context.Tratamientos.Remove(tratamiento);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
