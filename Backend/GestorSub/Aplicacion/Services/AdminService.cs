using Aplicacion.DTOs;
using Aplicacion.Interfaces;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Aplicacion.Services
{
    public class AdminService : IAdminService
    {
        private readonly IApplicationDbContext _context;
        private readonly IWalletService _walletService;

        public AdminService(IApplicationDbContext context, IWalletService walletService)
        {
            _context = context;
            _walletService = walletService;
        }

        public async Task<CategoryDto> CreateCategoryAsync(CreateCategoryDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                throw new ArgumentException("El nombre de la categoría es obligatorio.");
            }

            var exists = await _context.Categories
                .AnyAsync(c => c.Name.ToLower() == dto.Name.Trim().ToLower());

            if (exists)
            {
                throw new InvalidOperationException($"La categoría '{dto.Name}' ya existe.");
            }

            var category = new Category
            {
                Name = dto.Name.Trim()
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return new CategoryDto
            {
                Id = category.Id,
                Name = category.Name
            };
        }

        public async Task<CategoryDto?> UpdateCategoryAsync(int id, CreateCategoryDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                throw new ArgumentException("El nombre de la categoría es obligatorio.");
            }

            var category = await _context.Categories.FirstOrDefaultAsync(c => c.Id == id);
            if (category == null) return null;

            category.Name = dto.Name.Trim();
            await _context.SaveChangesAsync();

            return new CategoryDto
            {
                Id = category.Id,
                Name = category.Name
            };
        }

        public async Task<bool> DeleteCategoryAsync(int id)
        {
            var category = await _context.Categories
                .Include(c => c.Auctions)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (category == null) return false;

            if (category.Auctions != null && category.Auctions.Any())
            {
                throw new InvalidOperationException("No se puede eliminar una categoría que posee subastas asociadas.");
            }

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<UserDto?> ToggleUserStatusAsync(int userId, bool isActive, string? reason = null)
        {
            var user = await _context.Users
                .Include(u => u.Wallet)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null) return null;

            user.IsActive = isActive;

            _context.AuditLogs.Add(new AuditLog
            {
                Event = isActive ? "UserEnabled" : "UserSuspended",
                Details = $"El usuario ID {userId} ('{user.Name}') fue {(isActive ? "habilitado" : "suspendido")}. Motivo: {reason ?? "Acción administrativa"}.",
                CreatedAt = DateTime.Now,
                UserId = userId
            });

            await _context.SaveChangesAsync();

            return new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role.ToString(),
                IsActive = user.IsActive,
                WalletId = user.Wallet?.Id ?? 0,
                TotalBalance = user.Wallet?.TotalBalance ?? 0m,
                HeldBalance = user.Wallet?.HeldBalance ?? 0m,
                AvailableBalance = user.Wallet?.AvailableBalance ?? 0m
            };
        }

        public async Task<bool> ModerateAuctionAsync(int auctionId, string reason)
        {
            var auction = await _context.Auctions
                .Include(a => a.Bids)
                .FirstOrDefaultAsync(a => a.Id == auctionId);

            if (auction == null) return false;

            if (auction.Status == AuctionStatus.Cancelled || auction.Status == AuctionStatus.Finished)
            {
                throw new InvalidOperationException("No se puede moderar una subasta que ya se encuentra finalizada o cancelada.");
            }

            // Liberar escrow de la puja líder si existían ofertas
            if (auction.Bids != null && auction.Bids.Any())
            {
                var topBid = auction.Bids.OrderByDescending(b => b.Amount).FirstOrDefault();
                if (topBid != null)
                {
                    await _walletService.ReleaseFundsAsync(topBid.UserId, topBid.Amount);
                }
            }

            auction.Status = AuctionStatus.Cancelled;
            auction.Version += 1;

            _context.AuditLogs.Add(new AuditLog
            {
                Event = "AuctionModerated",
                Details = $"La subasta ID {auctionId} fue moderada y cancelada por un administrador. Motivo: {reason}.",
                CreatedAt = DateTime.Now,
                UserId = auction.UserId
            });

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<AuditLogDto>> GetAuditLogsAsync()
        {
            var logs = await _context.AuditLogs
                .Include(a => a.User)
                .OrderByDescending(a => a.CreatedAt)
                .AsNoTracking()
                .ToListAsync();

            return logs.Select(l => new AuditLogDto
            {
                Id = l.Id,
                Event = l.Event,
                Details = l.Details,
                CreatedAt = l.CreatedAt,
                UserId = l.UserId,
                UserName = l.User?.Name ?? "Sistema"
            });
        }

        public async Task<IEnumerable<AdminTransactionDto>> GetTransactionsAsync()
        {
            var transactions = await _context.Transactions
                .Include(t => t.Wallet)
                .ThenInclude(w => w.User)
                .OrderByDescending(t => t.CreatedAt)
                .AsNoTracking()
                .ToListAsync();

            return transactions.Select(t => new AdminTransactionDto
            {
                Id = t.Id,
                WalletId = t.WalletId,
                UserId = t.Wallet?.UserId ?? 0,
                UserName = t.Wallet?.User?.Name ?? string.Empty,
                Type = t.Type.ToString(),
                Amount = t.Amount,
                CreatedAt = t.CreatedAt
            });
        }
    }
}
