using Aplicacion.DTOs;

namespace Aplicacion.Interfaces
{
    public interface IAdminService
    {
        /// <summary>
        /// Crea una nueva categoría de productos (RF-41).
        /// </summary>
        Task<CategoryDto> CreateCategoryAsync(CreateCategoryDto dto);

        /// <summary>
        /// Edita una categoría existente (RF-41).
        /// </summary>
        Task<CategoryDto?> UpdateCategoryAsync(int id, CreateCategoryDto dto);

        /// <summary>
        /// Elimina una categoría si no posee subastas asociadas (RF-41).
        /// </summary>
        Task<bool> DeleteCategoryAsync(int id);

        /// <summary>
        /// Suspende o habilita a un usuario en la plataforma (RF-42).
        /// </summary>
        Task<UserDto?> ToggleUserStatusAsync(int userId, bool isActive, string? reason = null);

        /// <summary>
        /// Modera y cancela una subasta que incumple políticas del sistema, liberando escrow si existían ofertas (RF-43).
        /// </summary>
        Task<bool> ModerateAuctionAsync(int auctionId, string reason);

        /// <summary>
        /// Obtiene el historial inmutable de auditoría del sistema (RF-44).
        /// </summary>
        Task<IEnumerable<AuditLogDto>> GetAuditLogsAsync();

        /// <summary>
        /// Obtiene el historial global de transacciones financieras realizadas (RF-44).
        /// </summary>
        Task<IEnumerable<AdminTransactionDto>> GetTransactionsAsync();
    }
}
