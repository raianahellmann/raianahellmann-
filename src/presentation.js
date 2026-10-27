export const labels = {
  open: 'Aberto',
  in_progress: 'Em atendimento',
  closed: 'Finalizado',
};
export const date = (value) =>
  new Date(value).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
