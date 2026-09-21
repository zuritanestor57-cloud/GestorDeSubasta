using Aplicacion.DTOs;
using Aplicacion.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace GestorSub.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        /// <summary>
        /// Obtiene el listado de todos los usuarios con sus billeteras.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetAll()
        {
            var users = await _userService.GetAllUsersAsync();
            return Ok(users);
        }

        /// <summary>
        /// Obtiene el detalle de un usuario por su ID.
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<ActionResult<UserDto>> GetById(int id)
        {
            var user = await _userService.GetUserByIdAsync(id);
            if (user == null)
            {
                return NotFound(new { message = $"No se encontró el usuario con ID {id}." });
            }
            return Ok(user);
        }

        /// <summary>
        /// Autentica a un usuario con Email y Contraseña (RF-02).
        /// </summary>
        [HttpPost("login")]
        public async Task<ActionResult<LoginResultDto>> Login([FromBody] LoginDto loginDto)
        {
            var result = await _userService.LoginAsync(loginDto);
            if (!result.Success)
            {
                return BadRequest(result);
            }
            return Ok(result);
        }

        /// <summary>
        /// Registra un nuevo usuario e inicializa su billetera virtual en $0 (RF-01, RF-04).
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<UserDto>> Create([FromBody] CreateUserDto createUserDto)
        {
            try
            {
                var createdUser = await _userService.CreateUserAsync(createUserDto);
                return CreatedAtAction(nameof(GetById), new { id = createdUser.Id }, createdUser);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Ocurrió un error al procesar el registro.", detail = ex.ToString() });
            }
        }

        /// <summary>
        /// Actualiza la información personal de un usuario (RF-03).
        /// </summary>
        [HttpPut("{id:int}")]
        public async Task<ActionResult<UserDto>> Update(int id, [FromBody] UpdateUserDto updateUserDto)
        {
            try
            {
                var updatedUser = await _userService.UpdateUserAsync(id, updateUserDto);
                if (updatedUser == null)
                {
                    return NotFound(new { message = $"No se encontró el usuario con ID {id}." });
                }
                return Ok(updatedUser);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Ocurrió un error al actualizar el usuario.", detail = ex.Message });
            }
        }

        /// <summary>
        /// Obtiene el resumen consolidado del Panel de Usuario con métricas, publicaciones, pujas y victorias (RF-37 a RF-40).
        /// </summary>
        [HttpGet("{id:int}/dashboard")]
        public async Task<ActionResult<UserDashboardDto>> GetDashboard(int id)
        {
            var dashboard = await _userService.GetUserDashboardAsync(id);
            if (dashboard == null)
            {
                return NotFound(new { message = $"No se encontró el usuario con ID {id}." });
            }
            return Ok(dashboard);
        }

        /// <summary>
        /// Obtiene el listado de publicaciones creadas por el vendedor con su estado y recaudación (RF-39, RF-40).
        /// </summary>
        [HttpGet("{id:int}/auctions")]
        public async Task<ActionResult<IEnumerable<UserAuctionSummaryDto>>> GetUserAuctions(int id)
        {
            var auctions = await _userService.GetUserAuctionsAsync(id);
            return Ok(auctions);
        }

        /// <summary>
        /// Obtiene el listado de subastas en las que participó el usuario con su estado de participación (RF-37, RF-38).
        /// </summary>
        [HttpGet("{id:int}/bids")]
        public async Task<ActionResult<IEnumerable<UserBidSummaryDto>>> GetUserBids(int id)
        {
            var bids = await _userService.GetUserBidsAsync(id);
            return Ok(bids);
        }

        /// <summary>
        /// Obtiene el listado de subastas ganadas por el usuario (RF-38).
        /// </summary>
        [HttpGet("{id:int}/won-auctions")]
        public async Task<ActionResult<IEnumerable<UserAuctionSummaryDto>>> GetUserWonAuctions(int id)
        {
            var wonAuctions = await _userService.GetUserWonAuctionsAsync(id);
            return Ok(wonAuctions);
        }
    }
}
