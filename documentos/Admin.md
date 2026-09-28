## Pantalla: Panel de Administración (AdminPage)

> Ruta: `/admin` · Archivo: `src/pages/AdminPage.tsx`
>
> Antes de escribir código, leé `src/types/index.ts`, `src/services/adminService.ts`, `src/services/authService.ts` y `src/services/auctionService.ts`. Usá **solo** los métodos, tipos y contratos existentes (`CategoryDto`, `UserDto`, `AuctionDetailDto`, `AuditLogDto`, `TransactionDto`). Si algo de este documento no tiene un campo equivalente en los DTOs, no lo inventes: adaptalo al DTO real.

---

### Objetivo y Propósito
Vista exclusiva para administradores de la plataforma. Permite gestionar el catálogo de categorías, moderar subastas, controlar el estado de los usuarios y auditar de forma inmutable los eventos del sistema (Audit Logs y Ledger de billeteras).

---

### Layout (por zonas)
La pantalla utiliza el fondo general ultra oscuro (`#0B0B12`) con cuadros contenedores independientes en `#151922` (radio 20px, margen exterior de 24px y bordes sutiles en `#27303F`).

1. **Barra Superior (Top Bar - 72px):**
   - **Izquierda:** Botón "Volver a SubastaYa" (`ArrowLeft`) con retorno al Home (`/`), separador vertical y logo oficial "SubastaYa Admin" con ícono de escudo de seguridad en cuadro rojo (`bg-red-600/90`, radio 10px).
   - **Derecha:** Badge distintivo `"Rol: Administrador"` en rojo/ámbar (`bg-red-500/10 border-red-500/30`), nombre completo y correo del administrador logueado, y avatar circular con la inicial.

2. **Cabecera del Panel:**
   - Badge rojo con ícono de alerta: `"Consola de Gestión Administrativa"`.
   - Título principal (28px–32px, peso 800): `"Panel de Administración General"`.
   - Bajada explicativa en `#9CA3AF`.
   - Botón *"Refrescar"* con ícono de recarga para volver a consultar la sección activa.

3. **Navegación de Secciones Administrativas (Tabs horizontales con scroll móvil):**
   - **Sección 1: Gestión de Categorías** (`activeSection === 'categories'`)
   - **Sección 2: Moderación de Subastas** (`activeSection === 'auctions'`)
   - **Sección 3: Control de Usuarios** (`activeSection === 'users'`)
   - **Sección 4: Registros de Auditoría & Ledger** (`activeSection === 'audit'`)

4. **Contenido Sección 1: Gestión de Categorías:**
   - **Formulario de Alta:**
     - Input de texto para ingresar el nombre de la categoría (validación de mínimo 3 caracteres).
     - Botón de submit primario azul *"Crear Categoría"* con spinner durante la petición.
     - Detección de duplicados con mensaje de error `$409` si el nombre ya existe.
   - **Tabla de Categorías Existentes:**
     - Buscador reactivo por nombre.
     - Columnas: Identificador slug (`font-mono text-[#60A5FA]`), Nombre de Categoría (peso 700) y Acciones.
     - Botón *"Editar"*: Abre un modal con input para modificar el nombre y botón guardar.
     - Botón *"Eliminar"*: Confirma la acción mediante diálogo nativo o modal y valida que no existan subastas activas o programadas asociadas (lanzando error `$409` si está en uso).

5. **Contenido Sección 2: Moderación de Subastas:**
   - **Barra de Acciones Especiales:**
     - Banner informativo con botón destacado: *"Cerrar Subastas Vencidas (Worker)"*. Ejecuta `adminService.closeExpiredAuctions()` para forzar el cierre de subastas con tiempo expirado que no hayan sido procesadas.
   - **Tabla con todas las subastas de la plataforma:**
     - Buscador por lote, título, categoría o vendedor.
     - Columnas: Miniatura y título del lote con categoría y ID, Vendedor, Oferta Actual con total de pujas, Estado (`ACTIVA`, `PROGRAMADA`, `FINALIZADA`, `CANCELADA`, `DESIERTA`), Fecha de cierre previsto y Acciones.
     - Botón *"Sala"*: Enlace directo a `/auctions/:id`.
     - Botón *"Moderar / Dar de baja"*: Abre modal obligatorio para ingresar el motivo administrativo (`reason`).
       - Al confirmar, cancela la subasta (`status = 'CANCELADA'`).
       - Si había un postor líder, libera automáticamente su saldo en garantía Escrow hacia su saldo disponible y genera el registro en el Ledger.
       - Registra el evento en `Audit Logs` con el ID del administrador y el motivo ingresado.

6. **Contenido Sección 3: Control de Usuarios:**
   - **Listado Global de Usuarios:**
     - Buscador por nombre, email, rol o ID.
     - Columnas: Avatar, Nombre completo y correo, Rol del sistema (`BUYER`, `SELLER`, `BOTH`, `Administrator`), Saldo Disponible ($) en JetBrains Mono tabular, Saldo en Garantía Escrow ($), Estado (`ACTIVO` en verde / `SUSPENDIDO` en rojo con badge y motivo visible) y Acción Administrativa.
     - Botón Toggle de Estado:
       - Para cuentas no administradoras: botón *"Suspender"* o *"Reactivar"*.
       - Abre modal obligatorio requiriendo el motivo (`reason`).
       - Las cuentas administradoras se muestran como *"Inmutable (Admin)"*.
       - Al suspender, impide futuros logins al usuario mostrando el motivo en pantalla.

