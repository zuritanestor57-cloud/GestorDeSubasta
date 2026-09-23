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
        /// Obtiene y filtra la lista general de subastas del catálogo según criterios de búsqueda, categoría, precio, estado y ordenamiento (RF-05 a RF-10).
        /// </summary>
        Task<IEnumerable<AuctionDetailDto>> GetAllAuctionsAsync(AuctionFilterDto? filter = null);

        /// <summary>
        /// Cancela una publicación únicamente si no posee ofertas registradas (RF-17).
        /// </summary>
        Task<bool> CancelAuctionAsync(int auctionId, int sellerUserId);

        /// <summary>
        /// Obtiene las categorías de productos disponibles.
        /// </summary>
        Task<IEnumerable<CategoryDto>> GetCategoriesAsync();

        /// <summary>
        /// Registra una nueva oferta económica con escrow automático y regla anti-sniping.
        /// </summary>
        Task<BidResultDto> PlaceBidAsync(int auctionId, CreateBidDto bidDto);

        /// <summary>
        /// Obtiene el historial de pujas de una subasta, ordenado de mayor a menor monto.
        /// </summary>
        Task<IEnumerable<BidDto>> GetBidsForAuctionAsync(int auctionId);
    }
}
