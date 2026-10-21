# ShelfSync Web — guía para Claude

ERP web del inventario de bodega ShelfSync (Nuxt 4 + Vue 3 + Tailwind v4 + Pinia). Consume **shelfsync-api** y comparte datos con la app móvil. Textos de UI en **español**.

## Comandos

```bash
npm run dev                                       # http://localhost:3000 (API en NUXT_PUBLIC_API_BASE, default http://localhost:4000)
npm run lint                                      # ESLint (Nuxt + Prettier)
npx vue-tsc --noEmit -p .nuxt/tsconfig.app.json   # typecheck (nuxt typecheck no da código de salida fiable)
npx nuxt build                                    # build de producción
```

Antes de dar algo por terminado, corre typecheck y lint, y deben salir con código 0.

## Proyectos y sesiones hermanas

- **inv-api** = `C:\dev\shelfsync\shelfsync-api` (NestJS + TypeORM + Postgres, local `:4000`, prefijo `/api`). Los cambios de backend (tablas o endpoints) se piden a la sesión `inv-api` con SendMessage. No edites ese repo directamente; esa sesión confirma con el usuario antes de tocar la BD.
- **inv-app** = `C:\dev\shelfsync\shelfsync-mobile` (Expo/React Native), rama `web`. **Nunca se mergea `web` a master.** Es la referencia de branding, estatus y reglas de negocio.
- La estructura y los patrones se tomaron de https://github.com/Fernando196/laundry-management (Nuxt 4). Se sigue su organización, no su contenido.

## Estructura y patrones (respétalos)

```
app/
├── components/  common/ (Modal/, Dropdown/, InputWrapper, Search, Empty, PhotoThumb, ImageViewer/)
│                ui/ (DataTable, PageHeader, TableToolbar, Pagination, ModalHost, ToastHost)
│                layout/ · dashboard/ · inventory/ · catalogs/ · users/
├── composables/ useModal, useToast, usePermissions, usePhotos (+compressImage), useImageViewer
├── const/       icons.const.ts, items.const.ts (estatus, transiciones, condición), menu.const.ts (fallback)
├── middleware/  auth.global.ts
├── pages/       index (dashboard), login, inventory/index, inventory/[id], catalogs, users
├── plugins/     api.ts  → provee $api
├── services/    XService() = () => { const { $api } = useNuxtApp(); return { ...métodos } }
├── store/       *.store.ts (Pinia setup stores, se importan explícitamente desde '~/store/...')
├── types/       *.type.ts (interfaces con prefijo I)
└── utils/       api.ts (cookies, getErrorMessage, toCatalogQuery), format.ts (formatMoney, toMoneyValue)
```

- **Modales:** `const { openModal, close } = useModal()`, y luego `await openModal<Result>(Componente, props)`. El modal llama `close(resultado)` o `close()` para cancelar. Se renderizan en `ModalHost`. **No uses `await` de nivel superior en el `<script setup>` de un modal** (no hay `<Suspense>`): carga datos en `onMounted`.
- **Confirmaciones:** `ConfirmModal` con `{ title, message, confirmText, danger }`.
- **Notificaciones:** `useToast().success(msg)` / `.error(errorDelApi)`. `.error` ya extrae el `message` del error de Nest.
- **Tablas:** `DataTable` con `columns: TableColumn<T>[]`, slots `#cell-<key>` y `#actions`, y las props `loading` y `rowKey`.
- **Componentes:** se importan explícitamente (como en el repo de referencia), no por auto-import.
- **Estilo:** Prettier sin `;`, comillas simples, `vueIndentScriptAndStyle`, ancho de 100.

## Iconos

Usa **`@nuxt/icon` con la colección Lucide** (local, `@iconify-json/lucide`). No crees SVG propios.
- Uso: `<Icon :name="CAT_ICONS.ADD" class="size-4" />` o `<Icon name="lucide:package" />`.
- Agrega los iconos nuevos a `CAT_ICONS` en `const/icons.const.ts`. Catálogo: https://icones.js.org/collection/lucide
- El API guarda `menu.icon` como clave corta (`dashboard`, `inventory`, `catalogs`, `users`). `resolveMenuIcon()` la traduce a Iconify y también acepta nombres completos (`lucide:boxes`).

