import { useState } from "react";
import { first, request } from "../api";
import { Notice } from "./ui";
export default function TicketForm({ ticket, onCancel, onSave }) {
  const [titulo, setTitulo] = useState(ticket?.title || "");
  const [descricao, setDescricao] = useState(ticket?.description || "");
  const [status, setStatus] = useState(ticket?.status || "open");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  async function enviarFormulario(evento) {
    evento.preventDefault();
    if (!titulo.trim() || !descricao.trim()) {
      setErro("Preencha o título e a descrição.");
      return;
    }
    setSalvando(true);
    setErro("");
    try {
      let caminho = "/tickets";
      let metodo = "POST";
      if (ticket) {
        caminho = "/tickets/" + ticket.id;
        metodo = "PUT";
      }
      const dados = {
        title: titulo.trim(),
        description: descricao.trim(),
        status: status,
      };
      const resposta = await request(caminho, {
        method: metodo,
        data: dados,
      });
      onSave(first(resposta.data));
    } catch (erro) {
      setErro(erro.message);
    } finally {
      setSalvando(false);
    }
  }
  let tituloPagina = "Novo chamado";
  let textoBotao = "Abrir chamado";
  if (ticket) {
    tituloPagina = "Editar chamado #" + ticket.id;
    textoBotao = "Salvar alterações";
  }
  if (salvando) {
    textoBotao = "Salvando…";
  }
  return (
    <section className="form-page">
      <button className="text-button" disabled={salvando} onClick={onCancel}>
        ← Voltar
      </button>
      <h1>{tituloPagina}</h1>
      <p className="muted">
        Descreva a solicitação para facilitar o atendimento.
      </p>
      <form className="panel stack" onSubmit={enviarFormulario}>
        {erro && <Notice>{erro}</Notice>}
        <label>
          Título <span className="muted">(obrigatório)</span>
          <input
            autoFocus
            maxLength={255}
            required
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            disabled={salvando}
          />
        </label>
        <label>
          Descrição <span className="muted">(obrigatória)</span>
          <textarea
            rows={9}
            required
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            disabled={salvando}
          />
        </label>
        <label>
          Status
          <select
            value={status}
            disabled={salvando}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="open">Aberto</option>
            <option value="in_progress">Em atendimento</option>
            <option value="closed">Finalizado</option>
          </select>
        </label>
        <div className="actions">
          <button disabled={salvando}>{textoBotao}</button>
          <button
            type="button"
            className="secondary"
            disabled={salvando}
            onClick={onCancel}
          >
            Cancelar
          </button>
        </div>
      </form>
    </section>
  );
}
