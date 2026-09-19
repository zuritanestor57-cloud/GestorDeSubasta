namespace Aplicacion.Interfaces
{
    public interface IAuctionFinalizerService
    {
        /// <summary>
        /// Procesa y finaliza las subastas expiradas, adjudicando el ganador o marcándolas como desiertas (RF-45, RF-46, RF-47, RF-48).
        /// </summary>
        /// <returns>Cantidad de subastas procesadas</returns>
        Task<int> ProcessExpiredAuctionsAsync();
    }
}
