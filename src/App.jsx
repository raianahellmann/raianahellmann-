import { useEffect, useState } from 'react';
import { auth, json, request, ticketQuery } from './api';
import { labels, date } from './presentation';
import { Badge, Notice } from './components/ui';
import TicketForm from './components/TicketForm';
import TicketDetail from './components/TicketDetail';

export default function App() {
  const [loggedIn, setLoggedIn] = useState(Boolean(auth.get()));
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);

  function logout() {
    auth.set('');
    setLoggedIn(false);
    setUser(null);
    setUsers([]);
    setTickets([]);
    setSelected(null);
    setForm(null);
    setSearch('');
    setStatus('');
    setFilters({ search: '', status: '' });
    setPage(0);
    setTotal(0);
    setError('');
  }

  useEffect(() => {
    function expired() {
      logout();
      setError('Sua sessão expirou. Entre novamente.');
    }
    window.addEventListener('session-expired', expired);
    return () => window.removeEventListener('session-expired', expired);
  }, []);

  useEffect(() => {
    if (!loggedIn) return;
    let active = true;
    async function loadAccount() {
      try {
        const response = await request('/me');
        const account = Array.isArray(response.data) ? response.data[0] : response.data;
        if (active) setUser(account);
      } catch (error) {
        if (active) setError(error.message);
      }
    }
    // A API retorna os IDs dos autores. Esta consulta permite mostrar seus nomes.
    async function loadUsers() {
      const result = [];
      let offset = 0;
      try {
        while (true) {
          const response = await request(`/users?limit=100&offset=${offset}`);
          result.push(...(response.data || []));
          if (result.length >= (response.meta?.total || 0) || !response.data?.length) break;
          offset += 100;
        }
        if (active) setUsers(result);
      } catch {
        // Se a conta não puder listar usuários, mostramos os IDs recebidos.
      }
    }
    loadAccount();
    loadUsers();
    return () => {
      active = false;
    };
  }, [loggedIn]);

  useEffect(() => {
    if (!loggedIn) return;
    let active = true;
    async function loadTickets() {
      setLoading(true);
      setError('');
      try {
        const query = ticketQuery(filters.search, filters.status, page * 10);
        const response = await request(`/tickets?${query}`);
        if (active) {
          setTickets(response.data || []);
          setTotal(response.meta?.total || 0);
        }
      } catch (error) {
        if (active) setError(error.message);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadTickets();
    // Evita que uma resposta antiga substitua uma busca mais recente.
    return () => {
      active = false;
    };
  }, [loggedIn, filters, page, refresh]);

  async function login(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setLoading(true);
    setError('');
    try {
      const response = await request(
        '/login',
        json('POST', {
          email: data.get('email'),
          password: data.get('password'),
        }),
      );
      auth.set(response.data.access_token);
      setLoggedIn(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  function filterTickets(event) {
    event.preventDefault();
    setPage(0);
    setFilters({ search: search.trim(), status });
  }

  function saved(ticket) {
    setForm(null);
    setSelected(ticket || null);
    setRefresh(refresh + 1);
  }

  if (!loggedIn) {
    return (
      <main className="login">
        <h1>Pontosat</h1>
        <h2>Sistema de chamados</h2>
        <p>Entre com seu e-mail e senha.</p>
        {error && <Notice>{error}</Notice>}
        <form onSubmit={login}>
          <label>
            E-mail
            <input type="email" name="email" autoComplete="username" required />
          </label>
          <label>
            Senha
            <input type="password" name="password" autoComplete="current-password" required />
          </label>
          <button disabled={loading}>{loading ? 'Entrando…' : 'Entrar'}</button>
        </form>
      </main>
    );
  }

  return (
    <>
      <header className="app-header">
        <strong>Pontosat — Sistema de chamados</strong>
        <div>
          <span>{user?.name || 'Carregando usuário…'}</span>
          <button className="secondary" onClick={logout}>
            Sair
          </button>
        </div>
      </header>
      <main>
        {form ? (
          <TicketForm
            ticket={form === 'edit' ? selected : undefined}
            close={() => setForm(null)}
            saved={saved}
          />
        ) : selected && user ? (
          <TicketDetail
            ticket={selected}
            me={user}
            users={users}
            back={() => setSelected(null)}
            edit={() => setForm('edit')}
          />
        ) : (
          <>
            <div className="page-heading">
              <h1>Chamados</h1>
              <button onClick={() => setForm('new')}>Novo chamado</button>
            </div>
            <form className="filters" onSubmit={filterTickets}>
              <label>
                Buscar chamado
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Título ou descrição"
                />
              </label>
              <label>
                Status
                <select value={status} onChange={(event) => setStatus(event.target.value)}>
                  <option value="">Todos</option>
                  {Object.entries(labels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <button disabled={loading}>Buscar</button>
            </form>
            {error && (
              <Notice>
                {error}{' '}
                <button className="secondary" onClick={() => setRefresh(refresh + 1)}>
                  Tentar novamente
                </button>
              </Notice>
            )}
            {loading ? (
              <p role="status">Carregando chamados…</p>
            ) : (
              !error && (
                <>
                  {tickets.length === 0 ? (
                    <p className="panel">Nenhum chamado encontrado.</p>
                  ) : (
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>Número</th>
                            <th>Título</th>
                            <th>Status</th>
                            <th>Solicitante</th>
                            <th>Atualizado em</th>
                            <th>Ação</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tickets.map((ticket) => (
                            <tr key={ticket.id}>
                              <td>#{ticket.id}</td>
                              <td>{ticket.title}</td>
                              <td>
                                <Badge status={ticket.status} />
                              </td>
                              <td>
                                {users.find((person) => person.id === ticket.id_user)?.name ||
                                  `Usuário #${ticket.id_user}`}
                              </td>
                              <td>{date(ticket.date_updated)}</td>
                              <td>
                                <button className="secondary" onClick={() => setSelected(ticket)}>
                                  Abrir<span className="sr-only"> chamado {ticket.id}</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <div className="pagination">
                    <span>
                      {total} {total === 1 ? 'chamado' : 'chamados'} — Página {page + 1}
                    </span>
                    <div>
                      <button
                        className="secondary"
                        disabled={page === 0}
                        onClick={() => setPage(page - 1)}
                      >
                        Anterior
                      </button>
                      <button
                        className="secondary"
                        disabled={(page + 1) * 10 >= total}
                        onClick={() => setPage(page + 1)}
                      >
                        Próxima
                      </button>
                    </div>
                  </div>
                </>
              )
            )}
          </>
        )}
      </main>
    </>
  );
}
