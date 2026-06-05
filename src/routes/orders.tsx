import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Package,
  Truck,
  Warehouse,
  Flag,
  CheckCircle2,
  ChevronDown,
  Copy,
  MapPin,
  MoreHorizontal,
  Search,
  SlidersHorizontal,
  Bell,
  Heart,
  ShoppingCart,
  Menu,
  CreditCard,
  Wallet,
  ClipboardList,
  AlertCircle,
  AlertTriangle,
  Clock,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "Мои заказы — pokupki" },
      {
        name: "description",
        content: "Отслеживайте статус и путь ваших заказов в одном месте.",
      },
    ],
  }),
  component: OrdersPage,
});

type OrderStatus =
  | "ordered_unpaid"
  | "paid"
  | "collecting"
  | "out_of_stock"
  | "from_supplier"
  | "delivering"
  | "ready"
  | "received"
  | "awaiting_payment"
  | "delayed";
type PaymentState = "awaiting" | "paid" | "surcharge";

type OrderItem = {
  id: string;
  title: string;
  size?: string;
  color?: string;
  qty: number;
  price: number; // base price
  commission: number; // комиссия
  image: string;
};

type ItemGroup = {
  status: OrderStatus;
  items: OrderItem[];
};

type Order = {
  id: string;
  number: string;
  brand: string;
  date: string;
  pickup: string;
  payment: PaymentState;
  payAmount?: number; // for awaiting / surcharge
  paidAmount?: number; // already paid for surcharge
  awaitingSeconds?: number; // for awaiting
  groups: ItemGroup[];
};

const STEPS: { key: OrderStatus; label: string; icon: typeof Package }[] = [
  { key: "ordered_unpaid", label: "Оформлен", icon: ClipboardList },
  { key: "paid", label: "Оплачен", icon: CheckCircle2 },
  { key: "collecting", label: "В сборке", icon: Package },
  { key: "from_supplier", label: "В пути от поставщика", icon: Truck },
  { key: "delivering", label: "Доставляется в пункт выдачи", icon: Truck },
  { key: "ready", label: "Готов к выдаче", icon: Flag },
  { key: "received", label: "Получен", icon: CheckCircle2 },
];

const img = (id: string) =>
  `https://images.unsplash.com/${id}?w=400&h=400&fit=crop`;

const ORDERS: Order[] = [
  {
    id: "pay",
    number: "0253984237-0001",
    brand: "Cap Store — головные уборы",
    date: "5 июня 2025",
    pickup: "Вольская, Макси ПВЗ на Удальцова",
    payment: "awaiting",
    payAmount: 291,
    awaitingSeconds: 37 * 60 + 21,
    groups: [
      {
        status: "collecting",
        items: [
          {
            id: "cap1",
            title: "Кепка бейсболка классическая",
            color: "серый",
            qty: 1,
            price: 250,
            commission: 41,
            image: img("photo-1521369909029-2afed882baee"),
          },
        ],
      },
    ],
  },
  {
    id: "1",
    number: "337456914",
    brand: "ECCO — комфорт в каждом движении!",
    date: "12 марта 2025",
    pickup: "Вольская, Макси ПВЗ на Удальцова",
    payment: "paid",
    groups: [
      {
        status: "from_supplier",
        items: [
          {
            id: "m17",
            title: "M17 Майка женская на бретелях",
            size: "50",
            color: "в ассортименте",
            qty: 2,
            price: 2600,
            commission: 400,
            image: img("photo-1602810318383-e386cc2a3ccf"),
          },
        ],
      },
      {
        status: "collecting",
        items: [
          {
            id: "m145",
            title: "M145 Майка женская",
            qty: 1,
            price: 1750,
            commission: 250,
            image: img("photo-1618932260643-eee4a2f652a6"),
          },
        ],
      },
    ],
  },
  {
    id: "2",
    number: "337456915",
    brand: "Tom Klaim. Женская одежда",
    date: "26 июня 2025",
    pickup: "Вольская, Макси ПВЗ на Удальцова",
    payment: "surcharge",
    payAmount: 820,
    paidAmount: 9998,
    groups: [
      {
        status: "out_of_stock",
        items: [
          {
            id: "j4887",
            title: "Жакет укороченный вечерний Лоренза 4887",
            size: "42",
            color: "жёлтый",
            qty: 1,
            price: 9400,
            commission: 1398,
            image: img("photo-1591047139829-d91aecb6caea"),
          },
        ],
      },
    ],
  },
  {
    id: "3",
    number: "337456916",
    brand: "Happywear — гипермаркет одежды",
    date: "9 июля 2025",
    pickup: "Стройкерамика, Макси ПВЗ",
    payment: "paid",
    groups: [
      {
        status: "ready",
        items: [
          {
            id: "hf1",
            title: "Женское пляжное платье Happyfox",
            size: "42-44",
            color: "нежно-розовый",
            qty: 1,
            price: 900,
            commission: 133,
            image: img("photo-1572804013309-59a88b7e92f1"),
          },
        ],
      },
      {
        status: "delivering",
        items: [
          {
            id: "hf2",
            title: "Сарафан летний хлопковый",
            size: "44",
            color: "молочный",
            qty: 1,
            price: 1450,
            commission: 220,
            image: img("photo-1490481651871-ab68de25d43d"),
          },
        ],
      },
    ],
  },
  {
    id: "4",
    number: "337456917",
    brand: "Eliseeva Olesya. Новинки",
    date: "5 июня 2025",
    pickup: "Вольская, Макси ПВЗ на Удальцова",
    payment: "surcharge",
    payAmount: 340,
    paidAmount: 8409,
    groups: [
      {
        status: "collecting",
        items: [
          {
            id: "72478",
            title: "72478 Жакет",
            size: "46",
            qty: 1,
            price: 7600,
            commission: 1129,
            image: img("photo-1490481651871-ab68de25d43d"),
          },
        ],
      },
    ],
  },
];

