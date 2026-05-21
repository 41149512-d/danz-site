
# Danz Shop

Aplicacao de e-commerce em React/Vite com uma API local de compras.

## Rodando o projeto

Instale as dependencias:

```bash
npm i
```

Em um terminal, suba a API:

```bash
npm run dev:api
```

Em outro terminal, suba o front-end:

```bash
npm run dev
```

## Back-end

A API roda em `http://localhost:3333` e grava os dados em `server/data/db.json`.

- `GET /api/health`
- `GET /api/products`
- `GET /api/orders`
- `POST /api/orders`

O checkout valida estoque e calcula o total no servidor.

## Deploy

O front-end esta configurado para GitHub Pages em:

```text
https://41149512-d.github.io/danz-site/
```

Para publicar o back-end no Render:

1. Entre em https://render.com e escolha **New +** > **Blueprint**.
2. Conecte o repositorio `41149512-d/danz-site`.
3. Selecione o arquivo `render.yaml` e crie o servico.
4. Copie a URL gerada para a API, por exemplo `https://danz-site-api.onrender.com`.
5. No workflow/ambiente do front, configure `VITE_API_URL` com essa URL e rode um novo deploy do GitHub Pages.

Localmente, voce pode criar um `.env` a partir de `.env.example` para apontar o front para outra API.
