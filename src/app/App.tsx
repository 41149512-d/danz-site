import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Box,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Circle,
  Clock,
  CreditCard,
  Heart,
  LogOut,
  MapPin,
  Minus,
  Package,
  Plus,
  Search,
  Settings,
  ShoppingBag,
  Star,
  Trash2,
  Truck,
  User,
} from "lucide-react";

type Tab = "shopping" | "profile" | "tracking";
type Category = "all" | "camisetas" | "moletons" | "calcas" | "jaquetas" | "shorts" | "acessorios";
type CheckoutState = "idle" | "loading" | "success" | "error";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: Category;
  colors: string[];
  stock: number;
}

interface CartItem {
  productId: number;
  quantity: number;
}

interface OrderItem {
  productId: number;
  name: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

interface Order {
  id: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: string;
  trackingCode: string;
  createdAt: string;
}

const fallbackProducts: Product[] = [
  {
    id: 1,
    name: "Camiseta Essential",
    price: 99.9,
    image: "https://images.unsplash.com/photo-1763750581767-b367bcd6c117?w=400&h=440&fit=crop&auto=format",
    category: "camisetas",
    colors: ["#111111", "#E8E8E8", "#888888"],
    stock: 12,
  },
  {
    id: 2,
    name: "Moleton Overz",
    price: 199.9,
    image: "https://images.unsplash.com/photo-1762666167421-ff983e35ba98?w=400&h=440&fit=crop&auto=format",
    category: "moletons",
    colors: ["#111111", "#E8E8E8"],
    stock: 8,
  },
  {
    id: 3,
    name: "Calca Cargo Street",
    price: 289.9,
    image: "https://images.unsplash.com/photo-1762666168682-8229f2a62305?w=400&h=440&fit=crop&auto=format",
    category: "calcas",
    colors: ["#111111", "#6B5E4E"],
    stock: 6,
  },
  {
    id: 4,
    name: "Jaqueta Nylon Tech",
    price: 349.9,
    image: "https://images.unsplash.com/photo-1767036840795-359e1c5fba16?w=400&h=440&fit=crop&auto=format",
    category: "jaquetas",
    colors: ["#111111", "#E8E8E8"],
    stock: 4,
  },
  {
    id: 5,
    name: "Bone Signature",
    price: 79.9,
    image: "https://images.unsplash.com/photo-1760920527114-2958980d44d2?w=400&h=440&fit=crop&auto=format",
    category: "acessorios",
    colors: ["#111111"],
    stock: 15,
  },
  {
    id: 6,
    name: "Shorts Track",
    price: 139.9,
    image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&h=440&fit=crop&auto=format",
    category: "shorts",
    colors: ["#111111", "#F0F0F0"],
    stock: 10,
  },
];

const categories: { key: Category; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "camisetas", label: "Camisetas" },
  { key: "moletons", label: "Moletons" },
  { key: "calcas", label: "Calcas" },
  { key: "jaquetas", label: "Jaquetas" },
  { key: "shorts", label: "Shorts" },
  { key: "acessorios", label: "Acessorios" },
];

const apiBaseUrl = import.meta.env.VITE_API_URL || "";

function apiUrl(path: string) {
  return `${apiBaseUrl}${path}`;
}

function formatPrice(value: number) {
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(value));
}

