#!/usr/bin/env node
/**
 * Prepara el esqueleto de código de una micro app especificada copiando lo reutilizable
 * de la app de referencia (03-asistencia-rrhh). Funciona en Windows, macOS y Linux.
 *
 *   node scripts/nueva-app.mjs 01-agenda-citas
 *
 * - Copia backend/ y frontend/ (y mobile/ si su README dice "App nativa con Expo").
 * - Omite node_modules, builds, .env y todo lo específico de asistencia.
 * - No sobrescribe archivos existentes (los README y docs de la app se conservan).
 */
import { cpSync, existsSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = fileURLToPath(new URL('..', import.meta.url));
const destinoApp = process.argv[2];
const REFERENCIA = '03-asistencia-rrhh';

if (!destinoApp || !/^\d{2}-/.test(destinoApp) || !existsSync(join(raiz, destinoApp))) {
  console.error('Uso: node scripts/nueva-app.mjs <carpeta-de-la-app>   (ej. 01-agenda-citas)');
  process.exit(1);
}
if (destinoApp === REFERENCIA) {
  console.error('La app 03 es la referencia; elige otra.');
  process.exit(1);
}

const OMITIR = new Set(['node_modules', '.next', 'coverage', 'dist', '.expo', '.env', '.env.local', 'next-env.d.ts', 'package-lock.json']);
// Específico de asistencia: no se copia
const ESPECIFICO = [
  'backend/src/domain', 'backend/src/services', 'backend/src/repos', 'backend/src/routes',
  'backend/src/lib/permisos.ts', 'backend/tests', 'backend/scripts', 'backend/README.md',
  'frontend/app/(panel)/dashboard', 'frontend/app/(panel)/locales', 'frontend/app/(panel)/colaboradores',
  'frontend/app/(panel)/reportes', 'frontend/components/MapaLocales.tsx', 'frontend/components/Mapa.tsx',
  'frontend/components/useTiempoReal.ts', 'frontend/components/IndicadorVivo.tsx', 'frontend/components/EstadoBadge.tsx',
  'frontend/lib/tipos.ts', 'frontend/tests', 'frontend/README.md',
  'mobile/tests', 'mobile/README.md', 'mobile/AGENTS.md',
].map((r) => r.split('/').join(sep));

const usaExpo = (() => {
  const readme = join(raiz, destinoApp, 'mobile', 'README.md');
  return existsSync(readme) && readFileSync(readme, 'utf8').includes('App nativa con Expo');
})();

const capas = ['backend', 'frontend', ...(usaExpo ? ['mobile'] : [])];
let copiados = 0;
for (const capa of capas) {
  const origen = join(raiz, REFERENCIA, capa);
  cpSync(origen, join(raiz, destinoApp, capa), {
    recursive: true,
    force: false,
    errorOnExist: false,
    filter: (ruta) => {
      const rel = relative(join(raiz, REFERENCIA), ruta);
      const partes = rel.split(sep);
      if (partes.some((p) => OMITIR.has(p) || p.endsWith('.tsbuildinfo') || p === '.git')) return false;
      if (ESPECIFICO.some((e) => rel === e || rel.startsWith(e + sep))) return false;
      if (statSync(ruta).isFile()) copiados++;
      return true;
    },
  });
}

// Renombrar paquetes
const nombre = destinoApp.slice(3);
for (const capa of capas) {
  const pj = join(raiz, destinoApp, capa, 'package.json');
  if (!existsSync(pj)) continue;
  const p = JSON.parse(readFileSync(pj, 'utf8'));
  p.name = `@novatech/${nombre}-${capa}`;
  p.description = `${capa} de la micro app ${destinoApp}`;
  delete p.scripts?.['seed:demo'];
  writeFileSync(pj, JSON.stringify(p, null, 2) + '\n');
}

// app.ts referencia rutas de asistencia: dejar un esqueleto mínimo
const appTs = join(raiz, destinoApp, 'backend', 'src', 'app.ts');
if (existsSync(appTs)) {
  let s = readFileSync(appTs, 'utf8');
  s = s.replace(/import \{ rutas\w+ \} from '\.\/routes\/\w+';\n/g, '');
  s = s.replace(/app\.route\('\/', rutas\w+\);\n/g, '');
  s = s.replace("servicio: 'asistencia'", `servicio: '${nombre}'`);
  s = s.replace('// Todo lo demás requiere sesión\napp.use(\'*\', autenticar);\n', "// Todo lo demás requiere sesión\napp.use('*', autenticar);\n// TODO: app.route('/', rutas...);\n");
  writeFileSync(appTs, s);
}

const vacias = (d) => existsSync(d) && readdirSync(d).length === 0 && rmSync(d, { recursive: true });
vacias(join(raiz, destinoApp, 'frontend', 'app', '(panel)'));

console.log(`✔ ${copiados} archivos copiados a ${destinoApp} (${capas.join(', ')})`);
console.log('Siguiente: ajustar puertos (40NN/30NN), menú del panel en frontend/app/(panel)/layout.tsx y escribir domain/ + tests.');
if (usaExpo) console.log('Móvil: se copiaron las pantallas de asistencia como ejemplo; reemplaza MarcarScreen/HistorialScreen y ajusta app.json (nombre, paquete, permisos).');
