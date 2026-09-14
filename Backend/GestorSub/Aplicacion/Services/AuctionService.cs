using Aplicacion.DTOs;
using Aplicacion.Interfaces;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Aplicacion.Services
{
    public class AuctionService : IAuctionService
    {
        private readonly IApplicationDbContext _context;

        public AuctionService(IApplicationDbContext context)
        {
            _context = context;
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

        public async Task<IEnumerable<AuctionDetailDto>> GetAllAuctionsAsync()
        {
            var auctions = await _context.Auctions
                .Include(a => a.User)
                .Include(a => a.Product)
                .Include(a => a.Categories)
                .Include(a => a.Bids)
                .AsNoTracking()
                .ToListAsync();

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

            await _context.SaveChangesAsync();
            return true;
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
    }
}
