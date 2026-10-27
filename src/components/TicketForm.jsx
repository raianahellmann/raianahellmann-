import { useState } from 'react';
import { request, json } from '../api';
import { labels } from '../presentation';
import { Notice } from './ui';
export default function TicketForm({ ticket, close, saved }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const title = String(data.get('title')).trim(),
      description = String(data.get('description')).trim();
    if (!title || !description) {
      setError('Preencha título e descrição.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const r = await request(
        ticket ? `/tickets/${ticket.id}` : '/tickets',
        json(ticket ? 'PUT' : 'POST', {
          title,
          description,
          status: data.get('status'),
        }),
      );
      saved(r.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="panel form-panel">
      <h1>{ticket ? 'Editar chamado' : 'Novo chamado'}</h1>

      <form onSubmit={submit}>
        {error && <Notice>{error}</Notice>}
        <label>
          Título do chamado
          <input
            name="title"
            maxLength={255}
            required
            defaultValue={ticket?.title}
            placeholder="Ex.: Preciso de ajuda para acessar o sistema"
          />
        </label>
        <label>
          Descrição
          <textarea
            name="description"
            required
            rows={5}
            defaultValue={ticket?.description}
            placeholder="Descreva a solicitação com o máximo de detalhes possível…"
          />
        </label>
        <label>
          Status
          <select name="status" defaultValue={ticket?.status || 'open'}>
            {Object.entries(labels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <footer>
          <button type="button" className="secondary" disabled={busy} onClick={close}>
            Cancelar
          </button>
          <button className="primary" disabled={busy}>
            {busy ? 'Salvando…' : ticket ? 'Salvar alterações' : 'Criar chamado'}
          </button>
        </footer>
      </form>
    </section>
  );
}
