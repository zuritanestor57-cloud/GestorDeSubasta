using Aplicacion.DTOs;
using Aplicacion.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace GestorSub.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WalletController : ControllerBase
    {
        private readonly IWalletService _walletService;

        public WalletController(IWalletService walletService)
        {
            _walletService = walletService;
        }

        /// <summary>
        /// Consulta el desglose de saldo (Total, Retenido en Escrow, Disponible) del usuario (RF-31, RF-32).
        /// </summary>
        [HttpGet("balance/{userId:int}")]
        public async Task<ActionResult<WalletBalanceDto>> GetBalance(int userId)
        {
            var balance = await _walletService.GetBalanceByUserIdAsync(userId);
            if (balance == null)
            {
                return NotFound(new { message = $"No se encontró billetera asociada al usuario con ID {userId}." });
            }
            return Ok(balance);
        }

        /// <summary>
        /// Acredita saldo simulado a la billetera del usuario (RF-30).
        /// </summary>
        [HttpPost("deposit")]
        public async Task<ActionResult<WalletBalanceDto>> Deposit([FromBody] DepositDto depositDto)
        {
            try
            {
                var updatedBalance = await _walletService.DepositAsync(depositDto);
                return Ok(updatedBalance);
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
                return StatusCode(500, new { message = "Ocurrió un error al procesar el depósito.", detail = ex.Message });
            }
        }

        /// <summary>
        /// Obtiene el historial de movimientos / libro mayor (Transactions/Ledger) de la billetera (RF-36).
        /// </summary>
        [HttpGet("transactions/{userId:int}")]
        public async Task<ActionResult<IEnumerable<TransactionDto>>> GetTransactions(int userId)
        {
            var transactions = await _walletService.GetTransactionsByUserIdAsync(userId);
            return Ok(transactions);
        }
    }
}
