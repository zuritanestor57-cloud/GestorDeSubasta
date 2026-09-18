using Aplicacion.DTOs;
using Aplicacion.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace GestorSub.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuctionsController : ControllerBase
    {
        private readonly IAuctionService _auctionService;

        public AuctionsController(IAuctionService auctionService)
        {
            _auctionService = auctionService;
        }

        /// <summary>
        /// Publica una nueva subasta con su producto y configuración económica (RF-11 a RF-16).
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<AuctionDetailDto>> Create([FromBody] CreateAuctionDto createDto)
        {
            try
            {
                var createdAuction = await _auctionService.CreateAuctionAsync(createDto);
                return CreatedAtAction(nameof(GetById), new { id = createdAuction.Id }, createdAuction);
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
                return StatusCode(500, new { message = "Ocurrió un error al crear la subasta.", detail = ex.Message });
            }
        }

        /// <summary>
        /// Obtiene el detalle completo de una subasta.
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<ActionResult<AuctionDetailDto>> GetById(int id)
        {
            var auction = await _auctionService.GetAuctionByIdAsync(id);
            if (auction == null)
            {
                return NotFound(new { message = $"No se encontró la subasta con ID {id}." });
            }
            return Ok(auction);
        }

        /// <summary>
        /// Obtiene y filtra el catálogo general de subastas según búsqueda, estado, categoría, rango de precios y ordenamiento (RF-05 a RF-10).
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AuctionDetailDto>>> GetAll([FromQuery] AuctionFilterDto filterDto)
        {
            var auctions = await _auctionService.GetAllAuctionsAsync(filterDto);
            return Ok(auctions);
        }

        /// <summary>
        /// Cancela una subasta creada por el vendedor únicamente si no posee ofertas (RF-17).
        /// </summary>
        [HttpDelete("{id:int}/cancel")]
        public async Task<IActionResult> Cancel(int id, [FromQuery] int sellerUserId)
        {
            try
            {
                var success = await _auctionService.CancelAuctionAsync(id, sellerUserId);
                if (success)
                {
                    return Ok(new { message = "La subasta ha sido cancelada exitosamente." });
                }
                return BadRequest(new { message = "No se pudo cancelar la subasta." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Ocurrió un error al intentar cancelar la subasta.", detail = ex.Message });
            }
        }

        /// <summary>
        /// Obtiene la lista de categorías disponibles para asociar a los productos.
        /// </summary>
        [HttpGet("categories")]
        public async Task<ActionResult<IEnumerable<CategoryDto>>> GetCategories()
        {
            var categories = await _auctionService.GetCategoriesAsync();
            return Ok(categories);
        }

        /// <summary>
        /// Registra una nueva oferta económica con escrow automático y regla anti-sniping.
        /// </summary>
        [HttpPost("{id:int}/bids")]
        public async Task<ActionResult<BidResultDto>> PlaceBid(int id, [FromBody] CreateBidDto bidDto)
        {
            try
            {
                var result = await _auctionService.PlaceBidAsync(id, bidDto);
                return Ok(result);
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
                return StatusCode(500, new { message = "Ocurrió un error al registrar la puja.", detail = ex.Message });
            }
        }
    }
}
