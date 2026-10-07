# Analizador de Riesgo (GovTrace Backend)

Resumen rápido:
- `AnalizadorRiesgoService` ejecuta reglas sencillas sobre licitaciones y adjudicaciones para detectar anomalías y crear alertas automáticamente.
- Scheduler configurable vía la variable de entorno `ANALYZER_INTERVAL_MS` (milisegundos). Valor por defecto: 5 minutos.

Endpoints relevantes:
- `POST /api/analizador/run` — Ejecuta el analizador manualmente (requiere rol `ADMIN`).
- `GET /api/analizador/status` — Devuelve si el analizador está en ejecución y la hora de la última ejecución.
- `GET /api/analizador/ultimas-alertas?limit=N` — Devuelve las últimas N alertas (por defecto 10).

Cómo usar:
1. Arranca el backend normalmente (`pnpm dev`).
2. (Opcional) Cambia el intervalo por defecto con `ANALYZER_INTERVAL_MS=60000` para ejecutar cada minuto.
3. Llama a los endpoints desde el dashboard o con `curl`.

Notas técnicas:
- El analizador crea alertas reutilizando el `AlertasService` y evita duplicados basándose en `licitacion_id` y `tipo_alerta`.
- Por simplicidad las reglas actuales son heurísticas básicas (duración < 15 días, presupuesto > 1.3× promedio, calificación proveedor < 3.0). Puedes ampliar las reglas en `backend/src/services/AnalizadorRiesgoService.ts`.
