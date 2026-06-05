import { createFileRoute, Link } from "@tanstack/react-router";
import { Package } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "pokupki — главная" },
      { name: "description", content: "Маркетплейс pokupki" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          pokupki
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Перейдите к своим заказам, чтобы отслеживать их статус
        </p>
        <Link
          to="/orders"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          <Package className="h-4 w-4" />
          Мои заказы
        </Link>
      </div>
    </div>
  );
}
