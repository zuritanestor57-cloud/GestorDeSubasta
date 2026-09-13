using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Reflection.Metadata.Ecma335;

namespace GestorSub.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class student : ControllerBase
    {
        // probaremos hacer un get 
        [HttpGet]
        public IActionResult GetAll()
        {
            return  new JsonResult(new { name = "strig"} );
        }
    }
}
