using Aplicacion.DTOs;
using Aplicacion.Exceptions;
using Aplicacion.Interfaces;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Aplicacion.Services
{
    public class AuctionService : IAuctionService
    {
        private readonly IApplicationDbContext _context;
        private readonly IWalletService _walletService;
        private readonly IAuditService _auditService;
        private readonly IAuctionEventNotifier _notifier;

        public AuctionService(
            IApplicationDbContext context, 
            IWalletService walletService, 
            IAuditService auditService,
            IAuctionEventNotifier notifier)
        {
            _context = context;
            _walletService = walletService;
            _auditService = auditService;
            _notifier = notifier;
        }

        public async Task<AuctionDetailDto> CreateAuctionAsync(CreateAuctionDto createDto)
        {
            // RF-15: Validación de fechas
            if (createDto.EndDate <= createDto.StartDate)
            {
                throw new ArgumentException("La fecha de finalización debe ser posterior a la fecha de inicio.");
            }

            // RF-16: Validación de valores positivos
            if (createDto.BasePrice <= 0)
            {
                throw new ArgumentException("El precio base debe ser un valor positivo mayor a cero.");
            }

            if (createDto.MinimumIncrement <= 0)
            {
                throw new ArgumentException("El incremento mínimo por puja debe ser un valor positivo mayor a cero.");
            }

            // Verificar usuario vendedor
            var seller = await _context.Users.FirstOrDefaultAsync(u => u.Id == createDto.UserId);
            if (seller == null)
            {
                throw new InvalidOperationException($"No se encontró el usuario vendedor con ID {createDto.UserId}.");
            }

            // Obtener categorías seleccionadas
            var categories = new List<Category>();
            if (createDto.CategoryIds != null && createDto.CategoryIds.Any())
            {
                categories = await _context.Categories
                    .Where(c => createDto.CategoryIds.Contains(c.Id))
                    .ToListAsync();
            }

            var newProduct = new Product
            {
                Title = createDto.Title,
                Description = createDto.Description,
                ImageUrl = createDto.ImageUrl
            };

            var newAuction = new Auction
            {
                UserId = createDto.UserId,
                BasePrice = createDto.BasePrice,
                CurrentBid = createDto.BasePrice,
                MinimumIncrement = createDto.MinimumIncrement,
                StartDate = createDto.StartDate,
                EndDate = createDto.EndDate,
                Status = AuctionStatus.Published,
                Version = 1,
                Product = newProduct,
                Categories = categories
            };

            _context.Auctions.Add(newAuction);
            await _context.SaveChangesAsync();

            // RF-48: Registrar en la bitácora de auditoría
            await _auditService.LogAsync(
                "SUBASTA_CREADA",
                $"Subasta ID {newAuction.Id} ('{newProduct.Title}') creada y publicada por el usuario ID {createDto.UserId}. Precio base: ${newAuction.BasePrice:F2}.",
                createDto.UserId
            );

            return MapToDetailDto(newAuction);
        }

        public async Task<AuctionDetailDto?> GetAuctionByIdAsync(int id)
        {
            var auction = await _context.Auctions
                .Include(a => a.User)
                .Include(a => a.Product)
                .Include(a => a.Categories)
                .Include(a => a.Bids)
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.Id == id);

            return auction != null ? MapToDetailDto(auction) : null;
        }

        public async Task<IEnumerable<AuctionDetailDto>> GetAllAuctionsAsync(AuctionFilterDto? filter = null)
        {
            var query = _context.Auctions
                .Include(a => a.User)
                .Include(a => a.Product)
                .Include(a => a.Categories)
                .Include(a => a.Bids)
                .AsNoTracking()
                .AsQueryable();

            if (filter != null)
            {
                // RF-05: Búsqueda por palabra clave en título o descripción
                if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
                {
                    var term = filter.SearchTerm.Trim();
                    query = query.Where(a => a.Product != null &&
                        (a.Product.Title.Contains(term) || a.Product.Description.Contains(term)));
                }

                // RF-06: Filtrar por estado de subasta
                if (filter.Status.HasValue)
                {
                    query = query.Where(a => a.Status == filter.Status.Value);
                }

                // RF-07: Filtrar por categoría
                if (filter.CategoryId.HasValue)
                {
                    query = query.Where(a => a.Categories.Any(c => c.Id == filter.CategoryId.Value));
                }

                // RF-08: Filtrar por rango de precio (oferta actual)
                if (filter.MinPrice.HasValue)
                {
                    query = query.Where(a => a.CurrentBid >= filter.MinPrice.Value);
                }

                if (filter.MaxPrice.HasValue)
                {
                    query = query.Where(a => a.CurrentBid <= filter.MaxPrice.Value);
                }

                // RF-09: Ordenar resultados
                query = filter.OrderBy?.ToLower() switch
                {
                    "price_asc" => query.OrderBy(a => a.CurrentBid),
                    "price_desc" => query.OrderByDescending(a => a.CurrentBid),
                    "date_asc" or "ending_soonest" => query.OrderBy(a => a.EndDate),
                    "date_desc" => query.OrderByDescending(a => a.EndDate),
                    "newest" => query.OrderByDescending(a => a.StartDate),
                    _ => query.OrderByDescending(a => a.StartDate) // Por defecto: más recientes
                };
            }
            else
            {
                query = query.OrderByDescending(a => a.StartDate);
            }

            var auctions = await query.ToListAsync();

            return auctions.Select(MapToDetailDto);
        }

        public async Task<bool> CancelAuctionAsync(int auctionId, int sellerUserId)
        {
            var auction = await _context.Auctions
                .Include(a => a.Bids)
                .FirstOrDefaultAsync(a => a.Id == auctionId);

            if (auction == null)
            {
                throw new InvalidOperationException($"No se encontró la subasta con ID {auctionId}.");
            }

            if (auction.UserId != sellerUserId)
            {
                throw new InvalidOperationException("Solo el vendedor creador de la subasta puede cancelarla.");
            }

            // RF-17: Se permite cancelar únicamente si aún no existen ofertas
            if (auction.Bids != null && auction.Bids.Any())
            {
                throw new InvalidOperationException("No se puede cancelar una subasta que ya cuenta con ofertas registradas.");
            }

            auction.Status = AuctionStatus.Cancelled;
            auction.Version += 1;

            // Auditoría (RF-48): un único registro por cancelación (antes se duplicaba
            // con dos llamadas equivalentes: un Add directo y _auditService.LogAsync).
            _context.AuditLogs.Add(new AuditLog
            {
                Event = "SUBASTA_CANCELADA",
                Details = $"Subasta ID {auctionId} cancelada por el vendedor ID {sellerUserId}.",
                CreatedAt = DateTime.Now,
                UserId = sellerUserId
            });

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<IEnumerable<BidDto>> GetBidsForAuctionAsync(int auctionId)
        {
            var bids = await _context.Bids
                .Include(b => b.User)
                .Where(b => b.AuctionId == auctionId)
                .OrderByDescending(b => b.Amount)
                .AsNoTracking()
                .ToListAsync();

            return bids.Select(b => new BidDto
            {
                Id = b.Id,
                UserId = b.UserId,
                BidderName = b.User?.Name ?? string.Empty,
                Amount = b.Amount,
                CreatedAt = b.CreatedAt
            });
        }

        public async Task<IEnumerable<CategoryDto>> GetCategoriesAsync()
        {
            var categories = await _context.Categories
                .AsNoTracking()
                .ToListAsync();

            return categories.Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name
            });
        }

        private static AuctionDetailDto MapToDetailDto(Auction auction)
        {
            return new AuctionDetailDto
            {
                Id = auction.Id,
                Status = auction.Status.ToString(),
                BasePrice = auction.BasePrice,
                CurrentBid = auction.CurrentBid,
                MinimumIncrement = auction.MinimumIncrement,
                StartDate = auction.StartDate,
                EndDate = auction.EndDate,
                Version = auction.Version,
                UserId = auction.UserId,
                SellerName = auction.User?.Name ?? string.Empty,
                ProductTitle = auction.Product?.Title ?? string.Empty,
                ProductDescription = auction.Product?.Description ?? string.Empty,
                ProductImageUrl = auction.Product?.ImageUrl ?? string.Empty,
                Categories = auction.Categories?.Select(c => new CategoryDto { Id = c.Id, Name = c.Name }).ToList() ?? new List<CategoryDto>(),
                BidsCount = auction.Bids?.Count ?? 0
            };
        }
        //Implementación escrow y anti-sniping
        public async Task<BidResultDto> PlaceBidAsync(int auctionId, CreateBidDto bidDto)
        {
            var now = DateTime.Now;
            var auction = await _context.Auctions
                .Include(a => a.Bids)
                .Include(a => a.User)
                .FirstOrDefaultAsync(a => a.Id == auctionId);

            if (auction == null)
            {
                throw new InvalidOperationException($"No se encontró la subasta con ID {auctionId}.");
            }

            Bid newBid;
            bool antiSnipingTriggered;

            // 3.4: toda validación de negocio rechazada a partir de aquí (fondos, estado,
            // caducidad, concurrencia) queda registrada en el log de auditoría.
            try
            {
                if (auction.Status != AuctionStatus.Published && auction.Status != AuctionStatus.Active)
                {
                    throw new InvalidOperationException("La subasta no está disponible para pujar.");
                }

                if (now < auction.StartDate)
                {
                    throw new InvalidOperationException("La subasta aún no ha iniciado.");
                }

                if (now > auction.EndDate)
                {
                    throw new InvalidOperationException("La subasta ya ha finalizado.");
                }

                if (bidDto.UserId == auction.UserId)
                {
                    throw new InvalidOperationException("El vendedor no puede pujar en su propia subasta.");
                }

                var hasBids = auction.Bids != null && auction.Bids.Any();
                decimal minimumRequired = hasBids ? auction.CurrentBid + auction.MinimumIncrement : auction.BasePrice;

                if (bidDto.Amount < minimumRequired)
                {
                    throw new ArgumentException($"El monto ofertado debe ser al menos {minimumRequired}.");
                }

                // Verificar saldo disponible del postor
                var balance = await _walletService.GetBalanceByUserIdAsync(bidDto.UserId);
                if (balance == null || balance.AvailableBalance < bidDto.Amount)
                {
                    throw new InvalidOperationException("Saldo insuficiente para realizar la puja.");
                }

                // Identificar la puja líder previa (si existe)
                Bid? previousTopBid = null;
                if (hasBids)
                {
                    previousTopBid = auction.Bids!.OrderByDescending(b => b.Amount).FirstOrDefault();
                }

                // 2.1: liberación de la puja anterior + retención de la nueva + registro de la
                // puja, todo en UN único bloque transaccional atómico (rollback completo si algo falla).
                using var transaction = await _context.BeginTransactionAsync();
                try
                {
                    if (previousTopBid != null)
                    {
                        await _walletService.ReleaseFundsAsync(previousTopBid.UserId, previousTopBid.Amount);
                    }

                    await _walletService.HoldFundsAsync(bidDto.UserId, bidDto.Amount);

                    newBid = new Bid
                    {
                        Amount = bidDto.Amount,
                        CreatedAt = now,
                        UserId = bidDto.UserId,
                        AuctionId = auction.Id
                    };
                    _context.Bids.Add(newBid);

                    _context.AuditLogs.Add(new AuditLog
                    {
                        Event = "PUJA_REGISTRADA",
                        Details = $"Puja realizada en subasta ID {auction.Id} por el monto de ${bidDto.Amount:F2} por el usuario ID {bidDto.UserId}.",
                        CreatedAt = now,
                        UserId = bidDto.UserId
                    });

                    if (auction.Bids == null)
                        auction.Bids = new List<Bid>();

                    auction.Bids.Add(newBid);
                    auction.CurrentBid = bidDto.Amount;
                    auction.Version += 1;

                    // Regla Anti-Sniping: si la puja ocurre en los últimos 60 segundos, extender 2 minutos
                    antiSnipingTriggered = false;
                    if ((auction.EndDate - now) <= TimeSpan.FromSeconds(60) && now < auction.EndDate)
                    {
                        var previousEndDate = auction.EndDate;
                        auction.EndDate = auction.EndDate.AddMinutes(2);
                        antiSnipingTriggered = true;

                        // 2.2 / 3.4: la extensión anti-sniping es un evento crítico auditable propio,
                        // distinto del registro genérico de la puja.
                        _context.AuditLogs.Add(new AuditLog
                        {
                            Event = "SUBASTA_EXTENDIDA_ANTISNIPING",
                            Details = $"Subasta ID {auction.Id} extendida de {previousEndDate:HH:mm:ss} a {auction.EndDate:HH:mm:ss} por regla anti-sniping tras la puja del usuario ID {bidDto.UserId}.",
                            CreatedAt = now,
                            UserId = bidDto.UserId
                        });
                    }

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    await transaction.RollbackAsync();
                    throw new ConflictException(
                        $"La subasta ID {auctionId} fue modificada por otra puja concurrente. Reintente la operación.");
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            }
            catch (Exception ex) when (ex is ArgumentException || ex is InvalidOperationException)
            {
                await _auditService.LogAsync(
                    "PUJA_RECHAZADA",
                    $"Puja rechazada en subasta ID {auctionId} para el usuario ID {bidDto.UserId}. Motivo: {ex.Message}",
                    bidDto.UserId
                );
                throw;
            }
            catch (ConflictException)
            {
                await _auditService.LogAsync(
                    "PUJA_RECHAZADA_CONCURRENCIA",
                    $"Puja rechazada en subasta ID {auctionId} para el usuario ID {bidDto.UserId} por conflicto de concurrencia optimista.",
                    bidDto.UserId
                );
                throw;
            }

            // Obtener nombre del postor para respuesta
            var bidder = await _context.Users.FirstOrDefaultAsync(u => u.Id == bidDto.UserId);
            var bidderName = bidder?.Name ?? string.Empty;

            // RF-19, RF-27: Notificar a través de Observer/SignalR
            var minimumNextBid = auction.CurrentBid + auction.MinimumIncrement;
            
            await _notifier.NotifyBidPlacedAsync(auction.Id, new BidPlacedMessageDto
            {
                AuctionId = auction.Id,
                BidId = newBid.Id,
                UserId = bidDto.UserId,
                BidderName = bidderName,
                Amount = newBid.Amount,
                CreatedAt = newBid.CreatedAt,
                MinimumNextBid = minimumNextBid
            });

            if (antiSnipingTriggered)
            {
                await _notifier.NotifyTimeExtendedAsync(auction.Id, new TimeExtendedMessageDto
                {
                    AuctionId = auction.Id,
                    NewEndDate = auction.EndDate
                });
            }

            return new BidResultDto
            {
                BidId = newBid.Id,
                AuctionId = auction.Id,
                UserId = bidDto.UserId,
                BidderName = bidderName,
                Amount = newBid.Amount,
                CreatedAt = newBid.CreatedAt,
                NewEndDate = auction.EndDate,
                AntiSnipingTriggered = antiSnipingTriggered,
                Message = "Puja registrada correctamente."
            };
        }
    }
}
