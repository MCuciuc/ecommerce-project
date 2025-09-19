
import prismadb from "@/lib/prismadb";
import { formatter } from "@/lib/utils";
import PieChart from "@/components/charts/pie-chart";

interface DashboardPageProps {
  params: Promise<{ storeid: string }>;
}

const DashboardPage = async ({ params }: DashboardPageProps) => {
  const { storeid } = await params;

  const store = await prismadb.store.findFirst({
    where: { id: storeid },
  });

  const [totalOrders, paidOrders, allOrderItems] = await Promise.all([
    prismadb.order.count({ where: { storeId: storeid } }),
    // Temporarily treat all orders as paid
    prismadb.order.count({ where: { storeId: storeid } }),
    prismadb.orderItem.findMany({
      where: { order: { storeId: storeid } },
      include: { product: true, order: { select: { id: true, createdAt: true } } },
    }),
  ]);

  const revenue = allOrderItems.reduce((sum, item) => sum + item.product.price.toNumber(), 0);

  type MonthlyRow = { monthKey: string; year: number; month: number; orders: number; revenue: number };
  const monthToOrderIds = new Map<string, Set<string>>();
  const monthToRevenue = new Map<string, number>();

  allOrderItems.forEach((item) => {
    const created = item.order.createdAt;
    const y = created.getFullYear();
    const m = created.getMonth() + 1;
    const key = `${y}-${String(m).padStart(2, "0")}`;
    if (!monthToOrderIds.has(key)) monthToOrderIds.set(key, new Set());
    monthToOrderIds.get(key)!.add(item.order.id);
    monthToRevenue.set(key, (monthToRevenue.get(key) ?? 0) + item.product.price.toNumber());
  });

  const monthly: MonthlyRow[] = Array.from(monthToRevenue.entries())
    .map(([key, rev]) => {
      const [y, m] = key.split("-").map((v) => Number(v));
      const ordersCount = monthToOrderIds.get(key)?.size ?? 0;
      return { monthKey: key, year: y, month: m, orders: ordersCount, revenue: rev };
    })
    .sort((a, b) => (a.year - b.year) || (a.month - b.month));

  return (
    <div className="p-8 space-y-6">
      <div>Active Store: {store?.name}</div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Total orders (initiated)</div>
          <div className="text-2xl font-semibold">{totalOrders}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Paid orders</div>
          <div className="text-2xl font-semibold">{paidOrders}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Total revenue</div>
          <div className="text-2xl font-semibold">{formatter.format(revenue)}</div>
        </div>
      </div>

      <div className="rounded-lg border">
        <div className="p-4 border-b text-sm font-medium">Monthly overview</div>
        <div className="p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div>
              <PieChart
                data={monthly.map((m) => ({
                  label: new Date(m.year, m.month - 1, 1).toLocaleString(undefined, { month: 'short' }),
                  value: m.revenue,
                }))}
                size={260}
                thickness={32}
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-2 pr-4">Month</th>
                    <th className="py-2 pr-4">Orders</th>
                    <th className="py-2 pr-4">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {monthly.map((row) => (
                    <tr key={row.monthKey} className="border-t">
                      <td className="py-2 pr-4">{new Date(row.year, row.month - 1, 1).toLocaleString(undefined, { month: 'short' })}</td>
                      <td className="py-2 pr-4">{row.orders}</td>
                      <td className="py-2 pr-4">{formatter.format(row.revenue)}</td>
                    </tr>
                  ))}
                  {monthly.length === 0 && (
                    <tr>
                      <td className="py-2 pr-4" colSpan={3}>No data yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;