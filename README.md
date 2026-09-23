[readme_md (1).md](https://github.com/user-attachments/files/32549158/readme_md.1.md)
# 🏷️ SubastaYa – Plataforma Web de Subastas en Tiempo Real

**SubastaYa** es una aplicación web fullstack diseñada para compras y ventas bajo la modalidad de subastas en vivo. Cuenta con un sistema de sincronización bidireccional en tiempo real para pujas instantáneas y una **billetera virtual con sistema Escrow (fondos retenidos)** para brindar máxima seguridad financiera a compradores y vendedores.

## 📸 Vista General y Arquitectura

El proyecto adopta las mejores prácticas de desarrollo fullstack, implementando una **Arquitectura en Capas** en el backend y una arquitectura basada en componentes modulares en el frontend.

```
SubastaYa/
├── Backend/                   # Solución .NET Core (Clean / Layered Architecture)
│   ├── SubastaYa.API->GestorSub/          # Endpoints REST, SignalR Hubs y Middlewares
│   ├── SubastaYa.Application /  # Casos de uso, DTOs e Interfaces de Servicios
│   ├── SubastaYa.Domain/       # Entidades principales, Enums y Lógica de Negocio
│   └── SubastaYa.Infrastructure/# Entity Framework Core, Persistencia y JWT
│
├── Frontend/                  # Aplicación SPA React + TypeScript
│   ├── src/
│   │   ├── components/        # Componentes UI reutilizables
│   │   ├── context/           # Contextos globales (Auth, SignalR, Wallet)
│   │   ├── hooks/             # Custom Hooks (React Query, WebSocket)
│   │   ├── pages/             # Vistas de Comprador, Vendedor y Admin
│   │   └── services/          # Cliente Axios y conexiones SignalR
│
└── Database/                  # Scripts de inicialización y esquemas SQL

```

## 🛠️ Tecnologías y Herramientas

### **Frontend**

* **Librería principal:** React 18 con TypeScript.

* **Empaquetador:** Vite (desarrollo ultrarrápido).

* **Estilos y UI:** Tailwind CSS + Lucide Icons.

* **Manejo de Estado y Peticiones:** TanStack Query (React Query) + Context API.

* **Enrutamiento:** React Router DOM.

* **Tiempo Real:** `@microsoft/signalr` para interacción en vivo con las salas de puja.

### **Backend**

* **Framework:** ASP.NET Core 8 Web API.

* **ORM:** Entity Framework Core 8 (Code First / DB First).

* **Base de Datos:** Microsoft SQL Server 2022.

* **Sincronización en vivo:** ASP.NET Core SignalR.

* **Seguridad:** JWT (JSON Web Tokens) y Hasheo de contraseñas con BCrypt.NET.

* **Documentación:** Swagger / OpenAPI.

## ✨ Características Principales

1. **🔒 Autenticación y Autorización Robustas:**

   * Autenticación basada en JWT con diferentes roles (*Administrador*, *Vendedor*, *Comprador*).

2. **⚡ Salón de Pujas en Tiempo Real (SignalR):**

   * Actualización instantánea de la oferta más alta sin necesidad de recargar la página.

   * Notificaciones de extensión de tiempo automático cuando se recibe una puja en los últimos minutos.

3. **💰 Billetera Virtual y Escrow (Garantía):**

   * Control de **saldo disponible** y **saldo retenido**.

   * Al pujar, los fondos correspondientes se retienen automáticamente para evitar ofertas falsas.

   * Si otro comprador supera la oferta, los fondos retenidos se liberan de inmediato al comprador anterior.

4. **📦 Gestión de Productos y Subastas:**

   * Publicación de artículos con precio base, incremento mínimo y fecha límite.

   * Catálogo con filtros avanzados por categoría, rango de precios y estado.

5. **🛡️ Panel de Administración:**

   * Gestión integral de usuarios, categorías y moderación de subastas.

## ⚙️ Requisitos Previos

Asegúrate de tener instalado lo siguiente en tu entorno de desarrollo:

* [.NET SDK 8.0+](https://dotnet.microsoft.com/download/dotnet/8.0?utm_source=gemini)

* [Node.js 20.x+](https://nodejs.org/?utm_source=gemini)

* [SQL Server 2022](https://www.microsoft.com/sql-server/?utm_source=gemini) (o LocalDB / Docker Container)

## 🚀 Guía de Instalación y Ejecución

### **1. Clonar el repositorio**

```
git clone https://github.com/TU-USUARIO/SubastaYa.git
cd SubastaYa

```

### **2. Configurar y Ejecutar el Backend**

1. Navega a la carpeta del backend:

   ```
   cd Backend
   
   ```

2. Configura la cadena de conexión a SQL Server en `Backend/appsettings.json`:

   ```
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=localhost;Database=SubastaYaDb;Trusted_Connection=True;TrustServerCertificate=True;"
     }
   }
   
   ```

3. Aplica las migraciones de Entity Framework para crear la base de datos, aunque dicha migration lo hace automatic Mante   

   ```
   dotnet ef database update
   
   ```

4. Ejecuta el servidor API:  entrando en Backent/GestorSub/GestorSub

   ```
   dotnet run
   
   ```

La API estará corriendo en `https://localhost:7197. Puedes probar los endpoints e interfaz Swagger en: `👉 `https://localhost:5001/swagger`

### **3. Configurar y Ejecutar el Frontend**

1. Abre una nueva terminal y navega a la carpeta Frontend:

   ```
   cd Frontend
   
   ```

2. Instala las dependencias del proyecto:

   ```
   npm install
   
   ```

3. Inicia el servidor de desarrollo Vite:

   ```
   npm run dev
   
   ```

4. Abre tu navegador en:
   👉 `http://localhost:5173`

## 🌐 Endpoints y Enlaces Rápidos

| Servicio | URL | Descripción | 
 | ----- | ----- | ----- | 
| **Aplicación Web (Client)** | `http://localhost:5173` | Interfaz gráfica e interacción | 
| **API REST Backend** | `https://localhost:5001` | Servidor .NET 8 | 
| **Swagger UI** | `https://localhost:5001/swagger` | Documentación interactiva API | 
| **SignalR Hub** | `https://localhost:5001/hubs/subasta` | WebSocket para pujas en vivo | 

## 👨‍💻 Proyecto Académico

* **Materia:** Arquitectura de Software

* **Proyecto:** SubastaYa – Plataforma Web de Subastas en Tiempo Real

* **Descripción:** Desarrollo práctico aplicando patrones arquitectónicos REST, comunicación bidireccional con SignalR, persistencia con ORM e integración con SPA en React.
