# Pontosat — Sistema de chamados

Feito com React, JavaScript e CSS.

Tem login, consulta, busca, filtro por status, criação e edição de chamados e conversa de cada chamado.

## Como executar:

Precisa ter Node.js 22.12 ou mais recente instalado.

No PowerShell, dentro da pasta do projeto:

```powershell
npm.cmd ci
Copy-Item .env.example .env
npm.cmd run dev
```

Abra o endereço que aparecer no terminal e use a conta fornecida pela empresa.

Para conferir o build e os testes:

```powershell
npm.cmd run build
npm.cmd test
```

A aplicação usa a [API do desafio](http://api-segunda-fase.pontosat.net.br:29461/docs). O Vite encaminha as chamadas durante o desenvolvimento. Para hospedar em HTTPS, é necessário um proxy HTTPS para a API, que usa HTTP.