## Branding (igual que la app móvil)

- **Primario:** slate `#334155`. **Acento/CTA:** emerald `#059669`. **Fondo:** `#f8fafc`. Tarjetas blancas con borde slate-200, `rounded-2xl`; botones `rounded-xl`; diseño plano.
- **Clases globales** en `main.css`: `.btn`, `.btn-primary` (verde), `.btn-dark` (slate), `.btn-danger`, `.btn-sm`, `.btn-icon`, `.card`, `.badge` + `.badge-{neutral|amber|indigo|emerald|rose}`, `.input-content`, `.input-label-muted`.
- **Tonos por estatus:** recibido/vendido = neutral, por armar/en pausa = ámbar, armando = índigo, listo = esmeralda, dañado = rosa.

## API (shelfsync-api) — contratos usados

- **Errores:** formato Nest `{ statusCode, message: string|string[], error }`. Respuestas sin wrapper, salvo `/items` e `/items/:id/history`, que devuelven `{ data, count }`.
- **Auth:**
  - `POST /auth/login { userName, password }` devuelve `{ accessToken, user }`.
  - `GET /auth/me` devuelve el usuario del token.
  - Se usa `Authorization: Bearer`. No hay refresh token. Si llega un 401, se hace logout.
- **Items:**
  - Listado y conteos:
    - `GET /items?q&status=a,b&limit&offset`; `limit` vale 20 por defecto, máximo 100. Ordena por `createdAt DESC`. Los items del listado traen `cover`, no `files`.
    - `GET /items/status-counts?q` devuelve `{ total, counts }`.
  - Detalle e historial:
    - `GET /items/:id` devuelve el item completo.
    - `GET /items/:id/history` devuelve el historial de estatus.
  - Alta, edición y baja:
    - `POST /items` es un upsert. Se envía `id: crypto.randomUUID()`.
    - El producto es **obligatorio**: `productLookupId` o `productLookup{sku,barcode,description,needAssembly}`, con al menos uno de esos tres campos.
    - `PATCH /items/:id` acepta `null` para borrar `name/location/notes/categoryId/price/cost`. `DELETE /items/:id` es soft delete.
  - Estatus: `PATCH /items/:id/status { status, comment? }`.
    - "dañado" exige `comment`.
    - "vendido": primero se guarda el precio con `PATCH price`.
    - Las transiciones son válidas según `ALLOWED_FROM` (copiado en `items.const.ts` → `getNextStatuses`). Si no, el API responde 409.
  - Fotos:
    - `POST /items/:id/photos` (multipart, campo `photos`, máximo 10 de 10 MB). Se comprimen antes a JPEG de 2048 px con calidad 0.85 (`compressImage`).
    - `DELETE /items/:id/photos/:photoId` y `PATCH /items/:id/cover { photoId|null }`.
    - Toda mutación devuelve el item completo.
  - Precio y costo: número ≥ 0 con máximo 2 decimales (usa `toMoneyValue`).
- **Fotos:**
  - Las URLs son **relativas al host sin `/api`** (`/uploads/...`) y públicas. Resuélvelas con `usePhotos().photoUrl(photo, 'thumb'|'medium'|'original')`.
  - Tamaños: thumbnail de 240 px y medium de 800 px WebP, que pueden venir en `null`; en ese caso se usa la URL original.
  - Portada: `coverPhotoId`, o la foto más nueva si no hay.
- **Catálogos:**
  - Endpoints: `/categories` (id, name, active) y `/product-lookup` (id, sku, barcode, description, needAssembly). También `/users` (id, userName, email ≤ 50, fullName; password ≥ 6 solo al crear o cambiar).
  - Devuelven arrays planos sin total. Paginan con `page` + `limit` (`limit` solo aplica junto con `page`).
  - Filtros: `filters[campo][op]=valor` con `eq|like|gte|lte|in` (`in` acepta valores separados por comas). Se combinan con AND. Usa `toCatalogQuery()`. Para fechas usa `gte/lte`.