function formatPrice(n: number) {
  return new Intl.NumberFormat("ru-RU").format(n) + " ₽";
}

function formatTimer(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/* ---------- Header (как на скринах) ---------- */

function SiteHeader() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <button className="md:hidden rounded-md p-1.5 hover:bg-muted" aria-label="Меню">
          <Menu className="h-5 w-5 text-muted-foreground" />
        </button>

        <Link to="/" className="flex items-center gap-1.5 font-extrabold text-foreground">
          <span className="rounded-lg bg-primary px-2 py-1 text-sm text-primary-foreground">63</span>
          <span className="text-lg tracking-tight">pokupki</span>
        </Link>

        <button className="hidden md:inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground hover:opacity-95">
          <span className="flex h-4 w-4 flex-col justify-between">
            <span className="block h-0.5 w-full bg-primary-foreground rounded" />
            <span className="block h-0.5 w-full bg-primary-foreground rounded" />
            <span className="block h-0.5 w-full bg-primary-foreground rounded" />
          </span>
          Категории
        </button>

        <div className="ml-2 hidden flex-1 md:flex">
          <div className="relative w-full max-w-2xl">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-sm text-muted-foreground">
              <span>По каталогу</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </div>
            <input
              type="text"
              className="h-10 w-full rounded-xl border border-border bg-background pl-32 pr-20 text-sm outline-none focus:border-primary"
              placeholder=""
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button className="rounded-md p-1.5 text-primary hover:bg-muted" aria-label="Поиск">
                <Search className="h-4 w-4" />
              </button>
              <button className="rounded-md p-1.5 text-primary hover:bg-muted" aria-label="Фильтры">
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-foreground text-sm font-medium">
            Т
          </button>
          <button className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full text-primary hover:bg-muted" aria-label="Избранное">
            <Heart className="h-5 w-5" />
          </button>
          <button className="relative h-9 w-9 hidden sm:flex items-center justify-center rounded-full text-primary hover:bg-muted" aria-label="Уведомления">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-0.5 -right-0.5 rounded-full bg-destructive px-1.5 text-[10px] font-bold leading-4 text-destructive-foreground">
              29
            </span>
          </button>
          <button className="relative h-9 w-9 flex items-center justify-center rounded-full text-primary hover:bg-muted" aria-label="Корзина">
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -top-0.5 -right-0.5 rounded-full bg-destructive px-1.5 text-[10px] font-bold leading-4 text-destructive-foreground">
              32
            </span>
          </button>
        </div>
      </div>

      {/* Nav row */}
      <div className="border-t border-border/70">
        <div className="mx-auto flex max-w-6xl items-center gap-5 overflow-x-auto px-4 py-2.5 text-sm">
          <Link to="/" className="flex items-center gap-1.5 text-primary font-medium">
            Лента
          </Link>
          <span className="text-foreground font-medium">Заказы</span>
          <span className="text-muted-foreground hover:text-foreground cursor-pointer">Женщинам</span>
          <span className="text-muted-foreground hover:text-foreground cursor-pointer">Мужчинам</span>
          <span className="text-muted-foreground hover:text-foreground cursor-pointer">Детям</span>
          <span className="text-muted-foreground hover:text-foreground cursor-pointer">Дом</span>
          <span className="text-muted-foreground hover:text-foreground cursor-pointer">Косметика</span>
          <span className="text-success font-medium whitespace-nowrap">В наличии</span>
          <span className="text-success font-medium whitespace-nowrap">Выгодно</span>
          <span className="text-accent-foreground font-medium whitespace-nowrap">Бренды</span>
          <span className="text-destructive font-medium whitespace-nowrap">Товар дня</span>
        </div>
      </div>
    </header>
  );
}

