# Revisão do desafio — 27/10/2026

## Requisitos e implementação atual

| Pedido                                 | Onde foi atendido                                                                         |
| -------------------------------------- | ----------------------------------------------------------------------------------------- |
| ReactJS obrigatório                    | React e React DOM, com arquivos JavaScript e JSX                                          |
| Trabalhar com a API pronta             | Requisições centralizadas em `src/api.js` para a API fornecida                            |
| Consultar chamados e encontrá-los      | Tabela com busca por título/descrição, status e paginação                                 |
| Abrir chamados                         | Formulário com título, descrição e status                                                 |
| Editar informações e acompanhar status | Mesmo formulário em modo de edição; status em texto e cor                                 |
| Participar das conversas               | Histórico com autor/data e campo para enviar mensagem                                     |
| Entender o histórico                   | Mensagens em ordem cronológica e leitura de Markdown                                      |
| Interface fácil de usar                | Botões com texto, rótulos e mensagens de carregamento/erro                                |
| Repositório público e README           | Repositório existente com instruções de execução                                          |
| Verde, laranja e azul                  | CSS: verde nos botões/finalizados, laranja nos abertos e azul nos chamados em atendimento |

O login, a consulta do perfil, os nomes dos autores e o token dão suporte aos fluxos acima. O enunciado não exige criar um painel de administração de usuários, excluir chamados, editar mensagens ou usar todos os endpoints documentados. Esses recursos não foram implementados.

## Origem dos dados e recursos

- Usuários, chamados, status, datas e mensagens: API fornecida pela empresa.
- Campos e formato de requisição: contrato OpenAPI disponível em `docs/openapi.json`.
- Cores: pedido da candidata; os valores CSS foram escolhidos na implementação, pois não foi fornecido manual de marca.
- Textos de botão, instruções e mensagens de erro: escritos para a interface; não são conteúdo oficial da empresa.
- Identificação da empresa: texto simples “Pontosat”; não foi usado logotipo oficial.
- Bibliotecas: React, React DOM e React Markdown; ferramentas Vite, Vitest e Prettier. São dependências externas, permitidas expressamente pelo enunciado. Portanto, não seria correto afirmar que todo o código e todos os recursos foram fornecidos pela empresa.
- Não há banco local de chamados, imagens externas, Google Fonts, API alternativa ou modelo de interface baixado de terceiros.

## Simplificações feitas

Removidos o dashboard com contadores, menu lateral, filtro “meus chamados”, avatares, ícones, slogans, notificações flutuantes, modal e fontes remotas. TypeScript foi substituído por JavaScript, e o CSS foi reduzido. Criação e edição agora são exibidas em uma área comum da página. A busca é executada pelo botão Buscar, sem temporizador de digitação.

Foram preservados os cuidados necessários: validação de campos, envio bloqueado enquanto salva, erros de conexão, expiração de sessão e paginação. Simplificar não significa incluir erros ou reduzir a legibilidade do histórico.

## Limites da revisão

A complexidade percebida não comprova autoria ou nível de conhecimento. A candidata deve estudar os componentes e explicar a implementação e os recursos de apoio utilizados. Esta revisão compara o projeto com o enunciado recebido; não certifica regras adicionais de entrevista que não foram informadas.
