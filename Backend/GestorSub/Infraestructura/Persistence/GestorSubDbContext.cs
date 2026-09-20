using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace Infraestructura.Persistence
{
    internal class GestorSubDbContext : DbContext
    {
        public GestorSubDbContext(DbContextOptions<GestorSubDbContext> options) : base(options)
        {
            /// un borrador sin implementar, simplemente  
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            // Aquí después vas a configurar las relaciones
        }
    }
}
