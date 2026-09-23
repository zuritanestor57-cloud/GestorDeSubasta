using Aplicacion.DTOs;
using Aplicacion.Interfaces;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Aplicacion.Services
{
    public class WalletService : IWalletService
    {
        private readonly IApplicationDbContext _context;
        private readonly IAuditService _auditService;

        public WalletService(IApplicationDbContext context, IAuditService auditService)
        {
            _context = context;
            _auditService = auditService;
        }

        public async Task<WalletBalanceDto?> GetBalanceByUserIdAsync(int userId)
        {
            var wallet = await _context.Wallets
                .Include(w => w.User)
                .AsNoTracking()
                .FirstOrDefaultAsync(w => w.UserId == userId);

            if (wallet == null) return null;

            return MapToBalanceDto(wallet);
        }

        public async Task<WalletBalanceDto> DepositAsync(DepositDto depositDto)
        {
            if (depositDto.Amount <= 0)
            {
                throw new ArgumentException("El monto a acreditar debe ser un valor positivo mayor a cero.");
            }

            var wallet = await _context.Wallets
                .Include(w => w.User)
                .FirstOrDefaultAsync(w => w.UserId == depositDto.UserId);

            if (wallet == null)
            {
                throw new InvalidOperationException($"No se encontró la billetera asociada al usuario con ID {depositDto.UserId}.");
            }

            wallet.TotalBalance += depositDto.Amount;
            wallet.AvailableBalance += depositDto.Amount;
            wallet.Version += 1;

            var transaction = new Transaction
            {
                WalletId = wallet.Id,
                Type = TransactionType.Deposit,
                Amount = depositDto.Amount,
                CreatedAt = DateTime.Now
            };

            _context.Transactions.Add(transaction);

            // 3.4: la acreditación manual de saldo se audita en el mismo SaveChanges
            // que el movimiento contable, para que ambos se confirmen o fallen juntos.
            _context.AuditLogs.Add(new AuditLog
            {
                Event = "SALDO_ACREDITADO",
                Details = $"Depósito de ${depositDto.Amount:F2} acreditado al usuario ID {depositDto.UserId}.",
                CreatedAt = DateTime.Now,
                UserId = depositDto.UserId
            });

            await _context.SaveChangesAsync();

            return MapToBalanceDto(wallet);
        }

        public async Task<IEnumerable<TransactionDto>> GetTransactionsByUserIdAsync(int userId)
        {
            var wallet = await _context.Wallets
                .AsNoTracking()
                .FirstOrDefaultAsync(w => w.UserId == userId);

            if (wallet == null)
            {
                return Enumerable.Empty<TransactionDto>();
            }

            var transactions = await _context.Transactions
                .Where(t => t.WalletId == wallet.Id)
                .OrderByDescending(t => t.CreatedAt)
                .AsNoTracking()
                .ToListAsync();

            return transactions.Select(t => new TransactionDto
            {
                Id = t.Id,
                WalletId = t.WalletId,
                Type = t.Type.ToString(),
                Amount = t.Amount,
                CreatedAt = t.CreatedAt
            });
        }

        public async Task HoldFundsAsync(int userId, decimal amount)
        {
            if (amount <= 0) throw new ArgumentException("El monto a retener debe ser positivo.");

            var wallet = await _context.Wallets
                .FirstOrDefaultAsync(w => w.UserId == userId);

            if (wallet == null) throw new InvalidOperationException("No se encontró la billetera del usuario.");

            if (wallet.AvailableBalance < amount)
            {
                throw new InvalidOperationException("Saldo disponible insuficiente para congelar en garantía.");
            }

            wallet.AvailableBalance -= amount;
            wallet.HeldBalance += amount;
            wallet.Version += 1;

            // Ledger (2.1 / Módulo 4): la retención debe quedar registrada como movimiento,
            // no solo como un cambio de campo en la billetera.
            _context.Transactions.Add(new Transaction
            {
                WalletId = wallet.Id,
                Type = TransactionType.Hold,
                Amount = amount,
                CreatedAt = DateTime.Now
            });

            await _context.SaveChangesAsync();

            // RF-48: Registrar en la bitácora de auditoría
            await _auditService.LogAsync(
                "FONDOS_RETENIDOS",
                $"Monto de ${amount:F2} retenido en garantía para usuario ID {userId}.",
                userId
            );
        }

        public async Task ReleaseFundsAsync(int userId, decimal amount)
        {
            if (amount <= 0) return;

            var wallet = await _context.Wallets
                .FirstOrDefaultAsync(w => w.UserId == userId);

            if (wallet == null) return;

            var releaseAmount = Math.Min(wallet.HeldBalance, amount);

            wallet.HeldBalance -= releaseAmount;
            wallet.AvailableBalance += releaseAmount;
            wallet.Version += 1;

            var releaseTx = new Transaction
            {
                WalletId = wallet.Id,
                Type = TransactionType.Release,
                Amount = releaseAmount,
                CreatedAt = DateTime.Now
            };

            _context.Transactions.Add(releaseTx);
            await _context.SaveChangesAsync();
        }

        public async Task TransferFundsAsync(int buyerUserId, int sellerUserId, decimal amount)
        {
            if (amount <= 0) return;

            var buyerWallet = await _context.Wallets.FirstOrDefaultAsync(w => w.UserId == buyerUserId);
            var sellerWallet = await _context.Wallets.FirstOrDefaultAsync(w => w.UserId == sellerUserId);

            if (buyerWallet == null || sellerWallet == null)
            {
                throw new InvalidOperationException("Error al procesar liquidación: Billeteras no encontradas.");
            }

            // Débito final del comprador (de la retención)
            var transferAmount = Math.Min(buyerWallet.HeldBalance, amount);
            buyerWallet.HeldBalance -= transferAmount;
            buyerWallet.TotalBalance -= transferAmount;
            buyerWallet.Version += 1;

            var buyerPaymentTx = new Transaction
            {
                WalletId = buyerWallet.Id,
                Type = TransactionType.Payment,
                Amount = transferAmount,
                CreatedAt = DateTime.Now
            };
            _context.Transactions.Add(buyerPaymentTx);

            // Acreditación al vendedor
            sellerWallet.TotalBalance += transferAmount;
            sellerWallet.AvailableBalance += transferAmount;
            sellerWallet.Version += 1;

            var sellerDepositTx = new Transaction
            {
                WalletId = sellerWallet.Id,
                Type = TransactionType.Deposit,
                Amount = transferAmount,
                CreatedAt = DateTime.Now
            };
            _context.Transactions.Add(sellerDepositTx);

            await _context.SaveChangesAsync();
        }

        private static WalletBalanceDto MapToBalanceDto(Wallet wallet)
        {
            return new WalletBalanceDto
            {
                WalletId = wallet.Id,
                UserId = wallet.UserId,
                UserName = wallet.User?.Name ?? string.Empty,
                TotalBalance = wallet.TotalBalance,
                HeldBalance = wallet.HeldBalance,
                AvailableBalance = wallet.AvailableBalance,
                Version = wallet.Version
            };
        }
    }
}
