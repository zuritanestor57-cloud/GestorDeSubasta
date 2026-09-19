using Aplicacion.Interfaces;
using Aplicacion.Services;
using GestorSub;
using GestorSub.Services;
using Infraestructura;
using Infraestructura.SeedData;
using Microsoft.EntityFrameworkCore;
using GestorSub.Hubs;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSignalR();

// Habilitar CORS para poder probar SignalR desde archivos locales u otro frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.SetIsOriginAllowed(_ => true) // Permite el html local
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials(); // SignalR necesita credenciales
    });
});

// Base de datos y DbContext
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        b => b.MigrationsAssembly("Infraestructura")
    ));

// Inyección de dependencias: Persistencia
builder.Services.AddScoped<IApplicationDbContext>(sp => sp.GetRequiredService<ApplicationDbContext>());

// Inyección de dependencias: Servicios de Aplicación
builder.Services.AddScoped<IAuditService, AuditService>();
builder.Services.AddScoped<IWalletService, WalletService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IAuctionService, AuctionService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<IAuctionFinalizerService, AuctionFinalizerService>();
builder.Services.AddScoped<IAuctionEventNotifier, AuctionEventNotifier>();

// Proceso en segundo plano para expiración automática de subastas (RF-45)
builder.Services.AddHostedService<AuctionFinalizerWorker>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

    context.Database.Migrate();

    SeedData.Initialize(context);
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowAll"); // <-- Aplicar política CORS ANTES de la autorización y MapHub

app.UseAuthorization();

app.MapControllers();
app.MapHub<AuctionHub>("/hubs/auction");

app.Run();