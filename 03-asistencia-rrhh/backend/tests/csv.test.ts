import { describe, expect, it } from 'vitest';
import { aCsv } from '../src/lib/csv';

describe('aCsv', () => {
  it('usa ; como separador, BOM y CRLF', () => {
    const csv = aCsv(['A', 'B'], [[1, 'x']]);
    expect(csv.startsWith('﻿')).toBe(true);
    expect(csv).toBe('﻿A;B\r\n1;x\r\n');
  });

  it('escapa comillas y separadores', () => {
    expect(aCsv(['N'], [['Pérez; "Lalo"']])).toContain('"Pérez; ""Lalo"""');
  });

  it('neutraliza fórmulas de Excel', () => {
    expect(aCsv(['N'], [['=HYPERLINK("x")']])).toContain(`'=HYPERLINK`);
  });

  it('null y undefined quedan vacíos', () => {
    expect(aCsv(['A', 'B'], [[null, undefined]])).toBe('﻿A;B\r\n;\r\n');
  });
});
