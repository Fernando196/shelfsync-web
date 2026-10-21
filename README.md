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
