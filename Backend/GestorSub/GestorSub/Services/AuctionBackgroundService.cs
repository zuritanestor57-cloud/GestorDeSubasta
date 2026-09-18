using Aplicacion.Interfaces;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace GestorSub.Services
{
    public class AuctionBackgroundService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<AuctionBackgroundService> _logger;

        public AuctionBackgroundService(IServiceProvider serviceProvider, ILogger<AuctionBackgroundService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Servicio en segundo plano para verificación de subastas iniciado.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ProcessExpiredAuctionsAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error al procesar el cierre automático de subastas.");
                }

                // Ejecutar verificación periódica cada 30 segundos
                await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
            }
        }

        private async Task ProcessExpiredAuctionsAsync()
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
                var walletService = scope.ServiceProvider.GetRequiredService<IWalletService>();

                var now = DateTime.Now;

                // Subastas publicadas cuya fecha límite ya venció
                var expiredAuctions = await context.Auctions
                    .Include(a => a.Bids)
                    .Include(a => a.Product)
                    .Where(a => a.Status == AuctionStatus.Published && a.EndDate <= now)
                    .ToListAsync();

                if (!expiredAuctions.Any()) return;

                foreach (var auction in expiredAuctions)
                {
                    var winningBid = auction.Bids != null && auction.Bids.Any()
                        ? auction.Bids.OrderByDescending(b => b.Amount).FirstOrDefault()
                        : null;

                    if (winningBid != null)
                    {
                        // Subasta finalizada con ganador
                        auction.Status = AuctionStatus.Finished;
                        auction.Version += 1;

                        // Liquidar escrow: transferir fondos del ganador al vendedor
                        await walletService.TransferFundsAsync(winningBid.UserId, auction.UserId, winningBid.Amount);

                        context.AuditLogs.Add(new AuditLog
                        {
                            Event = "AuctionFinished",
                            Details = $"Subasta ID {auction.Id} finalizada exitosamente. Ganador: Usuario ID {winningBid.UserId} por monto de ${winningBid.Amount}.",
                            CreatedAt = now,
                            UserId = auction.UserId
                        });

                        _logger.LogInformation($"Subasta ID {auction.Id} finalizada con ganador: Usuario ID {winningBid.UserId}, Monto ${winningBid.Amount}.");
                    }
                    else
                    {
                        // Subasta finalizada sin ofertas (Desierta)
                        auction.Status = AuctionStatus.Deserted;
                        auction.Version += 1;

                        context.AuditLogs.Add(new AuditLog
                        {
                            Event = "AuctionDeserted",
                            Details = $"Subasta ID {auction.Id} finalizada sin ofertas (Desierta).",
                            CreatedAt = now,
                            UserId = auction.UserId
                        });

                        _logger.LogInformation($"Subasta ID {auction.Id} declarada desierta.");
                    }
                }

                await context.SaveChangesAsync();
            }
        }
    }
}