function ProductCard({
  product,
  quantity,
  onAddToCart,
}: {
  product: Product;
  quantity: number;
  onAddToCart: (product: Product) => void;
}) {
  const [liked, setLiked] = useState(false);
  const soldOut = product.stock <= 0;

  return (
    <div className="group bg-card rounded-lg overflow-hidden flex flex-col transition-all duration-200 hover:bg-[#2A2A2A]">
      <div className="relative bg-[#1E1E1E] overflow-hidden" style={{ aspectRatio: "4/4.4" }}>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <button
          onClick={(event) => {
            event.stopPropagation();
            setLiked(!liked);
          }}
          className="absolute top-2.5 right-2.5 w-7 h-7 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-full transition-all hover:bg-black/60"
          aria-label="Favoritar produto"
        >
          <Heart size={13} className={liked ? "fill-white text-white" : "text-white/70"} />
        </button>
        {quantity > 0 && (
          <span className="absolute left-2.5 top-2.5 bg-foreground text-background text-[10px] font-bold rounded-full px-2 py-0.5">
            {quantity} no carrinho
          </span>
        )}
      </div>
      <div className="p-3 flex flex-col gap-3">
        <div>
          <p className="text-sm text-foreground font-medium leading-tight truncate">{product.name}</p>
          <p className="text-sm text-muted-foreground mt-0.5">{formatPrice(product.price)}</p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {product.colors.map((color, index) => (
              <div
                key={`${product.id}-${color}-${index}`}
                className="w-3 h-3 rounded-full border border-white/20 flex-shrink-0"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground">{product.stock} disp.</span>
        </div>
        <button
          onClick={() => onAddToCart(product)}
          disabled={soldOut || quantity >= product.stock}
          className="flex items-center justify-center gap-1.5 bg-foreground text-background text-xs font-semibold px-3 py-2 rounded-lg transition-colors hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus size={13} />
          {soldOut ? "Esgotado" : "Adicionar"}
        </button>
      </div>
    </div>
  );
}

function CartPanel({
  cart,
  products,
  checkoutState,
  checkoutMessage,
  onIncrement,
  onDecrement,
  onRemove,
  onCheckout,
}: {
  cart: CartItem[];
  products: Product[];
  checkoutState: CheckoutState;
  checkoutMessage: string;
  onIncrement: (product: Product) => void;
  onDecrement: (productId: number) => void;
  onRemove: (productId: number) => void;
  onCheckout: () => void;
}) {
  const items = cart
    .map((item) => {
      const product = products.find((candidate) => candidate.id === item.productId);
      return product ? { ...item, product } : null;
    })
    .filter(Boolean) as Array<CartItem & { product: Product }>;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal === 0 || subtotal >= 300 ? 0 : 19.9;
  const total = subtotal + shipping;

  return (
    <aside className="border-l border-border bg-[#141414] w-[320px] flex-shrink-0 hidden lg:flex flex-col">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Carrinho</p>
          <p className="text-[11px] text-muted-foreground">{items.length} produto(s)</p>
        </div>
        <ShoppingBag size={18} className="text-muted-foreground" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3" style={{ scrollbarWidth: "none" }}>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <ShoppingBag size={28} className="text-muted-foreground mb-3" />
            <p className="text-sm text-foreground font-medium">Seu carrinho esta vazio</p>
            <p className="text-xs text-muted-foreground mt-1">Adicione pecas para finalizar uma compra.</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.productId} className="bg-card border border-border rounded-lg p-3 flex gap-3">
              <img src={item.product.image} alt={item.product.name} className="w-14 h-16 object-cover rounded-md bg-secondary" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{item.product.name}</p>
                    <p className="text-[11px] text-muted-foreground">{formatPrice(item.product.price)}</p>
                  </div>
                  <button onClick={() => onRemove(item.productId)} className="text-muted-foreground hover:text-foreground">
                    <Trash2 size={13} />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onDecrement(item.productId)}
                      className="w-6 h-6 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-foreground"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-xs text-foreground min-w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => onIncrement(item.product)}
                      disabled={item.quantity >= item.product.stock}
                      className="w-6 h-6 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <p className="text-xs font-semibold text-foreground">{formatPrice(item.product.price * item.quantity)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-border p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Frete</span>
          <span>{shipping === 0 ? "Gratis" : formatPrice(shipping)}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-foreground font-bold">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
        {checkoutMessage && (
          <p className={`text-[11px] ${checkoutState === "error" ? "text-red-400" : "text-green-400"}`}>
            {checkoutMessage}
          </p>
        )}
        <button
          onClick={onCheckout}
          disabled={items.length === 0 || checkoutState === "loading"}
          className="flex items-center justify-center gap-2 bg-foreground text-background text-xs font-semibold px-4 py-3 rounded-lg hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <CreditCard size={14} />
          {checkoutState === "loading" ? "Processando..." : "Finalizar compra"}
        </button>
      </div>
    </aside>
  );
}

