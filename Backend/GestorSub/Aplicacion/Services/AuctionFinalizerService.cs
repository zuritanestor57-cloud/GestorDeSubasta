using Aplicacion.Interfaces;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Aplicacion.Services
{
    public class AuctionFinalizerService : IAuctionFinalizerService
    {
        private readonly IApplicationDbContext _context;
        private readonly IWalletService _walletService;
        private readonly IAuctionEventNotifier _notifier;
        private readonly ILogger<AuctionFinalizerService> _logger;

        public AuctionFinalizerService(
            IApplicationDbContext context,
            IWalletService walletService,
            IAuctionEventNotifier notifier,
            ILogger<AuctionFinalizerService> logger)
        {
            _context = context;
            _walletService = walletService;
            _notifier = notifier;
            _logger = logger;
        }

        public async Task<int> ProcessExpiredAuctionsAsync()
        {
            var now = DateTime.Now;

            // RF-18: Iniciar automáticamente subastas
            var auctionsToStart = await _context.Auctions
                .Where(a => a.Status == AuctionStatus.Published && a.StartDate <= now && a.EndDate > now)
                .ToListAsync();

            foreach (var auction in auctionsToStart)
            {
                auction.Status = AuctionStatus.Active;
                auction.Version += 1;
            }

            if (auctionsToStart.Count > 0)
            {
                // Simple cambio de estado, sin movimiento de fondos: no requiere transacción explícita.
                await _context.SaveChangesAsync();

                foreach (var auction in auctionsToStart)
                {
                    await _notifier.NotifyAuctionStartedAsync(auction.Id, new DTOs.AuctionStartedMessageDto
                    {
                        AuctionId = auction.Id,
                        StartedAt = now
                    });
                }
            }

            // RF-45: Seleccionar subastas publicadas/activas cuyo tiempo haya expirado
            var expiredAuctions = await _context.Auctions
                .Include(a => a.Bids)
                .Include(a => a.User)
                .Where(a => (a.Status == AuctionStatus.Published || a.Status == AuctionStatus.Active) && a.EndDate <= now)
                .ToListAsync();

            if (!expiredAuctions.Any() && !auctionsToStart.Any())
            {
                return 0;
            }

            int processedCount = auctionsToStart.Count;

            foreach (var auction in expiredAuctions)
            {
                var highestBid = auction.Bids?
                    .OrderByDescending(b => b.Amount)
                    .ThenBy(b => b.CreatedAt)
                    .FirstOrDefault();

                // 2.3: la liquidación de cada subasta (débito comprador + acreditación vendedor +
                // cambio de estado + auditoría) corre en su propio bloque transaccional atómico,
                // para que un fallo en una subasta no arrastre rollback a las demás del lote.
                using var transaction = await _context.BeginTransactionAsync();
                try
                {
                    if (highestBid != null)
                    {
                        // RF-46: Adjudicar la subasta al postor con la oferta más alta y liquidar fondos
                        auction.Status = AuctionStatus.Finished;
                        auction.Version += 1;

                        // Transferir fondos retenidos del postor ganador al vendedor
                        await _walletService.TransferFundsAsync(highestBid.UserId, auction.UserId, highestBid.Amount);

                        // RF-48: Registrar en la bitácora de auditoría
                        _context.AuditLogs.Add(new AuditLog
                        {
                            Event = "SUBASTA_FINALIZADA_CON_GANADOR",
                            Details = $"Subasta ID {auction.Id} finalizada y adjudicada exitosamente. Ganador Usuario ID {highestBid.UserId} con puja de ${highestBid.Amount:F2}. Vendedor Usuario ID {auction.UserId}.",
                            CreatedAt = now,
                            UserId = highestBid.UserId
                        });
                    }
                    else
                    {
                        // RF-47: Marcar subasta como desierta cuando finaliza sin ofertas
                        auction.Status = AuctionStatus.Deserted;
                        auction.Version += 1;

                        // RF-48: Registrar auditoría de subasta desierta
                        _context.AuditLogs.Add(new AuditLog
                        {
                            Event = "SUBASTA_MARCADA_DESIERTA",
                            Details = $"Subasta ID {auction.Id} finalizada sin ofertas registradas. Marcada como desierta.",
                            CreatedAt = now,
                            UserId = auction.UserId
                        });
                    }

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    _logger.LogError(ex, "[Worker] Falló la liquidación de la subasta ID {AuctionId}; se realizó rollback y se reintentará en el próximo ciclo.", auction.Id);
                    continue;
                }

                // Notificar fin de subasta
                await _notifier.NotifyAuctionEndedAsync(auction.Id, new DTOs.AuctionEndedMessageDto
                {
                    AuctionId = auction.Id,
                    EndedAt = now
                });

                processedCount++;
            }

            return processedCount;
        }
    }
}
