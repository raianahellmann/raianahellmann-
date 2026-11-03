import { useEffect, useState } from "react";
import { request } from "../api";
import { Badge, date, Markdown, Notice, Pager } from "./ui";
export default function TicketDetail({
  ticket,
  me,
  users,
  onBack,
  onEdit,
  onDelete,
}) {
  const [mensagens, setMensagens] = useState([]);
  const [pagina, setPagina] = useState(0);
  const [total, setTotal] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [texto, setTexto] = useState("");
  const [mensagemEmEdicao, setMensagemEmEdicao] = useState(null);
  const [textoEdicao, setTextoEdicao] = useState("");
  const [atualizacao, setAtualizacao] = useState(0);
  function buscarNomeUsuario(id) {
    const user = users.find((user) => user.id === id);
    if (user) {
      return user.name;
    }
    if (id === me.id) {
      return me.name;
    }
    return "Usuário #" + id;
  }
  const podeEditar = me.role === "admin" || me.id === ticket.id_user;
  useEffect(() => {
    const cancelamento = new AbortController();
    async function carregarMensagens() {
      setCarregando(true);
      setErro("");
      try {
        const resposta = await request(
          "/ticket-interaction?id_ticket=" +
            ticket.id +
            "&limit=20&offset=" +
            pagina * 20,
          {
            signal: cancelamento.signal,
          },
        );
        const totalMensagens = resposta.meta?.total || 0;
        if (pagina > 0 && pagina * 20 >= totalMensagens) {
          setPagina(Math.max(0, Math.ceil(totalMensagens / 20) - 1));
          return;
        }
        setMensagens(resposta.data || []);
        setTotal(totalMensagens);
      } catch (erro) {
        if (!cancelamento.signal.aborted) {
          setErro(erro.message);
        }
      } finally {
        if (!cancelamento.signal.aborted) {
          setCarregando(false);
        }
      }
    }
    carregarMensagens();
    return () => cancelamento.abort();
  }, [ticket.id, pagina, atualizacao]);
  async function enviarMensagem(evento) {
    evento.preventDefault();
    if (!texto.trim()) {
      setErro("Escreva uma mensagem antes de enviar.");
      return;
    }
    setSalvando(true);
    setErro("");
    setMensagemSucesso("");
    try {
      await request("/ticket-interaction", {
        method: "POST",
        data: {
          text: texto.trim(),
          id_ticket: ticket.id,
        },
      });
      setTexto("");
      setMensagemSucesso("Mensagem enviada.");
      setPagina(Math.floor(total / 20));
      setAtualizacao(atualizacao + 1);
    } catch (erro) {
      setErro(erro.message);
    } finally {
      setSalvando(false);
    }
  }
  function editarMensagem(item) {
    setMensagemEmEdicao(item.id);
    setTextoEdicao(item.text);
  }
  async function salvarMensagem(evento) {
    evento.preventDefault();
    if (!textoEdicao.trim()) {
      return;
    }
    setSalvando(true);
    setErro("");
    setMensagemSucesso("");
    try {
      await request("/ticket-interaction/" + mensagemEmEdicao, {
        method: "PUT",
        data: {
          text: textoEdicao.trim(),
        },
      });
      setMensagemEmEdicao(null);
      setMensagemSucesso("Mensagem atualizada.");
      setAtualizacao(atualizacao + 1);
    } catch (erro) {
      setErro(erro.message);
    } finally {
      setSalvando(false);
    }
  }
  async function excluirMensagem(id) {
    const confirmado = window.confirm(
      "Excluir esta mensagem? Esta ação não pode ser desfeita.",
    );
    if (!confirmado) {
      return;
    }
    setSalvando(true);
    setErro("");
    setMensagemSucesso("");
    try {
      await request("/ticket-interaction/" + id, {
        method: "DELETE",
      });
      setMensagemSucesso("Mensagem excluída.");
      setMensagemEmEdicao(null);
      if (mensagens.length === 1 && pagina > 0) {
        setPagina(pagina - 1);
      }
      setAtualizacao(atualizacao + 1);
    } catch (erro) {
      setErro(erro.message);
    } finally {
      setSalvando(false);
    }
  }
  async function excluirChamado() {
    const confirmado = window.confirm(
      "Excluir o chamado #" +
        ticket.id +
        " e toda a conversa? Esta ação não pode ser desfeita.",
    );
    if (!confirmado) {
      return;
    }
    setSalvando(true);
    setErro("");
    setMensagemSucesso("");
    try {
      await request("/tickets/" + ticket.id, {
        method: "DELETE",
      });
      onDelete();
    } catch (erro) {
      setErro(erro.message);
    } finally {
      setSalvando(false);
    }
  }
  return (
    <section>
      <button className="text-button" onClick={onBack} disabled={salvando}>
        ← Todos os chamados
      </button>
      <div className="page-heading">
        <div>
          <p className="eyebrow">CHAMADO #{ticket.id}</p>
          <h1>{ticket.title}</h1>
        </div>
        {podeEditar && (
          <div className="actions">
            <button className="secondary" onClick={onEdit} disabled={salvando}>
              Editar chamado
            </button>
            <button
              className="danger"
              onClick={excluirChamado}
              disabled={salvando}
            >
              Excluir
            </button>
          </div>
        )}
      </div>
      <div className="detail-layout">
        <div>
          <section className="panel">
            <h2>Solicitação</h2>
            <Markdown>{ticket.description}</Markdown>
          </section>
          <section className="panel conversation">
            <div className="section-heading">
              <h2>Conversa</h2>
              <button
                className="text-button"
                disabled={carregando || salvando}
                onClick={() => setAtualizacao((v) => v + 1)}
              >
                Atualizar
              </button>
            </div>
            {erro && <Notice>{erro}</Notice>}
            {mensagemSucesso && <Notice success>{mensagemSucesso}</Notice>}
            {carregando ? (
              <p role="status">Carregando conversa…</p>
            ) : !erro ? (
              <>
                {!mensagens.length && !erro && (
                  <p className="muted">Ainda não há mensagens neste chamado.</p>
                )}
                {mensagens.map((item) => (
                  <article className="message" key={item.id}>
                    <div className="message-heading">
                      <strong>
                        {buscarNomeUsuario(item.id_user)}
                        {item.id_user === me.id ? " (você)" : ""}
                      </strong>
                      <span className="muted">
                        {date(item.created_at)}
                        {item.updated_at !== item.created_at && " · editada"}
                      </span>
                    </div>
                    {mensagemEmEdicao === item.id ? (
                      <form className="stack" onSubmit={salvarMensagem}>
                        <label>
                          Editar mensagem
                          <textarea
                            autoFocus
                            required
                            rows={4}
                            value={textoEdicao}
                            onChange={(e) => setTextoEdicao(e.target.value)}
                          />
                        </label>
                        <div className="actions">
                          <button disabled={salvando || !textoEdicao.trim()}>
                            Salvar
                          </button>
                          <button
                            type="button"
                            className="secondary"
                            disabled={salvando}
                            onClick={() => setMensagemEmEdicao(null)}
                          >
                            Cancelar
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <Markdown>{item.text}</Markdown>
                        {(me.role === "admin" || me.id === item.id_user) && (
                          <div className="actions">
                            <button
                              className="text-button"
                              disabled={salvando}
                              onClick={() => editarMensagem(item)}
                            >
                              Editar
                            </button>
                            <button
                              className="text-button danger-text"
                              disabled={salvando}
                              onClick={() => excluirMensagem(item.id)}
                            >
                              Excluir
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </article>
                ))}
              </>
            ) : null}
            {total > 20 && (
              <Pager
                page={pagina}
                total={total}
                size={20}
                onChange={(value) => {
                  setMensagemEmEdicao(null);
                  setPagina(value);
                }}
                disabled={carregando || salvando}
              />
            )}
            <form className="reply stack" onSubmit={enviarMensagem}>
              <label>
                Sua mensagem
                <textarea
                  required
                  rows={4}
                  placeholder="Registre uma atualização ou responda ao atendimento"
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  disabled={salvando}
                />
              </label>
              <div>
                <button disabled={salvando || !texto.trim()}>
                  {salvando ? "Aguarde…" : "Enviar mensagem"}
                </button>
              </div>
            </form>
          </section>
        </div>
        <aside className="panel ticket-info">
          <h2>Informações</h2>
          <dl>
            <dt>Status</dt>
            <dd>
              <Badge status={ticket.status} />
            </dd>
            <dt>Solicitante</dt>
            <dd>{buscarNomeUsuario(ticket.id_user)}</dd>
            <dt>Aberto em</dt>
            <dd>{date(ticket.date_created)}</dd>
            <dt>Atualizado em</dt>
            <dd>{date(ticket.date_updated)}</dd>
          </dl>
        </aside>
      </div>
    </section>
  );
}
