using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ASPNETBackendAPI.Models;

namespace ASPNETBackendAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VeterinariosController : ControllerBase
    {
        private readonly AppDbContext _context;
        public VeterinariosController(AppDbContext context) => _context = context;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Veterinario>>> GetAll()
            => await _context.Veterinarios.ToListAsync();

        [HttpGet("{id}")]
        public async Task<ActionResult<Veterinario>> Get(int id)
        {
            var veterinario = await _context.Veterinarios.FindAsync(id);
            if (veterinario == null) return NotFound();
            return veterinario;
        }

        [HttpPost]
        public async Task<ActionResult<Veterinario>> Post(Veterinario veterinario)
        {
            _context.Veterinarios.Add(veterinario);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = veterinario.VeterinarioId }, veterinario);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, Veterinario veterinario)
        {
            if (id != veterinario.VeterinarioId) return BadRequest();
            _context.Entry(veterinario).State = EntityState.Modified;
            try { await _context.SaveChangesAsync(); }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Veterinarios.Any(e => e.VeterinarioId == id)) return NotFound();
                throw;
            }
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var veterinario = await _context.Veterinarios.FindAsync(id);
            if (veterinario == null) return NotFound();
            _context.Veterinarios.Remove(veterinario);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
