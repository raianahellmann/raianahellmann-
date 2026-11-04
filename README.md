# Sistema de chamados

Frontend para abertura e acompanhamento de chamados de atendimento, desenvolvido com React, JavaScript e CSS e integrado a uma API REST externa.

## Funcionalidades

- Login com e-mail e senha.
- Listagem de chamados com busca, filtro por status e paginação.
- Criação, edição e exclusão de chamados.
- Conversas com envio, edição e exclusão de mensagens.
- Exibição de conteúdo em Markdown e layout responsivo.

Os status disponíveis são **Aberto**, **Em atendimento** e **Finalizado**. A interface permite editar e excluir chamados e mensagens ao autor ou a um administrador; a API deve validar essas permissões.

## Tecnologias

React 19, Vite 7, JavaScript, CSS, react-markdown, Vitest e Prettier.

## Como executar

É necessário ter Node.js 22.12 ou superior da linha 22, npm e uma conta válida na API. O backend não está incluído no projeto.

No PowerShell, dentro da pasta do projeto:

```powershell
npm.cmd ci
Copy-Item .env.example .env
npm.cmd run dev
```

Abra o endereço exibido no terminal e faça login. Em outros terminais, utilize `npm` e copie `.env.example` para `.env` com o comando correspondente do sistema.

## Configuração da API

O `.env.example` contém:

```dotenv
API_PROXY_TARGET=http://api-segunda-fase.pontosat.net.br:29461
VITE_API_BASE_URL=
```

- `API_PROXY_TARGET`: destino do proxy utilizado pelo Vite no desenvolvimento e no preview.
- `VITE_API_BASE_URL`: base opcional para acessar a API diretamente. Deixe vazia para utilizar a mesma origem do frontend. O código acrescenta `/api/v2` automaticamente.

O token de autenticação fica no `sessionStorage` e é enviado como Bearer. Uma resposta HTTP 401 fora do login encerra a sessão local. Os contratos da API estão em `openapi.json`.

## Comandos

| Comando | Função |
| --- | --- |
| `npm run dev` | Iniciar o desenvolvimento |
| `npm test` | Executar os cinco testes da camada de API |
| `npm run build` | Gerar a versão de produção em `dist/` |
| `npm run preview` | Visualizar o build localmente |
| `npm run format` | Formatar o código e o README |

No PowerShell, use `npm.cmd` se necessário. Os testes utilizam requisições simuladas e não validam a API real.

## Estrutura principal

```text
src/
├── main.jsx          # Inicialização do React
├── App.jsx           # Sessão e navegação entre telas
├── api.js            # Requisições, autenticação e filtros
├── api.test.js       # Testes da camada de API
├── styles.css        # Estilos e responsividade
└── components/       # Login, lista, formulário, detalhes e componentes comuns
```

## Publicação

Gere o build com `npm run build` e publique a pasta `dist/`. O proxy do Vite não acompanha o build: configure um proxy reverso na hospedagem ou defina `VITE_API_BASE_URL` antes de compilar, com CORS permitido na API. Para acesso direto a partir de uma página HTTPS, a API também precisa usar HTTPS.
