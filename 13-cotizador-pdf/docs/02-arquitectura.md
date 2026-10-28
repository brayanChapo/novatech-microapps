# 02 · Arquitectura — Cotizador con PDF

Los diagramas usan **Mermaid** (se ven directamente en GitHub y en VS Code con la extension "Markdown Preview Mermaid Support").

## 1. Contexto (C1)

```mermaid
flowchart LR
    ADM["Admin\n(navegador)"] -->|configura catalogo, plantilla y condiciones| WEB["Web / PWA\nNext.js"]
    VEN["Vendedor\n(navegador)"] -->|crea cotizaciones| WEB
    CLI["Cliente\n(correo / link)"] -.->|recibe PDF y aprueba o rechaza| MAIL["Correo\n(Resend)"]
    WEB -->|HTTPS + JWT| API["API Cotizador\nHono en Vercel"]
    API -->|service_role| DB[("PostgreSQL\nSupabase")]
    API -->|login| AUTH["Supabase Auth"]
    API -->|guarda PDF generado| STO["Supabase Storage\n(bucket cotizaciones)"]
    API -.->|envia PDF al cliente| MAIL
    API -.->|link wa.me con PDF| WA["WhatsApp\n(enlace wa.me sin API)"]
```

## 2. Contenedores (C2)

```mermaid
flowchart TB
    subgraph Cliente
      F["frontend/ — Next.js 16\n• Login (admin, vendedor)\n• Constructor de cotizacion con lineas de items\n• Calculo en tiempo real: subtotal, descuento, IGV, total\n• Vista previa del PDF antes de enviar\n• Historial de versiones por cotizacion\n• Cambio de estado manual (aceptada / rechazada)\n• Dashboard: pipeline de cotizaciones por estado"]
    end
    subgraph "Vercel (equipo NovaTech)"
      B["backend/ — Hono + Zod\n• Valida JWT y carga perfil\n• POST /cotizaciones: valida, calcula totales, persiste\n• POST /cotizaciones/:id/generar-pdf: genera PDF server-side\n• POST /cotizaciones/:id/enviar: envia por correo con PDF adjunto\n• Job vencimiento: cotizaciones enviadas sin respuesta tras N dias\n• Numeracion correlativa COT-YYYY-NNNN por empresa\n• Versionado: nueva version al editar una cotizacion enviada"]
    end
    subgraph "Supabase (proyecto compartido)"
      AU["Auth (JWT)"]
      PG[("PostgreSQL\nesquemas core + cotizador\nRLS en todas las tablas")]
      ST["Storage bucket cotizaciones\n(PDFs, privado)"]
    end
    subgraph Externo
      MAIL["Servicio de Correo\n(Resend)"]
    end
    F --> B
    F --> AU
    B -->|service_role, filtra empresa_id| PG
    B -->|PUT PDF| ST
    B -->|envia con adjunto| MAIL
```

**Principio clave:** el **PDF se genera en el servidor** (nunca en el navegador del vendedor) usando la plantilla con logo y colores configurados por la empresa. Esto garantiza que el cliente siempre recibe un documento con la marca correcta independientemente del dispositivo desde el que trabaje el vendedor.

## 3. Secuencia principal: creacion y envio de cotizacion

```mermaid
sequenceDiagram
    autonumber
    actor V as Vendedor
    actor C as Cliente
    participant Web as PWA (Next.js)
    participant API as API (Hono)
    participant DB as PostgreSQL
    participant STO as Storage (PDFs)
    participant MAIL as Correo (Resend)

    V->>Web: crea cotizacion: cliente, items, descuentos, validez
    Web->>Web: calcula totales localmente para preview (sin IGV en borrador)
    V->>Web: confirma y guarda borrador
    Web->>API: POST /cotizaciones con lineas y configuracion
    API->>API: valida Zod y recalcula totales con IGV configurado
    API->>DB: INSERT cotizacion + lineas, numeracion correlativa
    API-->>Web: 201 con id y numero COT-2026-0001
    V->>Web: solicita preview del PDF
    Web->>API: POST /cotizaciones/:id/generar-pdf
    API->>DB: carga datos completos de la cotizacion y plantilla de empresa
    API->>API: renderiza PDF con logo, colores y condiciones (PDFKit)
    API->>STO: PUT cotizaciones/empresa_id/COT-2026-0001.pdf
    API-->>Web: URL firmada del PDF (10 min para preview)
    V->>Web: revisa PDF y confirma envio
    Web->>API: POST /cotizaciones/:id/enviar con email_cliente
    API->>DB: UPDATE estado a enviada, registra fecha_envio
    API->>STO: genera URL firmada publica de larga duracion (30 dias)
    API->>MAIL: envia correo al cliente con PDF adjunto y link de aprobacion
    MAIL-->>API: message_id
    API-->>Web: 200 cotizacion enviada
    C->>MAIL: recibe correo con PDF
    Note over C,DB: El cliente aprueba via link publico o responde al vendedor
    V->>Web: registra decision del cliente (aceptada/rechazada)
    Web->>API: PUT /cotizaciones/:id/estado
    API->>DB: UPDATE estado con timestamp
```

## 4. Diagrama de despliegue

