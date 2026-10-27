import { describe, expect, it, vi } from 'vitest';
vi.hoisted(() => {
  vi.stubGlobal('sessionStorage', {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  });
});
import { ticketQuery } from './api';
describe('filtros de chamados conforme o contrato OpenAPI', () => {
  it('combina status e busca por título ou descrição', () => {
    const q = new URLSearchParams(ticketQuery('acesso', 'open', 10));
    expect(q.get('offset')).toBe('10');
    expect(q.get('limit')).toBe('10');
    expect(JSON.parse(q.get('filters'))).toEqual({
      and: [{ column: 'status', op: 'eq', value: 'open' }],
      or: [
        { column: 'title', op: 'ilike', value: 'acesso' },
        { column: 'description', op: 'ilike', value: 'acesso' },
      ],
    });
  });
  it('não envia filtros vazios e preserva caracteres especiais', () => {
    expect(new URLSearchParams(ticketQuery('', '', 0)).has('filters')).toBe(false);
    const q = new URLSearchParams(ticketQuery('ação & conexão?', 'closed', 0));
    expect(JSON.parse(q.get('filters')).or[0].value).toBe('ação & conexão?');
  });
});
