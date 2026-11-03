import ReactMarkdown from "react-markdown";

export const statuses = {
  open: "Aberto",
  in_progress: "Em atendimento",
  closed: "Finalizado",
};
export function date(value) {
  if (!value) {
    return "—";
  }
  const options = { dateStyle: "short", timeStyle: "short" };
  return new Intl.DateTimeFormat("pt-BR", options).format(new Date(value));
}
export function Badge({ status }) {
  return (
    <span className={`badge ${status}`}>{statuses[status] || status}</span>
  );
}
export function Notice({ children, success = false }) {
  return (
    <div
      className={`notice ${success ? "success" : ""}`}
      role={success ? "status" : "alert"}
    >
      {children}
    </div>
  );
}
export function Markdown({ children }) {
  return (
    <div className="markdown">
      <ReactMarkdown skipHtml>{children || ""}</ReactMarkdown>
    </div>
  );
}
export function Pager({ page, total, size = 10, onChange, disabled = false }) {
  return (
    <div className="pagination">
      <span>
        {total} {total === 1 ? "registro" : "registros"} · Página {page + 1} de{" "}
        {Math.max(1, Math.ceil(total / size))}
      </span>
      <div className="actions">
        <button
          className="secondary"
          disabled={disabled || page === 0}
          onClick={() => onChange(page - 1)}
        >
          Anterior
        </button>
        <button
          className="secondary"
          disabled={disabled || (page + 1) * size >= total}
          onClick={() => onChange(page + 1)}
        >
          Próxima
        </button>
      </div>
    </div>
  );
}