```mermaid
flowchart LR
    GH["GitHub\nnovatech-microapps"] -->|push main| CI["GitHub Actions\ntests + typecheck"]
    CI -->|ok| V1["Vercel proyecto\ncotizador-pdf-api"]
    CI -->|ok| V2["Vercel proyecto\ncotizador-pdf-web"]
    V1 --> SB[("Supabase Pro\nproduccion-compartida\nesquema cotizador + Storage")]
    V2 --> SB
    V1 -->|API key| MAIL["Resend"]
```

| Componente | Proyecto Vercel | Dominio sugerido |
|---|---|---|
| API | `cotizador-pdf-api` (Root: `13-cotizador-pdf/backend`) | `api-cotizador.novatechconsulting.com.pe` |
| Web / PWA | `cotizador-pdf-web` (Root: `13-cotizador-pdf/frontend`) | `cotizador.novatechconsulting.com.pe` |
| Base de datos | Supabase `produccion-compartida` (esquema `cotizador`) | — |
| Storage | Supabase `produccion-compartida` bucket `cotizaciones` (privado) | — |

## 5. Decisiones de arquitectura (ADR)

| # | Decision | Alternativas | Motivo |
|---|---|---|---|
| ADR-01 | **PDF generado en el servidor** (PDFKit en Hono) | jsPDF en el navegador, Puppeteer | El servidor controla la plantilla con logo y colores del cliente; jsPDF en el browser no puede acceder a fuentes embebidas ni al logo almacenado en Storage privado. Puppeteer agrega 50-150 MB de binario a la funcion serverless. |
| ADR-02 | **Cotizacion enviada no editable** (se crea nueva version) (RN-02) | Edicion con historial de cambios | Cumple expectativa legal y comercial: el cliente recibio un documento especifico; si cambia, debe recibir uno nuevo con numero de version explicito (COT-2026-0001 v2). |
| ADR-03 | **IGV calculado en el servidor** con Zod, no en el cliente | Solo en el frontend | Evita discrepancias por redondeo entre lo que muestra el preview y lo que queda registrado; el servidor es la unica fuente de verdad del documento fiscal. |
| ADR-04 | **Vencimiento automatico via job** (Vercel Cron diario) | Solo estado manual | Una cotizacion vencida sin marcar como tal da informacion erronea al vendedor sobre el pipeline; el job garantiza el estado correcto sin accion humana. |
| ADR-05 | **Numeracion correlativa por empresa** guardada como sequence en DB | UUID como identificador publico | COT-2026-0001 es legible y trazable por el cliente; el UUID se mantiene como PK interno pero no se expone en el documento. |
| ADR-06 | **WhatsApp via enlace wa.me** (no Cloud API) | WhatsApp Business Cloud API | RF-06 especifica "sin costo de API"; wa.me genera un enlace precompuesto que abre WhatsApp con el texto del vendedor, sin requerir cuenta Business ni webhooks. |
| ADR-07 | **PDFs almacenados en Storage** (no regenerados cada vez) | Regenerar on demand | Garantiza que el documento enviado al cliente es identico al que se puede descargar meses despues; no hay riesgo de discrepancia por cambio de plantilla posterior. |

## 6. Estructura de codigo

```
13-cotizador-pdf/
├── backend/
│   ├── api/index.ts
│   ├── src/
│   │   ├── app.ts
│   │   ├── domain/
│   │   │   ├── cotizacion.ts          # calcularTotales, validarLineas, estadoPermitido
│   │   │   ├── numeracion.ts          # siguienteCorrelativo por empresa
│   │   │   └── version.ts             # crearNuevaVersion
│   │   ├── services/
│   │   │   ├── crearCotizacion.ts
│   │   │   ├── generarPDF.ts          # PDFKit + plantilla empresa
│   │   │   ├── enviarCotizacion.ts
│   │   │   └── procesarVencimientos.ts # job diario
│   │   ├── repos/
│   │   │   ├── CotizacionRepo.ts
│   │   │   ├── LineaRepo.ts
│   │   │   └── CatalogoRepo.ts
│   │   ├── routes/
│   │   │   ├── cotizaciones.ts        # POST, GET, PUT estado, generar-pdf, enviar
│   │   │   ├── catalogo.ts            # CRUD items con importacion CSV
│   │   │   └── admin.ts               # plantilla, logo, condiciones
│   │   ├── middleware/auth.ts
│   │   └── lib/
│   │       ├── supabase.ts
│   │       ├── storage.ts
│   │       ├── correo.ts
│   │       ├── pdf.ts                 # helpers PDFKit
│   │       └── errors.ts
│   └── tests/
├── frontend/
│   ├── app/
│   │   ├── login/
│   │   └── (panel)/
│   │       ├── cotizaciones/          # lista con filtros de estado
│   │       ├── cotizaciones/nueva/    # constructor con lineas
│   │       ├── cotizaciones/[id]/     # detalle, preview PDF, enviar
│   │       ├── catalogo/
│   │       └── admin/                 # plantilla y condiciones
│   ├── components/
│   │   ├── ConstructorLineas.tsx      # tabla editable de items
│   │   ├── ResumenTotales.tsx
│   │   ├── EstadoBadge.tsx
│   │   └── ui/
│   └── lib/
│       ├── api.ts
│       ├── calculos.ts                # preview local de totales
│       └── formato.ts
└── database/
    ├── migrations/20261028001300_cotizador.sql
    ├── seed.sql
    └── tests/rls_cotizador.test.sql
```
