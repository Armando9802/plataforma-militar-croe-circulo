#!/usr/bin/env node
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('System, Document & Architecture Verification (Node 24 Native Test Runner)', () => {

  test('DOC-01: PLAN_EJECUCION_TECNICA.md exists and meets depth requirements (>15KB)', () => {
    const docPath = path.join(rootDir, 'PLAN_EJECUCION_TECNICA.md');
    assert.ok(fs.existsSync(docPath), 'PLAN_EJECUCION_TECNICA.md must exist in the project root');
    const stats = fs.statSync(docPath);
    assert.ok(stats.size > 15000, `Technical plan must be comprehensive (>15KB), found ${stats.size} bytes`);
  });

  test('DOC-02: ER Data Model specifies core military entities with relational structure', () => {
    const docPath = path.join(rootDir, 'PLAN_EJECUCION_TECNICA.md');
    const content = fs.readFileSync(docPath, 'utf8');
    const requiredEntityPatterns = [
      { name: 'Socios / Members', pattern: /members|socios/i },
      { name: 'Grados / Ranks', pattern: /military_ranks|grados|rangos/i },
      { name: 'Dependientes / Dependents', pattern: /dependents|dependientes/i },
      { name: 'Reservas / Reservations', pattern: /reservations|reservas/i },
      { name: 'Pagos / Transactions', pattern: /payment_transactions|transacciones|pagos/i },
      { name: 'Convenios / Agreements', pattern: /agreements|convenios/i },
    ];
    for (const entity of requiredEntityPatterns) {
      assert.match(content, entity.pattern, `Missing required entity specification: ${entity.name}`);
    }
  });

  test('DOC-03: Multi-tenant architecture and Ecuadorian payment gateways are documented', () => {
    const docPath = path.join(rootDir, 'PLAN_EJECUCION_TECNICA.md');
    const content = fs.readFileSync(docPath, 'utf8');
    assert.match(content, /multi-tenant/i, 'Must document multi-tenant architecture');
    assert.match(content, /payphone/i, 'Must document Payphone payment gateway');
    assert.match(content, /kushki/i, 'Must document Kushki payment gateway');
    assert.match(content, /lopdp/i, 'Must document Ecuador LOPDP compliance');
  });

  test('DOC-04: 11+2 module roadmap and security architecture are specified', () => {
    const docPath = path.join(rootDir, 'PLAN_EJECUCION_TECNICA.md');
    const content = fs.readFileSync(docPath, 'utf8');
    assert.match(content, /M1/i, 'Must include Module 1');
    assert.match(content, /M11/i, 'Must include Module 11');
    assert.match(content, /T1/i, 'Must include Transversal Module 1 (Seguridad)');
    assert.match(content, /T2/i, 'Must include Transversal Module 2 (LOPDP)');
  });

  test('DOC-05: README.md exists and contains executive demo execution instructions', () => {
    const readmePath = path.join(rootDir, 'README.md');
    assert.ok(fs.existsSync(readmePath), 'README.md must exist in root');
    const content = fs.readFileSync(readmePath, 'utf8');
    assert.match(content, /npm\s+(run\s+)?dev/i, 'README must document npm run dev');
    assert.match(content, /croe/i, 'README must mention CROE');
    assert.match(content, /c[íi]rculo\s+militar/i, 'README must mention Círculo Militar');
  });

  test('PKG-01: package.json specifies standard dev, build, and test scripts', () => {
    const pkgPath = path.join(rootDir, 'package.json');
    assert.ok(fs.existsSync(pkgPath), 'package.json must exist');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    assert.ok(pkg.scripts?.dev, 'package.json must define scripts.dev');
    assert.ok(pkg.scripts?.build, 'package.json must define scripts.build');
    assert.ok(pkg.scripts?.test, 'package.json must define scripts.test');
  });

  test('INFRA-01: TEST_INFRA.md documents the 4-tier testing methodology and commands', () => {
    const infraPath = path.join(rootDir, 'TEST_INFRA.md');
    assert.ok(fs.existsSync(infraPath), 'TEST_INFRA.md must exist in root');
    const content = fs.readFileSync(infraPath, 'utf8');
    assert.match(content, /Tier 1/i, 'Must document Tier 1');
    assert.match(content, /Tier 2/i, 'Must document Tier 2');
    assert.match(content, /Tier 3/i, 'Must document Tier 3');
    assert.match(content, /Tier 4/i, 'Must document Tier 4');
    assert.match(content, /(75|109)/i, 'Must document test cases inventory');
  });

  test('DOC-06: Inventory & Economato ERD tables are specified in PLAN_EJECUCION_TECNICA.md', () => {
    const docPath = path.join(rootDir, 'PLAN_EJECUCION_TECNICA.md');
    const content = fs.readFileSync(docPath, 'utf8');
    const requiredInvEntities = [
      { name: 'inv_articulos', pattern: /inv_articulos/i },
      { name: 'inv_categorias', pattern: /inv_categorias/i },
      { name: 'inv_bodegas', pattern: /inv_bodegas/i },
      { name: 'inv_recetas_fichas_tecnicas', pattern: /inv_recetas_fichas_tecnicas/i },
      { name: 'inv_receta_detalles', pattern: /inv_receta_detalles/i },
      { name: 'inv_kardex_movimientos', pattern: /inv_kardex_movimientos/i },
      { name: 'inv_eventos_consumo_menaje', pattern: /inv_eventos_consumo_menaje/i },
      { name: 'inv_facturas_adquisicion', pattern: /inv_facturas_adquisicion/i },
      { name: 'inv_factura_detalles', pattern: /inv_factura_detalles/i },
    ];
    for (const entity of requiredInvEntities) {
      assert.match(content, entity.pattern, `Falta especificación formal de la tabla: ${entity.name}`);
    }
  });

  test('DOC-07: Multi-tenant warehouse locations and PMP/FIFO algorithms are documented', () => {
    const docPath = path.join(rootDir, 'PLAN_EJECUCION_TECNICA.md');
    const content = fs.readFileSync(docPath, 'utf8');
    assert.match(content, /inv_bodegas/i, 'Debe especificar bodegas físicas');
    assert.match(content, /PMP|Precio Medio Ponderado/i, 'Debe especificar algoritmo PMP');
    assert.match(content, /ROP|Punto de Reorden/i, 'Debe especificar Punto de Reorden');
  });

  test('DOC-08: README.md documents Restaurant Shifts, Economato and Invoice Ingestion demo acts', () => {
    const readmePath = path.join(rootDir, 'README.md');
    const content = fs.readFileSync(readmePath, 'utf8');
    assert.match(content, /Turnos de Restaurante|Desayuno,\s*Almuerzo/i, 'README debe documentar turnos de restaurante');
    assert.match(content, /Economato|Inventario/i, 'README debe documentar módulo de economato');
    assert.match(content, /Facturas de Adquisición|Pronaca/i, 'README debe documentar carga de facturas');
  });

  test('ARCH-01: Source code structure conforms to PROJECT.md layout standards', () => {
    const requiredDirs = [
      'src',
      'src/components',
      'src/context',
      'src/types',
      'src/data',
      'tests',
    ];
    for (const dir of requiredDirs) {
      const fullPath = path.join(rootDir, dir);
      assert.ok(fs.existsSync(fullPath), `Directory must exist: ${dir}`);
    }
  });

});
