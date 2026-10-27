# Validação da entrega

Validação em 27/10/2026 com a API original, pelo frontend local.

- Login de administrador e consulta do perfil: confirmados.
- Lista inicial: 500 chamados retornados pelo servidor.
- Indicadores: 100 abertos, 175 em atendimento, 225 finalizados antes do teste.
- Criação do chamado próprio #501: confirmada.
- Envio de uma mensagem no chamado #501 e leitura da conversa: confirmados.
- Edição de descrição e transição aberto → em atendimento → finalizado: confirmadas.
- Busca por `[Validação frontend]` combinada com status `closed`: um resultado, #501.
- O chamado de validação foi mantido finalizado para identificar a evidência. Chamados de terceiros não foram alterados.
- `npm run build`: build Vite aprovado; a versão simplificada usa JavaScript.
- `npm test`: dois testes de composição de filtros aprovados.
- Auditoria após atualizar dependências: nenhuma vulnerabilidade reportada.

Os testes automatizados cobrem composição e codificação dos filtros. A verificação de criação, edição e conversa foi manual no navegador com o backend real. O acesso de contas não administradoras e a expiração natural do token não foram exercitados nesta validação.

## Revisão simplificada

Após a conversão para JavaScript, foram conferidos novamente no navegador o login, a busca com filtro de status, a leitura do histórico e o salvamento do formulário no chamado próprio #501. Build e dois testes passaram. O layout recebeu CSS para telas menores; esta revisão não incluiu uma nova conferência visual em dispositivo móvel.
