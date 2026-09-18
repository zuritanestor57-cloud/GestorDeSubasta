using Aplicacion.DTOs;
using Aplicacion.Interfaces;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Aplicacion.Services
{
    public class UserService : IUserService
    {
        private readonly IApplicationDbContext _context;

        public UserService(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
        {
            var users = await _context.Users
                .Include(u => u.Wallet)
                .AsNoTracking()
                .ToListAsync();

            return users.Select(MapToUserDto);
        }

        public async Task<UserDto?> GetUserByIdAsync(int id)
        {
            var user = await _context.Users
                .Include(u => u.Wallet)
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == id);

            return user != null ? MapToUserDto(user) : null;
        }

        public async Task<UserDto?> GetUserByEmailAsync(string email)
        {
            var user = await _context.Users
                .Include(u => u.Wallet)
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());

            return user != null ? MapToUserDto(user) : null;
        }

        public async Task<LoginResultDto> LoginAsync(LoginDto loginDto)
        {
            if (string.IsNullOrWhiteSpace(loginDto.Email) || string.IsNullOrWhiteSpace(loginDto.Password))
            {
                return new LoginResultDto
                {
                    Success = false,
                    Message = "Debe proporcionar email y contraseña."
                };
            }

            var user = await _context.Users
                .Include(u => u.Wallet)
                .FirstOrDefaultAsync(u => u.Email.ToLower() == loginDto.Email.ToLower());

            if (user == null || user.Password != loginDto.Password)
            {
                return new LoginResultDto
                {
                    Success = false,
                    Message = "Credenciales inválidas."
                };
            }

            return new LoginResultDto
            {
                Success = true,
                Message = "Inicio de sesión exitoso.",
                User = MapToUserDto(user)
            };
        }

        public async Task<UserDto> CreateUserAsync(CreateUserDto createUserDto)
        {
            if (string.IsNullOrWhiteSpace(createUserDto.Email))
            {
                throw new ArgumentException("El email es obligatorio.");
            }

            var existingUser = await _context.Users
                .AnyAsync(u => u.Email.ToLower() == createUserDto.Email.ToLower());

            if (existingUser)
            {
                throw new InvalidOperationException("El email ya se encuentra registrado.");
            }

            var newUser = new User
            {
                Name = createUserDto.Name,
                Email = createUserDto.Email,
                Password = createUserDto.Password,
                Role = createUserDto.Role
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            // Creación automática de la billetera virtual inicializada en $0
            var newWallet = new Wallet
            {
                UserId = newUser.Id,
                TotalBalance = 0m,
                HeldBalance = 0m,
                AvailableBalance = 0m,
                Version = 1
            };

            _context.Wallets.Add(newWallet);
            await _context.SaveChangesAsync();

            newUser.Wallet = newWallet;
            return MapToUserDto(newUser);
        }

        public async Task<UserDto?> UpdateUserAsync(int id, UpdateUserDto updateUserDto)
        {
            var user = await _context.Users
                .Include(u => u.Wallet)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
            {
                return null;
            }

            // Si cambia de email, verificar que no pertenezca a otro usuario
            if (!string.IsNullOrWhiteSpace(updateUserDto.Email) && !user.Email.Equals(updateUserDto.Email, StringComparison.OrdinalIgnoreCase))
            {
                var emailTaken = await _context.Users.AnyAsync(u => u.Id != id && u.Email.ToLower() == updateUserDto.Email.ToLower());
                if (emailTaken)
                {
                    throw new InvalidOperationException("El email ya está siendo utilizado por otro usuario.");
                }
                user.Email = updateUserDto.Email;
            }

            if (!string.IsNullOrWhiteSpace(updateUserDto.Name))
            {
                user.Name = updateUserDto.Name;
            }

            if (!string.IsNullOrWhiteSpace(updateUserDto.Password))
            {
                user.Password = updateUserDto.Password;
            }

            if (updateUserDto.Role.HasValue)
            {
                user.Role = updateUserDto.Role.Value;
            }

            await _context.SaveChangesAsync();
            return MapToUserDto(user);
        }

        public async Task<UserDashboardDto?> GetUserDashboardAsync(int userId)
        {
            var user = await GetUserByIdAsync(userId);
            if (user == null) return null;

            var createdAuctions = (await GetUserAuctionsAsync(userId)).ToList();
            var myBids = (await GetUserBidsAsync(userId)).ToList();
            var wonAuctions = (await GetUserWonAuctionsAsync(userId)).ToList();

            return new UserDashboardDto
            {
                UserInfo = user,
                ActiveAuctionsCreatedCount = createdAuctions.Count(a => a.Status == AuctionStatus.Published.ToString()),
                TotalAuctionsCreatedCount = createdAuctions.Count,
                ActiveBidsCount = myBids.Count(b => b.AuctionStatus == AuctionStatus.Published.ToString()),
                WonAuctionsCount = wonAuctions.Count,
                MyCreatedAuctions = createdAuctions,
                MyBids = myBids,
                MyWonAuctions = wonAuctions
            };
        }

        public async Task<IEnumerable<UserAuctionSummaryDto>> GetUserAuctionsAsync(int userId)
        {
            var auctions = await _context.Auctions
                .Include(a => a.Product)
                .Include(a => a.Bids)
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.StartDate)
                .AsNoTracking()
                .ToListAsync();

            return auctions.Select(a => new UserAuctionSummaryDto
            {
                AuctionId = a.Id,
                ProductTitle = a.Product?.Title ?? string.Empty,
                ProductImageUrl = a.Product?.ImageUrl ?? string.Empty,
                BasePrice = a.BasePrice,
                CurrentBid = a.CurrentBid,
                TotalBidsCount = a.Bids?.Count ?? 0,
                Status = a.Status.ToString(),
                StartDate = a.StartDate,
                EndDate = a.EndDate
            });
        }

        public async Task<IEnumerable<UserBidSummaryDto>> GetUserBidsAsync(int userId)
        {
            var auctionsWithUserBids = await _context.Auctions
                .Include(a => a.Product)
                .Include(a => a.Bids)
                .Where(a => a.Bids.Any(b => b.UserId == userId))
                .OrderByDescending(a => a.EndDate)
                .AsNoTracking()
                .ToListAsync();

            var result = new List<UserBidSummaryDto>();

            foreach (var auction in auctionsWithUserBids)
            {
                var userBids = auction.Bids.Where(b => b.UserId == userId).ToList();
                var myHighestBid = userBids.Max(b => b.Amount);
                var currentHighestBid = auction.Bids.Max(b => b.Amount);

                var topBid = auction.Bids.OrderByDescending(b => b.Amount).FirstOrDefault();
                bool isLeading = topBid != null && topBid.UserId == userId;

                string participationStatus;
                if (auction.Status == AuctionStatus.Finished)
                {
                    participationStatus = isLeading ? "Ganada" : "Perdida";
                }
                else if (auction.Status == AuctionStatus.Published)
                {
                    participationStatus = isLeading ? "Liderando" : "Superado";
                }
                else
                {
                    participationStatus = "Finalizada";
                }

                result.Add(new UserBidSummaryDto
                {
                    AuctionId = auction.Id,
                    ProductTitle = auction.Product?.Title ?? string.Empty,
                    ProductImageUrl = auction.Product?.ImageUrl ?? string.Empty,
                    MyHighestBid = myHighestBid,
                    CurrentHighestBid = currentHighestBid,
                    IsLeading = isLeading,
                    AuctionStatus = auction.Status.ToString(),
                    ParticipationStatus = participationStatus,
                    EndDate = auction.EndDate
                });
            }

            return result;
        }

        public async Task<IEnumerable<UserAuctionSummaryDto>> GetUserWonAuctionsAsync(int userId)
        {
            var finishedAuctions = await _context.Auctions
                .Include(a => a.Product)
                .Include(a => a.Bids)
                .Where(a => a.Status == AuctionStatus.Finished && a.Bids.Any())
                .AsNoTracking()
                .ToListAsync();

            var wonAuctions = finishedAuctions
                .Where(a => a.Bids.OrderByDescending(b => b.Amount).FirstOrDefault()?.UserId == userId)
                .OrderByDescending(a => a.EndDate);

            return wonAuctions.Select(a => new UserAuctionSummaryDto
            {
                AuctionId = a.Id,
                ProductTitle = a.Product?.Title ?? string.Empty,
                ProductImageUrl = a.Product?.ImageUrl ?? string.Empty,
                BasePrice = a.BasePrice,
                CurrentBid = a.CurrentBid,
                TotalBidsCount = a.Bids?.Count ?? 0,
                Status = a.Status.ToString(),
                StartDate = a.StartDate,
                EndDate = a.EndDate
            });
        }

        private static UserDto MapToUserDto(User user)
        {
            return new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role.ToString(),
                WalletId = user.Wallet?.Id ?? 0,
                TotalBalance = user.Wallet?.TotalBalance ?? 0m,
                HeldBalance = user.Wallet?.HeldBalance ?? 0m,
                AvailableBalance = user.Wallet?.AvailableBalance ?? 0m
            };
        }
    }
}
