import { useState } from "react";
import { auth, request } from "../api";
import { Notice } from "./ui";
export default function Login({ onLogin, sessionMessage }) {
  const [erro, setErro] = useState("");
  const [entrando, setEntrando] = useState(false);
  async function entrar(evento) {
    evento.preventDefault();
    const campos = new FormData(evento.currentTarget);
    setErro("");
    setEntrando(true);
    try {
      const resposta = await request("/login", {
        method: "POST",
        data: {
          email: campos.get("email").trim(),
          password: campos.get("password"),
        },
      });
      if (!resposta.data?.access_token) {
        throw new Error("O servidor não retornou uma sessão válida.");
      }
      auth.set(resposta.data.access_token);
      onLogin();
    } catch (erro) {
      setErro(erro.message);
    } finally {
      setEntrando(false);
    }
  }
  return (
    <main className="login-wrap">
      <section className="login-card">
        <div className="brand">
          pontosat<span>ATENDIMENTO</span>
        </div>
        <h1>Entrar</h1>
        <p className="muted">Acesse para abrir e acompanhar seus chamados.</p>
        {(erro || sessionMessage) && <Notice>{erro || sessionMessage}</Notice>}
        <form className="stack" onSubmit={entrar}>
          <label>
            E-mail
            <input
              type="email"
              name="email"
              autoComplete="username"
              required
              autoFocus
              disabled={entrando}
            />
          </label>
          <label>
            Senha
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              disabled={entrando}
            />
          </label>
          <button disabled={entrando}>
            {entrando ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </section>
    </main>
  );
}
