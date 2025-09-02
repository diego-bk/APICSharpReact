using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ASPNETBackendAPI.Models;

namespace ASPNETBackendAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MascotasController : ControllerBase
    {
        private readonly AppDbContext _context;
        public MascotasController(AppDbContext context) => _context = context;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Mascota>>> GetAll()
            => await _context.Mascotas.Include(m => m.Cliente).ToListAsync();

        [HttpGet("{id}")]
        public async Task<ActionResult<Mascota>> Get(int id)
        {
            var mascota = await _context.Mascotas.Include(m => m.Cliente).FirstOrDefaultAsync(m => m.MascotaId == id);
            if (mascota == null) return NotFound();
            return mascota;
        }

        [HttpPost]
        public async Task<ActionResult<Mascota>> Post(Mascota mascota)
        {
            // Validar si el ClienteId proporcionado existe
            var clienteExistente = await _context.Clientes.FindAsync(mascota.ClienteId);
            if (clienteExistente == null)
            {
                return BadRequest(new { Error = "El ClienteId proporcionado no existe." });
            }


            _context.Mascotas.Add(mascota);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = mascota.MascotaId }, mascota);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, Mascota mascota)
        {
            if (id != mascota.MascotaId) return BadRequest();
            _context.Entry(mascota).State = EntityState.Modified;
            try { await _context.SaveChangesAsync(); }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Mascotas.Any(e => e.MascotaId == id)) return NotFound();
                throw;
            }
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var mascota = await _context.Mascotas.FindAsync(id);
            if (mascota == null) return NotFound();
            _context.Mascotas.Remove(mascota);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
