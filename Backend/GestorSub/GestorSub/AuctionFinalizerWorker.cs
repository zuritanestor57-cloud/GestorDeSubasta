using Aplicacion.Interfaces;

namespace GestorSub
{
    /// <summary>
    /// Proceso en segundo plano que revisa periódicamente las subastas expiradas
    /// y ejecuta su cierre automático, adjudicación de ganador o marcado de subasta desierta (RF-45, RF-46, RF-47).
    /// </summary>
    public class AuctionFinalizerWorker : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<AuctionFinalizerWorker> _logger;
        private readonly TimeSpan _period = TimeSpan.FromSeconds(30);

        public AuctionFinalizerWorker(IServiceScopeFactory scopeFactory, ILogger<AuctionFinalizerWorker> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("AuctionFinalizerWorker iniciado.");

            using var timer = new PeriodicTimer(_period);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var scope = _scopeFactory.CreateScope();
                    var finalizerService = scope.ServiceProvider.GetRequiredService<IAuctionFinalizerService>();

                    var count = await finalizerService.ProcessExpiredAuctionsAsync();
                    if (count > 0)
                    {
                        _logger.LogInformation("AuctionFinalizerWorker procesó exitosamente {Count} subastas expiradas.", count);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error ocurrido en AuctionFinalizerWorker al procesar subastas expiradas.");
                }

                try
                {
                    await timer.WaitForNextTickAsync(stoppingToken);
                }
                catch (OperationCanceledException)
                {
                    break;
                }
            }

            _logger.LogInformation("AuctionFinalizerWorker detenido.");
        }
    }
}
