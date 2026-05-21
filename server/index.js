import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, "data", "db.json");
const port = Number(process.env.PORT || 3333);

async function readDb() {
  const content = await readFile(dbPath, "utf8");
  return JSON.parse(content);
}

async function writeDb(db) {
  await writeFile(dbPath, `${JSON.stringify(db, null, 2)}\n`, "utf8");
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(payload));
}

async function readJsonBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }

  if (!chunks.length) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function normalizeItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("O carrinho esta vazio.");
  }

  return items.map((item) => {
    const productId = Number(item.productId);
    const quantity = Number(item.quantity);

    if (!Number.isInteger(productId) || productId <= 0) {
      throw new Error("Produto invalido no carrinho.");
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error("Quantidade invalida no carrinho.");
    }

    return { productId, quantity };
  });
}

function createOrder(db, payload) {
  const items = normalizeItems(payload.items);
  const customer = {
    name: String(payload.customer?.name || "Cliente Danz").trim(),
    email: String(payload.customer?.email || "cliente@danz.inzx").trim(),
  };

  const orderItems = items.map((item) => {
    const product = db.products.find((candidate) => candidate.id === item.productId);

    if (!product) {
      throw new Error(`Produto ${item.productId} nao encontrado.`);
    }

    if (product.stock < item.quantity) {
      throw new Error(`${product.name} tem apenas ${product.stock} unidade(s) em estoque.`);
    }

    return {
      productId: product.id,
      name: product.name,
      unitPrice: product.price,
      quantity: item.quantity,
      subtotal: Number((product.price * item.quantity).toFixed(2)),
    };
  });

  const subtotal = Number(orderItems.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2));
  const shipping = subtotal >= 300 ? 0 : 19.9;
  const total = Number((subtotal + shipping).toFixed(2));

  for (const item of items) {
    const product = db.products.find((candidate) => candidate.id === item.productId);
    product.stock -= item.quantity;
  }

  const order = {
    id: `DZ-${Date.now().toString().slice(-6)}`,
    customer,
    items: orderItems,
    subtotal,
    shipping,
    total,
    status: "Pedido Confirmado",
    trackingCode: `DZ${Math.floor(100000000 + Math.random() * 900000000)}BR`,
    createdAt: new Date().toISOString(),
  };

  db.orders.unshift(order);
  return order;
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url || "/", `http://${request.headers.host}`);

    if (request.method === "OPTIONS") {
      sendJson(response, 204, {});
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/health") {
      sendJson(response, 200, { ok: true, service: "danz-shop-api" });
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/products") {
      const db = await readDb();
      sendJson(response, 200, { products: db.products });
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/orders") {
      const db = await readDb();
      sendJson(response, 200, { orders: db.orders });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/orders") {
      const db = await readDb();
      const payload = await readJsonBody(request);
      const order = createOrder(db, payload);
      await writeDb(db);
      sendJson(response, 201, { order });
      return;
    }

    sendJson(response, 404, { error: "Rota nao encontrada." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno.";
    sendJson(response, 400, { error: message });
  }
});

server.listen(port, () => {
  console.log(`Danz Shop API running at http://localhost:${port}`);
});
