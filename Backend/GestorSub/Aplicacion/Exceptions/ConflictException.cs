using System;
namespace Aplicacion.Exceptions
{
    /// <summary>
    /// Señala un conflicto de estado o de concurrencia optimista (Version desactualizada)
    /// que los controladores deben traducir a HTTP 409 Conflict (3.1).
    /// </summary>
    public class ConflictException : Exception
    {
        public ConflictException(string message) : base(message)
        {
        }
    }
}
