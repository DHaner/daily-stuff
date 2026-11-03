# AGENTS.md

Guía para agentes de codificación que trabajen en **Finanzas**, una app de control de
gastos personales hecha con Expo + React Native.

## Qué es la app

Registra gastos diarios. Un gasto tiene **concepto, gasto total, descripción y categoría**,
y opcionalmente se compone de varios **sub-gastos** (cada uno con su propio concepto,
gasto, descripción y categoría). Ejemplo: un pedido de Amazon con 3 productos es un gasto
con 3 sub-gastos.

Pantallas:

| Ruta | Archivo | Qué hace |
| --- | --- | --- |
| `/` | `app/(tabs)/index.tsx` | Tab "Finanzas": historial completo agrupado por día, doughnut del mes visible, FAB para agregar |
| `/expense/new` | `app/expense/new.tsx` | Modal (`presentation: 'modal'`) para crear un gasto |
| `/expense/[id]` | `app/expense/[id].tsx` | Detalle del gasto; el icono de lápiz cambia a modo edición |
| `/journal` | `app/(tabs)/journal.tsx` | Tab "Diario": lista de entradas (una por día) filtrada por mes, con FAB para escribir la de hoy |
| `/journal/[date]` | `app/journal/[date].tsx` | Crea/edita la entrada de un día: ánimo (good/normal/meh/bad/awful), nota, 1 foto y etiquetas |
| `/tasks` | `app/(tabs)/tasks.tsx` | Tab "Tareas" (to-do): vistas Mi día (por fecha de vencimiento) / Importantes / Todas / una por lista, alta rápida abajo; datos en `lib/api/todos.ts` + `hooks/use-todos.ts` |
| `/task/[id]` | `app/task/[id].tsx` | Edita una tarea: nombre, descripción, lista, vencimiento, recordatorio (notificación local vía `lib/todo-notifications.ts`) y archivo (`lib/todo-files.ts`) |
| `/task/list` | `app/task/list.tsx` | Crea/edita/elimina una lista (nombre + icono + color); al borrarla sus tareas quedan sin lista |
| `/categories` | `app/categories.tsx` | Crea, edita y elimina categorías de gastos/ingresos (nombre + icono + color) |
| `/journal/labels` | `app/journal/labels.tsx` | Crea, edita (tocando una) y elimina etiquetas (nombre + icono + color; el servidor siembra 5 por defecto); el icono se elige en `components/journal/icon-picker.tsx` |

## Comandos

```bash
pnpm install
```

```bash
pnpm dev
```

```bash
pnpm lint
```

- `pnpm dev` → `expo start -c` (limpia la caché de Metro; Uniwind regenera
  `uniwind-types.d.ts` al arrancar el bundler).
- `pnpm lint` → `tsc --noEmit`. **Ejecútalo siempre antes de dar por terminado un cambio.**
- `pnpm format` → Prettier.
- Para verificar que todo empaqueta sin arrancar un emulador:
  `npx expo export -p android --output-dir <tmp>`.

### Development build vs. Expo Go

Ya no hay ningún módulo nativo custom (se quitó `react-native-mmkv`/Nitro en favor de
`@react-native-async-storage/async-storage`, que Expo Go sí soporta), así que en principio
la app corre en Expo Go: `npx expo start` y escanear el QR. Si necesitas un development
build (por ejemplo, para agregar más adelante un módulo que Expo Go no soporte):

```bash
npx expo prebuild --clean
```

```bash
npx expo run:android
```

Cada vez que cambien las dependencias nativas (subir de SDK, agregar/quitar un módulo con
código nativo), hay que repetir `prebuild --clean` — si no, `android/` queda desalineado
con `node_modules` y falla el autolinking en tiempo de ejecución.

## Stack

| Área | Librería | Notas |
| --- | --- | --- |
| Navegación | `expo-router` | Rutas por archivos en `app/`, `typedRoutes` activado |
| Estilos | `uniwind` + Tailwind v4 | CSS-first: **no hay `tailwind.config.js`**, los tokens viven en `global.css` |
| Componentes | React Native Reusables (shadcn) | `components/ui/`, se agregan con la CLI (ver abajo) |
| Estado servidor | `@tanstack/react-query` + `-persist-client` | Caché persistida en AsyncStorage |
| Validación | `zod` v4 | `lib/schemas/expense.ts` |
| Formularios | `react-hook-form` + `@hookform/resolvers` | `useFieldArray` para los sub-gastos |
| Datos | API `daily-stuff.Server` (.NET + PostgreSQL) | `fetch` en `lib/api/`; la URL sale de `EXPO_PUBLIC_API_URL` |
| Key-value | `@react-native-async-storage/async-storage` | Tema, perfil, caché de queries e ids de notificaciones; API asíncrona |
| Listas | `@shopify/flash-list` | v2, no necesita `estimatedItemSize` |
| Gráfica | `react-native-chart-kit` + `react-native-svg` | `PieChart` con agujero simulado |
| Calendario | `react-native-calendars` | Locale `es` configurado en `date-picker.tsx` |
| Iconos | `lucide-react-native` | Siempre vía `<Icon as={XIcon} />`; las etiquetas del diario guardan el nombre del icono (`lib/journal-icons.ts`) |
| Fotos | `expo-image-picker` + `expo-file-system` + `expo-image` | La foto del diario se copia a `Paths.document/journal` (`lib/journal-photos.ts`) |
| Gestos | `react-native-gesture-handler` | `GestureHandlerRootView` en el layout raíz |

## Estructura

