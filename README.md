# Sistema de chamados

Frontend feito com React, JavaScript e CSS e integrado à API fornecida.

Permite fazer login, consultar e buscar chamados, abrir e editar solicitações, alterar o status e conversar em cada chamado. Também permite editar e excluir mensagens e excluir chamados.

## Como executar

No PowerShell, dentro da pasta do projeto:

```powershell
npm.cmd ci
Copy-Item .env.example .env
npm.cmd run dev
```

Abra o endereço que aparecer no terminal e entre com a conta fornecida pela empresa.

## Testes e build

```powershell
npm.cmd test
npm.cmd run build
```

Para visualizar o build localmente:

```powershell
npm.cmd run preview
```

## API

[Documentação da API](http://api-segunda-fase.pontosat.net.br:29461/docs)

O endereço da API está configurado no `.env.example`. Durante o desenvolvimento e o preview, o Vite vai encaminhar as requisições para esse servidor.
