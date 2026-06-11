import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
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
  Share2,
  MessageSquare,
  X,
  Receipt,
  QrCode,
  ChevronRight,
  ChevronsRight,
  ArrowUpRight,
  Undo2,
} from "lucide-react";
import contractIcon from "@/assets/contract-receipt.png.asset.json";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";


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
  cdek?: boolean; // pickup point is СДЭК
  deliveryFee?: number; // СДЭК delivery cost included in total
  trackNumber?: string; // СДЭК track number
  payment: PaymentState;
  payAmount?: number; // for awaiting / surcharge
  paidAmount?: number; // already paid for surcharge
  awaitingSeconds?: number; // for awaiting
  groups: ItemGroup[];
  completedAt?: string; // дата выдачи (для завершённых)
};

const STEPS: { key: OrderStatus; label: string; icon: typeof Package }[] = [
  { key: "ordered_unpaid", label: "Оформлен", icon: ClipboardList },
  { key: "paid", label: "Оплачен", icon: CheckCircle2 },
  { key: "collecting", label: "В сборке", icon: Package },
  { key: "from_supplier", label: "В пути от поставщика", icon: Warehouse },
  { key: "delivering", label: "Доставляется в пункт выдачи", icon: Truck },
  { key: "ready", label: "Готов к выдаче", icon: Flag },
  { key: "received", label: "Получено", icon: CheckCircle2 },
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
    pickup: "Димитровград, ул. Гагарина, 3А",
    cdek: true,
    deliveryFee: 349,
    trackNumber: "1421739581",
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
          {
            id: "m18",
            title: "M18 Топ женский базовый",
            size: "48",
            color: "белый",
            qty: 1,
            price: 1490,
            commission: 220,
            image: img("photo-1503342217505-b0a15ec3261c"),
          },
          {
            id: "m19",
            title: "M19 Футболка хлопок",
            size: "50",
            color: "чёрный",
            qty: 1,
            price: 1290,
            commission: 190,
            image: img("photo-1521572163474-6864f9cf17ab"),
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
          {
            id: "m146",
            title: "M146 Топ-резинка",
            size: "S",
            qty: 1,
            price: 990,
            commission: 150,
            image: img("photo-1564257577-2d3ee8740c3f"),
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
    id: "oos",
    number: "337456950",
    brand: "TechGear — электроника и аксессуары",
    date: "1 июля 2025",
    pickup: "Самара, Московское шоссе, 220",
    payment: "paid",
    groups: [
      {
        status: "out_of_stock",
        items: [
          {
            id: "tg1",
            title: "Беспроводные наушники с активным шумоподавлением",
            qty: 1,
            price: 4990,
            commission: 750,
            image: img("photo-1505740420928-5e560c06d30e"),
          },
          {
            id: "tg2",
            title: "Защитный чехол премиум для смартфона",
            qty: 2,
            price: 890,
            commission: 130,
            image: img("photo-1586105251261-72a756497a11"),
          },
          {
            id: "tg3",
            title: "Портативное зарядное устройство 20000 мАч",
            qty: 1,
            price: 2490,
            commission: 370,
            image: img("photo-1609592424332-5bd4996db89c"),
          },
        ],
      },
    ],
  },
  {
    id: "5",
    number: "337456920",
    brand: "Bash — спорт и стрит",
    date: "18 июня 2025",
    pickup: "Самара, ул. Ново-Садовая, 160",
    payment: "paid",
    groups: [
      {
        status: "ordered_unpaid",
        items: [
          {
            id: "bs1",
            title: "Худи оверсайз с принтом",
            size: "M",
            color: "графит",
            qty: 1,
            price: 2890,
            commission: 420,
            image: img("photo-1556821840-3a63f95609a7"),
          },
          {
            id: "bs2",
            title: "Шорты спортивные хлопок",
            size: "L",
            qty: 1,
            price: 1490,
            commission: 220,
            image: img("photo-1542327897-d73f4005b533"),
          },
        ],
      },
      {
        status: "paid",
        items: [
          {
            id: "bs3",
            title: "Кроссовки беговые лёгкие",
            size: "42",
            color: "белый",
            qty: 1,
            price: 4990,
            commission: 720,
            image: img("photo-1542291026-7eec264c27ff"),
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
    pickup: "Самара, Московское шоссе, 220",
    cdek: true,
    deliveryFee: 299,
    trackNumber: "1438902117",
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
  {
    id: "6",
    number: "337456925",
    brand: "Sunny Market — товары для дома",
    date: "22 июня 2025",
    pickup: "Самара, Московское шоссе, 220",
    payment: "paid",
    groups: [
      {
        status: "collecting",
        items: [
          {
            id: "sm1",
            title: "Полотенце махровое 70×140",
            color: "молочный",
            qty: 2,
            price: 590,
            commission: 90,
            image: img("photo-1583845112203-29329902332e"),
          },
          {
            id: "sm2",
            title: "Свеча ароматическая ваниль",
            qty: 1,
            price: 320,
            commission: 50,
            image: img("photo-1602874801007-bd36c376cd65"),
          },
          {
            id: "sm3",
            title: "Кружка керамическая 350 мл",
            color: "беж",
            qty: 4,
            price: 280,
            commission: 45,
            image: img("photo-1514228742587-6b1558fcca3d"),
          },
          {
            id: "sm4",
            title: "Плед флисовый 150×200",
            color: "графит",
            qty: 1,
            price: 1290,
            commission: 195,
            image: img("photo-1540574163026-643ea20ade25"),
          },
          {
            id: "sm5",
            title: "Подушка декоративная вязаная",
            qty: 2,
            price: 690,
            commission: 105,
            image: img("photo-1592078615290-033ee584e267"),
          },
          {
            id: "sm6",
            title: "Корзина для хранения плетёная",
            size: "M",
            qty: 1,
            price: 850,
            commission: 130,
            image: img("photo-1503602642458-232111445657"),
          },
          {
            id: "sm7",
            title: "Подсвечник стеклянный",
            qty: 3,
            price: 240,
            commission: 40,
            image: img("photo-1602872030219-ad2b9a54315c"),
          },
        ],
      },
    ],
  },
  {
    id: "7",
    number: "337456960",
    brand: "Beauty Box — косметика и уход",
    date: "11 июля 2025",
    pickup: "Самара, Московское шоссе, 220",
    payment: "paid",
    groups: [
      {
        status: "ready",
        items: [
          {
            id: "bb1",
            title: "Сыворотка для лица с витамином C",
            size: "30 мл",
            qty: 1,
            price: 1290,
            commission: 195,
            image: img("photo-1556228720-195a672e8a03"),
          },
          {
            id: "bb2",
            title: "Крем для рук восстанавливающий",
            size: "75 мл",
            qty: 2,
            price: 540,
            commission: 80,
            image: img("photo-1556228578-8c89e6adf883"),
          },
        ],
      },
      {
        status: "out_of_stock",
        items: [
          {
            id: "bb3",
            title: "Маска для волос питательная",
            size: "200 мл",
            qty: 1,
            price: 890,
            commission: 135,
            image: img("photo-1571781926291-c477ebfd024b"),
          },
          {
            id: "bb4",
            title: "Бальзам для губ с маслом ши",
            color: "натуральный",
            qty: 2,
            price: 290,
            commission: 45,
            image: img("photo-1599733589046-833caccbbd03"),
          },
        ],
      },
    ],
  },
];

const COMPLETED_ORDERS: Order[] = [
  {
    id: "c1",
    number: "337456800",
    brand: "Sweet Bakery — печенье и сладости",
    date: "10 мая 2025",
    completedAt: "18 мая 2025",
    pickup: "Вольская, Макси ПВЗ на Удальцова",
    payment: "paid",
    groups: [
      {
        status: "received",
        items: [
          {
            id: "k51",
            title: "Печенье Неиспытый вкус с начинкой Пина Колада фас фл/п 0,250кг",
            qty: 1,
            price: 143,
            commission: 30,
            image: img("photo-1558961363-fa8fdf82db35"),
          },
          {
            id: "tm43",
            title: "Печенье Мальта с кокосом ТВ 0,890кг",
            qty: 1,
            price: 311,
            commission: 65,
            image: img("photo-1499636136210-6f4ee915583e"),
          },
          {
            id: "tm5",
            title: "Печенье овсяное Царская коллекция тем/дек ТВ 0,720кг",
            qty: 1,
            price: 212,
            commission: 44,
            image: img("photo-1568051243851-f9b136146e97"),
          },
        ],
      },
    ],
  },
  {
    id: "c2",
    number: "337456755",
    brand: "ECCO — комфорт в каждом движении!",
    date: "2 апреля 2025",
    completedAt: "12 апреля 2025",
    pickup: "Димитровград, ул. Гагарина, 3А",
    cdek: true,
    deliveryFee: 349,
    trackNumber: "1421739100",
    payment: "paid",
    groups: [
      {
        status: "received",
        items: [
          {
            id: "ec1",
            title: "Кроссовки кожаные классические",
            size: "42",
            color: "белый",
            qty: 1,
            price: 6990,
            commission: 1040,
            image: img("photo-1542291026-7eec264c27ff"),
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
  if (currentIndex === -1) {
    const Icon =
      status === "out_of_stock"
        ? AlertCircle
        : status === "delayed"
        ? AlertTriangle
        : status === "awaiting_payment"
        ? Clock
        : Package;
    return (
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full border border-destructive bg-destructive/10 text-destructive">
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-0">
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
                  "h-0.5 w-1.5",
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
  ordered_unpaid: { label: "Оформлен", color: "text-muted-foreground" },
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
    <span className={`text-base font-medium ${meta.color}`}>
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

function orderTotal(order: Order) {
  let sum = 0;
  for (const g of order.groups) {
    for (const it of g.items) {
      sum += (it.price + it.commission) * it.qty;
    }
  }
  return sum + (order.deliveryFee ?? 0);
}

function orderSubtotals(order: Order) {
  let price = 0;
  let commission = 0;
  for (const g of order.groups) {
    for (const it of g.items) {
      price += it.price * it.qty;
      commission += it.commission * it.qty;
    }
  }
  return { price, commission, delivery: order.deliveryFee ?? 0 };
}

function TotalWithTooltip({
  order,
  className = "",
}: {
  order: Order;
  className?: string;
}) {
  const { price, commission, delivery } = orderSubtotals(order);
  const total = price + commission + delivery;
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
        <div className="space-y-0.5 text-xs min-w-[180px]">
          <div className="flex justify-between gap-4">
            <span className="opacity-80">Цена товаров:</span>
            <span>{formatPrice(price)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="opacity-80">Комиссия:</span>
            <span>{formatPrice(commission)}</span>
          </div>
          {delivery > 0 && (
            <div className="flex justify-between gap-4">
              <span className="opacity-80">Доставка СДЭК:</span>
              <span>{formatPrice(delivery)}</span>
            </div>
          )}
          <div className="mt-1 border-t border-background/20 pt-1 flex justify-between gap-4 font-semibold">
            <span>Итого:</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

function PaymentBar({ order }: { order: Order }) {
  const sec = useCountdown(order.awaitingSeconds);

  if (order.payment === "awaiting") {
    return (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b-2 border-destructive bg-destructive/10 px-5 py-3.5">
        <div className="flex items-center gap-2 text-destructive">
          <Clock className="h-4 w-4" />
          <span className="font-semibold">Ожидаем оплаты {formatTimer(sec)}</span>
        </div>
        <div className="ml-auto flex flex-1 sm:flex-none flex-wrap items-center justify-center sm:justify-end gap-x-3 gap-y-2">
          <span className="text-sm text-muted-foreground">
            Итого по заказу:{" "}
            <TotalWithTooltip order={order} className="text-base font-bold text-destructive" />
          </span>
          <button className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-95 active:opacity-90">
            <CreditCard className="h-4 w-4" />
            Оплатить {formatPrice(order.payAmount ?? 0)}
          </button>
        </div>
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
        <div className="ml-auto text-sm text-muted-foreground">
          Итого по заказу:{" "}
          <TotalWithTooltip order={order} className="text-base font-semibold text-foreground" />
        </div>
      </div>
    );
  }

  // surcharge
  const total = orderTotal(order);
  return (
    <>
      {/* Mobile layout per design ref */}
      <div className="sm:hidden flex items-center gap-3 border-t border-border/70 bg-warning/10 px-4 py-2.5">
        <div className="flex flex-col text-sm leading-tight">
          <span className="text-muted-foreground">
            Осталось доплатить:{" "}
            <span className="font-bold text-warning">{formatPrice(order.payAmount ?? 0)}</span>
          </span>
          <span className="mt-0.5 text-xs text-muted-foreground">
            Итого заказа: {formatPrice(total)}
          </span>
        </div>
        <button className="ml-auto inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-95">
          <CreditCard className="h-4 w-4" />
          Доплатить
        </button>
      </div>
      {/* Desktop / tablet */}
      <div className="hidden sm:flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-border/70 bg-warning/10 px-5 py-2">
        <div className="flex items-center gap-2 text-warning">
          <Wallet className="h-4 w-4" />
          <span className="text-sm font-medium text-foreground">
            Нужна доплата:{" "}
            <span className="font-semibold text-warning">
              {formatPrice(order.payAmount ?? 0)}
            </span>
          </span>
        </div>
        <div className="ml-auto flex flex-wrap items-center justify-end gap-x-3 gap-y-2">
          <span className="text-sm text-muted-foreground">
            Итого по заказу:{" "}
            <TotalWithTooltip order={order} className="text-base font-bold text-foreground" />
          </span>
          <button className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-95 active:opacity-90">
            <CreditCard className="h-4 w-4" />
            Доплатить {formatPrice(order.payAmount ?? 0)}
          </button>
        </div>
      </div>
    </>
  );
}


/* ---------- Order card ---------- */

function ItemTile({
  item,
  removable = false,
  accentPrice = false,
  selectable = false,
  selected = false,
  onToggle,
}: {
  item: OrderItem;
  removable?: boolean;
  accentPrice?: boolean;
  selectable?: boolean;
  selected?: boolean;
  onToggle?: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="w-[140px] flex-none">
      <div
        className={[
          "relative overflow-hidden rounded-lg border bg-card transition",
          selectable && selected ? "border-primary ring-2 ring-primary/40" : "border-border",
        ].join(" ")}
      >
        <img
          src={item.image}
          alt={item.title}
          className="h-[140px] w-full object-cover"
          loading="lazy"
        />
        {item.size && (
          <span className="absolute left-1.5 top-1.5 rounded-full bg-background/90 px-2 py-0.5 text-[11px] font-semibold text-foreground shadow-sm backdrop-blur">
            {item.size}
          </span>
        )}
        {item.qty > 1 && (
          <span className="absolute right-1.5 top-1.5 rounded-full bg-foreground/85 px-2 py-0.5 text-[11px] font-semibold text-background">
            ×{item.qty}
          </span>
        )}
        {removable && (
          <button
            type="button"
            aria-label="Удалить товар из заказа"
            className="absolute right-1 bottom-1 flex h-5 w-5 items-center justify-center rounded-full text-destructive/70 transition hover:text-destructive hover:bg-background/80"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2.5} />
          </button>
        )}
        {selectable && (
          <button
            type="button"
            onClick={onToggle}
            aria-label={selected ? "Отменить выбор" : "Выбрать товар"}
            aria-pressed={selected}
            className="absolute inset-0 flex items-end justify-end p-1.5"
          >
            <span
              className={[
                "flex h-6 w-6 items-center justify-center rounded-md border-2 bg-background/95 shadow-sm transition",
                selected ? "border-primary bg-primary text-primary-foreground" : "border-border text-transparent",
              ].join(" ")}
            >
              <CheckCircle2 className="h-4 w-4" strokeWidth={3} />
            </span>
          </button>
        )}
      </div>
      <div
        className="mt-2 hidden sm:line-clamp-2 text-sm font-medium leading-snug text-foreground"
        title={item.title}
      >
        {item.title}
      </div>
      <div className="mt-2 flex items-center justify-between gap-1">
        <div
          className={`text-[15px] sm:text-base font-semibold ${accentPrice ? "text-destructive" : "text-success"}`}
        >
          <PriceWithTooltip price={item.price} commission={item.commission} />
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label={open ? "Скрыть подробности" : "Подробнее о товаре"}
          aria-expanded={open}
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform ${open ? "rotate-180" : "-rotate-90"}`}
          />
        </button>
      </div>
      {open && (
        <div className="mt-2 rounded-md bg-muted/50 px-2.5 py-2 text-xs">
          <div className="text-xs font-medium leading-snug text-foreground sm:hidden">{item.title}</div>
          <div className="mt-1 space-y-0.5 text-muted-foreground">
            {item.size && <div>размер: {item.size}</div>}
            {item.color && <div>цвет: {item.color}</div>}
            <div>кол-во: {item.qty}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function OutOfStockNotice({ group }: { group: ItemGroup }) {
  const sum = group.items.reduce((s, it) => s + (it.price + it.commission) * it.qty, 0);
  return (
    <div className="mb-3 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-foreground">
      <div className="font-medium">Нам очень жаль, что товар закончился.</div>
      <div className="mt-1 text-muted-foreground">
        Мы вернём{" "}
        <span className="font-semibold text-destructive">{formatPrice(sum)}</span> на ваш{" "}
        <a className="text-primary underline-offset-2 hover:underline" href="#">
          Лицевой счёт
        </a>
        .
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        Деньги с Лицевого счёта можно использовать либо для быстрой оплаты другого товара на нашем сайте, или вернуть себе на карту.
      </div>
    </div>
  );
}

function GroupBlock({
  group,
  hidePipeline = false,
  hideStatusLabel = false,
  accentPrice = false,
  selectable = false,
  selectedIds,
  onToggleItem,
}: {
  group: ItemGroup;
  hidePipeline?: boolean;
  hideStatusLabel?: boolean;
  accentPrice?: boolean;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onToggleItem?: (id: string) => void;
}) {
  const removable = group.status === "ordered_unpaid" || group.status === "paid";
  const showHeader = !hidePipeline || !hideStatusLabel;
  const COLLAPSE_THRESHOLD = 7;
  const [expanded, setExpanded] = useState(false);
  const canCollapse = group.items.length >= COLLAPSE_THRESHOLD && !selectable;
  const visibleItems = canCollapse && !expanded ? group.items.slice(0, 5) : group.items;
  const hiddenCount = group.items.length - visibleItems.length;
  const scrollerRef = useRef<HTMLDivElement>(null);
  const mobileSlider = group.items.length > 2 && !selectable;
  const scrollNext = () => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: el.clientWidth * 0.8, behavior: "smooth" });
  };

  const collapseTile = canCollapse && !expanded && hiddenCount > 0 && (
    <button
      type="button"
      onClick={() => setExpanded(true)}
      className="group w-[140px] flex-none"
      aria-label={`Показать ещё ${hiddenCount} ${hiddenCount === 1 ? "товар" : hiddenCount < 5 ? "товара" : "товаров"}`}
    >
      <div className="relative h-[140px] w-full overflow-hidden rounded-lg border border-dashed border-primary/40 bg-primary/5 transition group-hover:bg-primary/10">
        <div className="absolute inset-0 grid grid-cols-2 gap-0.5 p-0.5 opacity-50">
          {group.items.slice(5, 9).map((it) => (
            <img
              key={it.id}
              src={it.image}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ))}
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-primary/40 text-primary-foreground">
          <span className="text-2xl font-bold">+{hiddenCount}</span>
          <span className="mt-0.5 text-xs font-medium">
            {hiddenCount === 1 ? "товар" : hiddenCount < 5 ? "товара" : "товаров"}
          </span>
        </div>
      </div>
      <div className="mt-2 text-xs font-medium text-primary">Показать все</div>
    </button>
  );

  return (
    <div className="px-5 py-4">
      {showHeader && (
        <div className="mb-3 flex flex-wrap items-center gap-3">
          {!hidePipeline && <StatusPipeline status={group.status} />}
          {!hideStatusLabel && <StatusLabel status={group.status} />}
          <span className="ml-auto text-xs text-muted-foreground">
            {group.items.length}{" "}
            {group.items.length === 1 ? "товар" : group.items.length < 5 ? "товара" : "товаров"}
          </span>
        </div>
      )}
      {group.status === "out_of_stock" && <OutOfStockNotice group={group} />}
      {group.status === "ready" && (
        <div className="mb-3 flex items-center gap-3 rounded-lg border border-warning/40 bg-warning/5 px-3 py-2.5">
          <div className="flex h-16 w-16 flex-none items-center justify-center rounded-md border border-border bg-card">
            <QrCode className="h-12 w-12 text-foreground" />
          </div>
          <div>
            <div className="text-sm font-medium text-foreground">QR-код для получения</div>
            <div className="mt-1 text-base font-semibold text-warning">
              Срок хранения: до 12 июля 2025
            </div>
          </div>
        </div>
      )}

      {/* Mobile: slider when more than 2 items */}
      {mobileSlider && (
        <div className="relative sm:hidden">
          <div
            ref={scrollerRef}
            className="flex items-start gap-3 overflow-x-auto pb-2 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory scroll-pl-1"
          >
            {group.items.map((item) => (
              <div key={item.id} className="snap-start flex-none">
                <ItemTile
                  item={item}
                  removable={removable && !selectable}
                  accentPrice={accentPrice}
                  selectable={selectable}
                  selected={selectedIds?.has(item.id)}
                  onToggle={() => onToggleItem?.(item.id)}
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={scrollNext}
            aria-label="Показать ещё товары"
            className="pointer-events-auto absolute right-1 top-[60px] -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-lg border border-primary/50 bg-background/95 text-primary shadow-sm backdrop-blur hover:bg-primary/10"
          >
            <ChevronsRight className="h-5 w-5" strokeWidth={2.25} />
          </button>
        </div>
      )}

      {/* Desktop wrap (and mobile when ≤2 items) */}
      <div className={`${mobileSlider ? "hidden sm:flex" : "flex"} flex-wrap items-start gap-4`}>
        {visibleItems.map((item) => (
          <ItemTile
            key={item.id}
            item={item}
            removable={removable && !selectable}
            accentPrice={accentPrice}
            selectable={selectable}
            selected={selectedIds?.has(item.id)}
            onToggle={() => onToggleItem?.(item.id)}
          />
        ))}
        {collapseTile}
        {canCollapse && expanded && (
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="w-[140px] flex-none self-center text-xs font-medium text-primary hover:underline"
          >
            Свернуть
          </button>
        )}
      </div>

    </div>
  );
}



const PICKUP_OPTIONS = [
  "Вольская, Макси ПВЗ на Удальцова",
  "Стройкерамика, Макси ПВЗ",
  "Московское ш., 220 — Пункт выдачи",
  "Ново-Садовая, 160 — Пункт выдачи",
];

function PickupSelector({ value }: { value: string }) {
  const [pickup, setPickup] = useState(value);
  const options = PICKUP_OPTIONS.includes(pickup) ? PICKUP_OPTIONS : [pickup, ...PICKUP_OPTIONS];
  return (
    <div className="relative inline-flex items-center gap-1 rounded-md border border-dashed border-primary/40 bg-primary/5 px-2 py-0.5 text-primary hover:bg-primary/10">
      <MapPin className="h-3.5 w-3.5" />
      <span className="max-w-[260px] truncate">{pickup}</span>
      <ChevronDown className="h-3.5 w-3.5 opacity-70" />
      <select
        value={pickup}
        onChange={(e) => setPickup(e.target.value)}
        aria-label="Выбрать пункт выдачи"
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {options.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
    </div>
  );
}

function HeaderActions() {
  const Icons = (
    <>
      <button className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-primary" aria-label="Скачать договор">
        <img src={contractIcon.url} alt="" className="h-4 w-4 object-contain" />
      </button>
      <button className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-primary" aria-label="В избранное">
        <Heart className="h-4 w-4" />
      </button>
      <button className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-primary" aria-label="Поделиться">
        <Share2 className="h-4 w-4" />
      </button>
      <button className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-primary" aria-label="Вопрос поставщику">
        <MessageSquare className="h-4 w-4" />
      </button>
    </>
  );
  return (
    <div className="flex items-center">
      {/* Desktop: inline icons */}
      <div className="hidden sm:flex items-center gap-0.5">{Icons}</div>
      {/* Mobile: three-dots opens popover */}
      <div className="sm:hidden">
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
              aria-label="Действия"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-56 p-2">
            <button className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted">
              <Heart className="h-4 w-4 text-muted-foreground" />
              Добавить поставщика в избранное
            </button>
            <button className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted">
              <Share2 className="h-4 w-4 text-muted-foreground" />
              Поделиться
            </button>
            <button className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              Вопрос поставщику
            </button>
            <button className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted">
              <img src={contractIcon.url} alt="" className="h-4 w-4 object-contain" />
              Скачать договор
            </button>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

function OrderCard({ order, priority = false }: { order: Order; priority?: boolean }) {
  const isAwaiting = order.payment === "awaiting";
  const isSurcharge = order.payment === "surcharge";
  const isFullyOutOfStock = order.groups.every((g) => g.status === "out_of_stock");
  const hasReady = order.groups.some((g) => g.status === "ready");
  const pickupEditable = order.groups.some(
    (g) => g.status === "paid" || g.status === "collecting",
  );

  return (
    <article
      className={[
        "overflow-hidden rounded-xl border bg-card shadow-sm",
        isFullyOutOfStock ? "border-destructive ring-2 ring-destructive/40"
          : isAwaiting ? "border-destructive/60 ring-2 ring-destructive/30"
          : isSurcharge ? "border-warning/60 ring-2 ring-warning/30 sm:border-border sm:ring-0"
          : "border-border",
      ].join(" ")}
    >
      {/* Awaiting payment lives on top */}
      {isAwaiting && <PaymentBar order={order} />}

      {/* Header (hidden entirely for awaiting block) */}
      {!isAwaiting && (
        <header className="border-b border-border/70">
          {/* Mobile-only top bar with order number */}
          <div className="flex sm:hidden items-center justify-between gap-2 border-b border-border/60 bg-muted/40 px-5 py-1.5 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">№ {order.number}</span>
            <button className="rounded p-1 hover:bg-muted" aria-label="Скопировать номер">
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="px-5 py-3.5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-semibold text-foreground">{order.brand}</h3>
            <HeaderActions />
          </div>
          {!isFullyOutOfStock && (
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
            {!hasReady && (
              <div className="flex items-center gap-1.5">
                <Truck className="h-5 w-5 text-primary" />
                <span className="text-foreground text-base font-semibold">{order.date}</span>
              </div>
            )}
            {order.cdek ? (
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center rounded-sm bg-success px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-success-foreground">
                  CDEK
                </span>
                <span className="text-foreground font-medium">{order.pickup}</span>
              </div>
            ) : pickupEditable ? (
              <PickupSelector value={order.pickup} />
            ) : (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                <span className="max-w-[280px] truncate">{order.pickup}</span>
              </div>
            )}
            <div className="ml-auto hidden sm:flex items-center gap-1.5 text-base">
              <span># {order.number}</span>
              <button className="rounded p-1 hover:bg-muted" aria-label="Скопировать номер">
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          )}
          {isFullyOutOfStock && (
            <div className="mt-2 hidden sm:flex items-center justify-end gap-1.5 text-base text-muted-foreground">
              <span># {order.number}</span>
              <button className="rounded p-1 hover:bg-muted" aria-label="Скопировать номер">
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          {order.cdek && order.trackNumber && !isFullyOutOfStock && (
            <div className="mt-2.5 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground">Трек-номер:</span>
              <span className="rounded-md bg-info/15 px-2.5 py-1 font-mono text-base font-bold tracking-wide text-info">
                {order.trackNumber}
              </span>
              <button
                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Скопировать трек-номер"
                onClick={() => navigator.clipboard?.writeText(order.trackNumber!)}
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
              <a
                href={`https://www.cdek.ru/ru/tracking?order_id=${order.trackNumber}`}
                target="_blank"
                rel="noreferrer"
                aria-label="Отследить отправление СДЭК"
                className="text-sm font-medium text-success hover:underline"
              >
                <span className="hidden sm:inline">Отследить</span>
                <span className="sm:hidden inline-flex h-7 w-7 items-center justify-center rounded-full bg-success/10 text-success">
                  <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
                </span>
              </a>
            </div>
          )}
          </div>
        </header>
      )}

      {/* Refund status banner removed per design update */}

      {/* Groups: each status group has its own pipeline + items */}
      <div className="divide-y divide-border/70">
        {order.groups.map((g, i) => (
          <GroupBlock
            key={i}
            group={g}
            hidePipeline={isAwaiting || isFullyOutOfStock}
            hideStatusLabel={isAwaiting || isFullyOutOfStock}
            accentPrice={isAwaiting}
          />
        ))}
      </div>

      {/* Payment footer for paid / surcharge (hidden when fully OOS) */}
      {!isAwaiting && !isFullyOutOfStock && <PaymentBar order={order} />}
    </article>
  );
}


function CompletedOrderCard({ order }: { order: Order }) {
  const [returnMode, setReturnMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const cancel = () => {
    setReturnMode(false);
    setSelected(new Set());
  };

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* Mobile-only top bar with order number */}
      <div className="flex sm:hidden items-center justify-between gap-2 border-b border-border/60 bg-muted/40 px-5 py-1.5 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">№ {order.number}</span>
        <button className="rounded p-1 hover:bg-muted" aria-label="Скопировать номер">
          <Copy className="h-3.5 w-3.5" />
        </button>
      </div>
      <header className="border-b border-border/70 px-5 py-3.5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-foreground">{order.brand}</h3>
          <HeaderActions />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-success" />
            <span className="text-success font-medium">Получено {order.completedAt}</span>
          </div>
          {order.cdek ? (
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center rounded-sm bg-success px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-success-foreground">
                CDEK
              </span>
              <span className="text-foreground font-medium">{order.pickup}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              <span className="max-w-[280px] truncate">{order.pickup}</span>
            </div>
          )}
          <div className="ml-auto hidden sm:flex items-center gap-1.5 text-base">
            <span># {order.number}</span>
          </div>
        </div>
      </header>

      <div className="divide-y divide-border/70">
        {order.groups.map((g, i) => (
          <GroupBlock
            key={i}
            group={g}
            hidePipeline
            hideStatusLabel
            selectable={returnMode}
            selectedIds={selected}
            onToggleItem={toggle}
          />
        ))}
      </div>

      <div className="flex items-center gap-3 border-t border-border/70 bg-muted/30 px-5 py-3">
        {!returnMode && (
          <>
            <button
              type="button"
              onClick={() => setReturnMode(true)}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Оформить заявку на возврат
            </button>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => setReturnMode(true)}
                  aria-label="Оформить заявку на возврат"
                  className="sm:hidden inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Undo2 className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-foreground text-background">
                Оформить заявку на возврат
              </TooltipContent>
            </Tooltip>
          </>
        )}
        <div className="ml-auto text-sm text-muted-foreground">
          Итого по заказу:{" "}
          <TotalWithTooltip order={order} className="text-base font-semibold text-foreground" />
        </div>
      </div>


      {returnMode && (
        <div className="flex flex-wrap items-center gap-3 border-t border-border/70 bg-primary/5 px-5 py-3">
          <span className="text-sm text-foreground">
            Выберите товары, которые хотите вернуть{" "}
            {selected.size > 0 && (
              <span className="font-semibold text-primary">({selected.size})</span>
            )}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={cancel}
              className="rounded-full border border-border bg-background px-4 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              Отмена
            </button>
            <button
              type="button"
              disabled={selected.size === 0}
              className="rounded-full bg-primary px-5 py-1.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Продолжить
            </button>
          </div>
        </div>
      )}
    </article>
  );
}


/* ---------- Page ---------- */

function OrdersPage() {
  const [tab, setTab] = useState<"active" | "completed">("active");

  const sorted = [...ORDERS].sort((a, b) => {
    const order = { awaiting: 0, surcharge: 1, paid: 2 } as const;
    return order[a.payment] - order[b.payment];
  });

  const isActive = tab === "active";
  

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

          <div className="mb-4">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Мои заказы
            </h1>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex items-center gap-1 border-b border-border">
            <button
              type="button"
              onClick={() => setTab("active")}
              className={[
                "relative -mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              <span className="sm:hidden">Активные</span><span className="hidden sm:inline">Активные заказы</span>
              <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {sorted.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setTab("completed")}
              className={[
                "relative -mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                !isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              <span className="sm:hidden">Завершённые</span><span className="hidden sm:inline">Завершённые заказы</span>
              <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {COMPLETED_ORDERS.length}
              </span>
            </button>
          </div>

          {/* List */}
          <div className="space-y-4">
            {isActive
              ? sorted.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    priority={order.payment === "awaiting"}
                  />
                ))
              : COMPLETED_ORDERS.map((order) => (
                  <CompletedOrderCard key={order.id} order={order} />
                ))}
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
