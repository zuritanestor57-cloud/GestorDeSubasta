using Aplicacion.Interfaces;
using Domain.Entities;

namespace Aplicacion.Services
{
    public class AuditService : IAuditService
    {
        private readonly IApplicationDbContext _context;

        public AuditService(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task LogAsync(string @event, string details, int userId)
        {
            var log = new AuditLog
            {
                Event = @event,
                Details = details,
                CreatedAt = DateTime.UtcNow,
                UserId = userId
            };

            _context.AuditLogs.Add(log);
            await _context.SaveChangesAsync();
        }
    }
}
