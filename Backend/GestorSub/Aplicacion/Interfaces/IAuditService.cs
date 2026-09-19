namespace Aplicacion.Interfaces
{
    public interface IAuditService
    {
        /// <summary>
        /// Registra en la bitácora de auditoría un evento del sistema (RF-48).
        Task LogAsync(string @event, string details, int userId);
    }
}
