# Pontosat — Sistema de chamados

Feito com React, JavaScript e CSS.

## Como executar:

No PowerShell/CMD, dentro da pasta do projeto:

```powershell
npm.cmd ci
Copy-Item .env.example .env
npm.cmd run dev
```

Para conferir o build e os testes:

```powershell
npm.cmd run build
npm.cmd test
```

## O que a aplicação faz:

- Login e saída da conta.
- Consulta dos chamados com busca, filtro de status e paginação.
- Criação e edição de título, descrição e status.
- Visualização da descrição, solicitante e datas.
- Leitura do histórico e envio de mensagens no chamado.
- Avisos de carregamento, erro e lista vazia.

## Organização do código:

- `src/App.jsx`: login, listagem e navegação entre as telas.
- `src/components/TicketForm.jsx`: formulário de criação e edição.
- `src/components/TicketDetail.jsx`: informações do chamado e conversa.
- `src/components/ui.jsx`: rótulo de status e aviso de erro.
- `src/api.js`: chamadas HTTP, token e filtros da API.
- `src/presentation.js`: nomes dos status e formatação de datas.
- `src/styles.css`: aparência e adaptação para telas menores.

Os componentes usam `useState` para guardar os dados da tela e `useEffect` para buscar dados na API. As requisições são feitas com `fetch`. O token fica em `sessionStorage` .

React monta a interface. Vite executa e gera o build. React Markdown exibe a formatação das descrições e mensagens recebidas da API, sem habilitar HTML arbitrário. Vitest verifica a montagem dos filtros; Prettier formata o código. O enunciado permite escolher bibliotecas.

## API e material utilizado:

A aplicação usa o enunciado e a [documentação disponibilizada pela empresa](http://api-segunda-fase.pontosat.net.br:29461/docs).

Endpoints usados: `/login`, `/me`, `/users`, `/tickets`, `/tickets/{id}` e `/ticket-interaction`, todos sob `/api/v2`.

## Verificação:

O fluxo completo foi testado na API usando o chamado próprio #501: criar, enviar mensagem, editar descrição e alterar de aberto para em atendimento e finalizado. Os testes automatizados verificam a composição dos filtros. Eles não substituem a conferência manual de toda a aplicação.

A revisão de escopo está em `docs/revisao-escopo.md`.
