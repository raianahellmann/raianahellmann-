import { useEffect, useState } from "react";
import { request, ticketQuery } from "../api";
import { Badge, date, Notice, Pager } from "./ui";
export default function TicketList({ users, onNew, onOpen }) {
  const [chamados, setChamados] = useState([]);
  const [total, setTotal] = useState(0);
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState("");
  const [filtros, setFiltros] = useState({
    search: "",
    status: "",
    page: 0,
  });
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [atualizacao, setAtualizacao] = useState(0);
  useEffect(() => {
    const cancelamento = new AbortController();
    async function carregarChamados() {
      setCarregando(true);
      setErro("");
      try {
        const resposta = await request("/tickets?" + ticketQuery(filtros), {
          signal: cancelamento.signal,
        });
        const totalChamados = resposta.meta?.total || 0;
        if (filtros.page > 0 && filtros.page * 10 >= totalChamados) {
          setFiltros({
            ...filtros,
            page: Math.max(0, Math.ceil(totalChamados / 10) - 1),
          });
          return;
        }
        setChamados(resposta.data || []);
        setTotal(totalChamados);
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
    carregarChamados();
    return () => cancelamento.abort();
  }, [filtros, atualizacao]);
  function atualizarLista() {
    setAtualizacao(atualizacao + 1);
  }
  function buscarChamados(evento) {
    evento.preventDefault();
    setFiltros({
      search: busca.trim(),
      status: status,
      page: 0,
    });
  }
  function limparFiltros() {
    setBusca("");
    setStatus("");
    setFiltros({
      search: "",
      status: "",
      page: 0,
    });
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">ATENDIMENTO</p>
          <h1>Chamados</h1>
          <p className="muted">
            Consulte as solicitações e acompanhe cada atendimento.
          </p>
        </div>
        <button onClick={onNew}>+ Novo chamado</button>
      </div>
      <form className="panel filters" onSubmit={buscarChamados}>
        <label>
          Buscar chamado
          <input
            placeholder="Título ou descrição"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </label>
        <label>
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Todos os status</option>
            <option value="open">Aberto</option>
            <option value="in_progress">Em atendimento</option>
            <option value="closed">Finalizado</option>
          </select>
        </label>
        <button disabled={carregando}>Buscar</button>
        {(busca || status || filtros.search || filtros.status) && (
          <button type="button" className="text-button" onClick={limparFiltros}>
            Limpar
          </button>
        )}
      </form>
      {erro && (
        <Notice>
          {erro}{" "}
          <button className="text-button" onClick={atualizarLista}>
            Tentar novamente
          </button>
        </Notice>
      )}
      {carregando && (
        <div className="panel" role="status">
          Carregando chamados…
        </div>
      )}
      {!carregando && !erro && (
        <section className="panel list-panel">
          <div className="section-heading">
            <h2>
              Lista de chamados <span className="count">{total}</span>
            </h2>
            <button className="text-button" onClick={atualizarLista}>
              Atualizar
            </button>
          </div>
          {chamados.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Número / título</th>
                    <th>Status</th>
                    <th>Solicitante</th>
                    <th>Atualizado em</th>
                    <th>
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {chamados.map((ticket) => (
                    <tr key={ticket.id}>
                      <td>
                        <span className="ticket-number">#{ticket.id}</span>
                        <strong>{ticket.title}</strong>
                      </td>
                      <td>
                        <Badge status={ticket.status} />
                      </td>
                      <td>
                        {users.find((person) => person.id === ticket.id_user)
                          ?.name || `Usuário #${ticket.id_user}`}
                      </td>
                      <td className="nowrap">{date(ticket.date_updated)}</td>
                      <td>
                        <button
                          className="secondary"
                          aria-label={`Abrir chamado ${ticket.id}`}
                          onClick={() => onOpen(ticket)}
                        >
                          Abrir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty">
              <h3>Nenhum chamado encontrado</h3>
              <p className="muted">
                Tente outra busca ou abra um novo chamado.
              </p>
            </div>
          )}
          <Pager
            page={filtros.page}
            total={total}
            onChange={(pagina) =>
              setFiltros((value) => ({
                ...value,
                page: pagina,
              }))
            }
          />
        </section>
      )}
    </>
  );
}
