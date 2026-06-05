import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Package,
  Truck,
  Warehouse,
  Flag,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Settings,
  Copy,
  MapPin,
  MoreHorizontal,
} from "lucide-react";

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

type OrderStatus = "collecting" | "warehouse" | "in_transit" | "ready" | "done";

type OrderItem = {
  id: string;
  title: string;
  size?: string;
  color?: string;
  qty: number;
  price: number;
  image: string;
};

type Order = {
  id: string;
  number: string;
  brand: string;
  description?: string;
  status: OrderStatus;
  date: string;
  pickup: string;
  total: number;
  items: OrderItem[];
};

const STEPS: { key: OrderStatus; label: string; icon: typeof Package }[] = [
  { key: "collecting", label: "Собирается", icon: Package },
  { key: "warehouse", label: "На складе", icon: Warehouse },
  { key: "in_transit", label: "В пути", icon: Truck },
  { key: "ready", label: "В пункте выдачи", icon: Flag },
  { key: "done", label: "Получен", icon: CheckCircle2 },
];

const ORDERS: Order[] = [
  {
    id: "1",
    number: "337456914",
    brand: "ECCO — комфорт в каждом движении!",
    description: "Женская одежда из новой коллекции",
    status: "collecting",
    date: "12 мар",
    pickup: "Вольская, Макси ПВЗ на Удальцова",
    total: 5000,
    items: [
      {
        id: "m17",
        title: "M17 Майка женская на бретелях",
        size: "50",
        color: "в ассортименте",
        qty: 2,
        price: 3000,
        image:
          "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=400&fit=crop",
      },
      {
        id: "m145",
        title: "M145 Майка женская",
        qty: 1,
        price: 2000,
        image:
          "https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?w=400&h=400&fit=crop",
      },
    ],
  },
  {
    id: "2",
    number: "337456915",
    brand: "Tom Klaim. Женская одежда",
    status: "warehouse",
    date: "26 июн",
    pickup: "Вольская, Макси ПВЗ на Удальцова",
    total: 10818,
    items: [
      {
        id: "j4887",
        title: "Жакет укороченный вечерний Лоренза 4887",
        size: "42",
        color: "жёлтый",
        qty: 1,
        price: 10798,
        image:
          "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop",
      },
    ],
  },
  {
    id: "3",
    number: "337456916",
    brand: "Happywear — гипермаркет одежды",
    status: "in_transit",
    date: "9 июл",
    pickup: "Стройкерамика, Макси ПВЗ",
    total: 1053,
    items: [
      {
        id: "hf1",
        title: "Женское пляжное платье Happyfox",
        size: "42-44",
        color: "нежно-розовый",
        qty: 1,
        price: 1033,
        image:
          "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=400&fit=crop",
      },
    ],
  },
  {
    id: "4",
    number: "337456917",
    brand: "Eliseeva Olesya. Новинки",
    status: "ready",
    date: "5 июн",
    pickup: "Вольская, Макси ПВЗ на Удальцова",
    total: 8749,
    items: [
      {
        id: "72478",
        title: "72478 Жакет",
        size: "46",
        qty: 1,
        price: 8729,
        image:
          "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=400&fit=crop",
      },
    ],
  },
  {
    id: "5",
    number: "337456918",
    brand: "Berrak — турецкий шопинг",
    status: "done",
    date: "23 июн",
    pickup: "Стройкерамика, Макси ПВЗ",
    total: 126,
    items: [
      {
        id: "b6909",
        title: "Трусы для девочки Berrak 6909",
        size: "7 размер 10-11 лет (ассорти)",
        qty: 1,
        price: 104,
        image:
          "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=400&h=400&fit=crop",
      },
    ],
  },
];

