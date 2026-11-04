# Sistema de chamados

Frontend em React para abertura e acompanhamento de chamados de suporte, integrado a uma API REST externa.

## Funcionalidades

- Login com e-mail e senha e autenticação por token.
- Listagem de chamados com busca, filtro por status e paginação.
- Criação, edição e exclusão de chamados.
- Conversas com envio, edição e exclusão de mensagens.
- Status: **Aberto**, **Em atendimento** e **Finalizado**.
- Layout responsivo.

## Como rodar

Requer Node.js 22.12+ da linha 22 e uma conta válida na API.

```bash
npm install
npm run dev
```

Abra o endereço mostrado no terminal e faça login.


### API e proxy

O Vite encaminha as chamadas de `/api` para a API externa. A configuração padrão já permite iniciar o projeto sem criar um `.env`.

Para alterar o servidor, copie `.env.example` para `.env` e ajuste `API_PROXY_TARGET`. O backend não está incluído no projeto; os contratos estão em `openapi.json`.

## Estrutura

```text
src/
├── components/
│   ├── Login.jsx          
│   ├── TicketList.jsx    
│   ├── TicketForm.jsx     
│   ├── TicketDetail.jsx   
│   └── ui.jsx             
├── App.jsx                
├── main.jsx               
├── api.js                
├── api.test.js           
└── styles.css             
```

## Decisões e limitações

- O token fica no `sessionStorage`. Uma resposta 401 fora do login encerra a sessão local.
- Os botões de edição e exclusão aparecem para o autor ou administrador; a API deve validar as permissões.
- A navegação usa o estado do React, sem URLs próprias para cada tela.