- **Menú dinámico** (tablas `menu` y `menu_users`):
  - `GET /menu/me` devuelve el árbol que el usuario puede ver: `{ id, name, path, icon, parentId, order, canView, canCreate, canEdit, canDelete, children }`.
  - Administración, que requiere `canEdit` en `/users` (si no, 403):
    - `GET /menu`
    - `GET /users/:id/menu`
    - `PUT /users/:id/menu { items: [{ menuId, canView, canCreate, canEdit, canDelete }] }`. **Reemplaza todo**: los menús que no se envíen quedan sin acceso.
  - No hay endpoints para crear items de menú (se hace por migración).
  - Decisión del usuario (2026-10-21): por ahora **todos los usuarios tienen acceso total**.
- No existen: roles, almacenes, marcas, kárdex ni endpoints de métricas. El dashboard se arma con `status-counts` + `/items`.

## Sesión, permisos y gotchas

- La sesión vive en las cookies `ss_token` y `ss_user` (`store/auth.store.ts`).
- **`plugins/api.ts` lee el token del store de Pinia en cada petición.** No vuelvas a crear un `useCookie` propio en el plugin. Nuxt sincroniza de forma asíncrona los refs de la misma cookie: justo después del login, el plugin mandaba peticiones sin token (401), y el menú y el dashboard quedaban vacíos.
- `middleware/auth.global.ts` funciona así:
  - Sin token, redirige a `/login?redirect=`.
  - Una vez por sesión carga en paralelo `menuStore.fetchMenu()` + `auth.fetchMe()`.
  - Si el usuario no tiene la ruta en su menú, lo manda a la primera ruta permitida.
- `menuStore.fetchMenu()` usa `FALLBACK_MENU` (acceso total) si el API no tiene `/menu/me`; `menuStore.source` indica `'api'` o `'fallback'`.
- **Permisos en UI:** `const permissions = usePermissions('/inventory')`, y luego `v-if="permissions.canCreate|canEdit|canDelete"`. Rutas hijas como `/inventory/:id` heredan los permisos de `/inventory`.
- **Visor de fotos:** está disponible para **todos** los usuarios. Se usa con `useImageViewer().openViewer(photos, index, title)` o el componente `PhotoThumb` (abre el visor al hacer clic; usa `:zoomable="false"` si va dentro de un enlace).
- `useAsyncData` siempre debe devolver un valor (no `undefined`). Si falla, muestra el error en la UI; nunca te quedes en ceros sin avisar.

## Deploy

- **Stack de Portainer:** `shelfsync-erp`, desde git (`main`, `docker-compose.yml`). La imagen se construye en el server y no hay registry. El redeploy es manual.
- **Nombres:** contenedor y servicio `shelfsync-erp`, puerto 3000. **No uses `shelfsync-web`**, que es la PWA de la app móvil.
- **Red y puertos:** red externa `tunnel` (compartida con cloudflared y shelfsync-api). No se publican puertos en el host.
- **Cloudflare:** las rutas se configuran en el dashboard de Cloudflare (tunnel `home-server`) y apuntan a `http://shelfsync-erp:3000`.
- **Variables en runtime** (no requieren rebuild):
  - `NUXT_PUBLIC_API_BASE`: URL pública, para el navegador y las fotos.
  - `NUXT_API_BASE_SERVER`: la usa el SSR, en `http://shelfsync-api:4000`. En `plugins/api.ts`, el servidor la prefiere sobre la pública.
- **Antes de tocar el Dockerfile:** el `npm ci` usa `--ignore-scripts`, porque el postinstall `nuxt prepare` necesita el código fuente.

## Cómo probar con datos reales

- El API local debe estar en `:4000`; usuarios: `fmorales`, `fvasto`, `cguevara`.
- Para probar las páginas como lo haría el usuario, sin su contraseña, firma un JWT temporal (`{ sub: <userId>, userName }`, 15 min) con el `JWT_SECRET` del `.env` de shelfsync-api. No lo imprimas.
- Luego haz `curl -b "ss_token=<jwt>" http://localhost:3000/...`. Borra el token al terminar y avísale al usuario que lo hiciste.
