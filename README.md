# ShelfSync Web

ERP web del inventario de bodega ShelfSync, construido con **Nuxt 4** + **Vue 3**. Consume `shelfsync-api` y comparte usuarios, artículos y fotos con la app móvil.

## Módulos

- **Dashboard**: KPIs por estatus, distribución, flujo de bodega, artículos listos para venta y últimos registros.
- **Inventario**: tabla o galería con búsqueda, filtros por estatus y paginación. Alta y edición con producto y fotos, cambio de estatus validado y detalle con galería e historial.
- **Catálogos**: categorías y productos (product-lookup).
- **Usuarios**: alta y edición, más la matriz de accesos por sección (ver, crear, editar, eliminar) basada en `menu` y `menu_users`.
- **Visor de fotos**: pantalla completa con zoom, arrastre, teclado y descarga del original. Está disponible para todos los usuarios.

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Nuxt 4 + Vue 3 |
| Estilos | Tailwind CSS v4 (`@theme` en `app/assets/css/main.css`) |
| Iconos | `@nuxt/icon` + Lucide (`<Icon name="lucide:package" />`, constantes en `const/icons.const.ts`) |
| Estado | Pinia (`app/store`) |
| Gráficas | Chart.js + vue-chartjs |
| Fechas | dayjs-nuxt (es) |

## Estructura

```
app/
├── components/   common/ (Modal, Dropdown, Input, Search, PhotoThumb, ImageViewer) · ui/ (DataTable, PageHeader…)
│                 layout/ · dashboard/ · inventory/ · catalogs/ · users/
├── composables/  useModal, useToast, usePermissions, usePhotos, useImageViewer
├── const/        icons, items (estatus/transiciones), menu (fallback)
├── middleware/   auth.global.ts (sesión + acceso por menú)
├── pages/        index, login, inventory/, catalogs, users
├── plugins/      api.ts ($api con Bearer y logout en 401)
├── services/     una función por recurso del API
├── store/        auth, menu, items, catalog
└── types/
```

## Desarrollo

```bash
cp .env.example .env   # NUXT_PUBLIC_API_BASE=http://localhost:4000
npm install
npm run dev            # http://localhost:3000
```

Revisiones: `npm run lint` y `npx vue-tsc --noEmit -p .nuxt/tsconfig.app.json`.

## Deploy (Portainer + Cloudflare Tunnel)

Se despliega igual que `shelfsync-api` y la PWA: un stack de Portainer que construye la imagen en el server.

1. **Portainer → Stacks → Add stack → Repository**
   - Repo: `https://github.com/Fernando196/shelfsync-web`, ref `refs/heads/main`, compose path `docker-compose.yml`.
   - Nombre del stack: `shelfsync-erp`. No uses `shelfsync-web`, que es la PWA móvil.
   - Variables opcionales, con estos valores por defecto:
     - `NUXT_PUBLIC_API_BASE=https://shelfsync-api.fernandomorales.dev`: URL pública para el navegador y las fotos.
     - `NUXT_API_BASE_SERVER=http://shelfsync-api:4000`: el SSR usa la red interna `tunnel`.
2. **Cloudflare Zero Trust → Tunnels → home-server → Public hostname**
   - Agrega `erp-inv.fernandomorales.dev` → `http://shelfsync-erp:3000`.
   - Usa un subdominio de un solo nivel.
3. **Actualizar:** Portainer → stack → *Pull and redeploy*.

El contenedor no publica puertos en el host y está en la red externa `tunnel`, junto a cloudflared. Un dominio nuevo puede quedar en la caché negativa del DNS del router (~30 min); pruébalo con datos móviles o con 1.1.1.1.
