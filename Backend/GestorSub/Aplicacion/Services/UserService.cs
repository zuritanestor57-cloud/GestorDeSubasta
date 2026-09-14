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
