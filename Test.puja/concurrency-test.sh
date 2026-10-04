#!/usr/bin/env bash
# Prueba de concurrencia optimista (Optimistic Locking).
#
# Qué hace: manda DOS pujas IDÉNTICAS (misma subasta, mismo usuario, mismo
# monto) al mismo tiempo, en paralelo.
#
# Resultado esperado: el backend acepta una (200 OK) y rechaza la otra con
# 409 Conflict, porque las dos leen la misma Version de la subasta pero solo
# la primera en guardar consigue actualizarla (AuctionService.PlaceBidAsync,
# catch (DbUpdateConcurrencyException) -> ConflictException -> 409).
#
# No modifica nada del backend ni del frontend: solo le pega a la API por
# HTTP, con curl. Necesita el backend corriendo.

set -euo pipefail

# ---------------------------------------------------------------------------
# Config: ajustar estos 3 valores antes de correr el script.
#
# AUCTION_ID: el id de una subasta que esté en estado Active ahora mismo.
# USER_ID:    el id de un usuario con saldo DISPONIBLE suficiente para pujar
#             (que no sea el vendedor de esa subasta).
# AMOUNT:     tiene que ser >= currentBid + minimumIncrement de esa subasta
#             (se puede ver en la respuesta de la consulta de abajo).
# ---------------------------------------------------------------------------
BASE_URL="http://localhost:7197"
AUCTION_ID=7
USER_ID=3
AMOUNT=12000

echo "=== Estado actual de la subasta #$AUCTION_ID ==="
curl -s "$BASE_URL/api/auctions/$AUCTION_ID"
echo -e "\n"
echo "Si currentBid + minimumIncrement no coincide con AMOUNT=$AMOUNT,"
echo "edita las variables de arriba antes de seguir."
echo

BODY="{\"userId\": $USER_ID, \"amount\": $AMOUNT}"

echo "=== Enviando 2 pujas idénticas en paralelo ==="
echo "Body: $BODY"
echo

curl -s -o resultado_1.json -w "Puja 1 -> HTTP %{http_code}\n" \
  -X POST "$BASE_URL/api/auctions/$AUCTION_ID/bids" \
  -H "Content-Type: application/json" \
  -d "$BODY" &

curl -s -o resultado_2.json -w "Puja 2 -> HTTP %{http_code}\n" \
  -X POST "$BASE_URL/api/auctions/$AUCTION_ID/bids" \
  -H "Content-Type: application/json" \
  -d "$BODY" &

wait

echo
echo "=== Respuesta completa de la puja 1 ==="
cat resultado_1.json
echo
echo "=== Respuesta completa de la puja 2 ==="
cat resultado_2.json
echo
ahi 