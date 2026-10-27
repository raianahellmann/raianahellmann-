import { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import { request, json } from '../api';
import { date } from '../presentation';
import { Badge, Notice } from './ui';
export default function Detail({ ticket, me, users, back, edit }) {
  const [messages, setMessages] = useState([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState('');
  async function load(offset = 0) {
    setLoading(true);
    setError('');
    try {
      const r = await request(
        `/ticket-interaction?id_ticket=${ticket.id}&limit=100&offset=${offset}`,
      );
      setMessages((old) => (offset ? [...old, ...r.data] : r.data || []));
      setTotal(r.meta?.total || 0);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, [ticket.id]);
  async function send(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    setError('');
    try {
      await request(
        '/ticket-interaction',
        json('POST', { text: text.trim(), id_ticket: ticket.id }),
      );
      setText('');
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  }
  const owner = users.find((u) => u.id === ticket.id_user);
  return (
    <>
      <button className="back" onClick={back}>
        Voltar aos chamados
      </button>
      <div className="page-heading">
        <div>
          <div className="eyebrow">CHAMADO #{String(ticket.id).padStart(4, '0')}</div>
          <h1>{ticket.title}</h1>
        </div>
        <button className="secondary" onClick={edit}>
          Editar chamado
        </button>
      </div>
      <div className="detail-grid">
        <section className="panel conversation">
          <div className="section-title">
            <h2>Conversa do chamado</h2>
            <span className="muted">
              {total} {total === 1 ? 'mensagem' : 'mensagens'}
            </span>
            <button className="icon-button" onClick={() => load()} aria-label="Atualizar conversa">
              Atualizar
            </button>
          </div>
          <div className="description">
            <span className="eyebrow">SOLICITAÇÃO INICIAL</span>
            <div className="markdown">
              <Markdown>{ticket.description}</Markdown>
            </div>
          </div>
          {error && <Notice>{error}</Notice>}
          <div className="messages">
            {loading && (
              <p className="muted" role="status">
                Carregando conversa…
              </p>
            )}
            {!loading && !error && !messages.length && (
              <div className="empty">
                <h3>Nenhuma mensagem</h3>
                <p>Use o campo abaixo para participar da conversa.</p>
              </div>
            )}
            {[...messages]
              .sort((a, b) => a.created_at.localeCompare(b.created_at) || a.id - b.id)
              .map((m) => (
                <article className={`message ${m.id_user === me.id ? 'own' : ''}`} key={m.id}>
                  <div>
                    <div className="message-meta">
                      <strong>
                        {m.id_user === me.id
                          ? 'Você'
                          : users.find((u) => u.id === m.id_user)?.name || `Usuário #${m.id_user}`}
                      </strong>
                      <time>{date(m.created_at)}</time>
                    </div>
                    <div className="message-body markdown">
                      <Markdown>{m.text}</Markdown>
                    </div>
                  </div>
                </article>
              ))}
            {messages.length < total && (
              <button
                className="secondary"
                disabled={loading}
                onClick={() => load(messages.length)}
              >
                Carregar mais mensagens
              </button>
            )}
          </div>
          <form className="composer" onSubmit={send}>
            <label htmlFor="message">Sua mensagem</label>
            <textarea
              id="message"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              required
              placeholder="Escreva uma atualização ou tire uma dúvida…"
            />
            <div>
              <span className="muted">A conversa fica registrada neste chamado.</span>
              <button className="primary" disabled={sending || !text.trim()}>
                {sending ? 'Enviando…' : 'Enviar mensagem'}
              </button>
            </div>
          </form>
        </section>
        <aside className="panel ticket-info">
          <h2>Informações do chamado</h2>
          <label>Status atual</label>
          <Badge status={ticket.status} />
          <hr />
          <label>Solicitante</label>
          <strong>{owner?.name || `Usuário #${ticket.id_user}`}</strong>
          {owner && <small>{owner.email}</small>}
          <label>Aberto em</label>
          <span>{date(ticket.date_created)}</span>
          <label>Última atualização</label>
          <span>{date(ticket.date_updated)}</span>
        </aside>
      </div>
    </>
  );
}
