import { useEffect, useState } from "react";
import { allUsers, auth, first, request } from "./api";
import { Notice } from "./components/ui";
import Login from "./components/Login";
import TicketList from "./components/TicketList";
import TicketForm from "./components/TicketForm";
import TicketDetail from "./components/TicketDetail";
export default function App() {
  const [logado, setLogado] = useState(Boolean(auth.get()));
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [tela, setTela] = useState("lista");
  const [chamadoSelecionado, setChamadoSelecionado] = useState(null);
  const [erro, setErro] = useState("");
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [avisoSessao, setAvisoSessao] = useState("");
  const [tentativaCarregamento, setTentativaCarregamento] = useState(0);
  function sair() {
    auth.set("");
    setLogado(false);
    setUsuarioLogado(null);
    setUsuarios([]);
    setTela("lista");
    setChamadoSelecionado(null);
    setErro("");
    setMensagemSucesso("");
    setAvisoSessao("");
  }
  useEffect(() => {
    function sessaoExpirada() {
      sair();
      setAvisoSessao("Sua sessão expirou. Entre novamente.");
    }
    window.addEventListener("session-expired", sessaoExpirada);
    return () => window.removeEventListener("session-expired", sessaoExpirada);
  }, []);
  useEffect(() => {
    if (!logado) {
      return;
    }
    const cancelamento = new AbortController();
    async function carregarConta() {
      setErro("");
      try {
        const resposta = await request("/me", {
          signal: cancelamento.signal,
        });
        setUsuarioLogado(first(resposta.data));
      } catch (erro) {
        if (!cancelamento.signal.aborted) {
          setErro(erro.message);
        }
      }
    }
    async function carregarUsuarios() {
      try {
        const listaUsuarios = await allUsers(cancelamento.signal);
        setUsuarios(listaUsuarios);
      } catch (erro) {
        if (!cancelamento.signal.aborted) {
          setErro(
            "Não foi possível carregar os nomes dos usuários. " + erro.message,
          );
        }
      }
    }
    carregarConta();
    carregarUsuarios();
    return () => cancelamento.abort();
  }, [logado, tentativaCarregamento]);
  function abrirChamado(ticket) {
    setChamadoSelecionado(ticket);
    setMensagemSucesso("");
    setTela("detalhes");
  }
  function novoChamado() {
    setChamadoSelecionado(null);
    setMensagemSucesso("");
    setTela("novo");
  }
  function editarChamado() {
    setMensagemSucesso("");
    setTela("editar");
  }
  function voltarParaLista() {
    setChamadoSelecionado(null);
    setMensagemSucesso("");
    setTela("lista");
  }
  function cancelarFormulario() {
    if (chamadoSelecionado) {
      setTela("detalhes");
    } else {
      setTela("lista");
    }
  }
  function salvarChamado(ticket) {
    setChamadoSelecionado(ticket || null);
    setMensagemSucesso("Chamado salvo com sucesso.");
    if (ticket) {
      setTela("detalhes");
    } else {
      setTela("lista");
    }
  }
  function chamadoExcluido() {
    setChamadoSelecionado(null);
    setTela("lista");
    setMensagemSucesso("Chamado excluído.");
  }
  function loginConcluido() {
    setAvisoSessao("");
    setLogado(true);
  }
  if (!logado) {
    return <Login sessionMessage={avisoSessao} onLogin={loginConcluido} />;
  }
  let conteudo;
  if (tela === "novo" || tela === "editar") {
    conteudo = (
      <TicketForm
        ticket={chamadoSelecionado}
        onCancel={cancelarFormulario}
        onSave={salvarChamado}
      />
    );
  } else if (tela === "detalhes") {
    if (usuarioLogado) {
      conteudo = (
        <TicketDetail
          ticket={chamadoSelecionado}
          me={usuarioLogado}
          users={usuarios}
          onBack={voltarParaLista}
          onEdit={editarChamado}
          onDelete={chamadoExcluido}
        />
      );
    } else {
      conteudo = <p role="status">Carregando usuário para abrir o chamado…</p>;
    }
  } else {
    conteudo = (
      <TicketList users={usuarios} onNew={novoChamado} onOpen={abrirChamado} />
    );
  }
  return (
    <>
      <header className="app-header">
        <div className="header-inner">
          <div className="brand">
            pontosat<span>ATENDIMENTO</span>
          </div>
          <div className="account">
            <span>{usuarioLogado?.name || "Carregando usuário…"}</span>
            <button className="secondary" onClick={sair}>
              Sair
            </button>
          </div>
        </div>
      </header>
      <main className="container">
        {erro && (
          <Notice>
            {erro}{" "}
            <button
              className="text-button"
              onClick={() =>
                setTentativaCarregamento(tentativaCarregamento + 1)
              }
            >
              Tentar novamente
            </button>
          </Notice>
        )}
        {mensagemSucesso && <Notice success>{mensagemSucesso}</Notice>}
        {conteudo}
      </main>
      <footer>Pontosat · Sistema de chamados</footer>
    </>
  );
}
