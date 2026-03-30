import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useMultiOwnerAuth } from "@/hooks/useMultiOwnerAuth";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

function getOccupiedRooms(): {
  id: string;
  roomNumber: string;
  guestName: string;
}[] {
  try {
    const all = JSON.parse(localStorage.getItem("hotelCheckIns") || "[]");
    return all.filter((g: any) => {
      const s = g.status;
      if (typeof s === "string") {
        return (
          s === "checkedIn" ||
          s === "CheckedIn" ||
          s === "checked_in" ||
          s === "CHECKED_IN"
        );
      }
      if (typeof s === "object" && s !== null) {
        return "checkedIn" in s || "CheckedIn" in s;
      }
      return false;
    });
  } catch {
    return [];
  }
}

// ── Types ──────────────────────────────────────────────────────────────
type TableStatus = "free" | "occupied" | "reserved";
interface RTable {
  id: string;
  seats: number;
  status: TableStatus;
  currentOrderId?: string;
}
interface MenuItem {
  id: string;
  category: string;
  name: string;
  price: number;
  gstPct: number;
  isVeg: boolean;
  available: boolean;
  description?: string;
}
type OrderStatus = "pending" | "cooking" | "served" | "billed";
interface OrderItem {
  menuItemId: string;
  name: string;
  qty: number;
  price: number;
  notes?: string;
}
interface Order {
  id: string;
  tableId: string;
  items: OrderItem[];
  status: OrderStatus;
  createdAt: number;
  customerName?: string;
}
interface Bill {
  id: string;
  orderId: string;
  tableId: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  gst: number;
  total: number;
  paymentMode: string;
  createdAt: number;
  customerName?: string;
  roomNumber?: string;
}
interface BanquetBill {
  id: string;
  eventName: string;
  hall: string;
  contactName: string;
  contactPhone: string;
  eventDate: string;
  guestCount: number;
  perPlate: number;
  extra: number;
  gstPct: number;
  total: number;
  paymentMode: string;
  createdAt: number;
  notes?: string;
}
interface BanquetReservation {
  id: string;
  hall: string;
  eventType: string;
  date: string;
  time: string;
  guestCount: number;
  contactName: string;
  contactPhone: string;
  special?: string;
  status: "confirmed" | "tentative" | "cancelled";
}
interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalSpend: number;
  visits: number;
  loyaltyPoints: number;
}
interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  stock: number;
  reorder: number;
  cost: number;
}
interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  mode: string;
}
interface Receipt {
  id: string;
  date: string;
  source: string;
  amount: number;
  mode: string;
  note?: string;
}
interface Due {
  id: string;
  customerId?: string;
  customerName: string;
  amount: number;
  description: string;
  dueDate: string;
  isPaid: boolean;
}

// ── Default seed data ───────────────────────────────────────────────────
const DEFAULT_TABLES: RTable[] = [
  ...(["T1", "T2", "T3", "T4"] as const).map((id) => ({
    id,
    seats: 4,
    status: "free" as TableStatus,
  })),
  ...(["T5", "T6", "T7", "T8"] as const).map((id) => ({
    id,
    seats: 6,
    status: "free" as TableStatus,
  })),
  ...(["T9", "T10", "T11", "T12"] as const).map((id) => ({
    id,
    seats: 2,
    status: "free" as TableStatus,
  })),
  { id: "T13", seats: 8, status: "free" },
  { id: "T14", seats: 8, status: "free" },
  { id: "T15", seats: 10, status: "free" },
  { id: "T16", seats: 10, status: "free" },
];

const MENU_CATEGORIES = [
  "Starters",
  "Main Course",
  "Rice & Biryani",
  "Breads",
  "Beverages",
  "Desserts",
  "Specials",
];

const DEFAULT_MENU: MenuItem[] = [
  {
    id: "m1",
    category: "Starters",
    name: "Paneer Tikka",
    price: 280,
    gstPct: 5,
    isVeg: true,
    available: true,
  },
  {
    id: "m2",
    category: "Starters",
    name: "Chicken Tikka",
    price: 320,
    gstPct: 5,
    isVeg: false,
    available: true,
  },
  {
    id: "m3",
    category: "Starters",
    name: "Veg Spring Roll",
    price: 180,
    gstPct: 5,
    isVeg: true,
    available: true,
  },
  {
    id: "m4",
    category: "Starters",
    name: "Seekh Kebab",
    price: 340,
    gstPct: 5,
    isVeg: false,
    available: true,
  },
  {
    id: "m5",
    category: "Main Course",
    name: "Dal Makhani",
    price: 220,
    gstPct: 5,
    isVeg: true,
    available: true,
  },
  {
    id: "m6",
    category: "Main Course",
    name: "Paneer Butter Masala",
    price: 280,
    gstPct: 5,
    isVeg: true,
    available: true,
  },
  {
    id: "m7",
    category: "Main Course",
    name: "Chicken Curry",
    price: 320,
    gstPct: 5,
    isVeg: false,
    available: true,
  },
  {
    id: "m8",
    category: "Main Course",
    name: "Mutton Rogan Josh",
    price: 420,
    gstPct: 5,
    isVeg: false,
    available: true,
  },
  {
    id: "m9",
    category: "Rice & Biryani",
    name: "Veg Biryani",
    price: 280,
    gstPct: 5,
    isVeg: true,
    available: true,
  },
  {
    id: "m10",
    category: "Rice & Biryani",
    name: "Chicken Biryani",
    price: 340,
    gstPct: 5,
    isVeg: false,
    available: true,
  },
  {
    id: "m11",
    category: "Rice & Biryani",
    name: "Mutton Biryani",
    price: 420,
    gstPct: 5,
    isVeg: false,
    available: true,
  },
  {
    id: "m12",
    category: "Breads",
    name: "Butter Naan",
    price: 60,
    gstPct: 5,
    isVeg: true,
    available: true,
  },
  {
    id: "m13",
    category: "Breads",
    name: "Tandoori Roti",
    price: 40,
    gstPct: 5,
    isVeg: true,
    available: true,
  },
  {
    id: "m14",
    category: "Breads",
    name: "Stuffed Paratha",
    price: 80,
    gstPct: 5,
    isVeg: true,
    available: true,
  },
  {
    id: "m15",
    category: "Beverages",
    name: "Masala Chai",
    price: 40,
    gstPct: 5,
    isVeg: true,
    available: true,
  },
  {
    id: "m16",
    category: "Beverages",
    name: "Cold Coffee",
    price: 120,
    gstPct: 5,
    isVeg: true,
    available: true,
  },
  {
    id: "m17",
    category: "Beverages",
    name: "Fresh Lime Soda",
    price: 80,
    gstPct: 5,
    isVeg: true,
    available: true,
  },
  {
    id: "m18",
    category: "Beverages",
    name: "Sweet Lassi",
    price: 80,
    gstPct: 5,
    isVeg: true,
    available: true,
  },
  {
    id: "m19",
    category: "Desserts",
    name: "Gulab Jamun",
    price: 80,
    gstPct: 5,
    isVeg: true,
    available: true,
  },
  {
    id: "m20",
    category: "Desserts",
    name: "Vanilla Ice Cream",
    price: 120,
    gstPct: 5,
    isVeg: true,
    available: true,
  },
  {
    id: "m21",
    category: "Specials",
    name: "Thali (Veg)",
    price: 380,
    gstPct: 5,
    isVeg: true,
    available: true,
  },
  {
    id: "m22",
    category: "Specials",
    name: "Thali (Non-Veg)",
    price: 480,
    gstPct: 5,
    isVeg: false,
    available: true,
  },
];

const DEFAULT_CUSTOMERS: Customer[] = [
  {
    id: "c1",
    name: "Rajesh Kumar",
    phone: "9876543210",
    email: "rajesh@example.com",
    totalSpend: 4500,
    visits: 6,
    loyaltyPoints: 45,
  },
  {
    id: "c2",
    name: "Priya Sharma",
    phone: "9876543211",
    email: "priya@example.com",
    totalSpend: 2200,
    visits: 3,
    loyaltyPoints: 22,
  },
  {
    id: "c3",
    name: "Amit Singh",
    phone: "9876543212",
    totalSpend: 8100,
    visits: 12,
    loyaltyPoints: 81,
  },
];

const DEFAULT_INVENTORY: InventoryItem[] = [
  { id: "i1", name: "Chicken", unit: "kg", stock: 12, reorder: 5, cost: 180 },
  { id: "i2", name: "Paneer", unit: "kg", stock: 4, reorder: 3, cost: 280 },
  {
    id: "i3",
    name: "Basmati Rice",
    unit: "kg",
    stock: 25,
    reorder: 10,
    cost: 95,
  },
  { id: "i4", name: "Wheat Flour", unit: "kg", stock: 8, reorder: 5, cost: 45 },
  {
    id: "i5",
    name: "Cooking Oil",
    unit: "litre",
    stock: 6,
    reorder: 4,
    cost: 120,
  },
  { id: "i6", name: "Tomatoes", unit: "kg", stock: 2, reorder: 3, cost: 40 },
];

const DEFAULT_DUES: Due[] = [
  {
    id: "d1",
    customerName: "Rajesh Kumar",
    amount: 1200,
    description: "Table T5 dinner",
    dueDate: "2026-04-15",
    isPaid: false,
  },
  {
    id: "d2",
    customerName: "Priya Sharma",
    amount: 800,
    description: "Lunch for 4",
    dueDate: "2026-04-10",
    isPaid: false,
  },
  {
    id: "d3",
    customerName: "Amit Singh",
    amount: 2400,
    description: "Office party",
    dueDate: "2026-03-30",
    isPaid: true,
  },
];

