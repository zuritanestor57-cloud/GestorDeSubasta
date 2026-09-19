using Aplicacion.Interfaces;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Aplicacion.Services
{
    public class AuctionFinalizerService : IAuctionFinalizerService
    {
        private readonly IApplicationDbContext _context;
        private readonly IWalletService _walletService;
        private readonly IAuditService _auditService;

        public AuctionFinalizerService(
            IApplicationDbContext context,
            IWalletService walletService,
            IAuditService auditService)
        {
            _context = context;
            _walletService = walletService;
            _auditService = auditService;
        }

        public async Task<int> ProcessExpiredAuctionsAsync()
        {
            var now = DateTime.Now;

            // RF-45: Seleccionar subastas publicadas cuyo tiempo haya expirado
            var expiredAuctions = await _context.Auctions
                .Include(a => a.Bids)
                .Include(a => a.User)
                .Where(a => a.Status == AuctionStatus.Published && a.EndDate <= now)
                .ToListAsync();

            if (!expiredAuctions.Any())
            {
                return 0;
            }

            int processedCount = 0;

            foreach (var auction in expiredAuctions)
            {
                var highestBid = auction.Bids?
                    .OrderByDescending(b => b.Amount)
                    .ThenBy(b => b.CreatedAt)
                    .FirstOrDefault();

                if (highestBid != null)
                {
                    // RF-46: Adjudicar la subasta al postor con la oferta más alta y liquidar fondos
                    auction.Status = AuctionStatus.Finished;
                    auction.Version += 1;

                    // Transferir fondos retenidos del postor ganador al vendedor
                    await _walletService.TransferFundsAsync(highestBid.UserId, auction.UserId, highestBid.Amount);

                    // RF-48: Registrar en la bitácora de auditoría
                    await _auditService.LogAsync(
                        "SUBASTA_FINALIZADA_CON_GANADOR",
                        $"Subasta ID {auction.Id} finalizada y adjudicada exitosamente. Ganador Usuario ID {highestBid.UserId} con puja de ${highestBid.Amount:F2}. Vendedor Usuario ID {auction.UserId}.",
                        highestBid.UserId
                    );
                }
                else
                {
                    // RF-47: Marcar subasta como desierta cuando finaliza sin ofertas
                    auction.Status = AuctionStatus.Deserted;
                    auction.Version += 1;

                    // RF-48: Registrar auditoría de subasta desierta
                    await _auditService.LogAsync(
                        "SUBASTA_MARCADA_DESIERTA",
                        $"Subasta ID {auction.Id} finalizada sin ofertas registradas. Marcada como desierta.",
                        auction.UserId
                    );
                }

                processedCount++;
            }

            await _context.SaveChangesAsync();
            return processedCount;
        }
    }
}
