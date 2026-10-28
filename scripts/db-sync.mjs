#!/usr/bin/env node
/**
 * Reúne las migraciones de la plataforma y de cada micro app en supabase/migrations
 * y concatena las semillas en supabase/seed.sql.
 *
 * Por qué: usamos UN SOLO proyecto Supabase compartido, pero cada micro app
 * mantiene su SQL dentro de su propia carpeta (NN-nombre/database/).
 *
 * Uso:  node scripts/db-sync.mjs        (luego: supabase db reset && supabase test db)
 * Solo copia database/migrations/*.sql (los borradores en database/borrador/ NO se aplican).
 */
import { readdirSync, existsSync, mkdirSync, rmSync, copyFileSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, basename, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = fileURLToPath(new URL('..', import.meta.url)); // funciona en Windows, macOS y Linux
const destino = join(raiz, 'supabase', 'migrations');
const destinoPruebas = join(raiz, 'supabase', 'tests', 'database');
const fuentes = [join(raiz, 'plataforma', 'database')];

for (const d of readdirSync(raiz)) {
  if (/^\d{2}-/.test(d) && statSync(join(raiz, d)).isDirectory()) fuentes.push(join(raiz, d, 'database'));
}

rmSync(destino, { recursive: true, force: true });
mkdirSync(destino, { recursive: true });
rmSync(destinoPruebas, { recursive: true, force: true });
mkdirSync(destinoPruebas, { recursive: true });
let pruebas = 0;

const vistos = new Map();
const semillas = [];
for (const base of fuentes) {
  const mig = join(base, 'migrations');
  if (existsSync(mig)) {
    for (const f of readdirSync(mig).filter((x) => x.endsWith('.sql')).sort()) {
      const marca = f.split('_')[0];
      if (vistos.has(marca)) {
        console.error(`✖ Marca de tiempo duplicada ${marca}: ${f} y ${vistos.get(marca)}`);
        process.exit(1);
      }
      vistos.set(marca, f);
      copyFileSync(join(mig, f), join(destino, f));
      console.log(`  + ${basename(base.slice(0, -('database'.length + 1)))}/${f}`);
    }
  }
  const tests = join(base, 'tests');
  if (existsSync(tests)) {
    const app = basename(base.slice(0, -('database'.length + 1)));
    for (const f of readdirSync(tests).filter((x) => x.endsWith('.test.sql'))) {
      copyFileSync(join(tests, f), join(destinoPruebas, `${app}__${f}`));
      pruebas++;
    }
  }
  const seed = join(base, 'seed.sql');
  if (existsSync(seed)) semillas.push(`-- ===== ${seed.replace(raiz, '').split(sep).join('/')} =====\n` + readFileSync(seed, 'utf8'));
}

writeFileSync(join(raiz, 'supabase', 'seed.sql'), semillas.join('\n\n'));
console.log(`✔ ${vistos.size} migraciones, ${pruebas} archivos de prueba y ${semillas.length} semillas sincronizados`);
