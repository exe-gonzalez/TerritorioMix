# 🏢 TerritorioMix - Sistema Integral de Relevamiento Territorial

**TerritorioMix** es una plataforma web full-stack, responsive (mobile-first) y con diseño visual **Bento Grid** para el relevamiento, gestión territorial, control de inmuebles y censo de edificaciones basada en el formulario oficial de relevamiento territorial.

---

## 🌟 Características Principales

### 1. Sistema de Roles de Seguridad
- **Usuario (`rol: "user"`)**:
  - Puede registrar nuevas manzanas y relevamientos completando todos los campos obligatorios (*Territorio*, *Manzana*, *Calle y Numeración*, *Tipo de Edificación*, *Observaciones*).
  - Consulta sus propios registros o el maestro territorial.
  - No puede editar ni eliminar registros consolidados de la base de datos.
- **Administrador (`rol: "admin"`)**:
  - **CRUD completo** sobre todos los registros territoriales (`GET`, `POST`, `PUT`, `DELETE`).
  - **Gestión de Usuarios**: creación de cuentas, asignación/revocación de roles y activación/desactivación de censistas.
  - **Dashboard Bento Grid**: métricas en tiempo real, desglose visual de edificaciones y estadísticas territoriales.
  - **Sistema de Copias de Seguridad (Backup & Restore)**: descarga y restauración en archivo JSON desde la interfaz o servidor.

### 2. Exportación Multiformato
- **PNG Alta Resolución**: Generado con `html2canvas`, optimizado para legibilidad en dispositivos móviles.
- **PDF Profesional**: Tablas formateadas con `jsPDF` y `jspdf-autotable`.
- **Hojas de Cálculo**: Exportación directa a `.csv` y `.xls` compatible con Microsoft Excel y Google Sheets.

### 3. Autenticación, JWT y Seguridad
- Contraseñas protegidas mediante hash con **`bcryptjs`**.
- Sesiones autenticadas por **JSON Web Tokens (JWT)**.
- Flujo de **"Restablecer Contraseña"** por correo electrónico mediante servidor SMTP/Nodemailer (incluye modo de demostración automático con enlace de depuración en consola si no se especifican variables SMTP).
- Protección estricta contra fugas de credenciales (todas las API keys se mantienen en servidor con variables `.env`).

---

## 📂 Estructura del Proyecto

```
/
├── .env.example             # Plantilla de variables de entorno (sin secretos reales)
├── .gitignore               # Exclusiones para git (node_modules, .env, /data, etc.)
├── package.json             # Scripts de compilación y dependencias
├── server.ts                # Servidor Express + integración middleware de Vite
├── server/                  # Backend Node.js / Express
│   ├── config.ts            # Carga de variables de entorno y configuración
│   ├── db.ts                # Motor de persistencia y backups (JSON / memoria)
│   ├── email.ts             # Servicio Nodemailer para recuperación de clave
│   ├── authMiddleware.ts    # Verificación JWT y control de rol admin
│   └── routes/              # Endpoints de la API REST
│       ├── authRoutes.ts    # /api/auth (login, registro, forgot password)
│       ├── recordsRoutes.ts # /api/records (CRUD territorial y filtros)
│       └── adminRoutes.ts   # /api/admin (usuarios, estadísticas, backups)
└── src/                     # Frontend React + TypeScript + Tailwind CSS
    ├── App.tsx              # Componente principal y gestor de rutas/modales
    ├── types.ts             # Interfaces TypeScript y catálogos (TipoEdificacion)
    ├── lib/                 # Utilidades para exportación PNG / PDF / CSV
    └── components/          # Componentes modulares con estética Bento Grid
        ├── AuthModal.tsx    # Modal de Inicio de Sesión y Registro
        ├── Sidebar.tsx      # Navegación lateral y drawer móvil responsive
        ├── DashboardView.tsx# Dashboard con tarjetas Bento y gráficos
        ├── RecordsView.tsx  # Tabla, filtros avanzados y formulario territorial
        ├── UsersView.tsx    # Gestión de usuarios para administradores
        ├── BackupModal.tsx  # Modal para descargar y restaurar respaldos
        └── DocumentationModal.tsx # Guía técnica integrada en la app
```

---

## 🚀 Instalación y Puesta en Funcionamiento Local

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/territorio-mix.git
   cd territorio-mix
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar Variables de Entorno:**
   Copia el archivo `.env.example` y nómbralo `.env`:
   ```bash
   cp .env.example .env
   ```
   Asegúrate de editar los valores dentro de `.env`:
   ```env
   APP_URL="http://localhost:3000"
   JWT_SECRET="mi_super_clave_secreta_cambiar_en_produccion"
   DB_FILE_PATH="./data/territorio_mix_db.json"
   ```

4. **Iniciar Servidor de Desarrollo (Full-Stack Express + Vite):**
   ```bash
   npm run dev
   ```
   Abre tu navegador en: `http://localhost:3000`

---


## 🌐 Despliegue en Producción (Vercel, Render o Railway)

### Opción A: Despliegue Full-Stack en un Servicio de Contenedores (Render / Railway / Cloud Run)
1. Conecta tu repositorio de GitHub al servicio.
2. Configura el comando de compilación: `npm run build`
3. Configura el comando de inicio: `npm start` (que ejecuta el paquete compilado en `dist/server.cjs`).
4. Añade un disco o volumen persistente montado en la ruta `./data` para que el archivo `territorio_mix_db.json` se conserve entre despliegues.
5. Declara las variables de entorno (`JWT_SECRET`, `APP_URL`, etc.) en el panel de variables del servidor.

### Opción B: Despliegue Frontend en Vercel + API Dedicada
1. Conecta tu repositorio a **Vercel**.
2. En *Build & Development Settings*:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Agrega tus variables en *Environment Variables*.

---

## 📄 Licencia & Soporte
Proyecto desarrollado para relevamientos territoriales de alta precisión con cumplimiento estricto de accesibilidad y seguridad de datos.
