using Aplicacion.DTOs;

namespace Aplicacion.Interfaces
{
    public interface IUserService
    {
        Task<IEnumerable<UserDto>> GetAllUsersAsync();
        Task<UserDto?> GetUserByIdAsync(int id);
        Task<UserDto?> GetUserByEmailAsync(string email);
        Task<LoginResultDto> LoginAsync(LoginDto loginDto);
        Task<UserDto> CreateUserAsync(CreateUserDto createUserDto);
        Task<UserDto?> UpdateUserAsync(int id, UpdateUserDto updateUserDto);

        /// <summary>
        /// Obtiene el resumen consolidado del Panel de Usuario con métricas, publicaciones, pujas y victorias (RF-37 a RF-40).
        /// </summary>
        Task<UserDashboardDto?> GetUserDashboardAsync(int userId);

        /// <summary>
        /// Obtiene las publicaciones creadas por el vendedor con estado y recaudación (RF-39, RF-40).
        /// </summary>
        Task<IEnumerable<UserAuctionSummaryDto>> GetUserAuctionsAsync(int userId);

        /// <summary>
        /// Obtiene el listado de subastas en las que participó el usuario con su estado de participación (RF-37, RF-38).
        /// </summary>
        Task<IEnumerable<UserBidSummaryDto>> GetUserBidsAsync(int userId);

        /// <summary>
        /// Obtiene el listado de subastas ganadas por el usuario (RF-38).
        /// </summary>
        Task<IEnumerable<UserAuctionSummaryDto>> GetUserWonAuctionsAsync(int userId);
    }
}
