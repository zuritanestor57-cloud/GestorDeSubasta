# Prueba de concurrencia optimista (Stress Test)

Demuestra el requisito del TP: si se mandan dos pujas idénticas al mismo tiempo, la base de datos registra solo una y rechaza la otra con `409 Conflict`.

No toca código del backend ni del frontend. Solo usa `curl` contra la API ya corriendo — la lógica que hace que esto funcione (`Version` + `DbUpdateConcurrencyException` → 409) ya existe en `AuctionService.PlaceBidAsync`.

## Prerrequisitos

- El backend corriendo (`dotnet run`, en `Backend/GestorSub/GestorSub`).
- Una subasta en estado **Active** (podés consultarlas en `GET /api/auctions`).
- El id de un usuario con saldo **disponible** suficiente para pujar, que no sea el vendedor de esa subasta.

## Cómo correrlo

1. Abrí `concurrency-test.sh` y editá las 3 variables de arriba:
   - `AUCTION_ID`: la subasta elegida.
   - `USER_ID`: el usuario que puja.
   - `AMOUNT`: tiene que ser `currentBid + minimumIncrement` de esa subasta (el script imprime el estado actual de la subasta al arrancar, para chequearlo).
2. Corré el script:
   ```bash
   bash concurrency-test.sh
   ```

## Qué vas a ver

Dos líneas con el código HTTP de cada puja:

```
Puja 1 -> HTTP 200
Puja 2 -> HTTP 409
```

(o al revés — cuál gana depende de una carrera, no es determinístico cuál de las dos llega primero).

Y el cuerpo completo de cada respuesta:
- La que da **200**: el `BidResultDto` con la puja aceptada.
- La que da **409**: el mensaje `"La subasta ID {id} fue modificada por otra puja concurrente. Reintente la operación."`

Los dos archivos (`resultado_1.json`, `resultado_2.json`) quedan guardados en esta carpeta como evidencia.

## Para el informe / README principal

Pegar la salida de la consola (los 2 códigos HTTP) y el contenido de `resultado_1.json`/`resultado_2.json` alcanza como demostración de que la concurrencia optimista funciona.
