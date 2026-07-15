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
  HelpCircle,
  MessageSquare,
  X,
  Receipt,
  QrCode,
  ChevronRight,
  ChevronsRight,
  ArrowUpRight,
  Undo2,
  Star,
  Paperclip,
  Info,
  Camera,
  ArrowLeft,
} from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";


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
type PaymentState = "awaiting" | "paid" | "surcharge" | "confirming";

type OrderItem = {
  id: string;
  title: string;
  size?: string;
  color?: string;
  qty: number;
  price: number; // base price
  commission: number; // комиссия
  image: string;
  rating?: number;
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
  pickupInactive?: boolean; // выбранный ПВЗ временно недоступен
  cdek?: boolean; // pickup point is СДЭК
  deliveryFee?: number; // СДЭК delivery cost included in total
  trackNumber?: string; // СДЭК track number
  expectingTrack?: boolean; // ожидаем присвоение трек-номера от СДЭК
  payment: PaymentState;
  payAmount?: number; // for awaiting / surcharge
  paidAmount?: number; // already paid for surcharge
  awaitingSeconds?: number; // for awaiting
  groups: ItemGroup[];
  completedAt?: string; // дата выдачи (для завершённых)
  refunded?: boolean; // деньги уже вернули на Лицевой счёт
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
    id: "pvz-inactive",
    number: "0253984240-0007",
    brand: "URBAN — базовый гардероб",
    date: "18 июня 2025",
    pickup: "Стройкерамика, Макси ПВЗ",
    pickupInactive: true,
    payment: "paid",
    groups: [
      {
        status: "collecting",
        items: [
          {
            id: "urb1",
            title: "Свитшот оверсайз хлопковый",
            size: "L",
            color: "молочный",
            qty: 1,
            price: 2490,
            commission: 320,
            image: img("photo-1556821840-3a63f95609a7"),
          },
          {
            id: "urb2",
            title: "Джинсы прямого кроя",
            size: "32",
            color: "индиго",
            qty: 1,
            price: 3890,
            commission: 480,
            image: img("photo-1541099649105-f69ad21f3246"),
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
    id: "oos-refunded",
    number: "337456951",
    brand: "HomeStyle — текстиль и декор",
    date: "28 июня 2025",
    pickup: "Самара, ул. Ново-Садовая, 160",
    payment: "paid",
    refunded: true,
    groups: [
      {
        status: "out_of_stock",
        items: [
          {
            id: "hs1",
            title: "Комплект постельного белья 2-спальный сатин",
            color: "графит",
            qty: 1,
            price: 5890,
            commission: 880,
            image: img("photo-1505693416388-ac5ce068fe85"),
          },
          {
            id: "hs2",
            title: "Шторы блэкаут на люверсах 200×270",
            color: "молочный",
            qty: 1,
            price: 3380,
            commission: 490,
            image: img("photo-1513519245088-0e12902e5a38"),
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
    id: "track-pending",
    number: "337456921",
    brand: "Happywear — гипермаркет одежды",
    date: "9 июля 2025",
    pickup: "Самара, Московское шоссе, 220",
    cdek: true,
    deliveryFee: 299,
    expectingTrack: true,
    payment: "paid",
    groups: [
      {
        status: "from_supplier",
        items: [
          {
            id: "hw-tp1",
            title: "Ветровка женская непромокаемая",
            size: "M",
            color: "оливковый",
            qty: 1,
            price: 2390,
            commission: 350,
            image: img("photo-1495121605193-b116b5b9c5fe"),
          },
          {
            id: "hw-tp2",
            title: "Брюки карго хлопок",
            size: "M",
            color: "бежевый",
            qty: 1,
            price: 1890,
            commission: 280,
            image: img("photo-1521572163474-6864f9cf17ab"),
          },
        ],
      },
    ],
  },
  {
    id: "confirming",
    number: "337456922",
    brand: "Nordic Home — текстиль и уют",
    date: "14 июля 2025",
    pickup: "Самара, ул. Ново-Садовая, 160",
    payment: "confirming",
    groups: [
      {
        status: "ordered_unpaid",
        items: [
          {
            id: "nh1",
            title: "Плед вязаный крупной вязки",
            color: "молочный",
            qty: 1,
            price: 3290,
            commission: 480,
            image: img("photo-1520006403909-838d6b92c22e"),
          },
          {
            id: "nh2",
            title: "Наволочка декоративная 45×45",
            color: "серый",
            qty: 2,
            price: 690,
            commission: 100,
            image: img("photo-1493552152660-f915ab47ae9d"),
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
            rating: 5,
          },
          {
            id: "tm43",
            title: "Печенье Мальта с кокосом ТВ 0,890кг",
            qty: 1,
            price: 311,
            commission: 65,
            image: img("photo-1499636136210-6f4ee915583e"),
            rating: 4,
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
  {
    id: "c3",
    number: "337456999",
    brand: "HomeStyle — текстиль и декор",
    date: "15 июня 2025",
    completedAt: "20 июня 2025",
    pickup: "Самара, ул. Ново-Садовая, 160",
    payment: "paid",
    groups: [
      {
        status: "out_of_stock",
        items: [
          {
            id: "hs3",
            title: "Плед вязаный крупной вязки 150×200",
            color: "пудровый",
            qty: 1,
            price: 3290,
            commission: 490,
            image: img("photo-1580301762395-21ffdf13d3f9"),
          },
          {
            id: "hs4",
            title: "Набор махровых полотенец 50×90, 3 шт.",
            color: "мятный",
            qty: 1,
            price: 1890,
            commission: 280,
            image: img("photo-1616627547584-bf28aa75ad76"),
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
      <div className="mx-auto flex max-w-[84rem] items-center gap-3 px-4 py-3">
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
        <div className="mx-auto flex max-w-[84rem] items-center gap-5 overflow-x-auto px-4 py-2.5 text-sm">
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

const TIMELINE_DATES = [
  "21.06.2026 10:40",
  "22.06.2026 09:15",
  "23.06.2026 12:00",
  "24.06.2026 09:59",
  "24.06.2026 10:28",
  "25.06.2026 11:00",
  "26.06.2026 14:22",
];

function StatusTimeline({ status, variant = "dark" }: { status: OrderStatus; variant?: "dark" | "light" }) {
  const currentIndex = STEPS.findIndex((s) => s.key === status);
  const inactiveLine = variant === "light" ? "bg-border" : "bg-white/20";
  const inactiveDot =
    variant === "light" ? "bg-muted text-muted-foreground" : "bg-white/15 text-white/60";
  return (
    <ol className="relative">
      {STEPS.map((step, idx) => {
        const Icon = step.icon;
        const isDone = currentIndex !== -1 && idx < currentIndex;
        const isCurrent = idx === currentIndex;
        const active = isDone || isCurrent;
        return (
          <li key={step.key} className="relative flex gap-3 pb-4 last:pb-0">
            {idx < STEPS.length - 1 && (
              <span
                className={`absolute left-[11px] top-6 bottom-0 w-px ${
                  isDone ? "bg-primary" : inactiveLine
                }`}
              />
            )}
            <div
              className={`relative z-10 mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full ${
                isCurrent
                  ? "bg-primary text-primary-foreground"
                  : isDone
                  ? "bg-primary/80 text-primary-foreground"
                  : inactiveDot
              }`}
            >
              <Icon className="h-3 w-3" />
            </div>
            <div className={active ? "" : "opacity-60"}>
              <div className="text-sm leading-snug">{step.label}</div>
              {active && (
                <div className="mt-0.5 text-xs opacity-70">{TIMELINE_DATES[idx]}</div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}


function StatusTrigger({ status }: { status: OrderStatus }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const meta = STATUS_META[status];
  const known = STEPS.some((s) => s.key === status);

  if (!known) {
    return <StatusLabel status={status} />;
  }

  const triggerEl = (
    <button
      type="button"
      onClick={() => isMobile && setOpen(true)}
      className={`inline-flex items-center gap-1 text-base font-medium ${meta.color} hover:opacity-80 transition-opacity`}
    >
      {meta.label}
      <ChevronRight className="h-4 w-4" />
    </button>
  );

  const panel = (
    <div className="p-4">
      <div className="mb-3 text-sm font-semibold opacity-90">Статус заказа</div>
      <StatusTimeline status={status} />
    </div>
  );

  if (isMobile) {
    return (
      <>
        {triggerEl}
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent className="bg-background text-foreground">
            <div className="px-4 pb-6 pt-2 max-h-[80vh] overflow-y-auto">
              <div className="mb-3 mt-2 text-base font-semibold">Статус заказа</div>
              <StatusTimeline status={status} variant="light" />
            </div>
          </DrawerContent>
        </Drawer>
      </>
    );
  }


  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
        {triggerEl}
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={8}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="w-80 rounded-2xl border-0 bg-foreground p-0 text-background shadow-xl"
      >
        {panel}
      </PopoverContent>
    </Popover>
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
        <div className="ml-auto hidden sm:flex flex-1 sm:flex-none flex-wrap items-center justify-center sm:justify-end gap-x-3 gap-y-2">
          <span className="text-sm text-muted-foreground">
            Итого по заказу:{" "}
            <TotalWithTooltip order={order} className="text-base font-bold text-destructive" />
          </span>
          <Dialog>
            <DialogTrigger asChild>
              <button className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-95 active:opacity-90">
                <CreditCard className="h-4 w-4" />
                Оплатить {formatPrice(order.payAmount ?? 0)}
              </button>
            </DialogTrigger>
            <PayDialogContent order={order} />
          </Dialog>
        </div>
      </div>
    );
  }

  if (order.payment === "paid") {
    return (
      <div className="flex items-center gap-3 border-t border-border/70 bg-success/5 px-5 py-3">
        <div className="flex items-center gap-2 text-success">
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-sm font-medium whitespace-nowrap">Заказ оплачен</span>
        </div>
        <div className="ml-auto text-sm text-muted-foreground whitespace-nowrap">
          <span className="sm:hidden">Итого:</span>
          <span className="hidden sm:inline">Итого по заказу:</span>{" "}
          <TotalWithTooltip order={order} className="text-base font-semibold text-foreground" />
        </div>
      </div>
    );
  }

  if (order.payment === "confirming") {
    return (
      <div className="flex items-center gap-3 border-t border-border/70 bg-warning/10 px-5 py-3">
        <ConfirmingStatus />
        <div className="ml-auto text-sm text-muted-foreground whitespace-nowrap">
          <span className="sm:hidden">Итого:</span>
          <span className="hidden sm:inline">Итого по заказу:</span>{" "}
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
      <div className="sm:hidden flex items-center justify-between border-t border-border/70 bg-warning/10 px-4 py-2.5">
        <span className="text-sm text-muted-foreground">
          Осталось доплатить:{" "}
          <span className="font-bold text-warning">{formatPrice(order.payAmount ?? 0)}</span>
        </span>
        <span className="text-sm text-muted-foreground">
          Итого:{" "}
          <span className="font-semibold text-foreground">{formatPrice(total)}</span>
        </span>
      </div>
      <div className="flex items-center justify-center bg-warning/10 px-4 py-2.5 sm:hidden">
        <Dialog>
          <DialogTrigger asChild>
            <button className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-95">
              <CreditCard className="h-4 w-4" />
              Доплатить {formatPrice(order.payAmount ?? 0)}
            </button>
          </DialogTrigger>
          <PayDialogContent order={order} />
        </Dialog>
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
          <Dialog>
            <DialogTrigger asChild>
              <button className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-95 active:opacity-90">
                <CreditCard className="h-4 w-4" />
                Доплатить {formatPrice(order.payAmount ?? 0)}
              </button>
            </DialogTrigger>
            <PayDialogContent order={order} />
          </Dialog>
        </div>
      </div>
    </>
  );
}


/* ---------- Order card ---------- */

function StarRating({ initial = 0 }: { initial?: number }) {
  const [rating, setRating] = useState(initial);
  const [hover, setHover] = useState(0);
  const active = hover || rating;
  return (
    <div
      className="mt-2 inline-flex items-center justify-center gap-1 rounded-full bg-background border px-3 py-1 shadow-sm"
      role="radiogroup"
      aria-label="Оценка товара"
      onMouseLeave={() => setHover(0)}
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= active;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            aria-label={`${n} ${n === 1 ? "звезда" : n < 5 ? "звезды" : "звёзд"}`}
            onMouseEnter={() => setHover(n)}
            onFocus={() => setHover(n)}
            onBlur={() => setHover(0)}
            onClick={() => setRating(n === rating ? 0 : n)}
            className="text-[#FBBF24] transition-transform hover:scale-110 focus:outline-none"
          >
            <Star
              className="h-5 w-5"
              strokeWidth={1.5}
              fill={filled ? "currentColor" : "none"}
              stroke={filled ? "currentColor" : "hsl(var(--muted-foreground))"}
            />
          </button>
        );
      })}
    </div>
  );
}

function ItemTile({
  item,
  removable = false,
  accentPrice = false,
  mutedPrice = false,
  selectable = false,
  selected = false,
  onToggle,
  rateable = false,
}: {
  item: OrderItem;
  removable?: boolean;
  accentPrice?: boolean;
  mutedPrice?: boolean;
  selectable?: boolean;
  selected?: boolean;
  onToggle?: () => void;
  rateable?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="w-[140px] flex-none">
      <div
        className={[
          "relative overflow-hidden rounded-lg border bg-card transition",
          selectable && selected ? "border-primary ring-2 ring-primary/40" : "border-border",
          mutedPrice ? "opacity-80" : "",
        ].join(" ")}
      >
        <img
          src={item.image}
          alt={item.title}
          className={`h-[140px] w-full object-cover ${mutedPrice ? "grayscale-[40%]" : ""}`}
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
      {rateable && (
        <div className="mt-2 flex justify-center">
          <StarRating initial={item.rating ?? 0} />
        </div>
      )}
      <div
        className={`mt-2 hidden sm:line-clamp-2 text-sm font-medium leading-snug ${mutedPrice ? "text-muted-foreground" : "text-foreground"}`}
        title={item.title}
      >
        {item.title}
      </div>
      <div className="mt-2 flex items-center justify-between gap-1">
        <div
          className={`text-[15px] sm:text-base font-semibold ${mutedPrice ? "text-muted-foreground" : accentPrice ? "text-destructive" : "text-success"}`}
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

function OutOfStockNotice({ group, refunded = false }: { group: ItemGroup; refunded?: boolean }) {
  const sum = group.items.reduce((s, it) => s + (it.price + it.commission) * it.qty, 0);
  if (refunded) {
    return (
      <div className="mb-3 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-foreground">
        <div className="font-medium">Нам очень жаль, что товар закончился.</div>
        <div className="mt-1 text-muted-foreground">
          Мы вернули{" "}
          <span className="font-semibold text-destructive">{formatPrice(sum)}</span> на ваш{" "}
          <a className="text-primary underline-offset-2 hover:underline" href="#">
            Лицевой счёт
          </a>
          .
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          Деньги с Лицевого счёта можно использовать либо для быстрой оплаты другого товара на нашем сайте, или вернуть себе на карту.
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <button
              type="button"
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-95"
            >
              <CreditCard className="h-3.5 w-3.5" />
              Вывести деньги на карту
            </button>
          </DialogTrigger>
          <WithdrawDialogContent balance={sum} />
        </Dialog>
      </div>
    );
  }
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
  refunded = false,
  selectable = false,
  selectedIds,
  onToggleItem,
  rateable = false,
  hideOutOfStockNotice = false,
}: {
  group: ItemGroup;
  hidePipeline?: boolean;
  hideStatusLabel?: boolean;
  accentPrice?: boolean;
  refunded?: boolean;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onToggleItem?: (id: string) => void;
  rateable?: boolean;
  hideOutOfStockNotice?: boolean;
}) {
  const mutedItems = group.status === "out_of_stock";
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
          {!hideStatusLabel && <StatusTrigger status={group.status} />}
          <span className="ml-auto text-xs text-muted-foreground">
            {group.items.length}{" "}
            {group.items.length === 1 ? "товар" : group.items.length < 5 ? "товара" : "товаров"}
          </span>
        </div>
      )}
      {group.status === "out_of_stock" && !hideOutOfStockNotice && <OutOfStockNotice group={group} refunded={refunded} />}
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
                  mutedPrice={mutedItems}
                  selectable={selectable}
                  selected={selectedIds?.has(item.id)}
                  onToggle={() => onToggleItem?.(item.id)}
                  rateable={rateable}
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
            mutedPrice={mutedItems}
            selectable={selectable}
            selected={selectedIds?.has(item.id)}
            onToggle={() => onToggleItem?.(item.id)}
            rateable={rateable}
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

function PickupSelector({ value, inactive = false }: { value: string; inactive?: boolean }) {
  const [pickup, setPickup] = useState(value);
  const options = PICKUP_OPTIONS.includes(pickup) ? PICKUP_OPTIONS : [pickup, ...PICKUP_OPTIONS];
  const base = inactive
    ? "border-destructive/60 bg-destructive/10 text-destructive hover:bg-destructive/15"
    : "border-primary/40 bg-primary/5 text-primary hover:bg-primary/10";
  return (
    <div className={`relative inline-flex items-center gap-1 rounded-md border border-dashed px-2 py-0.5 ${base}`}>
      <MapPin className="h-3.5 w-3.5" />
      <span className="max-w-[260px] truncate font-medium">{pickup}</span>
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

function MobilePickupBadge({
  pickup,
  cdek,
  editable,
  inactive,
  clickable,
}: {
  pickup: string;
  cdek: boolean;
  editable: boolean;
  inactive: boolean;
  clickable?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(pickup);
  const [title, ...rest] = value.split(",");
  const sub = rest.join(",").trim();
  const options = PICKUP_OPTIONS.includes(value) ? PICKUP_OPTIONS : [value, ...PICKUP_OPTIONS];
  const cdekOpen = clickable || editable;

  if (cdek) {
    if (!cdekOpen) {
      return (
        <div className="inline-flex items-center gap-1 rounded-md">
          <span className="inline-flex items-center rounded-sm bg-success px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-success-foreground">
            CDEK
          </span>
        </div>
      );
    }
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Пункт выдачи"
            className="inline-flex items-center gap-1 rounded-md"
          >
            <span className="inline-flex items-center rounded-sm bg-success px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-success-foreground">
              CDEK
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" side="bottom" className="w-64 p-3">
          <div className="text-sm font-semibold text-foreground">Пункт выдачи</div>
          <div className="mt-1.5 text-sm font-medium text-foreground">{pickup}</div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Пункт выдачи"
          className={[
            "inline-flex h-8 w-8 items-center justify-center rounded-full border",
            inactive
              ? "border-destructive/50 bg-destructive/10 text-destructive"
              : "border-primary/40 bg-primary/10 text-primary",
          ].join(" ")}
        >
          <MapPin className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" side="bottom" className="w-64 p-3">
        <div className="flex items-start gap-2">
          <MapPin className={`mt-0.5 h-4 w-4 shrink-0 ${inactive ? "text-destructive" : "text-primary"}`} />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-foreground">Пункт выдачи</div>
            <div className="mt-1.5 text-sm font-medium text-foreground">{title.trim()}</div>
            {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
            {editable && (
              <label className="mt-3 block">
                <span className="text-xs font-medium text-primary hover:underline cursor-pointer">
                  Изменить ПВЗ
                </span>
                <select
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value);
                    setOpen(false);
                  }}
                  aria-label="Выбрать пункт выдачи"
                  className="sr-only"
                >
                  {options.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </label>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}


function PickupInactiveWarning() {
  return (
    <div
      role="alert"
      className="relative inline-flex max-w-[280px] items-start gap-1.5 rounded-md bg-destructive px-2.5 py-1.5 text-xs font-medium leading-snug text-destructive-foreground shadow-sm sm:max-w-none"
    >
      <span
        aria-hidden
        className="absolute -left-1 top-1/2 hidden h-2 w-2 -translate-y-1/2 rotate-45 bg-destructive sm:block"
      />
      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>Доставка в выбранный пункт выдачи недоступна. Пожалуйста, выберите другой ПВЗ</span>
    </div>
  );
}

function ContractButton() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-primary"
          aria-label="Скачать договор"
        >
          <img src={contractIcon.url} alt="" className="h-4 w-4 object-contain" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="bg-foreground text-background">Скачать договор</TooltipContent>
    </Tooltip>
  );
}

function ConfirmingStatus() {
  const tipText = "Платежи по реквизитам подтверждаются на следующий рабочий день";
  return (
    <div className="flex items-center gap-2 text-warning">
      <Clock className="h-4 w-4" />
      {/* Desktop: hover tooltip on the whole label + icon */}
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="hidden sm:inline-flex items-center gap-1.5 cursor-help">
            <span className="text-sm font-medium whitespace-nowrap text-foreground">
              Ожидает подтверждения оплаты
            </span>
            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs bg-foreground text-background">
          {tipText}
        </TooltipContent>
      </Tooltip>
      {/* Mobile: tap-to-open popover */}
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="sm:hidden inline-flex items-center gap-1.5"
            aria-label="Подробнее о статусе"
          >
            <span className="text-sm font-medium whitespace-nowrap text-foreground">
              Ожидает подтверждения оплаты
            </span>
            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent side="top" align="start" className="max-w-[260px] bg-foreground p-3 text-xs text-background border-foreground">
          {tipText}
        </PopoverContent>
      </Popover>
    </div>
  );
}

function QuestionDialogContent() {
  return (
    <DialogContent className="max-w-xl p-0 gap-0 rounded-2xl overflow-hidden">
      {/* Mobile hero icon */}
      <div className="flex flex-col items-center sm:hidden pt-6 pb-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MessageSquare className="h-6 w-6" />
        </div>
      </div>
      <div className="px-6 pt-6 sm:pt-8 pb-4">
        <DialogTitle className="text-xl sm:text-2xl font-bold text-center sm:text-left">
          Задать вопрос
        </DialogTitle>
      </div>
      <div className="px-6 pb-4 space-y-2">
        <label className="text-sm font-semibold text-foreground">Сообщение</label>
        <div className="relative">
          <Textarea
            placeholder="Опишите ваш вопрос"
            className="min-h-[140px] sm:min-h-[200px] resize-none rounded-xl border-border pr-10"
          />
          <button
            type="button"
            className="absolute bottom-3 right-3 text-primary hover:text-primary/80"
            aria-label="Прикрепить файл"
          >
            <Paperclip className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="hidden sm:block px-6 pb-3">
        <label className="flex items-center gap-3 rounded-xl border border-dashed border-border px-4 py-3 cursor-pointer hover:bg-muted/40">
          <Paperclip className="h-5 w-5 text-muted-foreground" />
          <div className="flex flex-col">
            <span className="text-sm text-foreground">
              Прикрепить файл <span className="text-muted-foreground">(необязательно)</span>
            </span>
            <span className="text-xs text-muted-foreground">jpg, png · до 5 МБ</span>
          </div>
          <input type="file" accept="image/png,image/jpeg" className="hidden" />
        </label>
      </div>
      <div className="px-6 pb-4 flex items-start gap-2 text-xs text-muted-foreground">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <span>
          Максимальный размер изображения — 800x600 пикселей, объем до 5МБ.
          <br className="hidden sm:block" />
          Допустимые форматы: jpg, png
        </span>
      </div>
      {/* Desktop footer */}
      <div className="hidden sm:flex items-center justify-end gap-3 border-t border-border px-6 py-4">
        <DialogClose asChild>
          <button
            type="button"
            className="rounded-full border border-border px-6 py-2.5 text-sm font-semibold hover:bg-muted"
          >
            Отмена
          </button>
        </DialogClose>
        <button
          type="button"
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-95"
        >
          Отправить
        </button>
      </div>
      {/* Mobile footer */}
      <div className="sm:hidden flex flex-col gap-2 px-6 pb-6 pt-2">
        <button
          type="button"
          className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-95"
        >
          Отправить
        </button>
        <DialogClose asChild>
          <button
            type="button"
            className="w-full rounded-full px-6 py-2 text-sm font-semibold text-primary"
          >
            Отмена
          </button>
        </DialogClose>
      </div>
    </DialogContent>
  );
}

function MobileActionsMenu() {
  return (
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
        <Dialog>
          <DialogTrigger asChild>
            <button className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              Связаться с поставщиком
            </button>
          </DialogTrigger>
          <QuestionDialogContent />
        </Dialog>
        <button className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted">
          <img src={contractIcon.url} alt="" className="h-4 w-4 object-contain" />
          Скачать договор
        </button>
      </PopoverContent>
    </Popover>
  );
}

function HeaderActions() {
  return (
    <div className="hidden sm:flex items-center gap-0.5">
      <ContractButton />
      <Dialog>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <button className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-primary" aria-label="Связаться с поставщиком">
                <MessageSquare className="h-4 w-4" />
              </button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-foreground text-background">Связаться с поставщиком</TooltipContent>
        </Tooltip>
        <QuestionDialogContent />
      </Dialog>
    </div>
  );
}

function OrderCard({
  order,
  priority = false,
  onMoveToCompleted,
}: {
  order: Order;
  priority?: boolean;
  onMoveToCompleted?: (id: string) => void;
}) {
  const isAwaiting = order.payment === "awaiting";
  const isConfirming = order.payment === "confirming";
  const isSurcharge = order.payment === "surcharge";
  const isFullyOutOfStock = order.groups.every((g) => g.status === "out_of_stock");
  const hasReady = order.groups.some((g) => g.status === "ready");
  const pickupEditable = order.groups.some(
    (g) => g.status === "paid" || g.status === "collecting",
  );
  const [collapsed, setCollapsed] = useState(false);

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
            <div className="flex items-center gap-1">
              <span className="font-medium text-foreground">№ {order.number}</span>
              <button className="rounded p-1 hover:bg-muted" aria-label="Скопировать номер">
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-1">
              {!isConfirming && (
                <button
                  type="button"
                  onClick={() => setCollapsed((v) => !v)}
                  aria-label={collapsed ? "Развернуть заказ" : "Свернуть заказ"}
                  aria-expanded={!collapsed}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <ChevronDown className={`h-4 w-4 transition-transform ${collapsed ? "-rotate-90" : ""}`} />
                </button>
              )}
              <MobileActionsMenu />
            </div>
          </div>
          <div className={`px-5 ${isConfirming || isFullyOutOfStock ? "sm:py-3.5" : "py-2 sm:py-3.5"}`}>
          <div className="flex items-start justify-between gap-3">
            {!isConfirming && <h3 className="hidden sm:block text-base font-semibold text-foreground">{order.brand}</h3>}
            {isConfirming && <div className="hidden sm:block" />}
            <div className="flex items-center gap-1">
              {!isConfirming && <HeaderActions />}
              {!isConfirming && (
                <button
                  type="button"
                  onClick={() => setCollapsed((v) => !v)}
                  aria-label={collapsed ? "Развернуть заказ" : "Свернуть заказ"}
                  aria-expanded={!collapsed}
                  className="hidden sm:inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <ChevronDown className={`h-4 w-4 transition-transform ${collapsed ? "-rotate-90" : ""}`} />
                </button>
              )}
            </div>
          </div>
          {!isFullyOutOfStock && !isConfirming && (
          <div className="mt-1 sm:mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
            {!hasReady && (
              <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-start">
                <div className="flex items-center gap-1.5">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex cursor-help">
                        <Truck className="h-5 w-5 text-primary" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-foreground text-background">Ориентировочная дата доставки</TooltipContent>
                  </Tooltip>
                  <span className="text-foreground text-base font-semibold">{order.date}</span>
                </div>
                <div className="sm:hidden">
                  <MobilePickupBadge
                    pickup={order.pickup}
                    cdek={!!order.cdek}
                    editable={pickupEditable}
                    inactive={!!order.pickupInactive}
                  />
                </div>
              </div>
            )}
            {order.cdek ? (
              <div className={hasReady ? "flex items-center gap-1.5" : "hidden sm:flex items-center gap-1.5"}>
                <span className="inline-flex items-center rounded-sm bg-success px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-success-foreground">
                  CDEK
                </span>
                <span className="text-foreground font-medium">{order.pickup}</span>
              </div>
            ) : order.pickupInactive ? (
              <div className={hasReady ? "flex w-full flex-col items-start gap-1.5 sm:w-auto sm:flex-row sm:items-center sm:gap-2" : "hidden w-full flex-col items-start gap-1.5 sm:flex sm:w-auto sm:flex-row sm:items-center sm:gap-2"}>
                <PickupSelector value={order.pickup} inactive />
                <PickupInactiveWarning />
              </div>
            ) : pickupEditable ? (
              <div className={hasReady ? "inline-flex" : "hidden sm:inline-flex"}>
                <PickupSelector value={order.pickup} />
              </div>
            ) : (
              <div className={hasReady ? "flex items-center gap-1.5" : "hidden sm:flex items-center gap-1.5"}>
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
            <div className="mt-2 hidden sm:flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-base text-muted-foreground">
                <span># {order.number}</span>
                <button className="rounded p-1 hover:bg-muted" aria-label="Скопировать номер">
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
              {onMoveToCompleted && (
                <button
                  type="button"
                  onClick={() => onMoveToCompleted(order.id)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-accent"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Перенести в завершённые
                </button>
              )}
            </div>
          )}
          {isConfirming && (
            <div className="mt-2 hidden sm:flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-base text-muted-foreground">
                <span># {order.number}</span>
                <button className="rounded p-1 hover:bg-muted" aria-label="Скопировать номер">
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <button className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-95 active:opacity-90">
                    <CreditCard className="h-4 w-4" />
                    Оплатить {formatPrice(order.payAmount ?? orderTotal(order))}
                  </button>
                </DialogTrigger>
                <PayDialogContent order={order} />
              </Dialog>
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
          {order.cdek && !order.trackNumber && order.expectingTrack && !isFullyOutOfStock && (
            <div className="mt-2.5 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground">Трек-номер:</span>
              <span className="text-muted-foreground italic">пока не присвоен</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="rounded-full p-0.5 text-muted-foreground hover:text-foreground"
                    aria-label="Информация о треке"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[240px] text-center bg-foreground text-background">
                  В пути. Заказ ещё не передан в транспортную компанию
                </TooltipContent>
              </Tooltip>
            </div>
          )}
          </div>
        </header>
      )}

      {!collapsed && (
        <>
          {/* Groups: each status group has its own pipeline + items */}
          <div className="divide-y divide-border/70">
            {order.groups.map((g, i) => (
              <GroupBlock
                key={i}
                group={g}
                hidePipeline={isAwaiting || isFullyOutOfStock}
                hideStatusLabel={isAwaiting || isFullyOutOfStock}
                accentPrice={isAwaiting}
                refunded={order.refunded}
              />
            ))}
          </div>

          {/* Payment footer for paid / surcharge (hidden when fully OOS) */}
          {!isAwaiting && !isFullyOutOfStock && <PaymentBar order={order} />}

          {/* Mobile awaiting total footer */}
          {isAwaiting && (
            <>
              <div className="sm:hidden flex items-center justify-end gap-x-3 gap-y-2 border-t border-border/70 bg-destructive/10 px-5 py-3">
                <span className="text-sm text-muted-foreground">
                  Итого по заказу:{" "}
                  <TotalWithTooltip order={order} className="text-base font-bold text-destructive" />
                </span>
              </div>
              <div className="flex items-center justify-center bg-destructive/10 px-5 py-3 sm:hidden">
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-95 active:opacity-90">
                      <CreditCard className="h-4 w-4" />
                      Оплатить {formatPrice(order.payAmount ?? 0)}
                    </button>
                  </DialogTrigger>
                  <PayDialogContent order={order} />
                </Dialog>
              </div>
            </>
          )}

          {/* Fully OOS footer */}
          {isFullyOutOfStock && !isAwaiting && (
            <>
              <div className="flex items-center gap-3 border-t border-border/70 bg-muted px-5 py-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium whitespace-nowrap">Нет в наличии</span>
                </div>
                <div className="ml-auto text-sm text-muted-foreground whitespace-nowrap">
                  <span className="sm:hidden">Итого:</span>
                  <span className="hidden sm:inline">Итого по заказу:</span>{" "}
                  <TotalWithTooltip order={order} className="text-base font-semibold text-foreground" />
                </div>
              </div>
              {onMoveToCompleted && (
                <div className="flex items-center justify-center bg-muted px-5 py-3 sm:hidden">
                  <button
                    type="button"
                    onClick={() => onMoveToCompleted(order.id)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-accent"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Перенести в завершённые
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </article>
  );
}


function CompletedOrderCard({ order }: { order: Order }) {
  const [returnMode, setReturnMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [collapsed, setCollapsed] = useState(false);
  const isFullyOutOfStock = order.groups.every((g) => g.status === "out_of_stock");

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
        <div className="flex items-center gap-1">
          <span className="font-medium text-foreground">№ {order.number}</span>
          <button className="rounded p-1 hover:bg-muted" aria-label="Скопировать номер">
            <Copy className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? "Развернуть заказ" : "Свернуть заказ"}
            aria-expanded={!collapsed}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${collapsed ? "-rotate-90" : ""}`} />
          </button>
          <MobileActionsMenu />
        </div>
      </div>
      <header className="border-b border-border/70 px-5 py-3.5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="hidden sm:block text-base font-semibold text-foreground">{order.brand}</h3>
          <div className="flex items-center gap-1">
            <HeaderActions />
            <button
              type="button"
              onClick={() => setCollapsed((v) => !v)}
              aria-label={collapsed ? "Развернуть заказ" : "Свернуть заказ"}
              aria-expanded={!collapsed}
              className="hidden sm:inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <ChevronDown className={`h-4 w-4 transition-transform ${collapsed ? "-rotate-90" : ""}`} />
            </button>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
          {isFullyOutOfStock ? (
            <div className="flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-medium text-muted-foreground">Нет в наличии</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
              <span className="text-success font-medium">Получено {order.completedAt}</span>
            </div>
          )}
          {!isFullyOutOfStock && (
            <div className="hidden sm:flex items-center gap-1.5">
              {order.cdek ? (
                <>
                  <span className="inline-flex items-center rounded-sm bg-success px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-success-foreground">
                    CDEK
                  </span>
                  <span className="text-foreground font-medium">{order.pickup}</span>
                </>
              ) : (
                <>
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="max-w-[280px] truncate">{order.pickup}</span>
                </>
              )}
            </div>
          )}
          {!isFullyOutOfStock && (
            <div className="sm:hidden ml-auto">
              <MobilePickupBadge
                pickup={order.pickup}
                cdek={!!order.cdek}
                editable={false}
                inactive={!!order.pickupInactive}
                clickable
              />
            </div>
          )}
          <div className="ml-auto hidden sm:flex items-center gap-1.5 text-base">
            <span># {order.number}</span>
          </div>
        </div>
      </header>

      {!collapsed && (
      <>
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
            rateable={g.status === "received" && !returnMode}
            hideOutOfStockNotice
          />
        ))}
      </div>

      <div className="flex items-center gap-3 border-t border-border/70 bg-muted/30 px-5 py-3">
        {!returnMode && (
          <>
            {!isFullyOutOfStock && (
              <>
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="hidden sm:inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    Оформить заявку на возврат
                  </button>
                </DialogTrigger>
                <ReturnDialogContent order={order} />
              </Dialog>
              <Dialog>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        aria-label="Оформить заявку на возврат"
                        className="sm:hidden inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <Undo2 className="h-4 w-4" />
                      </button>
                    </DialogTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-foreground text-background">
                    Оформить заявку на возврат
                  </TooltipContent>
                </Tooltip>
                <ReturnDialogContent order={order} />
              </Dialog>
              </>
            )}
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
      </>
      )}
    </article>
  );
}


/* ---------- Return / Pay dialogs ---------- */

function ReturnDialogContent({ order }: { order: Order }) {
  const allItems = order.groups.flatMap((g) => g.items);
  const [kept, setKept] = useState<Set<string>>(new Set(allItems.map((i) => i.id)));
  const items = allItems.filter((i) => kept.has(i.id));
  const total = items.reduce((s, i) => s + (i.price + i.commission) * i.qty, 0);
  const remove = (id: string) =>
    setKept((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

  return (
    <DialogContent className="max-w-lg p-0 gap-0 rounded-2xl overflow-hidden">
      <div className="px-6 pt-6 pb-3">
        <DialogTitle className="text-xl font-bold">Заявка на возврат</DialogTitle>
      </div>
      <div className="px-6 pb-4 space-y-3">
        <h4 className="text-sm font-semibold text-foreground">Товары</h4>
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {items.map((it) => (
            <div key={it.id} className="flex items-center gap-3 text-sm">
              <button
                type="button"
                onClick={() => remove(it.id)}
                className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Убрать из заявки"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <span className="flex-1 truncate text-foreground">{it.title}</span>
              <span className="font-medium text-foreground whitespace-nowrap">
                {formatPrice((it.price + it.commission) * it.qty)}
              </span>
            </div>
          ))}
          {items.length === 0 && (
            <div className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
              Не выбрано ни одного товара
            </div>
          )}
        </div>
        <div className="flex justify-end text-sm">
          <span className="font-bold text-foreground">Всего: {formatPrice(total)}</span>
        </div>
      </div>
      <div className="mx-6 mb-4 rounded-xl bg-muted/60 p-4 text-sm">
        <div className="mb-1 font-medium text-foreground">Оформить возврат возможно:</div>
        <ol className="ml-4 list-decimal space-y-0.5 text-muted-foreground">
          <li>Пересорт по размеру, цвету, модели</li>
          <li>Производственный брак, бой, течь</li>
          <li>Товар не соответствует заявленным характеристикам</li>
        </ol>
      </div>
      <div className="px-6 pb-4 space-y-3">
        <Select defaultValue="current">
          <SelectTrigger className="rounded-xl h-11">
            <SelectValue placeholder="Пункт выдачи" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current">{order.pickup}</SelectItem>
            <SelectItem value="other">Другой пункт выдачи…</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="rounded-xl h-11">
            <SelectValue placeholder="Выберите причину возврата" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="size">Пересорт по размеру / цвету</SelectItem>
            <SelectItem value="defect">Производственный брак</SelectItem>
            <SelectItem value="mismatch">Не соответствует характеристикам</SelectItem>
            <SelectItem value="other">Другая причина</SelectItem>
          </SelectContent>
        </Select>
        <div>
          <div className="text-sm text-muted-foreground mb-1.5">Добавьте фото</div>
          <label className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-dashed border-border text-muted-foreground cursor-pointer hover:bg-muted hover:text-foreground">
            <Camera className="h-4 w-4" />
            <input type="file" accept="image/*" className="hidden" multiple />
          </label>
        </div>
      </div>
      <div className="border-t border-border px-6 py-4">
        <DialogClose asChild>
          <button
            type="button"
            disabled={items.length === 0}
            className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Отправить
          </button>
        </DialogClose>
      </div>
    </DialogContent>
  );
}

const SBP_BANKS = [
  { name: "Сбербанк", color: "bg-emerald-500", initial: "С" },
  { name: "Т-Банк", color: "bg-yellow-400 text-black", initial: "Т" },
  { name: "Банк ВТБ", color: "bg-sky-500", initial: "В" },
  { name: "АЛЬФА-БАНК", color: "bg-red-500", initial: "А" },
  { name: "Плайт", color: "bg-indigo-500", initial: "П" },
  { name: "Райффайзенбанк", color: "bg-yellow-500 text-black", initial: "Р" },
  { name: "Открытие", color: "bg-cyan-500", initial: "О" },
  { name: "Газпромбанк", color: "bg-blue-600", initial: "Г" },
];

function SbpLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div className="flex h-6 w-6 items-center justify-center">
        <div className="grid grid-cols-2 gap-0.5">
          <div className="h-2 w-2 rounded-sm bg-red-500" />
          <div className="h-2 w-2 rounded-sm bg-blue-500" />
          <div className="h-2 w-2 rounded-sm bg-yellow-400" />
          <div className="h-2 w-2 rounded-sm bg-green-500" />
        </div>
      </div>
      <span className="text-sm font-bold tracking-tight text-foreground">сбп</span>
    </div>
  );
}

function QrPlaceholder({ size = 180 }: { size?: number }) {
  return (
    <div
      className="relative rounded-lg bg-white p-2 shadow-sm ring-1 ring-border"
      style={{ width: size, height: size }}
    >
      <div
        className="h-full w-full"
        style={{
          backgroundImage:
            "radial-gradient(circle, #0a0a0a 1px, transparent 1.2px)",
          backgroundSize: "8px 8px",
        }}
      />
      <div className="absolute left-2 top-2 h-8 w-8 border-[3px] border-foreground rounded-sm" />
      <div className="absolute right-2 top-2 h-8 w-8 border-[3px] border-foreground rounded-sm" />
      <div className="absolute left-2 bottom-2 h-8 w-8 border-[3px] border-foreground rounded-sm" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="rounded-md bg-white p-1 shadow">
          <SbpLogo />
        </div>
      </div>
    </div>
  );
}

function PayDialogContent({ order }: { order: Order }) {
  const isSurcharge = order.payment === "surcharge";
  const amount = order.payAmount ?? orderTotal(order);
  const commission = Math.round(amount * 0.2 * 100) / 100;
  const [step, setStep] = useState<"select" | "sbp" | "transfer" | "success">("select");
  const [method, setMethod] = useState<"sbp" | "transfer">("sbp");

  if (step === "success") {
    return <PaySuccessContent orderNumber={order.number} amount={amount} />;
  }
  const [bankQuery, setBankQuery] = useState("");
  const [asBusiness, setAsBusiness] = useState(false);
  const [pickupTitle, ...rest] = order.pickup.split(",");
  const pickupSub = rest.join(",").trim() || order.pickup;

  const goPay = () => setStep(method);
  const goBack = () => setStep("select");

  if (step === "sbp") {
    return (
      <DialogContent className="max-w-md p-0 gap-0 rounded-2xl overflow-hidden sm:max-w-2xl">
        <div className="flex items-center gap-3 border-b border-border/60 px-5 py-4">
          <button
            type="button"
            onClick={goBack}
            aria-label="Назад"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <DialogTitle className="text-lg font-bold">Оплата через СБП</DialogTitle>
        </div>

        {/* Desktop: recipient + amount + QR */}
        <div className="hidden sm:grid grid-cols-[1fr_auto] gap-6 px-6 py-6">
          <div className="space-y-5">
            <div>
              <div className="text-sm text-muted-foreground">Получатель</div>
              <div className="font-bold text-foreground">ПСК "63 ПОКУПКИ"</div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-base text-foreground">Сумма к оплате</span>
                <span className="text-xl font-bold text-foreground">{formatPrice(amount)}</span>
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                Включая комиссию {formatPrice(commission)}
              </div>
            </div>
            <SbpLogo />
            <div className="text-sm text-muted-foreground max-w-[220px]">
              Для оплаты зайдите в мобильное приложение банка и отсканируйте QR-код
            </div>
          </div>
          <div className="flex items-center justify-center">
            <QrPlaceholder size={200} />
          </div>
        </div>

        {/* Mobile: recipient + amount + bank list */}
        <div className="sm:hidden">
          <div className="border-b border-border/60 px-5 py-4">
            <div className="text-sm text-muted-foreground">Получатель</div>
            <div className="font-bold text-foreground">ПСК "63 ПОКУПКИ"</div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-base text-foreground">Сумма к оплате</span>
              <span className="text-lg font-bold text-foreground">{formatPrice(amount)}</span>
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              Включая комиссию {formatPrice(commission)}
            </div>
          </div>
          <div className="px-5 py-4 space-y-3">
            <div>
              <div className="text-base font-semibold text-foreground">Выберите банк для оплаты</div>
              <div className="mt-1 text-sm text-muted-foreground">
                У вас откроется банковское приложение, где вы сможете подтвердить платёж
              </div>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={bankQuery}
                onChange={(e) => setBankQuery(e.target.value)}
                placeholder="Найти банк"
                className="w-full rounded-full border border-border bg-background pl-9 pr-4 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <div className="mb-2 text-sm font-semibold text-foreground">Ваши банки:</div>
              <ul className="max-h-72 divide-y divide-border/60 overflow-y-auto rounded-xl border border-border/60">
                {SBP_BANKS.filter((b) =>
                  b.name.toLowerCase().includes(bankQuery.toLowerCase()),
                ).map((b) => (
                  <li key={b.name}>
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-muted/50"
                    >
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white ${b.color}`}
                      >
                        {b.initial}
                      </div>
                      <span className="text-sm font-medium text-foreground">{b.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <button
              type="button"
              onClick={() => setStep("success")}
              className="mt-2 w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground hover:opacity-95"
            >
              Оплатить
            </button>
          </div>
        </div>
      </DialogContent>
    );
  }

  if (step === "transfer") {
    return (
      <DialogContent className="max-w-md p-0 gap-0 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 border-b border-border/60 px-5 py-4">
          <button
            type="button"
            onClick={goBack}
            aria-label="Назад"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <DialogTitle className="text-lg font-bold">Банковский перевод</DialogTitle>
        </div>
        <div className="border-b border-border/60 px-5 py-4">
          <div className="text-sm text-muted-foreground">Получатель</div>
          <div className="font-bold text-foreground">ПСК "63 ПОКУПКИ"</div>
          <div className="mt-2 text-sm text-muted-foreground">
            К оплате <span className="text-base font-bold text-foreground">{formatPrice(amount)}</span>
          </div>
        </div>
        <div className="px-5 py-5 space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            Для оплаты сделайте скриншот QR-кода и загрузите изображение в мобильном приложении банка
          </p>
          <div className="flex justify-center">
            <QrPlaceholder size={180} />
          </div>
          <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 px-4 py-3 text-center text-sm text-emerald-800 dark:text-emerald-200">
            Оплата будет подтверждена в течение одного-двух рабочих дней.
          </div>
          <label className="flex items-center gap-3 rounded-xl border border-border p-3 cursor-pointer hover:bg-muted/40">
            <input
              type="checkbox"
              checked={asBusiness}
              onChange={(e) => setAsBusiness(e.target.checked)}
              className="h-4 w-4 rounded border-border accent-primary"
            />
            <span className="text-sm font-medium text-foreground">Покупаю как бизнес</span>
          </label>
        </div>
      </DialogContent>
    );
  }

  return (
    <DialogContent className="max-w-md p-0 gap-0 rounded-2xl overflow-hidden">
      <div className="border-b border-border/60 px-6 pt-6 pb-4">
        <DialogTitle className="text-xl font-bold">
          {isSurcharge ? "Доплата по заказу" : "Оплата заказа"}
        </DialogTitle>
      </div>
      <div className="px-6 pt-4 pb-3 space-y-2">
        <div className="text-sm text-muted-foreground">Пункт выдачи</div>
        <div className="rounded-xl border border-border p-4">
          <div className="font-semibold text-foreground">{pickupTitle.trim()}</div>
          <div className="text-sm text-muted-foreground">{pickupSub}</div>
        </div>
        <div className="flex justify-center pt-1">
          <button type="button" className="text-sm font-semibold text-primary hover:underline">
            Изменить
          </button>
        </div>
      </div>
      <div className="border-t border-border/60 px-6 pt-4 pb-4 space-y-2">
        <div className="text-sm font-semibold text-foreground mb-1">Выберите способ оплаты</div>
        <button
          type="button"
          onClick={() => { setMethod("sbp"); setStep("sbp"); }}
          className={`w-full flex items-center gap-3 rounded-xl border p-4 text-left transition-colors ${method === "sbp" ? "border-primary ring-2 ring-primary/30 bg-primary/5" : "border-border hover:bg-muted/40"}`}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary text-[10px] font-bold">
            СБП
          </div>
          <div>
            <div className="font-semibold text-foreground">Оплата через СБП</div>
            <div className="text-xs text-muted-foreground">Быстрое подтверждение платежа</div>
          </div>
        </button>
        <button
          type="button"
          onClick={() => { setMethod("transfer"); setStep("transfer"); }}
          className={`w-full flex items-center gap-3 rounded-xl border p-4 text-left transition-colors ${method === "transfer" ? "border-primary ring-2 ring-primary/30 bg-primary/5" : "border-border hover:bg-muted/40"}`}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-foreground">
            <QrCode className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold text-foreground">Банковский перевод</div>
            <div className="text-xs text-muted-foreground">Подтверждение платежа более суток</div>
          </div>
        </button>
      </div>
    </DialogContent>
  );
}


/* ---------- Withdraw dialog ---------- */

function WithdrawDialogContent({ balance }: { balance: number }) {
  const [amount, setAmount] = useState("");
  const fieldClass =
    "w-full rounded-lg border border-input bg-background px-3 pt-5 pb-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary";
  const labelClass =
    "pointer-events-none absolute left-3 top-1.5 text-[11px] font-medium text-muted-foreground";

  const Field = ({
    label,
    placeholder,
    value,
    onChange,
    inputMode,
  }: {
    label: string;
    placeholder: string;
    value?: string;
    onChange?: (v: string) => void;
    inputMode?: "text" | "numeric" | "decimal";
  }) => (
    <div className="relative">
      <label className={labelClass}>{label}</label>
      <input
        type="text"
        inputMode={inputMode}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className={fieldClass}
      />
    </div>
  );

  return (
    <DialogContent className="max-w-md rounded-2xl p-0 gap-0">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <DialogTitle className="text-lg font-semibold">Вывод денежных средств</DialogTitle>
      </div>
      <div className="space-y-3 px-6 py-5">
        <div className="flex items-center justify-between rounded-xl bg-muted/60 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Wallet className="h-4 w-4" />
            Баланс лицевого счёта
          </div>
          <div className="text-base font-semibold text-foreground">{formatPrice(balance)}</div>
        </div>
        <div className="relative">
          <label className={labelClass}>Сумма</label>
          <input
            type="text"
            inputMode="decimal"
            placeholder="Введите сумму"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={fieldClass}
          />
          <button
            type="button"
            onClick={() => setAmount(String(balance))}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-primary hover:underline"
          >
            Всё
          </button>
        </div>
        <Field label="Номер карты" placeholder="0000 0000 0000 0000" inputMode="numeric" />
        <Field label="Наименование банка" placeholder="Введите наименование банка" />
        <Field label="БИК" placeholder="000000000" inputMode="numeric" />
        <Field label="Расчётный счёт" placeholder="00000000000000000000" inputMode="numeric" />
        <Field label="ФИО держателя карты" placeholder="Например, Иванов Иван Иванович" />
      </div>
      <div className="px-6 pb-6">
        <DialogClose asChild>
          <button
            type="button"
            className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-95"
          >
            Вывести средства
          </button>
        </DialogClose>
      </div>
    </DialogContent>
  );
}


/* ---------- Page ---------- */



function OrdersPage() {
  const [tab, setTab] = useState<"active" | "completed">("active");
  const [movedIds, setMovedIds] = useState<Set<string>>(new Set());

  const sorted = [...ORDERS]
    .filter((o) => !movedIds.has(o.id))
    .sort((a, b) => {
      const score = (o: Order) => {
        if (o.payment === "awaiting") return 0;
        if (o.groups.every((g) => g.status === "ordered_unpaid")) return 1;
        return 2;
      };
      return score(a) - score(b);
    });

  const movedToCompleted = ORDERS.filter((o) => movedIds.has(o.id)).map((o) => ({
    ...o,
    completedAt: o.completedAt ?? "сегодня",
  }));
  const completedList = [...movedToCompleted, ...COMPLETED_ORDERS];

  const moveToCompleted = (id: string) => {
    setMovedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const isActive = tab === "active";
  
  

  return (
    <TooltipProvider delayDuration={150}>
      <div className="min-h-screen bg-background">
        <SiteHeader />

        <main className="mx-auto max-w-[84rem] px-4 py-6">
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
                {completedList.length}
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
                    onMoveToCompleted={moveToCompleted}
                  />
                ))
              : completedList.map((order) => (
                  <CompletedOrderCard key={order.id} order={order} />
                ))}
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
