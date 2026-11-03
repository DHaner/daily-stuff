# Daily Stuff

Finanzas, diario y tareas en un dashboard web, para correr en el homelab.

| Carpeta | Qué es |
| --- | --- |
| `daily-stuff.Server` | API en .NET 10 (`Controllers`, `Data`, `Models`) sobre PostgreSQL con EF Core |
| `daily-stuff.client` | SPA en React + Vite: TanStack (Query, Router, Table, Form) y Material UI con estilo *soft UI* en azul |
| `daily-stuff-mobile` | App de Expo / React Native; consume la API (ya no usa SQLite local) |

## Desarrollo

Necesitas .NET 10, Node 22 y Docker.

```bash
# 1. Base de datos (PostgreSQL en localhost:5432)
docker compose -f docker-compose.dev.yml up -d

# 2. API en http://localhost:5116 (aplica las migraciones al arrancar)
cd daily-stuff.Server && dotnet run --launch-profile http

# 3. Cliente en http://localhost:18953 (proxy de /api hacia la API)
cd daily-stuff.client && npm install && npm run dev
```

También puedes abrir `daily-stuff.slnx` en Visual Studio. Para apuntar el cliente a otra API: `API_URL=http://host:puerto npm run dev`.

### Migraciones

La herramienta `dotnet-ef` está en `dotnet-tools.json`:

```bash
dotnet tool restore
cd daily-stuff.Server
dotnet ef migrations add NombreDelCambio -o Data/Migrations
```

Las migraciones se aplican solas al arrancar la API (`Database:MigrateOnStartup`).

## Despliegue en el homelab

```bash
cp .env.example .env      # define POSTGRES_PASSWORD (y WEB_PORT si quieres)
docker compose up -d --build
```

Se levantan tres contenedores: `db` (PostgreSQL con volumen `db-data`), `server` (API, sin puerto publicado) y `client` (nginx: sirve la SPA y reenvía `/api` al servidor). La app queda en `http://<host>:8080`.

> No hay autenticación: está pensado para la red local. No lo expongas a internet sin ponerle un proxy con login delante.

Datos que conviene respaldar: la base de datos y los archivos subidos (fotos del diario y adjuntos de tareas, en el volumen `uploads`).

```bash
docker compose exec db pg_dump -U dailystuff dailystuff > backup.sql
docker run --rm -v daily-stuff_uploads:/data -v "$PWD":/backup alpine tar czf /backup/uploads.tar.gz -C /data .
```

## CI/CD (GitHub Actions)

- `.github/workflows/ci.yml` — en PR y en `main`: compila la API, lint + build del cliente y build de las imágenes Docker.
- `.github/workflows/cd.yml` — en `main`: construye y publica las imágenes en GHCR (`daily-stuff-server`, `daily-stuff-client`) y redespliega con `docker compose` en un **runner self-hosted** instalado en el homelab (GitHub no alcanza tu red local).

Para activar el despliegue:

1. Instala un [runner self-hosted](https://docs.github.com/actions/hosting-your-own-runners) en el servidor del homelab (con Docker).
2. Crea el environment `homelab` en el repo y agrega el secret `POSTGRES_PASSWORD` (opcional: variable `WEB_PORT`).
3. Si los paquetes de GHCR son privados, el workflow ya hace login con `GITHUB_TOKEN`.

## API

`/api/dashboard?month=yyyy-MM`, `/api/categories`, `/api/transactions` (gastos e ingresos, filtros `from`, `to`, `kind`, `categoryId`), `/api/journal/labels`, `/api/journal/entries`, `/api/todo-lists`, `/api/todo-tasks`, `/api/health`. En desarrollo hay OpenAPI en `/openapi/v1.json`.

## App móvil

`daily-stuff-mobile` habla con la misma API que la web. Pasos:

1. Copia `daily-stuff-mobile/.env.example` a `.env.local` y pon la URL del homelab en `EXPO_PUBLIC_API_URL` (emulador Android: `http://10.0.2.2:8080`; teléfono físico: la IP del homelab).
2. `pnpm install` y `pnpm dev`.
3. Como se agregó `expo-build-properties` (permite HTTP en Android) y se quitó `expo-sqlite`, hay que **regenerar el build nativo** (`npx expo prebuild --clean` / un nuevo development build o build de EAS). En builds de EAS define `EXPO_PUBLIC_API_URL` en `eas.json` (`env`) o como variable de EAS.

Detalles a tener en cuenta:

- Sin red, las lecturas salen de la caché local; las escrituras fallan (no hay cola offline).
- Los datos que tenías en el SQLite del teléfono no se migraron (se descartaron a propósito).
- La foto del diario y los adjuntos de tareas se suben a la API (`/api/journal/entries/{fecha}/photo`, `/api/todo-tasks/{id}/file`, máx. 25 MB). La web los respeta pero todavía no permite subirlos.
- `reminderAt` se guarda en el servidor, pero la notificación la programa cada teléfono, así que solo suena en el que la creó.
- Los iconos de categorías, etiquetas y listas se guardan con nombres de Lucide (como en la app móvil); la web muestra los que conoce y un icono genérico para el resto.
- Gastos e ingresos comparten una sola tabla (`Transactions`, con `Kind`); se omitieron los sub-gastos, que la app móvil ya no usa.