```
app/                  Rutas (expo-router)
components/ui/        Primitivas shadcn/RNR — no editar a mano salvo bugfix puntual
components/expenses/  Componentes de dominio (card, doughnut, formulario, pickers)
hooks/use-expenses.ts Hooks de TanStack Query (queries + mutations)
lib/api/              client.ts (fetch + subida de archivos) y un módulo por dominio que llama a la API
lib/schemas/          Esquemas zod: dominio y formulario
lib/                  categories, breakdown, date, format, storage, theme, query-client
```

## Convenciones

**Filtro de fechas (Finanzas, Diario y Tareas).** Los tres muestran el historial completo, del más reciente al más antiguo. El header lleva `components/month-nav.tsx` (`< Mes, Año >`, siempre visible; el label abre un selector de meses con scroll y degradados) y `hooks/use-month-scroll.ts` sincroniza ese mes con lo que se ve al hacer scroll y salta al primer registro del mes elegido. Finanzas y Tareas insertan un encabezado por día con `lib/day-groups.ts`; cada tarjeta del Diario ya es un día.

**Fechas.** El día es siempre un `DayKey` (`yyyy-MM-dd`), en la API, en las query keys y en
la UI. Usa los helpers de `lib/date.ts`; no formatees fechas a mano.

**Dinero en formularios.** Los `TextInput` devuelven strings. Por eso el esquema de
formulario valida strings y los transforma a `number`, y los formularios se tipan como
`useForm<ExpenseFormInput, unknown, ExpenseFormValues>` (`z.input` → `z.output`). Los
valores que llegan a la capa de datos ya son números.

**Total de un gasto compuesto.** Si hay sub-gastos, `total` es de solo lectura y se calcula
como la suma de sus montos (ver el `useEffect` en `expense-form.tsx`). Si la suma no cubre
el total (envío, impuestos), el remanente se atribuye a la categoría del gasto padre —
esa regla vive en `getCategoryBreakdown` (`lib/breakdown.ts`) y en el detalle del gasto.

**Categorías.** Son editables por el usuario y viven en el servidor
(id, tipo `gasto`/`ingreso`, nombre, icono, color hex, posición; el servidor siembra las de inicio). `lib/categories.ts` mantiene un registro en memoria: `getCategory(id)`
es síncrona (para helpers puros como `breakdown`), y `useCategories()` suscribe al componente para
que se re-renderice cuando se editan (úsalo en todo componente que pinte una categoría y, si
memoizas algo con etiquetas/colores, añade `version` a las dependencias). `CategoriesGate`
(en `app/_layout.tsx`, vía `useCategoriesSync`) carga el registro desde la API antes del primer
render y `hooks/use-categories.ts` lo recarga tras cada cambio. `otros` / `otros_ingreso` son el respaldo: se pueden editar pero no
eliminar; al borrar una categoría, sus gastos/ingresos pasan a ese respaldo. El color es hex
porque chart-kit y react-native-calendars no leen clases de Tailwind. Se gestionan en `/categories`.

**Acceso a datos.** Los componentes nunca llaman a la API directamente: usan los hooks de
`hooks/use-expenses.ts`, que envuelven las funciones de `lib/api/transactions.ts`. Toda mutación
invalida el árbol `['expenses']`. La API guarda gastos e ingresos en una sola tabla (`kind`); los
módulos de `lib/api/` traducen a los tipos de la app (`total` ↔ `amount`, `gasto` ↔ `expense`).

**API y red.** `EXPO_PUBLIC_API_URL` (ver `.env.example`) apunta al nginx del homelab. Sin red, las
lecturas salen de la caché persistida y las mutaciones fallan (no hay cola offline). El esquema y
las migraciones viven en `daily-stuff.Server`, no aquí.

**Adjuntos.** La foto del diario y el archivo de una tarea se suben al servidor aparte de la
entrada/tarea (`PUT .../photo`, `PUT .../file`); `photoUri` / `fileUri` son URLs de la API, y una
URI local significa "recién elegido, falta subir". Los recordatorios guardan `reminderAt` en el
servidor, pero la notificación se programa en cada teléfono (`lib/todo-notifications.ts` guarda su
id en AsyncStorage), así que solo suena en el dispositivo donde se creó.

**Componentes UI.** Para traer otro componente de RNR:

```bash
pnpm dlx @react-native-reusables/cli@latest add <componente>
```

La CLI detecta Uniwind sola. Ojo: algunos componentes generados llegan con la prop
`placeholderClassName`, que Uniwind no declara — si `tsc` se queja, quítala (ya se hizo en
`input.tsx` y `textarea.tsx`).

**Tema.** `Uniwind.setTheme('light' | 'dark' | 'system')` y `useUniwind()`. La preferencia se
persiste en AsyncStorage, que es asíncrono — por eso `app/_layout.tsx` mantiene visible el
splash screen (`expo-splash-screen`) mientras `applyStoredThemePreference()` resuelve, y
solo entonces monta el árbol real; así no hay parpadeo del tema equivocado. `lib/theme-preference.ts`
guarda además una copia en memoria (`cachedPreference`) para que `useThemePreference()` (usado
por el botón de la cabecera) arranque ya con el valor correcto. Los colores en clases
Tailwind salen de `global.css`; el espejo en hex para librerías de terceros está en
`PALETTE` (`lib/theme.ts`) — si cambias uno, cambia el otro.

**Doughnut.** `PieChart` de chart-kit no tiene radio interior. El agujero es un `View`
circular con `bg-card` encima del centro, y `paddingLeft={width / 4}` recentra el pie (por
defecto lo dibuja en `width / 4`). Si cambias el ancho o el alto, revisa esa aritmética en
`components/expenses/expenses-doughnut.tsx`.

**Idioma.** Toda la UI está en español. Los comentarios y nombres de código, en inglés.
