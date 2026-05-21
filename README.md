
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