const TABS = [
  { key: "all", label: "Все" },
  { key: "active", label: "Активные" },
  { key: "ready", label: "К получению" },
  { key: "done", label: "Завершённые" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function formatPrice(n: number) {
  return new Intl.NumberFormat("ru-RU").format(n) + " ₽";
}

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

function StatusLabel({ status }: { status: OrderStatus }) {
  const step = STEPS.find((s) => s.key === status)!;
  const color =
    status === "done"
      ? "text-success"
      : status === "ready"
      ? "text-warning"
      : "text-primary";
  return (
    <span>
      товар <span className={`font-medium ${color}`}>{step.label.toLowerCase()}</span>
    </span>
  );
}

function OrderCard({ order }: { order: Order }) {
  const [open, setOpen] = useState(order.status === "collecting");
  return (
    <article className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* Header */}
      <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border/70 px-5 py-3.5">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <Truck className="h-4 w-4" />
          <span>{order.date}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span className="max-w-[260px] truncate">{order.pickup}</span>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-sm text-muted-foreground">
          <span># {order.number}</span>
          <button
            className="rounded p-1 hover:bg-muted"
            aria-label="Скопировать номер"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      {/* Status row */}
      <div className="flex flex-wrap items-center gap-4 px-5 py-3">
        <StatusPipeline status={order.status} />
        <div className="text-sm text-foreground">
          <StatusLabel status={order.status} />
        </div>
        <button className="ml-auto rounded-md p-1.5 text-muted-foreground hover:bg-muted">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Brand */}
      <div className="px-5 pb-2 text-sm font-medium text-foreground">
        {order.brand}
      </div>

      {/* Items */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-2 text-sm text-muted-foreground hover:bg-muted/40"
      >
        <span>
          {order.items.length} {order.items.length === 1 ? "товар" : "товара"} в заказе
        </span>
        {open ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>

      {open && (
        <ul className="divide-y divide-border/70 border-t border-border/70">
          {order.items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-4 px-5 py-3.5"
            >
              <img
                src={item.image}
                alt={item.title}
                className="h-16 w-16 flex-none rounded-md object-cover"
                loading="lazy"
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-foreground">
                  {item.title}
                </div>
                <div className="mt-0.5 space-y-0.5 text-xs text-muted-foreground">
                  {item.size && <div>размер: {item.size}</div>}
                  {item.color && <div>цвет: {item.color}</div>}
                  {item.qty > 1 && <div>кол-во: {item.qty}</div>}
                </div>
              </div>
              <div className="text-right">
                <div className="text-base font-semibold text-success">
                  {formatPrice(item.price)}
                </div>
              </div>
              <button className="rounded p-1.5 text-muted-foreground hover:bg-muted">
                <Settings className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Footer */}
      <footer className="flex items-center justify-between border-t border-border/70 bg-muted/30 px-5 py-3">
        <span className="text-sm text-muted-foreground">
          Итого по заказу: {order.items.length}{" "}
          {order.items.length === 1 ? "позиция" : "позиции"}
        </span>
        <span className="text-sm text-muted-foreground">
          К оплате:{" "}
          <span className="text-base font-semibold text-success">
            {formatPrice(order.total)}
          </span>
        </span>
      </footer>
    </article>
  );
}

function OrdersPage() {
  const [tab, setTab] = useState<TabKey>("all");

  const filtered = ORDERS.filter((o) => {
    if (tab === "all") return true;
    if (tab === "ready") return o.status === "ready";
    if (tab === "done") return o.status === "done";
    return o.status !== "done";
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-sm font-bold text-primary-foreground"
          >
            <span className="rounded bg-primary-foreground/15 px-1.5 py-0.5">63</span>
            pokupki
          </Link>
          <nav className="ml-6 hidden gap-5 text-sm text-muted-foreground md:flex">
            <Link to="/" className="hover:text-foreground">Лента</Link>
            <span className="font-medium text-foreground">Заказы</span>
            <span className="hover:text-foreground">Корзина</span>
          </nav>
        </div>
      </header>

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
              Отслеживайте статус и путь каждого заказа в реальном времени
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            Всего заказов:{" "}
            <span className="font-semibold text-foreground">{ORDERS.length}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-5 flex flex-wrap gap-2 border-b border-border">
          {TABS.map((t) => {
            const active = tab === t.key;
            const count =
              t.key === "all"
                ? ORDERS.length
                : t.key === "ready"
                ? ORDERS.filter((o) => o.status === "ready").length
                : t.key === "done"
                ? ORDERS.filter((o) => o.status === "done").length
                : ORDERS.filter((o) => o.status !== "done").length;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={[
                  "relative -mb-px flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "border-primary font-medium text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                {t.label}
                <span
                  className={[
                    "rounded-full px-2 py-0.5 text-xs",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  ].join(" ")}
                >
                  {count}
                </span>
              </button>
            );
          })}
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
          {filtered.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
          {filtered.length === 0 && (
            <div className="rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
              В этой категории пока нет заказов
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
