# Diagrama Entidad-Relación — SubastaYa

Generado a partir del código real (`Domain/Entities/*.cs` y `ApplicationDbContext.OnModelCreating`), no del diagrama sugerido del TP. Refleja el estado tras las 3 correcciones de auditoría/billetera/usuarios (ver abajo).

## Diagrama

```mermaid
erDiagram
    USER ||--o| WALLET : "posee (1:1)"
    USER ||--o{ AUCTION : "publica"
    USER ||--o{ BID : "puja"
    USER ||--o{ AUDIT_LOG : "es el afectado de"
    USER ||--o{ AUDIT_LOG : "ejecuta (admin, opcional)"
    WALLET ||--o{ TRANSACTION : "registra"
    AUCTION ||--o{ BID : "recibe"
    AUCTION ||--o| PRODUCT : "describe (1:1)"
    AUCTION }o--o{ CATEGORY : "clasifica (N:N)"
    AUCTION ||--o{ TRANSACTION : "origina (opcional)"
    AUCTION ||--o{ AUDIT_LOG : "origina (opcional)"

    USER {
        int Id PK
        string Name
        string Email
        string Password
        UserRole Role "Buyer, Seller, BuyerAndSeller, Administrator"
        bool IsActive
        string SuspendedReason "NULLABLE, nuevo"
    }

    WALLET {
        int Id PK
        int UserId FK "único (1:1)"
        decimal TotalBalance
        decimal HeldBalance
        decimal AvailableBalance
        int Version "optimistic locking"
    }

    TRANSACTION {
        int Id PK
        int WalletId FK
        int AuctionId FK "NULLABLE, nuevo"
        TransactionType Type "Deposit, Withdrawal, Payment, Refund, Hold, Release, SaleProceeds"
        decimal Amount
        datetime CreatedAt
    }

    AUCTION {
        int Id PK
        int UserId FK "vendedor"
        AuctionStatus Status "Draft, Published, Active, Cancelled, Finished, Deserted"
        decimal BasePrice
        decimal CurrentBid
        decimal MinimumIncrement
        datetime StartDate
        datetime EndDate
        int Version "optimistic locking"
    }

    PRODUCT {
        int Id PK
        int AuctionId FK "shadow property, único (1:1)"
        string Title
        string Description
        string ImageUrl
    }

    CATEGORY {
        int Id PK
        string Name
    }

    BID {
        int Id PK
        int UserId FK
        int AuctionId FK
        decimal Amount
        datetime CreatedAt
    }

    AUDIT_LOG {
        int Id PK
        int UserId FK "usuario afectado por el evento"
        int AdminUserId FK "NULLABLE, nuevo: quién ejecutó la acción admin"
        int AuctionId FK "NULLABLE, nuevo"
        string Event
        string Details
        string Reason "NULLABLE, nuevo"
        datetime CreatedAt
    }
```

> Nota sobre notación: `USER ||--o{ AUDIT_LOG` aparece dos veces (una por `UserId`, otra por `AdminUserId`) porque son dos relaciones independientes hacia la misma tabla, no una sola relación doble.

## Tablas y relaciones

| Entidad | Relaciones | Particularidad |
|---|---|---|
| **User** | 1:1 con Wallet · 1:N con Auction, Bid, AuditLog (x2) | `SuspendedReason` se limpia solo al reactivar la cuenta. |
| **Wallet** | 1:1 con User · 1:N con Transaction | `Version` para optimistic locking (RF de concurrencia). |
| **Transaction** | N:1 con Wallet · N:1 opcional con Auction | `AuctionId` null en depósitos manuales; presente en retención/liberación/pago/cobro por venta. |
| **Auction** | N:1 con User (vendedor) · 1:1 con Product · 1:N con Bid, Transaction, AuditLog · N:N con Category | `Version` para optimistic locking (pujas concurrentes). |
| **Product** | 1:1 con Auction | FK `AuctionId` es shadow property (no existe como campo explícito en la clase C#, solo en la configuración de EF). |
| **Category** | N:N con Auction | Tabla de unión autogenerada por EF Core (convención `AuctionCategory`). |
| **Bid** | N:1 con User · N:1 con Auction | Al eliminar un usuario, sus pujas no se borran en cascada (`DeleteBehavior.Restrict`). |
| **AuditLog** | N:1 con User (afectado) · N:1 opcional con User (admin) · N:1 opcional con Auction | Tabla de solo lectura/inserción (inmutable): nada la actualiza ni la borra. |

## Cambios recientes (los 3 puntos corregidos en esta conversación)

1. **`Transaction.AuctionId`** (nullable) + relación a `Auction`: liga cada movimiento contable a la subasta que lo originó, cuando corresponde.
2. **`User.SuspendedReason`** (nullable): motivo de la suspensión, visible mientras la cuenta sigue suspendida.
3. **`AuditLog.AuctionId`, `AuditLog.Reason`, `AuditLog.AdminUserId`** (los 3 nullable): separan del texto libre de `Details` la subasta afectada, el motivo ingresado y qué administrador ejecutó la acción.

Los tres son aditivos: solo agregan columnas nullable y relaciones nuevas hacia tablas existentes. Ninguna tabla, columna ni relación previa se modificó o se eliminó.
