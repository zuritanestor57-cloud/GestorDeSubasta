using Aplicacion.DTOs;
using Aplicacion.Exceptions;
using Aplicacion.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace GestorSub.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;
        private readonly IAuctionFinalizerService _auctionFinalizerService;

        public AdminController(IAdminService adminService, IAuctionFinalizerService auctionFinalizerService)
        {
            _adminService = adminService;
            _auctionFinalizerService = auctionFinalizerService;
        }

        /// <summary>
        /// Crea una nueva categoría de productos (RF-41).
        /// </summary>
        [HttpPost("categories")]
        public async Task<ActionResult<CategoryDto>> CreateCategory([FromBody] CreateCategoryDto dto)
        {
            try
            {
                var category = await _adminService.CreateCategoryAsync(dto);
                return Created($"/api/auctions/categories", category);
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
                return StatusCode(500, new { message = "Error al crear la categoría.", detail = ex.Message });
            }
        }

        /// <summary>
        /// Edita el nombre de una categoría existente (RF-41).
        /// </summary>
        [HttpPut("categories/{id:int}")]
        public async Task<ActionResult<CategoryDto>> UpdateCategory(int id, [FromBody] CreateCategoryDto dto)
        {
            try
            {
                var category = await _adminService.UpdateCategoryAsync(id, dto);
                if (category == null)
                {
                    return NotFound(new { message = $"No se encontró la categoría con ID {id}." });
                }
                return Ok(category);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al actualizar la categoría.", detail = ex.Message });
            }
        }

        /// <summary>
        /// Elimina una categoría si no posee subastas vinculadas (RF-41).
        /// </summary>
        [HttpDelete("categories/{id:int}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            try
            {
                var success = await _adminService.DeleteCategoryAsync(id);
                if (!success)
                {
                    return NotFound(new { message = $"No se encontró la categoría con ID {id}." });
                }
                return Ok(new { message = "Categoría eliminada exitosamente." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al eliminar la categoría.", detail = ex.Message });
            }
        }

        /// <summary>
        /// Suspende o habilita a un usuario en la plataforma (RF-42).
        /// </summary>
        [HttpPut("users/{id:int}/status")]
        public async Task<ActionResult<UserDto>> ToggleUserStatus(int id, [FromBody] ToggleUserStatusDto dto)
        {
            try
            {
                var user = await _adminService.ToggleUserStatusAsync(id, dto.IsActive, dto.Reason);
                if (user == null)
                {
                    return NotFound(new { message = $"No se encontró el usuario con ID {id}." });
                }
                return Ok(user);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al actualizar el estado del usuario.", detail = ex.Message });
            }
        }

        /// <summary>
        /// Modera y cancela una subasta por incumplimiento de políticas, liberando garantías (RF-43).
        /// </summary>
        [HttpPost("auctions/{id:int}/moderations")]
        public async Task<IActionResult> ModerateAuction(int id, [FromBody] ModerateAuctionDto dto)
        {
            try
            {
                var success = await _adminService.ModerateAuctionAsync(id, dto.Reason);
                if (!success)
                {
                    return NotFound(new { message = $"No se encontró la subasta con ID {id}." });
                }
                return Ok(new { message = "La subasta ha sido moderada y cancelada exitosamente." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (ConflictException ex)
            {
                // 3.1: conflicto de concurrencia optimista (Version) -> 409, no 500 genérico.
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al moderar la subasta.", detail = ex.Message });
            }
        }

        /// <summary>
        /// Ejecuta manualmente un ciclo de cierre/adjudicación de subastas expiradas (RF-45, RF-46, RF-47, RF-48).
        /// El mismo proceso corre automáticamente en segundo plano (<see cref="GestorSub.AuctionFinalizerWorker"/>);
        /// este endpoint existe para disparar y verificar un ciclo bajo demanda (ej. pruebas).
        /// </summary>
        [HttpPost("auction-closures")]
        public async Task<ActionResult> CreateAuctionClosure()
        {
            try
            {
                var processed = await _auctionFinalizerService.ProcessExpiredAuctionsAsync();
                return Ok(new { message = $"Se procesaron {processed} subastas expiradas.", processedCount = processed });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Ocurrió un error al procesar las subastas expiradas.", detail = ex.Message });
            }
        }

        /// <summary>
        /// Obtiene el historial inmutable de auditoría del sistema (RF-44).
        /// </summary>
        [HttpGet("audit-logs")]
        public async Task<ActionResult<IEnumerable<AuditLogDto>>> GetAuditLogs()
        {
            var logs = await _adminService.GetAuditLogsAsync();
            return Ok(logs);
        }

        /// <summary>
        /// Obtiene el historial global de transacciones financieras realizadas (RF-44).
        /// </summary>
        [HttpGet("transactions")]
        public async Task<ActionResult<IEnumerable<AdminTransactionDto>>> GetTransactions()
        {
            var transactions = await _adminService.GetTransactionsAsync();
            return Ok(transactions);
        }
    }
}
