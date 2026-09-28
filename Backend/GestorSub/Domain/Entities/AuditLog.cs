using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class AuditLog
    {
        public int Id { get; set; }
        public string Event { get; set; }
        public string Details { get; set; }
        public DateTime CreatedAt { get; set; }

        public int UserId { get; set; }
        public User User { get; set; }

        // Estructurados aparte del texto libre de Details, para poder
        // mostrarlos como columnas propias en el panel de administración.
        public int? AuctionId { get; set; }
        public Auction? Auction { get; set; }

        public string? Reason { get; set; }

        // Quién ejecutó la acción administrativa (moderar, suspender). Null en
        // eventos automáticos del sistema (worker, pujas, etc.).
        public int? AdminUserId { get; set; }
        public User? AdminUser { get; set; }
    }
}