function ShoppingView({
  products,
  cart,
  checkoutState,
  checkoutMessage,
  onAddToCart,
  onIncrement,
  onDecrement,
  onRemove,
  onCheckout,
}: {
  products: Product[];
  cart: CartItem[];
  checkoutState: CheckoutState;
  checkoutMessage: string;
  onAddToCart: (product: Product) => void;
  onIncrement: (product: Product) => void;
  onDecrement: (productId: number) => void;
  onRemove: (productId: number) => void;
  onCheckout: () => void;
}) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const filtered = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "all" || product.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        <header className="flex items-center gap-4 px-6 py-3 border-b border-border flex-shrink-0" style={{ background: "#141414" }}>
          <span className="text-sm font-semibold text-foreground tracking-tight flex-shrink-0">danz.inzx</span>
          <div className="flex-1 flex items-center gap-2 bg-secondary border border-border rounded-lg px-3 py-2">
            <Search size={13} className="text-muted-foreground flex-shrink-0" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Pesquisar pecas, categorias ou estilos..."
              className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none"
            />
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <Heart size={18} strokeWidth={1.5} />
            </button>
            <button className="text-muted-foreground hover:text-foreground transition-colors relative">
              <ShoppingBag size={18} strokeWidth={1.5} />
              <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 bg-foreground text-background text-[9px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          <div className="relative overflow-hidden mx-4 mt-4 rounded-xl" style={{ background: "#1E1E1E", minHeight: "200px" }}>
            <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none overflow-hidden" aria-hidden>
              <span
                className="text-white/[0.04] font-black whitespace-nowrap"
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: "clamp(5rem, 18vw, 14rem)",
                  fontWeight: 900,
                }}
              >
                danz.inzx
              </span>
            </div>

            <div className="relative z-10 flex items-center" style={{ minHeight: "200px" }}>
              <div className="flex-1 px-8 py-8">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                  Bem-vindo a
                </p>
                <h1
                  className="text-foreground font-black leading-none mb-3"
                  style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: "clamp(2.5rem, 5vw, 4rem)",
                    fontWeight: 900,
                  }}
                >
                  danz.inzx
                </h1>
                <p className="text-base text-foreground font-semibold mb-1">Estilo que move. Atitude que fica.</p>
                <p className="text-xs text-muted-foreground mb-5 max-w-xs leading-relaxed">
                  Escolha suas pecas, monte o carrinho e finalize o pedido com estoque validado pela API.
                </p>
                <button className="flex items-center gap-2 bg-foreground text-background text-xs font-semibold px-5 py-2.5 rounded-lg hover:bg-foreground/90 transition-colors">
                  Explorar agora <ChevronRight size={13} />
                </button>
              </div>

              <div className="flex-shrink-0 self-stretch" style={{ width: "45%", minHeight: "200px" }}>
                <img
                  src="https://images.unsplash.com/photo-1762666168682-8229f2a62305?w=600&h=400&fit=crop&auto=format&q=80"
                  alt="Modelos vestindo pecas danz.inzx"
                  className="w-full h-full object-cover"
                  style={{ objectPosition: "center top" }}
                />
              </div>
            </div>
          </div>

          <div className="px-4 pb-8 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground">Compre por categoria</h2>
              <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                Mais recentes <ChevronDown size={12} />
              </button>
            </div>

            <div className="flex gap-2 overflow-x-auto mb-5" style={{ scrollbarWidth: "none" }}>
              {categories.map((category) => (
                <button
                  key={category.key}
                  onClick={() => setActiveCategory(category.key)}
                  className={`flex-shrink-0 text-xs px-3.5 py-1.5 rounded-full font-medium transition-all duration-200 ${
                    activeCategory === category.key
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground border border-border hover:border-foreground/30"
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>

            {filtered.length > 0 ? (
              <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
                {filtered.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    quantity={cart.find((item) => item.productId === product.id)?.quantity || 0}
                    onAddToCart={onAddToCart}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Search size={28} className="text-muted-foreground mb-3" />
                <p className="text-muted-foreground text-sm">Nenhuma peca encontrada para "{search}"</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <CartPanel
        cart={cart}
        products={products}
        checkoutState={checkoutState}
        checkoutMessage={checkoutMessage}
        onIncrement={onIncrement}
        onDecrement={onDecrement}
        onRemove={onRemove}
        onCheckout={onCheckout}
      />
    </div>
  );
}

function ProfileView({ orders }: { orders: Order[] }) {
  const completedOrders = orders.length + 28;
  const spent = orders.reduce((sum, order) => sum + order.total, 12380);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="flex items-center px-6 py-3 border-b border-border flex-shrink-0" style={{ background: "#141414" }}>
        <span className="text-sm font-semibold text-foreground">danz.inzx</span>
      </header>
      <div className="flex-1 overflow-y-auto p-6 gap-5 flex flex-col" style={{ scrollbarWidth: "none" }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Bem-vindo de volta</p>
            <h2 className="text-2xl font-black text-foreground" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>ALEX DANZ</h2>
            <p className="text-xs text-muted-foreground mt-0.5">alex@danz.inzx</p>
          </div>
          <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
            <span className="text-foreground font-bold text-sm" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>AD</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 border border-border rounded-lg bg-card px-4 py-3">
          <Star size={13} className="fill-yellow-400 text-yellow-400 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-foreground">Membro VIP Gold</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{formatPrice(spent)} em compras - 1.238 pts</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Pedidos", value: String(completedOrders) },
            { label: "Favoritos", value: "14" },
            { label: "Cashback", value: "R$124" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-lg p-4 flex flex-col gap-1">
              <span className="text-xl font-black text-foreground" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{stat.value}</span>
              <span className="text-[10px] text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-foreground">Historico de Pedidos</p>
            <button className="text-xs text-muted-foreground hover:text-foreground">Ver tudo</button>
          </div>
          <div className="flex flex-col gap-2">
            {orders.length === 0 ? (
              <p className="text-xs text-muted-foreground bg-card border border-border rounded-lg p-4">Nenhuma compra feita nesta sessao.</p>
            ) : (
              orders.slice(0, 4).map((order) => (
                <div key={order.id} className="bg-card border border-border rounded-lg px-4 py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-foreground">#{order.id}</span>
                      <span className="text-[10px] text-muted-foreground">{formatDate(order.createdAt)}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">{order.items.map((item) => item.name).join(" + ")}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-sm font-bold text-foreground" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{formatPrice(order.total)}</span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-sm bg-green-500/10 text-green-400">{order.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-foreground mb-3">Configuracoes</p>
          <div className="flex flex-col gap-1">
            {[
              { icon: MapPin, label: "Enderecos Salvos", sub: "3 enderecos" },
              { icon: CreditCard, label: "Pagamentos", sub: "Visa **** 4231" },
              { icon: Bell, label: "Notificacoes", sub: "Ativas" },
              { icon: Settings, label: "Conta", sub: "alex@danz.inzx" },
            ].map(({ icon: Icon, label, sub }) => (
              <button key={label} className="flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-lg hover:border-foreground/20 transition-colors text-left group">
                <Icon size={14} className="text-muted-foreground flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-foreground">{label}</p>
                  <p className="text-[11px] text-muted-foreground">{sub}</p>
                </div>
                <ChevronRight size={12} className="text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TrackingView({ orders }: { orders: Order[] }) {
  const activeOrder = orders[0];
  const orderSteps = [
    { label: "Pedido Confirmado", time: activeOrder ? formatDate(activeOrder.createdAt) : "--", done: Boolean(activeOrder) },
    { label: "Em Separacao", time: "Proxima etapa", done: false, active: Boolean(activeOrder) },
    { label: "Enviado", time: "Aguardando", done: false },
    { label: "A Caminho", time: "Aguardando", done: false },
    { label: "Entregue", time: "Previsto", done: false },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="flex items-center px-6 py-3 border-b border-border flex-shrink-0" style={{ background: "#141414" }}>
        <span className="text-sm font-semibold text-foreground">danz.inzx</span>
      </header>
      <div className="flex-1 overflow-y-auto p-6 gap-5 flex flex-col" style={{ scrollbarWidth: "none" }}>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Rastreamento</p>
          <h2 className="text-2xl font-black text-foreground" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>SEUS PEDIDOS</h2>
        </div>

        {activeOrder ? (
          <>
            <div className="border border-border rounded-xl bg-card p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Pedido Ativo</p>
                  <p className="text-base font-bold text-foreground" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>#{activeOrder.id}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{activeOrder.items.map((item) => item.name).join(" + ")}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground">Total</p>
                  <p className="text-base font-bold text-foreground" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{formatPrice(activeOrder.total)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-foreground/5 border border-foreground/10 rounded-lg px-3 py-2 mb-4">
                <Bell size={11} className="text-foreground/60 flex-shrink-0" />
                <p className="text-[11px] text-foreground/70">Pedido recebido pela API. Codigo {activeOrder.trackingCode}.</p>
              </div>

              <div className="flex flex-col">
                {orderSteps.map((step, index) => (
                  <div key={step.label} className="flex items-start gap-3">
                    <div className="flex flex-col items-center" style={{ width: "20px" }}>
                      <div className={`w-4 h-4 flex items-center justify-center rounded-full flex-shrink-0 mt-0.5 ${step.done ? "bg-foreground" : step.active ? "border-2 border-foreground" : "border border-border"}`}>
                        {step.done ? <CheckCircle size={10} className="text-background" /> : step.active ? <Circle size={6} className="fill-foreground text-foreground" /> : null}
                      </div>
                      {index < orderSteps.length - 1 && (
                        <div className={`w-px my-1 ${step.done ? "bg-foreground/30" : "bg-border"}`} style={{ minHeight: "20px" }} />
                      )}
                    </div>
                    <div className="pb-3 flex-1">
                      <div className="flex items-center justify-between">
                        <p className={`text-xs font-medium ${step.done || step.active ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</p>
                        <p className="text-[10px] text-muted-foreground">{step.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-card border border-border rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Truck size={11} className="text-muted-foreground" />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Transportadora</p>
                </div>
                <p className="text-xs font-medium text-foreground">Correios PAC</p>
                <p className="text-[11px] text-muted-foreground">{activeOrder.trackingCode}</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Clock size={11} className="text-muted-foreground" />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Previsao</p>
                </div>
                <p className="text-xs font-medium text-foreground">3 a 5 dias uteis</p>
                <p className="text-[11px] text-green-400">Em separacao</p>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <Package size={28} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-semibold text-foreground">Nenhum pedido ativo</p>
            <p className="text-xs text-muted-foreground mt-1">Finalize uma compra para acompanhar o rastreamento aqui.</p>
          </div>
        )}

        <div>
          <p className="text-xs font-semibold text-foreground mb-3">Entregas Anteriores</p>
          <div className="flex flex-col gap-2">
            {orders.slice(1).map((order) => (
              <div key={order.id} className="flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-3">
                <Box size={13} className="text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground">#{order.id}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{order.items.map((item) => item.name).join(" + ")}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-[11px] text-muted-foreground">{formatDate(order.createdAt)}</p>
                  <p className="text-[10px] text-green-400 font-semibold">{order.status}</p>
                </div>
              </div>
            ))}
            {orders.length <= 1 && <p className="text-xs text-muted-foreground bg-card border border-border rounded-lg p-4">Sem pedidos anteriores.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("shopping");
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [checkoutState, setCheckoutState] = useState<CheckoutState>("idle");
  const [checkoutMessage, setCheckoutMessage] = useState("");

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  async function refreshProducts() {
    const response = await fetch(apiUrl("/api/products"));
    if (!response.ok) {
      throw new Error("Nao foi possivel carregar produtos.");
    }
    const data = await response.json();
    setProducts(data.products);
  }

  async function refreshOrders() {
    const response = await fetch(apiUrl("/api/orders"));
    if (!response.ok) {
      throw new Error("Nao foi possivel carregar pedidos.");
    }
    const data = await response.json();
    setOrders(data.orders);
  }

  useEffect(() => {
    refreshProducts().catch(() => undefined);
    refreshOrders().catch(() => undefined);
  }, []);

  function addToCart(product: Product) {
    setCheckoutState("idle");
    setCheckoutMessage("");
    setCart((current) => {
      const existing = current.find((item) => item.productId === product.id);

      if (existing) {
        return current.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
            : item,
        );
      }

      return [...current, { productId: product.id, quantity: 1 }];
    });
  }

  function decrementCart(productId: number) {
    setCart((current) =>
      current
        .map((item) => (item.productId === productId ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0),
    );
  }

  function removeFromCart(productId: number) {
    setCart((current) => current.filter((item) => item.productId !== productId));
  }

  async function checkout() {
    setCheckoutState("loading");
    setCheckoutMessage("");

    try {
      const response = await fetch(apiUrl("/api/orders"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: { name: "Alex Danz", email: "alex@danz.inzx" },
          items: cart,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Compra recusada.");
      }

      setOrders((current) => [data.order, ...current]);
      setCart([]);
      setCheckoutState("success");
      setCheckoutMessage(`Pedido #${data.order.id} criado com sucesso.`);
      await refreshProducts();
      setActiveTab("tracking");
    } catch (error) {
      setCheckoutState("error");
      setCheckoutMessage(error instanceof Error ? error.message : "Nao foi possivel finalizar a compra.");
    }
  }

  const tabs: { key: Tab; icon: typeof ShoppingBag; label: string }[] = [
    { key: "shopping", icon: ShoppingBag, label: "Compras" },
    { key: "profile", icon: User, label: "Perfil" },
    { key: "tracking", icon: Package, label: "Rastreamento" },
  ];

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      <aside className="flex flex-col items-center py-4 border-r border-border flex-shrink-0" style={{ width: "68px", background: "#141414" }}>
        <div className="mb-4 px-2 w-full">
          <p className="text-[9px] font-bold text-foreground tracking-tight text-center">danz.inzx</p>
        </div>

        <button className="flex flex-col items-center gap-1 py-2.5 px-2 w-full mb-1 text-muted-foreground hover:text-foreground transition-colors">
          <Search size={16} strokeWidth={1.5} />
        </button>

        <div className="w-full px-2 mb-1">
          <div className="border-t border-border/50" />
        </div>

        <nav className="flex flex-col gap-0.5 flex-1 w-full px-2">
          {tabs.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`relative flex flex-col items-center gap-1 py-3 px-1 w-full rounded-lg transition-all duration-200 ${
                activeTab === key
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <Icon size={16} strokeWidth={activeTab === key ? 2 : 1.5} />
              <span className="text-[9px] leading-none text-center">{label}</span>
              {key === "shopping" && cartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-4 h-4 px-1 bg-foreground text-background text-[9px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <button className="flex flex-col items-center gap-1 py-3 w-full px-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50">
          <LogOut size={15} strokeWidth={1.5} />
          <span className="text-[9px]">Sair</span>
        </button>
      </aside>

      <main className="flex-1 min-w-0 overflow-hidden flex flex-col">
        {activeTab === "shopping" && (
          <ShoppingView
            products={products}
            cart={cart}
            checkoutState={checkoutState}
            checkoutMessage={checkoutMessage}
            onAddToCart={addToCart}
            onIncrement={addToCart}
            onDecrement={decrementCart}
            onRemove={removeFromCart}
            onCheckout={checkout}
          />
        )}
        {activeTab === "profile" && <ProfileView orders={orders} />}
        {activeTab === "tracking" && <TrackingView orders={orders} />}
      </main>
    </div>
  );
}