// ── Helpers ─────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 10);
const fmt = (n: number) =>
  `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
const today = () => new Date().toISOString().slice(0, 10);
const now = () => Date.now();
const timeStr = (ts: number) =>
  new Date(ts).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
const elapsed = (ts: number) => {
  const m = Math.floor((Date.now() - ts) / 60000);
  return m < 60 ? `${m}m ago` : `${Math.floor(m / 60)}h ${m % 60}m ago`;
};

function useLS<T>(key: string, def: T): [T, (v: T | ((p: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const s = localStorage.getItem(key);
      return s ? JSON.parse(s) : def;
    } catch {
      return def;
    }
  });
  const set = useCallback(
    (v: T | ((p: T) => T)) => {
      setState((prev) => {
        const next = typeof v === "function" ? (v as (p: T) => T)(prev) : v;
        localStorage.setItem(key, JSON.stringify(next));
        return next;
      });
    },
    [key],
  );
  return [state, set];
}

// ── Sub-components ───────────────────────────────────────────────────────

function Dashboard({
  tables,
  orders,
  bills,
}: { tables: RTable[]; orders: Order[]; bills: Bill[] }) {
  const todayBills = bills.filter(
    (b) => new Date(b.createdAt).toDateString() === new Date().toDateString(),
  );
  const todayRevenue = todayBills.reduce((s, b) => s + b.total, 0);
  const activeOrders = orders.filter((o) => o.status !== "billed");
  const occupied = tables.filter((t) => t.status === "occupied").length;
  const avgOrder =
    todayBills.length > 0 ? Math.round(todayRevenue / todayBills.length) : 0;
  const recentOrders = [...orders]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 8);
  const statusColor = (s: OrderStatus) =>
    ({
      pending: "bg-orange-100 text-orange-700",
      cooking: "bg-blue-100 text-blue-700",
      served: "bg-green-100 text-green-700",
      billed: "bg-gray-100 text-gray-600",
    })[s];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Today's Revenue",
            value: fmt(todayRevenue),
            color: "border-t-green-500",
          },
          {
            label: "Active Orders",
            value: String(activeOrders.length),
            color: "border-t-blue-500",
          },
          {
            label: "Tables Occupied",
            value: `${occupied}/16`,
            color: "border-t-red-500",
          },
          {
            label: "Avg Order Value",
            value: fmt(avgOrder),
            color: "border-t-yellow-500",
          },
        ].map((c) => (
          <Card key={c.label} className={`border-t-4 ${c.color}`}>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{c.value}</div>
              <div className="text-sm text-gray-700 mt-1">{c.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-gray-700">
                <th className="text-left py-2">Order</th>
                <th className="text-left">Table</th>
                <th className="text-left">Items</th>
                <th className="text-left">Status</th>
                <th className="text-right">Amount</th>
                <th className="text-right">Time</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 font-mono text-xs">
                    {o.id.slice(0, 6).toUpperCase()}
                  </td>
                  <td>{o.tableId}</td>
                  <td>{o.items.reduce((s, i) => s + i.qty, 0)} items</td>
                  <td>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${statusColor(o.status)}`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="text-right">
                    {fmt(o.items.reduce((s, i) => s + i.price * i.qty, 0))}
                  </td>
                  <td className="text-right text-gray-600">
                    {timeStr(o.createdAt)}
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-700">
                    No orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function TableManagement({
  tables,
  setTables,
  setOrders,
  menu,
}: {
  tables: RTable[];
  setTables: (v: RTable[] | ((p: RTable[]) => RTable[])) => void;
  setOrders: (v: Order[] | ((p: Order[]) => Order[])) => void;
  menu: MenuItem[];
}) {
  const [sel, setSel] = useState<RTable | null>(null);
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [selItems, setSelItems] = useState<OrderItem[]>([]);
  const [menuSearch, setMenuSearch] = useState("");
  const [selectedWaiter, setSelectedWaiter] = useState("");
  const [waiters] = useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("kdm_kotWaiters") || "[]");
    } catch {
      return [];
    }
  });

  const statusBg = (s: TableStatus) =>
    s === "free"
      ? "bg-green-100 border-green-400"
      : s === "occupied"
        ? "bg-red-100 border-red-400"
        : "bg-yellow-100 border-yellow-400";
  const statusDot = (s: TableStatus) =>
    s === "free"
      ? "bg-green-500"
      : s === "occupied"
        ? "bg-red-500"
        : "bg-yellow-500";

  const changeStatus = (id: string, status: TableStatus, orderId?: string) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status, currentOrderId: orderId } : t,
      ),
    );
  };

  const addItem = (item: MenuItem) => {
    setSelItems((prev) => {
      const ex = prev.find((i) => i.menuItemId === item.id);
      if (ex)
        return prev.map((i) =>
          i.menuItemId === item.id ? { ...i, qty: i.qty + 1 } : i,
        );
      return [
        ...prev,
        { menuItemId: item.id, name: item.name, qty: 1, price: item.price },
      ];
    });
  };

  const createOrder = () => {
    if (!sel || selItems.length === 0) return;
    const order: Order = {
      id: uid(),
      tableId: sel.id,
      items: selItems,
      status: "pending",
      createdAt: now(),
      waiterName: selectedWaiter || undefined,
    } as any;
    setOrders((prev) => [...prev, order]);
    changeStatus(sel.id, "occupied", order.id);
    setSel(null);
    setShowNewOrder(false);
    setSelItems([]);
    toast.success(`Order created for ${sel.id}`);
  };

  const filteredMenu = menu.filter(
    (m) =>
      m.available && m.name.toLowerCase().includes(menuSearch.toLowerCase()),
  );

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Table Management</h2>
      <div className="flex gap-4 mb-4 text-sm">
        {(["free", "occupied", "reserved"] as TableStatus[]).map((s) => (
          <span key={s} className="flex items-center gap-1">
            <span className={`w-3 h-3 rounded-full ${statusDot(s)}`} />
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
        {tables.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSel(t)}
            className={`border-2 rounded-lg p-3 text-center cursor-pointer hover:shadow-md transition ${statusBg(t.status)}`}
          >
            <div className="font-bold text-lg">{t.id}</div>
            <div className="text-xs text-gray-700">{t.seats} seats</div>
          </button>
        ))}
      </div>
      {sel && (
        <Dialog open onOpenChange={() => setSel(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>
                Table {sel.id} — {sel.seats} seats
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <Badge
                className={
                  sel.status === "free"
                    ? "bg-green-500"
                    : sel.status === "occupied"
                      ? "bg-red-500"
                      : "bg-yellow-500"
                }
              >
                {sel.status}
              </Badge>
              {sel.status === "free" && (
                <>
                  <Button
                    className="w-full"
                    onClick={() => {
                      setShowNewOrder(true);
                    }}
                  >
                    + New Order
                  </Button>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => {
                      changeStatus(sel.id, "reserved");
                      setSel(null);
                    }}
                  >
                    Mark Reserved
                  </Button>
                </>
              )}
              {sel.status === "occupied" && (
                <Button
                  className="w-full"
                  variant="destructive"
                  onClick={() => {
                    changeStatus(sel.id, "free", undefined);
                    setSel(null);
                    toast.success(`${sel.id} cleared`);
                  }}
                >
                  Clear Table
                </Button>
              )}
              {sel.status === "reserved" && (
                <>
                  <Button
                    className="w-full"
                    onClick={() => {
                      setShowNewOrder(true);
                    }}
                  >
                    Start Order
                  </Button>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => {
                      changeStatus(sel.id, "free");
                      setSel(null);
                    }}
                  >
                    Mark Free
                  </Button>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
      {showNewOrder && sel && (
        <Dialog
          open
          onOpenChange={() => {
            setShowNewOrder(false);
            setSelItems([]);
          }}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>New Order — {sel.id}</DialogTitle>
            </DialogHeader>
            {waiters.length > 0 && (
              <div className="mb-2">
                <Label className="text-xs font-semibold">
                  Select Waiter (optional)
                </Label>
                <select
                  value={selectedWaiter}
                  onChange={(e) => setSelectedWaiter(e.target.value)}
                  className="w-full border rounded p-2 text-sm mt-1"
                >
                  <option value="">-- No Waiter --</option>
                  {waiters.map((w: any) => (
                    <option key={w.id} value={w.name}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  placeholder="Search menu..."
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  className="mb-2"
                />
                <div className="h-64 overflow-y-auto space-y-1">
                  {filteredMenu.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => addItem(m)}
                      className="w-full flex justify-between items-center px-3 py-2 rounded hover:bg-gray-100 text-sm"
                    >
                      <span>
                        {m.name}{" "}
                        <span
                          className={`text-xs px-1 rounded ${m.isVeg ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                        >
                          {m.isVeg ? "V" : "NV"}
                        </span>
                      </span>
                      <span className="font-semibold">{fmt(m.price)}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="font-semibold mb-2">Order Items</div>
                <div className="h-64 overflow-y-auto space-y-1">
                  {selItems.map((i) => (
                    <div
                      key={i.menuItemId}
                      className="flex justify-between items-center text-sm border rounded px-2 py-1"
                    >
                      <span className="flex-1">{i.name}</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            setSelItems((prev) =>
                              prev.map((x) =>
                                x.menuItemId === i.menuItemId
                                  ? { ...x, qty: Math.max(1, x.qty - 1) }
                                  : x,
                              ),
                            )
                          }
                          className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300"
                        >
                          -
                        </button>
                        <span className="w-6 text-center">{i.qty}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setSelItems((prev) =>
                              prev.map((x) =>
                                x.menuItemId === i.menuItemId
                                  ? { ...x, qty: x.qty + 1 }
                                  : x,
                              ),
                            )
                          }
                          className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setSelItems((prev) =>
                              prev.filter((x) => x.menuItemId !== i.menuItemId),
                            )
                          }
                          className="ml-2 text-red-500 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                  {selItems.length === 0 && (
                    <p className="text-gray-600 text-sm text-center py-4">
                      No items added
                    </p>
                  )}
                </div>
                <div className="text-right font-bold mt-2">
                  {fmt(selItems.reduce((s, i) => s + i.price * i.qty, 0))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={createOrder} disabled={selItems.length === 0}>
                Create Order
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function OrderManagement({
  orders,
  setOrders,
  tables,
  setTables,
  menu,
}: {
  orders: Order[];
  setOrders: (v: Order[] | ((p: Order[]) => Order[])) => void;
  tables: RTable[];
  setTables: (v: RTable[] | ((p: RTable[]) => RTable[])) => void;
  menu: MenuItem[];
}) {
  const [showNew, setShowNew] = useState(false);
  const [newTable, setNewTable] = useState("");
  const [selItems, setSelItems] = useState<OrderItem[]>([]);
  const [menuSearch, setMenuSearch] = useState("");

  const freeTables = tables.filter((t) => t.status !== "occupied");
  const activeOrders = orders.filter((o) => o.status !== "billed");
  const statusColor = (s: OrderStatus) =>
    ({
      pending: "bg-orange-100 text-orange-700",
      cooking: "bg-blue-100 text-blue-700",
      served: "bg-green-100 text-green-700",
      billed: "bg-gray-100 text-gray-600",
    })[s];
  const nextStatus: Record<OrderStatus, OrderStatus | null> = {
    pending: "cooking",
    cooking: "served",
    served: "billed",
    billed: null,
  };
  const nextLabel: Record<OrderStatus, string | null> = {
    pending: "→ Cooking",
    cooking: "→ Served",
    served: "→ Billed",
    billed: null,
  };

  const advance = (id: string, cur: OrderStatus) => {
    const next = nextStatus[cur];
    if (!next) return;
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: next } : o)),
    );
  };

  const addItem = (item: MenuItem) => {
    setSelItems((prev) => {
      const ex = prev.find((i) => i.menuItemId === item.id);
      if (ex)
        return prev.map((i) =>
          i.menuItemId === item.id ? { ...i, qty: i.qty + 1 } : i,
        );
      return [
        ...prev,
        { menuItemId: item.id, name: item.name, qty: 1, price: item.price },
      ];
    });
  };

  const createOrder = () => {
    if (!newTable || selItems.length === 0) return;
    const order: Order = {
      id: uid(),
      tableId: newTable,
      items: selItems,
      status: "pending",
      createdAt: now(),
    };
    setOrders((prev) => [...prev, order]);
    setTables((prev) =>
      prev.map((t) =>
        t.id === newTable
          ? { ...t, status: "occupied", currentOrderId: order.id }
          : t,
      ),
    );
    setShowNew(false);
    setSelItems([]);
    setNewTable("");
    toast.success(`Order created for ${newTable}`);
  };

  const filteredMenu = menu.filter(
    (m) =>
      m.available && m.name.toLowerCase().includes(menuSearch.toLowerCase()),
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Order Management</h2>
        <Button onClick={() => setShowNew(true)}>+ New Order</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="text-left p-3">Order #</th>
              <th className="text-left p-3">Table</th>
              <th className="text-left p-3">Items</th>
              <th className="text-left p-3">Status</th>
              <th className="text-right p-3">Amount</th>
              <th className="text-left p-3">Time</th>
              <th className="text-left p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {activeOrders
              .sort((a, b) => b.createdAt - a.createdAt)
              .map((o) => (
                <tr key={o.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-mono text-xs">
                    {o.id.slice(0, 6).toUpperCase()}
                  </td>
                  <td className="p-3 font-semibold">{o.tableId}</td>
                  <td className="p-3">
                    {o.items.map((i) => `${i.name}×${i.qty}`).join(", ")}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${statusColor(o.status)}`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="p-3 text-right font-semibold">
                    {fmt(o.items.reduce((s, i) => s + i.price * i.qty, 0))}
                  </td>
                  <td className="p-3 text-gray-600 text-xs">
                    {elapsed(o.createdAt)}
                  </td>
                  <td className="p-3">
                    {nextLabel[o.status] && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => advance(o.id, o.status)}
                      >
                        {nextLabel[o.status]}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            {activeOrders.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-700">
                  No active orders
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {showNew && (
        <Dialog
          open
          onOpenChange={() => {
            setShowNew(false);
            setSelItems([]);
          }}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>New Order</DialogTitle>
            </DialogHeader>
            <div className="mb-3">
              <Label>Table</Label>
              <Select value={newTable} onValueChange={setNewTable}>
                <SelectTrigger>
                  <SelectValue placeholder="Select table" />
                </SelectTrigger>
                <SelectContent>
                  {freeTables.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.id} ({t.seats} seats)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  placeholder="Search menu..."
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  className="mb-2"
                />
                <div className="h-56 overflow-y-auto space-y-1">
                  {filteredMenu.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => addItem(m)}
                      className="w-full flex justify-between items-center px-3 py-2 rounded hover:bg-gray-100 text-sm"
                    >
                      <span>{m.name}</span>
                      <span>{fmt(m.price)}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="font-semibold mb-2">Selected Items</div>
                <div className="h-56 overflow-y-auto space-y-1">
                  {selItems.map((i) => (
                    <div
                      key={i.menuItemId}
                      className="flex justify-between items-center text-sm border rounded px-2 py-1"
                    >
                      <span className="flex-1 text-xs">{i.name}</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            setSelItems((prev) =>
                              prev.map((x) =>
                                x.menuItemId === i.menuItemId
                                  ? { ...x, qty: Math.max(1, x.qty - 1) }
                                  : x,
                              ),
                            )
                          }
                          className="w-5 h-5 text-xs rounded bg-gray-200"
                        >
                          -
                        </button>
                        <span>{i.qty}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setSelItems((prev) =>
                              prev.map((x) =>
                                x.menuItemId === i.menuItemId
                                  ? { ...x, qty: x.qty + 1 }
                                  : x,
                              ),
                            )
                          }
                          className="w-5 h-5 text-xs rounded bg-gray-200"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setSelItems((prev) =>
                              prev.filter((x) => x.menuItemId !== i.menuItemId),
                            )
                          }
                          className="text-red-500 ml-1 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-right font-bold mt-2">
                  {fmt(selItems.reduce((s, i) => s + i.price * i.qty, 0))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={createOrder}
                disabled={!newTable || selItems.length === 0}
              >
                Create Order
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function KitchenDisplay({
  orders,
  setOrders,
}: {
  orders: Order[];
  setOrders: (v: Order[] | ((p: Order[]) => Order[])) => void;
}) {
  const active = orders.filter(
    (o) => o.status === "pending" || o.status === "cooking",
  );
  const advance = (id: string, s: OrderStatus) =>
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id
          ? { ...o, status: s === "pending" ? "cooking" : "served" }
          : o,
      ),
    );
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Kitchen Display System</h2>
      {active.length === 0 && (
        <p className="text-gray-700 text-center py-12">
          No active kitchen orders 🍳
        </p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {active
          .sort((a, b) => a.createdAt - b.createdAt)
          .map((o) => (
            <Card
              key={o.id}
              className={`border-l-4 ${o.status === "pending" ? "border-l-orange-500" : "border-l-blue-500"}`}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <CardTitle className="text-lg">{o.tableId}</CardTitle>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-semibold ${o.status === "pending" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}`}
                  >
                    {o.status.toUpperCase()}
                  </span>
                </div>
                <div className="text-xs text-gray-600">
                  {elapsed(o.createdAt)}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm mb-3">
                  {o.items.map((i) => (
                    <li key={i.menuItemId} className="flex justify-between">
                      <span>{i.name}</span>
                      <span className="font-bold">×{i.qty}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => advance(o.id, o.status)}
                >
                  {o.status === "pending" ? "→ Mark Cooking" : "→ Mark Served"}
                </Button>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}

function MenuManagement({
  menu,
  setMenu,
}: {
  menu: MenuItem[];
  setMenu: (v: MenuItem[] | ((p: MenuItem[]) => MenuItem[])) => void;
}) {
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<MenuItem>>({});
  const [activeTab, setActiveTab] = useState(MENU_CATEGORIES[0]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openNew = () => {
    setForm({ category: activeTab, isVeg: true, available: true, gstPct: 5 });
    setEditItem(null);
    setShowForm(true);
  };
  const openEdit = (item: MenuItem) => {
    setForm({ ...item });
    setEditItem(item);
    setShowForm(true);
  };
  const save = () => {
    if (!form.name || !form.price || !form.category) return;
    const item: MenuItem = {
      id: editItem?.id ?? uid(),
      category: form.category!,
      name: form.name!,
      price: Number(form.price),
      gstPct: Number(form.gstPct ?? 5),
      isVeg: form.isVeg ?? true,
      available: form.available ?? true,
      description: form.description,
    };
    if (editItem)
      setMenu((prev) => prev.map((m) => (m.id === item.id ? item : m)));
    else setMenu((prev) => [...prev, item]);
    setShowForm(false);
  };
  const del = (id: string) =>
    setMenu((prev) => prev.filter((m) => m.id !== id));

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Menu Management</h2>
        <div className="flex gap-2 items-center">
          <Button
            size="sm"
            style={{ background: "#16a34a", color: "#fff" }}
            onClick={() => {
              const headers = [
                "Name",
                "Category",
                "Price",
                "GST%",
                "Veg/NonVeg",
                "Available",
                "Description",
              ];
              const rows = menu.map((m) =>
                [
                  `"${(m.name ?? "").replace(/"/g, '""')}"`,
                  `"${m.category}"`,
                  m.price,
                  m.gstPct ?? 5,
                  m.isVeg ? "Veg" : "NonVeg",
                  m.available ? "Yes" : "No",
                  `"${(m.description ?? "").replace(/"/g, '""')}"`,
                ].join(","),
              );
              const csv = [headers.join(","), ...rows].join("\n");
              const blob = new Blob([`\uFEFF${csv}`], {
                type: "text/csv;charset=utf-8;",
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "menu_items_export.csv";
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            📥 Export Excel
          </Button>
          <Button
            size="sm"
            style={{ background: "#2563eb", color: "#fff" }}
            onClick={() => fileInputRef.current?.click()}
          >
            📤 Import CSV
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (ev) => {
                try {
                  const text = ev.target?.result as string;
                  const lines = text.split(/\r?\n/).filter((l) => l.trim());
                  if (lines.length < 2) {
                    toast.error("No data rows found");
                    return;
                  }
                  // Parse header
                  const parseCSVLine = (line: string) => {
                    const result: string[] = [];
                    let cur = "";
                    let inQuote = false;
                    for (let i = 0; i < line.length; i++) {
                      const ch = line[i];
                      if (ch === '"' && !inQuote) {
                        inQuote = true;
                      } else if (ch === '"' && inQuote && line[i + 1] === '"') {
                        cur += '"';
                        i++;
                      } else if (ch === '"' && inQuote) {
                        inQuote = false;
                      } else if (ch === "," && !inQuote) {
                        result.push(cur);
                        cur = "";
                      } else {
                        cur += ch;
                      }
                    }
                    result.push(cur);
                    return result;
                  };
                  const headers = parseCSVLine(lines[0]).map((h) =>
                    h.trim().toLowerCase(),
                  );
                  const nameIdx = headers.indexOf("name");
                  const catIdx = headers.indexOf("category");
                  const priceIdx = headers.indexOf("price");
                  const gstIdx = headers.findIndex((h) => h.includes("gst"));
                  const vegIdx = headers.findIndex((h) => h.includes("veg"));
                  const availIdx = headers.findIndex((h) =>
                    h.includes("avail"),
                  );
                  const descIdx = headers.findIndex((h) => h.includes("desc"));
                  if (nameIdx < 0 || priceIdx < 0) {
                    toast.error("CSV must have Name and Price columns");
                    return;
                  }
                  const imported: MenuItem[] = [];
                  for (let i = 1; i < lines.length; i++) {
                    const cols = parseCSVLine(lines[i]);
                    const name = cols[nameIdx]?.trim();
                    if (!name) continue;
                    const rawCat = cols[catIdx]?.trim() ?? "";
                    const category = MENU_CATEGORIES.includes(rawCat)
                      ? rawCat
                      : MENU_CATEGORIES[0];
                    const price = Number.parseFloat(cols[priceIdx]) || 0;
                    const gstPct =
                      gstIdx >= 0 ? Number.parseFloat(cols[gstIdx]) || 5 : 5;
                    const vegVal =
                      vegIdx >= 0 ? cols[vegIdx]?.trim().toLowerCase() : "veg";
                    const isVeg =
                      vegVal === "veg" ||
                      vegVal === "true" ||
                      vegVal === "1" ||
                      vegVal === "yes";
                    const availVal =
                      availIdx >= 0
                        ? cols[availIdx]?.trim().toLowerCase()
                        : "yes";
                    const available =
                      availVal === "yes" ||
                      availVal === "true" ||
                      availVal === "1";
                    const description =
                      descIdx >= 0 ? cols[descIdx]?.trim() : undefined;
                    imported.push({
                      id: uid(),
                      name,
                      category,
                      price,
                      gstPct,
                      isVeg,
                      available,
                      description,
                    });
                  }
                  if (imported.length === 0) {
                    toast.error("No valid rows found");
                    return;
                  }
                  setMenu((prev) => [...prev, ...imported]);
                  toast.success(`${imported.length} items imported`);
                } catch {
                  toast.error("Failed to parse CSV file");
                }
                e.target.value = "";
              };
              reader.readAsText(file);
            }}
          />
          <Button onClick={openNew}>+ Add Item</Button>
        </div>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto">
          {MENU_CATEGORIES.map((c) => (
            <TabsTrigger key={c} value={c}>
              {c}
            </TabsTrigger>
          ))}
        </TabsList>
        {MENU_CATEGORIES.map((cat) => (
          <TabsContent key={cat} value={cat}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
              {menu
                .filter((m) => m.category === cat)
                .map((m) => (
                  <Card key={m.id}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold">{m.name}</div>
                          <div className="text-xs text-gray-700">
                            {m.description}
                          </div>
                          <div className="flex gap-2 mt-1">
                            <span
                              className={`text-xs px-1.5 py-0.5 rounded ${m.isVeg ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                            >
                              {m.isVeg ? "Veg" : "Non-Veg"}
                            </span>
                            <span
                              className={`text-xs px-1.5 py-0.5 rounded ${m.available ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}
                            >
                              {m.available ? "Available" : "Unavailable"}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">
                            {fmt(m.price)}
                          </div>
                          <div className="text-xs text-gray-600">
                            GST {m.gstPct}%
                          </div>
                          <div className="flex gap-1 mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEdit(m)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => del(m.id)}
                            >
                              Del
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              {menu.filter((m) => m.category === cat).length === 0 && (
                <p className="text-gray-600 col-span-3 text-center py-8">
                  No items in this category
                </p>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
      {showForm && (
        <Dialog open onOpenChange={() => setShowForm(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editItem ? "Edit" : "Add"} Menu Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Name</Label>
                <Input
                  value={form.name ?? ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MENU_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Price (₹)</Label>
                  <Input
                    type="number"
                    value={form.price ?? ""}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, price: Number(e.target.value) }))
                    }
                  />
                </div>
                <div>
                  <Label>GST %</Label>
                  <Input
                    type="number"
                    value={form.gstPct ?? 5}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, gstPct: Number(e.target.value) }))
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={form.description ?? ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isVeg ?? true}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, isVeg: e.target.checked }))
                    }
                  />{" "}
                  Veg
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.available ?? true}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, available: e.target.checked }))
                    }
                  />{" "}
                  Available
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={save}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function Billing({
  tables,
  orders,
  setOrders,
  setTables,
  bills,
  setBills,
}: {
  tables: RTable[];
  orders: Order[];
  setOrders: (v: Order[] | ((p: Order[]) => Order[])) => void;
  setTables: (v: RTable[] | ((p: RTable[]) => RTable[])) => void;
  bills: Bill[];
  setBills: (v: Bill[] | ((p: Bill[]) => Bill[])) => void;
}) {
  const [selTable, setSelTable] = useState("");
  const [discount, setDiscount] = useState(0);
  const [payMode, setPayMode] = useState("cash");
  const [settleRoomNumber, setSettleRoomNumber] = useState("");
  const [occupiedRoomsList] = useState(() => getOccupiedRooms());
  const [showBill, setShowBill] = useState<Bill | null>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerSuggestions, setCustomerSuggestions] = useState<any[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [menuItemSearch, setMenuItemSearch] = useState("");
  const [menuItems] = useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("kdm_menu_items") || "[]");
    } catch {
      return [];
    }
  });
  const [extraItems, setExtraItems] = useState<
    { menuItemId: string; name: string; price: number; qty: number }[]
  >([]);

  const searchCustomers = (q: string) => {
    setCustomerSearch(q);
    if (q.length < 2) {
      setCustomerSuggestions([]);
      return;
    }
    const results: any[] = [];
    try {
      const customers = JSON.parse(
        localStorage.getItem("kdm_customers") || "[]",
      );
      for (const c of customers) {
        if (
          c.name?.toLowerCase().includes(q.toLowerCase()) ||
          c.mobile?.includes(q) ||
          c.phone?.includes(q)
        )
          results.push({
            name: c.name,
            mobile: c.mobile || c.phone,
            source: "Customer",
          });
      }
      const checkins = JSON.parse(
        localStorage.getItem("hotelCheckIns") || "[]",
      );
      for (const c of checkins) {
        if (
          c.guestName?.toLowerCase().includes(q.toLowerCase()) ||
          c.phone?.includes(q) ||
          c.mobile?.includes(q)
        )
          results.push({
            name: c.guestName,
            mobile: c.phone || c.mobile,
            source: "Hotel Guest",
          });
      }
      const history = JSON.parse(
        localStorage.getItem("kdm_guest_history") || "[]",
      );
      for (const c of history) {
        if (
          c.name?.toLowerCase().includes(q.toLowerCase()) ||
          c.mobile?.includes(q)
        )
          results.push({ name: c.name, mobile: c.mobile, source: "History" });
      }
    } catch {}
    const seen = new Set();
    const filtered = results
      .filter((r) => {
        const k = r.mobile || r.name;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      })
      .slice(0, 8);
    setCustomerSuggestions(filtered);
    if (q.length === 10 && filtered.length > 0) {
      setCustomerName(filtered[0].name || "");
      setCustomerPhone(filtered[0].mobile || q);
      setCustomerSearch("");
      setCustomerSuggestions([]);
      toast.success("Customer details auto-filled!");
    }
  };

  const filteredMenuItems = menuItems
    .filter(
      (m: any) =>
        m.available !== false &&
        (m.name?.toLowerCase().includes(menuItemSearch.toLowerCase()) ||
          m.category?.toLowerCase().includes(menuItemSearch.toLowerCase())),
    )
    .slice(0, 12);

  const updateExtraQty = (
    menuItemId: string,
    name: string,
    price: number,
    delta: number,
  ) => {
    setExtraItems((prev) => {
      const existing = prev.find((e) => e.menuItemId === menuItemId);
      if (!existing) {
        if (delta > 0) return [...prev, { menuItemId, name, price, qty: 1 }];
        return prev;
      }
      const newQty = existing.qty + delta;
      if (newQty <= 0) return prev.filter((e) => e.menuItemId !== menuItemId);
      return prev.map((e) =>
        e.menuItemId === menuItemId ? { ...e, qty: newQty } : e,
      );
    });
  };

  const activeOrder = orders.find(
    (o) => o.tableId === selTable && o.status !== "billed",
  );
  const allItems = [...(activeOrder ? activeOrder.items : []), ...extraItems];
  const subtotal = allItems.reduce((s, i) => s + i.price * i.qty, 0);
  const discAmt = Math.round((subtotal * discount) / 100);
  const gst = Math.round(((subtotal - discAmt) * 5) / 100);
  const total = subtotal - discAmt + gst;
  const canGenerate = !!selTable && (!!activeOrder || extraItems.length > 0);

  const generate = () => {
    if (!canGenerate) return;
    const bill: Bill = {
      id: `B${String(bills.length + 1).padStart(4, "0")}-${uid().slice(0, 4).toUpperCase()}`,
      orderId: activeOrder?.id || `manual-${Date.now()}`,
      tableId: selTable,
      items: allItems,
      subtotal,
      discount: discAmt,
      gst,
      total,
      paymentMode: payMode,
      createdAt: now(),
      roomNumber: payMode === "room" ? settleRoomNumber : undefined,
      customerName,
      customerPhone,
    } as Bill;
    setBills((prev) => [...prev, bill]);
    // Save all bills to unified kdm_restaurant_bills for AllInvoicesSection
    try {
      const unifiedBills = JSON.parse(
        localStorage.getItem("kdm_restaurant_bills") || "[]",
      );
      unifiedBills.push({
        ...bill,
        settledToRoom: payMode === "room",
        settledRoomNumber: payMode === "room" ? settleRoomNumber : undefined,
        settleToRoom: payMode === "room" ? settleRoomNumber : undefined,
        guestName:
          payMode === "room"
            ? `Room ${settleRoomNumber}`
            : customerName || bill.tableId,
        tableNumber: bill.tableId,
      });
      localStorage.setItem(
        "kdm_restaurant_bills",
        JSON.stringify(unifiedBills),
      );
    } catch {}
    if (payMode === "room" && settleRoomNumber) {
      try {
        const allBills = JSON.parse(
          localStorage.getItem("kdm_restaurant_room_bills") || "[]",
        );
        allBills.push({ ...bill, roomNumber: settleRoomNumber });
        localStorage.setItem(
          "kdm_restaurant_room_bills",
          JSON.stringify(allBills),
        );
      } catch {}
    }
    if (activeOrder) {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === activeOrder.id ? { ...o, status: "billed" } : o,
        ),
      );
    }
    setTables((prev) =>
      prev.map((t) =>
        t.id === selTable
          ? { ...t, status: "free", currentOrderId: undefined }
          : t,
      ),
    );
    setShowBill(bill);
    setSelTable("");
    setDiscount(0);
    setExtraItems([]);
    setCustomerName("");
    setCustomerPhone("");
    toast.success("Bill generated!");
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold mb-4">Billing</h2>
      <div className="space-y-4">
        {/* Customer Search */}
        <Card>
          <CardContent className="pt-4 space-y-2">
            <div className="text-sm font-semibold mb-2">
              👤 Customer (optional)
            </div>
            <div className="relative">
              <Label className="text-xs">Search Customer (name / mobile)</Label>
              <Input
                value={customerSearch}
                onChange={(e) => searchCustomers(e.target.value)}
                placeholder="Type name or mobile..."
                data-ocid="billing.search_input"
              />
              {customerSuggestions.length > 0 && (
                <div className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg w-full mt-1 max-h-48 overflow-y-auto">
                  {customerSuggestions.map((s) => (
                    <button
                      type="button"
                      key={`sug-${s.mobile || s.name}`}
                      className="w-full flex justify-between items-center px-3 py-2 cursor-pointer hover:bg-amber-50 text-sm text-left"
                      onClick={() => {
                        setCustomerName(s.name || "");
                        setCustomerPhone(s.mobile || "");
                        setCustomerSearch("");
                        setCustomerSuggestions([]);
                      }}
                    >
                      <span className="font-medium">{s.name}</span>
                      <span className="text-gray-700 text-xs">
                        {s.mobile} · {s.source}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Customer Name</Label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Guest name"
                  data-ocid="billing.input"
                />
              </div>
              <div>
                <Label className="text-xs">Mobile</Label>
                <Input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Mobile number"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Table selection */}
        <div>
          <Label>Select Table</Label>
          <Select value={selTable} onValueChange={setSelTable}>
            <SelectTrigger data-ocid="billing.select">
              <SelectValue placeholder="Choose table" />
            </SelectTrigger>
            <SelectContent>
              {tables.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.id} {t.status === "occupied" ? "🔴" : "🟢"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Add Menu Items */}
        <Card>
          <CardContent className="pt-4 space-y-2">
            <div className="text-sm font-semibold mb-2">🍽️ Add Menu Items</div>
            <Input
              value={menuItemSearch}
              onChange={(e) => setMenuItemSearch(e.target.value)}
              placeholder="Search menu items..."
              data-ocid="billing.search_input"
            />
            {menuItemSearch && (
              <div className="grid grid-cols-2 gap-2 mt-2 max-h-48 overflow-y-auto">
                {filteredMenuItems.length === 0 && (
                  <p className="text-xs text-gray-600 col-span-2">
                    No items found
                  </p>
                )}
                {filteredMenuItems.map((m: any) => {
                  const ei = extraItems.find((e) => e.menuItemId === m.id);
                  return (
                    <div
                      key={m.id}
                      className="flex items-center justify-between bg-gray-50 rounded p-2 text-xs"
                    >
                      <div>
                        <div className="font-semibold text-gray-800">
                          {m.name}
                        </div>
                        <div className="text-amber-600">₹{m.price}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          className="w-6 h-6 rounded-full bg-gray-200 text-gray-700 font-bold"
                          onClick={() =>
                            updateExtraQty(m.id, m.name, m.price, -1)
                          }
                        >
                          −
                        </button>
                        <span className="w-5 text-center font-bold">
                          {ei?.qty || 0}
                        </span>
                        <button
                          type="button"
                          className="w-6 h-6 rounded-full bg-amber-500 text-white font-bold"
                          onClick={() =>
                            updateExtraQty(m.id, m.name, m.price, 1)
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {extraItems.length > 0 && (
              <div className="mt-2 space-y-1">
                <div className="text-xs font-semibold text-gray-600">
                  Added Items:
                </div>
                {extraItems.map((e) => (
                  <div
                    key={e.menuItemId}
                    className="flex justify-between text-xs"
                  >
                    <span>
                      {e.name} × {e.qty}
                    </span>
                    <span className="text-amber-600">₹{e.price * e.qty}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        {(activeOrder || extraItems.length > 0) && selTable && (
          <Card>
            <CardContent className="pt-4 space-y-2">
              <div className="text-sm font-semibold mb-2">Order Items</div>
              {activeOrder?.items.map((i) => (
                <div
                  key={i.menuItemId}
                  className="flex justify-between text-sm"
                >
                  <span>
                    {i.name} × {i.qty}
                  </span>
                  <span>{fmt(i.price * i.qty)}</span>
                </div>
              ))}
              {extraItems.map((i) => (
                <div
                  key={i.menuItemId}
                  className="flex justify-between text-sm text-amber-700"
                >
                  <span>
                    + {i.name} × {i.qty}
                  </span>
                  <span>{fmt(i.price * i.qty)}</span>
                </div>
              ))}
              <div className="border-t pt-2 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{fmt(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Discount %</span>
                  <Input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-20 h-7 text-right"
                    min={0}
                    max={100}
                  />
                </div>
                <div className="flex justify-between">
                  <span>Discount (₹)</span>
                  <span>-{fmt(discAmt)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (5%)</span>
                  <span>{fmt(gst)}</span>
                </div>
                <div className="flex justify-between font-bold text-base border-t pt-1">
                  <span>TOTAL</span>
                  <span>{fmt(total)}</span>
                </div>
              </div>
              <div>
                <Label>Payment Mode</Label>
                <Select value={payMode} onValueChange={setPayMode}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="room">🛏️ Settle to Room</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {payMode === "room" && (
                <div>
                  <Label>Select Occupied Room</Label>
                  <Select
                    value={settleRoomNumber}
                    onValueChange={setSettleRoomNumber}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose occupied room" />
                    </SelectTrigger>
                    <SelectContent>
                      {occupiedRoomsList.length === 0 && (
                        <SelectItem value="_none" disabled>
                          No rooms currently occupied
                        </SelectItem>
                      )}
                      {occupiedRoomsList.map((g) => (
                        <SelectItem key={g.id} value={g.roomNumber}>
                          Room {g.roomNumber} — {g.guestName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-amber-600 mt-1">
                    This bill will be added to the room guest's checkout
                    invoice.
                  </p>
                </div>
              )}
              <Button
                className="w-full mt-2"
                onClick={generate}
                disabled={!canGenerate}
                data-ocid="billing.submit_button"
              >
                Generate & Print Bill
              </Button>
            </CardContent>
          </Card>
        )}
        {selTable && !activeOrder && extraItems.length === 0 && (
          <p className="text-yellow-600 text-sm">
            No active order for {selTable}. Add menu items above to create a
            direct bill.
          </p>
        )}
      </div>
      {showBill && (
        <PrintBill bill={showBill} onClose={() => setShowBill(null)} />
      )}
    </div>
  );
}

function PrintBill({ bill, onClose }: { bill: Bill; onClose: () => void }) {
  const print = () => window.print();
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <div id="print-area" className="p-4 text-sm font-mono">
          <div className="text-center mb-3">
            <div className="text-lg font-bold">HOTEL KDM PALACE</div>
            <div className="text-xs">Muzaffarpur, Bihar</div>
            <div className="text-xs">GSTIN: 10AABCK1234A1Z5</div>
            <div className="font-semibold mt-1">RESTAURANT BILL</div>
          </div>
          <div className="flex justify-between text-xs mb-2">
            <span>Bill#: {bill.id}</span>
            <span>{timeStr(bill.createdAt)}</span>
          </div>
          <div className="text-xs mb-2">
            Table: {bill.tableId} | Mode: {bill.paymentMode.toUpperCase()}
          </div>
          <table className="w-full text-xs mb-2">
            <thead>
              <tr className="border-b">
                <th className="text-left">Item</th>
                <th className="text-right">Qty</th>
                <th className="text-right">Rate</th>
                <th className="text-right">Amt</th>
              </tr>
            </thead>
            <tbody>
              {bill.items.map((i) => (
                <tr key={i.menuItemId}>
                  <td>{i.name}</td>
                  <td className="text-right">{i.qty}</td>
                  <td className="text-right">{fmt(i.price)}</td>
                  <td className="text-right">{fmt(i.price * i.qty)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t pt-2 space-y-0.5 text-xs">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{fmt(bill.subtotal)}</span>
            </div>
            {bill.discount > 0 && (
              <div className="flex justify-between">
                <span>Discount</span>
                <span>-{fmt(bill.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>GST (5%)</span>
              <span>{fmt(bill.gst)}</span>
            </div>
            <div className="flex justify-between font-bold border-t pt-1">
              <span>TOTAL</span>
              <span>{fmt(bill.total)}</span>
            </div>
          </div>
          <div className="text-center text-xs mt-3">
            Thank you for dining with us!
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={print}>🖨 Print</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BillHistory({ bills }: { bills: Bill[] }) {
  const [search, setSearch] = useState("");
  const [showBill, setShowBill] = useState<Bill | null>(null);
  const filtered = bills.filter(
    (b) =>
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.tableId.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Bill History</h2>
      <Input
        className="mb-4 max-w-xs"
        placeholder="Search by Bill# or Table..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="text-left p-3">Bill #</th>
              <th className="text-left p-3">Date/Time</th>
              <th className="text-left p-3">Table</th>
              <th className="text-right p-3">Amount</th>
              <th className="text-left p-3">Payment</th>
              <th className="text-left p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered
              .sort((a, b) => b.createdAt - a.createdAt)
              .map((b) => (
                <tr key={b.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-mono text-xs">{b.id}</td>
                  <td className="p-3">{timeStr(b.createdAt)}</td>
                  <td className="p-3">{b.tableId}</td>
                  <td className="p-3 text-right font-semibold">
                    {fmt(b.total)}
                  </td>
                  <td className="p-3">
                    <Badge variant="outline">
                      {b.paymentMode.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowBill(b)}
                    >
                      🖨 Reprint
                    </Button>
                  </td>
                </tr>
              ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-600">
                  No bills found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {showBill && (
        <PrintBill bill={showBill} onClose={() => setShowBill(null)} />
      )}
    </div>
  );
}

function BanquetBillingSection({
  banquetBills,
  setBanquetBills,
}: {
  banquetBills: BanquetBill[];
  setBanquetBills: (
    v: BanquetBill[] | ((p: BanquetBill[]) => BanquetBill[]),
  ) => void;
}) {
  const [form, setForm] = useState({
    eventName: "",
    hall: "Maharaja Hall",
    contactName: "",
    contactPhone: "",
    eventDate: today(),
    guestCount: 0,
    perPlate: 0,
    extra: 0,
    gstPct: 5,
    paymentMode: "cash",
    notes: "",
    companyName: "",
    companyGst: "",
  });
  const [showInv, setShowInv] = useState<BanquetBill | null>(null);
  const sub = form.guestCount * form.perPlate + form.extra;
  const gst = Math.round((sub * form.gstPct) / 100);
  const total = sub + gst;
  const generate = () => {
    if (!form.eventName || !form.contactName) return;
    const billId = `BB${String(banquetBills.length + 1).padStart(3, "0")}`;
    const bill: BanquetBill = {
      id: billId,
      ...form,
      total,
      createdAt: now(),
    };
    // Save company info to localStorage
    try {
      const profiles = JSON.parse(
        localStorage.getItem("kdm_banquet_profiles") || "{}",
      );
      profiles[billId] = {
        companyName: form.companyName,
        companyGst: form.companyGst,
      };
      localStorage.setItem("kdm_banquet_profiles", JSON.stringify(profiles));
    } catch {}
    setBanquetBills((prev) => [...prev, bill]);
    setShowInv(bill);
    toast.success("Banquet invoice generated!");
  };
  const halls = ["Maharaja Hall", "Rajwada Hall", "Garden Terrace"];
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Banquet Billing</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>New Banquet Bill</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Event Name</Label>
              <Input
                value={form.eventName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, eventName: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Hall</Label>
              <Select
                value={form.hall}
                onValueChange={(v) => setForm((p) => ({ ...p, hall: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {halls.map((h) => (
                    <SelectItem key={h} value={h}>
                      {h}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Contact Name</Label>
                <Input
                  value={form.contactName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, contactName: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={form.contactPhone}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, contactPhone: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Company Name (optional)</Label>
                <Input
                  value={form.companyName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, companyName: e.target.value }))
                  }
                  placeholder="Company / Organisation"
                />
              </div>
              <div>
                <Label>Company GST (optional)</Label>
                <Input
                  value={form.companyGst}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, companyGst: e.target.value }))
                  }
                  placeholder="22AAAAA0000A1Z5"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Event Date</Label>
                <Input
                  type="date"
                  value={form.eventDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, eventDate: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Guest Count</Label>
                <Input
                  type="number"
                  value={form.guestCount || ""}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      guestCount: Number(e.target.value),
                    }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Per Plate (₹)</Label>
                <Input
                  type="number"
                  value={form.perPlate || ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, perPlate: Number(e.target.value) }))
                  }
                />
              </div>
              <div>
                <Label>Extra Charges (₹)</Label>
                <Input
                  type="number"
                  value={form.extra || ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, extra: Number(e.target.value) }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>GST %</Label>
                <Select
                  value={String(form.gstPct)}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, gstPct: Number(v) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5%</SelectItem>
                    <SelectItem value="12">12%</SelectItem>
                    <SelectItem value="18">18%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Payment Mode</Label>
                <Select
                  value={form.paymentMode}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, paymentMode: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) =>
                  setForm((p) => ({ ...p, notes: e.target.value }))
                }
                rows={2}
              />
            </div>
            <div className="bg-gray-50 rounded p-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span>
                  Food ({form.guestCount}×{fmt(form.perPlate)})
                </span>
                <span>{fmt(form.guestCount * form.perPlate)}</span>
              </div>
              <div className="flex justify-between">
                <span>Extra Charges</span>
                <span>{fmt(form.extra)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST ({form.gstPct}%)</span>
                <span>{fmt(gst)}</span>
              </div>
              <div className="flex justify-between font-bold border-t pt-1">
                <span>TOTAL</span>
                <span>{fmt(total)}</span>
              </div>
            </div>
            <Button className="w-full" onClick={generate}>
              Generate Invoice
            </Button>
          </CardContent>
        </Card>
        <div>
          <h3 className="font-semibold mb-2">Invoice History</h3>
          <div className="space-y-2">
            {banquetBills
              .sort((a, b) => b.createdAt - a.createdAt)
              .map((b) => (
                <Card
                  key={b.id}
                  className="cursor-pointer hover:shadow-md"
                  onClick={() => setShowInv(b)}
                >
                  <CardContent className="pt-3 pb-3">
                    <div className="flex justify-between">
                      <div>
                        <div className="font-semibold">{b.eventName}</div>
                        <div className="text-xs text-gray-600">
                          {b.hall} · {b.eventDate} · {b.guestCount} guests
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{fmt(b.total)}</div>
                        <div className="text-xs text-gray-600">{b.id}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            {banquetBills.length === 0 && (
              <p className="text-gray-600 text-sm text-center py-8">
                No banquet invoices yet
              </p>
            )}
          </div>
        </div>
      </div>
      {showInv && (
        <Dialog open onOpenChange={() => setShowInv(null)}>
          <DialogContent className="max-w-sm">
            <div className="p-4 text-sm font-mono">
              <div className="text-center mb-3">
                <div className="text-lg font-bold">HOTEL KDM PALACE</div>
                <div className="font-semibold">BANQUET INVOICE</div>
                <div className="text-xs mt-1">Invoice #: {showInv.id}</div>
              </div>
              <div className="space-y-1 text-xs">
                <div>
                  <b>Event:</b> {showInv.eventName}
                </div>
                <div>
                  <b>Hall:</b> {showInv.hall}
                </div>
                <div>
                  <b>Date:</b> {showInv.eventDate}
                </div>
                <div>
                  <b>Contact:</b> {showInv.contactName} | {showInv.contactPhone}
                </div>
                <div>
                  <b>Guests:</b> {showInv.guestCount}
                </div>
              </div>
              <div className="border-t mt-2 pt-2 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>
                    Food ({showInv.guestCount}×{fmt(showInv.perPlate)})
                  </span>
                  <span>{fmt(showInv.guestCount * showInv.perPlate)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Extra</span>
                  <span>{fmt(showInv.extra)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST ({showInv.gstPct}%)</span>
                  <span>
                    {fmt(
                      showInv.total -
                        showInv.guestCount * showInv.perPlate -
                        showInv.extra,
                    )}
                  </span>
                </div>
                <div className="flex justify-between font-bold border-t pt-1">
                  <span>TOTAL</span>
                  <span>{fmt(showInv.total)}</span>
                </div>
              </div>
              {showInv.notes && (
                <div className="text-xs mt-2 italic">{showInv.notes}</div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowInv(null)}>
                Close
              </Button>
              <Button onClick={() => window.print()}>🖨 Print</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function BanquetReservations({
  reservations,
  setReservations,
}: {
  reservations: BanquetReservation[];
  setReservations: (
    v:
      | BanquetReservation[]
      | ((p: BanquetReservation[]) => BanquetReservation[]),
  ) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<{
    hall: string;
    eventType: string;
    date: string;
    time: string;
    guestCount: number;
    contactName: string;
    contactPhone: string;
    special: string;
    status: BanquetReservation["status"];
  }>({
    hall: "Maharaja Hall",
    eventType: "Wedding",
    date: today(),
    time: "18:00",
    guestCount: 0,
    contactName: "",
    contactPhone: "",
    special: "",
    status: "confirmed",
  });
  const halls = ["Maharaja Hall", "Rajwada Hall", "Garden Terrace"];
  const eventTypes = ["Wedding", "Corporate", "Birthday", "Social"];
  const statusBadge = (s: string) =>
    ({
      confirmed: "bg-green-100 text-green-700",
      tentative: "bg-yellow-100 text-yellow-700",
      cancelled: "bg-red-100 text-red-700",
    })[s] ?? "";
  const save = () => {
    if (!form.contactName) return;
    setReservations((prev) => [...prev, { id: uid(), ...form }]);
    setShowForm(false);
    toast.success("Reservation added!");
  };
  const updateStatus = (id: string, status: BanquetReservation["status"]) =>
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r)),
    );
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Banquet Reservations</h2>
        <Button onClick={() => setShowForm(true)}>+ Add Reservation</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="text-left p-3">Date</th>
              <th className="text-left p-3">Hall</th>
              <th className="text-left p-3">Event</th>
              <th className="text-left p-3">Guests</th>
              <th className="text-left p-3">Contact</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reservations
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((r) => (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    {r.date} {r.time}
                  </td>
                  <td className="p-3">{r.hall}</td>
                  <td className="p-3">{r.eventType}</td>
                  <td className="p-3">{r.guestCount}</td>
                  <td className="p-3">
                    {r.contactName}
                    <br />
                    <span className="text-xs text-gray-600">
                      {r.contactPhone}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${statusBadge(r.status)}`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <Select
                      value={r.status}
                      onValueChange={(v) =>
                        updateStatus(r.id, v as BanquetReservation["status"])
                      }
                    >
                      <SelectTrigger className="h-7 w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="tentative">Tentative</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
            {reservations.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-600">
                  No reservations yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {showForm && (
        <Dialog open onOpenChange={() => setShowForm(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Banquet Reservation</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Hall</Label>
                <Select
                  value={form.hall}
                  onValueChange={(v) => setForm((p) => ({ ...p, hall: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {halls.map((h) => (
                      <SelectItem key={h} value={h}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Event Type</Label>
                <Select
                  value={form.eventType}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, eventType: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, date: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={form.time}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, time: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Guest Count</Label>
                <Input
                  type="number"
                  value={form.guestCount || ""}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      guestCount: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Contact Name</Label>
                  <Input
                    value={form.contactName}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, contactName: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={form.contactPhone}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, contactPhone: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Special Requests</Label>
                <Textarea
                  value={form.special}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, special: e.target.value }))
                  }
                  rows={2}
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm((p) => ({
                      ...p,
                      status: v as BanquetReservation["status"],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="tentative">Tentative</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={save}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function Customers({
  customers,
  setCustomers,
}: {
  customers: Customer[];
  setCustomers: (v: Customer[] | ((p: Customer[]) => Customer[])) => void;
}) {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Customer>>({});
  const [editId, setEditId] = useState<string | null>(null);
  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search),
  );
  const openEdit = (c: Customer) => {
    setForm({ ...c });
    setEditId(c.id);
    setShowForm(true);
  };
  const openNew = () => {
    setForm({});
    setEditId(null);
    setShowForm(true);
  };
  const save = () => {
    if (!form.name || !form.phone) return;
    const c: Customer = {
      id: editId ?? uid(),
      name: form.name!,
      phone: form.phone!,
      email: form.email,
      address: form.address,
      totalSpend: Number(form.totalSpend ?? 0),
      visits: Number(form.visits ?? 0),
      loyaltyPoints: Number(form.loyaltyPoints ?? 0),
    };
    if (editId)
      setCustomers((prev) => prev.map((x) => (x.id === c.id ? c : x)));
    else setCustomers((prev) => [...prev, c]);
    setShowForm(false);
  };
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Customers</h2>
        <Button onClick={openNew}>+ Add Customer</Button>
      </div>
      <Input
        className="mb-4 max-w-xs"
        placeholder="Search by name or phone..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Phone</th>
              <th className="text-left p-3">Email</th>
              <th className="text-right p-3">Total Spend</th>
              <th className="text-right p-3">Visits</th>
              <th className="text-right p-3">Points</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-semibold">{c.name}</td>
                <td className="p-3">{c.phone}</td>
                <td className="p-3 text-gray-700">{c.email ?? "-"}</td>
                <td className="p-3 text-right">{fmt(c.totalSpend)}</td>
                <td className="p-3 text-right">{c.visits}</td>
                <td className="p-3 text-right">{c.loyaltyPoints}</td>
                <td className="p-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEdit(c)}
                  >
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-600">
                  No customers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {showForm && (
        <Dialog open onOpenChange={() => setShowForm(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editId ? "Edit" : "Add"} Customer</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Name</Label>
                <Input
                  value={form.name ?? ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={form.phone ?? ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, phone: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  value={form.email ?? ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, email: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Address</Label>
                <Input
                  value={form.address ?? ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, address: e.target.value }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={save}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function Inventory({
  inventory,
  setInventory,
}: {
  inventory: InventoryItem[];
  setInventory: (
    v: InventoryItem[] | ((p: InventoryItem[]) => InventoryItem[]),
  ) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<InventoryItem>>({});
  const [editId, setEditId] = useState<string | null>(null);
  const openEdit = (i: InventoryItem) => {
    setForm({ ...i });
    setEditId(i.id);
    setShowForm(true);
  };
  const openNew = () => {
    setForm({});
    setEditId(null);
    setShowForm(true);
  };
  const save = () => {
    if (!form.name) return;
    const item: InventoryItem = {
      id: editId ?? uid(),
      name: form.name!,
      unit: form.unit ?? "kg",
      stock: Number(form.stock ?? 0),
      reorder: Number(form.reorder ?? 0),
      cost: Number(form.cost ?? 0),
    };
    if (editId)
      setInventory((prev) => prev.map((x) => (x.id === item.id ? item : x)));
    else setInventory((prev) => [...prev, item]);
    setShowForm(false);
  };
  const stockStatus = (i: InventoryItem) =>
    i.stock <= 0
      ? { label: "Critical", cls: "bg-red-100 text-red-700" }
      : i.stock <= i.reorder
        ? { label: "Low", cls: "bg-yellow-100 text-yellow-700" }
        : { label: "OK", cls: "bg-green-100 text-green-700" };
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Inventory</h2>
        <Button onClick={openNew}>+ Add Item</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="text-left p-3">Item</th>
              <th className="text-left p-3">Unit</th>
              <th className="text-right p-3">Stock</th>
              <th className="text-right p-3">Reorder Level</th>
              <th className="text-right p-3">Cost/Unit</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((i) => {
              const ss = stockStatus(i);
              return (
                <tr key={i.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-semibold">{i.name}</td>
                  <td className="p-3">{i.unit}</td>
                  <td className="p-3 text-right">{i.stock}</td>
                  <td className="p-3 text-right">{i.reorder}</td>
                  <td className="p-3 text-right">{fmt(i.cost)}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${ss.cls}`}
                    >
                      {ss.label}
                    </span>
                  </td>
                  <td className="p-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEdit(i)}
                    >
                      Edit
                    </Button>
                  </td>
                </tr>
              );
            })}
            {inventory.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-600">
                  No inventory items
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {showForm && (
        <Dialog open onOpenChange={() => setShowForm(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editId ? "Edit" : "Add"} Inventory Item
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Item Name</Label>
                <Input
                  value={form.name ?? ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Unit</Label>
                <Input
                  value={form.unit ?? ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, unit: e.target.value }))
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label>Stock</Label>
                  <Input
                    type="number"
                    value={form.stock ?? ""}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, stock: Number(e.target.value) }))
                    }
                  />
                </div>
                <div>
                  <Label>Reorder At</Label>
                  <Input
                    type="number"
                    value={form.reorder ?? ""}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        reorder: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>Cost/Unit</Label>
                  <Input
                    type="number"
                    value={form.cost ?? ""}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, cost: Number(e.target.value) }))
                    }
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={save}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function Expenses({
  expenses,
  setExpenses,
}: {
  expenses: Expense[];
  setExpenses: (v: Expense[] | ((p: Expense[]) => Expense[])) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    date: today(),
    category: "Groceries",
    description: "",
    amount: 0,
    mode: "cash",
  });
  const save = () => {
    if (!form.description || !form.amount) return;
    setExpenses((prev) => [
      ...prev,
      { id: uid(), ...form, amount: Number(form.amount) },
    ]);
    setShowForm(false);
    toast.success("Expense added");
  };
  const todayExp = expenses
    .filter((e) => e.date === today())
    .reduce((s, e) => s + e.amount, 0);
  const cats = [
    "Groceries",
    "Utilities",
    "Staff",
    "Maintenance",
    "Marketing",
    "Other",
  ];
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Expenses</h2>
        <Button onClick={() => setShowForm(true)}>+ Add Expense</Button>
      </div>
      <Card className="mb-4 max-w-xs">
        <CardContent className="pt-4">
          <div className="text-sm text-gray-700">Today's Total Expenses</div>
          <div className="text-2xl font-bold text-red-600">{fmt(todayExp)}</div>
        </CardContent>
      </Card>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="text-left p-3">Date</th>
              <th className="text-left p-3">Category</th>
              <th className="text-left p-3">Description</th>
              <th className="text-right p-3">Amount</th>
              <th className="text-left p-3">Mode</th>
            </tr>
          </thead>
          <tbody>
            {expenses
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((e) => (
                <tr key={e.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{e.date}</td>
                  <td className="p-3">
                    <Badge variant="outline">{e.category}</Badge>
                  </td>
                  <td className="p-3">{e.description}</td>
                  <td className="p-3 text-right text-red-600 font-semibold">
                    {fmt(e.amount)}
                  </td>
                  <td className="p-3">{e.mode.toUpperCase()}</td>
                </tr>
              ))}
            {expenses.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-600">
                  No expenses recorded
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {showForm && (
        <Dialog open onOpenChange={() => setShowForm(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Expense</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, date: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {cats.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Amount (₹)</Label>
                <Input
                  type="number"
                  value={form.amount || ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, amount: Number(e.target.value) }))
                  }
                />
              </div>
              <div>
                <Label>Payment Mode</Label>
                <Select
                  value={form.mode}
                  onValueChange={(v) => setForm((p) => ({ ...p, mode: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={save}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function ReceiptRegister({
  receipts,
  setReceipts,
}: {
  receipts: Receipt[];
  setReceipts: (v: Receipt[] | ((p: Receipt[]) => Receipt[])) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    date: today(),
    source: "",
    amount: 0,
    mode: "cash",
    note: "",
  });
  const save = () => {
    if (!form.source || !form.amount) return;
    setReceipts((prev) => [
      ...prev,
      { id: uid(), ...form, amount: Number(form.amount) },
    ]);
    setShowForm(false);
    toast.success("Receipt added");
  };
  const total = receipts.reduce((s, r) => s + r.amount, 0);
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Receipt Register</h2>
        <Button onClick={() => setShowForm(true)}>+ Add Receipt</Button>
      </div>
      <Card className="mb-4 max-w-xs">
        <CardContent className="pt-4">
          <div className="text-sm text-gray-700">Total Receipts</div>
          <div className="text-2xl font-bold text-green-600">{fmt(total)}</div>
        </CardContent>
      </Card>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="text-left p-3">Date</th>
              <th className="text-left p-3">Source</th>
              <th className="text-right p-3">Amount</th>
              <th className="text-left p-3">Mode</th>
              <th className="text-left p-3">Note</th>
            </tr>
          </thead>
          <tbody>
            {receipts
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((r) => (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{r.date}</td>
                  <td className="p-3 font-semibold">{r.source}</td>
                  <td className="p-3 text-right text-green-600 font-semibold">
                    {fmt(r.amount)}
                  </td>
                  <td className="p-3">{r.mode.toUpperCase()}</td>
                  <td className="p-3 text-gray-700">{r.note ?? "-"}</td>
                </tr>
              ))}
            {receipts.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-600">
                  No receipts yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {showForm && (
        <Dialog open onOpenChange={() => setShowForm(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Receipt</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, date: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Source</Label>
                <Input
                  value={form.source}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, source: e.target.value }))
                  }
                  placeholder="e.g. Table T5, Banquet BB001"
                />
              </div>
              <div>
                <Label>Amount (₹)</Label>
                <Input
                  type="number"
                  value={form.amount || ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, amount: Number(e.target.value) }))
                  }
                />
              </div>
              <div>
                <Label>Payment Mode</Label>
                <Select
                  value={form.mode}
                  onValueChange={(v) => setForm((p) => ({ ...p, mode: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Note</Label>
                <Input
                  value={form.note}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, note: e.target.value }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={save}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function DueManagement({
  dues,
  setDues,
}: { dues: Due[]; setDues: (v: Due[] | ((p: Due[]) => Due[])) => void }) {
  const [filter, setFilter] = useState<"all" | "unpaid" | "paid">("unpaid");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    customerName: "",
    amount: 0,
    description: "",
    dueDate: today(),
  });
  const save = () => {
    if (!form.customerName || !form.amount) return;
    setDues((prev) => [
      ...prev,
      { id: uid(), ...form, amount: Number(form.amount), isPaid: false },
    ]);
    setShowForm(false);
    toast.success("Due added");
  };
  const markPaid = (id: string) => {
    setDues((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isPaid: true } : d)),
    );
    toast.success("Marked as paid");
  };
  const filtered = dues.filter((d) =>
    filter === "all" ? true : filter === "paid" ? d.isPaid : !d.isPaid,
  );
  const totalDue = dues
    .filter((d) => !d.isPaid)
    .reduce((s, d) => s + d.amount, 0);
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Due Management</h2>
        <Button onClick={() => setShowForm(true)}>+ Add Due</Button>
      </div>
      <div className="flex gap-3 mb-4 items-center">
        {(["all", "unpaid", "paid"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${filter === f ? "bg-[#0d2137] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <span className="ml-auto text-sm">
          Outstanding:{" "}
          <span className="font-bold text-red-600">{fmt(totalDue)}</span>
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="text-left p-3">Customer</th>
              <th className="text-left p-3">Description</th>
              <th className="text-right p-3">Amount</th>
              <th className="text-left p-3">Due Date</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
              <tr
                key={d.id}
                className={`border-b hover:bg-gray-50 ${!d.isPaid && new Date(d.dueDate) < new Date() ? "bg-red-50" : ""}`}
              >
                <td className="p-3 font-semibold">{d.customerName}</td>
                <td className="p-3">{d.description}</td>
                <td className="p-3 text-right font-semibold">
                  {fmt(d.amount)}
                </td>
                <td className="p-3">{d.dueDate}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${d.isPaid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                  >
                    {d.isPaid ? "Paid" : "Unpaid"}
                  </span>
                </td>
                <td className="p-3">
                  {!d.isPaid && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => markPaid(d.id)}
                    >
                      Mark Paid
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-600">
                  No dues found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {showForm && (
        <Dialog open onOpenChange={() => setShowForm(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Due</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Customer Name</Label>
                <Input
                  value={form.customerName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, customerName: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Amount (₹)</Label>
                <Input
                  type="number"
                  value={form.amount || ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, amount: Number(e.target.value) }))
                  }
                />
              </div>
              <div>
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, dueDate: e.target.value }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={save}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ── New Restaurant Module Components ─────────────────────────────────────────

function ModuleCard({
  title,
  children,
}: { title: string; children?: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">{title}</h2>
      {children}
    </div>
  );
}

const QR_ORDERS_MOCK = [
  {
    id: "QR001",
    table: "T3",
    items: "Paneer Butter Masala x2, Roti x4",
    amount: 580,
    time: "12:34 PM",
    status: "Received",
  },
  {
    id: "QR002",
    table: "T7",
    items: "Chicken Biryani x1, Raita x1",
    amount: 420,
    time: "1:15 PM",
    status: "Cooking",
  },
  {
    id: "QR003",
    table: "T11",
    items: "Dal Makhani x1, Naan x3",
    amount: 310,
    time: "2:02 PM",
    status: "Served",
  },
];

function QRMenuOrders() {
  const [qrUrl, setQrUrl] = useLS<string>(
    "restaurant_qr_url",
    "https://kdmpalace.in/menu",
  );
  const [orders, setOrders] = useLS<typeof QR_ORDERS_MOCK>(
    "restaurant_qr_orders",
    QR_ORDERS_MOCK,
  );

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrUrl)}`;
    a.download = "kdm-menu-qr.png";
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <ModuleCard title="QR Menu & Orders">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
          <p className="text-sm font-medium text-gray-700 mb-4">
            Restaurant QR Menu Code
          </p>
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(qrUrl)}`}
            alt="QR Code"
            className="w-40 h-40 mx-auto rounded-lg border border-amber-200"
          />
          <p className="text-xs text-gray-600 mt-3">
            Scan to view digital menu & order
          </p>
          <div className="mt-4 space-y-2">
            <div>
              <p className="text-xs text-gray-700 mb-1 text-left">Target URL</p>
              <input
                className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm"
                value={qrUrl}
                onChange={(e) => setQrUrl(e.target.value)}
                placeholder="https://kdmpalace.in/menu"
                data-ocid="qr_menu.url.input"
              />
            </div>
            <button
              type="button"
              className="w-full py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors"
              onClick={handleDownload}
              data-ocid="qr_menu.download.button"
            >
              ⬇ Download QR Code
            </button>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm font-semibold text-gray-700 mb-4">
            Live QR Orders
          </p>
          <div className="space-y-3">
            {orders.length === 0 && (
              <p
                className="text-sm text-gray-500 text-center py-4"
                data-ocid="qr_menu.empty_state"
              >
                No pending QR orders
              </p>
            )}
            {orders.map((o, i) => (
              <div
                key={o.id}
                className="p-3 bg-gray-50 rounded-lg"
                data-ocid={`qr_menu.item.${i + 1}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {o.table} — {o.id}
                    </p>
                    <p className="text-xs text-gray-700 mt-0.5">{o.items}</p>
                    <p className="text-xs text-gray-600">{o.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-800">
                      ₹{o.amount}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${o.status === "Received" ? "bg-blue-100 text-blue-700" : o.status === "Cooking" ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"}`}
                    >
                      {o.status}
                    </span>
                  </div>
                </div>
                {o.status === "Received" && (
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      className="flex-1 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                      onClick={() =>
                        setOrders((p) => p.filter((x) => x.id !== o.id))
                      }
                      data-ocid={`qr_menu.accept.button.${i + 1}`}
                    >
                      ✓ Accept
                    </button>
                    <button
                      type="button"
                      className="flex-1 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                      onClick={() =>
                        setOrders((p) => p.filter((x) => x.id !== o.id))
                      }
                      data-ocid={`qr_menu.reject.button.${i + 1}`}
                    >
                      ✗ Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </ModuleCard>
  );
}

const MOCK_PLATFORM_ORDERS = [
  {
    id: "PO001",
    table: "Online",
    items: "Butter Chicken x2, Naan x4",
    amount: 680,
    status: "New",
  },
  {
    id: "PO002",
    table: "Online",
    items: "Biryani x1, Raita x1",
    amount: 320,
    status: "Preparing",
  },
  {
    id: "PO003",
    table: "Online",
    items: "Paneer Tikka x1, Lassi x2",
    amount: 480,
    status: "Delivered",
  },
];

function ZomatoSwiggy() {
  const [zomatoCfg, setZomatoCfg] = useLS("zomato_config", {
    restaurantId: "",
    apiKey: "",
  });
  const [swigyCfg, setSwigyCfg] = useLS("swiggy_config", {
    restaurantId: "",
    apiKey: "",
  });
  const [showZOrders, setShowZOrders] = useState(false);
  const [showSOrders, setShowSOrders] = useState(false);
  const [showZConfig, setShowZConfig] = useState(false);
  const [showSConfig, setShowSConfig] = useState(false);
  const [zSyncing, setZSyncing] = useState(false);
  const [sSyncing, setSSyncing] = useState(false);
  const [zSaved, setZSaved] = useState(false);
  const [sSaved, setSSaved] = useState(false);
  const [platformOrders, setPlatformOrders] = useState(MOCK_PLATFORM_ORDERS);

  const syncMenu = (platform: "z" | "s") => {
    if (platform === "z") {
      setZSyncing(true);
      setTimeout(() => setZSyncing(false), 1500);
    } else {
      setSSyncing(true);
      setTimeout(() => setSSyncing(false), 1500);
    }
  };

  const saveConfig = (platform: "z" | "s") => {
    if (platform === "z") {
      setZSaved(true);
      setTimeout(() => setZSaved(false), 2000);
    } else {
      setSSaved(true);
      setTimeout(() => setSSaved(false), 2000);
    }
  };

  const platforms = [
    {
      name: "Zomato",
      icon: "🍕",
      orders: 24,
      revenue: 8640,
      rating: 4.2,
      status: "Connected",
      cfg: zomatoCfg,
      setCfg: setZomatoCfg,
      showOrders: showZOrders,
      setShowOrders: setShowZOrders,
      showConfig: showZConfig,
      setShowConfig: setShowZConfig,
      syncing: zSyncing,
      saved: zSaved,
      key: "z" as const,
    },
    {
      name: "Swiggy",
      icon: "🛵",
      orders: 18,
      revenue: 6300,
      rating: 4.1,
      status: "Connected",
      cfg: swigyCfg,
      setCfg: setSwigyCfg,
      showOrders: showSOrders,
      setShowOrders: setShowSOrders,
      showConfig: showSConfig,
      setShowConfig: setShowSConfig,
      syncing: sSyncing,
      saved: sSaved,
      key: "s" as const,
    },
  ];

  return (
    <ModuleCard title="Zomato & Swiggy Integration">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {platforms.map((p) => (
          <div
            key={p.name}
            className="bg-white border border-gray-200 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{p.icon}</span>
                <div>
                  <h3 className="font-bold text-gray-800">{p.name}</h3>
                  <span className="text-xs text-green-600 font-medium">
                    ● {p.status}
                  </span>
                </div>
              </div>
              <span className="text-sm bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-medium">
                ★ {p.rating}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-gray-800">{p.orders}</p>
                <p className="text-xs text-gray-700">Today's Orders</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-gray-800">
                  ₹{p.revenue.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-gray-700">Today's Revenue</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
              <button
                type="button"
                className="flex-1 py-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                onClick={() => p.setShowOrders(!p.showOrders)}
                data-ocid={`zs.${p.name.toLowerCase()}.view_orders.button`}
              >
                {p.showOrders ? "Hide Orders" : "View Orders"}
              </button>
              <button
                type="button"
                className="flex-1 py-2 text-xs bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
                onClick={() => syncMenu(p.key)}
                data-ocid={`zs.${p.name.toLowerCase()}.sync.button`}
              >
                {p.syncing
                  ? "⏳ Syncing..."
                  : p.syncing === false && "✓ Menu Synced"
                    ? "✓ Menu Synced"
                    : "Sync Menu"}
              </button>
            </div>
            {p.showOrders && (
              <div className="mt-3 space-y-2">
                {platformOrders.map((o, i) => (
                  <div
                    key={o.id}
                    className="p-2 bg-gray-50 rounded text-xs"
                    data-ocid={`zs.order.item.${i + 1}`}
                  >
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-gray-800">
                        {o.items}
                      </span>
                      <span className="font-bold">₹{o.amount}</span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <span
                        className={`px-2 py-0.5 rounded-full ${o.status === "New" ? "bg-blue-100 text-blue-700" : o.status === "Preparing" ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"}`}
                      >
                        {o.status}
                      </span>
                      {o.status === "New" && (
                        <>
                          <button
                            type="button"
                            className="px-2 py-0.5 bg-green-500 text-white rounded hover:bg-green-600"
                            onClick={() =>
                              setPlatformOrders((prev) =>
                                prev.filter((x) => x.id !== o.id),
                              )
                            }
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            className="px-2 py-0.5 bg-red-500 text-white rounded hover:bg-red-600"
                            onClick={() =>
                              setPlatformOrders((prev) =>
                                prev.filter((x) => x.id !== o.id),
                              )
                            }
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3 border-t border-gray-100 pt-3">
              <button
                type="button"
                className="text-xs text-amber-600 hover:underline font-medium"
                onClick={() => p.setShowConfig(!p.showConfig)}
                data-ocid={`zs.${p.name.toLowerCase()}.config.toggle`}
              >
                ⚙ {p.showConfig ? "Hide" : "Show"} API Configuration
              </button>
              {p.showConfig && (
                <div className="mt-2 space-y-2">
                  <input
                    className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm"
                    placeholder="Restaurant ID"
                    value={p.cfg.restaurantId}
                    onChange={(e) =>
                      p.setCfg(
                        (prev: { restaurantId: string; apiKey: string }) => ({
                          ...prev,
                          restaurantId: e.target.value,
                        }),
                      )
                    }
                    data-ocid={`zs.${p.name.toLowerCase()}.restaurant_id.input`}
                  />
                  <input
                    className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm"
                    placeholder="API Key"
                    type="password"
                    value={p.cfg.apiKey}
                    onChange={(e) =>
                      p.setCfg(
                        (prev: { restaurantId: string; apiKey: string }) => ({
                          ...prev,
                          apiKey: e.target.value,
                        }),
                      )
                    }
                    data-ocid={`zs.${p.name.toLowerCase()}.api_key.input`}
                  />
                  <button
                    type="button"
                    className="px-4 py-1.5 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                    onClick={() => saveConfig(p.key)}
                    data-ocid={`zs.${p.name.toLowerCase()}.save.button`}
                  >
                    {p.saved ? "✓ Saved!" : "Save Config"}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </ModuleCard>
  );
}

interface LoyaltyCustomer {
  id: string;
  name: string;
  phone: string;
  points: number;
  tier: string;
  visits: number;
}
const DEFAULT_LOYALTY: LoyaltyCustomer[] = [
  {
    id: "LC001",
    name: "Amit Sharma",
    phone: "9876543210",
    points: 1250,
    tier: "Gold",
    visits: 18,
  },
  {
    id: "LC002",
    name: "Priya Singh",
    phone: "9876543211",
    points: 780,
    tier: "Silver",
    visits: 11,
  },
  {
    id: "LC003",
    name: "Ravi Kumar",
    phone: "9876543212",
    points: 350,
    tier: "Bronze",
    visits: 5,
  },
];

function RedeemPoints({
  customerId,
  points,
  setCustomers,
}: {
  customerId: string;
  points: number;
  setCustomers: (fn: (p: LoyaltyCustomer[]) => LoyaltyCustomer[]) => void;
}) {
  const [show, setShow] = useState(false);
  const [amount, setAmount] = useState("");
  return show ? (
    <div className="flex items-center gap-1 mt-1">
      <input
        className="border border-gray-200 rounded px-2 py-0.5 text-xs w-20"
        type="number"
        placeholder="pts"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button
        type="button"
        className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded"
        onClick={() => {
          const redeemPts = Math.min(Number(amount), points);
          setCustomers((p) =>
            p.map((c) =>
              c.id === customerId ? { ...c, points: c.points - redeemPts } : c,
            ),
          );
          setShow(false);
          setAmount("");
        }}
      >
        OK
      </button>
      <button
        type="button"
        className="text-gray-800 font-bold text-lg hover:text-red-600 leading-none px-2"
        onClick={() => setShow(false)}
      >
        ✕
      </button>
    </div>
  ) : (
    <button
      type="button"
      className="text-xs text-amber-600 hover:underline"
      onClick={() => setShow(true)}
    >
      Redeem pts
    </button>
  );
}

function LoyaltyCRM() {
  const [customers, setCustomers] = useLS<LoyaltyCustomer[]>(
    "restaurant_loyalty",
    DEFAULT_LOYALTY,
  );
  const [form, setForm] = useState({ name: "", phone: "", points: "" });
  return (
    <ModuleCard title="Loyalty & CRM">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Members", value: customers.length, color: "blue" },
          {
            label: "Total Points Issued",
            value: customers
              .reduce((s, c) => s + c.points, 0)
              .toLocaleString("en-IN"),
            color: "amber",
          },
          {
            label: "Avg Points",
            value: Math.round(
              customers.reduce((s, c) => s + c.points, 0) /
                Math.max(customers.length, 1),
            ),
            color: "green",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white border border-gray-200 rounded-lg p-4"
          >
            <p className="text-xs text-gray-700">{s.label}</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-semibold text-gray-700">Loyalty Members</h3>
          <div className="flex gap-2 flex-wrap">
            <input
              className="border border-gray-200 rounded px-3 py-1.5 text-sm"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
            <input
              className="border border-gray-200 rounded px-3 py-1.5 text-sm"
              placeholder="Phone"
              value={form.phone}
              onChange={(e) =>
                setForm((p) => ({ ...p, phone: e.target.value }))
              }
            />
            <input
              className="border border-gray-200 rounded px-3 py-1.5 text-sm w-24"
              placeholder="Points"
              type="number"
              value={form.points}
              onChange={(e) =>
                setForm((p) => ({ ...p, points: e.target.value }))
              }
            />
            <button
              type="button"
              className="px-4 py-1.5 bg-amber-500 text-white rounded text-sm"
              onClick={() => {
                if (form.name && form.phone) {
                  setCustomers((p) => [
                    ...p,
                    {
                      id: `LC${Date.now()}`,
                      name: form.name,
                      phone: form.phone,
                      points: Number(form.points) || 0,
                      tier: "Bronze",
                      visits: 1,
                    },
                  ]);
                  setForm({ name: "", phone: "", points: "" });
                }
              }}
            >
              + Add
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "ID",
                  "Name",
                  "Phone",
                  "Points",
                  "Tier",
                  "Visits",
                  "Action",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs text-gray-700 font-medium"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customers.map((c, i) => {
                const tier =
                  c.points >= 1500
                    ? "Gold"
                    : c.points >= 500
                      ? "Silver"
                      : "Bronze";
                return (
                  <tr
                    key={c.id}
                    className="border-t border-gray-100 hover:bg-gray-50"
                    data-ocid={`loyalty.item.${i + 1}`}
                  >
                    <td className="px-4 py-3 text-gray-700">{c.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {c.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{c.phone}</td>
                    <td className="px-4 py-3 font-bold text-amber-600">
                      {c.points.toLocaleString("en-IN")}
                      <div className="mt-1">
                        <RedeemPoints
                          customerId={c.id}
                          points={c.points}
                          setCustomers={setCustomers}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-bold ${tier === "Gold" ? "bg-amber-100 text-amber-700" : tier === "Silver" ? "bg-gray-200 text-gray-700" : "bg-orange-100 text-orange-700"}`}
                      >
                        {tier === "Gold"
                          ? "🥇"
                          : tier === "Silver"
                            ? "🥈"
                            : "🥉"}{" "}
                        {tier}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{c.visits}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className="text-red-500 text-xs hover:underline"
                        onClick={() =>
                          setCustomers((p) => p.filter((x) => x.id !== c.id))
                        }
                        data-ocid={`loyalty.delete_button.${i + 1}`}
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </ModuleCard>
  );
}

interface GiftCard {
  id: string;
  code: string;
  amount: number;
  balance: number;
  issuedTo: string;
  issuedDate: string;
  status: string;
}
const DEFAULT_GIFT_CARDS: GiftCard[] = [
  {
    id: "GC001",
    code: "KDM-1234",
    amount: 1000,
    balance: 650,
    issuedTo: "Sunita Devi",
    issuedDate: "2026-03-01",
    status: "Active",
  },
  {
    id: "GC002",
    code: "KDM-5678",
    amount: 500,
    balance: 0,
    issuedTo: "Rajesh Gupta",
    issuedDate: "2026-02-15",
    status: "Redeemed",
  },
  {
    id: "GC003",
    code: "KDM-9012",
    amount: 2000,
    balance: 2000,
    issuedTo: "Meera Sharma",
    issuedDate: "2026-03-20",
    status: "Active",
  },
];

function GiftCardRow({
  card: c,
  index: i,
  setCards,
}: {
  card: GiftCard;
  index: number;
  setCards: (fn: (p: GiftCard[]) => GiftCard[]) => void;
}) {
  const [showRedeem, setShowRedeem] = useState(false);
  const [redeemAmt, setRedeemAmt] = useState("");
  return (
    <tr
      className="border-t border-gray-100 hover:bg-gray-50"
      data-ocid={`gift_cards.item.${i + 1}`}
    >
      <td className="px-4 py-3 font-mono font-bold text-amber-600">{c.code}</td>
      <td className="px-4 py-3 text-gray-800">{c.issuedTo}</td>
      <td className="px-4 py-3 text-gray-600">
        ₹{c.amount.toLocaleString("en-IN")}
      </td>
      <td className="px-4 py-3 font-bold text-green-600">
        ₹{c.balance.toLocaleString("en-IN")}
      </td>
      <td className="px-4 py-3 text-gray-700">{c.issuedDate}</td>
      <td className="px-4 py-3">
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.status === "Active" ? "bg-green-100 text-green-700" : c.status === "Inactive" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700"}`}
        >
          {c.status}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-1 flex-wrap">
          {c.status === "Active" && !showRedeem && (
            <button
              type="button"
              className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded hover:bg-amber-600"
              onClick={() => setShowRedeem(true)}
              data-ocid={`gift_cards.redeem.button.${i + 1}`}
            >
              Redeem ₹
            </button>
          )}
          {showRedeem && (
            <>
              <input
                className="border border-gray-200 rounded px-2 py-0.5 text-xs w-20"
                type="number"
                placeholder="₹ amt"
                value={redeemAmt}
                onChange={(e) => setRedeemAmt(e.target.value)}
              />
              <button
                type="button"
                className="text-xs bg-green-500 text-white px-2 py-0.5 rounded"
                onClick={() => {
                  const amt = Math.min(Number(redeemAmt), c.balance);
                  const newBalance = c.balance - amt;
                  setCards((p) =>
                    p.map((x) =>
                      x.id === c.id
                        ? {
                            ...x,
                            balance: newBalance,
                            status: newBalance === 0 ? "Redeemed" : x.status,
                          }
                        : x,
                    ),
                  );
                  setShowRedeem(false);
                  setRedeemAmt("");
                }}
              >
                OK
              </button>
              <button
                type="button"
                className="text-xs text-gray-500"
                onClick={() => setShowRedeem(false)}
              >
                ✕
              </button>
            </>
          )}
          {c.status === "Active" && (
            <button
              type="button"
              className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded hover:bg-gray-200"
              onClick={() =>
                setCards((p) =>
                  p.map((x) =>
                    x.id === c.id ? { ...x, status: "Inactive" } : x,
                  ),
                )
              }
              data-ocid={`gift_cards.toggle.${i + 1}`}
            >
              Deactivate
            </button>
          )}
          <button
            type="button"
            className="text-xs text-red-500 px-2 py-0.5 rounded hover:underline"
            onClick={() => setCards((p) => p.filter((x) => x.id !== c.id))}
            data-ocid={`gift_cards.delete_button.${i + 1}`}
          >
            🗑
          </button>
        </div>
      </td>
    </tr>
  );
}

function GiftCards() {
  const [cards, setCards] = useLS<GiftCard[]>(
    "restaurant_gift_cards",
    DEFAULT_GIFT_CARDS,
  );
  const [form, setForm] = useState({ code: "", amount: "", issuedTo: "" });
  return (
    <ModuleCard title="Gift Cards">
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-semibold text-gray-700">Active Gift Cards</h3>
          <div className="flex gap-2 flex-wrap">
            <input
              className="border border-gray-200 rounded px-3 py-1.5 text-sm"
              placeholder="Code (e.g. KDM-1234)"
              value={form.code}
              onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
            />
            <input
              className="border border-gray-200 rounded px-3 py-1.5 text-sm w-28"
              placeholder="Amount ₹"
              type="number"
              value={form.amount}
              onChange={(e) =>
                setForm((p) => ({ ...p, amount: e.target.value }))
              }
            />
            <input
              className="border border-gray-200 rounded px-3 py-1.5 text-sm"
              placeholder="Issued To"
              value={form.issuedTo}
              onChange={(e) =>
                setForm((p) => ({ ...p, issuedTo: e.target.value }))
              }
            />
            <button
              type="button"
              className="px-4 py-1.5 bg-amber-500 text-white rounded text-sm"
              onClick={() => {
                if (form.code && form.amount) {
                  setCards((p) => [
                    ...p,
                    {
                      id: `GC${Date.now()}`,
                      code: form.code,
                      amount: Number(form.amount),
                      balance: Number(form.amount),
                      issuedTo: form.issuedTo,
                      issuedDate: new Date().toISOString().split("T")[0],
                      status: "Active",
                    },
                  ]);
                  setForm({ code: "", amount: "", issuedTo: "" });
                }
              }}
            >
              + Issue Card
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Code",
                  "Issued To",
                  "Amount",
                  "Balance",
                  "Issued Date",
                  "Status",
                  "Action",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs text-gray-700 font-medium"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cards.map((c, i) => (
                <GiftCardRow
                  key={c.id}
                  card={c}
                  index={i}
                  setCards={setCards}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ModuleCard>
  );
}

interface Coupon {
  id: string;
  code: string;
  discount: number;
  type: "%" | "₹";
  minOrder: number;
  expiry: string;
  usedCount: number;
  status: string;
}
const DEFAULT_COUPONS: Coupon[] = [
  {
    id: "CP001",
    code: "WELCOME20",
    discount: 20,
    type: "%",
    minOrder: 300,
    expiry: "2026-06-30",
    usedCount: 45,
    status: "Active",
  },
  {
    id: "CP002",
    code: "FLAT100",
    discount: 100,
    type: "₹",
    minOrder: 500,
    expiry: "2026-04-30",
    usedCount: 28,
    status: "Active",
  },
  {
    id: "CP003",
    code: "DINE15",
    discount: 15,
    type: "%",
    minOrder: 200,
    expiry: "2026-03-31",
    usedCount: 62,
    status: "Expired",
  },
];

function CouponManagement() {
  const [coupons, setCoupons] = useLS<Coupon[]>(
    "restaurant_coupons",
    DEFAULT_COUPONS,
  );
  const [form, setForm] = useState({
    code: "",
    discount: "",
    type: "%" as "%" | "₹",
    minOrder: "",
    expiry: "",
  });
  return (
    <ModuleCard title="Coupon Management">
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-wrap gap-2 items-end">
            <div>
              <p className="text-xs text-gray-700 mb-1">Code</p>
              <input
                className="border border-gray-200 rounded px-3 py-1.5 text-sm"
                placeholder="WELCOME20"
                value={form.code}
                onChange={(e) =>
                  setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))
                }
              />
            </div>
            <div>
              <p className="text-xs text-gray-700 mb-1">Discount</p>
              <input
                className="border border-gray-200 rounded px-3 py-1.5 text-sm w-24"
                type="number"
                value={form.discount}
                onChange={(e) =>
                  setForm((p) => ({ ...p, discount: e.target.value }))
                }
              />
            </div>
            <div>
              <p className="text-xs text-gray-700 mb-1">Type</p>
              <select
                className="border border-gray-200 rounded px-3 py-1.5 text-sm"
                value={form.type}
                onChange={(e) =>
                  setForm((p) => ({ ...p, type: e.target.value as "%" | "₹" }))
                }
              >
                <option value="%">%</option>
                <option value="₹">₹</option>
              </select>
            </div>
            <div>
              <p className="text-xs text-gray-700 mb-1">Min Order ₹</p>
              <input
                className="border border-gray-200 rounded px-3 py-1.5 text-sm w-28"
                type="number"
                value={form.minOrder}
                onChange={(e) =>
                  setForm((p) => ({ ...p, minOrder: e.target.value }))
                }
              />
            </div>
            <div>
              <p className="text-xs text-gray-700 mb-1">Expiry</p>
              <input
                className="border border-gray-200 rounded px-3 py-1.5 text-sm"
                type="date"
                value={form.expiry}
                onChange={(e) =>
                  setForm((p) => ({ ...p, expiry: e.target.value }))
                }
              />
            </div>
            <button
              type="button"
              className="px-4 py-1.5 bg-amber-500 text-white rounded text-sm h-9"
              onClick={() => {
                if (form.code && form.discount) {
                  setCoupons((p) => [
                    ...p,
                    {
                      id: `CP${Date.now()}`,
                      code: form.code,
                      discount: Number(form.discount),
                      type: form.type,
                      minOrder: Number(form.minOrder),
                      expiry: form.expiry,
                      usedCount: 0,
                      status: "Active",
                    },
                  ]);
                  setForm({
                    code: "",
                    discount: "",
                    type: "%",
                    minOrder: "",
                    expiry: "",
                  });
                }
              }}
            >
              + Create
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Code",
                  "Discount",
                  "Min Order",
                  "Expiry",
                  "Used",
                  "Status",
                  "Action",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs text-gray-700 font-medium"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {coupons.map((c, i) => (
                <tr
                  key={c.id}
                  className="border-t border-gray-100 hover:bg-gray-50"
                  data-ocid={`coupon.item.${i + 1}`}
                >
                  <td className="px-4 py-3 font-mono font-bold text-amber-600">
                    {c.code}
                  </td>
                  <td className="px-4 py-3 text-gray-800">
                    {c.discount}
                    {c.type}
                  </td>
                  <td className="px-4 py-3 text-gray-600">₹{c.minOrder}</td>
                  <td className="px-4 py-3 text-gray-700">{c.expiry || "—"}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700 font-medium">
                      {c.usedCount} used
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${c.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        className={`text-xs px-2 py-0.5 rounded ${c.status === "Active" ? "bg-gray-100 text-gray-700 hover:bg-gray-200" : "bg-green-100 text-green-700 hover:bg-green-200"}`}
                        onClick={() =>
                          setCoupons((p) =>
                            p.map((x) =>
                              x.id === c.id
                                ? {
                                    ...x,
                                    status:
                                      x.status === "Active"
                                        ? "Inactive"
                                        : "Active",
                                  }
                                : x,
                            ),
                          )
                        }
                        data-ocid={`coupon.toggle.${i + 1}`}
                      >
                        {c.status === "Active" ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        type="button"
                        className="text-red-500 text-xs hover:underline"
                        onClick={() =>
                          setCoupons((p) => p.filter((x) => x.id !== c.id))
                        }
                        data-ocid={`coupon.delete_button.${i + 1}`}
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ModuleCard>
  );
}

interface StaffAttendance {
  id: string;
  name: string;
  role: string;
  checkIn: string;
  checkOut: string;
  date: string;
  salary: number;
}
const DEFAULT_ATTENDANCE: StaffAttendance[] = [
  {
    id: "ST001",
    name: "Rajan Kumar",
    role: "Waiter",
    checkIn: "09:00",
    checkOut: "18:00",
    date: new Date().toISOString().split("T")[0],
    salary: 15000,
  },
  {
    id: "ST002",
    name: "Sunita Devi",
    role: "Chef",
    checkIn: "08:00",
    checkOut: "17:00",
    date: new Date().toISOString().split("T")[0],
    salary: 22000,
  },
  {
    id: "ST003",
    name: "Amar Singh",
    role: "Cashier",
    checkIn: "10:00",
    checkOut: "",
    date: new Date().toISOString().split("T")[0],
    salary: 18000,
  },
];

function AttendancePayroll() {
  const [records, setRecords] = useLS<StaffAttendance[]>(
    "restaurant_attendance",
    DEFAULT_ATTENDANCE,
  );
  const [addForm, setAddForm] = useState({
    name: "",
    role: "Waiter",
    salary: "",
  });
  const [editSalaryId, setEditSalaryId] = useState<string | null>(null);
  const [editSalaryVal, setEditSalaryVal] = useState("");
  const totalSalary = records.reduce((s, r) => s + r.salary, 0);
  const now = () => new Date().toTimeString().slice(0, 5);

  return (
    <ModuleCard title="Attendance & Payroll">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          {
            label: "Staff Present",
            value: records.filter((r) => r.checkIn).length,
          },
          {
            label: "Staff On Duty",
            value: records.filter((r) => r.checkIn && !r.checkOut).length,
          },
          {
            label: "Monthly Payroll",
            value: `₹${totalSalary.toLocaleString("en-IN")}`,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white border border-gray-200 rounded-lg p-4"
          >
            <p className="text-xs text-gray-700">{s.label}</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-4">
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-2 items-end">
          <div>
            <p className="text-xs text-gray-700 mb-1">Name</p>
            <input
              className="border border-gray-200 rounded px-3 py-1.5 text-sm"
              value={addForm.name}
              onChange={(e) =>
                setAddForm((p) => ({ ...p, name: e.target.value }))
              }
              placeholder="Staff Name"
            />
          </div>
          <div>
            <p className="text-xs text-gray-700 mb-1">Role</p>
            <select
              className="border border-gray-200 rounded px-3 py-1.5 text-sm"
              value={addForm.role}
              onChange={(e) =>
                setAddForm((p) => ({ ...p, role: e.target.value }))
              }
            >
              {["Waiter", "Chef", "Cashier", "Manager", "Cleaner"].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <p className="text-xs text-gray-700 mb-1">Monthly Salary ₹</p>
            <input
              className="border border-gray-200 rounded px-3 py-1.5 text-sm w-28"
              type="number"
              value={addForm.salary}
              onChange={(e) =>
                setAddForm((p) => ({ ...p, salary: e.target.value }))
              }
              placeholder="15000"
            />
          </div>
          <button
            type="button"
            className="px-4 py-1.5 bg-amber-500 text-white rounded text-sm h-9"
            onClick={() => {
              if (addForm.name && addForm.salary) {
                setRecords((p) => [
                  ...p,
                  {
                    id: `ST${Date.now()}`,
                    name: addForm.name,
                    role: addForm.role,
                    checkIn: "",
                    checkOut: "",
                    date: new Date().toISOString().split("T")[0],
                    salary: Number(addForm.salary),
                  },
                ]);
                setAddForm({ name: "", role: "Waiter", salary: "" });
              }
            }}
            data-ocid="attendance.add.button"
          >
            + Add Staff
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Staff",
                  "Role",
                  "Check-In",
                  "Check-Out",
                  "Status",
                  "Salary",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs text-gray-700 font-medium"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => (
                <tr
                  key={r.id}
                  className="border-t border-gray-100 hover:bg-gray-50"
                  data-ocid={`attendance.item.${i + 1}`}
                >
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {r.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.role}</td>
                  <td className="px-4 py-3 text-green-600 font-mono">
                    {r.checkIn || "—"}
                  </td>
                  <td className="px-4 py-3 text-red-500 font-mono">
                    {r.checkOut || (r.checkIn ? "On Duty" : "—")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${r.checkIn && !r.checkOut ? "bg-green-100 text-green-700" : r.checkOut ? "bg-gray-100 text-gray-600" : "bg-red-100 text-red-600"}`}
                    >
                      {r.checkIn && !r.checkOut
                        ? "On Duty"
                        : r.checkOut
                          ? "Checked Out"
                          : "Absent"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-amber-600">
                    {editSalaryId === r.id ? (
                      <div className="flex gap-1">
                        <input
                          className="border border-gray-200 rounded px-2 py-0.5 text-xs w-24"
                          type="number"
                          value={editSalaryVal}
                          onChange={(e) => setEditSalaryVal(e.target.value)}
                        />
                        <button
                          type="button"
                          className="text-xs bg-green-500 text-white px-2 rounded"
                          onClick={() => {
                            setRecords((p) =>
                              p.map((x) =>
                                x.id === r.id
                                  ? { ...x, salary: Number(editSalaryVal) }
                                  : x,
                              ),
                            );
                            setEditSalaryId(null);
                          }}
                        >
                          ✓
                        </button>
                        <button
                          type="button"
                          className="text-xs text-gray-500"
                          onClick={() => setEditSalaryId(null)}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="cursor-pointer hover:underline font-bold text-amber-600 bg-transparent border-none p-0"
                        onClick={() => {
                          setEditSalaryId(r.id);
                          setEditSalaryVal(String(r.salary));
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            setEditSalaryId(r.id);
                            setEditSalaryVal(String(r.salary));
                          }
                        }}
                      >
                        ₹{r.salary.toLocaleString("en-IN")}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {!r.checkIn && (
                        <button
                          type="button"
                          className="text-xs bg-green-500 text-white px-2 py-0.5 rounded hover:bg-green-600"
                          onClick={() =>
                            setRecords((p) =>
                              p.map((x) =>
                                x.id === r.id ? { ...x, checkIn: now() } : x,
                              ),
                            )
                          }
                          data-ocid={`attendance.checkin.button.${i + 1}`}
                        >
                          Check In
                        </button>
                      )}
                      {r.checkIn && !r.checkOut && (
                        <button
                          type="button"
                          className="text-xs bg-red-500 text-white px-2 py-0.5 rounded hover:bg-red-600"
                          onClick={() =>
                            setRecords((p) =>
                              p.map((x) =>
                                x.id === r.id ? { ...x, checkOut: now() } : x,
                              ),
                            )
                          }
                          data-ocid={`attendance.checkout.button.${i + 1}`}
                        >
                          Check Out
                        </button>
                      )}
                      {!r.checkIn && (
                        <button
                          type="button"
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded hover:bg-gray-200"
                          onClick={() =>
                            setRecords((p) =>
                              p.map((x) =>
                                x.id === r.id
                                  ? {
                                      ...x,
                                      checkIn: "Absent",
                                      checkOut: "Absent",
                                    }
                                  : x,
                              ),
                            )
                          }
                          data-ocid={`attendance.absent.button.${i + 1}`}
                        >
                          Absent
                        </button>
                      )}
                      <button
                        type="button"
                        className="text-xs text-red-500 hover:underline"
                        onClick={() =>
                          setRecords((p) => p.filter((x) => x.id !== r.id))
                        }
                        data-ocid={`attendance.delete_button.${i + 1}`}
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ModuleCard>
  );
}

function WhatsAppIntegration() {
  const [settings, setSettings] = useLS("restaurant_wa_settings", {
    number: "+91",
    orderConfirm:
      "Dear {name}, your order #{id} has been received at KDM Palace Restaurant. Estimated time: 20 mins.",
    billReceipt:
      "Thank you for dining at KDM Palace! Your bill of ₹{amount} has been settled. We hope to see you again!",
  });
  const [saved, setSaved] = useState(false);
  return (
    <ModuleCard title="WhatsApp Integration">
      <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-2xl space-y-4">
        <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <span className="text-2xl">💬</span>
          <div>
            <p className="font-semibold text-green-800">
              WhatsApp Business Integration
            </p>
            <p className="text-xs text-green-600">
              Configure WhatsApp number and message templates for automated
              notifications.
            </p>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">
            WhatsApp Business Number
          </p>
          <input
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            value={settings.number}
            onChange={(e) =>
              setSettings((p) => ({
                ...p,
                number: e.target.value,
              }))
            }
            placeholder="+91 98765 43210"
            data-ocid="whatsapp.number.input"
          />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">
            Order Confirmation Template
          </p>
          <textarea
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            rows={3}
            value={settings.orderConfirm}
            onChange={(e) =>
              setSettings((p) => ({
                ...p,
                orderConfirm: e.target.value,
              }))
            }
            data-ocid="whatsapp.order_confirm.textarea"
          />
          <p className="text-xs text-gray-600 mt-1">
            Variables: &#123;name&#125;, &#123;id&#125;, &#123;amount&#125;,
            &#123;table&#125;
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">
            Bill Receipt Template
          </p>
          <textarea
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            rows={3}
            value={settings.billReceipt}
            onChange={(e) =>
              setSettings((p) => ({
                ...p,
                billReceipt: e.target.value,
              }))
            }
            data-ocid="whatsapp.bill_receipt.textarea"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="px-6 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
            onClick={() => {
              setSaved(true);
              setTimeout(() => setSaved(false), 2000);
            }}
            data-ocid="whatsapp.save.button"
          >
            Save Settings
          </button>
          {saved && (
            <span className="text-green-600 text-sm font-medium">✓ Saved!</span>
          )}
        </div>
      </div>
    </ModuleCard>
  );
}

interface StaffUser {
  id: string;
  name: string;
  role: string;
  pin: string;
  status: string;
}
const DEFAULT_USERS: StaffUser[] = [
  {
    id: "U001",
    name: "Admin",
    role: "Admin",
    pin: "admin123",
    status: "Active",
  },
  {
    id: "U002",
    name: "Rajan Kumar",
    role: "Waiter",
    pin: "1234",
    status: "Active",
  },
  {
    id: "U003",
    name: "Sunita Devi",
    role: "Chef",
    pin: "5678",
    status: "Active",
  },
];

function UserManagement() {
  const [users, setUsers] = useLS<StaffUser[]>(
    "restaurant_users",
    DEFAULT_USERS,
  );
  const [form, setForm] = useState({ name: "", role: "Waiter", pin: "" });
  return (
    <ModuleCard title="User Management">
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-2 items-end">
          <div>
            <p className="text-xs text-gray-700 mb-1">Name</p>
            <input
              className="border border-gray-200 rounded px-3 py-1.5 text-sm"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div>
            <p className="text-xs text-gray-700 mb-1">Role</p>
            <select
              className="border border-gray-200 rounded px-3 py-1.5 text-sm"
              value={form.role}
              onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
            >
              {["Admin", "Manager", "Waiter", "Chef", "Cashier"].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <p className="text-xs text-gray-700 mb-1">PIN</p>
            <input
              className="border border-gray-200 rounded px-3 py-1.5 text-sm w-24"
              type="password"
              value={form.pin}
              onChange={(e) => setForm((p) => ({ ...p, pin: e.target.value }))}
            />
          </div>
          <button
            type="button"
            className="px-4 py-1.5 bg-amber-500 text-white rounded text-sm h-9"
            onClick={() => {
              if (form.name && form.pin) {
                setUsers((p) => [
                  ...p,
                  {
                    id: `U${Date.now()}`,
                    name: form.name,
                    role: form.role,
                    pin: form.pin,
                    status: "Active",
                  },
                ]);
                setForm({ name: "", role: "Waiter", pin: "" });
              }
            }}
            data-ocid="user_mgmt.add.button"
          >
            + Add User
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["ID", "Name", "Role", "PIN", "Status", "Action"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs text-gray-700 font-medium"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr
                  key={u.id}
                  className="border-t border-gray-100 hover:bg-gray-50"
                  data-ocid={`user_mgmt.item.${i + 1}`}
                >
                  <td className="px-4 py-3 text-gray-700">{u.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {u.name}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-600">
                    {"•".repeat(u.pin.length)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${u.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        className={`text-xs px-2 py-0.5 rounded ${u.status === "Active" ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" : "bg-green-100 text-green-700 hover:bg-green-200"}`}
                        onClick={() =>
                          setUsers((p) =>
                            p.map((x) =>
                              x.id === u.id
                                ? {
                                    ...x,
                                    status:
                                      x.status === "Active"
                                        ? "Inactive"
                                        : "Active",
                                  }
                                : x,
                            ),
                          )
                        }
                        data-ocid={`user_mgmt.toggle.${i + 1}`}
                      >
                        {u.status === "Active" ? "Disable" : "Enable"}
                      </button>
                      <button
                        type="button"
                        className="text-red-500 text-xs hover:underline"
                        onClick={() =>
                          setUsers((p) => p.filter((x) => x.id !== u.id))
                        }
                        data-ocid={`user_mgmt.delete_button.${i + 1}`}
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ModuleCard>
  );
}

function SettingsSaveBtn({
  onSave,
  saved,
}: { onSave: () => void; saved: boolean }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <button
        type="button"
        className="px-6 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors"
        onClick={onSave}
        data-ocid="settings.save.button"
      >
        Save Settings
      </button>
      {saved && (
        <span className="text-green-600 text-sm font-medium">✓ Saved!</span>
      )}
    </div>
  );
}

function RestaurantSettings() {
  const [settings, setSettings] = useLS<Record<string, string>>(
    "restaurant_settings_data",
    {
      name: "KDM Palace Restaurant",
      address: "Main Road, Begusarai, Bihar 851101",
      gstin: "10AABCK1234B1Z5",
      phone: "+91 98765 43210",
      email: "info@kdmpalace.in",
      currency: "INR",
      gstRate: "5",
      cgst: "2.5",
      sgst: "2.5",
      serviceCharge: "0",
      taxInclusive: "false",
      footer: "Thank you for dining with us! Visit again.",
      kotHeader: "KDM Palace — KOT",
      billCopies: "1",
      showLogo: "true",
      smsEnabled: "false",
      smsApiKey: "",
      autoSendBill: "false",
    },
  );
  const [activeTab, setActiveTab] = useState<
    "general" | "taxes" | "print" | "notifications"
  >("general");
  const [saved, setSaved] = useState(false);
  const set =
    (key: string) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) =>
      setSettings((p) => ({ ...p, [key]: e.target.value }));
  const toggle = (key: string) =>
    setSettings((p) => ({ ...p, [key]: p[key] === "true" ? "false" : "true" }));
  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs = [
    { id: "general" as const, label: "General" },
    { id: "taxes" as const, label: "Taxes & GST" },
    { id: "print" as const, label: "Print Settings" },
    { id: "notifications" as const, label: "Notifications" },
  ];

  return (
    <ModuleCard title="Restaurant Settings">
      <div className="bg-white border border-gray-200 rounded-xl max-w-2xl overflow-hidden">
        <div className="flex border-b border-gray-200 bg-gray-50">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === t.id ? "bg-white text-amber-600 border-b-2 border-amber-500" : "text-gray-600 hover:text-gray-800"}`}
              onClick={() => setActiveTab(t.id)}
              data-ocid={`settings.${t.id}.tab`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="p-6 space-y-4">
          {activeTab === "general" && (
            <>
              {[
                { key: "name", label: "Restaurant Name" },
                { key: "address", label: "Address" },
                { key: "phone", label: "Phone" },
                { key: "email", label: "Email" },
                { key: "currency", label: "Currency" },
              ].map((f) => (
                <div key={f.key}>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    {f.label}
                  </p>
                  <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    value={settings[f.key] || ""}
                    onChange={set(f.key)}
                    data-ocid={`settings.${f.key}.input`}
                  />
                </div>
              ))}
              <SettingsSaveBtn onSave={save} saved={saved} />
            </>
          )}
          {activeTab === "taxes" && (
            <>
              {[
                { key: "gstin", label: "GSTIN" },
                { key: "gstRate", label: "GST Rate (%)" },
                { key: "cgst", label: "CGST (%)" },
                { key: "sgst", label: "SGST (%)" },
                { key: "serviceCharge", label: "Service Charge (%)" },
              ].map((f) => (
                <div key={f.key}>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    {f.label}
                  </p>
                  <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    value={settings[f.key] || ""}
                    onChange={set(f.key)}
                    data-ocid={`settings.${f.key}.input`}
                  />
                </div>
              ))}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">
                  Tax Inclusive Pricing
                </span>
                <button
                  type="button"
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.taxInclusive === "true" ? "bg-amber-500" : "bg-gray-300"}`}
                  onClick={() => toggle("taxInclusive")}
                  data-ocid="settings.tax_inclusive.toggle"
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${settings.taxInclusive === "true" ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
              </div>
              <SettingsSaveBtn onSave={save} saved={saved} />
            </>
          )}
          {activeTab === "print" && (
            <>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Receipt Footer Text
                </p>
                <textarea
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  rows={3}
                  value={settings.footer || ""}
                  onChange={set("footer")}
                  data-ocid="settings.footer.textarea"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  KOT Header Text
                </p>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  value={settings.kotHeader || ""}
                  onChange={set("kotHeader")}
                  data-ocid="settings.kot_header.input"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Bill Copies
                </p>
                <select
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  value={settings.billCopies || "1"}
                  onChange={set("billCopies")}
                  data-ocid="settings.bill_copies.select"
                >
                  <option value="1">1 copy</option>
                  <option value="2">2 copies</option>
                  <option value="3">3 copies</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">
                  Show Logo on Bills
                </span>
                <button
                  type="button"
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.showLogo !== "false" ? "bg-amber-500" : "bg-gray-300"}`}
                  onClick={() => toggle("showLogo")}
                  data-ocid="settings.show_logo.toggle"
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${settings.showLogo !== "false" ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
              </div>
              <SettingsSaveBtn onSave={save} saved={saved} />
            </>
          )}
          {activeTab === "notifications" && (
            <>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">
                  Enable SMS Notifications
                </span>
                <button
                  type="button"
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.smsEnabled === "true" ? "bg-amber-500" : "bg-gray-300"}`}
                  onClick={() => toggle("smsEnabled")}
                  data-ocid="settings.sms_enabled.toggle"
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${settings.smsEnabled === "true" ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  SMS API Key
                </p>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  type="password"
                  value={settings.smsApiKey || ""}
                  onChange={set("smsApiKey")}
                  placeholder="Enter SMS gateway API key"
                  data-ocid="settings.sms_api_key.input"
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">
                  Auto-send Bill Receipt via SMS
                </span>
                <button
                  type="button"
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.autoSendBill === "true" ? "bg-amber-500" : "bg-gray-300"}`}
                  onClick={() => toggle("autoSendBill")}
                  data-ocid="settings.auto_send_bill.toggle"
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${settings.autoSendBill === "true" ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
              </div>
              <SettingsSaveBtn onSave={save} saved={saved} />
            </>
          )}
        </div>
      </div>
    </ModuleCard>
  );
}

function RoomFoodBillingRestaurantSection() {
  const checkedInGuests: any[] = getOccupiedRooms();

  const localMenu = (() => {
    try {
      return JSON.parse(localStorage.getItem("kdm_menu") || "[]");
    } catch {
      return [];
    }
  })();

  const [selectedRoom, setSelectedRoom] = useState("");
  const [cart, setCart] = useState<
    { id: string; name: string; price: number; qty: number }[]
  >([]);
  const [paymentMode, setPaymentMode] = useState("cash");
  const [rfWaiter, setRfWaiter] = useState("");
  const [rfWaiters] = useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("kdm_kotWaiters") || "[]");
    } catch {
      return [];
    }
  });
  const [orders, setOrders] = useState<any[]>(() => {
    try {
      return JSON.parse(
        localStorage.getItem("kdm_room_food_orders_local") || "[]",
      );
    } catch {
      return [];
    }
  });
  const [showInv, setShowInv] = useState<any | null>(null);
  const fmt = (n: number) => `\u20b9${n.toLocaleString("en-IN")}`;

  const guest = checkedInGuests.find((g: any) => g.id === selectedRoom);
  const sub = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const gstAmt = Math.round(sub * 0.05);
  const total = sub + gstAmt;

  const addItem = (item: any) =>
    setCart((prev) => {
      const ex = prev.find((i) => i.id === String(item.id || item.menuItemId));
      if (ex)
        return prev.map((i) =>
          i.id === String(item.id || item.menuItemId)
            ? { ...i, qty: i.qty + 1 }
            : i,
        );
      return [
        ...prev,
        {
          id: String(item.id || item.menuItemId),
          name: item.name,
          price: item.price,
          qty: 1,
        },
      ];
    });

  const removeItem = (id: string) =>
    setCart((prev) => prev.filter((i) => i.id !== id));

  const handleGenerate = () => {
    if (!guest || cart.length === 0) {
      return;
    }
    const order = {
      id: `RF${Date.now()}`,
      roomNumber: guest.roomNumber,
      guestName: guest.guestName,
      items: cart.map((i) => ({ name: i.name, price: i.price, qty: i.qty })),
      totalAmount: total,
      gstAmount: gstAmt,
      paymentMode,
      waiterName: rfWaiter || undefined,
      createdAt: Date.now(),
      isPaid: paymentMode !== "room",
      settledToRoom: paymentMode === "room",
    };
    // Save all orders to unified key for AllInvoicesSection
    try {
      const existing = JSON.parse(
        localStorage.getItem("kdm_room_food_orders") || "[]",
      );
      existing.push(order);
      localStorage.setItem("kdm_room_food_orders", JSON.stringify(existing));
    } catch {}
    const newOrders = [order, ...orders];
    setOrders(newOrders);
    localStorage.setItem(
      "kdm_room_food_orders_local",
      JSON.stringify(newOrders),
    );
    setShowInv(order);
    setCart([]);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-1 text-gray-900">
        Room Food Billing
      </h2>
      <p className="text-gray-600 text-sm mb-4">
        Order food for checked-in guest rooms
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Select Room</CardTitle>
            </CardHeader>
            <CardContent>
              <select
                className="w-full border rounded p-2 text-gray-800 font-medium"
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
              >
                <option value="">-- Select checked-in room --</option>
                {checkedInGuests.map((g: any) => (
                  <option key={g.id} value={g.id}>
                    Room {g.roomNumber} &mdash; {g.guestName}
                  </option>
                ))}
              </select>
              {checkedInGuests.length === 0 && (
                <p className="text-amber-600 text-xs mt-2">
                  No checked-in guests found. Check-in guests from Admin &rarr;
                  Guest Check-In/Out.
                </p>
              )}
            </CardContent>
          </Card>
          {guest && (
            <Card>
              <CardHeader>
                <CardTitle>Menu Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {(localMenu.length ? localMenu : []).map((item: any) => (
                    <div
                      key={item.id || item.menuItemId}
                      className="flex justify-between items-center py-1 border-b"
                    >
                      <div>
                        <span className="font-semibold text-gray-800">
                          {item.name}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          {item.category || ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-amber-700 font-bold">
                          &#8377;{item.price}
                        </span>
                        <button
                          type="button"
                          className="bg-amber-600 text-white rounded px-2 py-0.5 text-xs font-bold hover:bg-amber-700"
                          onClick={() => addItem(item)}
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  ))}
                  {localMenu.length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-4">
                      No menu items. Add items in Menu Management.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        <div>
          {guest && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Order Cart &mdash; Room {guest.roomNumber}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No items added yet
                  </p>
                ) : (
                  <div className="space-y-2 mb-3">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center py-1 border-b"
                      >
                        <div>
                          <span className="font-semibold text-gray-800">
                            {item.name}
                          </span>
                          <span className="text-gray-500 text-xs ml-1">
                            &times;{item.qty}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-amber-700">
                            {fmt(item.price * item.qty)}
                          </span>
                          <button
                            type="button"
                            className="text-red-500 text-xs hover:text-red-700"
                            onClick={() => removeItem(item.id)}
                          >
                            &times;
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="bg-amber-50 rounded p-2 text-sm space-y-1 border border-amber-200 mt-2">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>{fmt(sub)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>GST (5%)</span>
                        <span>{fmt(gstAmt)}</span>
                      </div>
                      <div className="flex justify-between font-bold border-t pt-1">
                        <span>TOTAL</span>
                        <span className="text-amber-700">{fmt(total)}</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      {rfWaiters.length > 0 && (
                        <div className="mb-3">
                          <label
                            htmlFor="rf-waiter"
                            className="text-xs font-semibold text-gray-700 block mb-1"
                          >
                            Select Waiter (optional)
                          </label>
                          <select
                            id="rf-waiter"
                            value={rfWaiter}
                            onChange={(e) => setRfWaiter(e.target.value)}
                            className="w-full border rounded p-2 text-sm"
                          >
                            <option value="">-- No Waiter --</option>
                            {rfWaiters.map((w: any) => (
                              <option key={w.id} value={w.name}>
                                {w.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      <label
                        htmlFor="rf-pay-mode"
                        className="text-xs font-semibold text-gray-700 block mb-1"
                      >
                        Payment Mode
                      </label>
                      <select
                        id="rf-pay-mode"
                        className="w-full border rounded p-2 text-gray-800"
                        value={paymentMode}
                        onChange={(e) => setPaymentMode(e.target.value)}
                      >
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="upi">UPI</option>
                        <option value="room">&#127829; Settle to Room</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      className="w-full bg-amber-600 text-white rounded py-2 font-bold mt-2 hover:bg-amber-700"
                      onClick={handleGenerate}
                    >
                      Generate Bill
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          <div className="mt-4">
            <h3 className="font-bold text-gray-800 mb-2">
              Recent Room Food Orders
            </h3>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {orders.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">
                  No orders yet
                </p>
              )}
              {orders.map((o, i) => (
                <Card
                  key={o.id || i}
                  className="border cursor-pointer hover:shadow"
                  onClick={() => setShowInv(o)}
                >
                  <CardContent className="pt-2 pb-2">
                    <div className="flex justify-between">
                      <div>
                        <div className="font-bold text-gray-900">
                          Room {o.roomNumber} &mdash; {o.guestName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {o.items?.map((it: any) => it.name).join(", ")}
                        </div>
                        <div className="text-xs text-gray-500">
                          {o.paymentMode}{" "}
                          {o.settledToRoom ? "&middot; Settled to Room" : ""}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-amber-700">
                          {fmt(o.totalAmount)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(o.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
      {showInv && (
        <Dialog open onOpenChange={() => setShowInv(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Room Food Bill</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-semibold">Room:</span>
                <span>{showInv.roomNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Guest:</span>
                <span>{showInv.guestName}</span>
              </div>
              <div className="border-t pt-2">
                {showInv.items?.map((item: any) => (
                  <div key={item.name} className="flex justify-between">
                    <span>
                      {item.name} &times;{item.qty}
                    </span>
                    <span>{fmt(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between border-t pt-1">
                <span>GST</span>
                <span>{fmt(showInv.gstAmount)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>TOTAL</span>
                <span className="text-amber-700">
                  {fmt(showInv.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Payment</span>
                <span>{showInv.paymentMode}</span>
              </div>
            </div>
            <Button className="w-full mt-3" onClick={() => setShowInv(null)}>
              Close
            </Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ── Navigation items ─────────────────────────────────────────────────────
type NavItem = { id: string; label: string; icon: string; section?: string };
const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: "⊞" },
  { id: "tables", label: "Table Management", icon: "⊟" },
  { id: "orders", label: "Order Management", icon: "📋" },
  { id: "kitchen", label: "Kitchen Display", icon: "🍳" },
  { id: "menu", label: "Menu Management", icon: "✦" },
  { id: "billing", label: "Billing", icon: "🧾" },
  { id: "bill-history", label: "Bill History", icon: "🕐" },
  { id: "banquet-billing", label: "Banquet Billing", icon: "🏛" },
  { id: "banquet-reservations", label: "Banquet Reservations", icon: "📅" },
  { id: "room-food-billing", label: "Room Food Billing", icon: "🛏️" },
  { id: "customers", label: "Customers", icon: "👥", section: "BUSINESS" },
  { id: "inventory", label: "Inventory", icon: "📦" },
  { id: "expenses", label: "Expenses", icon: "💳" },
  { id: "receipts", label: "Receipt Register", icon: "📄" },
  { id: "dues", label: "Due Management", icon: "⏰" },
  {
    id: "qr-menu",
    label: "QR Menu & Orders",
    icon: "📲",
    section: "INTEGRATIONS & CRM",
  },
  { id: "zomato-swiggy", label: "Zomato & Swiggy", icon: "🛵" },
  { id: "loyalty-crm", label: "Loyalty & CRM", icon: "⭐" },
  { id: "gift-cards", label: "Gift Cards", icon: "🎁" },
  { id: "coupon-mgmt", label: "Coupon Management", icon: "🏷" },
  {
    id: "attendance-payroll",
    label: "Attendance & Payroll",
    icon: "👔",
    section: "HR & PAYROLL",
  },
  {
    id: "whatsapp-integration",
    label: "WhatsApp",
    icon: "💬",
    section: "SYSTEM",
  },
  { id: "user-mgmt", label: "User Management", icon: "👤" },
  { id: "settings", label: "Settings", icon: "⚙" },
];

// ── Main Component ───────────────────────────────────────────────────────
function RestaurantLoginScreen({ onLogin }: { onLogin: () => void }) {
  const { login, getAccountStatus } = useMultiOwnerAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const handleLogin = () => {
    if (!email.trim() || !password) {
      setLoginError("Please enter your email and password.");
      return;
    }
    const ok = login(email.trim(), password);
    if (ok) {
      onLogin();
    } else {
      const status = getAccountStatus(email.trim());
      if (status === "pending") {
        setLoginError("Your account is pending super admin approval.");
      } else if (status === "rejected") {
        setLoginError("Your account has been rejected. Contact admin.");
      } else {
        setLoginError("Invalid email or password. Please try again.");
      }
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8fafc",
      }}
    >
      <div
        style={{
          background: "#111827",
          border: "1px solid #c9a84c33",
          borderRadius: 16,
          padding: "3rem 2.5rem",
          textAlign: "center",
          maxWidth: 380,
          width: "100%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ fontSize: "3rem", marginBottom: 12 }}>🍽️</div>
        <h2
          style={{
            color: "#c9a84c",
            fontFamily: "'Playfair Display', serif",
            fontSize: "1.5rem",
            fontWeight: 700,
            marginBottom: 4,
          }}
        >
          Restaurant POS
        </h2>
        <p style={{ color: "#94a3b8", marginBottom: 28, fontSize: "0.85rem" }}>
          Hotel KDM Palace — Login with your owner / staff credentials
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            data-ocid="restaurant.email.input"
            style={{
              background: "#0a0e1a",
              border: `1px solid ${loginError ? "#ef4444" : "#c9a84c33"}`,
              borderRadius: 6,
              color: "#e0e0e0",
              padding: "10px 16px",
              fontSize: "0.95rem",
              width: "100%",
              outline: "none",
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            data-ocid="restaurant.password.input"
            style={{
              background: "#0a0e1a",
              border: `1px solid ${loginError ? "#ef4444" : "#c9a84c33"}`,
              borderRadius: 6,
              color: "#e0e0e0",
              padding: "10px 16px",
              fontSize: "0.95rem",
              width: "100%",
              outline: "none",
            }}
          />
          {loginError && (
            <p style={{ color: "#ef4444", fontSize: "0.8rem" }}>{loginError}</p>
          )}
          <button
            type="button"
            onClick={handleLogin}
            data-ocid="restaurant.login.button"
            style={{
              background: "#c9a84c",
              color: "#000",
              fontWeight: 700,
              padding: "0.65rem",
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
              fontSize: "0.95rem",
            }}
          >
            Login to Restaurant POS
          </button>
          <a
            href="/"
            style={{
              color: "#94a3b8",
              fontSize: "0.8rem",
              textDecoration: "none",
              marginTop: 4,
            }}
          >
            ← Back to Hotel Website
          </a>
        </div>
      </div>
    </div>
  );
}

export default function RestaurantPage() {
  const { authed, logout } = useMultiOwnerAuth();
  const [, setTick] = useState(0);
  if (!authed)
    return <RestaurantLoginScreen onLogin={() => setTick((n) => n + 1)} />;
  return <RestaurantPOSApp onLogout={logout} />;
}

function RestaurantPOSApp({ onLogout }: { onLogout: () => void }) {
  const [active, setActive] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tables, setTables] = useLS<RTable[]>(
    "restaurant_tables",
    DEFAULT_TABLES,
  );
  const [menu, setMenu] = useLS<MenuItem[]>("restaurant_menu", DEFAULT_MENU);
  const [orders, setOrders] = useLS<Order[]>("restaurant_orders", []);
  const [bills, setBills] = useLS<Bill[]>("restaurant_bills", []);
  const [banquetBills, setBanquetBills] = useLS<BanquetBill[]>(
    "restaurant_banquet_bills",
    [],
  );
  const [reservations, setReservations] = useLS<BanquetReservation[]>(
    "restaurant_banquet_reservations",
    [],
  );
  const [customers, setCustomers] = useLS<Customer[]>(
    "restaurant_customers",
    DEFAULT_CUSTOMERS,
  );
  const [inventory, setInventory] = useLS<InventoryItem[]>(
    "restaurant_inventory",
    DEFAULT_INVENTORY,
  );
  const [expenses, setExpenses] = useLS<Expense[]>("restaurant_expenses", []);
  const [receipts, setReceipts] = useLS<Receipt[]>("restaurant_receipts", []);
  const [dues, setDues] = useLS<Due[]>("restaurant_dues", DEFAULT_DUES);

  const navTo = (id: string) => {
    setActive(id);
    setSidebarOpen(false);
  };

  const renderContent = () => {
    switch (active) {
      case "dashboard":
        return <Dashboard tables={tables} orders={orders} bills={bills} />;
      case "tables":
        return (
          <TableManagement
            tables={tables}
            setTables={setTables}
            setOrders={setOrders}
            menu={menu}
          />
        );
      case "orders":
        return (
          <OrderManagement
            orders={orders}
            setOrders={setOrders}
            tables={tables}
            setTables={setTables}
            menu={menu}
          />
        );
      case "kitchen":
        return <KitchenDisplay orders={orders} setOrders={setOrders} />;
      case "menu":
        return <MenuManagement menu={menu} setMenu={setMenu} />;
      case "billing":
        return (
          <Billing
            tables={tables}
            orders={orders}
            setOrders={setOrders}
            setTables={setTables}
            bills={bills}
            setBills={setBills}
          />
        );
      case "bill-history":
        return <BillHistory bills={bills} />;
      case "banquet-billing":
        return (
          <BanquetBillingSection
            banquetBills={banquetBills}
            setBanquetBills={setBanquetBills}
          />
        );
      case "room-food-billing":
        return <RoomFoodBillingRestaurantSection />;
      case "banquet-reservations":
        return (
          <BanquetReservations
            reservations={reservations}
            setReservations={setReservations}
          />
        );
      case "customers":
        return <Customers customers={customers} setCustomers={setCustomers} />;
      case "inventory":
        return <Inventory inventory={inventory} setInventory={setInventory} />;
      case "expenses":
        return <Expenses expenses={expenses} setExpenses={setExpenses} />;
      case "receipts":
        return (
          <ReceiptRegister receipts={receipts} setReceipts={setReceipts} />
        );
      case "dues":
        return <DueManagement dues={dues} setDues={setDues} />;
      case "qr-menu":
        return <QRMenuOrders />;
      case "zomato-swiggy":
        return <ZomatoSwiggy />;
      case "loyalty-crm":
        return <LoyaltyCRM />;
      case "gift-cards":
        return <GiftCards />;
      case "coupon-mgmt":
        return <CouponManagement />;
      case "attendance-payroll":
        return <AttendancePayroll />;
      case "whatsapp-integration":
        return <WhatsAppIntegration />;
      case "user-mgmt":
        return <UserManagement />;
      case "settings":
        return <RestaurantSettings />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 flex-shrink-0 flex flex-col transition-transform duration-200 md:static md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        style={{ background: "#0d2137" }}
      >
        <div className="p-4 border-b border-white/10">
          <div className="text-white font-bold text-base leading-tight">
            🍽 KDM PALACE
          </div>
          <div className="text-white/50 text-xs mt-0.5">Restaurant POS</div>
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <div key={item.id}>
              {item.section && (
                <div className="text-white/30 text-xs font-semibold px-3 pt-4 pb-1 uppercase tracking-widest">
                  {item.section}
                </div>
              )}
              <button
                type="button"
                onClick={() => navTo(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active === item.id
                    ? "bg-teal-600 text-white font-semibold"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="text-base w-5 text-center">{item.icon}</span>
                {item.label}
              </button>
            </div>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10 space-y-1">
          <a
            href="/"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <span>←</span> Back to Hotel
          </a>
          <button
            type="button"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-white/10 transition-colors"
            onClick={() => {
              onLogout();
              window.location.reload();
            }}
            data-ocid="restaurant.logout.button"
          >
            <span>🚪</span> Logout
          </button>
        </div>
        <div className="p-3 text-white/20 text-xs text-center">
          © 2026. Hotel KDM Palace
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={() => setSidebarOpen(false)}
          role="presentation"
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b px-4 py-3 flex items-center gap-3 shadow-sm">
          <button
            type="button"
            className="md:hidden p-1 rounded hover:bg-gray-100"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="text-xl">☰</span>
          </button>
          <div className="flex-1">
            <div className="font-bold text-gray-800">
              {NAV_ITEMS.find((n) => n.id === active)?.label ?? "Restaurant"}
            </div>
          </div>
          <a
            href="/admin"
            className="text-sm text-gray-700 hover:text-gray-800 hidden md:block"
          >
            Admin Panel
          </a>
          <a
            href="/"
            className="text-sm text-gray-700 hover:text-gray-800 hidden md:block"
          >
            Hotel Website
          </a>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