/* ---------- Progress pipeline ---------- */

function StatusPipeline({ status }: { status: OrderStatus }) {
  const currentIndex = STEPS.findIndex((s) => s.key === status);
  return (
    <div className="flex items-center gap-1">
      {STEPS.map((step, idx) => {
        const Icon = step.icon;
        const isDone = idx < currentIndex;
        const isCurrent = idx === currentIndex;
        return (
          <div key={step.key} className="flex items-center">
            <div
              className={[
                "flex h-7 w-7 items-center justify-center rounded-full border transition-colors",
                isCurrent
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : isDone
                  ? "border-success/40 bg-success/10 text-success"
                  : "border-border bg-muted text-muted-foreground",
              ].join(" ")}
              title={step.label}
            >
              <Icon className="h-3.5 w-3.5" />
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={[
                  "h-0.5 w-5",
                  idx < currentIndex ? "bg-success/50" : "bg-track",
                ].join(" ")}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

const STATUS_META: Record<OrderStatus, { label: string; color: string }> = {
  ordered_unpaid: { label: "Оформлен — не оплачено", color: "text-muted-foreground" },
  paid: { label: "Оплачен", color: "text-success" },
  collecting: { label: "В сборке", color: "text-primary" },
  out_of_stock: { label: "Товар закончился", color: "text-destructive" },
  from_supplier: { label: "В пути от поставщика", color: "text-info" },
  delivering: { label: "Доставляется в пункт выдачи", color: "text-info" },
  ready: { label: "Готов к выдаче", color: "text-warning" },
  received: { label: "Получен", color: "text-success" },
  awaiting_payment: { label: "Ожидает оплаты", color: "text-destructive" },
  delayed: { label: "Задерживается", color: "text-destructive" },
};

function StatusLabel({ status }: { status: OrderStatus }) {
  const meta = STATUS_META[status];
  return (
    <span className={`text-sm font-medium ${meta.color}`}>
      {meta.label}
    </span>
  );
}

/* ---------- Price with tooltip ---------- */

function PriceWithTooltip({
  price,
  commission,
  className = "",
}: {
  price: number;
  commission: number;
  className?: string;
}) {
  const total = price + commission;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={`cursor-help underline decoration-dotted decoration-muted-foreground/40 underline-offset-4 ${className}`}
        >
          {formatPrice(total)}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="bg-foreground text-background">
        <div className="space-y-0.5 text-xs">
          <div className="flex justify-between gap-4">
            <span className="opacity-80">Цена:</span>
            <span>{formatPrice(price)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="opacity-80">Комиссия:</span>
            <span>{formatPrice(commission)}</span>
          </div>
          <div className="mt-1 border-t border-background/20 pt-1 flex justify-between gap-4 font-semibold">
            <span>Итого:</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

/* ---------- Payment timer ---------- */

function useCountdown(initial?: number) {
  const [sec, setSec] = useState(initial ?? 0);
  useEffect(() => {
    if (!initial) return;
    const t = setInterval(() => setSec((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [initial]);
  return sec;
}

function PaymentBar({ order }: { order: Order }) {
  const sec = useCountdown(order.awaitingSeconds);

  if (order.payment === "awaiting") {
    return (
      <div className="flex flex-wrap items-center gap-3 border-b border-border/70 bg-warning/5 px-5 py-3.5">
        <div className="flex items-center gap-2 text-destructive">
          <span className="font-semibold">Ожидаем оплаты {formatTimer(sec)}</span>
          <span>›</span>
        </div>
        <button className="ml-auto inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:opacity-90">
          <CreditCard className="h-4 w-4" />
          Оплатить {formatPrice(order.payAmount ?? 0)}
        </button>
      </div>
    );
  }

  if (order.payment === "paid") {
    return (
      <div className="flex flex-wrap items-center gap-3 border-t border-border/70 bg-success/5 px-5 py-3">
        <div className="flex items-center gap-2 text-success">
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-sm font-medium">Заказ оплачен</span>
        </div>
      </div>
    );
  }

  // surcharge
  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-border/70 bg-warning/10 px-5 py-3">
      <div className="flex items-center gap-2 text-warning">
        <Wallet className="h-4 w-4" />
        <span className="text-sm font-medium text-foreground">
          Нужна доплата:{" "}
          <span className="font-semibold text-warning">
            {formatPrice(order.payAmount ?? 0)}
          </span>
        </span>
        {order.paidAmount !== undefined && (
          <span className="text-xs text-muted-foreground">
            (оплачено {formatPrice(order.paidAmount)})
          </span>
        )}
      </div>
      <button className="ml-auto inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90">
        <CreditCard className="h-4 w-4" />
        Доплатить {formatPrice(order.payAmount ?? 0)}
      </button>
    </div>
  );
}

/* ---------- Order card ---------- */

function ItemRow({ item }: { item: OrderItem }) {
  return (
    <li className="flex items-center gap-4 px-5 py-3.5">
      <img
        src={item.image}
        alt={item.title}
        className="h-16 w-16 flex-none rounded-md object-cover"
        loading="lazy"
      />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-foreground">{item.title}</div>
        <div className="mt-0.5 space-x-2 text-xs text-muted-foreground">
          {item.size && <span>размер: {item.size}</span>}
          {item.color && <span>цвет: {item.color}</span>}
          {item.qty > 1 && <span>кол-во: {item.qty}</span>}
        </div>
      </div>
      <div className="text-right text-base font-semibold text-success">
        <PriceWithTooltip price={item.price} commission={item.commission} />
      </div>
    </li>
  );
}

function GroupBlock({ group }: { group: ItemGroup }) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 bg-muted/30 px-5 py-2.5">
        <StatusPipeline status={group.status} />
        <StatusLabel status={group.status} />
        <span className="ml-auto text-xs text-muted-foreground">
          {group.items.length}{" "}
          {group.items.length === 1 ? "товар" : "товара"}
        </span>
      </div>
      <ul className="divide-y divide-border/70">
        {group.items.map((item) => (
          <ItemRow key={item.id} item={item} />
        ))}
      </ul>
    </div>
  );
}

function OrderCard({ order, priority = false }: { order: Order; priority?: boolean }) {
  return (
    <article
      className={[
        "overflow-hidden rounded-xl border bg-card shadow-sm",
        priority ? "border-destructive/40 ring-1 ring-destructive/20" : "border-border",
      ].join(" ")}
    >
      {/* Awaiting payment lives on top */}
      {order.payment === "awaiting" && <PaymentBar order={order} />}

      {/* Header — like screenshots 1 & 2: title/brand first, then meta row */}
      <header className="border-b border-border/70 px-5 py-3.5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-foreground">{order.brand}</h3>
          <button className="rounded-md p-1.5 text-muted-foreground hover:bg-muted" aria-label="Действия">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5 text-primary" />
            <span className="text-foreground font-medium">{order.date}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            <span className="max-w-[280px] truncate">{order.pickup}</span>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span># {order.number}</span>
            <button className="rounded p-1 hover:bg-muted" aria-label="Скопировать номер">
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Groups: each status group has its own pipeline + items */}
      <div className="divide-y divide-border/70">
        {order.groups.map((g, i) => (
          <GroupBlock key={i} group={g} />
        ))}
      </div>

      {/* Payment footer for paid / surcharge */}
      {order.payment !== "awaiting" && <PaymentBar order={order} />}
    </article>
  );
}

/* ---------- Page ---------- */

function OrdersPage() {
  const sorted = [...ORDERS].sort((a, b) => {
    const order = { awaiting: 0, surcharge: 1, paid: 2 } as const;
    return order[a.payment] - order[b.payment];
  });

  return (
    <TooltipProvider delayDuration={150}>
      <div className="min-h-screen bg-background">
        <SiteHeader />

        <main className="mx-auto max-w-6xl px-4 py-6">
          {/* Breadcrumbs */}
          <nav className="mb-5 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary">Главная</Link>
            <span className="mx-1.5">/</span>
            <span className="text-foreground">Мои заказы</span>
          </nav>

          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Мои заказы
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Активные заказы — отслеживайте статус и путь каждой позиции
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              Всего активных:{" "}
              <span className="font-semibold text-foreground">{sorted.length}</span>
            </div>
          </div>

          {/* Legend */}
          <div className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg border border-border bg-card px-4 py-3 text-xs text-muted-foreground">
            {STEPS.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.key} className="flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Icon className="h-3 w-3" />
                  </span>
                  {s.label}
                </div>
              );
            })}
          </div>

          {/* List */}
          <div className="space-y-4">
            {sorted.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                priority={order.payment === "awaiting"}
              />
            ))}
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