7. **Contenido Sección 4: Registros de Auditoría y Transacciones:**
   - **Sub-navegación interna:** Conmutador tipo píldora entre *"Audit Logs (Eventos del Sistema)"* y *"Libro Mayor (Ledger Global)"*.
   - **Tabla de Audit Logs:**
     - Muestra eventos inmutables del sistema: extensiones anti-sniping, rechazos de puja por falta de saldo, cambios de estado automáticos, acreditaciones bancarias, moderaciones de subastas y suspensiones de usuarios.
     - Columnas: Timestamp ISO/local, Tipo de evento (badge coloreado por tipo: `ANTI_SNIPING`, `RECHAZO_PUJA`, `CAMBIO_ESTADO`, `MODERACION_SUBASTA`, `ESTADO_USUARIO`, `CIERRE_FORZADO`), Descripción detallada, Administrador / Usuario responsable y Motivo registrado.
   - **Tabla de Transacciones Globales (Ledger):**
     - Lectura completa del libro mayor de todas las billeteras.
     - Columnas: ID de Transacción, Usuario ID, Tipo de movimiento (`DEPOSITO`, `RETIRO`, `RETENCION`, `LIBERACION`, `COBRO`, `PAGO`), Detalle/Concepto, Fecha y Monto en JetBrains Mono tabular (`+ $` en verde o `- $` en blanco/rojo según la dirección `CREDIT`/`DEBIT`).

---

### Datos que maneja
- **Categorías (`CategoryDto[]`):** `id`, `name`.
- **Subastas (`AuctionDetailDto[]`):** `id`, `title`, `category`, `sellerName`, `currentBid`, `totalBids`, `status`, `endDate`, `imageUrl`.
- **Usuarios (`UserDto[]`):** `id`, `fullName`, `email`, `role`, `walletAvailable`, `walletEscrow`, `isActive`, `suspendedReason`.
- **Audit Logs (`AuditLogDto[]`):** `id`, `timestamp`, `eventType`, `description`, `adminId`, `userId`, `auctionId`, `reason`, `details`.
- **Transacciones (`TransactionDto[]`):** `id`, `userId`, `type`, `amount`, `direction`, `timestamp`, `auctionId`, `auctionTitle`, `description`.

---

### Acciones del usuario
- **Carga de la pantalla:**
  - Verifica sesión activa vía `authService.isAuthenticated()`.
  - Verifica rol de administrador: `currentUser.role === 'Administrator' || currentUser.role === 'ADMIN'`. Si no cumple, redirige inmediatamente a `/`.
- **Cambio de Sección:** Carga bajo demanda los datos respectivos (`getCategories`, `getAuctions`, `getUsers`, `getAuditLogs`, `getTransactions`).
- **Creación de Categoría:** Ejecuta `adminService.createCategory(name)`. En caso de éxito, añade el item localmente y limpia el input. En caso de error (400 o 409), muestra el mensaje de `err.response?.data?.message`.
- **Edición de Categoría:** Ejecuta `adminService.updateCategory(id, name)` y refresca el item en el estado local.
- **Eliminación de Categoría:** Ejecuta `adminService.deleteCategory(id)` y remueve el item del estado local.
- **Moderar / Dar de baja Subasta:** Ejecuta `adminService.moderateAuction(id, reason)` previa confirmación en modal. Actualiza el estado local de la subasta a `CANCELADA`.
- **Cierre Forzado de Subastas Vencidas:** Ejecuta `adminService.closeExpiredAuctions()` con spinner en el botón y refresca el listado de subastas con el mensaje del total procesado.
- **Cambiar Estado de Usuario:** Ejecuta `adminService.setUserStatus(id, isActive, reason)` previa confirmación en modal. Actualiza el estado del usuario localmente.

---

### Manejo de Errores y Transaccionalidad
- Todas las llamadas a la API ejecutan un `try/catch` independiente.
- Errores `$400` y `$409` capturados con `isAxiosError(err)` mostrando `err.response?.data?.message` en un banner superior dismissible con borde rojo.
- Tras cada acción exitosa, se refresca únicamente el listado local de esa sección sin recargar la página.

---

### Restricciones de Acceso (RBAC)
- **Rol obligatorio:** `Administrator` o `ADMIN`.
- Si un usuario sin credenciales administrativas intenta acceder directamente a `/admin`, es redirigido inmediatamente al Home (`/`).
- Para pruebas inmediatas, se encuentra disponible la cuenta: `admin@subastaya.com` (contraseña: `admin123`).

---

### Estilo
Cumple estrictamente con la guía canónica de estilos:
- **Fondo general:** `#0B0B12`.
- **Contenedores:** `#151922` con radio de 20px (`rounded-[20px]`).
- **Inputs, modales y tablas:** `#1F2937` con bordes `#27303F` y `#374151`.
- **Botón primario:** 50px de alto (o 44px compacto), fondo `#2563EB`, hover `#1D4ED8`, radio de 10px.
- **Acentos:**
  - Rojo `#EF4444` / `bg-red-500/10` para identidad administrativa, moderación, suspensiones y cancelaciones.
  - Ámbar `#F59E0B` para advertencias, proceso forzado de Worker y saldos en garantía.
  - Verde `#10B981` para estados activos y transacciones crediticias.
  - Azul `#60A5FA` para identificadores, slugs y categoría.
- **Tipografía:** Montserrat para textos y botones; JetBrains Mono tabular (`font-mono tabular-nums`) para montos monetarios, IDs y timestamps.
