using Microsoft.AspNetCore.Mvc;

namespace GestorSubasta.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PingController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get() => Ok("Servidor activo");
    }
}