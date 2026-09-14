using Aplicacion.DTOs;

namespace Aplicacion.Interfaces
{
    public interface IAuctionService
    {
        /// <summary>
        /// Registra y publica una nueva subasta con producto y validación de precios y fechas (RF-11 a RF-16).
        /// </summary>
        Task<AuctionDetailDto> CreateAuctionAsync(CreateAuctionDto createDto);

        /// <summary>
        /// Obtiene el detalle completo de una subasta por su ID.
        /// </summary>
        Task<AuctionDetailDto?> GetAuctionByIdAsync(int id);

        /// <summary>
        /// Obtiene la lista general de subastas creadas.
        /// </summary>
        Task<IEnumerable<AuctionDetailDto>> GetAllAuctionsAsync();

        /// <summary>
        /// Cancela una publicación únicamente si no posee ofertas registradas (RF-17).
        /// </summary>
        Task<bool> CancelAuctionAsync(int auctionId, int sellerUserId);

        /// <summary>
        /// Obtiene las categorías de productos disponibles.
        /// </summary>
        Task<IEnumerable<CategoryDto>> GetCategoriesAsync();
    }
}
