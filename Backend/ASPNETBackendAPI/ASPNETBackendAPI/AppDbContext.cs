using Microsoft.EntityFrameworkCore;
using ASPNETBackendAPI.Models;

namespace ASPNETBackendAPI
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Cliente> Clientes { get; set; }
        public DbSet<Mascota> Mascotas { get; set; }
        public DbSet<Veterinario> Veterinarios { get; set; }
        public DbSet<Cita> Citas { get; set; }
        public DbSet<Tratamiento> Tratamientos { get; set; }
        public DbSet<Usuario> Usuarios { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Relación Cliente-Mascota 1-N
            modelBuilder.Entity<Mascota>()
                .HasOne(m => m.Cliente)
                .WithMany(c => c.Mascotas)
                .HasForeignKey(m => m.ClienteId);

            // Relación Mascota-Cita 1-N
            modelBuilder.Entity<Cita>()
                .HasOne(c => c.Mascota)
                .WithMany(m => m.Citas)
                .HasForeignKey(c => c.MascotaId);

            // Relación Veterinario-Cita 1-N
            modelBuilder.Entity<Cita>()
                .HasOne(c => c.Veterinario)
                .WithMany(v => v.Citas)
                .HasForeignKey(c => c.VeterinarioId);

            // Relación Cita-Tratamiento 1-N
            modelBuilder.Entity<Tratamiento>()
                .HasOne(t => t.Cita)
                .WithMany(c => c.Tratamientos)
                .HasForeignKey(t => t.CitaId);

            // Relación Veterinario-Usuario 1-N (opcional)
            modelBuilder.Entity<Usuario>()
                .HasOne(u => u.Veterinario)
                .WithMany(v => v.Usuarios)
                .HasForeignKey(u => u.VeterinarioId)
                .IsRequired(false);
        }
    }
}
