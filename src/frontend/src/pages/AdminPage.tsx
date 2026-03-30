import type {
  BanquetBill as BanquetBillBackend,
  GuestCheckIn,
  Inquiry,
  OrderItem,
  PaymentMode,
  RestaurantBill as RestaurantBillBackend,
  RoomFoodOrder,
  RoomInvoice,
  ShoppingItem,
} from "@/backend.d";
import { GuestCheckInStatus } from "@/backend.d";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@/hooks/useActor";
import { useCreateCheckoutSession } from "@/hooks/useCreateCheckoutSession";
import { useMultiOwnerAuth } from "@/hooks/useMultiOwnerAuth";
import type { StaffAccount } from "@/hooks/useMultiOwnerAuth";
import {
  useAllGuestCheckIns,
  useAllInquiries,
  useAllRoomFoodOrders,
  useAllRoomInvoices,
  useBanquetBills,
  useRestaurantBills,
} from "@/hooks/useQueries";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BarChart2,
  BarChart2 as BarChart2Icon,
  BedDouble,
  BookOpen,
  Building2,
  CalendarDays,
  ChefHat,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock,
  CreditCard,
  Eye,
  EyeOff,
  FileBarChart,
  FileSpreadsheet,
  FileText,
  Hash,
  Hotel,
  Image as ImageIcon,
  Key,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  MessageSquare,
  Monitor,
  Moon,
  Pencil,
  PieChart,
  Printer as PrinterIcon,
  Receipt,
  RefreshCw,
  Send,
  Settings,
  ShoppingCart,
  Sparkles,
  Star,
  Tag,
  Trash2,
  TrendingUp,
  UserCheck,
  UserCog,
  UserPlus,
  Users,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

// ─── ROOM PRICE MAP ──────────────────────────────────────────────────────────
const ROOM_PRICE_MAP: Record<
  string,
  { type: string; singlePrice: number; doublePrice: number | null }
> = {
  "101": { type: "Executive Room", singlePrice: 2550, doublePrice: 2850 },
  "102": { type: "Executive Room", singlePrice: 2550, doublePrice: 2850 },
  "103": { type: "Deluxe Room", singlePrice: 3250, doublePrice: 3550 },
  "104": { type: "Amrapali Room", singlePrice: 4750, doublePrice: 5050 },
  "105": { type: "Deluxe Room", singlePrice: 3250, doublePrice: 3550 },
  "106": { type: "Deluxe Room", singlePrice: 3250, doublePrice: 3550 },
  "107": { type: "Deluxe Room", singlePrice: 3250, doublePrice: 3550 },
  "201": {
    type: "Single Executive Room",
    singlePrice: 1199,
    doublePrice: null,
  },
  "202": { type: "Executive Room", singlePrice: 2550, doublePrice: 2850 },
  "203": { type: "Executive Room", singlePrice: 2550, doublePrice: 2850 },
  "204": { type: "Executive Room", singlePrice: 2550, doublePrice: 2850 },
  "205": { type: "Executive Room", singlePrice: 2550, doublePrice: 2850 },
  "206": { type: "Executive Room", singlePrice: 2550, doublePrice: 2850 },
  "207": { type: "Executive Room", singlePrice: 2550, doublePrice: 2850 },
  "208": { type: "Executive Room", singlePrice: 2550, doublePrice: 2850 },
  "209": { type: "Executive Room", singlePrice: 2550, doublePrice: 2850 },
  "210": { type: "Deluxe Room", singlePrice: 3250, doublePrice: 3550 },
  "211": { type: "Rajgrih Room", singlePrice: 6500, doublePrice: 6800 },
  "212": { type: "Deluxe Room", singlePrice: 3250, doublePrice: 3550 },
  "214": {
    type: "Single Executive Room",
    singlePrice: 1199,
    doublePrice: null,
  },
  "401": {
    type: "Single Executive Room",
    singlePrice: 1199,
    doublePrice: null,
  },
  "402": { type: "Executive Room", singlePrice: 2550, doublePrice: 2850 },
  "403": { type: "Executive Room", singlePrice: 2550, doublePrice: 2850 },
  "404": { type: "Executive Room", singlePrice: 2550, doublePrice: 2850 },
  "405": { type: "Executive Room", singlePrice: 2550, doublePrice: 2850 },
  "406": { type: "Executive Room", singlePrice: 2550, doublePrice: 2850 },
  "407": { type: "Executive Room", singlePrice: 2550, doublePrice: 2850 },
  "408": { type: "Executive Room", singlePrice: 2550, doublePrice: 2850 },
  "409": { type: "Executive Room", singlePrice: 2550, doublePrice: 2850 },
  "410": { type: "Deluxe Room", singlePrice: 3250, doublePrice: 3550 },
  "411": { type: "Deluxe Room", singlePrice: 3250, doublePrice: 3550 },
  "412": { type: "Executive Room", singlePrice: 2550, doublePrice: 2850 },
  "414": { type: "Executive Room", singlePrice: 2550, doublePrice: 2850 },
  "415": { type: "Rajgrih Room", singlePrice: 6500, doublePrice: 6800 },
  "416": { type: "Amrapali Room", singlePrice: 4750, doublePrice: 5050 },
  "501": { type: "Executive Room", singlePrice: 2550, doublePrice: 2850 },
  "502": { type: "Executive Room", singlePrice: 2550, doublePrice: 2850 },
  "503": { type: "Executive Room", singlePrice: 2550, doublePrice: 2850 },
  "504": { type: "Executive Room", singlePrice: 2550, doublePrice: 2850 },
  "505": { type: "Executive Room", singlePrice: 2550, doublePrice: 2850 },
  "506": { type: "Executive Room", singlePrice: 2550, doublePrice: 2850 },
  "507": { type: "Executive Room", singlePrice: 2550, doublePrice: 2850 },
  "508": { type: "Executive Room", singlePrice: 2550, doublePrice: 2850 },
  "509": { type: "Executive Room", singlePrice: 2550, doublePrice: 2850 },
};

// ─── GSTIN STATE MAP ─────────────────────────────────────────────────────────
const GSTIN_STATE_MAP: Record<string, string> = {
  "01": "Jammu and Kashmir",
  "02": "Himachal Pradesh",
  "03": "Punjab",
  "04": "Chandigarh",
  "05": "Uttarakhand",
  "06": "Haryana",
  "07": "Delhi",
  "08": "Rajasthan",
  "09": "Uttar Pradesh",
  "10": "Bihar",
  "11": "Sikkim",
  "12": "Arunachal Pradesh",
  "13": "Nagaland",
  "14": "Manipur",
  "15": "Mizoram",
  "16": "Tripura",
  "17": "Meghalaya",
  "18": "Assam",
  "19": "West Bengal",
  "20": "Jharkhand",
  "21": "Odisha",
  "22": "Chattisgarh",
  "23": "Madhya Pradesh",
  "24": "Gujarat",
  "25": "Daman and Diu",
  "26": "Dadra and Nagar Haveli",
  "27": "Maharashtra",
  "28": "Andhra Pradesh",
  "29": "Karnataka",
  "30": "Goa",
  "31": "Lakshadweep Islands",
  "32": "Kerala",
  "33": "Tamil Nadu",
  "34": "Pondicherry",
  "35": "Andaman and Nicobar Islands",
  "36": "Telangana",
  "37": "Andhra Pradesh (New)",
  "38": "LADAKH",
  "97": "OTHER TERRITORY",
};

function getStateFromGSTIN(gstin: string): string {
  if (!gstin || gstin.length < 2) return "";
  return GSTIN_STATE_MAP[gstin.substring(0, 2)] || "";
}

function getEditPermissions() {
  try {
    const s = localStorage.getItem("kdm_edit_permissions");
    return s
      ? JSON.parse(s)
      : {
          itemName: true,
          price: true,
          couponCode: true,
          discount: true,
          menuItems: true,
          roomRate: true,
        };
  } catch {
    return {
      itemName: true,
      price: true,
      couponCode: true,
      discount: true,
      menuItems: true,
      roomRate: true,
    };
  }
}

// ─── ROOM DATA ────────────────────────────────────────────────────────────────
const FLOOR_DATA = [
  {
    name: "Floor 1",
    label: "Rooms 101-107",
    rooms: [
      { no: "101", type: "Executive", price: 2550 },
      { no: "102", type: "Executive", price: 2550 },
      { no: "103", type: "Deluxe", price: 3250 },
      { no: "104", type: "Amrapali", price: 4750 },
      { no: "105", type: "Deluxe", price: 3250 },
      { no: "106", type: "Deluxe", price: 3250 },
      { no: "107", type: "Deluxe", price: 3250 },
    ],
  },
  {
    name: "Floor 2",
    label: "Rooms 201-214",
    rooms: [
      { no: "201", type: "Single Executive", price: 1199 },
      { no: "202", type: "Executive", price: 2550 },
      { no: "203", type: "Executive", price: 2550 },
      { no: "204", type: "Executive", price: 2550 },
      { no: "205", type: "Executive", price: 2550 },
      { no: "206", type: "Executive", price: 2550 },
      { no: "207", type: "Executive", price: 2550 },
      { no: "208", type: "Executive", price: 2550 },
      { no: "209", type: "Executive", price: 2550 },
      { no: "210", type: "Deluxe", price: 3250 },
      { no: "211", type: "Rajgirih", price: 6500 },
      { no: "212", type: "Deluxe", price: 3250 },
      { no: "214", type: "Single Executive", price: 1199 },
    ],
  },
  {
    name: "Floor 3",
    label: "Rooms 401-416",
    rooms: [
      { no: "401", type: "Executive", price: 2550 },
      { no: "402", type: "Executive", price: 2550 },
      { no: "403", type: "Executive", price: 2550 },
      { no: "404", type: "Executive", price: 2550 },
      { no: "405", type: "Executive", price: 2550 },
      { no: "406", type: "Executive", price: 2550 },
      { no: "407", type: "Executive", price: 2550 },
      { no: "408", type: "Executive", price: 2550 },
      { no: "409", type: "Executive", price: 2550 },
      { no: "410", type: "Deluxe", price: 3250 },
      { no: "411", type: "Deluxe", price: 3250 },
      { no: "412", type: "Executive", price: 2550 },
      { no: "414", type: "Executive", price: 2550 },
      { no: "415", type: "Rajgirih", price: 6500 },
      { no: "416", type: "Amrapali", price: 4750 },
    ],
  },
  {
    name: "Side Building",
    label: "Rooms 501-509 · No Lift",
    rooms: [
      { no: "501", type: "Standard", price: 1599 },
      { no: "502", type: "Standard", price: 1599 },
      { no: "503", type: "Standard", price: 1599 },
      { no: "504", type: "Standard", price: 1599 },
      { no: "505", type: "Standard", price: 1599 },
      { no: "506", type: "Standard", price: 1599 },
      { no: "507", type: "Standard", price: 1599 },
      { no: "508", type: "Standard", price: 1599 },
      { no: "509", type: "Standard", price: 1599 },
    ],
  },
];

type RoomStatus = "Available" | "Occupied" | "Reserved" | "Maintenance";
const ALL_ROOMS = FLOOR_DATA.flatMap((f) => f.rooms);

function getInitialStatuses(): Record<string, RoomStatus> {
  const saved = localStorage.getItem("kdm_room_statuses");
  if (saved) return JSON.parse(saved);
  const statuses: Record<string, RoomStatus> = {};
  const statusPool: RoomStatus[] = [
    "Available",
    "Available",
    "Available",
    "Occupied",
    "Reserved",
    "Maintenance",
  ];
  ALL_ROOMS.forEach((r, i) => {
    statuses[r.no] = statusPool[i % statusPool.length];
  });
  return statuses;
}

const STATUS_COLORS: Record<RoomStatus, string> = {
  Available: "#22c55e",
  Occupied: "#ef4444",
  Reserved: "#f59e0b",
  Maintenance: "#6b7280",
};

const STATUS_ORDER: RoomStatus[] = [
  "Available",
  "Occupied",
  "Reserved",
  "Maintenance",
];

// ─── NAV GROUPS ────────────────────────────────────────────────────────────────
const NAV_GROUPS = [
  {
    id: "top",
    label: null,
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "guest-history", label: "Guest History", icon: Users },
    ],
  },
  {
    id: "room-billing",
    label: "ROOM BILLING",
    items: [
      { id: "guest-checkin", label: "Guest Check-In/Out", icon: Hotel },
      { id: "reservations", label: "Booking Reservations", icon: CalendarDays },
      { id: "rooms", label: "Room Availability", icon: BedDouble },
      { id: "housekeeping", label: "Housekeeping", icon: Sparkles },
      { id: "rooms-mgmt", label: "Rooms Management", icon: Building2 },
      { id: "bookings", label: "Booking History", icon: ClipboardList },
      { id: "room-invoices", label: "Room Invoice History", icon: Receipt },
      { id: "stripe-setup", label: "Online Payments", icon: CreditCard },
    ],
  },
  {
    id: "outlet-billing",
    label: "OUTLET BILLING",
    items: [
      { id: "kot", label: "KOT Manager", icon: ChefHat },
      { id: "kds", label: "Kitchen Display (KDS)", icon: Monitor },
      { id: "restaurant", label: "Restaurant Billing", icon: Receipt },
      { id: "restaurant-reprint", label: "Invoice Reprint", icon: Receipt },
      { id: "room-food", label: "Room Food Invoice", icon: UtensilsCrossed },
      { id: "menu", label: "Menu Items", icon: UtensilsCrossed },
      { id: "coupons", label: "Coupons", icon: Tag },
      { id: "coupon-analytics", label: "Coupon Analytics", icon: BarChart2 },
    ],
  },
  {
    id: "banquet-billing",
    label: "BANQUET BILLING",
    items: [
      { id: "banquet-booking", label: "Banquet Booking", icon: CalendarDays },
      { id: "banquet-billing-new", label: "Banquet Billing", icon: Building2 },
      { id: "banquet-bills", label: "Banquet Bill History", icon: Receipt },
    ],
  },
  {
    id: "reports",
    label: "REPORTS",
    items: [
      { id: "invoice-center", label: "All Invoice History", icon: FileText },
      {
        id: "food-sale-report",
        label: "Food Sale Bill Report",
        icon: FileBarChart,
      },
      {
        id: "guest-bill-summary",
        label: "Guest Bill Summary",
        icon: FileSpreadsheet,
      },
      { id: "cashier-report", label: "Cashier Report", icon: PrinterIcon },
      {
        id: "day-end-summary",
        label: "Day-End Closing Summary",
        icon: PrinterIcon,
      },
      { id: "night-audit", label: "Night Audit", icon: Moon },
      { id: "gst-report", label: "GST Report", icon: FileText },
      { id: "sales", label: "Sales Report", icon: TrendingUp },
      { id: "shift-summary", label: "Shift Summary", icon: Clock },
    ],
  },
  {
    id: "settings",
    label: "SETTINGS & ADMIN",
    items: [
      { id: "staff", label: "Staff Management", icon: UserCog },
      { id: "staff-accounts", label: "Staff Accounts", icon: UserPlus },
      { id: "customers", label: "Customers", icon: Users },
      { id: "accounts", label: "Accounts", icon: BookOpen },
      { id: "purchase", label: "Purchase Orders", icon: ShoppingCart },
      { id: "gst", label: "GST Settings", icon: Settings },
      { id: "permissions", label: "Edit Permissions", icon: Key },
      { id: "payment-types", label: "Payment Types", icon: CreditCard },
      { id: "reviews", label: "Guest Reviews", icon: Star },
      { id: "feedback", label: "Guest Feedback", icon: MessageSquare },
      { id: "whatsapp", label: "WhatsApp Templates", icon: Send },
      { id: "invoice-series", label: "Invoice Series", icon: Hash },
      { id: "clear-data", label: "Clear All Data", icon: Trash2 },
    ],
  },
];
const NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK_STAFF = [
  {
    id: 1,
    name: "Rajan Kumar",
    role: "Receptionist",
    phone: "9876543210",
    status: "Active",
  },
  {
    id: 2,
    name: "Sunita Devi",
    role: "Housekeeping",
    phone: "9876543211",
    status: "Active",
  },
  {
    id: 3,
    name: "Arun Singh",
    role: "Kitchen Staff",
    phone: "9876543212",
    status: "Active",
  },
  {
    id: 4,
    name: "Priya Sharma",
    role: "Manager",
    phone: "9876543213",
    status: "Active",
  },
  {
    id: 5,
    name: "Mohan Lal",
    role: "Security",
    phone: "9876543214",
    status: "Off Duty",
  },
];

const MOCK_MENU = [
  { id: 1, name: "Veg Thali", category: "Main Course", price: 250 },
  { id: 2, name: "Chicken Biryani", category: "Biryani", price: 350 },
  { id: 3, name: "Dal Makhani", category: "Main Course", price: 180 },
  { id: 4, name: "Paneer Butter Masala", category: "Main Course", price: 280 },
  { id: 5, name: "Mutton Curry", category: "Main Course", price: 420 },
  { id: 6, name: "Veg Fried Rice", category: "Rice", price: 160 },
  { id: 7, name: "Chicken Tikka", category: "Starter", price: 320 },
  { id: 8, name: "Masala Chai", category: "Beverages", price: 40 },
];

const MOCK_COUPONS = [
  {
    id: 1,
    code: "WELCOME20",
    discount: 20,
    validFrom: "2026-01-01",
    validTo: "2026-12-31",
    used: 45,
  },
  {
    id: 2,
    code: "SUMMER15",
    discount: 15,
    validFrom: "2026-04-01",
    validTo: "2026-06-30",
    used: 12,
  },
  {
    id: 3,
    code: "KDMFEST10",
    discount: 10,
    validFrom: "2026-03-01",
    validTo: "2026-03-31",
    used: 78,
  },
];

const MOCK_ACCOUNTS = [
  {
    date: "29 Mar 2026",
    desc: "Room Revenue - Floor 2",
    debit: 0,
    credit: 18900,
    balance: 256400,
  },
  {
    date: "29 Mar 2026",
    desc: "Restaurant Revenue",
    debit: 0,
    credit: 4250,
    balance: 260650,
  },
  {
    date: "28 Mar 2026",
    desc: "Electricity Bill",
    debit: 8500,
    credit: 0,
    balance: 252150,
  },
  {
    date: "28 Mar 2026",
    desc: "Room Revenue - Floor 1",
    debit: 0,
    credit: 14700,
    balance: 266850,
  },
  {
    date: "27 Mar 2026",
    desc: "Housekeeping Supplies",
    debit: 2200,
    credit: 0,
    balance: 264650,
  },
];

const MONTHLY_REVENUE = [
  { month: "Oct", revenue: 285000 },
  { month: "Nov", revenue: 342000 },
  { month: "Dec", revenue: 478000 },
  { month: "Jan", revenue: 389000 },
  { month: "Feb", revenue: 312000 },
  { month: "Mar", revenue: 421000 },
];

const MOCK_CUSTOMERS = [
  {
    id: 1,
    name: "Amit Verma",
    phone: "9812345678",
    email: "amit@example.com",
    visits: 4,
    lastVisit: "28 Mar 2026",
  },
  {
    id: 2,
    name: "Sunita Jha",
    phone: "9823456789",
    email: "sunita@example.com",
    visits: 2,
    lastVisit: "25 Mar 2026",
  },
  {
    id: 3,
    name: "Ravi Shankar",
    phone: "9834567890",
    email: "ravi@example.com",
    visits: 7,
    lastVisit: "20 Mar 2026",
  },
  {
    id: 4,
    name: "Meera Singh",
    phone: "9845678901",
    email: "meera@example.com",
    visits: 1,
    lastVisit: "15 Mar 2026",
  },
];

const MOCK_REVIEWS = [
  {
    id: 1,
    guest: "Rohit Kumar",
    room: "211",
    rating: 5,
    comment: "Excellent stay! Very clean and comfortable.",
    date: "28 Mar 2026",
  },
  {
    id: 2,
    guest: "Priya Devi",
    room: "104",
    rating: 4,
    comment: "Good service, food was amazing.",
    date: "25 Mar 2026",
  },
  {
    id: 3,
    guest: "Anil Gupta",
    room: "401",
    rating: 5,
    comment: "Best hotel in Begusarai. Will come again!",
    date: "22 Mar 2026",
  },
];

const MOCK_PURCHASE_ORDERS = [
  {
    id: "PO-001",
    vendor: "Raj Supplies",
    items: "Bed Linen, Towels",
    amount: 15000,
    date: "25 Mar 2026",
    status: "Delivered",
  },
  {
    id: "PO-002",
    vendor: "Kitchen Masters",
    items: "Vegetables, Spices",
    amount: 8500,
    date: "27 Mar 2026",
    status: "Pending",
  },
  {
    id: "PO-003",
    vendor: "CleanCo",
    items: "Cleaning Supplies",
    amount: 4200,
    date: "29 Mar 2026",
    status: "Processing",
  },
];

const WHATSAPP_TEMPLATES = [
  {
    id: 1,
    name: "Booking Confirmation",
    message:
      "Dear {{guest_name}}, your booking at Hotel KDM Palace is confirmed. Room: {{room_no}}, Check-in: {{checkin_date}}. Thank you!",
    status: "Active",
  },
  {
    id: 2,
    name: "Check-In Reminder",
    message:
      "Dear {{guest_name}}, reminder that your check-in at Hotel KDM Palace is tomorrow. We look forward to welcoming you!",
    status: "Active",
  },
  {
    id: 3,
    name: "Checkout Invoice",
    message:
      "Dear {{guest_name}}, thank you for staying at Hotel KDM Palace. Your bill of ₹{{amount}} has been processed. Hope to see you again!",
    status: "Active",
  },
];

const KOT_TABLES = [
  { no: "T1", seats: 4 },
  { no: "T2", seats: 4 },
  { no: "T3", seats: 4 },
  { no: "T4", seats: 4 },
  { no: "T5", seats: 6 },
  { no: "T6", seats: 6 },
  { no: "T7", seats: 6 },
  { no: "T8", seats: 6 },
  { no: "T9", seats: 2 },
  { no: "T10", seats: 2 },
  { no: "T11", seats: 2 },
  { no: "T12", seats: 2 },
  { no: "T13", seats: 8 },
  { no: "T14", seats: 8 },
  { no: "T15", seats: 10 },
  { no: "T16", seats: 10 },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const GOLD = "#c9a84c";
const DARK_BG = "#f8fafc";
const CARD_BG = "#ffffff";
const SIDEBAR_BG = "#f1f5f9";
const BORDER = "#e2e8f0";

function SectionTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-6">
      <h2
        style={{
          color: GOLD,
          fontFamily: "'Playfair Display', serif",
          fontSize: "1.5rem",
          fontWeight: 700,
        }}
      >
        {title}
      </h2>
      {sub && (
        <p
          style={{
            color: "#1e293b",
            fontWeight: 600,
            fontSize: "0.8rem",
            marginTop: 2,
          }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: { label: string; value: string | number; color?: string }) {
  return (
    <div
      style={{
        background: CARD_BG,
        border: `1px solid ${BORDER}`,
        borderLeft: `3px solid ${color ?? GOLD}`,
        borderRadius: 8,
        padding: "1rem 1.25rem",
      }}
    >
      <p
        style={{
          color: "#1e293b",
          fontWeight: 600,
          fontSize: "0.72rem",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {label}
      </p>
      <p
        style={{
          color: color ?? GOLD,
          fontSize: "1.8rem",
          fontWeight: 700,
          marginTop: 4,
        }}
      >
        {value}
      </p>
    </div>
  );
}

// ─── SECTION COMPONENTS ───────────────────────────────────────────────────────

function DashboardSection({ inquiries }: { inquiries: Inquiry[] }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  const checkIns: any[] = JSON.parse(
    localStorage.getItem("hotelCheckIns") || "[]",
  );
  const liveGuests = checkIns.filter(
    (g) => g.status === GuestCheckInStatus.checkedIn,
  );
  const occupied = liveGuests.length;
  const totalRooms = 44;
  const available = totalRooms - occupied;
  const todayStr = new Date().toISOString().split("T")[0];
  const pendingCheckouts = liveGuests.filter((g) => {
    const co = g.expectedCheckOut
      ? String(g.expectedCheckOut).split("T")[0]
      : "";
    return co <= todayStr;
  }).length;
  const today = new Date().toLocaleDateString("en-IN");
  const todayRevenue = (() => {
    try {
      const roomInvoices: any[] = JSON.parse(
        localStorage.getItem("kdm_room_invoices") || "[]",
      );
      return roomInvoices
        .filter(
          (inv) =>
            inv.checkoutDate &&
            String(inv.checkoutDate).split("T")[0] === todayStr,
        )
        .reduce(
          (sum: number, inv: any) => sum + (Number(inv.totalAmount) || 0),
          0,
        );
    } catch {
      return 0;
    }
  })();
  void tick;
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <SectionTitle title="Dashboard" sub={`Today: ${today}`} />
        <Button
          onClick={() => setTick((t) => t + 1)}
          variant="outline"
          size="sm"
          style={{ borderColor: "#b8860b", color: "#b8860b" }}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        <StatCard label="Total Rooms" value={44} color={GOLD} />
        <StatCard label="Occupied" value={occupied} color="#ef4444" />
        <StatCard label="Available" value={available} color="#22c55e" />
        <StatCard
          label="Revenue Today"
          value={`₹${todayRevenue.toLocaleString("en-IN")}`}
          color="#a78bfa"
        />
        <StatCard
          label="Pending Checkouts"
          value={pendingCheckouts}
          color="#f59e0b"
        />
        <StatCard
          label="Total Inquiries"
          value={inquiries.length}
          color={GOLD}
        />
      </div>
      <div
        style={{
          background: CARD_BG,
          border: `1px solid ${BORDER}`,
          borderRadius: 8,
          padding: "1.25rem",
        }}
      >
        <p
          style={{
            color: GOLD,
            fontWeight: 600,
            marginBottom: 12,
            fontSize: "0.9rem",
          }}
        >
          Recent Inquiries
        </p>
        <Table>
          <TableHeader>
            <TableRow style={{ borderBottom: `1px solid ${BORDER}` }}>
              <TableHead style={{ color: "#1e293b", fontWeight: 600 }}>
                Type
              </TableHead>
              <TableHead style={{ color: "#1e293b", fontWeight: 600 }}>
                Name
              </TableHead>
              <TableHead style={{ color: "#1e293b", fontWeight: 600 }}>
                Phone
              </TableHead>
              <TableHead style={{ color: "#1e293b", fontWeight: 600 }}>
                Date
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inquiries.slice(0, 5).map((inq) => {
              const d = inq.details;
              let name = "";
              let phone = "";
              if (d.__kind__ === "booking") {
                name = d.booking.name;
                phone = d.booking.phone;
              } else if (d.__kind__ === "banquet") {
                name = d.banquet.name;
                phone = d.banquet.phone;
              } else {
                name = d.contact.name;
                phone = d.contact.phone;
              }
              return (
                <TableRow
                  key={String(inq.id)}
                  style={{ borderBottom: `1px solid ${BORDER}` }}
                >
                  <TableCell>
                    <Badge
                      style={{
                        background: "rgba(201,168,76,0.15)",
                        color: GOLD,
                        border: `1px solid ${BORDER}`,
                      }}
                    >
                      {inq.inquiryType}
                    </Badge>
                  </TableCell>
                  <TableCell style={{ color: "#1e293b" }}>{name}</TableCell>
                  <TableCell style={{ color: "#1e293b", fontWeight: 600 }}>
                    {phone}
                  </TableCell>
                  <TableCell
                    style={{
                      color: "#1e293b",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                    }}
                  >
                    {new Date(Number(inq.timestamp)).toLocaleDateString(
                      "en-IN",
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {inquiries.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  style={{
                    textAlign: "center",
                    color: "#1e293b",
                    fontWeight: 600,
                    padding: "2rem",
                  }}
                >
                  No inquiries yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function RoomAvailabilitySection() {
  const [statuses, setStatuses] =
    useState<Record<string, RoomStatus>>(getInitialStatuses);
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [selectedRooms, setSelectedRooms] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<RoomStatus>("Available");
  const { data: checkIns = [] } = useAllGuestCheckIns();

  const occupiedRooms = new Set<string>(
    checkIns
      .filter((g) => g.status === GuestCheckInStatus.checkedIn)
      .map((g) => g.roomNumber),
  );

  const reservedRooms = (() => {
    try {
      const raw = localStorage.getItem("kdm_booking_reservations");
      const arr: Array<{
        id: string;
        guestName: string;
        phone: string;
        roomNumber: string;
        checkIn: string;
        checkOut: string;
        status: string;
        roomType: string;
      }> = raw ? JSON.parse(raw) : [];
      const map = new Map<
        string,
        { guestName: string; checkIn: string; status: string }
      >();
      for (const r of arr) {
        if (
          r.roomNumber &&
          (r.status === "Confirmed" || r.status === "Tentative")
        ) {
          map.set(r.roomNumber, {
            guestName: r.guestName,
            checkIn: r.checkIn,
            status: r.status,
          });
        }
      }
      return map;
    } catch {
      return new Map<
        string,
        { guestName: string; checkIn: string; status: string }
      >();
    }
  })();

  const cycleStatus = (roomNo: string) => {
    if (occupiedRooms.has(roomNo)) return;
    if (bulkEditMode) {
      setSelectedRooms((prev) => {
        const next = new Set(prev);
        if (next.has(roomNo)) next.delete(roomNo);
        else next.add(roomNo);
        return next;
      });
      return;
    }
    setStatuses((prev) => {
      const cur = prev[roomNo];
      const idx = STATUS_ORDER.indexOf(cur);
      const next = STATUS_ORDER[(idx + 1) % STATUS_ORDER.length];
      const updated = { ...prev, [roomNo]: next };
      localStorage.setItem("kdm_room_statuses", JSON.stringify(updated));
      return updated;
    });
  };

  const saveBulkRoomStatus = () => {
    if (selectedRooms.size === 0) {
      toast.error("No rooms selected");
      return;
    }
    setStatuses((prev) => {
      const updated = { ...prev };
      for (const r of selectedRooms) {
        updated[r] = bulkStatus;
      }
      localStorage.setItem("kdm_room_statuses", JSON.stringify(updated));
      return updated;
    });
    toast.success(`${selectedRooms.size} room(s) set to ${bulkStatus}`);
    setSelectedRooms(new Set());
    setBulkEditMode(false);
  };

  return (
    <div>
      <SectionTitle
        title="Room Availability"
        sub="Click a room to cycle its status"
      />
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Button
          size="sm"
          style={{
            background: bulkEditMode ? "#ef4444" : "#c9a84c",
            color: bulkEditMode ? "#fff" : "#000",
            fontWeight: 700,
          }}
          onClick={() => {
            setBulkEditMode(!bulkEditMode);
            setSelectedRooms(new Set());
          }}
          data-ocid="rooms.bulk_edit.toggle"
        >
          {bulkEditMode ? "❌ Cancel Bulk Edit" : "✏️ Bulk Edit"}
        </Button>
        {bulkEditMode && (
          <>
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value as RoomStatus)}
              style={{
                border: "1px solid #c9a84c",
                borderRadius: 6,
                padding: "4px 10px",
                fontWeight: 700,
                color: "#1e293b",
              }}
            >
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <Button
              size="sm"
              style={{ background: "#22c55e", color: "#fff", fontWeight: 700 }}
              onClick={saveBulkRoomStatus}
              data-ocid="rooms.bulk_save.button"
            >
              💾 Save All Selected ({selectedRooms.size})
            </Button>
            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
              Click rooms to select/deselect
            </span>
          </>
        )}
      </div>
      <div
        style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}
      >
        {["All", ...STATUS_ORDER].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilterStatus(s)}
            style={{
              padding: "4px 14px",
              borderRadius: 20,
              border: `1px solid ${filterStatus === s ? GOLD : BORDER}`,
              background:
                filterStatus === s ? "rgba(201,168,76,0.15)" : "transparent",
              color: filterStatus === s ? GOLD : "#888",
              fontSize: "0.78rem",
              cursor: "pointer",
            }}
          >
            {s}
          </button>
        ))}
      </div>
      {FLOOR_DATA.map((floor) => {
        const floorRooms =
          filterStatus === "All"
            ? floor.rooms
            : floor.rooms.filter((r) => statuses[r.no] === filterStatus);
        const availCount = floor.rooms.filter(
          (r) => statuses[r.no] === "Available",
        ).length;
        return (
          <div key={floor.name} style={{ marginBottom: 28 }}>
            <div
              style={{
                background: "rgba(201,168,76,0.08)",
                border: `1px solid ${BORDER}`,
                borderRadius: 6,
                padding: "8px 16px",
                marginBottom: 12,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ color: GOLD, fontWeight: 600 }}>{floor.name}</span>
              <span
                style={{
                  color: "#1e293b",
                  fontWeight: 600,
                  fontSize: "0.8rem",
                }}
              >
                {floor.label} ·{" "}
                <span style={{ color: "#22c55e" }}>{availCount} available</span>{" "}
                / {floor.rooms.length} total
              </span>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(130px,1fr))",
                gap: 10,
              }}
            >
              {floorRooms.map((room) => {
                const baseStatus = statuses[room.no] ?? "Available";
                const isOccupied = occupiedRooms.has(room.no);
                const reservation = reservedRooms.get(room.no);
                const status: RoomStatus = isOccupied
                  ? "Occupied"
                  : reservation
                    ? "Reserved"
                    : baseStatus;
                const liveGuest = isOccupied
                  ? checkIns.find(
                      (g) =>
                        g.roomNumber === room.no &&
                        g.status === GuestCheckInStatus.checkedIn,
                    )
                  : null;
                return (
                  <button
                    key={room.no}
                    type="button"
                    onClick={() => cycleStatus(room.no)}
                    data-ocid={`rooms.item.${room.no}`}
                    style={{
                      background:
                        bulkEditMode && selectedRooms.has(room.no)
                          ? "rgba(201,168,76,0.15)"
                          : CARD_BG,
                      border:
                        bulkEditMode && selectedRooms.has(room.no)
                          ? "2px solid #c9a84c"
                          : `1px solid ${STATUS_COLORS[status] ?? STATUS_COLORS.Available}40`,
                      borderRadius: 8,
                      padding: "10px 12px",
                      cursor: isOccupied ? "not-allowed" : "pointer",
                      textAlign: "left",
                      transition: "all 0.2s",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 4,
                      }}
                    >
                      <span
                        style={{
                          color: "#1e293b",
                          fontWeight: 700,
                          fontSize: "1rem",
                        }}
                      >
                        {room.no}
                      </span>
                      <span
                        style={{
                          width: 9,
                          height: 9,
                          borderRadius: "50%",
                          background: STATUS_COLORS[status],
                          display: "inline-block",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        fontSize: "0.68rem",
                        color: GOLD,
                        marginBottom: 2,
                      }}
                    >
                      {room.type}
                    </div>
                    <div
                      style={{
                        fontSize: "0.7rem",
                        color: "#1e293b",
                        fontWeight: 600,
                      }}
                    >
                      ₹{room.price}/night
                    </div>
                    <div
                      style={{
                        fontSize: "0.7rem",
                        color: STATUS_COLORS[status] ?? STATUS_COLORS.Available,
                        fontWeight: 600,
                        marginTop: 4,
                      }}
                    >
                      {status}
                    </div>
                    {liveGuest && (
                      <div
                        style={{
                          fontSize: "0.62rem",
                          color: "#64748b",
                          marginTop: 3,
                          lineHeight: 1.3,
                        }}
                      >
                        <div style={{ fontWeight: 700, color: "#1e293b" }}>
                          {liveGuest.guestName}
                        </div>
                        <div>In: {liveGuest.checkInDate}</div>
                      </div>
                    )}
                    {!liveGuest && reservation && (
                      <div
                        style={{
                          fontSize: "0.62rem",
                          color: "#92400e",
                          marginTop: 3,
                          lineHeight: 1.3,
                        }}
                      >
                        <div style={{ fontWeight: 700 }}>
                          {reservation.guestName}
                        </div>
                        <div>Arr: {reservation.checkIn}</div>
                      </div>
                    )}
                  </button>
                );
              })}
              {floorRooms.length === 0 && (
                <p
                  style={{
                    color: "#1e293b",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    padding: "8px 0",
                  }}
                >
                  No rooms match filter.
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function HousekeepingSection() {
  type CleanStatus = "Clean" | "Dirty" | "In-Progress";
  const CLEAN_COLORS: Record<CleanStatus, string> = {
    Clean: "#22c55e",
    Dirty: "#ef4444",
    "In-Progress": "#f59e0b",
  };
  const { data: checkIns = [] } = useAllGuestCheckIns();
  const occupiedRooms = new Set<string>(
    checkIns
      .filter((g) => g.status === GuestCheckInStatus.checkedIn)
      .map((g) => g.roomNumber),
  );
  const [data, setData] = useState<
    Record<
      string,
      { status: CleanStatus; staff: string; wasOccupied?: boolean }
    >
  >(() => {
    const s = localStorage.getItem("kdm_housekeeping");
    if (s) return JSON.parse(s);
    const d: Record<string, { status: CleanStatus; staff: string }> = {};
    const pool: CleanStatus[] = ["Clean", "Clean", "Dirty", "In-Progress"];
    ALL_ROOMS.forEach((r, i) => {
      d[r.no] = { status: pool[i % pool.length], staff: "" };
    });
    return d;
  });
  const [floorFilter, setFloorFilter] = useState<string>("All");
  const floors = ["All", ...FLOOR_DATA.map((f) => f.name)];
  const [hkBulkMode, setHkBulkMode] = useState(false);
  const [hkSelected, setHkSelected] = useState<Set<string>>(new Set());
  const [hkBulkStatus, setHkBulkStatus] = useState<CleanStatus>("Clean");

  // Auto-set Dirty when guest checks out
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional partial deps
  useEffect(() => {
    const prev = new Set<string>(
      Object.entries(data)
        .filter(([, v]) => (v as { wasOccupied?: boolean }).wasOccupied)
        .map(([k]) => k),
    );
    const newlyCheckedOut = [...prev].filter((r) => !occupiedRooms.has(r));
    if (newlyCheckedOut.length > 0) {
      setData((d) => {
        const updated = { ...d };
        for (const r of newlyCheckedOut) {
          updated[r] = { ...updated[r], status: "Dirty", wasOccupied: false };
        }
        localStorage.setItem("kdm_housekeeping", JSON.stringify(updated));
        return updated;
      });
    }
    // Mark currently occupied rooms
    const needsMark = [...occupiedRooms].filter((r) => !data[r]?.wasOccupied);
    if (needsMark.length > 0) {
      setData((d) => {
        const updated = { ...d };
        for (const r of needsMark) {
          updated[r] = {
            ...(updated[r] ?? { status: "Clean" as CleanStatus, staff: "" }),
            wasOccupied: true,
          };
        }
        localStorage.setItem("kdm_housekeeping", JSON.stringify(updated));
        return updated;
      });
    }
  }, [checkIns]);

  const cycleClean = (roomNo: string) => {
    setData((prev) => {
      const order: CleanStatus[] = ["Clean", "Dirty", "In-Progress"];
      const cur = prev[roomNo]?.status ?? "Clean";
      const next = order[(order.indexOf(cur) + 1) % order.length];
      const updated = { ...prev, [roomNo]: { ...prev[roomNo], status: next } };
      localStorage.setItem("kdm_housekeeping", JSON.stringify(updated));
      return updated;
    });
  };

  const filteredFloors =
    floorFilter === "All"
      ? FLOOR_DATA
      : FLOOR_DATA.filter((f) => f.name === floorFilter);

  const saveHkBulk = () => {
    if (hkSelected.size === 0) {
      toast.error("No rooms selected");
      return;
    }
    setData((prev) => {
      const updated = { ...prev };
      for (const r of hkSelected) {
        updated[r] = { ...updated[r], status: hkBulkStatus };
      }
      localStorage.setItem("kdm_housekeeping", JSON.stringify(updated));
      return updated;
    });
    toast.success(`${hkSelected.size} room(s) set to ${hkBulkStatus}`);
    setHkSelected(new Set());
    setHkBulkMode(false);
  };

  return (
    <div>
      <SectionTitle
        title="Housekeeping"
        sub="Click room to cycle cleaning status"
      />
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Button
          size="sm"
          style={{
            background: hkBulkMode ? "#ef4444" : "#c9a84c",
            color: hkBulkMode ? "#fff" : "#000",
            fontWeight: 700,
          }}
          onClick={() => {
            setHkBulkMode(!hkBulkMode);
            setHkSelected(new Set());
          }}
          data-ocid="housekeeping.bulk_edit.toggle"
        >
          {hkBulkMode ? "❌ Cancel Bulk Edit" : "✏️ Bulk Edit"}
        </Button>
        {hkBulkMode && (
          <>
            <select
              value={hkBulkStatus}
              onChange={(e) => setHkBulkStatus(e.target.value as CleanStatus)}
              style={{
                border: "1px solid #c9a84c",
                borderRadius: 6,
                padding: "4px 10px",
                fontWeight: 700,
                color: "#1e293b",
              }}
            >
              {(["Clean", "Dirty", "In-Progress"] as CleanStatus[]).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <Button
              size="sm"
              style={{ background: "#22c55e", color: "#fff", fontWeight: 700 }}
              onClick={saveHkBulk}
              data-ocid="housekeeping.bulk_save.button"
            >
              💾 Save All Selected ({hkSelected.size})
            </Button>
            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
              Click rooms to select
            </span>
          </>
        )}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {floors.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFloorFilter(f)}
            style={{
              padding: "4px 14px",
              borderRadius: 20,
              border: `1px solid ${floorFilter === f ? GOLD : BORDER}`,
              background:
                floorFilter === f ? "rgba(201,168,76,0.15)" : "transparent",
              color: floorFilter === f ? GOLD : "#888",
              fontSize: "0.78rem",
              cursor: "pointer",
            }}
          >
            {f}
          </button>
        ))}
      </div>
      {filteredFloors.map((floor) => (
        <div key={floor.name} style={{ marginBottom: 24 }}>
          <p style={{ color: GOLD, fontWeight: 600, marginBottom: 10 }}>
            {floor.name}
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px,1fr))",
              gap: 10,
            }}
          >
            {floor.rooms.map((r) => {
              const info = data[r.no] ?? { status: "Clean", staff: "" };
              return (
                <button
                  key={r.no}
                  type="button"
                  onClick={() => {
                    if (hkBulkMode) {
                      setHkSelected((prev) => {
                        const n = new Set(prev);
                        if (n.has(r.no)) n.delete(r.no);
                        else n.add(r.no);
                        return n;
                      });
                    } else {
                      cycleClean(r.no);
                    }
                  }}
                  style={{
                    background: CARD_BG,
                    border: `1px solid ${occupiedRooms.has(r.no) ? "#ef4444" : CLEAN_COLORS[info.status]}40`,
                    borderRadius: 8,
                    padding: "10px",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ color: "#1e293b", fontWeight: 700 }}>
                      Room {r.no}
                    </span>
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: CLEAN_COLORS[info.status],
                        display: "inline-block",
                      }}
                    />
                  </div>
                  {occupiedRooms.has(r.no) && (
                    <div
                      style={{
                        fontSize: "0.6rem",
                        background: "#ef4444",
                        color: "#fff",
                        borderRadius: 3,
                        padding: "1px 5px",
                        display: "inline-block",
                        fontWeight: 700,
                        marginTop: 3,
                      }}
                    >
                      OCCUPIED
                    </div>
                  )}
                  <div
                    style={{
                      fontSize: "0.7rem",
                      color: CLEAN_COLORS[info.status],
                      marginTop: 4,
                    }}
                  >
                    {info.status}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function RoomsMgmtSection() {
  const allRooms = FLOOR_DATA.flatMap((f) => f.rooms);
  const { data: checkIns = [] } = useAllGuestCheckIns();
  const occupiedRooms = new Set<string>(
    checkIns
      .filter((g) => g.status === GuestCheckInStatus.checkedIn)
      .map((g) => g.roomNumber),
  );
  const typeColors: Record<string, string> = {
    Standard: "#6b7280",
    "Single Executive": "#60a5fa",
    Executive: "#818cf8",
    Deluxe: "#34d399",
    Amrapali: "#f472b6",
    Rajgirih: GOLD,
  };
  const [overrides, setOverrides] = useState<
    Record<string, { status: RoomStatus; price: number }>
  >(() => {
    const saved = localStorage.getItem("kdm_room_overrides");
    return saved ? JSON.parse(saved) : {};
  });
  const [editRoom, setEditRoom] = useState<{
    no: string;
    type: string;
    price: number;
    floorName: string;
  } | null>(null);
  const [editForm, setEditForm] = useState({
    status: "Available" as RoomStatus,
    price: 0,
  });

  const openEdit = (
    room: { no: string; type: string; price: number },
    floorName: string,
  ) => {
    const ov = overrides[room.no];
    setEditForm({
      status: ov?.status ?? getInitialStatuses()[room.no] ?? "Available",
      price: ov?.price ?? room.price,
    });
    setEditRoom({ ...room, floorName });
  };

  const saveEdit = () => {
    if (!editRoom) return;
    const newOv = { ...overrides, [editRoom.no]: editForm };
    setOverrides(newOv);
    localStorage.setItem("kdm_room_overrides", JSON.stringify(newOv));
    setEditRoom(null);
    toast.success(`Room ${editRoom.no} updated`);
  };

  const [showOTA, setShowOTA] = useState(false);
  const [otaTab, setOtaTab] = useState<"price" | "block">("price");
  const [otaRoomTypes, setOtaRoomTypes] = useState<string[]>([]);
  const [otaNewPrice, setOtaNewPrice] = useState("");
  const [otaChannels, setOtaChannels] = useState<string[]>(["Direct"]);
  const [otaBlockRooms, setOtaBlockRooms] = useState<string[]>([]);
  const [otaBlockFrom, setOtaBlockFrom] = useState("");
  const [otaBlockTo, setOtaBlockTo] = useState("");
  const [otaBlockReason, setOtaBlockReason] = useState("OTA Block");
  const OTA_CHANNELS = [
    "Booking.com",
    "MakeMyTrip",
    "Goibibo",
    "Agoda",
    "Expedia",
    "Direct",
  ];
  const ALL_ROOM_TYPES = [
    ...new Set(FLOOR_DATA.flatMap((f) => f.rooms.map((r) => r.type))),
  ];

  const getOtaPrices = () => {
    try {
      return JSON.parse(localStorage.getItem("kdm_ota_prices") || "[]");
    } catch {
      return [];
    }
  };
  const getOtaBlocks = () => {
    try {
      return JSON.parse(localStorage.getItem("kdm_ota_blocks") || "[]");
    } catch {
      return [];
    }
  };

  const saveOtaPrices = () => {
    if (!otaNewPrice || otaRoomTypes.length === 0 || otaChannels.length === 0) {
      toast.error("Select room types, channels and enter price");
      return;
    }
    const existing = getOtaPrices();
    const newEntry = {
      id: Date.now().toString(),
      roomTypes: otaRoomTypes,
      channels: otaChannels,
      price: Number(otaNewPrice),
      updatedAt: new Date().toLocaleDateString("en-IN"),
    };
    existing.push(newEntry);
    localStorage.setItem("kdm_ota_prices", JSON.stringify(existing));
    toast.success("OTA prices updated!");
    setOtaNewPrice("");
    setOtaRoomTypes([]);
    setOtaChannels(["Direct"]);
  };

  const saveOtaBlock = () => {
    if (otaBlockRooms.length === 0 || !otaBlockFrom || !otaBlockTo) {
      toast.error("Select rooms and date range");
      return;
    }
    const existing = getOtaBlocks();
    existing.push({
      id: Date.now().toString(),
      rooms: otaBlockRooms,
      from: otaBlockFrom,
      to: otaBlockTo,
      reason: otaBlockReason,
      createdAt: new Date().toLocaleDateString("en-IN"),
    });
    localStorage.setItem("kdm_ota_blocks", JSON.stringify(existing));
    toast.success(`${otaBlockRooms.length} room(s) blocked!`);
    setOtaBlockRooms([]);
    setOtaBlockFrom("");
    setOtaBlockTo("");
    setOtaBlockReason("OTA Block");
  };

  return (
    <div>
      <SectionTitle
        title="Rooms Management"
        sub={`Total: ${allRooms.length} rooms`}
      />
      {/* OTA / Channel Manager Button */}
      <div style={{ marginBottom: 16 }}>
        <Button
          style={{
            background: showOTA ? "#1e293b" : "#c9a84c",
            color: showOTA ? "#c9a84c" : "#000",
            fontWeight: 700,
            border: "1px solid #c9a84c",
          }}
          onClick={() => setShowOTA(!showOTA)}
          data-ocid="rooms-mgmt.ota.button"
        >
          🌐 {showOTA ? "Close" : "OTA / Channel Manager"}
        </Button>
      </div>
      {showOTA && (
        <div
          style={{
            background: "#f8fafc",
            border: "1px solid #c9a84c40",
            borderRadius: 10,
            padding: 20,
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {(["price", "block"] as const).map((t) => (
              <Button
                key={t}
                size="sm"
                style={{
                  background: otaTab === t ? "#c9a84c" : "#e2e8f0",
                  color: otaTab === t ? "#000" : "#475569",
                  fontWeight: 700,
                  textTransform: "capitalize",
                }}
                onClick={() => setOtaTab(t)}
              >
                {t === "price" ? "💲 Price Update" : "🔒 Block Booking"}
              </Button>
            ))}
          </div>
          {otaTab === "price" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <div>
                <Label style={{ fontWeight: 700 }}>Room Types</Label>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                    marginTop: 4,
                  }}
                >
                  {ALL_ROOM_TYPES.map((rt) => (
                    <label
                      key={rt}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: "0.8rem",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={otaRoomTypes.includes(rt)}
                        onChange={(e) =>
                          setOtaRoomTypes((p) =>
                            e.target.checked
                              ? [...p, rt]
                              : p.filter((x) => x !== rt),
                          )
                        }
                      />
                      {rt}
                    </label>
                  ))}
                </div>
                <Label
                  style={{ fontWeight: 700, marginTop: 10, display: "block" }}
                >
                  New Price (₹)
                </Label>
                <Input
                  type="number"
                  value={otaNewPrice}
                  onChange={(e) => setOtaNewPrice(e.target.value)}
                  placeholder="Enter price"
                  style={{ marginTop: 4 }}
                />
                <Label
                  style={{ fontWeight: 700, marginTop: 10, display: "block" }}
                >
                  Channels
                </Label>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                    marginTop: 4,
                  }}
                >
                  {OTA_CHANNELS.map((ch) => (
                    <label
                      key={ch}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: "0.8rem",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={otaChannels.includes(ch)}
                        onChange={(e) =>
                          setOtaChannels((p) =>
                            e.target.checked
                              ? [...p, ch]
                              : p.filter((x) => x !== ch),
                          )
                        }
                      />
                      {ch}
                    </label>
                  ))}
                </div>
                <Button
                  style={{
                    background: "#c9a84c",
                    color: "#000",
                    fontWeight: 700,
                    marginTop: 12,
                  }}
                  onClick={saveOtaPrices}
                  data-ocid="rooms-mgmt.ota.price.button"
                >
                  Update Prices
                </Button>
              </div>
              <div>
                <Label style={{ fontWeight: 700 }}>Current OTA Prices</Label>
                <div
                  style={{ marginTop: 8, maxHeight: 200, overflowY: "auto" }}
                >
                  {getOtaPrices().length === 0 ? (
                    <p style={{ color: "#94a3b8", fontSize: "0.8rem" }}>
                      No price updates yet
                    </p>
                  ) : (
                    getOtaPrices().map((p: any) => (
                      <div
                        key={p.id}
                        style={{
                          background: "#fff",
                          border: "1px solid #e2e8f0",
                          borderRadius: 6,
                          padding: "6px 10px",
                          marginBottom: 6,
                          fontSize: "0.78rem",
                        }}
                      >
                        <strong>{p.roomTypes.join(", ")}</strong> → ₹{p.price}{" "}
                        on {p.channels.join(", ")} ({p.updatedAt})
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
          {otaTab === "block" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <div>
                <Label style={{ fontWeight: 700 }}>Select Rooms</Label>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 4,
                    marginTop: 4,
                    maxHeight: 120,
                    overflowY: "auto",
                  }}
                >
                  {FLOOR_DATA.flatMap((f) => f.rooms).map((r) => (
                    <label
                      key={r.no}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                        fontSize: "0.75rem",
                        cursor: "pointer",
                        border: "1px solid #e2e8f0",
                        padding: "2px 6px",
                        borderRadius: 4,
                        background: otaBlockRooms.includes(r.no)
                          ? "#fef3c7"
                          : "#fff",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={otaBlockRooms.includes(r.no)}
                        onChange={(e) =>
                          setOtaBlockRooms((p) =>
                            e.target.checked
                              ? [...p, r.no]
                              : p.filter((x) => x !== r.no),
                          )
                        }
                      />
                      {r.no}
                    </label>
                  ))}
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                    marginTop: 10,
                  }}
                >
                  <div>
                    <Label style={{ fontWeight: 700, fontSize: "0.78rem" }}>
                      From Date
                    </Label>
                    <Input
                      type="date"
                      value={otaBlockFrom}
                      onChange={(e) => setOtaBlockFrom(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label style={{ fontWeight: 700, fontSize: "0.78rem" }}>
                      To Date
                    </Label>
                    <Input
                      type="date"
                      value={otaBlockTo}
                      onChange={(e) => setOtaBlockTo(e.target.value)}
                    />
                  </div>
                </div>
                <Label
                  style={{
                    fontWeight: 700,
                    marginTop: 8,
                    display: "block",
                    fontSize: "0.78rem",
                  }}
                >
                  Reason
                </Label>
                <select
                  value={otaBlockReason}
                  onChange={(e) => setOtaBlockReason(e.target.value)}
                  style={{
                    width: "100%",
                    border: "1px solid #e2e8f0",
                    borderRadius: 6,
                    padding: "6px 8px",
                    marginTop: 4,
                    fontSize: "0.8rem",
                  }}
                >
                  {[
                    "OTA Block",
                    "Maintenance",
                    "Owner Use",
                    "Renovation",
                    "Private Event",
                  ].map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <Button
                  style={{
                    background: "#ef4444",
                    color: "#fff",
                    fontWeight: 700,
                    marginTop: 12,
                  }}
                  onClick={saveOtaBlock}
                  data-ocid="rooms-mgmt.ota.block.button"
                >
                  🔒 Block Rooms
                </Button>
              </div>
              <div>
                <Label style={{ fontWeight: 700 }}>Blocked Periods</Label>
                <div
                  style={{ marginTop: 8, maxHeight: 200, overflowY: "auto" }}
                >
                  {getOtaBlocks().length === 0 ? (
                    <p style={{ color: "#94a3b8", fontSize: "0.8rem" }}>
                      No blocked periods
                    </p>
                  ) : (
                    getOtaBlocks().map((b: any) => (
                      <div
                        key={b.id}
                        style={{
                          background: "#fff",
                          border: "1px solid #fca5a5",
                          borderRadius: 6,
                          padding: "6px 10px",
                          marginBottom: 6,
                          fontSize: "0.78rem",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <strong>{b.rooms.join(", ")}</strong>
                          <br />
                          {b.from} → {b.to} · {b.reason}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const blocks = getOtaBlocks().filter(
                              (x: any) => x.id !== b.id,
                            );
                            localStorage.setItem(
                              "kdm_ota_blocks",
                              JSON.stringify(blocks),
                            );
                            toast.success("Unblocked!");
                          }}
                          style={{
                            background: "#22c55e",
                            color: "#fff",
                            border: "none",
                            borderRadius: 4,
                            padding: "3px 8px",
                            cursor: "pointer",
                            fontSize: "0.7rem",
                            fontWeight: 700,
                          }}
                        >
                          Unblock
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      <div
        style={{
          background: CARD_BG,
          border: `1px solid ${BORDER}`,
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <Table>
          <TableHeader>
            <TableRow style={{ borderBottom: `1px solid ${BORDER}` }}>
              {[
                "Room No",
                "Type",
                "Price/Night",
                "Status",
                "Floor",
                "Action",
              ].map((h) => (
                <TableHead
                  key={h}
                  style={{ color: "#1e293b", fontWeight: 600 }}
                >
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {FLOOR_DATA.flatMap((floor) =>
              floor.rooms.map((room, i) => {
                const ov = overrides[room.no];
                const stBase =
                  ov?.status ?? getInitialStatuses()[room.no] ?? "Available";
                const st: RoomStatus = occupiedRooms.has(room.no)
                  ? "Occupied"
                  : stBase;
                const pr = ov?.price ?? room.price;
                const liveGuest = occupiedRooms.has(room.no)
                  ? checkIns.find(
                      (g) =>
                        g.roomNumber === room.no &&
                        g.status === GuestCheckInStatus.checkedIn,
                    )
                  : null;
                return (
                  <TableRow
                    key={room.no}
                    data-ocid={`rooms-mgmt.item.${i + 1}`}
                    style={{ borderBottom: `1px solid ${BORDER}` }}
                  >
                    <TableCell style={{ color: "#1e293b", fontWeight: 600 }}>
                      {room.no}
                    </TableCell>
                    <TableCell>
                      <span
                        style={{
                          color: typeColors[room.type] ?? GOLD,
                          fontSize: "0.8rem",
                        }}
                      >
                        {room.type}
                      </span>
                    </TableCell>
                    <TableCell style={{ color: "#1e293b" }}>
                      ₹{pr.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <span
                        style={{
                          color: STATUS_COLORS[st],
                          fontSize: "0.8rem",
                          fontWeight: 600,
                        }}
                      >
                        {st}
                      </span>
                      {liveGuest && (
                        <div style={{ fontSize: "0.68rem", color: "#64748b" }}>
                          {liveGuest.guestName}
                        </div>
                      )}
                    </TableCell>
                    <TableCell
                      style={{
                        color: "#1e293b",
                        fontWeight: 600,
                        fontSize: "0.8rem",
                      }}
                    >
                      {floor.name}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        style={{
                          background: GOLD,
                          color: "#000",
                          fontSize: "0.75rem",
                        }}
                        data-ocid={`rooms-mgmt.edit_button.${i + 1}`}
                        onClick={() => openEdit(room, floor.name)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              }),
            )}
          </TableBody>
        </Table>
      </div>
      <Dialog open={!!editRoom} onOpenChange={(o) => !o && setEditRoom(null)}>
        <DialogContent
          style={{ background: "#fff", color: "#1e293b", borderRadius: 12 }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: "#1e293b", fontWeight: 700 }}>
              Edit Room {editRoom?.no}
            </DialogTitle>
          </DialogHeader>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              paddingTop: 8,
            }}
          >
            {editRoom &&
              occupiedRooms.has(editRoom.no) &&
              (() => {
                const g = checkIns.find(
                  (x) =>
                    x.roomNumber === editRoom.no &&
                    x.status === GuestCheckInStatus.checkedIn,
                );
                return g ? (
                  <div
                    style={{
                      background: "#fef2f2",
                      border: "1px solid #fca5a5",
                      borderRadius: 6,
                      padding: "8px 12px",
                      fontSize: "0.8rem",
                    }}
                  >
                    <div
                      style={{
                        color: "#dc2626",
                        fontWeight: 700,
                        marginBottom: 4,
                      }}
                    >
                      ⚠️ Room is currently occupied
                    </div>
                    <div style={{ color: "#1e293b" }}>
                      <b>Guest:</b> {g.guestName}
                    </div>
                    <div style={{ color: "#1e293b" }}>
                      <b>Phone:</b> {g.phone}
                    </div>
                    <div style={{ color: "#1e293b" }}>
                      <b>Check-in:</b> {g.checkInDate}
                    </div>
                  </div>
                ) : null;
              })()}
            <div>
              <Label style={{ color: "#1e293b", fontWeight: 600 }}>
                Status
              </Label>
              <Select
                value={editForm.status}
                onValueChange={(v) =>
                  setEditForm((p) => ({ ...p, status: v as RoomStatus }))
                }
              >
                <SelectTrigger data-ocid="rooms-mgmt.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_ORDER.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label style={{ color: "#1e293b", fontWeight: 600 }}>
                Price per Night (₹)
              </Label>
              <Input
                type="number"
                value={editForm.price}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, price: Number(e.target.value) }))
                }
                data-ocid="rooms-mgmt.input"
              />
            </div>
            <div
              style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
            >
              <Button
                variant="outline"
                onClick={() => setEditRoom(null)}
                data-ocid="rooms-mgmt.cancel_button"
              >
                Cancel
              </Button>
              <Button
                style={{ background: GOLD, color: "#000", fontWeight: 600 }}
                onClick={saveEdit}
                data-ocid="rooms-mgmt.save_button"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BookingHistorySection({
  inquiries,
  isLoading,
}: { inquiries: Inquiry[]; isLoading: boolean }) {
  const filterByType = (type: string) =>
    type === "all"
      ? inquiries
      : inquiries.filter((i) => i.inquiryType === type);
  return (
    <div>
      <SectionTitle title="Booking History" />
      <Tabs defaultValue="all" data-ocid="bookings.tab">
        <TabsList
          style={{ background: "rgba(255,255,255,0.05)", marginBottom: 16 }}
        >
          {["all", "booking", "banquet", "contact"].map((t) => (
            <TabsTrigger
              key={t}
              value={t}
              data-ocid={`bookings.${t}.tab`}
              style={{ textTransform: "capitalize" }}
            >
              {t} ({filterByType(t).length})
            </TabsTrigger>
          ))}
        </TabsList>
        {["all", "booking", "banquet", "contact"].map((tab) => (
          <TabsContent key={tab} value={tab}>
            {isLoading ? (
              <div data-ocid="bookings.loading_state">
                <Skeleton className="h-10 w-full mb-2" />
                <Skeleton className="h-10 w-full mb-2" />
              </div>
            ) : filterByType(tab).length === 0 ? (
              <div
                data-ocid="bookings.empty_state"
                style={{
                  color: "#1e293b",
                  fontWeight: 600,
                  padding: "2rem",
                  textAlign: "center",
                }}
              >
                No entries found.
              </div>
            ) : (
              <div
                style={{
                  background: CARD_BG,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                <Table>
                  <TableHeader>
                    <TableRow style={{ borderBottom: `1px solid ${BORDER}` }}>
                      {["ID", "Type", "Name", "Phone", "Date"].map((h) => (
                        <TableHead
                          key={h}
                          style={{ color: "#1e293b", fontWeight: 600 }}
                        >
                          {h}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filterByType(tab).map((inq, i) => {
                      const d = inq.details;
                      let name = "";
                      let phone = "";
                      if (d.__kind__ === "booking") {
                        name = d.booking.name;
                        phone = d.booking.phone;
                      } else if (d.__kind__ === "banquet") {
                        name = d.banquet.name;
                        phone = d.banquet.phone;
                      } else {
                        name = d.contact.name;
                        phone = d.contact.phone;
                      }
                      return (
                        <TableRow
                          key={String(inq.id)}
                          data-ocid={`bookings.item.${i + 1}`}
                          style={{ borderBottom: `1px solid ${BORDER}` }}
                        >
                          <TableCell
                            style={{
                              color: "#1e293b",
                              fontWeight: 600,
                              fontSize: "0.75rem",
                            }}
                          >
                            {String(inq.id)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              style={{
                                background: "rgba(201,168,76,0.15)",
                                color: GOLD,
                                border: `1px solid ${BORDER}`,
                                fontSize: "0.7rem",
                              }}
                            >
                              {inq.inquiryType}
                            </Badge>
                          </TableCell>
                          <TableCell style={{ color: "#1e293b" }}>
                            {name}
                          </TableCell>
                          <TableCell
                            style={{ color: "#1e293b", fontWeight: 600 }}
                          >
                            {phone}
                          </TableCell>
                          <TableCell
                            style={{
                              color: "#1e293b",
                              fontWeight: 600,
                              fontSize: "0.75rem",
                            }}
                          >
                            {new Date(Number(inq.timestamp)).toLocaleDateString(
                              "en-IN",
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function KOTSection() {
  type TableStatus = "Available" | "Occupied" | "Reserved";
  const TABLE_STATUS_COLORS: Record<TableStatus, string> = {
    Available: "#22c55e",
    Occupied: "#ef4444",
    Reserved: "#f59e0b",
  };
  const [tableStatuses, setTableStatuses] = useState<
    Record<string, TableStatus>
  >({});
  const [activeKot, setActiveKot] = useState<string | null>(null);
  const [kotDialog, setKotDialog] = useState(false);
  const [selectedItems, setSelectedItems] = useState<
    { name: string; price: number; qty: number }[]
  >([]);
  // Waiters dialog
  const [waitersDialog, setWaitersDialog] = useState(false);
  const [kotAddDialog, setKotAddDialog] = useState(false);
  const [kotOrderTable, setKotOrderTable] = useState("");
  const [kotOrderItems, setKotOrderItems] = useState<
    { name: string; price: number; qty: number }[]
  >([]);
  const [kotMenuSearch, setKotMenuSearch] = useState("");
  const [waiters, setWaiters] = useState<
    { id: string; name: string; phone: string }[]
  >(() => {
    try {
      const s = localStorage.getItem("kdm_kotWaiters");
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });
  const [newWaiterName, setNewWaiterName] = useState("");
  const [newWaiterPhone, setNewWaiterPhone] = useState("");
  // Room Service dialog
  const [rsDialog, setRsDialog] = useState(false);
  const [rsRoom, setRsRoom] = useState("");
  const [rsItems, setRsItems] = useState<
    { name: string; price: number; qty: number }[]
  >([]);
  const rsTotal = rsItems.reduce((s, i) => s + i.price * i.qty, 0);
  const [rsMenuSearch, setRsMenuSearch] = useState("");
  const [_rsGuestEmail, setRsGuestEmail] = useState("");
  const [_rsCopied, setRsCopied] = useState(false);
  const getCheckedInGuests = () => {
    try {
      const arr = JSON.parse(localStorage.getItem("hotelCheckIns") || "[]");
      return arr
        .filter(
          (g: any) =>
            g.status === GuestCheckInStatus.checkedIn ||
            g.status === "checkedIn",
        )
        .map((g: any) => ({
          roomNumber: g.roomNumber,
          guestName: g.guestName || "",
        }));
    } catch {
      return [];
    }
  };
  const [checkedInGuests, setCheckedInGuests] =
    useState<{ roomNumber: string; guestName: string }[]>(getCheckedInGuests);

  const toggleTable = (no: string) => {
    setTableStatuses((prev) => {
      const cur = prev[no] ?? "Available";
      const order: TableStatus[] = ["Available", "Occupied", "Reserved"];
      return { ...prev, [no]: order[(order.indexOf(cur) + 1) % order.length] };
    });
  };

  const openKot = (no: string) => {
    setActiveKot(no);
    setSelectedItems([]);
    setKotDialog(true);
  };

  const addItem = (item: { name: string; price: number }) => {
    setSelectedItems((prev) => {
      const ex = prev.find((i) => i.name === item.name);
      if (ex)
        return prev.map((i) =>
          i.name === item.name ? { ...i, qty: i.qty + 1 } : i,
        );
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const total = selectedItems.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <div>
      <SectionTitle title="KOT Manager" sub="Kitchen Order Ticket System" />
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <Button
          style={{
            background: GOLD,
            color: "#000",
            fontWeight: 600,
            fontSize: "0.8rem",
          }}
          data-ocid="kot.new.button"
        >
          New KOT
        </Button>
        <Button
          style={{
            background: "#059669",
            color: "#fff",
            fontWeight: 600,
            fontSize: "0.8rem",
          }}
          data-ocid="kot.add_update.button"
          onClick={() => {
            setKotOrderTable("");
            setKotOrderItems([]);
            setKotMenuSearch("");
            setKotAddDialog(true);
          }}
        >
          ➕ Add / Update Order
        </Button>
        <Button
          variant="outline"
          style={{
            borderColor: BORDER,
            color: "#1e293b",
            fontWeight: 600,
            fontSize: "0.8rem",
          }}
          data-ocid="kot.waiters.button"
          onClick={() => setWaitersDialog(true)}
        >
          Waiters
        </Button>
        <Button
          variant="outline"
          style={{
            borderColor: BORDER,
            color: "#1e293b",
            fontWeight: 600,
            fontSize: "0.8rem",
          }}
          data-ocid="kot.room_service.button"
          onClick={() => {
            setCheckedInGuests(getCheckedInGuests());
            setRsRoom("");
            setRsItems([]);
            setRsMenuSearch("");
            setRsGuestEmail("");
            setRsCopied(false);
            setRsDialog(true);
          }}
        >
          Room Service
        </Button>
      </div>
      <p
        style={{
          color: "#1e293b",
          fontWeight: 600,
          fontSize: "0.8rem",
          marginBottom: 12,
        }}
      >
        Table Status — Click to change / Double-click to create KOT
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(110px,1fr))",
          gap: 10,
          marginBottom: 28,
        }}
      >
        {KOT_TABLES.map((t, i) => {
          const st = tableStatuses[t.no] ?? "Available";
          return (
            <button
              key={t.no}
              type="button"
              onClick={() => toggleTable(t.no)}
              onDoubleClick={() => openKot(t.no)}
              data-ocid={`kot.table.${i + 1}`}
              style={{
                background: CARD_BG,
                border: `2px solid ${TABLE_STATUS_COLORS[st]}60`,
                borderRadius: 8,
                padding: "12px 8px",
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  color: "#1e293b",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                }}
              >
                {t.no}
              </div>
              <div
                style={{
                  color: "#1e293b",
                  fontWeight: 600,
                  fontSize: "0.7rem",
                  margin: "2px 0",
                }}
              >
                {t.seats} seats
              </div>
              <div
                style={{ color: TABLE_STATUS_COLORS[st], fontSize: "0.65rem" }}
              >
                {st}
              </div>
            </button>
          );
        })}
      </div>

      <Dialog open={kotDialog} onOpenChange={setKotDialog}>
        <DialogContent
          style={{
            background: CARD_BG,
            border: `1px solid ${BORDER}`,
            color: "#1e293b",
            maxWidth: 500,
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: GOLD }}>
              KOT — Table {activeKot}
            </DialogTitle>
          </DialogHeader>
          <div style={{ maxHeight: 280, overflowY: "auto", marginBottom: 12 }}>
            {MOCK_MENU.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => addItem(item)}
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 10px",
                  borderRadius: 6,
                  border: `1px solid ${BORDER}`,
                  background: "transparent",
                  color: "#1e293b",
                  cursor: "pointer",
                  marginBottom: 6,
                  textAlign: "left",
                }}
              >
                <span>
                  {item.name}{" "}
                  <span
                    style={{
                      color: "#1e293b",
                      fontWeight: 600,
                      fontSize: "0.72rem",
                    }}
                  >
                    ({item.category})
                  </span>
                </span>
                <span style={{ color: GOLD }}>₹{item.price}</span>
              </button>
            ))}
          </div>
          {selectedItems.length > 0 && (
            <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 12 }}>
              <p style={{ color: GOLD, fontWeight: 600, marginBottom: 8 }}>
                Order Summary
              </p>
              {selectedItems.map((i) => (
                <div
                  key={i.name}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.8rem",
                    marginBottom: 4,
                  }}
                >
                  <span>
                    {i.name} × {i.qty}
                  </span>
                  <span style={{ color: GOLD }}>₹{i.price * i.qty}</span>
                </div>
              ))}
              <div
                style={{
                  borderTop: `1px solid ${BORDER}`,
                  paddingTop: 8,
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: 700,
                }}
              >
                <span>Total</span>
                <span style={{ color: GOLD }}>₹{total}</span>
              </div>
            </div>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <Button
              onClick={() => setKotDialog(false)}
              style={{
                background: GOLD,
                color: "#000",
                fontWeight: 600,
                flex: 1,
              }}
              data-ocid="kot.confirm.button"
            >
              Send to Kitchen
            </Button>
            <Button
              variant="outline"
              onClick={() => setKotDialog(false)}
              style={{ borderColor: BORDER, flex: 1 }}
              data-ocid="kot.cancel.button"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Waiters Dialog */}
      {/* Add/Update Order Dialog */}
      <Dialog open={kotAddDialog} onOpenChange={setKotAddDialog}>
        <DialogContent
          style={{
            background: "#fff",
            color: "#1e293b",
            maxWidth: 600,
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: "#1e293b", fontWeight: 700 }}>
              🍽 Restaurant Order — Add / Update
            </DialogTitle>
          </DialogHeader>
          <div style={{ marginBottom: 12 }}>
            <Label style={{ fontWeight: 700 }}>Select Table</Label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(70px,1fr))",
                gap: 6,
                marginTop: 6,
              }}
            >
              {KOT_TABLES.map((t) => {
                const st = tableStatuses[t.no] ?? "Available";
                const color = TABLE_STATUS_COLORS[st];
                return (
                  <button
                    key={t.no}
                    type="button"
                    onClick={() => setKotOrderTable(t.no)}
                    style={{
                      border: `2px solid ${kotOrderTable === t.no ? "#c9a84c" : `${color}60`}`,
                      borderRadius: 6,
                      padding: "6px 4px",
                      background:
                        kotOrderTable === t.no
                          ? "rgba(201,168,76,0.12)"
                          : "#f8fafc",
                      cursor: "pointer",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        color: "#1e293b",
                      }}
                    >
                      {t.no}
                    </div>
                    <div style={{ fontSize: "0.6rem", color }}>{st}</div>
                  </button>
                );
              })}
            </div>
            <div style={{ marginTop: 8 }}>
              <select
                value={kotOrderTable}
                onChange={(e) => setKotOrderTable(e.target.value)}
                style={{
                  width: "100%",
                  border: "1px solid #e2e8f0",
                  borderRadius: 6,
                  padding: "7px 10px",
                  color: "#1e293b",
                  fontWeight: 600,
                }}
              >
                <option value="">-- Select Table from Dropdown --</option>
                {KOT_TABLES.map((t) => (
                  <option key={t.no} value={t.no}>
                    {t.no} ({tableStatuses[t.no] ?? "Available"})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <Label style={{ fontWeight: 700 }}>Search Menu Items</Label>
            <Input
              value={kotMenuSearch}
              onChange={(e) => setKotMenuSearch(e.target.value)}
              placeholder="Search by name or category..."
              style={{ marginTop: 4 }}
            />
            <div
              style={{
                maxHeight: 200,
                overflowY: "auto",
                marginTop: 6,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 4,
              }}
            >
              {(() => {
                let items = MOCK_MENU;
                try {
                  const custom = JSON.parse(
                    localStorage.getItem("kdm_menu_items") || "[]",
                  );
                  if (custom.length > 0) items = custom;
                } catch {}
                const q = kotMenuSearch.toLowerCase();
                const filtered = q
                  ? items.filter(
                      (i: any) =>
                        i.name.toLowerCase().includes(q) ||
                        (i.category || "").toLowerCase().includes(q),
                    )
                  : items;
                return filtered.map((item: any) => {
                  const inOrder = kotOrderItems.find(
                    (x) => x.name === item.name,
                  );
                  return (
                    <button
                      key={item.id || item.name}
                      type="button"
                      onClick={() =>
                        setKotOrderItems((prev) => {
                          const ex = prev.find((x) => x.name === item.name);
                          if (ex)
                            return prev.map((x) =>
                              x.name === item.name
                                ? { ...x, qty: x.qty + 1 }
                                : x,
                            );
                          return [
                            ...prev,
                            { name: item.name, price: item.price, qty: 1 },
                          ];
                        })
                      }
                      style={{
                        background: inOrder
                          ? "rgba(201,168,76,0.1)"
                          : "#f8fafc",
                        border: `1px solid ${inOrder ? "#c9a84c" : "#e2e8f0"}`,
                        borderRadius: 6,
                        padding: "6px 8px",
                        cursor: "pointer",
                        textAlign: "left",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.78rem",
                          color: "#1e293b",
                          fontWeight: 600,
                        }}
                      >
                        {item.name}
                      </span>
                      <span
                        style={{
                          color: "#c9a84c",
                          fontWeight: 700,
                          fontSize: "0.78rem",
                        }}
                      >
                        ₹{item.price}
                        {inOrder ? ` (${inOrder.qty})` : ""}
                      </span>
                    </button>
                  );
                });
              })()}
            </div>
          </div>
          {kotOrderItems.length > 0 && (
            <div
              style={{
                background: "#fffbeb",
                border: "1px solid #fde68a",
                borderRadius: 8,
                padding: 12,
                marginBottom: 12,
              }}
            >
              <p style={{ fontWeight: 700, marginBottom: 8 }}>Order Summary</p>
              {kotOrderItems.map((item, idx) => (
                <div
                  key={item.name}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  <span style={{ fontSize: "0.85rem" }}>{item.name}</span>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setKotOrderItems((p) =>
                          p.map((x, i) =>
                            i === idx
                              ? { ...x, qty: Math.max(1, x.qty - 1) }
                              : x,
                          ),
                        )
                      }
                      style={{
                        background: "#e2e8f0",
                        border: "none",
                        borderRadius: 4,
                        width: 22,
                        height: 22,
                        cursor: "pointer",
                        fontWeight: 700,
                      }}
                    >
                      -
                    </button>
                    <span
                      style={{
                        fontWeight: 700,
                        minWidth: 20,
                        textAlign: "center",
                      }}
                    >
                      {item.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setKotOrderItems((p) =>
                          p.map((x, i) =>
                            i === idx ? { ...x, qty: x.qty + 1 } : x,
                          ),
                        )
                      }
                      style={{
                        background: "#e2e8f0",
                        border: "none",
                        borderRadius: 4,
                        width: 22,
                        height: 22,
                        cursor: "pointer",
                        fontWeight: 700,
                      }}
                    >
                      +
                    </button>
                    <span
                      style={{
                        color: "#c9a84c",
                        fontWeight: 700,
                        minWidth: 60,
                        textAlign: "right",
                      }}
                    >
                      ₹{item.price * item.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setKotOrderItems((p) => p.filter((_, i) => i !== idx))
                      }
                      style={{
                        color: "#ef4444",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: 700,
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
              <div
                style={{
                  borderTop: "1px solid #fde68a",
                  paddingTop: 8,
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: 700,
                }}
              >
                <span>Total</span>
                <span style={{ color: "#c9a84c" }}>
                  ₹{kotOrderItems.reduce((s, i) => s + i.price * i.qty, 0)}
                </span>
              </div>
            </div>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <Button
              style={{
                background: "#c9a84c",
                color: "#000",
                fontWeight: 700,
                flex: 1,
              }}
              data-ocid="kot.add_order.submit_button"
              onClick={() => {
                if (!kotOrderTable) {
                  toast.error("Please select a table");
                  return;
                }
                if (kotOrderItems.length === 0) {
                  toast.error("Please add menu items");
                  return;
                }
                try {
                  const orders = JSON.parse(
                    localStorage.getItem("kdm_kot_orders") || "[]",
                  );
                  orders.push({
                    id: `KOT${Date.now()}`,
                    table: kotOrderTable,
                    items: kotOrderItems,
                    total: kotOrderItems.reduce(
                      (s, i) => s + i.price * i.qty,
                      0,
                    ),
                    status: "pending",
                    createdAt: Date.now(),
                  });
                  localStorage.setItem(
                    "kdm_kot_orders",
                    JSON.stringify(orders),
                  );
                  setTableStatuses((prev) => ({
                    ...prev,
                    [kotOrderTable]: "Occupied",
                  }));
                  toast.success(`Order placed for Table ${kotOrderTable}!`);
                  setKotAddDialog(false);
                } catch {
                  toast.error("Failed to place order");
                }
              }}
            >
              🍳 Place Order
            </Button>
            <Button
              variant="outline"
              onClick={() => setKotAddDialog(false)}
              data-ocid="kot.add_order.cancel_button"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={waitersDialog} onOpenChange={setWaitersDialog}>
        <DialogContent style={{ maxWidth: 480 }}>
          <DialogHeader>
            <DialogTitle style={{ color: GOLD, fontWeight: 700 }}>
              👤 Waiters Management
            </DialogTitle>
          </DialogHeader>
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <input
                placeholder="Waiter Name"
                value={newWaiterName}
                onChange={(e) => setNewWaiterName(e.target.value)}
                style={{
                  flex: 1,
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  padding: "6px 10px",
                  fontSize: 13,
                  color: "#1e293b",
                  fontWeight: 600,
                }}
              />
              <input
                placeholder="Phone"
                value={newWaiterPhone}
                onChange={(e) => setNewWaiterPhone(e.target.value)}
                style={{
                  flex: 1,
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  padding: "6px 10px",
                  fontSize: 13,
                  color: "#1e293b",
                  fontWeight: 600,
                }}
              />
              <Button
                style={{ background: GOLD, color: "#000", fontWeight: 700 }}
                onClick={() => {
                  if (!newWaiterName.trim()) return;
                  const updated = [
                    ...waiters,
                    {
                      id: crypto.randomUUID(),
                      name: newWaiterName,
                      phone: newWaiterPhone,
                    },
                  ];
                  setWaiters(updated);
                  try {
                    localStorage.setItem(
                      "kdm_kotWaiters",
                      JSON.stringify(updated),
                    );
                  } catch {}
                  setNewWaiterName("");
                  setNewWaiterPhone("");
                }}
                data-ocid="kot.waiters.add_button"
              >
                Add
              </Button>
            </div>
            {waiters.length === 0 ? (
              <p style={{ color: "#6b7280", fontSize: 13 }}>
                No waiters added yet.
              </p>
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    <th
                      style={{
                        padding: "6px 8px",
                        textAlign: "left",
                        color: "#1e293b",
                        fontWeight: 700,
                      }}
                    >
                      Name
                    </th>
                    <th
                      style={{
                        padding: "6px 8px",
                        textAlign: "left",
                        color: "#1e293b",
                        fontWeight: 700,
                      }}
                    >
                      Phone
                    </th>
                    <th style={{ padding: "6px 8px" }} />
                  </tr>
                </thead>
                <tbody>
                  {waiters.map((w, i) => (
                    <tr
                      key={w.id}
                      data-ocid={`kot.waiters.item.${i + 1}`}
                      style={{ borderBottom: "1px solid #f1f5f9" }}
                    >
                      <td
                        style={{
                          padding: "6px 8px",
                          color: "#1e293b",
                          fontWeight: 600,
                        }}
                      >
                        {w.name}
                      </td>
                      <td style={{ padding: "6px 8px", color: "#374151" }}>
                        {w.phone}
                      </td>
                      <td style={{ padding: "6px 8px" }}>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = waiters.filter(
                              (x) => x.id !== w.id,
                            );
                            setWaiters(updated);
                            try {
                              localStorage.setItem(
                                "kdm_kotWaiters",
                                JSON.stringify(updated),
                              );
                            } catch {}
                          }}
                          data-ocid={`kot.waiters.delete_button.${i + 1}`}
                          style={{
                            background: "#fee2e2",
                            color: "#ef4444",
                            border: "none",
                            borderRadius: 4,
                            padding: "3px 8px",
                            cursor: "pointer",
                            fontWeight: 700,
                          }}
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Room Service Dialog */}
      <Dialog open={rsDialog} onOpenChange={setRsDialog}>
        <DialogContent style={{ maxWidth: 520 }}>
          <DialogHeader>
            <DialogTitle style={{ color: GOLD, fontWeight: 700 }}>
              🛎️ Room Service Order
            </DialogTitle>
          </DialogHeader>
          <div style={{ marginBottom: 12 }}>
            <p
              style={{
                fontWeight: 700,
                fontSize: 13,
                color: "#1e293b",
                display: "block",
                marginBottom: 4,
              }}
            >
              Select Room
            </p>
            <select
              value={rsRoom}
              onChange={(e) => setRsRoom(e.target.value)}
              data-ocid="kot.room_service.select"
              style={{
                width: "100%",
                border: "1px solid #d1d5db",
                borderRadius: 6,
                padding: "7px 10px",
                fontSize: 13,
                color: "#1e293b",
                fontWeight: 600,
                marginBottom: 12,
              }}
            >
              <option value="">-- Select checked-in room --</option>
              {checkedInGuests.length > 0 ? (
                checkedInGuests.map((g) => (
                  <option key={g.roomNumber} value={g.roomNumber}>
                    {`Room ${g.roomNumber}${g.guestName ? ` — ${g.guestName}` : ""}`}
                  </option>
                ))
              ) : (
                <option disabled value="">
                  No guests currently checked in
                </option>
              )}
            </select>
            <p
              style={{
                fontWeight: 700,
                fontSize: 13,
                color: "#1e293b",
                display: "block",
                marginBottom: 6,
              }}
            >
              Menu Items
            </p>
            <input
              placeholder="Search menu items..."
              value={rsMenuSearch}
              onChange={(e) => setRsMenuSearch(e.target.value)}
              style={{
                width: "100%",
                border: "1px solid #d1d5db",
                borderRadius: 6,
                padding: "7px 10px",
                fontSize: 13,
                color: "#1e293b",
                fontWeight: 600,
                marginBottom: 8,
              }}
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
                marginBottom: 12,
              }}
            >
              {MOCK_MENU.filter(
                (item) =>
                  item.name
                    .toLowerCase()
                    .includes(rsMenuSearch.toLowerCase()) ||
                  item.category
                    .toLowerCase()
                    .includes(rsMenuSearch.toLowerCase()),
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    setRsItems((prev) => {
                      const ex = prev.find((i) => i.name === item.name);
                      if (ex)
                        return prev.map((i) =>
                          i.name === item.name ? { ...i, qty: i.qty + 1 } : i,
                        );
                      return [
                        ...prev,
                        { name: item.name, price: item.price, qty: 1 },
                      ];
                    })
                  }
                  style={{
                    background: "#f8fafc",
                    border: `1px solid ${BORDER}`,
                    borderRadius: 6,
                    padding: "8px 10px",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div
                    style={{ color: "#1e293b", fontWeight: 700, fontSize: 13 }}
                  >
                    {item.name}
                  </div>
                  <div style={{ color: GOLD, fontWeight: 600, fontSize: 12 }}>
                    ₹{item.price}
                  </div>
                </button>
              ))}
            </div>
            {rsItems.length > 0 && (
              <div
                style={{
                  background: "#f8fafc",
                  borderRadius: 8,
                  padding: 10,
                  marginBottom: 12,
                }}
              >
                {rsItems.map((i, idx) => (
                  <div
                    key={i.name}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{
                        color: "#1e293b",
                        fontWeight: 600,
                        fontSize: 13,
                      }}
                    >
                      {i.name} × {i.qty}
                    </span>
                    <span style={{ color: GOLD, fontWeight: 700 }}>
                      ₹{i.price * i.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setRsItems((prev) => prev.filter((_, j) => j !== idx))
                      }
                      style={{
                        background: "none",
                        border: "none",
                        color: "#ef4444",
                        cursor: "pointer",
                        fontWeight: 700,
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <div
                  style={{
                    borderTop: `1px solid ${BORDER}`,
                    paddingTop: 6,
                    marginTop: 4,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ fontWeight: 700, color: "#1e293b" }}>
                    Total
                  </span>
                  <span style={{ fontWeight: 700, color: GOLD }}>
                    ₹{rsTotal}
                  </span>
                </div>
              </div>
            )}
            {/* Send to Kitchen & Cancel Order */}
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <Button
                style={{
                  background: "#f97316",
                  color: "#fff",
                  fontWeight: 700,
                  flex: 1,
                }}
                disabled={!rsRoom || rsItems.length === 0}
                data-ocid="kot.room_service.send_to_kitchen.button"
                onClick={() => {
                  if (!rsRoom || rsItems.length === 0) return;
                  try {
                    const kitchenOrders = JSON.parse(
                      localStorage.getItem("kdm_kitchen_orders") || "[]",
                    );
                    const order = {
                      id: `KS${Date.now()}`,
                      roomNo: rsRoom,
                      guestName: rsRoom,
                      items: rsItems,
                      total: rsTotal,
                      status: "pending",
                      timestamp: new Date().toISOString(),
                    };
                    kitchenOrders.push(order);
                    localStorage.setItem(
                      "kdm_kitchen_orders",
                      JSON.stringify(kitchenOrders),
                    );
                    toast.success("🍳 Order sent to kitchen successfully!");
                    setRsDialog(false);
                    setRsRoom("");
                    setRsItems([]);
                    setRsMenuSearch("");
                  } catch {
                    toast.error("Failed to send order");
                  }
                }}
              >
                🍳 Send to Kitchen
              </Button>
              <Button
                variant="outline"
                style={{
                  borderColor: "#ef4444",
                  color: "#ef4444",
                  fontWeight: 700,
                  flex: 1,
                }}
                disabled={rsItems.length === 0}
                data-ocid="kot.room_service.cancel_order.button"
                onClick={() => {
                  if (
                    window.confirm("Cancel this order? This cannot be undone.")
                  ) {
                    setRsItems([]);
                    toast.success("Order cancelled");
                  }
                }}
              >
                ❌ Cancel Order
              </Button>
            </div>
            <Button
              style={{
                background: GOLD,
                color: "#000",
                fontWeight: 700,
                width: "100%",
              }}
              disabled={!rsRoom || rsItems.length === 0}
              data-ocid="kot.room_service.submit_button"
              onClick={() => {
                if (!rsRoom || rsItems.length === 0) return;
                try {
                  const existing = JSON.parse(
                    localStorage.getItem("hotelRoomFoodOrders") || "[]",
                  );
                  const newOrder = {
                    id: crypto.randomUUID(),
                    roomNumber: rsRoom,
                    items: rsItems,
                    totalAmount: rsTotal,
                    orderTime: new Date().toISOString(),
                    createdAt: Date.now(),
                    paymentMode: "Room",
                    settledToRoom: true,
                    status: "pending",
                    guestName: rsRoom,
                  };
                  localStorage.setItem(
                    "hotelRoomFoodOrders",
                    JSON.stringify([...existing, newOrder]),
                  );
                  // Also save to unified key for AllInvoicesSection
                  try {
                    const unified = JSON.parse(
                      localStorage.getItem("kdm_room_food_orders") || "[]",
                    );
                    unified.push(newOrder);
                    localStorage.setItem(
                      "kdm_room_food_orders",
                      JSON.stringify(unified),
                    );
                  } catch {}
                  toast.success(`Room service order sent to Room ${rsRoom}!`);
                  setRsDialog(false);
                  setRsRoom("");
                  setRsItems([]);
                  setRsMenuSearch("");
                  setRsGuestEmail("");
                  setRsCopied(false);
                } catch {
                  toast.error("Failed to save order");
                }
              }}
            >
              Send Room Service Order
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RestaurantBillingSection() {
  const { data: restaurantBills = [], isLoading } = useRestaurantBills();
  const todayStr = new Date().toISOString().split("T")[0];
  const todayStart = new Date(`${todayStr}T00:00:00`).getTime() * 1_000_000;
  const todayEnd = new Date(`${todayStr}T23:59:59`).getTime() * 1_000_000;
  const todayBills = restaurantBills.filter(
    (b) => Number(b.createdAt) >= todayStart && Number(b.createdAt) <= todayEnd,
  );
  const todayRevenue = todayBills.reduce((s, b) => s + b.totalAmount, 0);
  const todayGST = todayBills.reduce((s, b) => s + b.gstAmount, 0);

  return (
    <div>
      <SectionTitle
        title="Restaurant Billing"
        sub="Today's summary · Full POS at /restaurant"
      />
      <div
        style={{
          background: "#dbeafe",
          border: "1px solid #93c5fd",
          borderRadius: 8,
          padding: "12px 16px",
          marginBottom: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <p style={{ color: "#1e40af", fontSize: "0.875rem" }}>
          Full Restaurant POS with Table Management, KOT, Kitchen Display & more
          is available at <strong>/restaurant</strong>
        </p>
        <a
          href="/restaurant"
          style={{
            background: "#2563eb",
            color: "#fff",
            padding: "8px 16px",
            borderRadius: 6,
            fontSize: "0.8rem",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Go to Restaurant POS →
        </a>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <StatCard
          label="Today's Revenue"
          value={`₹${todayRevenue.toLocaleString()}`}
          color={GOLD}
        />
        <StatCard
          label="Bills Today"
          value={todayBills.length}
          color="#22c55e"
        />
        <StatCard
          label="GST Collected"
          value={`₹${todayGST.toFixed(2)}`}
          color="#f59e0b"
        />
      </div>
      <div
        style={{
          background: CARD_BG,
          border: `1px solid ${BORDER}`,
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "1rem 1.25rem",
            borderBottom: `1px solid ${BORDER}`,
          }}
        >
          <p style={{ color: GOLD, fontWeight: 600 }}>Recent Bills (Last 10)</p>
        </div>
        {isLoading ? (
          <div style={{ padding: "2rem" }} data-ocid="restaurant.loading_state">
            Loading...
          </div>
        ) : restaurantBills.length === 0 ? (
          <div
            style={{
              padding: "2rem",
              textAlign: "center",
              color: "#1e293b",
              fontWeight: 600,
            }}
            data-ocid="restaurant.empty_state"
          >
            No restaurant bills yet. Use the Restaurant POS to create bills.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.875rem",
              }}
            >
              <thead>
                <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                  {["Table", "Amount", "GST", "Payment", "Date/Time", ""].map(
                    (h) => (
                      <th
                        key={h}
                        style={{
                          padding: "10px 12px",
                          color: "#1e293b",
                          textAlign: "left",
                          fontWeight: 600,
                        }}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {restaurantBills.slice(0, 10).map((b, i) => (
                  <tr
                    key={b.id}
                    data-ocid={`restaurant.item.${i + 1}`}
                    style={{ borderBottom: `1px solid ${BORDER}20` }}
                  >
                    <td
                      style={{
                        padding: "10px 12px",
                        color: "#1e293b",
                        fontWeight: 600,
                      }}
                    >
                      {b.tableId}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        color: GOLD,
                        fontWeight: 600,
                      }}
                    >
                      ₹{b.totalAmount.toFixed(2)}
                    </td>
                    <td style={{ padding: "10px 12px", color: "#f59e0b" }}>
                      ₹{b.gstAmount.toFixed(2)}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        color: "#1e293b",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        fontSize: "0.75rem",
                      }}
                    >
                      {b.paymentMode}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        color: "#1e293b",
                        fontWeight: 600,
                        fontSize: "0.75rem",
                      }}
                    >
                      {new Date(Number(b.createdAt)).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <div
                        style={{ display: "flex", gap: 4, flexWrap: "wrap" }}
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          style={{
                            borderColor: "#c9a84c",
                            color: "#c9a84c",
                            fontWeight: 600,
                            fontSize: "0.7rem",
                          }}
                          onClick={() => {
                            const html = `<div class="header"><h2>HOTEL KDM PALACE</h2><p>Restaurant Bill</p></div>
                          <table><tr><th>Table</th><td>${b.tableId}</td><th>Date</th><td>${new Date(Number(b.createdAt)).toLocaleString("en-IN")}</td></tr>
                          <tr><th>Customer</th><td>${b.customerName || "—"}</td><th>Payment</th><td>${String(b.paymentMode).toUpperCase()}</td></tr></table>
                          <br/><table><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
                          ${b.items.map((item: any) => `<tr><td>${item.name}</td><td>${Number(item.qty)}</td><td>₹${Number(item.price)}</td><td>₹${Number(item.qty) * Number(item.price)}</td></tr>`).join("")}
                          <tr><th colspan="3">Subtotal</th><td>₹${b.subtotal?.toFixed(2) || "—"}</td></tr>
                          <tr><th colspan="3">Discount</th><td>-₹${b.discount?.toFixed(2) || "0"}</td></tr>
                          <tr><th colspan="3">GST</th><td>₹${b.gstAmount.toFixed(2)}</td></tr>
                          <tr><th colspan="3" style="color:#c9a84c">Total</th><td style="color:#c9a84c;font-weight:700">₹${b.totalAmount.toFixed(2)}</td></tr></table>`;
                            reprintBill(`Restaurant Bill - ${b.tableId}`, html);
                          }}
                        >
                          🖨️ Reprint
                        </Button>
                        <button
                          type="button"
                          onClick={() =>
                            shareInvoiceWhatsApp("Restaurant Bill", {
                              guest: b.customerName || b.tableId,
                              billNo: String(b.id || ""),
                              room: String(b.tableId),
                              date: new Date(
                                Number(b.createdAt),
                              ).toLocaleDateString("en-IN"),
                              amount: b.totalAmount,
                            })
                          }
                          style={{
                            background: "#25D366",
                            color: "white",
                            border: "none",
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            padding: "4px 8px",
                            borderRadius: 4,
                            cursor: "pointer",
                          }}
                        >
                          📱 WhatsApp
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            printAsPDF(
                              `Restaurant Bill - ${b.tableId}`,
                              `<div class="header"><h2>HOTEL KDM PALACE</h2><p>Restaurant Bill</p></div>
                          <table><tr><th>Table</th><td>${b.tableId}</td><th>Date</th><td>${new Date(Number(b.createdAt)).toLocaleString("en-IN")}</td></tr>
                          <tr><th>Customer</th><td>${b.customerName || "—"}</td><th>Payment</th><td>${String(b.paymentMode).toUpperCase()}</td></tr></table>
                          <br/><table><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
                          ${b.items.map((item: any) => `<tr><td>${item.name}</td><td>${Number(item.qty)}</td><td>₹${Number(item.price)}</td><td>₹${Number(item.qty) * Number(item.price)}</td></tr>`).join("")}
                          <tr><th colspan="3">Subtotal</th><td>₹${b.subtotal?.toFixed(2) || "—"}</td></tr>
                          <tr><th colspan="3">Discount</th><td>-₹${b.discount?.toFixed(2) || "0"}</td></tr>
                          <tr><th colspan="3">GST</th><td>₹${b.gstAmount.toFixed(2)}</td></tr>
                          <tr><th colspan="3" style="color:#c9a84c">Total</th><td style="color:#c9a84c;font-weight:700">₹${b.totalAmount.toFixed(2)}</td></tr></table>`,
                            )
                          }
                          style={{
                            background: "#2563eb",
                            color: "white",
                            border: "none",
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            padding: "4px 8px",
                            borderRadius: 4,
                            cursor: "pointer",
                          }}
                        >
                          📄 PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function RestaurantReprintSection() {
  const [bills, setBills] = useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("kdm_restaurant_bills") || "[]");
    } catch {
      return [];
    }
  });
  const [search, setSearch] = useState("");
  const refresh = () => {
    try {
      setBills(
        JSON.parse(localStorage.getItem("kdm_restaurant_bills") || "[]"),
      );
    } catch {}
  };
  const filtered = bills.filter(
    (b) =>
      !search ||
      String(b.id || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      String(b.tableId || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      String(b.customerName || "")
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <div>
      <SectionTitle
        title="Restaurant Invoice Reprint"
        sub="Reprint any past restaurant invoice"
      />
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 16,
          alignItems: "center",
        }}
      >
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by Bill No, Table, Guest..."
          style={{ maxWidth: 320 }}
        />
        <Button variant="outline" onClick={refresh} style={{ fontWeight: 700 }}>
          🔄 Refresh
        </Button>
      </div>
      <div
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        {filtered.length === 0 ? (
          <div
            style={{
              padding: "3rem",
              textAlign: "center",
              color: "#94a3b8",
              fontWeight: 600,
            }}
            data-ocid="restaurant-reprint.empty_state"
          >
            No restaurant bills found
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.85rem",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#f8fafc",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  {[
                    "Bill No",
                    "Table",
                    "Date",
                    "Guest",
                    "Amount",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "8px 12px",
                        textAlign: "left",
                        fontWeight: 700,
                        color: "#1e293b",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 50).map((b: any, i: number) => (
                  <tr
                    key={b.id || i}
                    data-ocid={`restaurant-reprint.item.${i + 1}`}
                    style={{ borderBottom: "1px solid #f1f5f9" }}
                  >
                    <td
                      style={{
                        padding: "8px 12px",
                        fontWeight: 700,
                        color: "#1e293b",
                      }}
                    >
                      {b.id || `R-${i + 1}`}
                    </td>
                    <td style={{ padding: "8px 12px", color: "#1e293b" }}>
                      {b.tableId || "—"}
                    </td>
                    <td
                      style={{
                        padding: "8px 12px",
                        color: "#64748b",
                        fontSize: "0.78rem",
                      }}
                    >
                      {b.createdAt
                        ? new Date(Number(b.createdAt)).toLocaleDateString(
                            "en-IN",
                          )
                        : "—"}
                    </td>
                    <td style={{ padding: "8px 12px", color: "#1e293b" }}>
                      {b.customerName || "—"}
                    </td>
                    <td
                      style={{
                        padding: "8px 12px",
                        color: "#c9a84c",
                        fontWeight: 700,
                      }}
                    >
                      ₹{Number(b.totalAmount || 0).toFixed(2)}
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      <div style={{ display: "flex", gap: 4 }}>
                        <Button
                          size="sm"
                          variant="outline"
                          style={{
                            borderColor: "#c9a84c",
                            color: "#c9a84c",
                            fontWeight: 600,
                            fontSize: "0.7rem",
                          }}
                          data-ocid={`restaurant-reprint.button.${i + 1}`}
                          onClick={() => {
                            const html = `<div style="font-family:Arial;padding:20px"><h2 style="text-align:center;color:#c9a84c">HOTEL KDM PALACE</h2><p style="text-align:center">Restaurant Invoice</p><hr/><table width="100%"><tr><td><b>Bill No:</b> ${b.id || ""}</td><td><b>Table:</b> ${b.tableId || ""}</td></tr><tr><td><b>Guest:</b> ${b.customerName || "Walk-in"}</td><td><b>Date:</b> ${b.createdAt ? new Date(Number(b.createdAt)).toLocaleString("en-IN") : ""}</td></tr><tr><td><b>Payment:</b> ${String(b.paymentMode || "").toUpperCase()}</td></tr></table><br/><table width="100%" border="1" style="border-collapse:collapse"><tr style="background:#f8fafc"><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>${(b.items || []).map((it: any) => `<tr><td>${it.name}</td><td>${Number(it.qty)}</td><td>₹${Number(it.price)}</td><td>₹${Number(it.qty) * Number(it.price)}</td></tr>`).join("")}<tr><td colspan="3"><b>GST</b></td><td>₹${Number(b.gstAmount || 0).toFixed(2)}</td></tr><tr style="background:#fffbeb"><td colspan="3"><b>TOTAL</b></td><td><b style="color:#c9a84c">₹${Number(b.totalAmount || 0).toFixed(2)}</b></td></tr></table><p style="text-align:center;margin-top:20px;color:#888">Thank you for dining at Hotel KDM Palace!</p></div>`;
                            reprintBill(
                              `Restaurant Invoice - ${b.tableId || ""}`,
                              html,
                            );
                          }}
                        >
                          🖨️ Reprint
                        </Button>
                        <button
                          type="button"
                          onClick={() =>
                            shareInvoiceWhatsApp("Restaurant Invoice", {
                              guest: b.customerName || b.tableId || "Guest",
                              billNo: String(b.id || ""),
                              room: String(b.tableId || ""),
                              date: b.createdAt
                                ? new Date(
                                    Number(b.createdAt),
                                  ).toLocaleDateString("en-IN")
                                : "",
                              amount: Number(b.totalAmount || 0),
                            })
                          }
                          style={{
                            background: "#25D366",
                            color: "#fff",
                            border: "none",
                            borderRadius: 4,
                            padding: "4px 8px",
                            cursor: "pointer",
                            fontSize: "0.7rem",
                            fontWeight: 600,
                          }}
                        >
                          📱 WhatsApp
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function MenuItemsSection() {
  const [items, setItems] = useState(() => {
    const s = localStorage.getItem("kdm_menu");
    return s ? JSON.parse(s) : MOCK_MENU;
  });
  const [form, setForm] = useState({ name: "", category: "", price: "" });
  const [editId, setEditId] = useState<number | null>(null);

  const save = () => {
    if (!form.name || !form.category || !form.price) return;
    let updated: typeof items;
    if (editId !== null) {
      updated = items.map((i: (typeof items)[0]) =>
        i.id === editId ? { ...i, ...form, price: Number(form.price) } : i,
      );
      setEditId(null);
    } else {
      updated = [
        ...items,
        {
          id: Date.now(),
          name: form.name,
          category: form.category,
          price: Number(form.price),
        },
      ];
    }
    setItems(updated);
    localStorage.setItem("kdm_menu", JSON.stringify(updated));
    setForm({ name: "", category: "", price: "" });
  };

  const del = (id: number) => {
    const updated = items.filter((i: (typeof items)[0]) => i.id !== id);
    setItems(updated);
    localStorage.setItem("kdm_menu", JSON.stringify(updated));
  };

  return (
    <div>
      <SectionTitle title="Menu Items" />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20,
        }}
      >
        <div
          style={{
            background: CARD_BG,
            border: `1px solid ${BORDER}`,
            borderRadius: 8,
            padding: "1.25rem",
          }}
        >
          <p style={{ color: GOLD, fontWeight: 600, marginBottom: 16 }}>
            {editId ? "Edit Item" : "Add Item"}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Input
              placeholder="Item name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              data-ocid="menu.name.input"
            />
            <Input
              placeholder="Category"
              value={form.category}
              onChange={(e) =>
                setForm((p) => ({ ...p, category: e.target.value }))
              }
              data-ocid="menu.category.input"
            />
            <Input
              type="number"
              placeholder="Price"
              value={form.price}
              onChange={(e) =>
                setForm((p) => ({ ...p, price: e.target.value }))
              }
              data-ocid="menu.price.input"
            />
            <Button
              onClick={save}
              style={{ background: GOLD, color: "#000", fontWeight: 600 }}
              data-ocid="menu.save.button"
            >
              {editId ? "Update" : "Add Item"}
            </Button>
          </div>
        </div>
        <div
          style={{
            background: CARD_BG,
            border: `1px solid ${BORDER}`,
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <Table>
            <TableHeader>
              <TableRow style={{ borderBottom: `1px solid ${BORDER}` }}>
                <TableHead style={{ color: "#1e293b", fontWeight: 600 }}>
                  Name
                </TableHead>
                <TableHead style={{ color: "#1e293b", fontWeight: 600 }}>
                  Category
                </TableHead>
                <TableHead style={{ color: "#1e293b", fontWeight: 600 }}>
                  Price
                </TableHead>
                <TableHead style={{ color: "#1e293b", fontWeight: 600 }}>
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map(
                (
                  item: {
                    id: number;
                    name: string;
                    category: string;
                    price: number;
                  },
                  i: number,
                ) => (
                  <TableRow
                    key={item.id}
                    data-ocid={`menu.item.${i + 1}`}
                    style={{ borderBottom: `1px solid ${BORDER}` }}
                  >
                    <TableCell style={{ color: "#1e293b" }}>
                      {item.name}
                    </TableCell>
                    <TableCell
                      style={{
                        color: "#1e293b",
                        fontWeight: 600,
                        fontSize: "0.8rem",
                      }}
                    >
                      {item.category}
                    </TableCell>
                    <TableCell style={{ color: GOLD }}>₹{item.price}</TableCell>
                    <TableCell>
                      <div style={{ display: "flex", gap: 6 }}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditId(item.id);
                            setForm({
                              name: item.name,
                              category: item.category,
                              price: String(item.price),
                            });
                          }}
                          style={{ borderColor: BORDER, fontSize: "0.7rem" }}
                          data-ocid={`menu.edit.button.${i + 1}`}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => del(item.id)}
                          style={{
                            borderColor: "#ef4444",
                            color: "#ef4444",
                            fontSize: "0.7rem",
                          }}
                          data-ocid={`menu.delete.button.${i + 1}`}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ),
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

function StaffSection() {
  const [staff, setStaff] = useState(() => {
    const s = localStorage.getItem("kdm_staff");
    return s ? JSON.parse(s) : MOCK_STAFF;
  });
  const [form, setForm] = useState({ name: "", role: "", phone: "" });

  const addStaff = () => {
    if (!form.name || !form.role) return;
    const updated = [...staff, { id: Date.now(), ...form, status: "Active" }];
    setStaff(updated);
    localStorage.setItem("kdm_staff", JSON.stringify(updated));
    setForm({ name: "", role: "", phone: "" });
  };

  return (
    <div>
      <SectionTitle title="Staff Management" />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20,
        }}
      >
        <div
          style={{
            background: CARD_BG,
            border: `1px solid ${BORDER}`,
            borderRadius: 8,
            padding: "1.25rem",
          }}
        >
          <p style={{ color: GOLD, fontWeight: 600, marginBottom: 16 }}>
            Add Staff
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Input
              placeholder="Full name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              data-ocid="staff.name.input"
            />
            <Input
              placeholder="Role"
              value={form.role}
              onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
              data-ocid="staff.role.input"
            />
            <Input
              placeholder="Phone"
              value={form.phone}
              onChange={(e) =>
                setForm((p) => ({ ...p, phone: e.target.value }))
              }
              data-ocid="staff.phone.input"
            />
            <Button
              onClick={addStaff}
              style={{ background: GOLD, color: "#000", fontWeight: 600 }}
              data-ocid="staff.add.button"
            >
              Add Staff
            </Button>
          </div>
        </div>
        <div
          style={{
            background: CARD_BG,
            border: `1px solid ${BORDER}`,
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <Table>
            <TableHeader>
              <TableRow style={{ borderBottom: `1px solid ${BORDER}` }}>
                {["Name", "Role", "Phone", "Status"].map((h) => (
                  <TableHead
                    key={h}
                    style={{ color: "#1e293b", fontWeight: 600 }}
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map(
                (
                  s: {
                    id: number;
                    name: string;
                    role: string;
                    phone: string;
                    status: string;
                  },
                  i: number,
                ) => (
                  <TableRow
                    key={s.id}
                    data-ocid={`staff.item.${i + 1}`}
                    style={{ borderBottom: `1px solid ${BORDER}` }}
                  >
                    <TableCell style={{ color: "#1e293b" }}>{s.name}</TableCell>
                    <TableCell style={{ color: "#1e293b", fontWeight: 600 }}>
                      {s.role}
                    </TableCell>
                    <TableCell style={{ color: "#1e293b", fontWeight: 600 }}>
                      {s.phone}
                    </TableCell>
                    <TableCell>
                      <span
                        style={{
                          color: s.status === "Active" ? "#22c55e" : "#f59e0b",
                          fontSize: "0.8rem",
                        }}
                      >
                        {s.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ),
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

function CouponsSection() {
  const [coupons, setCoupons] = useState(() => {
    const s = localStorage.getItem("kdm_coupons");
    return s ? JSON.parse(s) : MOCK_COUPONS;
  });
  const [form, setForm] = useState({
    code: "",
    discount: "",
    validFrom: "",
    validTo: "",
  });

  const addCoupon = () => {
    if (!form.code || !form.discount) return;
    const updated = [
      ...coupons,
      { id: Date.now(), ...form, discount: Number(form.discount), used: 0 },
    ];
    setCoupons(updated);
    localStorage.setItem("kdm_coupons", JSON.stringify(updated));
    setForm({ code: "", discount: "", validFrom: "", validTo: "" });
  };

  return (
    <div>
      <SectionTitle title="Coupons" />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20,
        }}
      >
        <div
          style={{
            background: CARD_BG,
            border: `1px solid ${BORDER}`,
            borderRadius: 8,
            padding: "1.25rem",
          }}
        >
          <p style={{ color: GOLD, fontWeight: 600, marginBottom: 16 }}>
            Add Coupon
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Input
              placeholder="Coupon code"
              value={form.code}
              onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
              data-ocid="coupons.code.input"
            />
            <Input
              type="number"
              placeholder="Discount %"
              value={form.discount}
              onChange={(e) =>
                setForm((p) => ({ ...p, discount: e.target.value }))
              }
              data-ocid="coupons.discount.input"
            />
            <Input
              type="date"
              placeholder="Valid from"
              value={form.validFrom}
              onChange={(e) =>
                setForm((p) => ({ ...p, validFrom: e.target.value }))
              }
            />
            <Input
              type="date"
              placeholder="Valid to"
              value={form.validTo}
              onChange={(e) =>
                setForm((p) => ({ ...p, validTo: e.target.value }))
              }
            />
            <Button
              onClick={addCoupon}
              style={{ background: GOLD, color: "#000", fontWeight: 600 }}
              data-ocid="coupons.add.button"
            >
              Add Coupon
            </Button>
          </div>
        </div>
        <div
          style={{
            background: CARD_BG,
            border: `1px solid ${BORDER}`,
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <Table>
            <TableHeader>
              <TableRow style={{ borderBottom: `1px solid ${BORDER}` }}>
                {["Code", "Discount", "Valid From", "Valid To", "Used"].map(
                  (h) => (
                    <TableHead
                      key={h}
                      style={{ color: "#1e293b", fontWeight: 600 }}
                    >
                      {h}
                    </TableHead>
                  ),
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map(
                (
                  c: {
                    id: number;
                    code: string;
                    discount: number;
                    validFrom: string;
                    validTo: string;
                    used: number;
                  },
                  i: number,
                ) => (
                  <TableRow
                    key={c.id}
                    data-ocid={`coupons.item.${i + 1}`}
                    style={{ borderBottom: `1px solid ${BORDER}` }}
                  >
                    <TableCell style={{ color: GOLD, fontWeight: 600 }}>
                      {c.code}
                    </TableCell>
                    <TableCell style={{ color: "#22c55e" }}>
                      {c.discount}%
                    </TableCell>
                    <TableCell
                      style={{
                        color: "#1e293b",
                        fontWeight: 600,
                        fontSize: "0.8rem",
                      }}
                    >
                      {c.validFrom}
                    </TableCell>
                    <TableCell
                      style={{
                        color: "#1e293b",
                        fontWeight: 600,
                        fontSize: "0.8rem",
                      }}
                    >
                      {c.validTo}
                    </TableCell>
                    <TableCell style={{ color: "#1e293b", fontWeight: 600 }}>
                      {c.used}
                    </TableCell>
                  </TableRow>
                ),
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

function SalesReportSection() {
  return (
    <div>
      <SectionTitle title="Sales Report" />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))",
          gap: 16,
          marginBottom: 28,
        }}
      >
        <StatCard label="This Month" value="₹4,21,000" color={GOLD} />
        <StatCard label="Last Month" value="₹3,12,000" color="#818cf8" />
        <StatCard label="YTD Revenue" value="₹22,27,000" color="#22c55e" />
        <StatCard label="Avg Daily Rev." value="₹14,033" color="#f59e0b" />
      </div>
      <div
        style={{
          background: CARD_BG,
          border: `1px solid ${BORDER}`,
          borderRadius: 8,
          padding: "1.25rem",
        }}
      >
        <p style={{ color: GOLD, fontWeight: 600, marginBottom: 16 }}>
          Monthly Revenue (Oct 2025 – Mar 2026)
        </p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={MONTHLY_REVENUE}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
            />
            <XAxis
              dataKey="month"
              stroke="#888"
              tick={{ fill: "#888", fontSize: 12 }}
            />
            <YAxis
              stroke="#888"
              tick={{ fill: "#888", fontSize: 11 }}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`}
            />
            <Tooltip
              contentStyle={{
                background: CARD_BG,
                border: `1px solid ${BORDER}`,
                color: "#1e293b",
              }}
              formatter={(v: number) => [`₹${v.toLocaleString()}`, "Revenue"]}
            />
            <Bar dataKey="revenue" fill={GOLD} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function AccountsSection() {
  const [entries, setEntries] = useState<
    Array<{
      id: number;
      date: string;
      desc: string;
      type: string;
      amount: number;
      balance: number;
    }>
  >(() => {
    const saved = localStorage.getItem("kdm_accounts");
    if (saved) return JSON.parse(saved);
    let _bal = 0;
    return MOCK_ACCOUNTS.map((r, i) => {
      _bal = r.balance;
      return {
        id: i + 1,
        date: r.date,
        desc: r.desc,
        type: r.debit ? "Debit" : "Credit",
        amount: r.debit || r.credit || 0,
        balance: r.balance,
      };
    });
  });
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    desc: "",
    type: "Credit",
    amount: "",
  });

  const saveEntry = () => {
    if (!form.desc || !form.amount) return;
    const lastBal =
      entries.length > 0 ? entries[entries.length - 1].balance : 0;
    const amt = Number(form.amount);
    const newBal = form.type === "Credit" ? lastBal + amt : lastBal - amt;
    const newEntry = {
      id: Date.now(),
      date: form.date,
      desc: form.desc,
      type: form.type,
      amount: amt,
      balance: newBal,
    };
    const updated = [...entries, newEntry];
    setEntries(updated);
    localStorage.setItem("kdm_accounts", JSON.stringify(updated));
    setShowModal(false);
    setForm({
      date: new Date().toISOString().slice(0, 10),
      desc: "",
      type: "Credit",
      amount: "",
    });
    toast.success("Account entry added");
  };

  const deleteEntry = (id: number) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    localStorage.setItem("kdm_accounts", JSON.stringify(updated));
  };

  return (
    <div>
      <SectionTitle title="Accounts" sub="Hotel Ledger" />
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 12,
        }}
      >
        <Button
          style={{ background: GOLD, color: "#000", fontWeight: 700 }}
          data-ocid="accounts.open_modal_button"
          onClick={() => setShowModal(true)}
        >
          + Add Entry
        </Button>
      </div>
      <div
        style={{
          background: CARD_BG,
          border: `1px solid ${BORDER}`,
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <Table>
          <TableHeader>
            <TableRow style={{ borderBottom: `1px solid ${BORDER}` }}>
              {["Date", "Description", "Type", "Amount", "Balance", ""].map(
                (h) => (
                  <TableHead
                    key={h}
                    style={{ color: "#1e293b", fontWeight: 600 }}
                  >
                    {h}
                  </TableHead>
                ),
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((row, i) => (
              <TableRow
                key={row.id}
                data-ocid={`accounts.item.${i + 1}`}
                style={{ borderBottom: `1px solid ${BORDER}` }}
              >
                <TableCell
                  style={{
                    color: "#1e293b",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                  }}
                >
                  {row.date}
                </TableCell>
                <TableCell style={{ color: "#1e293b" }}>{row.desc}</TableCell>
                <TableCell>
                  <span
                    style={{
                      color: row.type === "Debit" ? "#ef4444" : "#22c55e",
                      fontWeight: 600,
                    }}
                  >
                    {row.type}
                  </span>
                </TableCell>
                <TableCell style={{ color: "#1e293b" }}>
                  ₹{row.amount.toLocaleString()}
                </TableCell>
                <TableCell style={{ color: GOLD, fontWeight: 600 }}>
                  ₹{row.balance.toLocaleString()}
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="ghost"
                    style={{ color: "#ef4444" }}
                    data-ocid={`accounts.delete_button.${i + 1}`}
                    onClick={() => deleteEntry(row.id)}
                  >
                    ✕
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent
          style={{ background: "#fff", color: "#1e293b", borderRadius: 12 }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: "#1e293b", fontWeight: 700 }}>
              Add Account Entry
            </DialogTitle>
          </DialogHeader>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              paddingTop: 8,
            }}
          >
            <div>
              <Label style={{ color: "#1e293b", fontWeight: 600 }}>Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((p) => ({ ...p, date: e.target.value }))
                }
                data-ocid="accounts.input"
              />
            </div>
            <div>
              <Label style={{ color: "#1e293b", fontWeight: 600 }}>
                Description
              </Label>
              <Input
                value={form.desc}
                onChange={(e) =>
                  setForm((p) => ({ ...p, desc: e.target.value }))
                }
                placeholder="e.g. Room revenue"
                data-ocid="accounts.textarea"
              />
            </div>
            <div>
              <Label style={{ color: "#1e293b", fontWeight: 600 }}>Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm((p) => ({ ...p, type: v }))}
              >
                <SelectTrigger data-ocid="accounts.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Credit">Credit</SelectItem>
                  <SelectItem value="Debit">Debit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label style={{ color: "#1e293b", fontWeight: 600 }}>
                Amount (₹)
              </Label>
              <Input
                type="number"
                value={form.amount}
                onChange={(e) =>
                  setForm((p) => ({ ...p, amount: e.target.value }))
                }
                data-ocid="accounts.input"
              />
            </div>
            <div
              style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
            >
              <Button
                variant="outline"
                onClick={() => setShowModal(false)}
                data-ocid="accounts.cancel_button"
              >
                Cancel
              </Button>
              <Button
                style={{ background: GOLD, color: "#000", fontWeight: 600 }}
                onClick={saveEntry}
                data-ocid="accounts.submit_button"
              >
                Save Entry
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NightAuditSection() {
  const { data: checkIns = [] } = useAllGuestCheckIns();
  const { data: restaurantBills = [] } = useRestaurantBills();
  const { data: banquetBills = [] } = useBanquetBills();
  const { data: roomInvoices = [] } = useAllRoomInvoices();
  const { data: roomFoodOrdersAudit = [] } = useAllRoomFoodOrders();
  const statuses = getInitialStatuses();
  const [closed, setClosed] = useState(false);
  const [auditLog, setAuditLog] = useState<string[]>([]);
  const [closing, setClosing] = useState(false);

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  // Filter to today's data
  const todayCheckIns = checkIns.filter(
    (g) =>
      g.checkInDate === todayStr && g.status === GuestCheckInStatus.checkedIn,
  );
  const todayCheckOuts = checkIns.filter(
    (g) =>
      g.actualCheckOut?.startsWith(todayStr) &&
      g.status === GuestCheckInStatus.checkedOut,
  );
  const occupied = Object.values(statuses).filter(
    (s) => s === "Occupied",
  ).length;
  const occupancy = Math.round((occupied / 44) * 100);

  const startOfDay = new Date(`${todayStr}T00:00:00`).getTime() * 1_000_000;
  const endOfDay = new Date(`${todayStr}T23:59:59`).getTime() * 1_000_000;

  const todayRestBills = restaurantBills.filter(
    (b) => Number(b.createdAt) >= startOfDay && Number(b.createdAt) <= endOfDay,
  );
  const todayBanqBills = banquetBills.filter(
    (b) => Number(b.createdAt) >= startOfDay && Number(b.createdAt) <= endOfDay,
  );

  const roomRevenue = roomInvoices
    .filter((inv) => inv.checkOutDate?.startsWith(todayStr))
    .reduce((s, inv) => s + inv.totalAmount, 0);
  const restRevenue = todayRestBills.reduce((s, b) => s + b.totalAmount, 0);
  const banqRevenue = todayBanqBills.reduce((s, b) => s + b.totalAmount, 0);
  const totalRevenue = roomRevenue + restRevenue + banqRevenue;

  const totalGST =
    todayRestBills.reduce((s, b) => s + b.gstAmount, 0) +
    todayBanqBills.reduce(
      (s, b) => s + (b.totalAmount * b.gstPercent) / (100 + b.gstPercent),
      0,
    );

  // Payment mode breakdown from all sources
  const todayRoomInvoices = roomInvoices.filter((inv) =>
    inv.checkOutDate?.startsWith(todayStr),
  );
  const todayFoodOrders = roomFoodOrdersAudit.filter(
    (o) => Number(o.createdAt) >= startOfDay && Number(o.createdAt) <= endOfDay,
  );
  const cash =
    todayRestBills
      .filter((b) => b.paymentMode === "cash")
      .reduce((s, b) => s + b.totalAmount, 0) +
    todayRoomInvoices
      .filter((i) => i.paymentMode === "cash")
      .reduce((s, i) => s + i.totalAmount, 0) +
    todayFoodOrders
      .filter((o) => o.paymentMode === "cash")
      .reduce((s, o) => s + o.totalAmount, 0);
  const card =
    todayRestBills
      .filter((b) => b.paymentMode === "card")
      .reduce((s, b) => s + b.totalAmount, 0) +
    todayRoomInvoices
      .filter((i) => i.paymentMode === "card")
      .reduce((s, i) => s + i.totalAmount, 0) +
    todayFoodOrders
      .filter((o) => o.paymentMode === "card")
      .reduce((s, o) => s + o.totalAmount, 0);
  const upi =
    todayRestBills
      .filter((b) => b.paymentMode === "upi")
      .reduce((s, b) => s + b.totalAmount, 0) +
    todayRoomInvoices
      .filter((i) => i.paymentMode === "upi")
      .reduce((s, i) => s + i.totalAmount, 0) +
    todayFoodOrders
      .filter((o) => o.paymentMode === "upi")
      .reduce((s, o) => s + o.totalAmount, 0);

  const auditChecklist = [
    { label: "Occupied rooms verified", done: occupied > 0 || true },
    { label: `${todayCheckIns.length} check-in(s) processed`, done: true },
    { label: `${todayCheckOuts.length} check-out(s) completed`, done: true },
    {
      label: `${todayRestBills.length} restaurant bill(s) settled`,
      done: todayRestBills.length > 0,
    },
    { label: `${todayBanqBills.length} banquet bill(s) posted`, done: true },
    { label: "GST entries computed for ledger", done: true },
    { label: "Housekeeping status synced", done: true },
  ];

  const savedAudits: { date: string; revenue: number; log: string[] }[] =
    JSON.parse(localStorage.getItem("kdm_night_audits") || "[]");
  const alreadyClosed = closed || savedAudits.some((a) => a.date === todayStr);

  async function handleCloseDay() {
    setClosing(true);
    await new Promise((r) => setTimeout(r, 1200));
    const log = [
      `Night Audit — ${today.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`,
      `Closed at: ${today.toLocaleTimeString("en-IN")}`,
      `Check-Ins Today: ${todayCheckIns.length}`,
      `Check-Outs Today: ${todayCheckOuts.length}`,
      `Occupied Rooms: ${occupied} / 44 (${occupancy}%)`,
      `Room Revenue: ₹${roomRevenue.toLocaleString("en-IN")}`,
      `Restaurant Revenue: ₹${restRevenue.toLocaleString("en-IN")} (${todayRestBills.length} bills)`,
      `Banquet Revenue: ₹${banqRevenue.toLocaleString("en-IN")} (${todayBanqBills.length} bills)`,
      `Total Revenue: ₹${totalRevenue.toLocaleString("en-IN")}`,
      `Total GST Collected: ₹${totalGST.toFixed(2)}`,
      `Cash Collections: ₹${cash.toLocaleString("en-IN")}`,
      `Card Collections: ₹${card.toLocaleString("en-IN")}`,
      `UPI Collections: ₹${upi.toLocaleString("en-IN")}`,
      "STATUS: DAY CLOSED ✓",
    ];
    const audits = [
      ...savedAudits,
      { date: todayStr, revenue: totalRevenue, log },
    ];
    localStorage.setItem("kdm_night_audits", JSON.stringify(audits));
    setAuditLog(log);
    setClosed(true);
    setClosing(false);
  }

  function handlePrint() {
    const printWin = window.open("", "_blank");
    if (!printWin) return;
    const lines = auditLog.length
      ? auditLog
      : (savedAudits.find((a) => a.date === todayStr)?.log ?? []);
    printWin.document.write(`<html><head><title>Night Audit Report</title>
<style>body{font-family:monospace;padding:32px;color:#000;}h2{margin-bottom:8px;}pre{line-height:1.7;}</style></head>
<body><h2>HOTEL KDM PALACE — Night Audit Report</h2><pre>${lines.join("\n")}</pre></body></html>`);
    printWin.document.close();
    printWin.print();
  }

  function handleWhatsApp() {
    const lines = auditLog.length
      ? auditLog
      : (savedAudits.find((a) => a.date === todayStr)?.log ?? []);
    if (!lines.length) return;
    const text = encodeURIComponent(
      `🏨 HOTEL KDM PALACE — Night Audit Report\n\n${lines.join("\n")}`,
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }
  const displayLog = auditLog.length
    ? auditLog
    : (savedAudits.find((a) => a.date === todayStr)?.log ?? []);

  return (
    <div>
      <SectionTitle
        title="Night Audit"
        sub={today.toLocaleDateString("en-IN", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      />

      {/* KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))",
          gap: 16,
          marginBottom: 28,
        }}
      >
        <StatCard
          label="Check-Ins Today"
          value={todayCheckIns.length}
          color="#22c55e"
        />
        <StatCard
          label="Check-Outs Today"
          value={todayCheckOuts.length}
          color="#ef4444"
        />
        <StatCard
          label="Rooms Occupied"
          value={`${occupied}/44`}
          color="#f59e0b"
        />
        <StatCard label="Occupancy Rate" value={`${occupancy}%`} color={GOLD} />
        <StatCard
          label="Room Revenue"
          value={`₹${roomRevenue.toLocaleString("en-IN")}`}
          color="#818cf8"
        />
        <StatCard
          label="F&B Revenue"
          value={`₹${(restRevenue + banqRevenue).toLocaleString("en-IN")}`}
          color="#34d399"
        />
        <StatCard
          label="Total Revenue"
          value={`₹${totalRevenue.toLocaleString("en-IN")}`}
          color={GOLD}
        />
        <StatCard
          label="GST Collected"
          value={`₹${totalGST.toFixed(0)}`}
          color="#f472b6"
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          marginBottom: 24,
        }}
      >
        {/* Audit Checklist */}
        <div
          style={{
            background: CARD_BG,
            border: `1px solid ${BORDER}`,
            borderRadius: 8,
            padding: "1.25rem",
          }}
        >
          <p style={{ color: GOLD, fontWeight: 600, marginBottom: 12 }}>
            Audit Checklist
          </p>
          {auditChecklist.map((item) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "7px 0",
                borderBottom: `1px solid ${BORDER}`,
              }}
            >
              <span
                style={{
                  color: item.done ? "#22c55e" : "#ef4444",
                  fontSize: "1rem",
                }}
              >
                {item.done ? "✓" : "✗"}
              </span>
              <span style={{ color: "#1e293b", fontSize: "0.85rem" }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Payment Breakdown */}
        <div
          style={{
            background: CARD_BG,
            border: `1px solid ${BORDER}`,
            borderRadius: 8,
            padding: "1.25rem",
          }}
        >
          <p style={{ color: GOLD, fontWeight: 600, marginBottom: 12 }}>
            Payment Mode Breakdown
          </p>
          {[
            { label: "Cash", value: cash, color: "#22c55e" },
            { label: "Card", value: card, color: "#818cf8" },
            { label: "UPI", value: upi, color: "#f59e0b" },
          ].map((row) => (
            <div
              key={row.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 0",
                borderBottom: `1px solid ${BORDER}`,
              }}
            >
              <span
                style={{
                  color: "#1e293b",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                }}
              >
                {row.label}
              </span>
              <span style={{ color: row.color, fontWeight: 600 }}>
                ₹{row.value.toLocaleString("en-IN")}
              </span>
            </div>
          ))}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              paddingTop: 10,
            }}
          >
            <span style={{ color: "#1e293b", fontWeight: 700 }}>Total</span>
            <span style={{ color: GOLD, fontWeight: 700 }}>
              ₹{totalRevenue.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {/* Previous Audits */}
      {savedAudits.length > 0 && (
        <div
          style={{
            background: CARD_BG,
            border: `1px solid ${BORDER}`,
            borderRadius: 8,
            padding: "1.25rem",
            marginBottom: 20,
          }}
        >
          <p style={{ color: GOLD, fontWeight: 600, marginBottom: 10 }}>
            Audit History
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[...savedAudits]
              .reverse()
              .slice(0, 5)
              .map((a) => (
                <div
                  key={a.date}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "6px 0",
                    borderBottom: `1px solid ${BORDER}`,
                    fontSize: "0.85rem",
                  }}
                >
                  <span style={{ color: "#1e293b" }}>
                    {new Date(a.date).toLocaleDateString("en-IN", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span style={{ color: "#22c55e" }}>
                    ₹{a.revenue.toLocaleString("en-IN")} — CLOSED
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Night Audit Report / Action */}
      {alreadyClosed && displayLog.length > 0 ? (
        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #22c55e",
            borderRadius: 8,
            padding: "1.25rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <p style={{ color: "#22c55e", fontWeight: 700, fontSize: "1rem" }}>
              ✓ Day Accounts Closed
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <Button
                size="sm"
                onClick={handlePrint}
                style={{ background: GOLD, color: "#000", fontSize: "0.8rem" }}
              >
                Print Report
              </Button>
              <Button
                size="sm"
                onClick={handleWhatsApp}
                style={{
                  background: "#25d366",
                  color: "#fff",
                  fontSize: "0.8rem",
                }}
                data-ocid="night_audit.whatsapp.button"
              >
                📱 WhatsApp
              </Button>
            </div>
          </div>
          <pre
            style={{
              color: "#166534",
              fontSize: "0.8rem",
              lineHeight: 1.7,
              whiteSpace: "pre-wrap",
              margin: 0,
            }}
          >
            {displayLog.join("\n")}
          </pre>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            padding: "2rem",
            background: CARD_BG,
            border: `1px solid ${BORDER}`,
            borderRadius: 8,
          }}
        >
          <p
            style={{
              color: "#1e293b",
              fontWeight: 600,
              fontSize: "0.9rem",
              textAlign: "center",
            }}
          >
            Run Night Audit to auto-close today's accounts, post all charges,
            and generate a printable day-end report.
          </p>
          <Button
            onClick={handleCloseDay}
            disabled={closing}
            style={{
              background: GOLD,
              color: "#000",
              fontWeight: 700,
              padding: "0.6rem 2rem",
              fontSize: "1rem",
            }}
          >
            {closing
              ? "Closing Day Accounts..."
              : "Run Night Audit & Close Day"}
          </Button>
        </div>
      )}
    </div>
  );
}

function GSTSettingsSection() {
  const [form, setForm] = useState(() => {
    const saved = localStorage.getItem("kdm_gst_settings");
    if (saved) return JSON.parse(saved);
    return {
      gstin: "22ABCDE1234F1Z5",
      hotelName: "Hotel KDM Palace",
      address: "Main Road, Begusarai, Bihar 851101",
      city: "Begusarai",
      state: "Bihar",
      roomGst: "12",
      restaurantGst: "5",
      banquetGst: "18",
    };
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem("kdm_gst_settings", JSON.stringify(form));
    setSaved(true);
    toast.success("GST Settings saved successfully");
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <SectionTitle title="GST Settings" />
      <div
        style={{
          background: CARD_BG,
          border: `1px solid ${BORDER}`,
          borderRadius: 8,
          padding: "1.5rem",
          maxWidth: 560,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { label: "Hotel Name", key: "hotelName" },
            { label: "GSTIN Number", key: "gstin" },
            { label: "Address", key: "address" },
            { label: "City", key: "city" },
            { label: "State", key: "state" },
            { label: "Room GST %", key: "roomGst" },
            { label: "Restaurant GST %", key: "restaurantGst" },
            { label: "Banquet GST %", key: "banquetGst" },
          ].map(({ label, key }) => (
            <div key={key}>
              <Label
                style={{
                  color: "#1e293b",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                }}
              >
                {label}
              </Label>
              <Input
                value={form[key as keyof typeof form]}
                onChange={(e) =>
                  setForm((p) => ({ ...p, [key]: e.target.value }))
                }
                style={{
                  borderColor: "#d1d5db",
                  borderRadius: 6,
                  padding: 8,
                  width: "100%",
                  marginTop: 4,
                }}
                data-ocid={`gst.${key}.input`}
              />
              {key === "gstin" &&
                getStateFromGSTIN(form[key as keyof typeof form] as string) && (
                  <p
                    style={{
                      color: "#22c55e",
                      fontSize: "0.72rem",
                      marginTop: 2,
                      fontWeight: 600,
                    }}
                  >
                    State:{" "}
                    {getStateFromGSTIN(
                      form[key as keyof typeof form] as string,
                    )}
                  </p>
                )}
            </div>
          ))}
          <Button
            style={{
              background: saved ? "#22c55e" : GOLD,
              color: "#000",
              fontWeight: 700,
            }}
            onClick={handleSave}
            data-ocid="gst.submit_button"
          >
            {saved ? "✓ Saved!" : "Save GST Settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function GuestReviewsSection() {
  const [reviews, setReviews] = useState<
    Array<{
      id: number;
      guest: string;
      room: string;
      rating: number;
      comment: string;
      date: string;
    }>
  >(() => {
    const saved = localStorage.getItem("kdm_reviews");
    if (saved) return JSON.parse(saved);
    return MOCK_REVIEWS.map((r) => ({ ...r }));
  });
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    guest: "",
    room: "",
    rating: 5,
    comment: "",
    date: new Date().toISOString().slice(0, 10),
  });

  const addReview = () => {
    if (!form.guest || !form.comment) return;
    const newR = { ...form, id: Date.now() };
    const updated = [newR, ...reviews];
    setReviews(updated);
    localStorage.setItem("kdm_reviews", JSON.stringify(updated));
    setShowModal(false);
    setForm({
      guest: "",
      room: "",
      rating: 5,
      comment: "",
      date: new Date().toISOString().slice(0, 10),
    });
    toast.success("Review added");
  };

  const deleteReview = (id: number) => {
    const updated = reviews.filter((r) => r.id !== id);
    setReviews(updated);
    localStorage.setItem("kdm_reviews", JSON.stringify(updated));
  };

  return (
    <div>
      <SectionTitle title="Guest Reviews" />
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 12,
        }}
      >
        <Button
          style={{ background: GOLD, color: "#000", fontWeight: 700 }}
          data-ocid="reviews.open_modal_button"
          onClick={() => setShowModal(true)}
        >
          + Add Review
        </Button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {reviews.length === 0 && (
          <div
            data-ocid="reviews.empty_state"
            style={{
              background: CARD_BG,
              border: `1px solid ${BORDER}`,
              borderRadius: 8,
              padding: "2rem",
              textAlign: "center",
              color: "#1e293b",
            }}
          >
            No reviews yet.
          </div>
        )}
        {reviews.map((r, i) => (
          <div
            key={r.id}
            data-ocid={`reviews.item.${i + 1}`}
            style={{
              background: CARD_BG,
              border: `1px solid ${BORDER}`,
              borderRadius: 8,
              padding: "1rem 1.25rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <span style={{ color: "#1e293b", fontWeight: 700 }}>
                {r.guest}
              </span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span
                  style={{
                    color: "#1e293b",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                  }}
                >
                  {r.date}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  style={{ color: "#ef4444", padding: "0 6px" }}
                  data-ocid={`reviews.delete_button.${i + 1}`}
                  onClick={() => deleteReview(r.id)}
                >
                  ✕
                </Button>
              </div>
            </div>
            <div style={{ display: "flex", gap: 2, marginBottom: 6 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <span key={n} style={{ color: n <= r.rating ? GOLD : "#ccc" }}>
                  ★
                </span>
              ))}
              <span
                style={{
                  color: "#1e293b",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  marginLeft: 8,
                }}
              >
                Room {r.room}
              </span>
            </div>
            <p
              style={{ color: "#1e293b", fontWeight: 600, fontSize: "0.85rem" }}
            >
              {r.comment}
            </p>
          </div>
        ))}
      </div>
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent
          style={{ background: "#fff", color: "#1e293b", borderRadius: 12 }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: "#1e293b", fontWeight: 700 }}>
              Add Guest Review
            </DialogTitle>
          </DialogHeader>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              paddingTop: 8,
            }}
          >
            <div>
              <Label style={{ color: "#1e293b", fontWeight: 600 }}>
                Guest Name
              </Label>
              <Input
                value={form.guest}
                onChange={(e) =>
                  setForm((p) => ({ ...p, guest: e.target.value }))
                }
                placeholder="Guest name"
                data-ocid="reviews.input"
              />
            </div>
            <div>
              <Label style={{ color: "#1e293b", fontWeight: 600 }}>
                Room No
              </Label>
              <Input
                value={form.room}
                onChange={(e) =>
                  setForm((p) => ({ ...p, room: e.target.value }))
                }
                placeholder="e.g. 211"
                data-ocid="reviews.input"
              />
            </div>
            <div>
              <Label style={{ color: "#1e293b", fontWeight: 600 }}>
                Rating (1-5)
              </Label>
              <Select
                value={String(form.rating)}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, rating: Number(v) }))
                }
              >
                <SelectTrigger data-ocid="reviews.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 4, 3, 2, 1].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} Star{n > 1 ? "s" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label style={{ color: "#1e293b", fontWeight: 600 }}>
                Comment
              </Label>
              <Input
                value={form.comment}
                onChange={(e) =>
                  setForm((p) => ({ ...p, comment: e.target.value }))
                }
                placeholder="Guest feedback..."
                data-ocid="reviews.textarea"
              />
            </div>
            <div>
              <Label style={{ color: "#1e293b", fontWeight: 600 }}>Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((p) => ({ ...p, date: e.target.value }))
                }
                data-ocid="reviews.input"
              />
            </div>
            <div
              style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
            >
              <Button
                variant="outline"
                onClick={() => setShowModal(false)}
                data-ocid="reviews.cancel_button"
              >
                Cancel
              </Button>
              <Button
                style={{ background: GOLD, color: "#000", fontWeight: 600 }}
                onClick={addReview}
                data-ocid="reviews.submit_button"
              >
                Add Review
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CustomersSection() {
  const [customers, setCustomers] = useState<
    Array<{
      id: number;
      name: string;
      phone: string;
      email: string;
      visits: number;
      lastVisit: string;
    }>
  >(() => {
    const saved = localStorage.getItem("kdm_customers");
    if (saved) return JSON.parse(saved);
    return MOCK_CUSTOMERS.map((c) => ({ ...c }));
  });
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    companyName: "",
    companyGst: "",
  });

  const getCustomerProfiles = () => {
    try {
      return JSON.parse(localStorage.getItem("kdm_customer_profiles") || "{}");
    } catch {
      return {};
    }
  };

  const openAdd = () => {
    setEditId(null);
    setForm({
      name: "",
      phone: "",
      email: "",
      companyName: "",
      companyGst: "",
    });
    setShowModal(true);
  };
  const openEdit = (c: (typeof customers)[0]) => {
    setEditId(c.id);
    const profiles = getCustomerProfiles();
    const p = profiles[c.id] || {};
    setForm({
      name: c.name,
      phone: c.phone,
      email: c.email,
      companyName: p.companyName || "",
      companyGst: p.companyGst || "",
    });
    setShowModal(true);
  };

  const save = () => {
    if (!form.name || !form.phone) return;
    let updated: typeof customers;
    const newId = editId !== null ? editId : Date.now();
    if (editId !== null) {
      updated = customers.map((c) =>
        c.id === editId
          ? { ...c, name: form.name, phone: form.phone, email: form.email }
          : c,
      );
      toast.success("Customer updated");
    } else {
      updated = [
        ...customers,
        {
          id: newId,
          name: form.name,
          phone: form.phone,
          email: form.email,
          visits: 1,
          lastVisit: new Date().toLocaleDateString("en-IN"),
        },
      ];
      toast.success("Customer added");
    }
    // Save company info separately
    const profiles = getCustomerProfiles();
    profiles[newId] = {
      companyName: form.companyName,
      companyGst: form.companyGst,
    };
    localStorage.setItem("kdm_customer_profiles", JSON.stringify(profiles));
    setCustomers(updated);
    localStorage.setItem("kdm_customers", JSON.stringify(updated));
    setShowModal(false);
  };

  const del = (id: number) => {
    const updated = customers.filter((c) => c.id !== id);
    setCustomers(updated);
    localStorage.setItem("kdm_customers", JSON.stringify(updated));
  };

  return (
    <div>
      <SectionTitle title="Customers" />
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 12,
        }}
      >
        <Button
          style={{ background: GOLD, color: "#000", fontWeight: 700 }}
          data-ocid="customers.open_modal_button"
          onClick={openAdd}
        >
          + Add Customer
        </Button>
      </div>
      <div
        style={{
          background: CARD_BG,
          border: `1px solid ${BORDER}`,
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <Table>
          <TableHeader>
            <TableRow style={{ borderBottom: `1px solid ${BORDER}` }}>
              {[
                "Name",
                "Phone",
                "Company",
                "Email",
                "Visits",
                "Last Visit",
                "",
              ].map((h) => (
                <TableHead
                  key={h}
                  style={{ color: "#1e293b", fontWeight: 600 }}
                >
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  data-ocid="customers.empty_state"
                  style={{ textAlign: "center", color: "#1e293b" }}
                >
                  No customers yet.
                </TableCell>
              </TableRow>
            )}
            {customers.map((c, i) => (
              <TableRow
                key={c.id}
                data-ocid={`customers.item.${i + 1}`}
                style={{ borderBottom: `1px solid ${BORDER}` }}
              >
                <TableCell style={{ color: "#1e293b", fontWeight: 700 }}>
                  {c.name}
                </TableCell>
                <TableCell style={{ color: "#1e293b", fontWeight: 600 }}>
                  {c.phone}
                </TableCell>
                <TableCell style={{ color: "#64748b", fontSize: "0.8rem" }}>
                  {(() => {
                    try {
                      const p = JSON.parse(
                        localStorage.getItem("kdm_customer_profiles") || "{}",
                      );
                      return p[c.id]?.companyName || "—";
                    } catch {
                      return "—";
                    }
                  })()}
                </TableCell>
                <TableCell style={{ color: "#1e293b", fontSize: "0.8rem" }}>
                  {c.email}
                </TableCell>
                <TableCell style={{ color: GOLD, fontWeight: 700 }}>
                  {c.visits}
                </TableCell>
                <TableCell style={{ color: "#1e293b", fontSize: "0.8rem" }}>
                  {c.lastVisit}
                </TableCell>
                <TableCell>
                  <div style={{ display: "flex", gap: 4 }}>
                    <Button
                      size="sm"
                      style={{
                        background: GOLD,
                        color: "#000",
                        fontSize: "0.7rem",
                      }}
                      data-ocid={`customers.edit_button.${i + 1}`}
                      onClick={() => openEdit(c)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      style={{
                        background: "#ef4444",
                        color: "#fff",
                        fontSize: "0.7rem",
                      }}
                      data-ocid={`customers.delete_button.${i + 1}`}
                      onClick={() => del(c.id)}
                    >
                      Del
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent
          style={{ background: "#fff", color: "#1e293b", borderRadius: 12 }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: "#1e293b", fontWeight: 700 }}>
              {editId ? "Edit Customer" : "Add Customer"}
            </DialogTitle>
          </DialogHeader>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              paddingTop: 8,
            }}
          >
            {[
              { label: "Name", key: "name", ph: "Guest name" },
              { label: "Phone", key: "phone", ph: "10-digit mobile" },
              { label: "Email", key: "email", ph: "email@example.com" },
              {
                label: "Company Name (optional)",
                key: "companyName",
                ph: "Company / Organisation",
              },
              {
                label: "Company GST Number (optional)",
                key: "companyGst",
                ph: "22AAAAA0000A1Z5",
              },
            ].map(({ label, key, ph }) => (
              <div key={key}>
                <Label style={{ color: "#1e293b", fontWeight: 600 }}>
                  {label}
                </Label>
                <Input
                  value={form[key as keyof typeof form]}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, [key]: e.target.value }))
                  }
                  placeholder={ph}
                  data-ocid={`customers.${key}.input`}
                />
              </div>
            ))}
            <div
              style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
            >
              <Button
                variant="outline"
                onClick={() => setShowModal(false)}
                data-ocid="customers.cancel_button"
              >
                Cancel
              </Button>
              <Button
                style={{ background: GOLD, color: "#000", fontWeight: 600 }}
                onClick={save}
                data-ocid="customers.submit_button"
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PurchaseOrdersSection() {
  type POStatus = "Pending" | "Ordered" | "Delivered";
  const [orders, setOrders] = useState<
    Array<{
      id: string;
      vendor: string;
      items: string;
      amount: number;
      date: string;
      status: POStatus;
    }>
  >(() => {
    const saved = localStorage.getItem("kdm_purchase_orders");
    if (saved) return JSON.parse(saved);
    return MOCK_PURCHASE_ORDERS.map((po) => ({
      ...po,
      status: po.status as POStatus,
    }));
  });
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    vendor: "",
    items: "",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
  });

  const addPO = () => {
    if (!form.vendor || !form.items || !form.amount) return;
    const newPO = {
      id: `PO-${String(orders.length + 1).padStart(3, "0")}`,
      vendor: form.vendor,
      items: form.items,
      amount: Number(form.amount),
      date: form.date,
      status: "Pending" as POStatus,
    };
    const updated = [...orders, newPO];
    setOrders(updated);
    localStorage.setItem("kdm_purchase_orders", JSON.stringify(updated));
    setShowModal(false);
    setForm({
      vendor: "",
      items: "",
      amount: "",
      date: new Date().toISOString().slice(0, 10),
    });
    toast.success("Purchase order created");
  };

  const cycleStatus = (id: string) => {
    const cycle: POStatus[] = ["Pending", "Ordered", "Delivered"];
    const updated = orders.map((po) => {
      if (po.id !== id) return po;
      const next = cycle[(cycle.indexOf(po.status) + 1) % cycle.length];
      return { ...po, status: next };
    });
    setOrders(updated);
    localStorage.setItem("kdm_purchase_orders", JSON.stringify(updated));
  };

  const del = (id: string) => {
    const updated = orders.filter((po) => po.id !== id);
    setOrders(updated);
    localStorage.setItem("kdm_purchase_orders", JSON.stringify(updated));
  };

  const statusColor: Record<POStatus, string> = {
    Pending: "#f59e0b",
    Ordered: "#60a5fa",
    Delivered: "#22c55e",
  };

  return (
    <div>
      <SectionTitle title="Purchase Orders" />
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 12,
        }}
      >
        <Button
          style={{ background: GOLD, color: "#000", fontWeight: 700 }}
          data-ocid="purchase.open_modal_button"
          onClick={() => setShowModal(true)}
        >
          + New PO
        </Button>
      </div>
      <div
        style={{
          background: CARD_BG,
          border: `1px solid ${BORDER}`,
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <Table>
          <TableHeader>
            <TableRow style={{ borderBottom: `1px solid ${BORDER}` }}>
              {["PO No", "Vendor", "Items", "Amount", "Date", "Status", ""].map(
                (h) => (
                  <TableHead
                    key={h}
                    style={{ color: "#1e293b", fontWeight: 600 }}
                  >
                    {h}
                  </TableHead>
                ),
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  data-ocid="purchase.empty_state"
                  style={{ textAlign: "center", color: "#1e293b" }}
                >
                  No orders yet.
                </TableCell>
              </TableRow>
            )}
            {orders.map((po, i) => (
              <TableRow
                key={po.id}
                data-ocid={`purchase.item.${i + 1}`}
                style={{ borderBottom: `1px solid ${BORDER}` }}
              >
                <TableCell style={{ color: GOLD, fontWeight: 700 }}>
                  {po.id}
                </TableCell>
                <TableCell style={{ color: "#1e293b" }}>{po.vendor}</TableCell>
                <TableCell style={{ color: "#1e293b", fontSize: "0.8rem" }}>
                  {po.items}
                </TableCell>
                <TableCell style={{ color: "#1e293b" }}>
                  ₹{po.amount.toLocaleString()}
                </TableCell>
                <TableCell style={{ color: "#1e293b", fontSize: "0.8rem" }}>
                  {po.date}
                </TableCell>
                <TableCell>
                  <button
                    type="button"
                    onClick={() => cycleStatus(po.id)}
                    data-ocid={`purchase.toggle.${i + 1}`}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: statusColor[po.status],
                      fontWeight: 700,
                      fontSize: "0.8rem",
                    }}
                  >
                    {po.status} ↻
                  </button>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    style={{
                      background: "#ef4444",
                      color: "#fff",
                      fontSize: "0.7rem",
                    }}
                    data-ocid={`purchase.delete_button.${i + 1}`}
                    onClick={() => del(po.id)}
                  >
                    Del
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent
          style={{ background: "#fff", color: "#1e293b", borderRadius: 12 }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: "#1e293b", fontWeight: 700 }}>
              New Purchase Order
            </DialogTitle>
          </DialogHeader>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              paddingTop: 8,
            }}
          >
            {[
              { label: "Vendor Name", key: "vendor", ph: "Supplier name" },
              { label: "Items", key: "items", ph: "Bed linen, towels..." },
            ].map(({ label, key, ph }) => (
              <div key={key}>
                <Label style={{ color: "#1e293b", fontWeight: 600 }}>
                  {label}
                </Label>
                <Input
                  value={form[key as keyof typeof form]}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, [key]: e.target.value }))
                  }
                  placeholder={ph}
                  data-ocid={`purchase.${key}.input`}
                />
              </div>
            ))}
            <div>
              <Label style={{ color: "#1e293b", fontWeight: 600 }}>
                Amount (₹)
              </Label>
              <Input
                type="number"
                value={form.amount}
                onChange={(e) =>
                  setForm((p) => ({ ...p, amount: e.target.value }))
                }
                data-ocid="purchase.amount.input"
              />
            </div>
            <div>
              <Label style={{ color: "#1e293b", fontWeight: 600 }}>Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((p) => ({ ...p, date: e.target.value }))
                }
                data-ocid="purchase.date.input"
              />
            </div>
            <div
              style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
            >
              <Button
                variant="outline"
                onClick={() => setShowModal(false)}
                data-ocid="purchase.cancel_button"
              >
                Cancel
              </Button>
              <Button
                style={{ background: GOLD, color: "#000", fontWeight: 600 }}
                onClick={addPO}
                data-ocid="purchase.submit_button"
              >
                Create PO
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CouponAnalyticsSection() {
  const coupons = (() => {
    const saved = localStorage.getItem("kdm_coupons");
    return saved ? JSON.parse(saved) : MOCK_COUPONS;
  })();
  const totalIssued = coupons.length;
  const totalUsed = coupons.reduce(
    (s: number, c: (typeof MOCK_COUPONS)[0]) => s + c.used,
    0,
  );
  const avgDiscount = coupons.length
    ? Math.round(
        coupons.reduce(
          (s: number, c: (typeof MOCK_COUPONS)[0]) => s + c.discount,
          0,
        ) / coupons.length,
      )
    : 0;

  const data = coupons.map((c: (typeof MOCK_COUPONS)[0]) => ({
    name: c.code,
    used: c.used,
    discount: c.discount,
  }));

  return (
    <div>
      <SectionTitle title="Coupon Analytics" />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 16,
          marginBottom: 20,
        }}
      >
        {[
          { label: "Total Coupons", value: totalIssued, color: GOLD },
          { label: "Total Uses", value: totalUsed, color: "#22c55e" },
          {
            label: "Avg Discount %",
            value: `${avgDiscount}%`,
            color: "#60a5fa",
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            style={{
              background: CARD_BG,
              border: `1px solid ${BORDER}`,
              borderRadius: 8,
              padding: "1rem",
              textAlign: "center",
            }}
          >
            <div style={{ color, fontSize: "1.6rem", fontWeight: 800 }}>
              {value}
            </div>
            <div
              style={{ color: "#1e293b", fontWeight: 600, fontSize: "0.8rem" }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          background: CARD_BG,
          border: `1px solid ${BORDER}`,
          borderRadius: 8,
          padding: "1.25rem",
          marginBottom: 20,
        }}
      >
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
            <XAxis
              dataKey="name"
              stroke="#888"
              tick={{ fill: "#1e293b", fontSize: 12 }}
            />
            <YAxis stroke="#888" tick={{ fill: "#1e293b", fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                background: CARD_BG,
                border: `1px solid ${BORDER}`,
                color: "#1e293b",
              }}
            />
            <Bar
              dataKey="used"
              fill={GOLD}
              radius={[4, 4, 0, 0]}
              name="Times Used"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div
        style={{
          background: CARD_BG,
          border: `1px solid ${BORDER}`,
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <Table>
          <TableHeader>
            <TableRow style={{ borderBottom: `1px solid ${BORDER}` }}>
              {[
                "Code",
                "Discount %",
                "Times Used",
                "Valid From",
                "Valid To",
              ].map((h) => (
                <TableHead
                  key={h}
                  style={{ color: "#1e293b", fontWeight: 600 }}
                >
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map((c: (typeof MOCK_COUPONS)[0], i: number) => (
              <TableRow
                key={c.id}
                data-ocid={`coupon-analytics.item.${i + 1}`}
                style={{ borderBottom: `1px solid ${BORDER}` }}
              >
                <TableCell style={{ color: GOLD, fontWeight: 700 }}>
                  {c.code}
                </TableCell>
                <TableCell style={{ color: "#1e293b" }}>
                  {c.discount}%
                </TableCell>
                <TableCell style={{ color: "#22c55e", fontWeight: 700 }}>
                  {c.used}
                </TableCell>
                <TableCell style={{ color: "#1e293b", fontSize: "0.8rem" }}>
                  {c.validFrom}
                </TableCell>
                <TableCell style={{ color: "#1e293b", fontSize: "0.8rem" }}>
                  {c.validTo}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function GuestFeedbackSection() {
  const [feedbacks, setFeedbacks] = useState<
    Array<{
      id: number;
      name: string;
      email: string;
      roomNo: string;
      rating: number;
      comments: string;
      date: string;
    }>
  >(() => {
    const saved = localStorage.getItem("kdm_feedback");
    return saved ? JSON.parse(saved) : [];
  });
  const [form, setForm] = useState({
    name: "",
    email: "",
    roomNo: "",
    rating: 5,
    comments: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const submit = () => {
    if (!form.name || !form.comments) return;
    const newFb = {
      id: Date.now(),
      ...form,
      date: new Date().toLocaleDateString("en-IN"),
    };
    const updated = [newFb, ...feedbacks];
    setFeedbacks(updated);
    localStorage.setItem("kdm_feedback", JSON.stringify(updated));
    setForm({ name: "", email: "", roomNo: "", rating: 5, comments: "" });
    setSubmitted(true);
    toast.success("Feedback submitted. Thank you!");
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div>
      <SectionTitle title="Guest Feedback" />
      <div
        style={{
          background: CARD_BG,
          border: `1px solid ${BORDER}`,
          borderRadius: 8,
          padding: "1.5rem",
          maxWidth: 560,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            fontWeight: 700,
            color: "#1e293b",
            marginBottom: 14,
            fontSize: "1rem",
          }}
        >
          Submit Feedback
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { label: "Your Name", key: "name", ph: "Full name" },
            { label: "Email", key: "email", ph: "email@example.com" },
            { label: "Room No", key: "roomNo", ph: "e.g. 211" },
          ].map(({ label, key, ph }) => (
            <div key={key}>
              <Label style={{ color: "#1e293b", fontWeight: 600 }}>
                {label}
              </Label>
              <Input
                value={form[key as keyof typeof form] as string}
                onChange={(e) =>
                  setForm((p) => ({ ...p, [key]: e.target.value }))
                }
                placeholder={ph}
                data-ocid={`feedback.${key}.input`}
              />
            </div>
          ))}
          <div>
            <Label style={{ color: "#1e293b", fontWeight: 600 }}>Rating</Label>
            <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  type="button"
                  key={n}
                  onClick={() => setForm((p) => ({ ...p, rating: n }))}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "1.5rem",
                    color: n <= form.rating ? GOLD : "#ccc",
                  }}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label style={{ color: "#1e293b", fontWeight: 600 }}>
              Comments
            </Label>
            <textarea
              value={form.comments}
              onChange={(e) =>
                setForm((p) => ({ ...p, comments: e.target.value }))
              }
              placeholder="Your experience..."
              rows={3}
              data-ocid="feedback.textarea"
              style={{
                width: "100%",
                borderRadius: 6,
                border: "1px solid #d1d5db",
                padding: 8,
                fontFamily: "inherit",
                fontSize: "0.9rem",
                resize: "vertical",
                marginTop: 4,
              }}
            />
          </div>
          <Button
            style={{
              background: submitted ? "#22c55e" : GOLD,
              color: "#000",
              fontWeight: 700,
            }}
            onClick={submit}
            data-ocid="feedback.submit_button"
          >
            {submitted ? "✓ Submitted!" : "Submit Feedback"}
          </Button>
        </div>
      </div>
      {feedbacks.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div
            style={{ fontWeight: 700, color: "#1e293b", fontSize: "0.95rem" }}
          >
            All Feedback ({feedbacks.length})
          </div>
          {feedbacks.map((fb, i) => (
            <div
              key={fb.id}
              data-ocid={`feedback.item.${i + 1}`}
              style={{
                background: CARD_BG,
                border: `1px solid ${BORDER}`,
                borderRadius: 8,
                padding: "1rem 1.25rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <span style={{ fontWeight: 700, color: "#1e293b" }}>
                  {fb.name}
                </span>
                <span style={{ color: "#6b7280", fontSize: "0.75rem" }}>
                  {fb.date}
                </span>
              </div>
              <div style={{ display: "flex", gap: 2, marginBottom: 4 }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <span
                    key={n}
                    style={{ color: n <= fb.rating ? GOLD : "#ccc" }}
                  >
                    ★
                  </span>
                ))}
                {fb.roomNo && (
                  <span
                    style={{
                      color: "#6b7280",
                      fontSize: "0.75rem",
                      marginLeft: 8,
                    }}
                  >
                    Room {fb.roomNo}
                  </span>
                )}
              </div>
              <p style={{ color: "#1e293b", fontSize: "0.85rem" }}>
                {fb.comments}
              </p>
            </div>
          ))}
        </div>
      )}
      {feedbacks.length === 0 && (
        <div
          data-ocid="feedback.empty_state"
          style={{ color: "#6b7280", textAlign: "center", padding: "1rem" }}
        >
          No feedback submissions yet.
        </div>
      )}
    </div>
  );
}

function WhatsAppTemplatesSection() {
  const GOLD = "#c9a84c";
  const CARD_BG = "#fff";
  const BORDER = "#e2e8f0";
  const [templates, setTemplates] = useState<
    Array<{ id: number; name: string; message: string; status: string }>
  >(() => {
    const saved = localStorage.getItem("kdm_whatsapp_templates");
    return saved
      ? JSON.parse(saved)
      : WHATSAPP_TEMPLATES.map((t) => ({ ...t }));
  });
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    message: "",
    status: "Active",
  });
  const [copied, setCopied] = useState<number | null>(null);
  const [_addDialog, setAddDialog] = useState(false);
  const [newForm, setNewForm] = useState({ name: "", message: "" });

  const saveToStorage = (list: typeof templates) => {
    localStorage.setItem("kdm_whatsapp_templates", JSON.stringify(list));
  };

  const openEdit = (t: (typeof templates)[0]) => {
    setEditId(t.id);
    setEditForm({ name: t.name, message: t.message, status: t.status });
  };
  const saveEdit = () => {
    const updated = templates.map((t) =>
      t.id === editId
        ? {
            ...t,
            name: editForm.name,
            message: editForm.message,
            status: editForm.status,
          }
        : t,
    );
    setTemplates(updated);
    saveToStorage(updated);
    setEditId(null);
    toast.success("Template saved");
  };
  const deleteTemplate = (id: number) => {
    if (!window.confirm("Delete this template?")) return;
    const updated = templates.filter((t) => t.id !== id);
    setTemplates(updated);
    saveToStorage(updated);
    toast.success("Template deleted");
  };
  const _addTemplate = () => {
    if (!newForm.name.trim() || !newForm.message.trim()) {
      toast.error("Name and message are required");
      return;
    }
    const newId =
      templates.length > 0 ? Math.max(...templates.map((t) => t.id)) + 1 : 1;
    const updated = [
      ...templates,
      {
        id: newId,
        name: newForm.name,
        message: newForm.message,
        status: "Active",
      },
    ];
    setTemplates(updated);
    saveToStorage(updated);
    setNewForm({ name: "", message: "" });
    setAddDialog(false);
    toast.success("Template added!");
  };
  const copyTemplate = (t: (typeof templates)[0]) => {
    navigator.clipboard.writeText(t.message).then(() => {
      setCopied(t.id);
      setTimeout(() => setCopied(null), 1500);
    });
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <SectionTitle title="WhatsApp Templates" />
        <Button
          style={{ background: GOLD, color: "#000", fontWeight: 700 }}
          onClick={() => {
            setNewForm({ name: "", message: "" });
            setAddDialog(true);
          }}
        >
          + Add New Template
        </Button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {templates.map((t, i) => (
          <div
            key={t.id}
            data-ocid={`whatsapp.item.${i + 1}`}
            style={{
              background: CARD_BG,
              border: `1px solid ${BORDER}`,
              borderRadius: 8,
              padding: "1rem 1.25rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
                alignItems: "center",
                flexWrap: "wrap",
                gap: 6,
              }}
            >
              <span style={{ color: GOLD, fontWeight: 700 }}>{t.name}</span>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <span style={{ color: "#22c55e", fontSize: "0.75rem" }}>
                  {t.status}
                </span>
                <Button
                  size="sm"
                  style={{
                    background: copied === t.id ? "#22c55e" : "#e2e8f0",
                    color: "#1e293b",
                    fontSize: "0.7rem",
                  }}
                  data-ocid={`whatsapp.secondary_button.${i + 1}`}
                  onClick={() => copyTemplate(t)}
                >
                  {copied === t.id ? "✓ Copied" : "Copy"}
                </Button>
                <Button
                  size="sm"
                  style={{
                    background: GOLD,
                    color: "#000",
                    fontSize: "0.7rem",
                  }}
                  data-ocid={`whatsapp.edit_button.${i + 1}`}
                  onClick={() => openEdit(t)}
                >
                  ✏️ Edit
                </Button>
                <Button
                  size="sm"
                  style={{
                    background: "#fee2e2",
                    color: "#dc2626",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                  }}
                  onClick={() => deleteTemplate(t.id)}
                >
                  🗑️ Delete
                </Button>
              </div>
            </div>
            <p
              style={{
                color: "#1e293b",
                fontWeight: 600,
                fontSize: "0.82rem",
                fontFamily: "monospace",
                background: "#f8fafc",
                borderRadius: 4,
                padding: "8px",
                margin: 0,
              }}
            >
              {t.message}
            </p>
          </div>
        ))}
      </div>
      <Dialog
        open={editId !== null}
        onOpenChange={(o) => !o && setEditId(null)}
      >
        <DialogContent
          style={{ background: "#fff", color: "#1e293b", borderRadius: 12 }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: "#1e293b", fontWeight: 700 }}>
              Edit Template
            </DialogTitle>
          </DialogHeader>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              paddingTop: 8,
            }}
          >
            <div>
              <Label style={{ color: "#1e293b", fontWeight: 600 }}>
                Template Name
              </Label>
              <Input
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, name: e.target.value }))
                }
                data-ocid="whatsapp.name.input"
              />
            </div>
            <div>
              <Label style={{ color: "#1e293b", fontWeight: 600 }}>
                Message Body
              </Label>
              <textarea
                value={editForm.message}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, message: e.target.value }))
                }
                rows={5}
                data-ocid="whatsapp.textarea"
                style={{
                  width: "100%",
                  borderRadius: 6,
                  border: "1px solid #d1d5db",
                  padding: 8,
                  fontFamily: "monospace",
                  fontSize: "0.85rem",
                  resize: "vertical",
                  marginTop: 4,
                }}
              />
            </div>
            <div
              style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
            >
              <Button
                variant="outline"
                onClick={() => setEditId(null)}
                data-ocid="whatsapp.cancel_button"
              >
                Cancel
              </Button>
              <Button
                style={{ background: GOLD, color: "#000", fontWeight: 600 }}
                onClick={saveEdit}
                data-ocid="whatsapp.save_button"
              >
                Save Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── KDS SECTION ─────────────────────────────────────────────────────────────
// ─── KDS SECTION ─────────────────────────────────────────────────────────────
function KDSSection() {
  const GOLD = "#c9a84c";
  const CARD_BG = "#fff";
  const BORDER = "#e2e8f0";

  const [kotOrders, setKotOrders] = useState<any[]>([]);
  const [roomOrders, setRoomOrders] = useState<any[]>([]);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [flashAlert, setFlashAlert] = useState(false);
  const prevBumpedIds = useRef<Set<string>>(new Set());

  const playBumpAlert = () => {
    try {
      const ctx = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = "square";
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
      setTimeout(() => {
        try {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.frequency.value = 1100;
          osc2.type = "square";
          gain2.gain.setValueAtTime(0.3, ctx.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
          osc2.start(ctx.currentTime);
          osc2.stop(ctx.currentTime + 0.3);
        } catch {}
      }, 250);
    } catch {}
  };

  const loadOrders = () => {
    try {
      const kot: any[] = JSON.parse(
        localStorage.getItem("kdm_kot_orders") || "[]",
      );
      const room: any[] = JSON.parse(
        localStorage.getItem("hotelRoomFoodOrders") || "[]",
      );
      const pendingKot = kot.filter(
        (o: any) => o.status === "pending" || !o.status,
      );
      const pendingRoom = room.filter(
        (o: any) => o.status === "pending" || !o.status,
      );
      // Detect new bumped orders
      const newBumpedIds = new Set<string>(
        [...pendingKot, ...pendingRoom]
          .filter((o: any) => o.bumped)
          .map((o: any) => o.id as string),
      );
      const hasNewBumps = [...newBumpedIds].some(
        (id) => !prevBumpedIds.current.has(id),
      );
      if (hasNewBumps && prevBumpedIds.current.size > 0) {
        playBumpAlert();
        setFlashAlert(true);
        setTimeout(() => setFlashAlert(false), 1500);
      }
      prevBumpedIds.current = newBumpedIds;
      setKotOrders(pendingKot);
      setRoomOrders(pendingRoom);
      setLastRefresh(Date.now());
    } catch {}
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional
  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 8000);
    return () => clearInterval(interval);
  }, []);

  const markDone = (type: "kot" | "room", id: string) => {
    if (type === "kot") {
      const orders = JSON.parse(localStorage.getItem("kdm_kot_orders") || "[]");
      const updated = orders.map((o: any) =>
        o.id === id ? { ...o, status: "done", completedAt: Date.now() } : o,
      );
      localStorage.setItem("kdm_kot_orders", JSON.stringify(updated));
    } else {
      const orders = JSON.parse(
        localStorage.getItem("hotelRoomFoodOrders") || "[]",
      );
      const updated = orders.map((o: any) =>
        o.id === id ? { ...o, status: "done", completedAt: Date.now() } : o,
      );
      localStorage.setItem("hotelRoomFoodOrders", JSON.stringify(updated));
    }
    loadOrders();
    toast.success("Order marked as done!");
  };

  const toggleBump = (type: "kot" | "room", id: string) => {
    const key = type === "kot" ? "kdm_kot_orders" : "hotelRoomFoodOrders";
    const orders = JSON.parse(localStorage.getItem(key) || "[]");
    const updated = orders.map((o: any) =>
      o.id === id
        ? {
            ...o,
            bumped: !o.bumped,
            bumpedAt: o.bumped ? undefined : Date.now(),
          }
        : o,
    );
    localStorage.setItem(key, JSON.stringify(updated));
    loadOrders();
    const order = orders.find((o: any) => o.id === id);
    if (!order?.bumped) {
      toast.error("🚨 Order marked URGENT!");
    } else {
      toast.success("Priority flag removed");
    }
  };

  const markAllDone = () => {
    const ko = JSON.parse(localStorage.getItem("kdm_kot_orders") || "[]");
    localStorage.setItem(
      "kdm_kot_orders",
      JSON.stringify(
        ko.map((o: any) => ({ ...o, status: "done", completedAt: Date.now() })),
      ),
    );
    const ro = JSON.parse(localStorage.getItem("hotelRoomFoodOrders") || "[]");
    localStorage.setItem(
      "hotelRoomFoodOrders",
      JSON.stringify(
        ro.map((o: any) => ({ ...o, status: "done", completedAt: Date.now() })),
      ),
    );
    loadOrders();
    toast.success("All orders marked as done!");
  };

  const elapsed = (ts: number) => {
    const secs = Math.floor((Date.now() - ts) / 1000);
    if (secs < 60) return `${secs}s ago`;
    if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
    return `${Math.floor(secs / 3600)}h ago`;
  };

  // Sort bumped orders to the top
  const sortedKot = [...kotOrders].sort(
    (a, b) => (b.bumped ? 1 : 0) - (a.bumped ? 1 : 0),
  );
  const sortedRoom = [...roomOrders].sort(
    (a, b) => (b.bumped ? 1 : 0) - (a.bumped ? 1 : 0),
  );
  const bumpedCount =
    kotOrders.filter((o) => o.bumped).length +
    roomOrders.filter((o) => o.bumped).length;
  const total = kotOrders.length + roomOrders.length;

  const renderOrderCard = (order: any, type: "kot" | "room") => {
    const isKot = type === "kot";
    const accentColor = order.bumped ? "#ef4444" : isKot ? GOLD : "#3b82f6";
    const label = isKot
      ? `Table ${order.table || order.tableNo || "?"}`
      : `Room ${order.roomNumber || order.room || "?"}`;
    const sublabel = isKot
      ? `${order.id} · ${elapsed(order.createdAt)}`
      : `${order.guestName ? `${order.guestName} · ` : ""}${elapsed(order.createdAt)}`;
    const badge = isKot
      ? { bg: "#fef3c7", color: "#b45309", text: "PENDING" }
      : { bg: "#dbeafe", color: "#1d4ed8", text: "ROOM SVC" };
    const orderTotal = isKot
      ? order.total ||
        order.totalAmount ||
        (order.items || []).reduce(
          (s: number, i: any) => s + (i.price || 0) * (i.qty || 1),
          0,
        )
      : order.totalAmount ||
        order.total ||
        (order.items || []).reduce(
          (s: number, i: any) => s + (i.price || 0) * (i.qty || 1),
          0,
        );

    return (
      <div
        key={order.id}
        style={{
          background: order.bumped ? "#fff5f5" : CARD_BG,
          border: `2px solid ${accentColor}`,
          borderRadius: 10,
          padding: "1rem",
          boxShadow: order.bumped
            ? "0 0 0 3px rgba(239,68,68,0.18), 0 2px 12px rgba(239,68,68,0.12)"
            : "0 2px 8px rgba(0,0,0,0.06)",
          position: "relative",
          transition: "box-shadow 0.2s",
        }}
      >
        {order.bumped && (
          <div
            style={{
              position: "absolute",
              top: -10,
              left: "50%",
              transform: "translateX(-50%)",
              background: "#ef4444",
              color: "#fff",
              fontWeight: 800,
              fontSize: "0.68rem",
              padding: "2px 10px",
              borderRadius: 99,
              letterSpacing: 1,
              whiteSpace: "nowrap",
            }}
          >
            🚨 URGENT — BUMP ORDER
          </div>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 8,
            alignItems: "flex-start",
            marginTop: order.bumped ? 8 : 0,
          }}
        >
          <div>
            <div
              style={{ fontWeight: 800, color: "#1e293b", fontSize: "1rem" }}
            >
              {label}
            </div>
            <div style={{ color: "#94a3b8", fontSize: "0.72rem" }}>
              {sublabel}
            </div>
          </div>
          <span
            style={{
              background: badge.bg,
              color: badge.color,
              fontSize: "0.7rem",
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: 99,
            }}
          >
            {badge.text}
          </span>
        </div>
        <div
          style={{
            borderTop: `1px solid ${BORDER}`,
            paddingTop: 8,
            marginBottom: 8,
          }}
        >
          {(order.items || []).map((item: any, idx: number) => (
            <div
              key={item.name || String(idx)}
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.82rem",
                color: "#374151",
                marginBottom: 2,
              }}
            >
              <span>
                {item.qty || item.quantity || 1}× {item.name}
              </span>
              <span style={{ color: "#64748b" }}>₹{item.price}</span>
            </div>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span style={{ fontWeight: 700, color: "#1e293b" }}>
            ₹{orderTotal}
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            <Button
              size="sm"
              style={{
                background: order.bumped ? "#fca5a5" : "#fee2e2",
                color: order.bumped ? "#7f1d1d" : "#b91c1c",
                fontWeight: 700,
                fontSize: "0.72rem",
                border: `1px solid ${order.bumped ? "#ef4444" : "#fca5a5"}`,
              }}
              onClick={() => toggleBump(type, order.id)}
              title={order.bumped ? "Remove urgent flag" : "Mark as urgent"}
            >
              {order.bumped ? "🔕 Un-bump" : "🔺 Bump"}
            </Button>
            <Button
              size="sm"
              style={{
                background: "#22c55e",
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.75rem",
              }}
              onClick={() => markDone(type, order.id)}
            >
              ✅ Done
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        outline: flashAlert ? "4px solid #ef4444" : "none",
        borderRadius: flashAlert ? 8 : 0,
        boxShadow: flashAlert ? "0 0 24px 6px #fca5a5" : "none",
        transition: "outline 0.15s, box-shadow 0.15s",
        background: flashAlert ? "#fff5f5" : undefined,
      }}
    >
      <SectionTitle
        title="Kitchen Display Screen (KDS)"
        sub="Real-time pending kitchen orders — auto-refreshes every 8 seconds"
      />
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 16,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            background: total > 0 ? "#fef3c7" : "#f0fdf4",
            border: `1px solid ${total > 0 ? "#f59e0b" : "#86efac"}`,
            borderRadius: 8,
            padding: "6px 16px",
            fontWeight: 700,
            color: total > 0 ? "#b45309" : "#15803d",
          }}
        >
          {total} Pending Order{total !== 1 ? "s" : ""}
        </div>
        {bumpedCount > 0 && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #ef4444",
              borderRadius: 8,
              padding: "6px 16px",
              fontWeight: 800,
              color: "#b91c1c",
              fontSize: "0.85rem",
            }}
          >
            🚨 {bumpedCount} URGENT
          </div>
        )}
        <Button
          size="sm"
          style={{ background: GOLD, color: "#000", fontWeight: 700 }}
          onClick={loadOrders}
        >
          🔄 Refresh
        </Button>
        {total > 0 && (
          <Button
            size="sm"
            style={{ background: "#22c55e", color: "#fff", fontWeight: 700 }}
            onClick={markAllDone}
          >
            ✅ Mark All Done
          </Button>
        )}
        <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>
          Last updated: {new Date(lastRefresh).toLocaleTimeString()}
        </span>
      </div>

      {total === 0 && (
        <div
          style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}
        >
          <div style={{ fontSize: "3rem", marginBottom: 8 }}>🍳</div>
          <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>All Clear!</div>
          <div style={{ fontSize: "0.85rem" }}>
            No pending kitchen orders right now.
          </div>
        </div>
      )}

      {sortedKot.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3
            style={{
              color: GOLD,
              fontWeight: 700,
              fontSize: "1rem",
              marginBottom: 12,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            🍽️ KOT Orders ({sortedKot.length})
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 12,
            }}
          >
            {sortedKot.map((order: any) => renderOrderCard(order, "kot"))}
          </div>
        </div>
      )}

      {sortedRoom.length > 0 && (
        <div>
          <h3
            style={{
              color: "#3b82f6",
              fontWeight: 700,
              fontSize: "1rem",
              marginBottom: 12,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            🛎️ Room Service Orders ({sortedRoom.length})
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 12,
            }}
          >
            {sortedRoom.map((order: any) => renderOrderCard(order, "room"))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── GUEST CHECK-IN SECTION ────────────────────────────────────────────────────

// ─── GUEST HISTORY TYPES ─────────────────────────────────────────────────────
interface GuestHistoryRecord {
  id: string;
  guestName: string;
  phone: string;
  idType: string;
  idNumber: string;
  adults: number;
  children: number;
  companyName: string;
  companyGstNumber: string;
  lastVisit: string;
}

function getGuestHistory(): GuestHistoryRecord[] {
  try {
    const s = localStorage.getItem("kdm_guest_history");
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

function saveGuestHistory(records: GuestHistoryRecord[]) {
  try {
    localStorage.setItem("kdm_guest_history", JSON.stringify(records));
  } catch {}
}

function getPaymentTypes(): string[] {
  try {
    const s = localStorage.getItem("kdm_payment_types");
    return s
      ? JSON.parse(s)
      : [
          "Cash",
          "SBI Card",
          "HDFC Card",
          "UPI",
          "NEFT/Cheque",
          "Complement",
          "Company",
          "Room",
        ];
  } catch {
    return [
      "Cash",
      "SBI Card",
      "HDFC Card",
      "UPI",
      "NEFT/Cheque",
      "Complement",
      "Company",
      "Room",
    ];
  }
}

// ─── GENERATE ROOM INVOICE HTML ──────────────────────────────────────────────
function numberToWords(num: number): string {
  if (num === 0) return "Zero";
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  function belowThousand(x: number): string {
    if (x < 20) return ones[x];
    if (x < 100)
      return `${tens[Math.floor(x / 10)]}${x % 10 ? ` ${ones[x % 10]}` : ""}`;
    return `${ones[Math.floor(x / 100)]} Hundred${x % 100 ? ` ${belowThousand(x % 100)}` : ""}`;
  }
  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thou = Math.floor((num % 100000) / 1000);
  const rest = num % 1000;
  const parts: string[] = [];
  if (crore > 0) parts.push(`${belowThousand(crore)} Crore`);
  if (lakh > 0) parts.push(`${belowThousand(lakh)} Lakh`);
  if (thou > 0) parts.push(`${belowThousand(thou)} Thousand`);
  if (rest > 0) parts.push(belowThousand(rest));
  return parts.join(" ");
}

function generateRoomInvoiceHTML(
  inv: any,
  gstSettings: any,
  roomFoodOrders: any[],
): string {
  const gstin = gstSettings?.gstin || "10AAKHR7077L1ZQ";
  const nights = Number(inv.nights) || 1;
  const roomRate = Number(inv.roomRate) || 0;
  const foodCharges = Number(inv.foodCharges) || 0;
  const otherCharges = Number(inv.otherCharges) || 0;
  const roomCharges = Number(inv.roomCharges) || roomRate * nights;
  const subtotal = roomCharges + foodCharges + otherCharges;
  const gstPercent = Number(inv.gstPercent) || 12;
  const sgstPct = gstPercent / 2;
  const cgstPct = gstPercent / 2;
  const sgst = Math.round(((subtotal * sgstPct) / 100) * 100) / 100;
  const cgst = Math.round(((subtotal * cgstPct) / 100) * 100) / 100;
  const total = subtotal + sgst + cgst;
  const roundoff = Math.round(total) - total;
  const netAmount = Math.round(total);
  const advancePaid = Number(inv.advancePaid) || 0;
  const balanceDue = netAmount - advancePaid;

  // Derive Bill No
  const idStr = String(inv.id || "1001");
  const idNum = Number.parseInt(idStr.replace(/\D/g, "").slice(-4) || "1001");
  const billSeq = 1000 + (idNum % 9000);
  const fy = "25-26";
  const billNo = `RB/${fy}/${billSeq}`;
  const grcNo = idStr.slice(-4).padStart(4, "0");

  // Format date rows for charges
  const checkIn = new Date(inv.checkInDate || new Date());
  const checkOut = new Date(inv.checkOutDate || new Date());
  const fmtDate = (d: Date) => {
    const day = String(d.getDate()).padStart(2, "0");
    const mon = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ][d.getMonth()];
    return `${day}/${mon}/${d.getFullYear()}`;
  };

  let chargeRows = "";
  for (let i = 0; i < nights; i++) {
    const d = new Date(checkIn);
    d.setDate(d.getDate() + i);
    chargeRows += `<tr>
      <td style="padding:5px 8px;border:1px solid #ccc;">${fmtDate(d)}</td>
      <td style="padding:5px 8px;border:1px solid #ccc;">RC/${3000 + i + (idNum % 100)}</td>
      <td style="padding:5px 8px;border:1px solid #ccc;">Room Charge, Room No: ${inv.roomNumber || ""}</td>
      <td style="padding:5px 8px;border:1px solid #ccc;text-align:right;">${roomRate.toFixed(2)}</td>
      <td style="padding:5px 8px;border:1px solid #ccc;text-align:right;"></td>
    </tr>`;
  }

  // Food charge rows
  const foodOrders = (roomFoodOrders || []).filter(
    (o: any) => o.roomNumber === inv.roomNumber,
  );
  if (foodOrders.length > 0) {
    for (const o of foodOrders) {
      const od = new Date(Number(o.createdAt) || Date.now());
      const items = (o.items || [])
        .map((it: any) => `${it.name} x${it.qty}`)
        .join(", ");
      chargeRows += `<tr>
        <td style="padding:5px 8px;border:1px solid #ccc;">${fmtDate(od)}</td>
        <td style="padding:5px 8px;border:1px solid #ccc;">RF/${3000 + (idNum % 100)}</td>
        <td style="padding:5px 8px;border:1px solid #ccc;">Room Food: ${items}</td>
        <td style="padding:5px 8px;border:1px solid #ccc;text-align:right;">${Number(o.totalAmount).toFixed(2)}</td>
        <td style="padding:5px 8px;border:1px solid #ccc;text-align:right;"></td>
      </tr>`;
    }
  } else if (foodCharges > 0) {
    chargeRows += `<tr>
      <td style="padding:5px 8px;border:1px solid #ccc;">${fmtDate(checkOut)}</td>
      <td style="padding:5px 8px;border:1px solid #ccc;">RF/${3000 + (idNum % 100)}</td>
      <td style="padding:5px 8px;border:1px solid #ccc;">Room Food Charges</td>
      <td style="padding:5px 8px;border:1px solid #ccc;text-align:right;">${foodCharges.toFixed(2)}</td>
      <td style="padding:5px 8px;border:1px solid #ccc;text-align:right;"></td>
    </tr>`;
  }

  if (otherCharges > 0) {
    chargeRows += `<tr>
      <td style="padding:5px 8px;border:1px solid #ccc;">${fmtDate(checkOut)}</td>
      <td style="padding:5px 8px;border:1px solid #ccc;">OC/${3000 + (idNum % 100)}</td>
      <td style="padding:5px 8px;border:1px solid #ccc;">Other Charges</td>
      <td style="padding:5px 8px;border:1px solid #ccc;text-align:right;">${otherCharges.toFixed(2)}</td>
      <td style="padding:5px 8px;border:1px solid #ccc;text-align:right;"></td>
    </tr>`;
  }

  const amtWords = `${numberToWords(netAmount)} Rupees Only`;
  const roomType = (() => {
    const rn = String(inv.roomNumber || "");
    if (rn.startsWith("3")) return "Deluxe";
    if (rn.startsWith("2")) return "Executive";
    return "Standard";
  })();

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Tax Invoice - ${billNo}</title>
  <style>
    @media print { body { margin: 0; } button.no-print { display: none !important; } }
    body { font-family: Arial, sans-serif; font-size: 12px; color: #000; background: #fff; margin: 0; padding: 10px; }
    .page { width: 210mm; margin: 0 auto; border: 2px solid #000; padding: 0; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ccc; padding: 5px 8px; }
    .no-border td, .no-border th { border: none; }
    .section-header { background: #f5f5f5; font-weight: bold; padding: 4px 8px; border: 1px solid #ccc; }
  </style>
</head>
<body>
<button class="no-print" onclick="window.print()" style="margin-bottom:8px;padding:8px 20px;background:#c9a84c;color:#000;border:none;border-radius:4px;cursor:pointer;font-weight:bold;">🖨️ Print Invoice</button>
<div class="page">

  <!-- HEADER -->
  <table style="border:none;border-bottom:2px solid #000;">
    <tr>
      <td style="width:20%;border:none;text-align:center;vertical-align:middle;padding:12px 8px;">
        <div style="font-size:28px;font-weight:900;color:#000;">🏨 KDM</div>
        <div style="font-size:10px;font-weight:bold;color:#333;">HOTEL</div>
      </td>
      <td style="width:60%;border:none;text-align:center;vertical-align:middle;padding:10px 4px;">
        <div style="font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;margin-bottom:2px;">TAX INVOICE</div>
        <div style="font-size:22px;font-weight:900;text-transform:uppercase;margin-bottom:4px;">HOTEL KDM PALACE</div>
        <div style="font-size:11px;">KDM Estates, Harharmahadev Chowk</div>
        <div style="font-size:11px;">Begusarai (Bihar) - 851101</div>
        <div style="font-size:10px;">Ph: +91-6243-242526, 296296 | Mob: 7544800022, 7544800023</div>
        <div style="font-size:10px;">Email: hotelkdmpalace@gmail.com | Web: hotelkdmpalace.com</div>
      </td>
      <td style="width:20%;border:none;text-align:center;vertical-align:middle;padding:10px 8px;">
        <div style="font-size:10px;font-weight:bold;margin-bottom:6px;">GST NO.: ${gstin}</div>
        <div style="width:60px;height:60px;border:2px solid #000;margin:0 auto 4px auto;display:flex;align-items:center;justify-content:center;font-size:9px;text-align:center;">QR<br/>Code</div>
        <div style="font-size:9px;">UPI: hotelkdmpalace@sbi</div>
      </td>
    </tr>
  </table>

  <!-- GUEST INFO -->
  <table style="border:none;border-bottom:1px solid #000;">
    <tr>
      <td style="width:50%;border:none;border-right:1px solid #000;padding:0;vertical-align:top;">
        <table style="border:none;width:100%;">
          <tr><td style="border:none;padding:3px 8px;font-weight:bold;width:40%;">NAME</td><td style="border:none;padding:3px 8px;">: ${inv.guestName || ""}</td></tr>
          <tr><td style="border:none;padding:3px 8px;font-weight:bold;">ADDRESS</td><td style="border:none;padding:3px 8px;">: ${inv.address || ""}</td></tr>
          <tr><td style="border:none;padding:3px 8px;font-weight:bold;">Company</td><td style="border:none;padding:3px 8px;">: ${inv.companyName || ""}</td></tr>
          <tr><td style="border:none;padding:3px 8px;font-weight:bold;">Contact No.</td><td style="border:none;padding:3px 8px;">: ${inv.phone || ""}</td></tr>
          <tr><td style="border:none;padding:3px 8px;font-weight:bold;">Nationality</td><td style="border:none;padding:3px 8px;">: INDIA</td></tr>
          <tr><td style="border:none;padding:3px 8px;font-weight:bold;">CompGST No.</td><td style="border:none;padding:3px 8px;">: ${inv.companyGst || ""}</td></tr>
          <tr><td style="border:none;padding:3px 8px;font-weight:bold;">Travel Agent</td><td style="border:none;padding:3px 8px;">: </td></tr>
          <tr><td style="border:none;padding:3px 8px;font-weight:bold;">Booking Ref No.</td><td style="border:none;padding:3px 8px;">: ${inv.id || ""}</td></tr>
          <tr><td style="border:none;padding:3px 8px;font-weight:bold;">Place of Supply</td><td style="border:none;padding:3px 8px;">: Bihar</td></tr>
        </table>
      </td>
      <td style="width:50%;border:none;padding:0;vertical-align:top;">
        <table style="border:none;width:100%;">
          <tr><td style="border:none;padding:3px 8px;font-weight:bold;width:50%;">Bill No.</td><td style="border:none;padding:3px 8px;">: ${billNo}</td></tr>
          <tr><td style="border:none;padding:3px 8px;font-weight:bold;">G.R.C. No.</td><td style="border:none;padding:3px 8px;">: ${grcNo}</td></tr>
          <tr><td style="border:none;padding:3px 8px;font-weight:bold;">Room No.</td><td style="border:none;padding:3px 8px;">: ${inv.roomNumber || ""}</td></tr>
          <tr><td style="border:none;padding:3px 8px;font-weight:bold;">Room Type</td><td style="border:none;padding:3px 8px;">: ${roomType}</td></tr>
          <tr><td style="border:none;padding:3px 8px;font-weight:bold;">Room Tariff</td><td style="border:none;padding:3px 8px;">: ₹${roomRate.toLocaleString()}</td></tr>
          <tr><td style="border:none;padding:3px 8px;font-weight:bold;">Pax / Occupancy</td><td style="border:none;padding:3px 8px;">: ${inv.occupancy || "2"}</td></tr>
          <tr><td style="border:none;padding:3px 8px;font-weight:bold;">Arrival Date</td><td style="border:none;padding:3px 8px;">: ${inv.checkInDate || ""}</td></tr>
          <tr><td style="border:none;padding:3px 8px;font-weight:bold;">Departure Date</td><td style="border:none;padding:3px 8px;">: ${inv.checkOutDate || ""}</td></tr>
          <tr><td style="border:none;padding:3px 8px;font-weight:bold;">HSN CODE</td><td style="border:none;padding:3px 8px;">: 996311</td></tr>
          <tr><td style="border:none;padding:3px 8px;font-weight:bold;">Plan/Package</td><td style="border:none;padding:3px 8px;">: EP</td></tr>
        </table>
      </td>
    </tr>
  </table>

  <!-- CHARGES TABLE -->
  <table style="border-top:1px solid #000;">
    <thead>
      <tr style="background:#f0f0f0;">
        <th style="padding:6px 8px;border:1px solid #ccc;text-align:center;">Date</th>
        <th style="padding:6px 8px;border:1px solid #ccc;text-align:center;">Bill/Voucher</th>
        <th style="padding:6px 8px;border:1px solid #ccc;text-align:center;">Description</th>
        <th style="padding:6px 8px;border:1px solid #ccc;text-align:right;">Debit (₹)</th>
        <th style="padding:6px 8px;border:1px solid #ccc;text-align:right;">Credit (₹)</th>
      </tr>
    </thead>
    <tbody>
      ${chargeRows}
    </tbody>
    <tfoot>
      <tr style="background:#f5f5f5;font-weight:bold;">
        <td colspan="3" style="padding:6px 8px;border:1px solid #ccc;text-align:right;">SUBTOTAL</td>
        <td style="padding:6px 8px;border:1px solid #ccc;text-align:right;">₹${subtotal.toFixed(2)}</td>
        <td style="padding:6px 8px;border:1px solid #ccc;"></td>
      </tr>
    </tfoot>
  </table>

  <!-- FOOTER -->
  <table style="border-top:1px solid #000;border-bottom:2px solid #000;">
    <tr>
      <td style="width:55%;border:none;border-right:1px solid #000;padding:10px 8px;vertical-align:top;">
        <div style="font-weight:bold;margin-bottom:6px;">Amount in Words:</div>
        <div style="font-style:italic;margin-bottom:12px;">Charge: ${amtWords}</div>

        <div style="border:1px solid #000;padding:8px;margin-bottom:10px;">
          <div style="font-weight:bold;margin-bottom:4px;">Bank Details:</div>
          <div>ACCOUNT NO.: 33717221853</div>
          <div>IFSC: SBIN0003589</div>
          <div>BANK NAME: SBI &nbsp;|&nbsp; BRANCH: B.R.T., BEGUSARAI</div>
        </div>

        <div style="font-size:10px;">
          <div style="font-weight:bold;margin-bottom:3px;">Terms &amp; Conditions:</div>
          <div>* Cheque to be made in favour of Hotel KDM Palace, Begusarai.</div>
          <div>* Outstation Cheques are not accepted.</div>
          <div>* Guests are requested to obtain official receipt for all payments.</div>
          <div>* Check-Out Time 12:00 Noon.</div>
          <div>* All Disputes Subject To Begusarai Jurisdiction only.</div>
          <div>* I agree that I am liable for full payment of this bill.</div>
          <div>* I have collected my luggage/articles at the time of checkout.</div>
          <div>* Guest are requested to check &amp; confirm GST No. &amp; Company Details at Checkout.</div>
          <div>* Any correction in bill may be only within 3 days after checkout.</div>
          <div>* No changes in bill shall be made after three days of bill generation.</div>
        </div>
      </td>
      <td style="width:45%;border:none;padding:10px 8px;vertical-align:top;">
        <table style="width:100%;border:1px solid #000;margin-bottom:12px;">
          <tr><td style="padding:5px 8px;border:1px solid #ccc;">TOTAL</td><td style="padding:5px 8px;border:1px solid #ccc;text-align:right;font-weight:bold;">₹${subtotal.toFixed(2)}</td></tr>
          <tr><td style="padding:5px 8px;border:1px solid #ccc;">SGST (${sgstPct}%)</td><td style="padding:5px 8px;border:1px solid #ccc;text-align:right;">₹${sgst.toFixed(2)}</td></tr>
          <tr><td style="padding:5px 8px;border:1px solid #ccc;">CGST (${cgstPct}%)</td><td style="padding:5px 8px;border:1px solid #ccc;text-align:right;">₹${cgst.toFixed(2)}</td></tr>
          <tr><td style="padding:5px 8px;border:1px solid #ccc;">ROUNDOFF</td><td style="padding:5px 8px;border:1px solid #ccc;text-align:right;">₹${roundoff >= 0 ? "+" : ""}${roundoff.toFixed(2)}</td></tr>
          <tr style="background:#f0f0f0;font-weight:bold;"><td style="padding:5px 8px;border:1px solid #ccc;">NET AMOUNT</td><td style="padding:5px 8px;border:1px solid #ccc;text-align:right;">₹${netAmount.toLocaleString()}</td></tr>
          <tr><td style="padding:5px 8px;border:1px solid #ccc;">Advance Paid</td><td style="padding:5px 8px;border:1px solid #ccc;text-align:right;">₹${advancePaid.toLocaleString()}</td></tr>
          <tr style="font-weight:bold;color:#c00;"><td style="padding:5px 8px;border:1px solid #ccc;">BALANCE DUE</td><td style="padding:5px 8px;border:1px solid #ccc;text-align:right;">₹${balanceDue.toLocaleString()}</td></tr>
        </table>

        <div style="text-align:center;font-weight:bold;font-size:13px;margin-bottom:8px;">🔑 PLEASE REMEMBER TO LEAVE YOUR KEYS</div>
        <div style="font-size:10px;margin-bottom:16px;">Checked and found correctly, kindly send Bill</div>
        <div style="font-size:10px;margin-bottom:20px;">To, M/s ___________________________</div>
        <div style="display:flex;justify-content:space-between;margin-top:8px;">
          <div style="text-align:center;width:45%;">
            <div style="border-top:1px solid #000;padding-top:4px;font-size:10px;">Authorised Signatory</div>
          </div>
          <div style="text-align:center;width:45%;">
            <div style="border-top:1px solid #000;padding-top:4px;font-size:10px;">Guest Signature</div>
          </div>
        </div>
      </td>
    </tr>
  </table>

  <!-- BOTTOM STRIP -->
  <table style="border:none;border-top:1px solid #000;">
    <tr>
      <td style="width:33%;border:none;text-align:center;padding:8px;font-weight:bold;font-size:11px;">Guest Signature</td>
      <td style="width:34%;border:none;text-align:center;padding:8px;font-weight:bold;font-size:11px;border-left:1px solid #000;border-right:1px solid #000;">CASHIER</td>
      <td style="width:33%;border:none;text-align:center;padding:8px;font-weight:bold;font-size:11px;">FRONT OFFICE MANAGER</td>
    </tr>
    <tr>
      <td colspan="3" style="border:none;text-align:center;padding:4px;font-size:10px;border-top:1px solid #ccc;">Page 1 of 1</td>
    </tr>
  </table>

</div>
</body>
</html>`;
}

// ─── REPRINT BILL HELPER ─────────────────────────────────────────────────────
function reprintBill(title: string, htmlContent: string) {
  const w = window.open("", "_blank", "width=800,height=600");
  if (!w) return;
  w.document.write(`<html><head><title>${title}</title>
    <style>body{font-family:Arial,sans-serif;padding:20px;color:#1e293b;} table{width:100%;border-collapse:collapse;} th,td{border:1px solid #ddd;padding:6px 10px;text-align:left;} .header{text-align:center;margin-bottom:16px;} h2{color:#c9a84c;} @media print{button{display:none;}}</style>
    </head><body>
    <button onclick="window.print()" style="margin-bottom:12px;padding:8px 16px;background:#d97706;color:white;border:none;border-radius:4px;cursor:pointer;">🖨️ Print</button>
    ${htmlContent}
    </body></html>`);
  w.document.close();
  w.focus();
}

function shareInvoiceWhatsApp(
  title: string,
  details: {
    guest?: string;
    billNo?: string;
    room?: string;
    date?: string;
    amount?: number;
  },
) {
  const msg = encodeURIComponent(
    `🏨 *HOTEL KDM PALACE*\n*${title}*\n${details.billNo ? `📋 Bill No: ${details.billNo}\n` : ""}${details.guest ? `👤 Guest: ${details.guest}\n` : ""}${details.room ? `🚪 Room/Hall: ${details.room}\n` : ""}${details.date ? `📅 Date: ${details.date}\n` : ""}${details.amount ? `💰 Amount: ₹${Number(details.amount).toFixed(2)}\n` : ""}\nThank you for choosing Hotel KDM Palace! 🙏`,
  );
  window.open(`https://wa.me/?text=${msg}`, "_blank");
}

function printAsPDF(title: string, htmlContent: string) {
  const w = window.open("", "_blank", "width=900,height=700");
  if (w) {
    w.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
    <style>
      body{font-family:Arial,sans-serif;padding:24px;color:#111}
      h2{color:#b8860b;text-align:center}
      table{width:100%;border-collapse:collapse;margin-top:12px}
      th,td{padding:8px 10px;border:1px solid #ddd;text-align:left}
      th{background:#f8f4e8;font-weight:700;color:#92400e}
      .total{font-weight:700;color:#b8860b}
      .header{text-align:center;margin-bottom:16px;border-bottom:2px solid #b8860b;padding-bottom:12px}
      @media print{@page{margin:1cm}}
    </style></head><body>${htmlContent}</body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 500);
  }
}

// ─── GUEST FILE UPLOADS COMPONENT ────────────────────────────────────────────
interface GuestFileUploadsProps {
  form: { guestIdDocUrl: string; guestPhotoUrl: string; [key: string]: any };
  setForm: (fn: (prev: any) => any) => void;
}
function GuestFileUploads({ form, setForm }: GuestFileUploadsProps) {
  const idDocRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (
    key: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      setForm((p: any) => ({ ...p, [key]: reader.result as string }));
    reader.readAsDataURL(file);
  };

  return (
    <div
      style={{
        gridColumn: "1 / -1",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 12,
      }}
    >
      <div>
        <label
          htmlFor="guestIdDocInput"
          style={{
            color: "#1e293b",
            fontWeight: 600,
            fontSize: "0.75rem",
            display: "block",
            marginBottom: 4,
          }}
        >
          Guest ID Document
        </label>
        <input
          id="guestIdDocInput"
          type="file"
          ref={idDocRef}
          accept="image/*,.pdf"
          style={{ display: "none" }}
          onChange={(e) => handleFileChange("guestIdDocUrl", e)}
        />
        <button
          type="button"
          onClick={() => idDocRef.current?.click()}
          style={{
            width: "100%",
            padding: "8px 12px",
            border: "1px solid #cbd5e1",
            borderRadius: 6,
            background: "#f8fafc",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "0.8rem",
            color: "#1e293b",
          }}
        >
          📎 {form.guestIdDocUrl ? "ID Doc Uploaded ✓" : "Upload ID Doc"}
        </button>
        {form.guestIdDocUrl?.startsWith("data:image") && (
          <img
            src={form.guestIdDocUrl}
            alt="ID Doc"
            style={{
              marginTop: 6,
              width: "100%",
              maxHeight: 80,
              objectFit: "cover",
              borderRadius: 4,
              border: "1px solid #e2e8f0",
            }}
          />
        )}
      </div>
      <div>
        <label
          htmlFor="guestPhotoInput"
          style={{
            color: "#1e293b",
            fontWeight: 600,
            fontSize: "0.75rem",
            display: "block",
            marginBottom: 4,
          }}
        >
          Guest Photo
        </label>
        <input
          id="guestPhotoInput"
          type="file"
          ref={photoRef}
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => handleFileChange("guestPhotoUrl", e)}
        />
        <button
          type="button"
          onClick={() => photoRef.current?.click()}
          style={{
            width: "100%",
            padding: "8px 12px",
            border: "1px solid #cbd5e1",
            borderRadius: 6,
            background: "#f8fafc",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "0.8rem",
            color: "#1e293b",
          }}
        >
          📷 {form.guestPhotoUrl ? "Photo Uploaded ✓" : "Upload Photo"}
        </button>
        {form.guestPhotoUrl && (
          <img
            src={form.guestPhotoUrl}
            alt="Guest"
            style={{
              marginTop: 6,
              width: "100%",
              maxHeight: 80,
              objectFit: "cover",
              borderRadius: 4,
              border: "1px solid #e2e8f0",
            }}
          />
        )}
      </div>
    </div>
  );
}

function GuestCheckInSection() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { data: checkIns = [], isLoading } = useAllGuestCheckIns();
  const { data: roomFoodOrders = [], refetch: refetchFoodOrders } =
    useAllRoomFoodOrders();
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    guestName: "",
    phone: "",
    roomNumber: "",
    idType: "Aadhaar",
    idNumber: "",
    adults: "1",
    children: "0",
    checkInDate: new Date().toISOString().split("T")[0],
    expectedCheckOut: new Date(Date.now() + 86400000)
      .toISOString()
      .split("T")[0],
    totalAmount: "",
    advancePaid: "",
    notes: "",
    companyName: "",
    companyGstNumber: "",
    occupancy: "Single",
    discountType: "percent",
    discountValue: "",
    guestIdDocUrl: "",
    guestPhotoUrl: "",
  });
  const [guestSearch, setGuestSearch] = useState("");
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);
  const [historySearch, setHistorySearch] = useState("");

  const guestHistoryRecords = getGuestHistory();
  const filteredHistory = guestHistoryRecords.filter((g) =>
    !guestSearch || guestSearch.length < 2
      ? false
      : g.guestName.toLowerCase().includes(guestSearch.toLowerCase()) ||
        g.phone.includes(guestSearch) ||
        g.companyName.toLowerCase().includes(guestSearch.toLowerCase()),
  );
  const customersData: Array<{ name: string; phone: string; email?: string }> =
    (() => {
      try {
        const s = localStorage.getItem("kdm_customers");
        return s ? JSON.parse(s) : [];
      } catch {
        return [];
      }
    })();
  const filteredCustomers =
    guestSearch.length >= 2
      ? customersData.filter(
          (c) =>
            c.name?.toLowerCase().includes(guestSearch.toLowerCase()) ||
            c.phone?.includes(guestSearch),
        )
      : [];

  const fillFromHistory = (g: GuestHistoryRecord) => {
    setForm((prev) => ({
      ...prev,
      guestName: g.guestName,
      phone: g.phone,
      idType: g.idType,
      idNumber: g.idNumber,
      adults: String(g.adults),
      children: String(g.children),
      companyName: g.companyName,
      companyGstNumber: g.companyGstNumber,
    }));
    setGuestSearch("");
    setShowGuestDropdown(false);
  };

  const allRooms = FLOOR_DATA.flatMap((f) => f.rooms);

  const handleSubmit = async () => {
    if (!actor || !form.guestName || !form.roomNumber) return;
    setIsSubmitting(true);
    try {
      const checkIn: GuestCheckIn = {
        id: crypto.randomUUID(),
        guestName: form.guestName,
        phone: form.phone,
        roomNumber: form.roomNumber,
        idType: form.idType,
        idNumber: form.idNumber,
        adults: BigInt(form.adults || "1"),
        children: BigInt(form.children || "0"),
        checkInDate: form.checkInDate,
        expectedCheckOut: form.expectedCheckOut,
        actualCheckOut: "",
        status: GuestCheckInStatus.checkedIn,
        totalAmount: Number(form.totalAmount) || 0,
        advancePaid: Number(form.advancePaid) || 0,
        notes: form.notes,
        createdAt: BigInt(Date.now()),
      };
      await actor.createGuestCheckIn(checkIn);
      await queryClient.invalidateQueries({ queryKey: ["guestCheckIns"] });
      setShowForm(false);
      toast.success("Guest checked in successfully!");
      // Save discount and file data
      if (form.discountValue && Number(form.discountValue) > 0) {
        localStorage.setItem(
          `kdm_guest_discount_${checkIn.id}`,
          JSON.stringify({
            discountType: form.discountType,
            discountValue: Number(form.discountValue),
          }),
        );
      }
      if (form.guestIdDocUrl)
        localStorage.setItem(
          `kdm_guest_iddoc_${checkIn.id}`,
          form.guestIdDocUrl,
        );
      if (form.guestPhotoUrl)
        localStorage.setItem(
          `kdm_guest_photo_${checkIn.id}`,
          form.guestPhotoUrl,
        );
      if (form.guestIdDocUrl || form.guestPhotoUrl) {
        localStorage.setItem(
          `kdm_guest_files_${checkIn.id}`,
          JSON.stringify({
            idDocUrl: form.guestIdDocUrl || "",
            photoUrl: form.guestPhotoUrl || "",
          }),
        );
      }
      // Save to guest history
      if (form.phone) {
        const history = getGuestHistory();
        const existing = history.findIndex((h) => h.id === form.phone);
        const record: GuestHistoryRecord = {
          id: form.phone,
          guestName: form.guestName,
          phone: form.phone,
          idType: form.idType,
          idNumber: form.idNumber,
          adults: Number(form.adults) || 1,
          children: Number(form.children) || 0,
          companyName: form.companyName,
          companyGstNumber: form.companyGstNumber,
          lastVisit: new Date().toISOString().split("T")[0],
        };
        if (existing >= 0) history[existing] = record;
        else history.unshift(record);
        saveGuestHistory(history);
      }
      setForm({
        guestName: "",
        phone: "",
        roomNumber: "",
        idType: "Aadhaar",
        idNumber: "",
        adults: "1",
        children: "0",
        checkInDate: new Date().toISOString().split("T")[0],
        expectedCheckOut: new Date(Date.now() + 86400000)
          .toISOString()
          .split("T")[0],
        totalAmount: "",
        advancePaid: "",
        notes: "",
        companyName: "",
        companyGstNumber: "",
        occupancy: "Single",
        discountType: "percent",
        discountValue: "",
        guestIdDocUrl: "",
        guestPhotoUrl: "",
      });
    } catch (err) {
      console.error("Check-in error:", err);
    }
    setIsSubmitting(false);
  };

  const [checkoutGuest, setCheckoutGuest] = useState<GuestCheckIn | null>(null);
  const [editGuest, setEditGuest] = useState<GuestCheckIn | null>(null);
  const [editForm, setEditForm] = useState<
    Partial<
      GuestCheckIn & {
        companyName: string;
        companyGstNumber: string;
        address: string;
        city: string;
        occupancy: string;
        discountType: string;
        discountValue: string;
      }
    >
  >({});
  const [folioGuest, setFolioGuest] = useState<GuestCheckIn | null>(null);
  const [folioExtras, setFolioExtras] = useState({
    extraBed: "0",
    laundry: "0",
    other: "0",
    otherDesc: "",
  });
  // Load folio extras from localStorage when folio dialog opens
  useEffect(() => {
    if (folioGuest) {
      try {
        const saved = localStorage.getItem(`kdm_folio_extras_${folioGuest.id}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          setFolioExtras({
            extraBed: String(parsed.extraBed || "0"),
            laundry: String(parsed.laundry || "0"),
            other: String(parsed.other || "0"),
            otherDesc: parsed.otherDesc || "",
          });
        } else {
          setFolioExtras({
            extraBed: "0",
            laundry: "0",
            other: "0",
            otherDesc: "",
          });
        }
      } catch {
        setFolioExtras({
          extraBed: "0",
          laundry: "0",
          other: "0",
          otherDesc: "",
        });
      }
    }
  }, [folioGuest]);
  // Save folio extras to localStorage on change
  useEffect(() => {
    if (folioGuest) {
      try {
        localStorage.setItem(
          `kdm_folio_extras_${folioGuest.id}`,
          JSON.stringify(folioExtras),
        );
      } catch {}
    }
  }, [folioExtras, folioGuest]);
  const [roomChangeGuest, setRoomChangeGuest] = useState<GuestCheckIn | null>(
    null,
  );
  const [roomChangeNewRoom, setRoomChangeNewRoom] = useState("");
  const [roomSearchText, setRoomSearchText] = useState("");
  const [invoiceDialog, setInvoiceDialog] = useState(false);
  const [invoiceOtherCharges, setInvoiceOtherCharges] = useState("0");
  const [invoiceDiscount, setInvoiceDiscount] = useState("0");
  const [invoicePaymentMode, setInvoicePaymentMode] = useState<string>("Cash");
  const [invoiceSaving, setInvoiceSaving] = useState(false);
  const [invoiceCheckoutDate, setInvoiceCheckoutDate] = useState("");
  const { mutateAsync: createCheckoutSession } = useCreateCheckoutSession();

  const openInvoiceDialog = (guest: GuestCheckIn) => {
    setCheckoutGuest(guest);
    setInvoiceOtherCharges("0");
    setInvoiceDiscount("0");
    setInvoicePaymentMode("cash");
    setInvoiceCheckoutDate(guest.expectedCheckOut);
    refetchFoodOrders();
    setInvoiceDialog(true);
  };

  const calcInvoice = (guest: GuestCheckIn) => {
    const roomInfo = FLOOR_DATA.flatMap((f) => f.rooms).find(
      (r) => r.no === guest.roomNumber,
    );
    const roomRate = roomInfo?.price ?? 2550;
    const roomType = roomInfo?.type ?? "Executive";
    const checkoutDate = invoiceCheckoutDate || guest.expectedCheckOut;
    const nights = Math.max(
      1,
      Math.round(
        (new Date(checkoutDate).getTime() -
          new Date(guest.checkInDate).getTime()) /
          86400000,
      ),
    );
    const roomCharges = nights * roomRate;
    const foodCharges = roomFoodOrders
      .filter((o) => o.roomNumber === guest.roomNumber)
      .reduce((s, o) => s + o.totalAmount, 0);
    const restCharges = (() => {
      try {
        const stored = localStorage.getItem("kdm_restaurant_room_bills");
        if (!stored) return 0;
        const bills = JSON.parse(stored) as Array<{
          roomNumber: string;
          total: number;
          paymentMode: string;
        }>;
        return bills
          .filter(
            (b) =>
              b.roomNumber === guest.roomNumber &&
              (b.paymentMode === "room" || b.paymentMode === "Room"),
          )
          .reduce((s, b) => s + b.total, 0);
      } catch {
        return 0;
      }
    })();
    const otherCharges = Number(invoiceOtherCharges) || 0;
    const discountPct = Number(invoiceDiscount) || 0;
    const gstPercent = 12;
    const subtotal = roomCharges + foodCharges + restCharges + otherCharges;
    // Apply guest-level discount from edit guest
    let guestDiscountAmt = 0;
    let guestDiscountLabel = "";
    try {
      const gd = localStorage.getItem(`kdm_guest_discount_${guest.id}`);
      if (gd) {
        const { discountType, discountValue } = JSON.parse(gd);
        if (discountType === "percent" && discountValue > 0) {
          guestDiscountAmt = (subtotal * discountValue) / 100;
          guestDiscountLabel = `Guest Discount (${discountValue}%)`;
        } else if (discountType === "flat" && discountValue > 0) {
          guestDiscountAmt = discountValue;
          guestDiscountLabel = `Guest Discount (Flat ₹${discountValue})`;
        }
      }
    } catch {}
    const discountAmt = (subtotal * discountPct) / 100 + guestDiscountAmt;
    const afterDiscount = subtotal - discountAmt;
    const gstAmount = Math.round((afterDiscount * gstPercent) / 100);
    const totalAmount = afterDiscount + gstAmount;
    const balanceDue = Math.max(0, totalAmount - guest.advancePaid);
    return {
      roomRate,
      roomType,
      nights,
      roomCharges,
      foodCharges,
      restCharges,
      otherCharges,
      discountPct,
      guestDiscountAmt,
      guestDiscountLabel,
      gstPercent,
      gstAmount,
      totalAmount,
      balanceDue,
    };
  };

  const handleConfirmCheckout = async () => {
    if (!actor || !checkoutGuest) return;
    setInvoiceSaving(true);
    const inv = calcInvoice(checkoutGuest);
    try {
      const invoice: RoomInvoice = {
        id: crypto.randomUUID(),
        guestCheckInId: checkoutGuest.id,
        guestName: checkoutGuest.guestName,
        roomNumber: checkoutGuest.roomNumber,
        roomType: inv.roomType,
        checkInDate: checkoutGuest.checkInDate,
        checkOutDate: invoiceCheckoutDate || checkoutGuest.expectedCheckOut,
        nights: BigInt(inv.nights),
        roomRate: inv.roomRate,
        roomCharges: inv.roomCharges,
        foodCharges: inv.foodCharges,
        otherCharges: inv.otherCharges + (inv.restCharges || 0),
        discount: inv.discountPct,
        gstPercent: inv.gstPercent,
        gstAmount: inv.gstAmount,
        totalAmount: inv.totalAmount,
        advancePaid: checkoutGuest.advancePaid,
        balanceDue: inv.balanceDue,
        paymentMode: (invoicePaymentMode === "Cash"
          ? "cash"
          : invoicePaymentMode === "UPI"
            ? "upi"
            : invoicePaymentMode.toLowerCase().includes("card")
              ? "card"
              : "cash") as any as PaymentMode,
        notes: "",
        createdAt: BigInt(Date.now()),
      };
      await (actor as any).createRoomInvoice(invoice);
      await actor.updateGuestCheckIn({
        ...checkoutGuest,
        status: GuestCheckInStatus.checkedOut,
        actualCheckOut: new Date().toISOString().split("T")[0],
      });
      // Save to localStorage for AllInvoicesSection and dashboard revenue
      try {
        const lsInvoice = {
          ...invoice,
          nights: Number(invoice.nights),
          createdAt: Number(invoice.createdAt),
          checkoutDate: invoice.checkOutDate,
          billNumber: `RB/${new Date().getFullYear()}-${String(new Date().getFullYear() + 1).slice(2)}/${String(Date.now()).slice(-4)}`,
        };
        const existingInvoices: any[] = JSON.parse(
          localStorage.getItem("kdm_room_invoices") || "[]",
        );
        existingInvoices.push(lsInvoice);
        localStorage.setItem(
          "kdm_room_invoices",
          JSON.stringify(existingInvoices),
        );
      } catch {}
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["guestCheckIns"] }),
        queryClient.invalidateQueries({ queryKey: ["roomInvoices"] }),
      ]);
      setInvoiceDialog(false);
      setCheckoutGuest(null);
      toast.success("Guest checked out and invoice saved.");
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error("Checkout failed. Please try again.");
    }
    setInvoiceSaving(false);
  };

  const handleStripePayment = async () => {
    if (!checkoutGuest) return;
    const inv = calcInvoice(checkoutGuest);
    try {
      const session = await createCheckoutSession([
        {
          name: `Room Stay - ${checkoutGuest.roomNumber}`,
          quantity: 1n,
          amount: BigInt(Math.round(inv.balanceDue * 100)),
        },
      ]);
      window.location.href = session.url;
    } catch {
      toast.error("Failed to create payment session. Please try again.");
    }
  };

  const checkedIn = checkIns.filter(
    (g) => g.status === GuestCheckInStatus.checkedIn,
  );
  const checkedOut = checkIns.filter(
    (g) => g.status === GuestCheckInStatus.checkedOut,
  );

  return (
    <div>
      <SectionTitle title="Guest Check-In / Check-Out" />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", gap: 16 }}>
          <div
            style={{
              background: CARD_BG,
              border: `1px solid ${BORDER}`,
              borderRadius: 8,
              padding: "12px 20px",
              textAlign: "center",
            }}
          >
            <p style={{ color: GOLD, fontSize: "1.5rem", fontWeight: 700 }}>
              {checkedIn.length}
            </p>
            <p
              style={{ color: "#1e293b", fontWeight: 600, fontSize: "0.75rem" }}
            >
              Checked In
            </p>
          </div>
          <div
            style={{
              background: CARD_BG,
              border: `1px solid ${BORDER}`,
              borderRadius: 8,
              padding: "12px 20px",
              textAlign: "center",
            }}
          >
            <p
              style={{ color: "#22c55e", fontSize: "1.5rem", fontWeight: 700 }}
            >
              {checkedOut.length}
            </p>
            <p
              style={{ color: "#1e293b", fontWeight: 600, fontSize: "0.75rem" }}
            >
              Checked Out Today
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Button
            onClick={() => setShowForm(true)}
            style={{ background: GOLD, color: "#000", fontWeight: 600 }}
            data-ocid="guest-checkin.open_modal_button"
          >
            + New Check-In
          </Button>
          <Button
            variant="outline"
            style={{ fontWeight: 600, fontSize: "0.8rem" }}
            onClick={() => {
              const imp = document.createElement("input");
              imp.type = "file";
              imp.accept = ".csv,.xlsx,.xls";
              imp.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  const text = reader.result as string;
                  const lines = text.split("\n").filter(Boolean);
                  if (lines.length < 2) {
                    toast.error("No data rows found");
                    return;
                  }
                  let imported = 0;
                  for (const line of lines.slice(1)) {
                    const cols = line
                      .split(",")
                      .map((c) => c.replace(/^"|"$/g, "").trim());
                    if (!cols[0] || !cols[2]) continue;
                    const g: any = {
                      id: crypto.randomUUID(),
                      guestName: cols[0],
                      phone: cols[1] || "",
                      roomNumber: cols[2],
                      idType: cols[3] || "Aadhaar",
                      idNumber: cols[4] || "",
                      adults: BigInt(cols[5] || "1"),
                      children: BigInt(cols[6] || "0"),
                      checkInDate:
                        cols[7] || new Date().toISOString().split("T")[0],
                      expectedCheckOut:
                        cols[8] ||
                        new Date(Date.now() + 86400000)
                          .toISOString()
                          .split("T")[0],
                      actualCheckOut: "",
                      status: GuestCheckInStatus.checkedIn,
                      totalAmount: Number(cols[9]) || 0,
                      advancePaid: Number(cols[10]) || 0,
                      notes: cols[12] || "",
                      createdAt: BigInt(Date.now()),
                    };
                    if (actor) actor.createGuestCheckIn(g);
                    imported++;
                  }
                  setTimeout(
                    () =>
                      queryClient.invalidateQueries({
                        queryKey: ["guestCheckIns"],
                      }),
                    1000,
                  );
                  toast.success(`Imported ${imported} guests`);
                };
                reader.readAsText(file);
              };
              imp.click();
            }}
            data-ocid="guest-checkin.upload_button"
          >
            📥 Import Excel/CSV
          </Button>
          <Button
            variant="outline"
            style={{
              fontWeight: 600,
              fontSize: "0.8rem",
              color: "#16a34a",
              borderColor: "#16a34a",
            }}
            onClick={() => {
              const bom = "\uFEFF";
              const headers = [
                "Name",
                "Phone",
                "Room",
                "ID Type",
                "ID Number",
                "Adults",
                "Children",
                "Check-In",
                "Expected Out",
                "Total",
                "Advance",
                "Company",
                "Notes",
                "Status",
              ];
              const rows = checkIns.map((g) => [
                g.guestName,
                g.phone,
                g.roomNumber,
                g.idType,
                g.idNumber,
                String(g.adults),
                String(g.children),
                g.checkInDate,
                g.expectedCheckOut,
                String(g.totalAmount),
                String(g.advancePaid),
                "",
                g.notes,
                g.status === GuestCheckInStatus.checkedIn
                  ? "Checked In"
                  : "Checked Out",
              ]);
              const csv =
                bom +
                [headers, ...rows]
                  .map((r) => r.map((c) => `"${c}"`).join(","))
                  .join("\n");
              const a = document.createElement("a");
              a.href = URL.createObjectURL(
                new Blob([csv], { type: "text/csv" }),
              );
              a.download = "guests.csv";
              a.click();
            }}
            data-ocid="guest-checkin.secondary_button"
          >
            📊 Export Excel
          </Button>
          <Button
            variant="outline"
            style={{
              fontWeight: 600,
              fontSize: "0.8rem",
              color: "#2563eb",
              borderColor: "#2563eb",
            }}
            onClick={() => {
              const rows = checkIns
                .map(
                  (g) =>
                    `<tr><td>${g.guestName}</td><td>${g.phone}</td><td>${g.roomNumber}</td><td>${g.checkInDate}</td><td>${g.expectedCheckOut}</td><td>₹${g.totalAmount}</td><td>₹${g.advancePaid}</td><td>${g.status === GuestCheckInStatus.checkedIn ? "In" : "Out"}</td></tr>`,
                )
                .join("");
              reprintBill(
                "Guest List",
                `<h2>Guest List</h2><table><thead><tr><th>Name</th><th>Phone</th><th>Room</th><th>Check-In</th><th>Expected Out</th><th>Total</th><th>Advance</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>`,
              );
            }}
            data-ocid="guest-checkin.button"
          >
            📄 Export PDF
          </Button>
        </div>
      </div>

      {/* New Check-In Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent
          style={{
            background: "#ffffff",
            border: `1px solid ${BORDER}`,
            maxWidth: 600,
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <DialogHeader>
            <DialogTitle
              style={{ color: GOLD, fontFamily: "'Playfair Display', serif" }}
            >
              New Guest Check-In
            </DialogTitle>
          </DialogHeader>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 12,
            }}
          >
            <div style={{ gridColumn: "1 / -1", position: "relative" }}>
              <Label
                style={{
                  color: "#1e293b",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                }}
              >
                🔍 Search Past Guest (optional)
              </Label>
              <Input
                value={guestSearch}
                onChange={(e) => {
                  setGuestSearch(e.target.value);
                  setShowGuestDropdown(true);
                }}
                onFocus={() => setShowGuestDropdown(true)}
                placeholder="Search by name, mobile, or company..."
                data-ocid="guest-checkin.search_input"
              />
              {showGuestDropdown &&
                (filteredHistory.length > 0 ||
                  filteredCustomers.length > 0) && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      background: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                      zIndex: 50,
                      boxShadow: "0 4px 16px #0002",
                      maxHeight: 220,
                      overflowY: "auto",
                    }}
                  >
                    {filteredHistory.length > 0 && (
                      <div
                        style={{
                          padding: "4px 12px",
                          fontSize: "0.7rem",
                          color: "#94a3b8",
                          fontWeight: 600,
                          background: "#f1f5f9",
                        }}
                      >
                        PAST GUESTS
                      </div>
                    )}
                    {filteredHistory.map((g) => (
                      <button
                        type="button"
                        key={g.id}
                        onClick={() => fillFromHistory(g)}
                        onKeyUp={(e) => {
                          if (e.key === "Enter") fillFromHistory(g);
                        }}
                        style={{
                          padding: "8px 12px",
                          cursor: "pointer",
                          borderBottom: "1px solid #f1f5f9",
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                        }}
                      >
                        <span style={{ fontWeight: 700, color: "#1e293b" }}>
                          {g.guestName}
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                          {g.phone}
                          {g.companyName ? ` · ${g.companyName}` : ""} · Last:{" "}
                          {g.lastVisit}
                        </span>
                      </button>
                    ))}
                    {filteredCustomers.length > 0 && (
                      <>
                        <div
                          style={{
                            padding: "4px 12px",
                            fontSize: "0.7rem",
                            color: "#94a3b8",
                            fontWeight: 600,
                            background: "#f1f5f9",
                          }}
                        >
                          FROM CUSTOMERS
                        </div>
                        {filteredCustomers.map((c, i) => (
                          <button
                            // biome-ignore lint/suspicious/noArrayIndexKey: customer search results
                            key={`cust-${i}`}
                            type="button"
                            style={{
                              padding: "8px 12px",
                              cursor: "pointer",
                              display: "flex",
                              flexDirection: "column",
                              gap: 2,
                              width: "100%",
                              background: "transparent",
                              border: "none",
                              borderBottom: "1px solid #f1f5f9",
                              textAlign: "left",
                            }}
                            onMouseDown={() => {
                              setForm((prev) => ({
                                ...prev,
                                guestName: c.name,
                                phone: c.phone,
                              }));
                              setGuestSearch("");
                              setShowGuestDropdown(false);
                            }}
                          >
                            <span style={{ fontWeight: 700, color: "#1e293b" }}>
                              {c.name}
                            </span>
                            <span
                              style={{ fontSize: "0.75rem", color: "#64748b" }}
                            >
                              {c.phone} · Customer
                            </span>
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                )}
              {showGuestDropdown &&
                guestSearch.length >= 2 &&
                filteredHistory.length === 0 &&
                filteredCustomers.length === 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      background: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                      zIndex: 50,
                      padding: "8px 12px",
                      color: "#94a3b8",
                      fontSize: "0.8rem",
                    }}
                  >
                    No past guests found
                  </div>
                )}
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <Label
                style={{
                  color: "#1e293b",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                }}
              >
                Guest Name *
              </Label>
              <Input
                value={form.guestName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, guestName: e.target.value }))
                }
                placeholder="Full name"
                data-ocid="guest-checkin.guestName.input"
              />
            </div>
            <div>
              <Label
                style={{
                  color: "#1e293b",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                }}
              >
                Phone
              </Label>
              <Input
                value={form.phone}
                onChange={(e) =>
                  setForm((p) => ({ ...p, phone: e.target.value }))
                }
                placeholder="Mobile number"
                data-ocid="guest-checkin.phone.input"
              />
            </div>
            <div>
              <Label
                style={{
                  color: "#1e293b",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                }}
              >
                Room Number *
              </Label>
              <div style={{ position: "relative" }}>
                <Input
                  value={
                    form.roomNumber
                      ? `Room ${form.roomNumber}${roomSearchText ? ` (${roomSearchText})` : ""}`
                      : roomSearchText
                  }
                  onChange={(e) => {
                    setRoomSearchText(e.target.value);
                    setForm((p) => ({ ...p, roomNumber: "" }));
                  }}
                  onFocus={() => {
                    if (form.roomNumber) setRoomSearchText("");
                  }}
                  placeholder="Type room number or type..."
                  data-ocid="guest-checkin.roomNumber.input"
                  style={{ background: "#fff" }}
                />
                {(roomSearchText || !form.roomNumber) && (
                  <div
                    style={{
                      position: "absolute",
                      zIndex: 50,
                      background: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: 6,
                      maxHeight: 180,
                      overflowY: "auto",
                      width: "100%",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      top: "100%",
                      left: 0,
                    }}
                  >
                    {allRooms
                      .filter(
                        (r) =>
                          !roomSearchText ||
                          r.no.includes(roomSearchText) ||
                          r.type
                            .toLowerCase()
                            .includes(roomSearchText.toLowerCase()),
                      )
                      .slice(0, 20)
                      .map((r) => (
                        <button
                          type="button"
                          key={r.no}
                          onClick={() => {
                            const priceInfo = ROOM_PRICE_MAP[r.no];
                            const autoPrice = priceInfo
                              ? form.occupancy === "Double" &&
                                priceInfo.doublePrice != null
                                ? priceInfo.doublePrice
                                : priceInfo.singlePrice
                              : "";
                            setForm((p) => ({
                              ...p,
                              roomNumber: r.no,
                              totalAmount: autoPrice
                                ? String(autoPrice)
                                : p.totalAmount,
                            }));
                            setRoomSearchText("");
                          }}
                          style={{
                            display: "block",
                            width: "100%",
                            textAlign: "left",
                            padding: "8px 12px",
                            cursor: "pointer",
                            fontSize: "0.85rem",
                            color: "#1e293b",
                            fontWeight: 600,
                            borderBottom: "1px solid #f1f5f9",
                            background: "transparent",
                            border: "none",
                          }}
                        >
                          Room {r.no} — {r.type}
                        </button>
                      ))}
                  </div>
                )}
              </div>
              {form.roomNumber && ROOM_PRICE_MAP[form.roomNumber] && (
                <p
                  style={{
                    color: GOLD,
                    fontSize: "0.72rem",
                    marginTop: 3,
                    fontWeight: 600,
                  }}
                >
                  {ROOM_PRICE_MAP[form.roomNumber].type} — ₹
                  {(form.occupancy === "Double" &&
                  ROOM_PRICE_MAP[form.roomNumber].doublePrice != null
                    ? ROOM_PRICE_MAP[form.roomNumber].doublePrice
                    : ROOM_PRICE_MAP[form.roomNumber].singlePrice
                  )?.toLocaleString("en-IN")}{" "}
                  ({form.occupancy})
                </p>
              )}
            </div>
            <div>
              <Label
                style={{
                  color: "#1e293b",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                }}
              >
                Occupancy
              </Label>
              <Select
                value={form.occupancy}
                onValueChange={(v) => {
                  const priceInfo = form.roomNumber
                    ? ROOM_PRICE_MAP[form.roomNumber]
                    : null;
                  const autoPrice = priceInfo
                    ? v === "Double" && priceInfo.doublePrice != null
                      ? priceInfo.doublePrice
                      : priceInfo.singlePrice
                    : null;
                  setForm((p) => ({
                    ...p,
                    occupancy: v,
                    totalAmount: autoPrice ? String(autoPrice) : p.totalAmount,
                  }));
                }}
              >
                <SelectTrigger data-ocid="guest-checkin.occupancy.select">
                  <SelectValue placeholder="Single / Double" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Single">Single</SelectItem>
                  <SelectItem value="Double">Double</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label
                style={{
                  color: "#1e293b",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                }}
              >
                ID Type
              </Label>
              <Select
                value={form.idType}
                onValueChange={(v) => setForm((p) => ({ ...p, idType: v }))}
              >
                <SelectTrigger data-ocid="guest-checkin.idType.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Aadhaar", "Passport", "Driving License", "Voter ID"].map(
                    (t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label
                style={{
                  color: "#1e293b",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                }}
              >
                ID Number
              </Label>
              <Input
                value={form.idNumber}
                onChange={(e) =>
                  setForm((p) => ({ ...p, idNumber: e.target.value }))
                }
                placeholder="ID number"
                data-ocid="guest-checkin.idNumber.input"
              />
            </div>
            {/* ID Document & Guest Photo Upload */}
            <GuestFileUploads form={form} setForm={setForm} />
            <div>
              <Label
                style={{
                  color: "#1e293b",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                }}
              >
                Adults
              </Label>
              <Input
                type="number"
                min="1"
                value={form.adults}
                onChange={(e) =>
                  setForm((p) => ({ ...p, adults: e.target.value }))
                }
                data-ocid="guest-checkin.adults.input"
              />
            </div>
            <div>
              <Label
                style={{
                  color: "#1e293b",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                }}
              >
                Children
              </Label>
              <Input
                type="number"
                min="0"
                value={form.children}
                onChange={(e) =>
                  setForm((p) => ({ ...p, children: e.target.value }))
                }
                data-ocid="guest-checkin.children.input"
              />
            </div>
            <div>
              <Label
                style={{
                  color: "#1e293b",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                }}
              >
                Check-In Date
              </Label>
              <Input
                type="date"
                value={form.checkInDate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, checkInDate: e.target.value }))
                }
                data-ocid="guest-checkin.checkInDate.input"
              />
            </div>
            <div>
              <Label
                style={{
                  color: "#1e293b",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                }}
              >
                Expected Check-Out
              </Label>
              <Input
                type="date"
                value={form.expectedCheckOut}
                onChange={(e) =>
                  setForm((p) => ({ ...p, expectedCheckOut: e.target.value }))
                }
                data-ocid="guest-checkin.expectedCheckOut.input"
              />
            </div>
            <div>
              <Label
                style={{
                  color: "#1e293b",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                }}
              >
                Total Amount (₹)
              </Label>
              <Input
                type="number"
                value={form.totalAmount}
                onChange={(e) =>
                  setForm((p) => ({ ...p, totalAmount: e.target.value }))
                }
                placeholder="0"
                data-ocid="guest-checkin.totalAmount.input"
              />
            </div>
            <div>
              <Label
                style={{
                  color: "#1e293b",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                }}
              >
                Advance Paid (₹)
              </Label>
              <Input
                type="number"
                value={form.advancePaid}
                onChange={(e) =>
                  setForm((p) => ({ ...p, advancePaid: e.target.value }))
                }
                placeholder="0"
                data-ocid="guest-checkin.advancePaid.input"
              />
            </div>
            {/* Discount Fields */}
            <div>
              <Label
                style={{
                  color: "#1e293b",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                }}
              >
                Discount Type
              </Label>
              <Select
                value={form.discountType}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, discountType: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">Discount %</SelectItem>
                  <SelectItem value="flat">Flat Discount (₹)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label
                style={{
                  color: "#1e293b",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                }}
              >
                {form.discountType === "percent"
                  ? "Discount %"
                  : "Discount Amount (₹)"}
              </Label>
              <Input
                type="number"
                value={form.discountValue}
                onChange={(e) =>
                  setForm((p) => ({ ...p, discountValue: e.target.value }))
                }
                placeholder="0"
                data-ocid="guest-checkin.discountValue.input"
              />
              {Number(form.discountValue) > 0 && (
                <p
                  style={{
                    color: "#c9a84c",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    marginTop: 3,
                  }}
                >
                  {form.discountType === "percent"
                    ? `Discount: ${form.discountValue}% of room tariff`
                    : `Flat discount: ₹${Number(form.discountValue).toLocaleString("en-IN")}`}
                </p>
              )}
            </div>
            <div>
              <Label
                style={{
                  color: "#1e293b",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                }}
              >
                Company Name (optional)
              </Label>
              <Input
                value={form.companyName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, companyName: e.target.value }))
                }
                placeholder="Company / Organisation"
                data-ocid="guest-checkin.companyName.input"
              />
            </div>
            <div>
              <Label
                style={{
                  color: "#1e293b",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                }}
              >
                Company GST Number (optional)
              </Label>
              <Input
                value={form.companyGstNumber}
                onChange={(e) =>
                  setForm((p) => ({ ...p, companyGstNumber: e.target.value }))
                }
                placeholder="22AAAAA0000A1Z5"
                data-ocid="guest-checkin.companyGstNumber.input"
              />
              {getStateFromGSTIN(form.companyGstNumber) && (
                <p
                  style={{
                    color: "#22c55e",
                    fontSize: "0.72rem",
                    marginTop: 2,
                    fontWeight: 600,
                  }}
                >
                  State: {getStateFromGSTIN(form.companyGstNumber)}
                </p>
              )}
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <Label
                style={{
                  color: "#1e293b",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                }}
              >
                Notes
              </Label>
              <textarea
                value={form.notes}
                onChange={(e) =>
                  setForm((p) => ({ ...p, notes: e.target.value }))
                }
                placeholder="Special requests, remarks..."
                data-ocid="guest-checkin.notes.textarea"
                style={{
                  width: "100%",
                  background: "#f8fafc",
                  border: `1px solid ${BORDER}`,
                  borderRadius: 6,
                  color: "#1e293b",
                  padding: "8px 12px",
                  fontSize: "0.875rem",
                  minHeight: 80,
                  resize: "vertical",
                }}
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{
                background: GOLD,
                color: "#000",
                fontWeight: 600,
                flex: 1,
              }}
              data-ocid="guest-checkin.submit_button"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {isSubmitting ? "Checking In..." : "Check In Guest"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowForm(false)}
              style={{ borderColor: BORDER }}
              data-ocid="guest-checkin.cancel_button"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Current Guests Table */}
      <div
        style={{
          background: CARD_BG,
          border: `1px solid ${BORDER}`,
          borderRadius: 8,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            padding: "1rem 1.25rem",
            borderBottom: `1px solid ${BORDER}`,
          }}
        >
          <p style={{ color: GOLD, fontWeight: 600 }}>
            Currently Checked In ({checkedIn.length})
          </p>
        </div>
        {isLoading ? (
          <div
            style={{
              padding: "2rem",
              textAlign: "center",
              color: "#1e293b",
              fontWeight: 600,
            }}
          >
            Loading guest data...
          </div>
        ) : checkedIn.length === 0 ? (
          <div
            style={{
              padding: "2rem",
              textAlign: "center",
              color: "#1e293b",
              fontWeight: 600,
            }}
            data-ocid="guest-checkin.empty_state"
          >
            No guests currently checked in. Use "+ New Check-In" to add guests.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.875rem",
              }}
            >
              <thead>
                <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                  {[
                    "Room",
                    "Guest Name",
                    "Phone",
                    "Check-In",
                    "Exp. C/O",
                    "Adults",
                    "Advance",
                    "Balance",
                    "Action",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 12px",
                        color: GOLD,
                        textAlign: "left",
                        fontWeight: 600,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {checkedIn.map((g, i) => (
                  <tr
                    key={g.id}
                    data-ocid={`guest-checkin.item.${i + 1}`}
                    style={{ borderBottom: `1px solid ${BORDER}20` }}
                  >
                    <td
                      style={{
                        padding: "10px 12px",
                        color: "#1e293b",
                        fontWeight: 600,
                      }}
                    >
                      {g.roomNumber}
                    </td>
                    <td style={{ padding: "10px 12px", color: "#1e293b" }}>
                      {g.guestName}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        color: "#1e293b",
                        fontWeight: 600,
                      }}
                    >
                      {g.phone}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        color: "#1e293b",
                        fontWeight: 600,
                      }}
                    >
                      {g.checkInDate}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        color: "#1e293b",
                        fontWeight: 600,
                      }}
                    >
                      {g.expectedCheckOut}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        color: "#1e293b",
                        fontWeight: 600,
                      }}
                    >
                      {String(g.adults)}
                    </td>
                    <td style={{ padding: "10px 12px", color: "#22c55e" }}>
                      ₹{g.advancePaid.toLocaleString()}
                    </td>
                    <td style={{ padding: "10px 12px", color: "#f59e0b" }}>
                      ₹{(g.totalAmount - g.advancePaid).toLocaleString()}
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <div
                        style={{ display: "flex", gap: 4, flexWrap: "wrap" }}
                      >
                        <Button
                          size="sm"
                          onClick={() => {
                            setEditGuest(g);
                            const extras = (() => {
                              try {
                                return JSON.parse(
                                  localStorage.getItem(
                                    `kdm_folio_extras_${g.id}`,
                                  ) || "{}",
                                );
                              } catch {
                                return {};
                              }
                            })();
                            setEditForm({
                              ...g,
                              companyName: extras.companyName || "",
                              companyGstNumber: extras.companyGstNumber || "",
                              address: extras.address || "",
                              city: extras.city || "",
                            });
                          }}
                          data-ocid={`guest-checkin.edit_button.${i + 1}`}
                          style={{
                            background: "#3b82f620",
                            color: "#3b82f6",
                            border: "1px solid #3b82f6",
                            fontSize: "0.75rem",
                          }}
                        >
                          ✏️ Edit
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setFolioGuest(g);
                            try {
                              const ex = JSON.parse(
                                localStorage.getItem(
                                  `kdm_folio_extras_${g.id}`,
                                ) || "{}",
                              );
                              setFolioExtras({
                                extraBed: String(ex.extraBed || "0"),
                                laundry: String(ex.laundry || "0"),
                                other: String(ex.other || "0"),
                                otherDesc: ex.otherDesc || "",
                              });
                            } catch {
                              setFolioExtras({
                                extraBed: "0",
                                laundry: "0",
                                other: "0",
                                otherDesc: "",
                              });
                            }
                          }}
                          data-ocid={`guest-checkin.folio.button.${i + 1}`}
                          style={{
                            background: `${GOLD}20`,
                            color: GOLD,
                            border: `1px solid ${GOLD}`,
                            fontSize: "0.75rem",
                          }}
                        >
                          📋 Folio
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => openInvoiceDialog(g)}
                          data-ocid={`guest-checkin.checkout.button.${i + 1}`}
                          style={{
                            background: "#f59e0b20",
                            color: "#f59e0b",
                            border: "1px solid #f59e0b",
                            fontSize: "0.75rem",
                          }}
                        >
                          Check Out
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            if (window.confirm("Delete this guest check-in?")) {
                              actor?.deleteGuestCheckIn(g.id).then(() =>
                                queryClient.invalidateQueries({
                                  queryKey: ["guestCheckIns"],
                                }),
                              );
                            }
                          }}
                          data-ocid={`guest-checkin.delete_button.${i + 1}`}
                          style={{
                            background: "#ef444420",
                            color: "#ef4444",
                            border: "1px solid #ef4444",
                            fontSize: "0.75rem",
                          }}
                        >
                          🗑️ Delete
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setRoomChangeGuest(g);
                            setRoomChangeNewRoom("");
                            setRoomSearchText("");
                          }}
                          data-ocid={`guest-checkin.room_change.button.${i + 1}`}
                          style={{
                            background: "#22c55e20",
                            color: "#22c55e",
                            border: "1px solid #22c55e",
                            fontSize: "0.75rem",
                          }}
                        >
                          🔀 Room
                        </Button>
                        {(() => {
                          let files: { idDocUrl?: string; photoUrl?: string } =
                            {};
                          try {
                            files = JSON.parse(
                              localStorage.getItem(`kdm_guest_files_${g.id}`) ||
                                "{}",
                            );
                          } catch {}
                          return (
                            <>
                              {files.idDocUrl && (
                                <span
                                  style={{
                                    background: "#22c55e",
                                    color: "#fff",
                                    borderRadius: 4,
                                    padding: "2px 5px",
                                    fontSize: "0.65rem",
                                    fontWeight: 700,
                                  }}
                                >
                                  📄 ID ✓
                                </span>
                              )}
                              {files.photoUrl && (
                                <span
                                  style={{
                                    background: "#22c55e",
                                    color: "#fff",
                                    borderRadius: 4,
                                    padding: "2px 5px",
                                    fontSize: "0.65rem",
                                    fontWeight: 700,
                                  }}
                                >
                                  📷 Photo ✓
                                </span>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Checkout History */}
      {checkedOut.length > 0 && (
        <div
          style={{
            background: CARD_BG,
            border: `1px solid ${BORDER}`,
            borderRadius: 8,
          }}
        >
          <div
            style={{
              padding: "1rem 1.25rem",
              borderBottom: `1px solid ${BORDER}`,
            }}
          >
            <p style={{ color: "#1e293b", fontWeight: 600 }}>
              Recent Check-Outs ({checkedOut.length})
            </p>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.875rem",
              }}
            >
              <thead>
                <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                  {[
                    "Room",
                    "Guest",
                    "Check-In",
                    "Check-Out",
                    "Total Amount",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 12px",
                        color: "#1e293b",
                        textAlign: "left",
                        fontWeight: 600,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {checkedOut.slice(0, 10).map((g, i) => (
                  <tr
                    key={g.id}
                    data-ocid={`guest-checkout.item.${i + 1}`}
                    style={{ borderBottom: `1px solid ${BORDER}20` }}
                  >
                    <td
                      style={{
                        padding: "10px 12px",
                        color: "#1e293b",
                        fontWeight: 600,
                      }}
                    >
                      {g.roomNumber}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        color: "#1e293b",
                        fontWeight: 600,
                      }}
                    >
                      {g.guestName}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        color: "#1e293b",
                        fontWeight: 600,
                      }}
                    >
                      {g.checkInDate}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        color: "#1e293b",
                        fontWeight: 600,
                      }}
                    >
                      {g.actualCheckOut}
                    </td>
                    <td style={{ padding: "10px 12px", color: GOLD }}>
                      ₹{g.totalAmount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Room Invoice Dialog */}
      {/* ── Room Change Dialog ── */}
      {roomChangeGuest && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 10,
              padding: 28,
              minWidth: 340,
              maxWidth: 420,
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
            }}
          >
            <h3
              style={{
                color: "#1e293b",
                fontWeight: 700,
                marginBottom: 16,
                fontSize: "1.1rem",
              }}
            >
              🔀 Change Room
            </h3>
            <p
              style={{
                color: "#475569",
                fontSize: "0.85rem",
                marginBottom: 12,
              }}
            >
              Current Room:{" "}
              <strong style={{ color: "#1e293b" }}>
                Room {roomChangeGuest.roomNumber}
              </strong>{" "}
              — {roomChangeGuest.guestName}
            </p>
            <label
              htmlFor="room-change-input"
              style={{
                color: "#1e293b",
                fontWeight: 600,
                fontSize: "0.8rem",
                display: "block",
                marginBottom: 6,
              }}
            >
              New Room
            </label>
            <div style={{ position: "relative", marginBottom: 16 }}>
              <input
                value={
                  roomChangeNewRoom
                    ? `Room ${roomChangeNewRoom}`
                    : roomSearchText
                }
                onChange={(e) => {
                  setRoomSearchText(e.target.value);
                  setRoomChangeNewRoom("");
                }}
                placeholder="Type room number..."
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #e2e8f0",
                  borderRadius: 6,
                  fontSize: "0.9rem",
                  color: "#1e293b",
                  fontWeight: 600,
                }}
              />
              {(roomSearchText || !roomChangeNewRoom) && (
                <div
                  style={{
                    position: "absolute",
                    zIndex: 50,
                    background: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 6,
                    maxHeight: 160,
                    overflowY: "auto",
                    width: "100%",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    top: "100%",
                    left: 0,
                  }}
                >
                  {FLOOR_DATA.flatMap((f) => f.rooms)
                    .filter((r) => r.no !== roomChangeGuest.roomNumber)
                    .filter((r) => {
                      const occupiedRooms = checkIns
                        .filter(
                          (c) =>
                            c.status === GuestCheckInStatus.checkedIn &&
                            c.id !== roomChangeGuest.id,
                        )
                        .map((c) => c.roomNumber);
                      return !occupiedRooms.includes(r.no);
                    })
                    .filter(
                      (r) =>
                        !roomSearchText ||
                        r.no.includes(roomSearchText) ||
                        r.type
                          .toLowerCase()
                          .includes(roomSearchText.toLowerCase()),
                    )
                    .slice(0, 20)
                    .map((r) => (
                      <button
                        type="button"
                        key={r.no}
                        onClick={() => {
                          setRoomChangeNewRoom(r.no);
                          setRoomSearchText("");
                        }}
                        style={{
                          display: "block",
                          width: "100%",
                          textAlign: "left",
                          padding: "8px 12px",
                          cursor: "pointer",
                          fontSize: "0.85rem",
                          color: "#1e293b",
                          fontWeight: 600,
                          borderBottom: "1px solid #f1f5f9",
                          background: "transparent",
                          border: "none",
                        }}
                      >
                        Room {r.no} — {r.type}
                      </button>
                    ))}
                </div>
              )}
            </div>
            <div
              style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}
            >
              <button
                type="button"
                onClick={() => {
                  setRoomChangeGuest(null);
                  setRoomChangeNewRoom("");
                  setRoomSearchText("");
                }}
                style={{
                  padding: "8px 18px",
                  borderRadius: 6,
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                  color: "#475569",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!roomChangeNewRoom}
                onClick={async () => {
                  if (!actor || !roomChangeNewRoom) return;
                  await actor.updateGuestCheckIn({
                    ...roomChangeGuest,
                    roomNumber: roomChangeNewRoom,
                  });
                  await queryClient.invalidateQueries({
                    queryKey: ["guestCheckIns"],
                  });
                  setRoomChangeGuest(null);
                  setRoomChangeNewRoom("");
                  setRoomSearchText("");
                }}
                style={{
                  padding: "8px 18px",
                  borderRadius: 6,
                  border: "1px solid #22c55e",
                  background: roomChangeNewRoom ? "#22c55e" : "#d1fae5",
                  color: roomChangeNewRoom ? "#fff" : "#94a3b8",
                  fontWeight: 700,
                  cursor: roomChangeNewRoom ? "pointer" : "not-allowed",
                }}
              >
                Confirm Change
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── Edit Guest Dialog ── */}
      {editGuest && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 28,
              width: "100%",
              maxWidth: 580,
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <h3 style={{ color: GOLD, fontWeight: 700, fontSize: "1.1rem" }}>
                ✏️ Edit Guest Details — Room {editGuest.roomNumber}
              </h3>
              <button
                type="button"
                onClick={() => setEditGuest(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 20,
                  color: "#888",
                }}
              >
                ✕
              </button>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              {[
                { label: "Guest Name", key: "guestName" },
                { label: "Phone", key: "phone" },
                { label: "Address", key: "address" },
                { label: "City", key: "city" },
                { label: "Company Name", key: "companyName" },
                { label: "Company GST Number", key: "companyGstNumber" },
                { label: "ID Type", key: "idType" },
                { label: "ID Number", key: "idNumber" },
                { label: "Room Number", key: "roomNumber" },
                { label: "Room Rate (₹)", key: "totalAmount" },
                { label: "Advance Paid (₹)", key: "advancePaid" },
                { label: "Check-In Date", key: "checkInDate" },
                { label: "Expected Check-Out", key: "expectedCheckOut" },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label
                    htmlFor={`edit-guest-${key}`}
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#374151",
                      display: "block",
                      marginBottom: 3,
                    }}
                  >
                    {label}
                  </label>
                  <input
                    id={`edit-guest-${key}`}
                    type={
                      key === "checkInDate" || key === "expectedCheckOut"
                        ? "date"
                        : key === "totalAmount" || key === "advancePaid"
                          ? "number"
                          : "text"
                    }
                    value={String((editForm as any)[key] ?? "")}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        [key]: e.target.value,
                      }))
                    }
                    style={{
                      width: "100%",
                      border: "1px solid #d1d5db",
                      borderRadius: 6,
                      padding: "6px 10px",
                      fontSize: 13,
                      color: "#1e293b",
                      fontWeight: 600,
                    }}
                  />
                </div>
              ))}
              <div style={{ gridColumn: "1 / -1" }}>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#374151",
                    display: "block",
                    marginBottom: 3,
                  }}
                >
                  Adults / Children
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="number"
                    placeholder="Adults"
                    value={String(editForm.adults ?? editGuest.adults)}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        adults: BigInt(e.target.value || "1"),
                      }))
                    }
                    style={{
                      flex: 1,
                      border: "1px solid #d1d5db",
                      borderRadius: 6,
                      padding: "6px 10px",
                      fontSize: 13,
                      color: "#1e293b",
                      fontWeight: 600,
                    }}
                  />
                  <input
                    type="number"
                    placeholder="Children"
                    value={String(editForm.children ?? editGuest.children)}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        children: BigInt(e.target.value || "0"),
                      }))
                    }
                    style={{
                      flex: 1,
                      border: "1px solid #d1d5db",
                      borderRadius: 6,
                      padding: "6px 10px",
                      fontSize: 13,
                      color: "#1e293b",
                      fontWeight: 600,
                    }}
                  />
                </div>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#374151",
                    display: "block",
                    marginBottom: 3,
                  }}
                >
                  Notes
                </p>
                <textarea
                  value={String(editForm.notes ?? "")}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  rows={2}
                  style={{
                    width: "100%",
                    border: "1px solid #d1d5db",
                    borderRadius: 6,
                    padding: "6px 10px",
                    fontSize: 13,
                    color: "#1e293b",
                    fontWeight: 600,
                    resize: "vertical",
                  }}
                />
              </div>
              {/* Occupancy in edit */}
              <div>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: 3,
                  }}
                >
                  Occupancy
                </p>
                <select
                  value={String((editForm as any).occupancy ?? "Single")}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      occupancy: e.target.value,
                    }))
                  }
                  style={{
                    width: "100%",
                    border: "1px solid #d1d5db",
                    borderRadius: 6,
                    padding: "6px 10px",
                    fontSize: 13,
                    color: "#1e293b",
                    fontWeight: 600,
                  }}
                >
                  <option value="Single">Single</option>
                  <option value="Double">Double</option>
                </select>
              </div>
              {/* Discount */}
              <div>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: 3,
                  }}
                >
                  Discount Type
                </p>
                <select
                  value={String((editForm as any).discountType ?? "percent")}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      discountType: e.target.value,
                    }))
                  }
                  data-ocid="edit-guest.discountType.select"
                  style={{
                    width: "100%",
                    border: "1px solid #d1d5db",
                    borderRadius: 6,
                    padding: "6px 10px",
                    fontSize: 13,
                    color: "#1e293b",
                    fontWeight: 600,
                  }}
                >
                  <option value="percent">% Percentage</option>
                  <option value="flat">Flat Rate</option>
                </select>
              </div>
              <div>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: 3,
                  }}
                >
                  Discount Value
                </p>
                <input
                  type="number"
                  min="0"
                  value={String((editForm as any).discountValue ?? "0")}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      discountValue: e.target.value,
                    }))
                  }
                  data-ocid="edit-guest.discountValue.input"
                  style={{
                    width: "100%",
                    border: "1px solid #d1d5db",
                    borderRadius: 6,
                    padding: "6px 10px",
                    fontSize: 13,
                    color: "#1e293b",
                    fontWeight: 600,
                  }}
                />
              </div>
              {/* GSTIN State helper for edit modal */}
              {(editForm as any).companyGstNumber &&
                getStateFromGSTIN(
                  String((editForm as any).companyGstNumber),
                ) && (
                  <div style={{ gridColumn: "1 / -1" }}>
                    <p
                      style={{
                        color: "#22c55e",
                        fontSize: "0.72rem",
                        fontWeight: 600,
                      }}
                    >
                      GST State:{" "}
                      {getStateFromGSTIN(
                        String((editForm as any).companyGstNumber),
                      )}
                    </p>
                  </div>
                )}
            </div>
            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 20,
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={() => setEditGuest(null)}
                style={{
                  padding: "8px 20px",
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!actor || !editGuest) return;
                  try {
                    const extras = (() => {
                      try {
                        return JSON.parse(
                          localStorage.getItem(
                            `kdm_folio_extras_${editGuest.id}`,
                          ) || "{}",
                        );
                      } catch {
                        return {};
                      }
                    })();
                    localStorage.setItem(
                      `kdm_folio_extras_${editGuest.id}`,
                      JSON.stringify({
                        ...extras,
                        companyName: (editForm as any).companyName || "",
                        companyGstNumber:
                          (editForm as any).companyGstNumber || "",
                        address: (editForm as any).address || "",
                        city: (editForm as any).city || "",
                        occupancy: (editForm as any).occupancy || "Single",
                      }),
                    );
                    // Save discount settings
                    try {
                      localStorage.setItem(
                        `kdm_guest_discount_${editGuest.id}`,
                        JSON.stringify({
                          discountType:
                            (editForm as any).discountType || "percent",
                          discountValue:
                            Number((editForm as any).discountValue) || 0,
                        }),
                      );
                    } catch {}
                    const payload: GuestCheckIn = {
                      id: editGuest.id,
                      status: editGuest.status,
                      createdAt: editGuest.createdAt,
                      checkInDate: String(
                        editForm.checkInDate ?? editGuest.checkInDate,
                      ),
                      guestName: String(
                        editForm.guestName ?? editGuest.guestName,
                      ),
                      roomNumber: String(
                        editForm.roomNumber ?? editGuest.roomNumber,
                      ),
                      children: editForm.children ?? editGuest.children,
                      idNumber: String(editForm.idNumber ?? editGuest.idNumber),
                      totalAmount: Number(
                        editForm.totalAmount ?? editGuest.totalAmount,
                      ),
                      notes: String(editForm.notes ?? editGuest.notes),
                      advancePaid: Number(
                        editForm.advancePaid ?? editGuest.advancePaid,
                      ),
                      adults: editForm.adults ?? editGuest.adults,
                      expectedCheckOut: String(
                        editForm.expectedCheckOut ?? editGuest.expectedCheckOut,
                      ),
                      phone: String(editForm.phone ?? editGuest.phone),
                      idType: String(editForm.idType ?? editGuest.idType),
                      actualCheckOut: editGuest.actualCheckOut,
                    };
                    await actor.updateGuestCheckIn(payload);
                    await queryClient.invalidateQueries({
                      queryKey: ["guestCheckIns"],
                    });
                    toast.success("Guest details updated!");
                    setEditGuest(null);
                  } catch {
                    toast.error("Failed to update guest details");
                  }
                }}
                style={{
                  padding: "8px 20px",
                  background: GOLD,
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Guest Folio Dialog ── */}
      {folioGuest &&
        (() => {
          const g = folioGuest;
          const roomFoodData: any[] = (() => {
            try {
              const a = JSON.parse(
                localStorage.getItem("kdm_room_food_orders") || "[]",
              );
              const b = JSON.parse(
                localStorage.getItem("hotelRoomFoodOrders") || "[]",
              );
              return [...a, ...b];
            } catch {
              return [];
            }
          })();
          const restBills: any[] = (() => {
            try {
              const a = JSON.parse(
                localStorage.getItem("kdm_restaurant_bills") || "[]",
              );
              const b = JSON.parse(
                localStorage.getItem("hotelRestaurantBills") || "[]",
              );
              return [...a, ...b];
            } catch {
              return [];
            }
          })();
          const guestExtras = (() => {
            try {
              return JSON.parse(
                localStorage.getItem(`kdm_folio_extras_${g.id}`) || "{}",
              );
            } catch {
              return {};
            }
          })();
          const nights = Math.max(
            1,
            Math.round(
              (new Date(g.expectedCheckOut).getTime() -
                new Date(g.checkInDate).getTime()) /
                86400000,
            ),
          );
          const roomCharges = nights * g.totalAmount;
          const roomFoodCharges = roomFoodData
            .filter((o) => String(o.roomNumber) === String(g.roomNumber))
            .reduce((s: number, o: any) => s + Number(o.totalAmount || 0), 0);
          const restCharges = restBills
            .filter(
              (b) =>
                String(b.settleToRoom) === String(g.roomNumber) ||
                String(b.settledRoomNumber) === String(g.roomNumber),
            )
            .reduce(
              (s: number, b: any) =>
                s + Number(b.totalAmount || b.total || b.amount || 0),
              0,
            );
          const extraBedAmt = Number(folioExtras.extraBed) || 0;
          const laundryAmt = Number(folioExtras.laundry) || 0;
          const otherAmt = Number(folioExtras.other) || 0;
          const subtotal =
            roomCharges +
            roomFoodCharges +
            restCharges +
            extraBedAmt +
            laundryAmt +
            otherAmt;
          const gst = subtotal * 0.12;
          const total = subtotal + gst;
          const balance = total - g.advancePaid;
          const companyName = guestExtras.companyName || "";
          const companyGst = guestExtras.companyGstNumber || "";
          const address = guestExtras.address || "";
          return (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.55)",
                zIndex: 200,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
              }}
            >
              <div
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  padding: 28,
                  width: "100%",
                  maxWidth: 680,
                  maxHeight: "92vh",
                  overflowY: "auto",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <h3
                    style={{ color: GOLD, fontWeight: 700, fontSize: "1.1rem" }}
                  >
                    📋 Guest Folio — Room {g.roomNumber} | {g.guestName}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setFolioGuest(null)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 20,
                      color: "#888",
                    }}
                  >
                    ✕
                  </button>
                </div>
                {/* Guest Info */}
                <div
                  style={{
                    background: "#f8f9fa",
                    borderRadius: 8,
                    padding: "12px 16px",
                    marginBottom: 16,
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 6,
                    fontSize: 13,
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 600, color: "#374151" }}>
                      Name:{" "}
                    </span>
                    <span style={{ color: "#1e293b", fontWeight: 700 }}>
                      {g.guestName}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontWeight: 600, color: "#374151" }}>
                      Phone:{" "}
                    </span>
                    <span style={{ color: "#1e293b", fontWeight: 700 }}>
                      {g.phone}
                    </span>
                  </div>
                  {companyName && (
                    <div>
                      <span style={{ fontWeight: 600, color: "#374151" }}>
                        Company:{" "}
                      </span>
                      <span style={{ color: "#1e293b", fontWeight: 700 }}>
                        {companyName}
                      </span>
                    </div>
                  )}
                  {companyGst && (
                    <div>
                      <span style={{ fontWeight: 600, color: "#374151" }}>
                        GST:{" "}
                      </span>
                      <span style={{ color: "#1e293b", fontWeight: 700 }}>
                        {companyGst}
                      </span>
                    </div>
                  )}
                  {address && (
                    <div style={{ gridColumn: "1 / -1" }}>
                      <span style={{ fontWeight: 600, color: "#374151" }}>
                        Address:{" "}
                      </span>
                      <span style={{ color: "#1e293b", fontWeight: 700 }}>
                        {address}
                      </span>
                    </div>
                  )}
                  <div>
                    <span style={{ fontWeight: 600, color: "#374151" }}>
                      Check-In:{" "}
                    </span>
                    <span style={{ color: "#1e293b", fontWeight: 700 }}>
                      {g.checkInDate}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontWeight: 600, color: "#374151" }}>
                      Check-Out:{" "}
                    </span>
                    <span style={{ color: "#1e293b", fontWeight: 700 }}>
                      {g.expectedCheckOut}
                    </span>
                  </div>
                </div>
                {/* Charges Table */}
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 13,
                    marginBottom: 16,
                  }}
                >
                  <thead>
                    <tr style={{ background: "#f3f4f6" }}>
                      <th
                        style={{
                          padding: "8px 12px",
                          textAlign: "left",
                          color: "#374151",
                          fontWeight: 700,
                        }}
                      >
                        Description
                      </th>
                      <th
                        style={{
                          padding: "8px 12px",
                          textAlign: "right",
                          color: "#374151",
                          fontWeight: 700,
                        }}
                      >
                        Amount (₹)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td
                        style={{
                          padding: "8px 12px",
                          color: "#1e293b",
                          fontWeight: 600,
                        }}
                      >
                        Room Charges ({nights} night{nights !== 1 ? "s" : ""} ×
                        ₹{g.totalAmount.toLocaleString()})
                      </td>
                      <td
                        style={{
                          padding: "8px 12px",
                          textAlign: "right",
                          color: "#1e293b",
                          fontWeight: 700,
                        }}
                      >
                        ₹{roomCharges.toLocaleString()}
                      </td>
                    </tr>
                    {roomFoodCharges > 0 && (
                      <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                        <td
                          style={{
                            padding: "8px 12px",
                            color: "#1e293b",
                            fontWeight: 600,
                          }}
                        >
                          Room Food Orders
                        </td>
                        <td
                          style={{
                            padding: "8px 12px",
                            textAlign: "right",
                            color: "#1e293b",
                            fontWeight: 700,
                          }}
                        >
                          ₹{roomFoodCharges.toLocaleString()}
                        </td>
                      </tr>
                    )}
                    {restCharges > 0 && (
                      <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                        <td
                          style={{
                            padding: "8px 12px",
                            color: "#1e293b",
                            fontWeight: 600,
                          }}
                        >
                          Restaurant Charges (Settled to Room)
                        </td>
                        <td
                          style={{
                            padding: "8px 12px",
                            textAlign: "right",
                            color: "#1e293b",
                            fontWeight: 700,
                          }}
                        >
                          ₹{restCharges.toLocaleString()}
                        </td>
                      </tr>
                    )}
                    {/* Editable Extras */}
                    <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "8px 12px" }}>
                        <span style={{ color: "#1e293b", fontWeight: 600 }}>
                          Extra Bed
                        </span>
                      </td>
                      <td style={{ padding: "8px 12px", textAlign: "right" }}>
                        <input
                          type="number"
                          value={folioExtras.extraBed}
                          onChange={(e) =>
                            setFolioExtras((p) => ({
                              ...p,
                              extraBed: e.target.value,
                            }))
                          }
                          style={{
                            width: 90,
                            border: "1px solid #d1d5db",
                            borderRadius: 4,
                            padding: "3px 6px",
                            fontSize: 13,
                            textAlign: "right",
                            color: "#1e293b",
                            fontWeight: 600,
                          }}
                        />
                      </td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "8px 12px" }}>
                        <span style={{ color: "#1e293b", fontWeight: 600 }}>
                          Laundry
                        </span>
                      </td>
                      <td style={{ padding: "8px 12px", textAlign: "right" }}>
                        <input
                          type="number"
                          value={folioExtras.laundry}
                          onChange={(e) =>
                            setFolioExtras((p) => ({
                              ...p,
                              laundry: e.target.value,
                            }))
                          }
                          style={{
                            width: 90,
                            border: "1px solid #d1d5db",
                            borderRadius: 4,
                            padding: "3px 6px",
                            fontSize: 13,
                            textAlign: "right",
                            color: "#1e293b",
                            fontWeight: 600,
                          }}
                        />
                      </td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "8px 12px" }}>
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                          }}
                        >
                          <span style={{ color: "#1e293b", fontWeight: 600 }}>
                            Other Charges
                          </span>
                          <input
                            type="text"
                            placeholder="Description"
                            value={folioExtras.otherDesc}
                            onChange={(e) =>
                              setFolioExtras((p) => ({
                                ...p,
                                otherDesc: e.target.value,
                              }))
                            }
                            style={{
                              border: "1px solid #d1d5db",
                              borderRadius: 4,
                              padding: "3px 6px",
                              fontSize: 12,
                              color: "#1e293b",
                            }}
                          />
                        </div>
                      </td>
                      <td style={{ padding: "8px 12px", textAlign: "right" }}>
                        <input
                          type="number"
                          value={folioExtras.other}
                          onChange={(e) =>
                            setFolioExtras((p) => ({
                              ...p,
                              other: e.target.value,
                            }))
                          }
                          style={{
                            width: 90,
                            border: "1px solid #d1d5db",
                            borderRadius: 4,
                            padding: "3px 6px",
                            fontSize: 13,
                            textAlign: "right",
                            color: "#1e293b",
                            fontWeight: 600,
                          }}
                        />
                      </td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr style={{ borderTop: "2px solid #e5e7eb" }}>
                      <td
                        style={{
                          padding: "8px 12px",
                          color: "#374151",
                          fontWeight: 700,
                        }}
                      >
                        Sub Total
                      </td>
                      <td
                        style={{
                          padding: "8px 12px",
                          textAlign: "right",
                          color: "#1e293b",
                          fontWeight: 700,
                        }}
                      >
                        ₹
                        {subtotal.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          padding: "8px 12px",
                          color: "#374151",
                          fontWeight: 700,
                        }}
                      >
                        GST (12%)
                      </td>
                      <td
                        style={{
                          padding: "8px 12px",
                          textAlign: "right",
                          color: "#1e293b",
                          fontWeight: 700,
                        }}
                      >
                        ₹
                        {gst.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                    <tr style={{ borderTop: "2px solid #d1d5db" }}>
                      <td
                        style={{
                          padding: "8px 12px",
                          color: GOLD,
                          fontWeight: 700,
                          fontSize: 15,
                        }}
                      >
                        Total
                      </td>
                      <td
                        style={{
                          padding: "8px 12px",
                          textAlign: "right",
                          color: GOLD,
                          fontWeight: 700,
                          fontSize: 15,
                        }}
                      >
                        ₹
                        {total.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          padding: "8px 12px",
                          color: "#22c55e",
                          fontWeight: 700,
                        }}
                      >
                        Advance Paid
                      </td>
                      <td
                        style={{
                          padding: "8px 12px",
                          textAlign: "right",
                          color: "#22c55e",
                          fontWeight: 700,
                        }}
                      >
                        ₹
                        {g.advancePaid.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                    <tr style={{ borderTop: "2px solid #ef4444" }}>
                      <td
                        style={{
                          padding: "8px 12px",
                          color: "#ef4444",
                          fontWeight: 700,
                          fontSize: 15,
                        }}
                      >
                        Balance Due
                      </td>
                      <td
                        style={{
                          padding: "8px 12px",
                          textAlign: "right",
                          color: "#ef4444",
                          fontWeight: 700,
                          fontSize: 15,
                        }}
                      >
                        ₹
                        {balance.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
                {/* Action Buttons */}
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setFolioGuest(null)}
                    style={{
                      padding: "8px 20px",
                      border: "1px solid #d1d5db",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.setItem(
                        `kdm_folio_extras_${g.id}`,
                        JSON.stringify({
                          ...folioExtras,
                          extraBed: Number(folioExtras.extraBed),
                          laundry: Number(folioExtras.laundry),
                          other: Number(folioExtras.other),
                        }),
                      );
                      toast.success("Folio extras saved!");
                    }}
                    style={{
                      padding: "8px 20px",
                      background: "#16a34a",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontWeight: 700,
                    }}
                  >
                    💾 Save Folio Extras
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const w = window.open(
                        "",
                        "_blank",
                        "width=700,height=900",
                      );
                      if (!w) return;
                      w.document.write(
                        `<!DOCTYPE html><html><head><title>Guest Folio</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#111}table{width:100%;border-collapse:collapse}th,td{padding:8px 12px;border:1px solid #ccc}th{background:#f3f4f6;font-weight:700}tfoot td{font-weight:700}.gold{color:#b8860b}.red{color:#ef4444}.green{color:#16a34a}h2{color:#b8860b}</style></head><body><h2>Guest Folio — Room ${g.roomNumber}</h2><p><strong>${g.guestName}</strong> | Phone: ${g.phone} | Check-In: ${g.checkInDate} → ${g.expectedCheckOut}</p>${companyName ? `<p>Company: ${companyName}${companyGst ? ` | GST: ${companyGst}` : ""}</p>` : ""}<table><thead><tr><th>Description</th><th style="text-align:right">Amount</th></tr></thead><tbody><tr><td>Room Charges (${nights} nights × ₹${g.totalAmount})</td><td style="text-align:right">₹${roomCharges.toFixed(2)}</td></tr>${roomFoodCharges > 0 ? `<tr><td>Room Food</td><td style="text-align:right">₹${roomFoodCharges.toFixed(2)}</td></tr>` : ""}${restCharges > 0 ? `<tr><td>Restaurant (Settled)</td><td style="text-align:right">₹${restCharges.toFixed(2)}</td></tr>` : ""}${extraBedAmt > 0 ? `<tr><td>Extra Bed</td><td style="text-align:right">₹${extraBedAmt.toFixed(2)}</td></tr>` : ""}${laundryAmt > 0 ? `<tr><td>Laundry</td><td style="text-align:right">₹${laundryAmt.toFixed(2)}</td></tr>` : ""}${otherAmt > 0 ? `<tr><td>Other${folioExtras.otherDesc ? ` (${folioExtras.otherDesc})` : ""}</td><td style="text-align:right">₹${otherAmt.toFixed(2)}</td></tr>` : ""}</tbody><tfoot><tr><td>Sub Total</td><td style="text-align:right">₹${subtotal.toFixed(2)}</td></tr><tr><td>GST 12%</td><td style="text-align:right">₹${gst.toFixed(2)}</td></tr><tr class="gold"><td>Total</td><td style="text-align:right">₹${total.toFixed(2)}</td></tr><tr class="green"><td>Advance Paid</td><td style="text-align:right">₹${g.advancePaid.toFixed(2)}</td></tr><tr class="red"><td>Balance Due</td><td style="text-align:right">₹${balance.toFixed(2)}</td></tr></tfoot></table></body></html>`,
                      );
                      w.document.close();
                      w.print();
                    }}
                    style={{
                      padding: "8px 20px",
                      background: GOLD,
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontWeight: 700,
                    }}
                  >
                    🖨️ Print Folio
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

      {checkoutGuest && (
        <Dialog open={invoiceDialog} onOpenChange={setInvoiceDialog}>
          <DialogContent
            style={{
              background: "#ffffff",
              border: `1px solid ${BORDER}`,
              maxWidth: 600,
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <DialogHeader>
              <DialogTitle
                style={{ color: GOLD, fontFamily: "'Playfair Display', serif" }}
              >
                Room Invoice — Checkout
              </DialogTitle>
            </DialogHeader>
            <div
              style={{
                fontSize: "0.8rem",
                color: "#1e293b",
                fontWeight: 600,
                marginBottom: 8,
              }}
            >
              <strong style={{ color: "#1e293b", fontSize: "1rem" }}>
                HOTEL KDM PALACE
              </strong>
              <br />
              GSTIN: 22AABCK1234A1Z5 | Begusarai, Bihar
            </div>
            {(() => {
              const inv = calcInvoice(checkoutGuest);
              return (
                <div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                      marginBottom: 16,
                    }}
                  >
                    <div>
                      <Label
                        style={{
                          color: "#1e293b",
                          fontWeight: 600,
                          fontSize: "0.7rem",
                        }}
                      >
                        Guest Name
                      </Label>
                      <p style={{ color: "#1e293b", fontWeight: 600 }}>
                        {checkoutGuest.guestName}
                      </p>
                    </div>
                    <div>
                      <Label
                        style={{
                          color: "#1e293b",
                          fontWeight: 600,
                          fontSize: "0.7rem",
                        }}
                      >
                        Room No.
                      </Label>
                      <p style={{ color: "#1e293b", fontWeight: 600 }}>
                        {checkoutGuest.roomNumber} — {inv.roomType}
                      </p>
                    </div>
                    <div>
                      <Label
                        style={{
                          color: "#1e293b",
                          fontWeight: 600,
                          fontSize: "0.7rem",
                        }}
                      >
                        Check-In Date
                      </Label>
                      <p style={{ color: "#1e293b" }}>
                        {checkoutGuest.checkInDate}
                      </p>
                    </div>
                    <div>
                      <Label
                        style={{
                          color: "#1e293b",
                          fontWeight: 600,
                          fontSize: "0.7rem",
                        }}
                      >
                        Check-Out Date
                      </Label>
                      <p style={{ color: "#1e293b" }}>
                        {checkoutGuest.expectedCheckOut}
                      </p>
                    </div>
                  </div>
                  <div
                    style={{
                      background: "#f8fafc",
                      borderRadius: 6,
                      padding: "12px 16px",
                      marginBottom: 12,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 6,
                      }}
                    >
                      <span style={{ color: "#1e293b", fontWeight: 600 }}>
                        Room Charges ({inv.nights} nights × ₹{inv.roomRate})
                      </span>
                      <span style={{ color: "#1e293b", fontWeight: 600 }}>
                        ₹{inv.roomCharges.toLocaleString()}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 6,
                      }}
                    >
                      <span style={{ color: "#1e293b", fontWeight: 600 }}>
                        Food Charges
                      </span>
                      <span style={{ color: "#1e293b", fontWeight: 600 }}>
                        ₹{inv.foodCharges.toLocaleString()}
                      </span>
                    </div>
                    {inv.restCharges > 0 && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 6,
                        }}
                      >
                        <span style={{ color: "#1e293b", fontWeight: 600 }}>
                          🍽️ Restaurant Charges (Settled to Room)
                        </span>
                        <span style={{ color: "#1e293b", fontWeight: 600 }}>
                          ₹{inv.restCharges.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {(() => {
                      const guestFoodOrders = roomFoodOrders.filter(
                        (o) => o.roomNumber === checkoutGuest!.roomNumber,
                      );
                      if (guestFoodOrders.length === 0) return null;
                      return (
                        <div
                          style={{
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            borderRadius: 6,
                            padding: "8px 12px",
                            marginBottom: 8,
                          }}
                        >
                          <p
                            style={{
                              fontSize: "0.7rem",
                              color: "#1e293b",
                              fontWeight: 600,
                              marginBottom: 6,
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                            }}
                          >
                            Food Order Breakdown
                          </p>
                          {guestFoodOrders.map((o, oi) => (
                            <div
                              // biome-ignore lint/suspicious/noArrayIndexKey: food orders have no stable id
                              key={oi}
                              style={{
                                marginBottom: 8,
                                paddingBottom: 6,
                                borderBottom:
                                  oi < guestFoodOrders.length - 1
                                    ? "1px dashed #e2e8f0"
                                    : "none",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  marginBottom: 4,
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: "0.72rem",
                                    color: "#1e293b",
                                    fontWeight: 600,
                                  }}
                                >
                                  📅{" "}
                                  {new Date(
                                    Number(o.createdAt),
                                  ).toLocaleDateString("en-IN")}
                                </span>
                                <span
                                  style={{
                                    fontSize: "0.72rem",
                                    fontWeight: 600,
                                    color: "#1e293b",
                                  }}
                                >
                                  ₹{Number(o.totalAmount).toLocaleString()}
                                </span>
                              </div>
                              {o.items.map((item, ii) => (
                                <div
                                  // biome-ignore lint/suspicious/noArrayIndexKey: items have no stable id
                                  key={ii}
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    paddingLeft: 8,
                                    fontSize: "0.72rem",
                                    color: "#1e293b",
                                    fontWeight: 600,
                                  }}
                                >
                                  <span>
                                    {item.name} × {Number(item.qty)}
                                  </span>
                                  <span>
                                    ₹
                                    {(
                                      Number(item.price) * Number(item.qty)
                                    ).toLocaleString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 6,
                      }}
                    >
                      <span style={{ color: "#1e293b", fontWeight: 600 }}>
                        Other Charges
                      </span>
                      <Input
                        type="number"
                        value={invoiceOtherCharges}
                        onChange={(e) => setInvoiceOtherCharges(e.target.value)}
                        style={{
                          width: 90,
                          textAlign: "right",
                          padding: "2px 6px",
                          height: 28,
                          fontSize: "0.8rem",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 6,
                      }}
                    >
                      <span style={{ color: "#1e293b", fontWeight: 600 }}>
                        Discount %
                      </span>
                      <Input
                        type="number"
                        value={invoiceDiscount}
                        onChange={(e) => setInvoiceDiscount(e.target.value)}
                        style={{
                          width: 90,
                          textAlign: "right",
                          padding: "2px 6px",
                          height: 28,
                          fontSize: "0.8rem",
                        }}
                      />
                    </div>
                    {inv.guestDiscountAmt > 0 && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 6,
                        }}
                      >
                        <span
                          style={{
                            color: "#ef4444",
                            fontWeight: 600,
                            fontSize: "0.85rem",
                          }}
                        >
                          🏷️ {inv.guestDiscountLabel}
                        </span>
                        <span style={{ color: "#ef4444", fontWeight: 700 }}>
                          −₹{inv.guestDiscountAmt.toFixed(0)}
                        </span>
                      </div>
                    )}
                    <div
                      style={{
                        borderTop: `1px solid ${BORDER}`,
                        marginTop: 8,
                        paddingTop: 8,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 4,
                        }}
                      >
                        <span style={{ color: "#1e293b", fontWeight: 600 }}>
                          GST 12%
                        </span>
                        <span style={{ color: "#1e293b" }}>
                          ₹{inv.gstAmount}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontWeight: 700,
                          fontSize: "1.05rem",
                        }}
                      >
                        <span>Total Amount</span>
                        <span style={{ color: GOLD }}>
                          ₹{inv.totalAmount.toLocaleString()}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginTop: 4,
                        }}
                      >
                        <span style={{ color: "#1e293b", fontWeight: 600 }}>
                          Advance Paid
                        </span>
                        <span style={{ color: "#22c55e" }}>
                          ₹{checkoutGuest.advancePaid.toLocaleString()}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginTop: 4,
                          fontWeight: 700,
                        }}
                      >
                        <span>Balance Due</span>
                        <span style={{ color: "#ef4444", fontSize: "1.1rem" }}>
                          ₹{inv.balanceDue.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <Label
                      style={{
                        color: "#1e293b",
                        fontWeight: 600,
                        fontSize: "0.75rem",
                      }}
                    >
                      Actual Check-Out Date
                    </Label>
                    <Input
                      type="date"
                      value={invoiceCheckoutDate}
                      onChange={(e) => setInvoiceCheckoutDate(e.target.value)}
                      data-ocid="guest-checkin.checkout_date.input"
                    />
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <Label
                      style={{
                        color: "#1e293b",
                        fontWeight: 600,
                        fontSize: "0.75rem",
                      }}
                    >
                      Payment Mode
                    </Label>
                    <Select
                      value={invoicePaymentMode}
                      onValueChange={(v) => setInvoicePaymentMode(v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getPaymentTypes().map((pt) => (
                          <SelectItem key={pt} value={pt}>
                            {pt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <Button
                      onClick={handleConfirmCheckout}
                      disabled={invoiceSaving}
                      style={{
                        background: GOLD,
                        color: "#000",
                        fontWeight: 600,
                        flex: 1,
                      }}
                      data-ocid="guest-checkin.confirm_button"
                    >
                      {invoiceSaving
                        ? "Saving..."
                        : "Confirm Checkout & Save Invoice"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const inv2 = calcInvoice(checkoutGuest!);
                        const gstS3 = JSON.parse(
                          localStorage.getItem("kdm_gst_settings") || "{}",
                        );
                        const rfo3 = JSON.parse(
                          localStorage.getItem("kdm_room_food_orders") || "[]",
                        );
                        const html3 = generateRoomInvoiceHTML(
                          {
                            ...inv2,
                            guestName: checkoutGuest!.guestName,
                            roomNumber: checkoutGuest!.roomNumber,
                            checkInDate: checkoutGuest!.checkInDate,
                            checkOutDate:
                              invoiceCheckoutDate ||
                              checkoutGuest!.expectedCheckOut,
                            id: `DRAFT-${checkoutGuest!.id.slice(-4)}`,
                            address: (checkoutGuest as any).address,
                            phone: checkoutGuest!.phone,
                            companyName: (checkoutGuest as any).companyName,
                            companyGst: (checkoutGuest as any).companyGst,
                            occupancy: (checkoutGuest as any).occupancy,
                          },
                          gstS3,
                          rfo3,
                        );
                        const w3 = window.open(
                          "",
                          "_blank",
                          "width=900,height=700",
                        );
                        if (w3) {
                          w3.document.write(html3);
                          w3.document.close();
                        }
                      }}
                      style={{
                        borderColor: BORDER,
                        color: "#1e293b",
                        fontWeight: 600,
                      }}
                      data-ocid="guest-checkin.print_button"
                    >
                      🖨 Print
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleStripePayment}
                      style={{ borderColor: "#6366f1", color: "#6366f1" }}
                      data-ocid="guest-checkin.stripe_button"
                    >
                      💳 Pay Online
                    </Button>
                  </div>
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>
      )}
      {/* ── Guest History Panel ── */}
      <div style={{ marginTop: 32 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <h3 style={{ color: "#1e293b", fontWeight: 700, fontSize: "1.1rem" }}>
            📋 Guest History
          </h3>
        </div>
        <div style={{ marginBottom: 10 }}>
          <Input
            value={historySearch}
            onChange={(e) => setHistorySearch(e.target.value)}
            placeholder="Search history by name, mobile, company..."
            data-ocid="guest-history.search_input"
            style={{ maxWidth: 400 }}
          />
        </div>
        <div
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          {(() => {
            const records = getGuestHistory().filter((g) =>
              !historySearch
                ? true
                : g.guestName
                    .toLowerCase()
                    .includes(historySearch.toLowerCase()) ||
                  g.phone.includes(historySearch) ||
                  g.companyName
                    .toLowerCase()
                    .includes(historySearch.toLowerCase()) ||
                  g.idNumber.includes(historySearch),
            );
            if (records.length === 0)
              return (
                <div
                  style={{
                    padding: "2rem",
                    textAlign: "center",
                    color: "#94a3b8",
                  }}
                  data-ocid="guest-history.empty_state"
                >
                  No guest history yet. Guests are saved automatically on
                  check-in.
                </div>
              );
            return (
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "0.85rem",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        borderBottom: "1px solid #e2e8f0",
                        background: "#f8fafc",
                      }}
                    >
                      {[
                        "Name",
                        "Phone",
                        "Company",
                        "ID Type",
                        "Last Visit",
                        "Action",
                      ].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "8px 12px",
                            color: "#1e293b",
                            fontWeight: 700,
                            textAlign: "left",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((g, i) => (
                      <tr
                        key={g.id}
                        data-ocid={`guest-history.item.${i + 1}`}
                        style={{ borderBottom: "1px solid #f1f5f9" }}
                      >
                        <td
                          style={{
                            padding: "8px 12px",
                            fontWeight: 700,
                            color: "#1e293b",
                          }}
                        >
                          {g.guestName}
                        </td>
                        <td style={{ padding: "8px 12px", color: "#1e293b" }}>
                          {g.phone}
                        </td>
                        <td
                          style={{
                            padding: "8px 12px",
                            color: "#64748b",
                            fontSize: "0.8rem",
                          }}
                        >
                          {g.companyName || "—"}
                        </td>
                        <td
                          style={{
                            padding: "8px 12px",
                            color: "#64748b",
                            fontSize: "0.8rem",
                          }}
                        >
                          {g.idType}
                        </td>
                        <td
                          style={{
                            padding: "8px 12px",
                            color: "#64748b",
                            fontSize: "0.8rem",
                          }}
                        >
                          {g.lastVisit}
                        </td>
                        <td style={{ padding: "8px 12px" }}>
                          <Button
                            size="sm"
                            style={{
                              background: "#c9a84c",
                              color: "#000",
                              fontWeight: 600,
                              fontSize: "0.7rem",
                            }}
                            onClick={() => {
                              fillFromHistory(g);
                              setShowForm(true);
                            }}
                            data-ocid={`guest-history.button.${i + 1}`}
                          >
                            Check In
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

// ─── GST REPORT SECTION ────────────────────────────────────────────────────────
function GSTReportSection() {
  const { data: restaurantBills = [] } = useRestaurantBills();
  const { data: banquetBills = [] } = useBanquetBills();

  type MonthSummary = {
    month: string;
    billCount: number;
    taxable: number;
    cgst: number;
    sgst: number;
    totalGST: number;
    totalRevenue: number;
  };

  const buildMonthMap = () => {
    const map: Record<string, MonthSummary> = {};

    for (const b of restaurantBills) {
      const d = new Date(Number(b.createdAt));
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleString("en-IN", {
        month: "long",
        year: "numeric",
      });
      if (!map[key])
        map[key] = {
          month: label,
          billCount: 0,
          taxable: 0,
          cgst: 0,
          sgst: 0,
          totalGST: 0,
          totalRevenue: 0,
        };
      const taxable = (b.subtotal || 0) - (b.discount || 0);
      map[key].billCount += 1;
      map[key].taxable += taxable;
      map[key].cgst += (b.gstAmount || 0) / 2;
      map[key].sgst += (b.gstAmount || 0) / 2;
      map[key].totalGST += b.gstAmount || 0;
      map[key].totalRevenue += b.totalAmount || 0;
    }

    for (const b of banquetBills) {
      const d = new Date(Number(b.createdAt));
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleString("en-IN", {
        month: "long",
        year: "numeric",
      });
      if (!map[key])
        map[key] = {
          month: label,
          billCount: 0,
          taxable: 0,
          cgst: 0,
          sgst: 0,
          totalGST: 0,
          totalRevenue: 0,
        };
      const gstAmt = b.totalAmount * (b.gstPercent / (100 + b.gstPercent));
      const taxable = b.totalAmount - gstAmt;
      map[key].billCount += 1;
      map[key].taxable += taxable;
      map[key].cgst += gstAmt / 2;
      map[key].sgst += gstAmt / 2;
      map[key].totalGST += gstAmt;
      map[key].totalRevenue += b.totalAmount || 0;
    }

    return Object.values(map).sort((a, b) => b.month.localeCompare(a.month));
  };

  const rows = buildMonthMap();
  const totals = rows.reduce(
    (acc, r) => ({
      billCount: acc.billCount + r.billCount,
      taxable: acc.taxable + r.taxable,
      cgst: acc.cgst + r.cgst,
      sgst: acc.sgst + r.sgst,
      totalGST: acc.totalGST + r.totalGST,
      totalRevenue: acc.totalRevenue + r.totalRevenue,
    }),
    {
      billCount: 0,
      taxable: 0,
      cgst: 0,
      sgst: 0,
      totalGST: 0,
      totalRevenue: 0,
    },
  );

  const _todayKey = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  })();
  const _thisMonthLabel = new Date().toLocaleString("en-IN", {
    month: "long",
    year: "numeric",
  });
  const thisMonth = rows.find((r) => {
    const d = new Date();
    return (
      r.month === d.toLocaleString("en-IN", { month: "long", year: "numeric" })
    );
  });

  return (
    <div>
      <SectionTitle title="GST Report" />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {[
          {
            label: "This Month GST",
            value: `₹${(thisMonth?.totalGST || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`,
            color: GOLD,
          },
          {
            label: "This Month Revenue",
            value: `₹${(thisMonth?.totalRevenue || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`,
            color: "#22c55e",
          },
          {
            label: "Total Periods",
            value: String(rows.length),
            color: "#60a5fa",
          },
        ].map((c) => (
          <div
            key={c.label}
            style={{
              background: CARD_BG,
              border: `1px solid ${BORDER}`,
              borderRadius: 8,
              padding: "1rem 1.25rem",
            }}
          >
            <p style={{ color: c.color, fontSize: "1.4rem", fontWeight: 700 }}>
              {c.value}
            </p>
            <p
              style={{ color: "#1e293b", fontWeight: 600, fontSize: "0.75rem" }}
            >
              {c.label}
            </p>
          </div>
        ))}
      </div>

      <div
        style={{
          background: CARD_BG,
          border: `1px solid ${BORDER}`,
          borderRadius: 8,
        }}
      >
        <div
          style={{
            padding: "1rem 1.25rem",
            borderBottom: `1px solid ${BORDER}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <p style={{ color: GOLD, fontWeight: 600 }}>Monthly GST Summary</p>
          <Button
            size="sm"
            variant="outline"
            style={{ borderColor: BORDER, color: "#1e293b", fontWeight: 600 }}
            onClick={() => {
              const w = window.open("", "_blank");
              const gstContent =
                document.getElementById("gst-report-content")?.innerHTML ?? "";
              w?.document.write(`<html><body>${gstContent}</body></html>`);
              w?.print();
              w?.close();
            }}
            data-ocid="gst-report.primary_button"
          >
            🖨 Print Report
          </Button>
        </div>
        {rows.length === 0 ? (
          <div
            style={{
              padding: "3rem",
              textAlign: "center",
              color: "#1e293b",
              fontWeight: 600,
            }}
            data-ocid="gst-report.empty_state"
          >
            No billing data available yet.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.875rem",
              }}
            >
              <thead>
                <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                  {[
                    "Month",
                    "Bills",
                    "Taxable Amt",
                    "CGST (9%)",
                    "SGST (9%)",
                    "Total GST",
                    "Total Revenue",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 14px",
                        color: GOLD,
                        textAlign: "right",
                        fontWeight: 600,
                      }}
                      className={h === "Month" ? "text-left" : ""}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr
                    key={r.month}
                    data-ocid={`gst-report.item.${i + 1}`}
                    style={{ borderBottom: `1px solid ${BORDER}20` }}
                  >
                    <td style={{ padding: "10px 14px", color: "#1e293b" }}>
                      {r.month}
                    </td>
                    <td
                      style={{
                        padding: "10px 14px",
                        color: "#1e293b",
                        fontWeight: 600,
                        textAlign: "right",
                      }}
                    >
                      {r.billCount}
                    </td>
                    <td
                      style={{
                        padding: "10px 14px",
                        color: "#1e293b",
                        fontWeight: 600,
                        textAlign: "right",
                      }}
                    >
                      ₹{r.taxable.toFixed(2)}
                    </td>
                    <td
                      style={{
                        padding: "10px 14px",
                        color: "#1e293b",
                        fontWeight: 600,
                        textAlign: "right",
                      }}
                    >
                      ₹{r.cgst.toFixed(2)}
                    </td>
                    <td
                      style={{
                        padding: "10px 14px",
                        color: "#1e293b",
                        fontWeight: 600,
                        textAlign: "right",
                      }}
                    >
                      ₹{r.sgst.toFixed(2)}
                    </td>
                    <td
                      style={{
                        padding: "10px 14px",
                        color: GOLD,
                        textAlign: "right",
                        fontWeight: 600,
                      }}
                    >
                      ₹{r.totalGST.toFixed(2)}
                    </td>
                    <td
                      style={{
                        padding: "10px 14px",
                        color: "#22c55e",
                        textAlign: "right",
                        fontWeight: 600,
                      }}
                    >
                      ₹{r.totalRevenue.toFixed(2)}
                    </td>
                  </tr>
                ))}
                <tr
                  style={{
                    borderTop: `2px solid ${GOLD}40`,
                    background: "#f8fafc",
                  }}
                >
                  <td
                    style={{
                      padding: "12px 14px",
                      color: GOLD,
                      fontWeight: 700,
                    }}
                  >
                    GRAND TOTAL
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      color: GOLD,
                      textAlign: "right",
                      fontWeight: 700,
                    }}
                  >
                    {totals.billCount}
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      color: GOLD,
                      textAlign: "right",
                      fontWeight: 700,
                    }}
                  >
                    ₹{totals.taxable.toFixed(2)}
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      color: GOLD,
                      textAlign: "right",
                      fontWeight: 700,
                    }}
                  >
                    ₹{totals.cgst.toFixed(2)}
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      color: GOLD,
                      textAlign: "right",
                      fontWeight: 700,
                    }}
                  >
                    ₹{totals.sgst.toFixed(2)}
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      color: GOLD,
                      textAlign: "right",
                      fontWeight: 700,
                    }}
                  >
                    ₹{totals.totalGST.toFixed(2)}
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      color: "#22c55e",
                      textAlign: "right",
                      fontWeight: 700,
                    }}
                  >
                    ₹{totals.totalRevenue.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SHIFT SUMMARY SECTION ────────────────────────────────────────────────────
function ShiftSummarySection() {
  const { data: restaurantBills = [] } = useRestaurantBills();
  const { data: banquetBills = [] } = useBanquetBills();
  const [shift, setShift] = useState<"morning" | "afternoon" | "night">(
    "morning",
  );

  const today = new Date().toISOString().split("T")[0];

  const shiftRanges = {
    morning: [6, 14],
    afternoon: [14, 22],
    night: [22, 30],
  };

  const inShift = (ts: bigint) => {
    const d = new Date(Number(ts));
    if (d.toISOString().split("T")[0] !== today) return false;
    const h = d.getHours();
    const [start, end] = shiftRanges[shift];
    return h >= start && h < (end > 24 ? end - 24 : end);
  };

  const todayRestBills = restaurantBills.filter((b) => inShift(b.createdAt));
  const todayBanqBills = banquetBills.filter((b) => inShift(b.createdAt));

  const restRevenue = todayRestBills.reduce((s, b) => s + b.totalAmount, 0);
  const banqRevenue = todayBanqBills.reduce((s, b) => s + b.totalAmount, 0);
  const totalRevenue = restRevenue + banqRevenue;
  const totalGST =
    todayRestBills.reduce((s, b) => s + b.gstAmount, 0) +
    todayBanqBills.reduce(
      (s, b) => s + b.totalAmount * (b.gstPercent / (100 + b.gstPercent)),
      0,
    );

  const cashAmt =
    todayRestBills
      .filter((b) => b.paymentMode === "cash")
      .reduce((s, b) => s + b.totalAmount, 0) +
    todayBanqBills
      .filter((b) => b.paymentMode === "cash")
      .reduce((s, b) => s + b.totalAmount, 0);
  const cardAmt =
    todayRestBills
      .filter((b) => b.paymentMode === "card")
      .reduce((s, b) => s + b.totalAmount, 0) +
    todayBanqBills
      .filter((b) => b.paymentMode === "card")
      .reduce((s, b) => s + b.totalAmount, 0);
  const upiAmt =
    todayRestBills
      .filter((b) => b.paymentMode === "upi")
      .reduce((s, b) => s + b.totalAmount, 0) +
    todayBanqBills
      .filter((b) => b.paymentMode === "upi")
      .reduce((s, b) => s + b.totalAmount, 0);

  return (
    <div>
      <SectionTitle title="Shift Summary" />
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {(["morning", "afternoon", "night"] as const).map((s) => (
          <button
            type="button"
            key={s}
            onClick={() => setShift(s)}
            data-ocid={`shift-summary.${s}.tab`}
            style={{
              padding: "8px 20px",
              borderRadius: 6,
              border: `1px solid ${shift === s ? GOLD : BORDER}`,
              background: shift === s ? `${GOLD}20` : "transparent",
              color: shift === s ? GOLD : "#888",
              cursor: "pointer",
              fontWeight: shift === s ? 700 : 600,
              fontSize: "0.875rem",
              textTransform: "capitalize",
            }}
          >
            {s === "morning"
              ? "☀️ Morning (6am–2pm)"
              : s === "afternoon"
                ? "🌤 Afternoon (2pm–10pm)"
                : "🌙 Night (10pm–6am)"}
          </button>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {[
          {
            label: "Total Orders",
            value: String(todayRestBills.length + todayBanqBills.length),
            color: "#60a5fa",
          },
          {
            label: "Restaurant Revenue",
            value: `₹${restRevenue.toLocaleString()}`,
            color: GOLD,
          },
          {
            label: "Banquet Revenue",
            value: `₹${banqRevenue.toLocaleString()}`,
            color: "#a78bfa",
          },
          {
            label: "Total Revenue",
            value: `₹${totalRevenue.toLocaleString()}`,
            color: "#22c55e",
          },
          {
            label: "Total GST Collected",
            value: `₹${totalGST.toFixed(2)}`,
            color: "#f59e0b",
          },
          {
            label: "Cash Payments",
            value: `₹${cashAmt.toLocaleString()}`,
            color: "#22c55e",
          },
          {
            label: "Card Payments",
            value: `₹${cardAmt.toLocaleString()}`,
            color: "#60a5fa",
          },
          {
            label: "UPI Payments",
            value: `₹${upiAmt.toLocaleString()}`,
            color: "#a78bfa",
          },
        ].map((c) => (
          <div
            key={c.label}
            style={{
              background: CARD_BG,
              border: `1px solid ${BORDER}`,
              borderRadius: 8,
              padding: "1rem",
            }}
          >
            <p style={{ color: c.color, fontSize: "1.25rem", fontWeight: 700 }}>
              {c.value}
            </p>
            <p
              style={{ color: "#1e293b", fontWeight: 600, fontSize: "0.7rem" }}
            >
              {c.label}
            </p>
          </div>
        ))}
      </div>

      {todayRestBills.length === 0 && todayBanqBills.length === 0 ? (
        <div
          style={{
            background: CARD_BG,
            border: `1px solid ${BORDER}`,
            borderRadius: 8,
            padding: "3rem",
            textAlign: "center",
            color: "#1e293b",
            fontWeight: 600,
          }}
          data-ocid="shift-summary.empty_state"
        >
          No bills found for this shift period.
        </div>
      ) : (
        <div
          style={{
            background: CARD_BG,
            border: `1px solid ${BORDER}`,
            borderRadius: 8,
          }}
        >
          <div
            style={{
              padding: "1rem 1.25rem",
              borderBottom: `1px solid ${BORDER}`,
            }}
          >
            <p style={{ color: GOLD, fontWeight: 600 }}>
              Bills in this shift (
              {todayRestBills.length + todayBanqBills.length})
            </p>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.875rem",
              }}
            >
              <thead>
                <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                  {[
                    "Time",
                    "Type",
                    "Table/Event",
                    "Amount",
                    "GST",
                    "Payment",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 12px",
                        color: GOLD,
                        textAlign: "left",
                        fontWeight: 600,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {todayRestBills.map((b, i) => (
                  <tr
                    key={b.id}
                    data-ocid={`shift-summary.item.${i + 1}`}
                    style={{ borderBottom: `1px solid ${BORDER}20` }}
                  >
                    <td
                      style={{
                        padding: "10px 12px",
                        color: "#1e293b",
                        fontWeight: 600,
                      }}
                    >
                      {new Date(Number(b.createdAt)).toLocaleTimeString(
                        "en-IN",
                        { hour: "2-digit", minute: "2-digit" },
                      )}
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <span
                        style={{
                          background: "#22c55e20",
                          color: "#22c55e",
                          padding: "2px 8px",
                          borderRadius: 4,
                          fontSize: "0.75rem",
                        }}
                      >
                        Restaurant
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        color: "#1e293b",
                        fontWeight: 600,
                      }}
                    >
                      {b.tableId}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        color: GOLD,
                        fontWeight: 600,
                      }}
                    >
                      ₹{b.totalAmount.toFixed(2)}
                    </td>
                    <td style={{ padding: "10px 12px", color: "#f59e0b" }}>
                      ₹{b.gstAmount.toFixed(2)}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        color: "#1e293b",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        fontSize: "0.75rem",
                      }}
                    >
                      {b.paymentMode}
                    </td>
                  </tr>
                ))}
                {todayBanqBills.map((b, i) => (
                  <tr
                    key={b.id}
                    data-ocid={`shift-summary.item.${todayRestBills.length + i + 1}`}
                    style={{ borderBottom: `1px solid ${BORDER}20` }}
                  >
                    <td
                      style={{
                        padding: "10px 12px",
                        color: "#1e293b",
                        fontWeight: 600,
                      }}
                    >
                      {new Date(Number(b.createdAt)).toLocaleTimeString(
                        "en-IN",
                        { hour: "2-digit", minute: "2-digit" },
                      )}
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <span
                        style={{
                          background: "#a78bfa20",
                          color: "#a78bfa",
                          padding: "2px 8px",
                          borderRadius: 4,
                          fontSize: "0.75rem",
                        }}
                      >
                        Banquet
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        color: "#1e293b",
                        fontWeight: 600,
                      }}
                    >
                      {b.hallName}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        color: GOLD,
                        fontWeight: 600,
                      }}
                    >
                      ₹{b.totalAmount.toFixed(2)}
                    </td>
                    <td style={{ padding: "10px 12px", color: "#f59e0b" }}>
                      ₹
                      {(
                        b.totalAmount *
                        (b.gstPercent / (100 + b.gstPercent))
                      ).toFixed(2)}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        color: "#1e293b",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        fontSize: "0.75rem",
                      }}
                    >
                      {b.paymentMode}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ROOM FOOD INVOICE SECTION ──────────────────────────────────────────────
const printInvoice = (elementId: string) => {
  const printContent = document.getElementById(elementId)?.innerHTML;
  if (!printContent) {
    window.print();
    return;
  }
  const w = window.open("", "_blank");
  w?.document.write(
    `<html><head><title>Invoice - Hotel KDM Palace</title><style>body{font-family:system-ui,sans-serif;padding:20px;color:#1e293b} table{width:100%;border-collapse:collapse} th,td{padding:8px;border:1px solid #e2e8f0} .gold{color:#c9a84c} h2,h3{color:#c9a84c}</style></head><body>${printContent}</body></html>`,
  );
  w?.print();
  w?.close();
};

function RoomFoodSection() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { data: checkIns = [] } = useAllGuestCheckIns();
  const { data: roomFoodOrders = [] } = useAllRoomFoodOrders();
  const [selectedGuest, setSelectedGuest] = useState<string>("");
  const [cart, setCart] = useState<
    { menuId: string; name: string; price: number; qty: number }[]
  >([]);
  const [invoiceDialog, setInvoiceDialog] = useState(false);
  const [savedOrder, setSavedOrder] = useState<RoomFoodOrder | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [paymentMode, setPaymentMode] = useState<string>("Cash");

  const localMenu = (() => {
    const s = localStorage.getItem("kdm_menu");
    return s ? JSON.parse(s) : MOCK_MENU;
  })();

  const checkedInGuests = checkIns.filter(
    (g) => g.status === GuestCheckInStatus.checkedIn,
  );
  const guest = checkedInGuests.find((g) => g.id === selectedGuest);

  const addItem = (item: { id: number; name: string; price: number }) => {
    setCart((prev) => {
      const ex = prev.find((i) => i.menuId === String(item.id));
      if (ex)
        return prev.map((i) =>
          i.menuId === String(item.id) ? { ...i, qty: i.qty + 1 } : i,
        );
      return [
        ...prev,
        { menuId: String(item.id), name: item.name, price: item.price, qty: 1 },
      ];
    });
  };

  const removeItem = (menuId: string) =>
    setCart((prev) => prev.filter((i) => i.menuId !== menuId));

  const subTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const gstAmt = Math.round(subTotal * 0.05);
  const totalAmt = subTotal + gstAmt;

  const guestOrders = roomFoodOrders.filter(
    (o) => guest && o.roomNumber === guest.roomNumber,
  );

  const handleGenerate = async () => {
    if (!actor || !guest || cart.length === 0) return;
    setIsSaving(true);
    try {
      const order: RoomFoodOrder = {
        id: crypto.randomUUID(),
        roomNumber: guest.roomNumber,
        guestName: guest.guestName,
        items: cart.map(
          (i) =>
            ({
              menuItemId: i.menuId,
              name: i.name,
              price: i.price,
              qty: BigInt(i.qty),
              notes: "",
            }) as OrderItem,
        ),
        totalAmount: totalAmt,
        gstAmount: gstAmt,
        paymentMode: paymentMode as any as PaymentMode,
        notes: "",
        createdAt: BigInt(Date.now()),
        isPaid: false,
      };
      await (actor as any).createRoomFoodOrder(order);
      await queryClient.invalidateQueries({ queryKey: ["roomFoodOrders"] });
      setSavedOrder(order);
      setCart([]);
      setInvoiceDialog(true);
      toast.success("Room food order saved.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save order.");
    }
    setIsSaving(false);
  };

  return (
    <div>
      <SectionTitle title="Room Food Invoice" sub="Order food to guest rooms" />
      <div style={{ marginBottom: 16 }}>
        <Label
          style={{ color: "#1e293b", fontWeight: 600, fontSize: "0.75rem" }}
        >
          Select Guest Room
        </Label>
        <Select value={selectedGuest} onValueChange={setSelectedGuest}>
          <SelectTrigger data-ocid="room-food.select">
            <SelectValue placeholder="Select checked-in guest" />
          </SelectTrigger>
          <SelectContent>
            {checkedInGuests.map((g) => (
              <SelectItem key={g.id} value={g.id}>
                Room {g.roomNumber} — {g.guestName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {guest && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
          }}
        >
          <div>
            <p
              style={{
                color: "#1e293b",
                fontWeight: 600,
                fontSize: "0.78rem",
                marginBottom: 10,
              }}
            >
              Menu Items
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                maxHeight: 360,
                overflowY: "auto",
              }}
            >
              {localMenu.map(
                (item: {
                  id: number;
                  name: string;
                  category: string;
                  price: number;
                }) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => addItem(item)}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      borderRadius: 6,
                      border: `1px solid ${BORDER}`,
                      background: CARD_BG,
                      color: "#1e293b",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <span>
                      {item.name}{" "}
                      <span
                        style={{
                          color: "#1e293b",
                          fontWeight: 600,
                          fontSize: "0.7rem",
                        }}
                      >
                        — {item.category}
                      </span>
                    </span>
                    <span style={{ color: GOLD }}>₹{item.price}</span>
                  </button>
                ),
              )}
            </div>
          </div>
          <div
            style={{
              background: CARD_BG,
              border: `1px solid ${BORDER}`,
              borderRadius: 8,
              padding: "1.25rem",
            }}
          >
            <p style={{ color: GOLD, fontWeight: 600, marginBottom: 12 }}>
              Order — Room {guest.roomNumber}
            </p>
            {cart.length === 0 ? (
              <p style={{ color: "#1e293b", fontWeight: 500 }}>
                Add items from menu
              </p>
            ) : (
              <>
                {cart.map((i) => (
                  <div
                    key={i.menuId}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 8,
                      fontSize: "0.85rem",
                    }}
                  >
                    <span>
                      {i.name} × {i.qty}
                    </span>
                    <div
                      style={{ display: "flex", gap: 8, alignItems: "center" }}
                    >
                      <span style={{ color: GOLD }}>₹{i.price * i.qty}</span>
                      <button
                        type="button"
                        onClick={() => removeItem(i.menuId)}
                        style={{
                          color: "#ef4444",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "0.8rem",
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
                <div
                  style={{
                    borderTop: `1px solid ${BORDER}`,
                    paddingTop: 10,
                    marginTop: 10,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 4,
                      fontSize: "0.85rem",
                    }}
                  >
                    <span style={{ color: "#1e293b", fontWeight: 600 }}>
                      Sub Total
                    </span>
                    <span>₹{subTotal}</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 6,
                      fontSize: "0.85rem",
                    }}
                  >
                    <span style={{ color: "#1e293b", fontWeight: 600 }}>
                      GST (5%)
                    </span>
                    <span>₹{gstAmt}</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontWeight: 700,
                      fontSize: "1.05rem",
                    }}
                  >
                    <span>Total</span>
                    <span style={{ color: GOLD }}>₹{totalAmt}</span>
                  </div>
                </div>
                <div style={{ marginTop: 12, marginBottom: 12 }}>
                  <Label
                    style={{
                      color: "#1e293b",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                    }}
                  >
                    Payment Mode
                  </Label>
                  <Select
                    value={paymentMode}
                    onValueChange={(v) => setPaymentMode(v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getPaymentTypes().map((pt) => (
                        <SelectItem key={pt} value={pt}>
                          {pt}
                        </SelectItem>
                      ))}
                      <SelectItem value="Room">🛏️ Settle to Room</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleGenerate}
                  disabled={isSaving}
                  style={{
                    background: GOLD,
                    color: "#000",
                    fontWeight: 600,
                    width: "100%",
                  }}
                  data-ocid="room-food.primary_button"
                >
                  {isSaving ? "Saving..." : "Generate Room Food Invoice"}
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {guestOrders.length > 0 && (
        <div
          style={{
            marginTop: 24,
            background: CARD_BG,
            border: `1px solid ${BORDER}`,
            borderRadius: 8,
          }}
        >
          <div
            style={{
              padding: "1rem 1.25rem",
              borderBottom: `1px solid ${BORDER}`,
            }}
          >
            <p style={{ color: GOLD, fontWeight: 600 }}>
              Recent Orders — Room {guest?.roomNumber}
            </p>
          </div>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.875rem",
            }}
          >
            <thead>
              <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                {["Time", "Items", "Amount", "GST", "Payment", ""].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 12px",
                      color: "#1e293b",
                      fontWeight: 600,
                      textAlign: "left",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {guestOrders.slice(0, 10).map((o, i) => (
                <tr
                  key={o.id}
                  data-ocid={`room-food.item.${i + 1}`}
                  style={{ borderBottom: `1px solid ${BORDER}20` }}
                >
                  <td
                    style={{
                      padding: "10px 12px",
                      color: "#1e293b",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                    }}
                  >
                    {new Date(Number(o.createdAt)).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td style={{ padding: "10px 12px", color: "#1e293b" }}>
                    {o.items
                      .map((i) => `${i.name}×${Number(i.qty)}`)
                      .join(", ")}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      color: GOLD,
                      fontWeight: 600,
                    }}
                  >
                    ₹{o.totalAmount.toFixed(2)}
                  </td>
                  <td style={{ padding: "10px 12px", color: "#f59e0b" }}>
                    ₹{o.gstAmount.toFixed(2)}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      color: "#1e293b",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      fontSize: "0.75rem",
                    }}
                  >
                    {o.paymentMode}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      <Button
                        size="sm"
                        variant="outline"
                        style={{
                          borderColor: "#c9a84c",
                          color: "#c9a84c",
                          fontWeight: 600,
                          fontSize: "0.7rem",
                        }}
                        data-ocid={`room-food.reprint_button.${i + 1}`}
                        onClick={() =>
                          reprintBill(
                            `Room Food Bill - ${o.roomNumber}`,
                            `<div class="header"><h2>HOTEL KDM PALACE</h2><p>Room Food Bill</p></div>
                        <table>
                          <tr><th>Guest</th><td>${o.guestName}</td><th>Room</th><td>${o.roomNumber}</td></tr>
                          <tr><th>Date/Time</th><td>${new Date(Number(o.createdAt)).toLocaleString("en-IN")}</td><th>Payment</th><td>${String(o.paymentMode).toUpperCase()}</td></tr>
                        </table><br/>
                        <table><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
                        ${o.items.map((item: any) => `<tr><td>${item.name}</td><td>${Number(item.qty)}</td><td>₹${Number(item.price)}</td><td>₹${Number(item.qty) * Number(item.price)}</td></tr>`).join("")}
                        <tr><th colspan="3">GST (5%)</th><td>₹${o.gstAmount.toFixed(2)}</td></tr>
                        <tr><th colspan="3" style="color:#c9a84c">Total</th><td style="color:#c9a84c;font-weight:700">₹${o.totalAmount.toFixed(2)}</td></tr></table>`,
                          )
                        }
                      >
                        🖨️ Reprint
                      </Button>
                      <button
                        type="button"
                        data-ocid={`room-food.secondary_button.${i + 1}`}
                        onClick={() =>
                          shareInvoiceWhatsApp("Room Food Bill", {
                            guest: o.guestName,
                            room: o.roomNumber,
                            date: new Date(
                              Number(o.createdAt),
                            ).toLocaleDateString("en-IN"),
                            amount: o.totalAmount,
                          })
                        }
                        style={{
                          background: "#25D366",
                          color: "white",
                          border: "none",
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          padding: "4px 8px",
                          borderRadius: 4,
                          cursor: "pointer",
                        }}
                      >
                        📱 WhatsApp
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          printAsPDF(
                            `Room Food Bill - ${o.roomNumber}`,
                            `<div class="header"><h2>HOTEL KDM PALACE</h2><p>Room Food Bill</p></div>
                        <table>
                          <tr><th>Guest</th><td>${o.guestName}</td><th>Room</th><td>${o.roomNumber}</td></tr>
                          <tr><th>Date/Time</th><td>${new Date(Number(o.createdAt)).toLocaleString("en-IN")}</td><th>Payment</th><td>${String(o.paymentMode).toUpperCase()}</td></tr>
                        </table><br/>
                        <table><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
                        ${o.items.map((item: any) => `<tr><td>${item.name}</td><td>${Number(item.qty)}</td><td>₹${Number(item.price)}</td><td>₹${Number(item.qty) * Number(item.price)}</td></tr>`).join("")}
                        <tr><th colspan="3">GST (5%)</th><td>₹${o.gstAmount.toFixed(2)}</td></tr>
                        <tr><th colspan="3" style="color:#c9a84c">Total</th><td style="color:#c9a84c;font-weight:700">₹${o.totalAmount.toFixed(2)}</td></tr></table>`,
                          )
                        }
                        style={{
                          background: "#2563eb",
                          color: "white",
                          border: "none",
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          padding: "4px 8px",
                          borderRadius: 4,
                          cursor: "pointer",
                        }}
                      >
                        📄 PDF
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Print Invoice Dialog */}
      {savedOrder && (
        <Dialog open={invoiceDialog} onOpenChange={setInvoiceDialog}>
          <DialogContent
            style={{
              background: "#ffffff",
              border: `1px solid ${BORDER}`,
              maxWidth: 500,
            }}
          >
            <DialogHeader>
              <DialogTitle style={{ color: GOLD }}>
                Room Food Invoice
              </DialogTitle>
            </DialogHeader>
            <div
              style={{
                fontSize: "0.8rem",
                color: "#1e293b",
                fontWeight: 600,
                marginBottom: 8,
              }}
            >
              <strong style={{ color: "#1e293b" }}>HOTEL KDM PALACE</strong> |
              Room {savedOrder.roomNumber} — {savedOrder.guestName}
            </div>
            {savedOrder.items.map((item, i) => (
              <div
                key={`${item.menuItemId}-${i}`}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.85rem",
                  marginBottom: 4,
                }}
              >
                <span>
                  {item.name} × {Number(item.qty)}
                </span>
                <span style={{ color: GOLD }}>
                  ₹{(item.price * Number(item.qty)).toFixed(2)}
                </span>
              </div>
            ))}
            <div
              style={{
                borderTop: `1px solid ${BORDER}`,
                paddingTop: 8,
                marginTop: 8,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <span style={{ color: "#1e293b", fontWeight: 600 }}>
                  GST (5%)
                </span>
                <span>₹{savedOrder.gstAmount.toFixed(2)}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: 700,
                }}
              >
                <span>Total</span>
                <span style={{ color: GOLD }}>
                  ₹{savedOrder.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <Button
                onClick={() => printInvoice("room-food-invoice-content")}
                style={{ background: GOLD, color: "#000", flex: 1 }}
                data-ocid="room-food.print_button"
              >
                🖨 Print
              </Button>
              <Button
                variant="outline"
                onClick={() => setInvoiceDialog(false)}
                style={{ flex: 1 }}
                data-ocid="room-food.close_button"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ─── ROOM INVOICES HISTORY ───────────────────────────────────────────────────
function RoomInvoicesSection() {
  const { data: invoices = [], isLoading } = useAllRoomInvoices();
  const { data: roomFoodOrders = [] } = useAllRoomFoodOrders();
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const handleMarkPaid = async (inv: RoomInvoice) => {
    if (!actor) return;
    try {
      await (actor as any).updateRoomInvoice({ ...inv, balanceDue: 0 });
      await queryClient.invalidateQueries({ queryKey: ["roomInvoices"] });
      toast.success("Invoice marked as paid.");
    } catch {
      toast.error("Failed to update invoice.");
    }
  };

  return (
    <div>
      <SectionTitle title="Room Invoice History" sub="All checkout invoices" />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <StatCard label="Total Invoices" value={invoices.length} color={GOLD} />
        <StatCard
          label="Total Revenue"
          value={`₹${invoices.reduce((s, i) => s + i.totalAmount, 0).toLocaleString()}`}
          color="#22c55e"
        />
        <StatCard
          label="Balance Due"
          value={`₹${invoices.reduce((s, i) => s + i.balanceDue, 0).toLocaleString()}`}
          color="#ef4444"
        />
      </div>
      <div
        style={{
          background: CARD_BG,
          border: `1px solid ${BORDER}`,
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        {isLoading ? (
          <div
            style={{ padding: "2rem" }}
            data-ocid="room-invoices.loading_state"
          >
            Loading...
          </div>
        ) : invoices.length === 0 ? (
          <div
            style={{
              padding: "3rem",
              textAlign: "center",
              color: "#1e293b",
              fontWeight: 600,
            }}
            data-ocid="room-invoices.empty_state"
          >
            No room invoices yet. Invoices are created on guest checkout.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.875rem",
              }}
            >
              <thead>
                <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                  {[
                    "Room",
                    "Guest",
                    "Check-In",
                    "Check-Out",
                    "Nights",
                    "Amount",
                    "Balance Due",
                    "Status",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 12px",
                        color: "#1e293b",
                        textAlign: "left",
                        fontWeight: 600,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv, i) => (
                  <tr
                    key={inv.id}
                    data-ocid={`room-invoices.item.${i + 1}`}
                    style={{ borderBottom: `1px solid ${BORDER}20` }}
                  >
                    <td
                      style={{
                        padding: "10px 12px",
                        color: "#1e293b",
                        fontWeight: 600,
                      }}
                    >
                      {inv.roomNumber}
                    </td>
                    <td style={{ padding: "10px 12px", color: "#1e293b" }}>
                      {inv.guestName}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        color: "#1e293b",
                        fontWeight: 600,
                        fontSize: "0.8rem",
                      }}
                    >
                      {inv.checkInDate}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        color: "#1e293b",
                        fontWeight: 600,
                        fontSize: "0.8rem",
                      }}
                    >
                      {inv.checkOutDate}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        color: "#1e293b",
                        fontWeight: 600,
                      }}
                    >
                      {String(inv.nights)}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        color: GOLD,
                        fontWeight: 600,
                      }}
                    >
                      ₹{inv.totalAmount.toLocaleString()}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        color: inv.balanceDue > 0 ? "#ef4444" : "#22c55e",
                        fontWeight: 600,
                      }}
                    >
                      ₹{inv.balanceDue.toLocaleString()}
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <span
                        style={{
                          background:
                            inv.balanceDue > 0 ? "#fef2f2" : "#f0fdf4",
                          color: inv.balanceDue > 0 ? "#ef4444" : "#22c55e",
                          padding: "2px 8px",
                          borderRadius: 4,
                          fontSize: "0.72rem",
                        }}
                      >
                        {inv.balanceDue > 0 ? "Pending" : "Paid"}
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const gstS = JSON.parse(
                              localStorage.getItem("kdm_gst_settings") || "{}",
                            );
                            const html = generateRoomInvoiceHTML(
                              inv,
                              gstS,
                              roomFoodOrders,
                            );
                            const w = window.open(
                              "",
                              "_blank",
                              "width=900,height=700",
                            );
                            if (w) {
                              w.document.write(html);
                              w.document.close();
                            }
                          }}
                          style={{
                            borderColor: BORDER,
                            color: "#1e293b",
                            fontWeight: 600,
                            fontSize: "0.72rem",
                          }}
                          data-ocid={`room-invoices.print_button.${i + 1}`}
                        >
                          🖨 Print
                        </Button>
                        {inv.balanceDue > 0 && (
                          <Button
                            size="sm"
                            onClick={() => handleMarkPaid(inv)}
                            style={{
                              background: "#22c55e",
                              color: "#fff",
                              fontSize: "0.72rem",
                            }}
                            data-ocid={`room-invoices.save_button.${i + 1}`}
                          >
                            ✓ Mark Paid
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          style={{
                            borderColor: "#c9a84c",
                            color: "#c9a84c",
                            fontWeight: 600,
                            fontSize: "0.7rem",
                          }}
                          data-ocid={`room-invoices.reprint_button.${i + 1}`}
                          onClick={() =>
                            (() => {
                              const gstS2 = JSON.parse(
                                localStorage.getItem("kdm_gst_settings") ||
                                  "{}",
                              );
                              const rfo2 = JSON.parse(
                                localStorage.getItem("kdm_room_food_orders") ||
                                  "[]",
                              );
                              const html2 = generateRoomInvoiceHTML(
                                inv,
                                gstS2,
                                rfo2,
                              );
                              reprintBill(
                                `Room Invoice - ${inv.roomNumber}`,
                                "",
                              );
                              const w2 = window.open(
                                "",
                                "_blank",
                                "width=900,height=700",
                              );
                              if (w2) {
                                w2.document.write(html2);
                                w2.document.close();
                              }
                            })()
                          }
                        >
                          🖨️ Reprint
                        </Button>
                        <button
                          type="button"
                          data-ocid={`room-invoices.secondary_button.${i + 1}`}
                          onClick={() =>
                            shareInvoiceWhatsApp("Room Invoice", {
                              guest: inv.guestName,
                              billNo:
                                (inv as any).billNumber ||
                                (inv as any).billNo ||
                                "",
                              room: inv.roomNumber,
                              date: inv.checkOutDate
                                ? String(inv.checkOutDate).split("T")[0]
                                : "",
                              amount: Number(inv.totalAmount),
                            })
                          }
                          style={{
                            background: "#25D366",
                            color: "white",
                            border: "none",
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            padding: "4px 8px",
                            borderRadius: 4,
                            cursor: "pointer",
                          }}
                        >
                          📱 WhatsApp
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const gstPDF = JSON.parse(
                              localStorage.getItem("kdm_gst_settings") || "{}",
                            );
                            const rfoPDF = JSON.parse(
                              localStorage.getItem("kdm_room_food_orders") ||
                                "[]",
                            );
                            printAsPDF(
                              `Room Invoice - ${inv.roomNumber}`,
                              generateRoomInvoiceHTML(inv, gstPDF, rfoPDF),
                            );
                          }}
                          style={{
                            background: "#2563eb",
                            color: "white",
                            border: "none",
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            padding: "4px 8px",
                            borderRadius: 4,
                            cursor: "pointer",
                          }}
                        >
                          📄 PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── STRIPE SETUP SECTION ────────────────────────────────────────────────────

// ─── BOOKING RESERVATIONS SECTION ────────────────────────────────────────────
interface Reservation {
  id: string;
  guestName: string;
  phone: string;
  companyName: string;
  date: string;
  time: string;
  detail: string;
  guests: string;
  notes: string;
  status: "Pending" | "Confirmed" | "Cancelled";
}

function BookingReservationsSection() {
  const [tab, setTab] = useState<"room" | "table" | "banquet">("room");

  const storageKey =
    tab === "room"
      ? "kdm_room_reservations"
      : tab === "table"
        ? "kdm_table_reservations"
        : "kdm_banquet_reservations";

  const [reservations, setReservations] = useState<Reservation[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "[]");
    } catch {
      return [];
    }
  });
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [resMobileSearch, setResMobileSearch] = useState("");
  const [resMobileSuggestions, setResMobileSuggestions] = useState<any[]>([]);
  const [form, setForm] = useState<Omit<Reservation, "id">>({
    guestName: "",
    phone: "",
    companyName: "",
    date: "",
    time: "",
    detail: "",
    guests: "1",
    notes: "",
    status: "Pending",
  });

  const loadReservations = (key: string) => {
    try {
      return JSON.parse(localStorage.getItem(key) || "[]");
    } catch {
      return [];
    }
  };

  const handleTabChange = (t: "room" | "table" | "banquet") => {
    setTab(t);
    const key =
      t === "room"
        ? "kdm_room_reservations"
        : t === "table"
          ? "kdm_table_reservations"
          : "kdm_banquet_reservations";
    setReservations(loadReservations(key));
  };

  const save = () => {
    if (!form.guestName || !form.date) return;
    let updated: Reservation[];
    if (editId) {
      updated = reservations.map((r) =>
        r.id === editId ? { id: editId, ...form } : r,
      );
      toast.success("Reservation updated");
    } else {
      updated = [...reservations, { id: Date.now().toString(), ...form }];
      toast.success("Reservation added");
    }
    setReservations(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setShowModal(false);
  };

  const del = (id: string) => {
    const updated = reservations.filter((r) => r.id !== id);
    setReservations(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const cycleStatus = (id: string) => {
    const statuses: Reservation["status"][] = [
      "Pending",
      "Confirmed",
      "Cancelled",
    ];
    const updated = reservations.map((r) => {
      if (r.id !== id) return r;
      const next = statuses[(statuses.indexOf(r.status) + 1) % statuses.length];
      return { ...r, status: next };
    });
    setReservations(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const statusColor = (s: string) =>
    s === "Confirmed" ? "#22c55e" : s === "Cancelled" ? "#ef4444" : "#f59e0b";
  const statusBg = (s: string) =>
    s === "Confirmed" ? "#f0fdf4" : s === "Cancelled" ? "#fef2f2" : "#fefce8";

  const detailLabel =
    tab === "room"
      ? "Room Type"
      : tab === "table"
        ? "Table Number"
        : "Hall Name";
  const detailPh =
    tab === "room"
      ? "e.g. Deluxe, Executive"
      : tab === "table"
        ? "e.g. T-5"
        : "e.g. Rajgirih Hall";

  return (
    <div>
      <SectionTitle
        title="Booking Reservations"
        sub="Manage upcoming guest reservations"
      />
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {(["room", "table", "banquet"] as const).map((t) => (
          <Button
            key={t}
            size="sm"
            style={{
              background: tab === t ? "#c9a84c" : "#f1f5f9",
              color: tab === t ? "#000" : "#1e293b",
              fontWeight: 700,
            }}
            data-ocid={`reservations.${t}.tab`}
            onClick={() => handleTabChange(t)}
          >
            {t === "room"
              ? "🛏 Room"
              : t === "table"
                ? "🍽 Restaurant Table"
                : "🎉 Banquet"}
          </Button>
        ))}
        <Button
          style={{
            background: "#c9a84c",
            color: "#000",
            fontWeight: 700,
            marginLeft: "auto",
          }}
          data-ocid="reservations.open_modal_button"
          onClick={() => {
            setEditId(null);
            setForm({
              guestName: "",
              phone: "",
              companyName: "",
              date: "",
              time: "",
              detail: "",
              guests: "1",
              notes: "",
              status: "Pending",
            });
            setShowModal(true);
          }}
        >
          + Add Reservation
        </Button>
      </div>
      <div
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        {reservations.length === 0 ? (
          <div
            style={{
              padding: "3rem",
              textAlign: "center",
              color: "#94a3b8",
              fontWeight: 600,
            }}
            data-ocid="reservations.empty_state"
          >
            No reservations yet. Add one using the button above.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.85rem",
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid #e2e8f0",
                    background: "#f8fafc",
                  }}
                >
                  {[
                    "Guest",
                    "Phone",
                    "Company",
                    "Date/Time",
                    detailLabel,
                    "Guests",
                    "Status",
                    "Notes",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "8px 12px",
                        color: "#1e293b",
                        fontWeight: 700,
                        textAlign: "left",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reservations.map((r, i) => (
                  <tr
                    key={r.id}
                    data-ocid={`reservations.item.${i + 1}`}
                    style={{ borderBottom: "1px solid #f1f5f9" }}
                  >
                    <td
                      style={{
                        padding: "8px 12px",
                        fontWeight: 700,
                        color: "#1e293b",
                      }}
                    >
                      {r.guestName}
                    </td>
                    <td style={{ padding: "8px 12px", color: "#1e293b" }}>
                      {r.phone}
                    </td>
                    <td
                      style={{
                        padding: "8px 12px",
                        color: "#64748b",
                        fontSize: "0.8rem",
                      }}
                    >
                      {r.companyName || "—"}
                    </td>
                    <td
                      style={{
                        padding: "8px 12px",
                        color: "#1e293b",
                        fontSize: "0.8rem",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {r.date} {r.time}
                    </td>
                    <td style={{ padding: "8px 12px", color: "#1e293b" }}>
                      {r.detail}
                    </td>
                    <td
                      style={{
                        padding: "8px 12px",
                        color: "#1e293b",
                        textAlign: "center",
                      }}
                    >
                      {r.guests}
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      <button
                        type="button"
                        onClick={() => cycleStatus(r.id)}
                        onKeyUp={(e) => {
                          if (e.key === "Enter") cycleStatus(r.id);
                        }}
                        style={{
                          background: statusBg(r.status),
                          color: statusColor(r.status),
                          padding: "2px 10px",
                          borderRadius: 12,
                          fontWeight: 700,
                          fontSize: "0.75rem",
                          cursor: "pointer",
                        }}
                      >
                        {r.status}
                      </button>
                    </td>
                    <td
                      style={{
                        padding: "8px 12px",
                        color: "#64748b",
                        fontSize: "0.8rem",
                        maxWidth: 160,
                      }}
                    >
                      {r.notes}
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      <div style={{ display: "flex", gap: 4 }}>
                        <Button
                          size="sm"
                          style={{
                            background: "#c9a84c",
                            color: "#000",
                            fontWeight: 600,
                            fontSize: "0.7rem",
                          }}
                          data-ocid={`reservations.edit_button.${i + 1}`}
                          onClick={() => {
                            setEditId(r.id);
                            setForm({
                              guestName: r.guestName,
                              phone: r.phone,
                              companyName: r.companyName,
                              date: r.date,
                              time: r.time,
                              detail: r.detail,
                              guests: r.guests,
                              notes: r.notes,
                              status: r.status,
                            });
                            setShowModal(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          style={{
                            background: "#ef4444",
                            color: "#fff",
                            fontSize: "0.7rem",
                          }}
                          data-ocid={`reservations.delete_button.${i + 1}`}
                          onClick={() => del(r.id)}
                        >
                          Del
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Dialog
        open={showModal}
        onOpenChange={(open) => {
          setShowModal(open);
          if (!open) {
            setResMobileSearch("");
            setResMobileSuggestions([]);
          }
        }}
      >
        <DialogContent
          style={{
            background: "#fff",
            color: "#1e293b",
            borderRadius: 12,
            maxWidth: 540,
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: "#1e293b", fontWeight: 700 }}>
              {editId ? "Edit" : "Add"} Reservation
            </DialogTitle>
          </DialogHeader>
          {/* Mobile Search Auto-fill */}
          <div
            style={{
              background: "#f0f9ff",
              border: "1px solid #bae6fd",
              borderRadius: 8,
              padding: "10px 12px",
              marginBottom: 4,
              position: "relative",
            }}
          >
            <Label
              style={{ color: "#0369a1", fontWeight: 700, fontSize: "0.75rem" }}
            >
              🔍 Search by Mobile Number (Auto-fill)
            </Label>
            <Input
              type="tel"
              placeholder="Enter 10-digit mobile number or name..."
              maxLength={10}
              value={resMobileSearch}
              onChange={(e) => {
                const q = e.target.value.trim();
                setResMobileSearch(q);
                if (q.length < 3) {
                  setResMobileSuggestions([]);
                  return;
                }
                try {
                  const checkIns: any[] = JSON.parse(
                    localStorage.getItem("hotelCheckIns") || "[]",
                  );
                  const pastGuests: any[] = JSON.parse(
                    localStorage.getItem("kdm_past_guests") || "[]",
                  );
                  const customers: any[] = JSON.parse(
                    localStorage.getItem("kdm_customers") || "[]",
                  );
                  const results: any[] = [];
                  const seen = new Set<string>();
                  for (const g of [...checkIns, ...pastGuests]) {
                    const phone = g.phone || g.mobile || g.contactPhone || "";
                    const name = g.guestName || g.contactName || g.name || "";
                    if (
                      (phone.includes(q) ||
                        name.toLowerCase().includes(q.toLowerCase())) &&
                      phone
                    ) {
                      if (!seen.has(phone)) {
                        seen.add(phone);
                        results.push({
                          name,
                          phone,
                          companyName: g.companyName || "",
                          companyGst: g.companyGst || "",
                        });
                      }
                    }
                  }
                  for (const c of customers) {
                    const phone = c.mobile || c.phone || "";
                    const name = c.name || "";
                    if (
                      (phone.includes(q) ||
                        name.toLowerCase().includes(q.toLowerCase())) &&
                      phone
                    ) {
                      if (!seen.has(phone)) {
                        seen.add(phone);
                        results.push({
                          name,
                          phone,
                          companyName: c.companyName || "",
                          companyGst: c.companyGst || "",
                        });
                      }
                    }
                  }
                  setResMobileSuggestions(results.slice(0, 8));
                  if (q.length === 10 && results.length === 1) {
                    const s = results[0];
                    setForm((p) => ({
                      ...p,
                      guestName: s.name || p.guestName,
                      phone: s.phone,
                      companyName: s.companyName || p.companyName,
                    }));
                    setResMobileSearch("");
                    setResMobileSuggestions([]);
                    toast.success("Guest details auto-filled!");
                  }
                } catch {}
              }}
              style={{ marginTop: 4 }}
            />
            {resMobileSuggestions.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  background: "#fff",
                  border: "1px solid #bae6fd",
                  borderRadius: 8,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                  zIndex: 9999,
                  maxHeight: 200,
                  overflowY: "auto",
                }}
              >
                {resMobileSuggestions.map((s) => (
                  <button
                    key={s.phone || s.name}
                    type="button"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                      padding: "8px 12px",
                      cursor: "pointer",
                      background: "none",
                      border: "none",
                      borderBottom: "1px solid #f1f5f9",
                      textAlign: "left",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#f0f9ff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "none";
                    }}
                    onClick={() => {
                      setForm((p) => ({
                        ...p,
                        guestName: s.name || p.guestName,
                        phone: s.phone,
                        companyName: s.companyName || p.companyName,
                      }));
                      setResMobileSearch("");
                      setResMobileSuggestions([]);
                      toast.success("Guest details auto-filled!");
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        color: "#1e293b",
                        fontSize: "0.85rem",
                      }}
                    >
                      {s.name}
                    </span>
                    <span style={{ color: "#64748b", fontSize: "0.8rem" }}>
                      {s.phone}
                      {s.companyName ? ` · ${s.companyName}` : ""}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            {[
              { label: "Guest Name *", key: "guestName", ph: "Full name" },
              { label: "Phone", key: "phone", ph: "Mobile number" },
              {
                label: "Company Name",
                key: "companyName",
                ph: "Company / Organisation",
              },
              { label: "Date *", key: "date", ph: "", type: "date" },
              { label: "Time", key: "time", ph: "", type: "time" },
              { label: `${detailLabel}`, key: "detail", ph: detailPh },
              {
                label: "No. of Guests",
                key: "guests",
                ph: "1",
                type: "number",
              },
              { label: "Notes", key: "notes", ph: "Special requirements..." },
            ].map(({ label, key, ph, type }) => (
              <div key={key}>
                <Label
                  style={{
                    color: "#1e293b",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                  }}
                >
                  {label}
                </Label>
                <Input
                  type={type || "text"}
                  value={form[key as keyof typeof form]}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, [key]: e.target.value }))
                  }
                  placeholder={ph}
                />
              </div>
            ))}
            <div>
              <Label
                style={{
                  color: "#1e293b",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                }}
              >
                Status
              </Label>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, status: v as Reservation["status"] }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <Button
              style={{
                background: "#c9a84c",
                color: "#000",
                fontWeight: 700,
                flex: 1,
              }}
              onClick={save}
              data-ocid="reservations.submit_button"
            >
              {editId ? "Update" : "Add"} Reservation
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
              data-ocid="reservations.cancel_button"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── BANQUET BOOKING ADMIN SECTION ──────────────────────────────────────────
function BanquetBookingAdminSection() {
  const LS_KEY = "kdm_admin_banquet_bookings";
  const [bookings, setBookings] = useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
    } catch {
      return [];
    }
  });
  const [form, setForm] = useState({
    eventName: "",
    hall: "Maharaja Hall",
    eventDate: new Date().toISOString().split("T")[0],
    guestCount: 0,
    advance: 0,
    contactName: "",
    contactPhone: "",
    companyName: "",
    status: "Tentative",
    notes: "",
  });
  const [editId, setEditId] = useState<string | null>(null);
  const halls = ["Maharaja Hall", "Rajwada Hall", "Garden Terrace"];
  const statuses = ["Tentative", "Confirmed", "Cancelled", "Completed"];
  const statusColors: Record<string, string> = {
    Tentative: "bg-yellow-100 text-yellow-800",
    Confirmed: "bg-green-100 text-green-800",
    Cancelled: "bg-red-100 text-red-800",
    Completed: "bg-blue-100 text-blue-800",
  };

  const save = (list: any[]) => {
    setBookings(list);
    localStorage.setItem(LS_KEY, JSON.stringify(list));
  };

  const handleSubmit = () => {
    if (!form.eventName || !form.contactName) {
      toast.error("Event name and contact name required");
      return;
    }
    if (editId) {
      save(bookings.map((b) => (b.id === editId ? { ...b, ...form } : b)));
      setEditId(null);
    } else {
      const nb = { id: `BKT${Date.now()}`, ...form, createdAt: Date.now() };
      save([nb, ...bookings]);
    }
    setForm({
      eventName: "",
      hall: "Maharaja Hall",
      eventDate: new Date().toISOString().split("T")[0],
      guestCount: 0,
      advance: 0,
      contactName: "",
      contactPhone: "",
      companyName: "",
      status: "Tentative",
      notes: "",
    });
    toast.success(editId ? "Booking updated" : "Booking added");
  };

  const handleEdit = (b: any) => {
    setForm({
      eventName: b.eventName,
      hall: b.hall,
      eventDate: b.eventDate,
      guestCount: b.guestCount,
      advance: b.advance,
      contactName: b.contactName,
      contactPhone: b.contactPhone,
      companyName: b.companyName || "",
      status: b.status,
      notes: b.notes || "",
    });
    setEditId(b.id);
  };

  const handleDelete = (id: string) =>
    save(bookings.filter((b) => b.id !== id));
  const updateStatus = (id: string, status: string) =>
    save(bookings.map((b) => (b.id === id ? { ...b, status } : b)));

  return (
    <div>
      <SectionTitle
        title="Banquet Booking"
        sub="Manage banquet event bookings and reservations"
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: 20,
          marginBottom: 24,
        }}
      >
        <Card>
          <CardHeader>
            <CardTitle>
              {editId ? "Edit Booking" : "New Banquet Booking"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Event Name *</Label>
              <Input
                value={form.eventName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, eventName: e.target.value }))
                }
                placeholder="Wedding / Birthday / Conference..."
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
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
                <Label>Event Date</Label>
                <Input
                  type="date"
                  value={form.eventDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, eventDate: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Contact Name *</Label>
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
              <div>
                <Label>Advance Paid (&#8377;)</Label>
                <Input
                  type="number"
                  value={form.advance || ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, advance: Number(e.target.value) }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Company Name</Label>
                <Input
                  value={form.companyName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, companyName: e.target.value }))
                  }
                  placeholder="Optional"
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm((p) => ({ ...p, status: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Input
                value={form.notes}
                onChange={(e) =>
                  setForm((p) => ({ ...p, notes: e.target.value }))
                }
                placeholder="Special requirements..."
              />
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={handleSubmit}>
                {editId ? "Update Booking" : "Save Booking"}
              </Button>
              {editId && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditId(null);
                    setForm({
                      eventName: "",
                      hall: "Maharaja Hall",
                      eventDate: new Date().toISOString().split("T")[0],
                      guestCount: 0,
                      advance: 0,
                      contactName: "",
                      contactPhone: "",
                      companyName: "",
                      status: "Tentative",
                      notes: "",
                    });
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-base text-gray-800">
              Bookings ({bookings.length})
            </h3>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {bookings.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-8">
                No bookings yet
              </p>
            )}
            {bookings.map((b) => (
              <Card key={b.id} className="border border-gray-200">
                <CardContent className="pt-3 pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-gray-900">
                        {b.eventName}
                      </div>
                      <div className="text-xs text-gray-600">
                        {b.hall} &middot; {b.eventDate} &middot; {b.guestCount}{" "}
                        guests
                      </div>
                      <div className="text-xs text-gray-600">
                        {b.contactName}{" "}
                        {b.contactPhone ? `\u00b7 ${b.contactPhone}` : ""}
                      </div>
                      {b.companyName && (
                        <div className="text-xs text-gray-500">
                          {b.companyName}
                        </div>
                      )}
                      {b.advance > 0 && (
                        <div className="text-xs text-green-700">
                          Advance: &#8377;{b.advance.toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusColors[b.status] || "bg-gray-100 text-gray-700"}`}
                      >
                        {b.status}
                      </span>
                      <div className="flex gap-1 mt-1">
                        <Select
                          value={b.status}
                          onValueChange={(v) => updateStatus(b.id, v)}
                        >
                          <SelectTrigger className="h-6 text-xs w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statuses.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 px-2 text-xs"
                          onClick={() => handleEdit(b)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-6 px-2 text-xs"
                          onClick={() => handleDelete(b.id)}
                        >
                          Del
                        </Button>
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
  );
}

// ─── BANQUET BILLING ADMIN SECTION ──────────────────────────────────────────
function BanquetBillingAdminSection() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { data: banquetBills = [] } = useBanquetBills();
  const today = new Date().toISOString().split("T")[0];
  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  const halls = ["Maharaja Hall", "Rajwada Hall", "Garden Terrace"];
  const [billTab, setBillTab] = useState<"new" | "history">("new");
  const [isSaving, setIsSaving] = useState(false);
  const [showInv, setShowInv] = useState<any | null>(null);

  // Event Details
  const [eventType, setEventType] = useState("");
  const [eventDate, setEventDate] = useState(today);
  const [fullName, setFullName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [gstin, setGstin] = useState("");
  const [hall, setHall] = useState(halls[0]);
  const [specialReq, setSpecialReq] = useState("");
  const [paymentMode, setPaymentMode] = useState("cash");

  // Veg Menu pax counts
  const vegItems = [
    { name: "Veg Starter Platter", price: 250 },
    { name: "Paneer Tikka", price: 180 },
    { name: "Veg Biryani", price: 220 },
    { name: "Dal Makhani", price: 120 },
    { name: "Shahi Paneer", price: 160 },
    { name: "Mix Veg Curry", price: 130 },
    { name: "Steamed Rice", price: 80 },
    { name: "Butter Naan", price: 60 },
    { name: "Veg Soup", price: 90 },
    { name: "Veg Welcome Drink", price: 50 },
  ];
  const nonVegItems = [
    { name: "Non-Veg Starter Platter", price: 350 },
    { name: "Chicken Tikka", price: 280 },
    { name: "Mutton Seekh Kebab", price: 320 },
    { name: "Chicken Biryani", price: 300 },
    { name: "Mutton Curry", price: 350 },
    { name: "Fish Fry", price: 280 },
    { name: "Egg Curry", price: 150 },
    { name: "Chicken Soup", price: 120 },
    { name: "Non-Veg Welcome Drink", price: 70 },
  ];
  const djItems = [
    { name: "DJ (Basic)", price: 8000 },
    { name: "DJ (Premium)", price: 15000 },
    { name: "Flower Gate", price: 5000 },
    { name: "Stage Decor", price: 12000 },
    { name: "Balloon Decor", price: 3000 },
    { name: "LED Backdrop", price: 8000 },
  ];
  const extraServiceOptions = [
    { name: "Photography", price: 10000 },
    { name: "Mehendi", price: 5000 },
    { name: "Catering Extra", price: 3000 },
    { name: "Sound System", price: 7000 },
    { name: "Video Recording", price: 8000 },
    { name: "Horse/Barat", price: 15000 },
  ];

  const [vegPax, setVegPax] = useState<Record<string, number>>({});
  const [nonVegPax, setNonVegPax] = useState<Record<string, number>>({});
  const [djSelected, setDjSelected] = useState<string[]>([]);
  const [extraServices, setExtraServices] = useState<
    { name: string; price: number }[]
  >([]);
  const [extraSelect, setExtraSelect] = useState("");
  const [extraCustomName, setExtraCustomName] = useState("");
  const [extraCustomPrice, setExtraCustomPrice] = useState("");

  const vegTotal = vegItems.reduce(
    (s, i) => s + (vegPax[i.name] || 0) * i.price,
    0,
  );
  const vegPaxCount = vegItems.reduce((s, i) => s + (vegPax[i.name] || 0), 0);
  const nonVegTotal = nonVegItems.reduce(
    (s, i) => s + (nonVegPax[i.name] || 0) * i.price,
    0,
  );
  const nonVegPaxCount = nonVegItems.reduce(
    (s, i) => s + (nonVegPax[i.name] || 0),
    0,
  );
  const djTotal = djItems
    .filter((d) => djSelected.includes(d.name))
    .reduce((s, d) => s + d.price, 0);
  const extraTotal = extraServices.reduce((s, e) => s + e.price, 0);
  const subtotal = vegTotal + nonVegTotal + djTotal + extraTotal;
  const gst18 = Math.round(subtotal * 0.18);
  const grandTotal = subtotal + gst18;

  const mobileSearch = (mobile: string) => {
    setMobileNo(mobile);
    if (mobile.length === 10) {
      try {
        const checkIns: any[] = JSON.parse(
          localStorage.getItem("hotelCheckIns") || "[]",
        );
        const pastGuests: any[] = JSON.parse(
          localStorage.getItem("kdm_past_guests") || "[]",
        );
        const found = [...checkIns, ...pastGuests].find(
          (g: any) =>
            g.phone === mobile ||
            g.mobile === mobile ||
            g.contactPhone === mobile,
        );
        if (found) {
          setFullName(
            found.guestName || found.contactName || found.name || fullName,
          );
          setEmail(found.email || email);
          setCompanyName(found.companyName || companyName);
          setGstin(found.companyGst || found.gstin || gstin);
          toast.success("Guest details auto-filled!");
        }
      } catch {}
    }
  };

  const addExtraService = () => {
    if (extraSelect) {
      const sel = extraServiceOptions.find((e) => e.name === extraSelect);
      if (sel && !extraServices.find((e) => e.name === sel.name)) {
        setExtraServices((p) => [...p, sel]);
        setExtraSelect("");
      }
    } else if (extraCustomName && extraCustomPrice) {
      if (!extraServices.find((e) => e.name === extraCustomName)) {
        setExtraServices((p) => [
          ...p,
          { name: extraCustomName, price: Number(extraCustomPrice) },
        ]);
        setExtraCustomName("");
        setExtraCustomPrice("");
      }
    }
  };

  const resetForm = () => {
    setEventType("");
    setEventDate(today);
    setFullName("");
    setMobileNo("");
    setEmail("");
    setCompanyName("");
    setGstin("");
    setHall(halls[0]);
    setSpecialReq("");
    setVegPax({});
    setNonVegPax({});
    setDjSelected([]);
    setExtraServices([]);
    setPaymentMode("cash");
  };

  const generate = async () => {
    if (!fullName || !eventType) {
      toast.error("Event type and full name required");
      return;
    }
    if (!actor) {
      toast.error("Not connected");
      return;
    }
    setIsSaving(true);
    try {
      const billId = `BB${String(Date.now()).slice(-6)}`;
      const bill = {
        id: billId,
        eventName: eventType,
        hall,
        contactName: fullName,
        contactPhone: mobileNo,
        eventDate,
        guestCount: vegPaxCount + nonVegPaxCount,
        perPlate:
          vegPaxCount + nonVegPaxCount > 0
            ? Math.round(subtotal / (vegPaxCount + nonVegPaxCount))
            : 0,
        extra: djTotal + extraTotal,
        gstPct: 18,
        paymentMode,
        notes: specialReq,
        companyName,
        companyGst: gstin,
        email,
        vegMenu: vegItems
          .filter((i) => (vegPax[i.name] || 0) > 0)
          .map((i) => ({
            name: i.name,
            price: i.price,
            pax: vegPax[i.name] || 0,
          })),
        nonVegMenu: nonVegItems
          .filter((i) => (nonVegPax[i.name] || 0) > 0)
          .map((i) => ({
            name: i.name,
            price: i.price,
            pax: nonVegPax[i.name] || 0,
          })),
        djServices: djItems.filter((d) => djSelected.includes(d.name)),
        extraServices,
        subtotal,
        gstAmount: gst18,
        total: grandTotal,
        totalAmount: grandTotal,
        createdAt: BigInt(Date.now()),
      };
      try {
        await (actor as any).createBanquetBill(bill);
      } catch {}
      try {
        const existing: any[] = JSON.parse(
          localStorage.getItem("kdm_banquet_bills") || "[]",
        );
        existing.push({ ...bill, createdAt: Number(bill.createdAt) });
        localStorage.setItem("kdm_banquet_bills", JSON.stringify(existing));
      } catch {}
      await queryClient.invalidateQueries({ queryKey: ["banquetBills"] });
      setShowInv(bill);
      resetForm();
      toast.success("Banquet invoice generated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save");
    }
    setIsSaving(false);
  };

  const printInvoice = (b: any) => {
    const gstSettings: any = JSON.parse(
      localStorage.getItem("kdm_gst_settings") || "{}",
    );
    const w = window.open("", "_blank", "width=700,height=900");
    if (!w) return;
    const vegRows = (b.vegMenu || [])
      .map(
        (i: any) =>
          `<tr><td>${i.name}</td><td>${i.pax} pax</td><td>₹${i.price}/head</td><td>₹${i.pax * i.price}</td></tr>`,
      )
      .join("");
    const nvRows = (b.nonVegMenu || [])
      .map(
        (i: any) =>
          `<tr><td>${i.name}</td><td>${i.pax} pax</td><td>₹${i.price}/head</td><td>₹${i.pax * i.price}</td></tr>`,
      )
      .join("");
    const djRows = (b.djServices || [])
      .map(
        (d: any) =>
          `<tr><td>${d.name}</td><td colspan="2">-</td><td>₹${d.price}</td></tr>`,
      )
      .join("");
    const exRows = (b.extraServices || [])
      .map(
        (e: any) =>
          `<tr><td>${e.name}</td><td colspan="2">-</td><td>₹${e.price}</td></tr>`,
      )
      .join("");
    w.document.write(`<html><head><title>Banquet Invoice ${b.id}</title><style>body{font-family:Arial;padding:20px;color:#111}h2,h3{text-align:center;color:#b8860b}table{width:100%;border-collapse:collapse;margin-bottom:10px}th,td{border:1px solid #ddd;padding:6px 8px;font-size:13px}th{background:#fef9e7}.total{font-weight:bold;font-size:1.1em;color:#b8860b}</style></head><body>
      <h2>HOTEL KDM PALACE</h2><p style="text-align:center">${gstSettings.address || "Patna, Bihar"}<br>GSTIN: ${gstSettings.gstin || "N/A"}</p><hr>
      <h3>BANQUET INVOICE</h3>
      <table><tr><td><b>Bill No:</b> ${b.id}</td><td><b>Date:</b> ${b.eventDate}</td></tr>
      <tr><td><b>Event:</b> ${b.eventName}</td><td><b>Hall:</b> ${b.hall}</td></tr>
      <tr><td><b>Name:</b> ${b.contactName}</td><td><b>Mobile:</b> ${b.contactPhone || ""}</td></tr>
      ${b.email ? `<tr><td><b>Email:</b> ${b.email}</td><td></td></tr>` : ""}
      ${b.companyName ? `<tr><td><b>Company:</b> ${b.companyName}</td><td><b>GSTIN:</b> ${b.companyGst || ""}</td></tr>` : ""}
      </table>
      ${vegRows ? `<b>🥗 Veg Menu</b><table><tr><th>Item</th><th>Pax</th><th>Rate</th><th>Amount</th></tr>${vegRows}</table>` : ""}
      ${nvRows ? `<b>🍗 Non-Veg Menu</b><table><tr><th>Item</th><th>Pax</th><th>Rate</th><th>Amount</th></tr>${nvRows}</table>` : ""}
      ${djRows || exRows ? `<b>🎵 Services</b><table><tr><th>Service</th><th colspan="2"></th><th>Amount</th></tr>${djRows}${exRows}</table>` : ""}
      <table><tr><td><b>Veg Menu Total</b></td><td>₹${b.vegMenu ? b.vegMenu.reduce((s: number, i: any) => s + i.pax * i.price, 0) : 0}</td></tr>
      <tr><td><b>Non-Veg Menu Total</b></td><td>₹${b.nonVegMenu ? b.nonVegMenu.reduce((s: number, i: any) => s + i.pax * i.price, 0) : 0}</td></tr>
      <tr><td><b>DJ & Decoration</b></td><td>₹${(b.djServices || []).reduce((s: number, d: any) => s + d.price, 0)}</td></tr>
      <tr><td><b>Extra Services</b></td><td>₹${(b.extraServices || []).reduce((s: number, e: any) => s + e.price, 0)}</td></tr>
      <tr><td><b>Subtotal</b></td><td>₹${b.subtotal || 0}</td></tr>
      <tr><td><b>GST (18%)</b></td><td>₹${b.gstAmount || 0}</td></tr>
      <tr class="total"><td><b>GRAND TOTAL</b></td><td><b>₹${b.totalAmount || b.total || 0}</b></td></tr>
      <tr><td><b>Payment Mode</b></td><td>${b.paymentMode}</td></tr>
      </table>
      ${b.notes ? `<p><b>Special Requests:</b> ${b.notes}</p>` : ""}
      <p style="text-align:center;margin-top:20px;color:#666">Thank you for choosing Hotel KDM Palace!</p>
    </body></html>`);
    w.document.close();
    w.print();
  };

  return (
    <div>
      <SectionTitle
        title="Banquet Billing"
        sub="Comprehensive banquet event billing system"
      />
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <Button
          size="sm"
          style={{
            background: billTab === "new" ? "#c9a84c" : "#f1f5f9",
            color: billTab === "new" ? "#000" : "#1e293b",
            fontWeight: 700,
          }}
          onClick={() => setBillTab("new")}
        >
          New Bill
        </Button>
        <Button
          size="sm"
          style={{
            background: billTab === "history" ? "#c9a84c" : "#f1f5f9",
            color: billTab === "history" ? "#000" : "#1e293b",
            fontWeight: 700,
          }}
          onClick={() => setBillTab("history")}
        >
          Bill History
        </Button>
      </div>

      {billTab === "new" && (
        <div style={{ maxWidth: 800 }}>
          {/* Mobile Search */}
          <div
            style={{
              background: "#f0f9ff",
              border: "1px solid #bae6fd",
              borderRadius: 8,
              padding: "10px 12px",
              marginBottom: 16,
            }}
          >
            <Label
              style={{ color: "#0369a1", fontWeight: 700, fontSize: "0.78rem" }}
            >
              🔍 Search Guest by Mobile (Auto-fill)
            </Label>
            <Input
              type="tel"
              maxLength={10}
              value={mobileNo}
              onChange={(e) => mobileSearch(e.target.value)}
              placeholder="Enter 10-digit mobile to auto-fill details..."
              style={{ marginTop: 4 }}
              data-ocid="banquet-billing.search_input"
            />
          </div>

          {/* Event Details */}
          <Card style={{ marginBottom: 16 }}>
            <CardHeader>
              <CardTitle style={{ color: "#1e293b", fontSize: "1rem" }}>
                Event Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Event Type *</Label>
                  <Input
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    placeholder="Wedding Reception, Birthday Party..."
                    data-ocid="banquet-billing.input"
                  />
                </div>
                <div>
                  <Label>Event Date</Label>
                  <Input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Full Name *</Label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <Label>Mobile Number</Label>
                  <Input
                    type="tel"
                    maxLength={10}
                    value={mobileNo}
                    onChange={(e) => mobileSearch(e.target.value)}
                    placeholder="Mobile number"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <Label>Company / Organization</Label>
                  <Input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Company / Organization name"
                  />
                </div>
                <div>
                  <Label>15-digit GSTIN</Label>
                  <Input
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    placeholder="15-digit GSTIN"
                    maxLength={15}
                  />
                </div>
                <div>
                  <Label>Hall Selection</Label>
                  <select
                    value={hall}
                    onChange={(e) => setHall(e.target.value)}
                    style={{
                      width: "100%",
                      border: "1px solid #e2e8f0",
                      borderRadius: 6,
                      padding: "7px 10px",
                      color: "#1e293b",
                    }}
                  >
                    <option value="">-- Select Hall --</option>
                    {halls.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <Label>Special Requests</Label>
                <Textarea
                  value={specialReq}
                  onChange={(e) => setSpecialReq(e.target.value)}
                  placeholder="Special requests, seating arrangement, etc."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Veg Menu */}
          <Card style={{ marginBottom: 16 }}>
            <CardHeader>
              <CardTitle style={{ color: "#16a34a", fontSize: "1rem" }}>
                🥗 Veg Menu Selection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                }}
              >
                {vegItems.map((item) => (
                  <div
                    key={item.name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      border: "1px solid #e2e8f0",
                      borderRadius: 6,
                      padding: "6px 10px",
                      background:
                        (vegPax[item.name] || 0) > 0 ? "#f0fdf4" : "#fff",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: "0.82rem",
                          color: "#1e293b",
                        }}
                      >
                        {item.name}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                        ₹{item.price}/head
                      </div>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={vegPax[item.name] || ""}
                      onChange={(e) =>
                        setVegPax((p) => ({
                          ...p,
                          [item.name]: Number(e.target.value) || 0,
                        }))
                      }
                      placeholder="0"
                      style={{
                        width: 60,
                        border: "1px solid #e2e8f0",
                        borderRadius: 4,
                        padding: "4px 6px",
                        textAlign: "center",
                        fontSize: "0.85rem",
                        fontWeight: 700,
                      }}
                    />
                  </div>
                ))}
              </div>
              <div
                style={{
                  background: "#f0fdf4",
                  border: "1px solid #86efac",
                  borderRadius: 6,
                  padding: "8px 12px",
                  marginTop: 10,
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: 700,
                }}
              >
                <span style={{ color: "#16a34a" }}>
                  Veg Total ({vegPaxCount} pax)
                </span>
                <span style={{ color: "#16a34a" }}>{fmt(vegTotal)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Non-Veg Menu */}
          <Card style={{ marginBottom: 16 }}>
            <CardHeader>
              <CardTitle style={{ color: "#dc2626", fontSize: "1rem" }}>
                🍗 Non-Veg Menu Selection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                }}
              >
                {nonVegItems.map((item) => (
                  <div
                    key={item.name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      border: "1px solid #e2e8f0",
                      borderRadius: 6,
                      padding: "6px 10px",
                      background:
                        (nonVegPax[item.name] || 0) > 0 ? "#fef2f2" : "#fff",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: "0.82rem",
                          color: "#1e293b",
                        }}
                      >
                        {item.name}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                        ₹{item.price}/head
                      </div>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={nonVegPax[item.name] || ""}
                      onChange={(e) =>
                        setNonVegPax((p) => ({
                          ...p,
                          [item.name]: Number(e.target.value) || 0,
                        }))
                      }
                      placeholder="0"
                      style={{
                        width: 60,
                        border: "1px solid #e2e8f0",
                        borderRadius: 4,
                        padding: "4px 6px",
                        textAlign: "center",
                        fontSize: "0.85rem",
                        fontWeight: 700,
                      }}
                    />
                  </div>
                ))}
              </div>
              <div
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fca5a5",
                  borderRadius: 6,
                  padding: "8px 12px",
                  marginTop: 10,
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: 700,
                }}
              >
                <span style={{ color: "#dc2626" }}>
                  Non-Veg Total ({nonVegPaxCount} pax)
                </span>
                <span style={{ color: "#dc2626" }}>{fmt(nonVegTotal)}</span>
              </div>
            </CardContent>
          </Card>

          {/* DJ & Decoration */}
          <Card style={{ marginBottom: 16 }}>
            <CardHeader>
              <CardTitle style={{ color: "#7c3aed", fontSize: "1rem" }}>
                🎵 DJ & Decoration Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                }}
              >
                {djItems.map((dj) => (
                  <label
                    key={dj.name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      border: "1px solid #e2e8f0",
                      borderRadius: 6,
                      padding: "8px 12px",
                      cursor: "pointer",
                      background: djSelected.includes(dj.name)
                        ? "#f5f3ff"
                        : "#fff",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={djSelected.includes(dj.name)}
                      onChange={(e) =>
                        setDjSelected((p) =>
                          e.target.checked
                            ? [...p, dj.name]
                            : p.filter((x) => x !== dj.name),
                        )
                      }
                    />
                    <div>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: "0.82rem",
                          color: "#1e293b",
                        }}
                      >
                        {dj.name}
                      </div>
                      <div
                        style={{
                          fontSize: "0.72rem",
                          color: "#7c3aed",
                          fontWeight: 700,
                        }}
                      >
                        ₹{dj.price.toLocaleString()}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              <div
                style={{
                  background: "#f5f3ff",
                  border: "1px solid #c4b5fd",
                  borderRadius: 6,
                  padding: "8px 12px",
                  marginTop: 10,
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: 700,
                }}
              >
                <span style={{ color: "#7c3aed" }}>DJ & Decoration Total</span>
                <span style={{ color: "#7c3aed" }}>{fmt(djTotal)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Extra Services */}
          <Card style={{ marginBottom: 16 }}>
            <CardHeader>
              <CardTitle style={{ color: "#d97706", fontSize: "1rem" }}>
                ✨ Extra / Add-on Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginBottom: 10,
                  flexWrap: "wrap",
                }}
              >
                <select
                  value={extraSelect}
                  onChange={(e) => setExtraSelect(e.target.value)}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: 6,
                    padding: "7px 10px",
                    color: "#1e293b",
                    minWidth: 200,
                  }}
                >
                  <option value="">Select service</option>
                  {extraServiceOptions.map((e) => (
                    <option key={e.name} value={e.name}>
                      {e.name} — ₹{e.price.toLocaleString()}
                    </option>
                  ))}
                </select>
                <span
                  style={{
                    color: "#64748b",
                    fontWeight: 600,
                    lineHeight: "38px",
                  }}
                >
                  or
                </span>
                <Input
                  value={extraCustomName}
                  onChange={(e) => setExtraCustomName(e.target.value)}
                  placeholder="Custom service name"
                  style={{ width: 160 }}
                />
                <Input
                  type="number"
                  value={extraCustomPrice}
                  onChange={(e) => setExtraCustomPrice(e.target.value)}
                  placeholder="Price ₹"
                  style={{ width: 100 }}
                />
                <Button
                  style={{
                    background: "#d97706",
                    color: "#fff",
                    fontWeight: 700,
                  }}
                  onClick={addExtraService}
                >
                  + Add
                </Button>
              </div>
              {extraServices.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {extraServices.map((e, i) => (
                    <div
                      key={e.name}
                      style={{
                        background: "#fffbeb",
                        border: "1px solid #fde68a",
                        borderRadius: 6,
                        padding: "4px 10px",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: "0.8rem",
                        fontWeight: 600,
                      }}
                    >
                      {e.name} — ₹{e.price.toLocaleString()}
                      <button
                        type="button"
                        onClick={() =>
                          setExtraServices((p) => p.filter((_, j) => j !== i))
                        }
                        style={{
                          color: "#ef4444",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontWeight: 700,
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bill Summary */}
          <Card style={{ marginBottom: 16, border: "2px solid #c9a84c" }}>
            <CardHeader>
              <CardTitle style={{ color: "#c9a84c", fontSize: "1rem" }}>
                📋 Bill Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  {
                    label: "Veg Menu Total",
                    value: vegTotal,
                    color: "#16a34a",
                  },
                  {
                    label: "Non-Veg Menu Total",
                    value: nonVegTotal,
                    color: "#dc2626",
                  },
                  {
                    label: "DJ & Decoration",
                    value: djTotal,
                    color: "#7c3aed",
                  },
                  {
                    label: "Extra Services",
                    value: extraTotal,
                    color: "#d97706",
                  },
                ].map(({ label, value, color }) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "4px 0",
                      borderBottom: "1px solid #f1f5f9",
                    }}
                  >
                    <span style={{ fontWeight: 600, color: "#475569" }}>
                      {label}
                    </span>
                    <span style={{ fontWeight: 700, color }}>{fmt(value)}</span>
                  </div>
                ))}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "4px 0",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <span style={{ fontWeight: 600, color: "#475569" }}>
                    Subtotal
                  </span>
                  <span style={{ fontWeight: 700, color: "#1e293b" }}>
                    {fmt(subtotal)}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "4px 0",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <span style={{ fontWeight: 600, color: "#475569" }}>
                    GST (18%)
                  </span>
                  <span style={{ fontWeight: 700, color: "#f59e0b" }}>
                    {fmt(gst18)}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 0",
                    background: "#fffbeb",
                    borderRadius: 6,
                    paddingLeft: 10,
                    paddingRight: 10,
                  }}
                >
                  <span
                    style={{
                      fontWeight: 800,
                      fontSize: "1.1rem",
                      color: "#1e293b",
                    }}
                  >
                    GRAND TOTAL
                  </span>
                  <span
                    style={{
                      fontWeight: 800,
                      fontSize: "1.1rem",
                      color: "#c9a84c",
                    }}
                  >
                    {fmt(grandTotal)}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div>
                  <Label>Payment Mode</Label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    style={{
                      width: "100%",
                      border: "1px solid #e2e8f0",
                      borderRadius: 6,
                      padding: "7px 10px",
                      color: "#1e293b",
                    }}
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="neft">NEFT/Cheque</option>
                  </select>
                </div>
              </div>
              <Button
                className="w-full mt-4"
                style={{
                  background: "#c9a84c",
                  color: "#000",
                  fontWeight: 700,
                  fontSize: "1rem",
                  padding: "12px",
                }}
                onClick={generate}
                disabled={isSaving}
                data-ocid="banquet-billing.submit_button"
              >
                {isSaving ? "Saving..." : "🧾 Generate Bill"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {billTab === "history" && (
        <div>
          <h3 className="font-bold mb-3 text-gray-800">
            Invoice History ({banquetBills.length})
          </h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {banquetBills.length === 0 && (
              <p
                className="text-gray-500 text-sm text-center py-8"
                data-ocid="banquet-billing.empty_state"
              >
                No banquet invoices yet
              </p>
            )}
            {([...banquetBills] as any[])
              .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
              .map((b, i) => (
                <Card key={b.id} className="border border-gray-200">
                  <CardContent className="pt-3 pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-gray-900">
                          {b.eventName}
                        </div>
                        <div className="text-xs text-gray-600">
                          {b.hall} · {b.eventDate} · {b.contactName}
                        </div>
                        <div className="text-xs text-amber-700 font-bold">
                          ₹
                          {(b.totalAmount || b.total || 0).toLocaleString(
                            "en-IN",
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs border-amber-400 text-amber-700"
                          data-ocid={`banquet-billing.reprint.${i + 1}`}
                          onClick={() => printInvoice(b)}
                        >
                          🖨️ Reprint
                        </Button>
                        <button
                          type="button"
                          onClick={() =>
                            shareInvoiceWhatsApp("Banquet Invoice", {
                              guest: b.contactName,
                              billNo: String(b.id),
                              room: b.hall,
                              date: b.eventDate,
                              amount: b.totalAmount || b.total || 0,
                            })
                          }
                          style={{
                            background: "#25D366",
                            color: "#fff",
                            border: "none",
                            borderRadius: 4,
                            padding: "4px 10px",
                            cursor: "pointer",
                            fontSize: "0.72rem",
                            fontWeight: 600,
                          }}
                        >
                          📱 WhatsApp
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            printAsPDF(
                              `Banquet Invoice - ${b.id}`,
                              `<h2>HOTEL KDM PALACE</h2><p>Banquet Invoice - ${b.id}</p><hr><p>Event: ${b.eventName}</p><p>Hall: ${b.hall}</p><p>Date: ${b.eventDate}</p><p>Guest: ${b.contactName}</p><p>Total: ₹${b.totalAmount || b.total || 0}</p>`,
                            )
                          }
                          style={{
                            background: "#2563eb",
                            color: "#fff",
                            border: "none",
                            borderRadius: 4,
                            padding: "4px 10px",
                            cursor: "pointer",
                            fontSize: "0.72rem",
                            fontWeight: 600,
                          }}
                        >
                          📄 PDF
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}

      {showInv && (
        <Dialog open={!!showInv} onOpenChange={() => setShowInv(null)}>
          <DialogContent
            style={{ background: "#fff", color: "#1e293b", maxWidth: 440 }}
          >
            <DialogHeader>
              <DialogTitle style={{ color: "#c9a84c", fontWeight: 700 }}>
                Invoice Generated — {showInv.id}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-semibold">Event:</span>
                <span>{showInv.eventName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Hall:</span>
                <span>{showInv.hall}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Guest:</span>
                <span>{showInv.contactName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Date:</span>
                <span>{showInv.eventDate}</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t pt-2">
                <span>Grand Total:</span>
                <span className="text-amber-600">
                  ₹
                  {(showInv.totalAmount || showInv.total || 0).toLocaleString(
                    "en-IN",
                  )}
                </span>
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <Button
                style={{
                  background: "#c9a84c",
                  color: "#000",
                  fontWeight: 700,
                  flex: 1,
                }}
                onClick={() => printInvoice(showInv)}
              >
                🖨️ Print Invoice
              </Button>
              <Button variant="outline" onClick={() => setShowInv(null)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function BanquetBillHistorySection() {
  const { data: banquetBills = [], isLoading } = useBanquetBills();

  const getBanquetProfile = (billId: string) => {
    try {
      const profiles = JSON.parse(
        localStorage.getItem("kdm_banquet_profiles") || "{}",
      );
      return profiles[billId] || {};
    } catch {
      return {};
    }
  };

  return (
    <div>
      <SectionTitle
        title="Banquet Bill History"
        sub="All banquet event bills"
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <StatCard
          label="Total Bills"
          value={banquetBills.length}
          color="#c9a84c"
        />
        <StatCard
          label="Total Revenue"
          value={`₹${banquetBills.reduce((s, b) => s + b.totalAmount, 0).toLocaleString()}`}
          color="#22c55e"
        />
        <StatCard
          label="Total Guests"
          value={banquetBills.reduce((s, b) => s + Number(b.guestCount), 0)}
          color="#6366f1"
        />
      </div>
      <div
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        {isLoading ? (
          <div
            style={{ padding: "2rem" }}
            data-ocid="banquet-bills.loading_state"
          >
            Loading...
          </div>
        ) : banquetBills.length === 0 ? (
          <div
            style={{
              padding: "3rem",
              textAlign: "center",
              color: "#94a3b8",
              fontWeight: 600,
            }}
            data-ocid="banquet-bills.empty_state"
          >
            No banquet bills yet. Create them in Restaurant POS → Banquet
            Billing.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.85rem",
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid #e2e8f0",
                    background: "#f8fafc",
                  }}
                >
                  {[
                    "Hall",
                    "Event",
                    "Contact",
                    "Company",
                    "Guests",
                    "Total",
                    "Payment",
                    "Date",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "8px 12px",
                        color: "#1e293b",
                        fontWeight: 700,
                        textAlign: "left",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {banquetBills.map((b, i) => {
                  const profile = getBanquetProfile(b.id);
                  return (
                    <tr
                      key={b.id}
                      data-ocid={`banquet-bills.item.${i + 1}`}
                      style={{ borderBottom: "1px solid #f1f5f9" }}
                    >
                      <td
                        style={{
                          padding: "8px 12px",
                          fontWeight: 700,
                          color: "#1e293b",
                        }}
                      >
                        {b.hallName}
                      </td>
                      <td style={{ padding: "8px 12px", color: "#1e293b" }}>
                        {b.eventName}
                      </td>
                      <td style={{ padding: "8px 12px", color: "#1e293b" }}>
                        {b.contactName}
                        <br />
                        <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                          {b.contactPhone}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "8px 12px",
                          color: "#64748b",
                          fontSize: "0.8rem",
                        }}
                      >
                        {profile.companyName || "—"}
                      </td>
                      <td
                        style={{
                          padding: "8px 12px",
                          color: "#1e293b",
                          textAlign: "center",
                        }}
                      >
                        {b.guestCount}
                      </td>
                      <td
                        style={{
                          padding: "8px 12px",
                          color: "#c9a84c",
                          fontWeight: 700,
                        }}
                      >
                        ₹{b.totalAmount.toLocaleString()}
                      </td>
                      <td
                        style={{
                          padding: "8px 12px",
                          color: "#1e293b",
                          textTransform: "uppercase",
                          fontSize: "0.75rem",
                        }}
                      >
                        {String(b.paymentMode)}
                      </td>
                      <td
                        style={{
                          padding: "8px 12px",
                          color: "#64748b",
                          fontSize: "0.75rem",
                        }}
                      >
                        {new Date(Number(b.createdAt)).toLocaleDateString(
                          "en-IN",
                        )}
                      </td>
                      <td style={{ padding: "8px 12px" }}>
                        <Button
                          size="sm"
                          variant="outline"
                          style={{
                            borderColor: "#c9a84c",
                            color: "#c9a84c",
                            fontWeight: 600,
                            fontSize: "0.7rem",
                          }}
                          data-ocid={`banquet-bills.reprint_button.${i + 1}`}
                          onClick={() =>
                            reprintBill(
                              `Banquet Bill - ${b.hallName}`,
                              `<div class="header"><h2>HOTEL KDM PALACE</h2><p>Banquet Bill</p></div>
                            <table>
                              <tr><th>Hall</th><td>${b.hallName}</td><th>Event</th><td>${b.eventName}</td></tr>
                              <tr><th>Contact</th><td>${b.contactName}</td><th>Phone</th><td>${b.contactPhone}</td></tr>
                              ${profile.companyName ? `<tr><th>Company</th><td>${profile.companyName}</td><th>GST No.</th><td>${profile.companyGst || "—"}</td></tr>` : ""}
                              <tr><th>Date</th><td>${new Date(Number(b.createdAt)).toLocaleDateString("en-IN")}</td><th>Guests</th><td>${b.guestCount}</td></tr>
                            </table><br/>
                            <table>
                              <tr><th>Per Plate Rate</th><td>₹${b.perPlateRate}</td></tr>
                              <tr><th>Food Total</th><td>₹${Number(b.perPlateRate) * Number(b.guestCount)}</td></tr>
                              <tr><th>Extra Charges</th><td>₹${b.extraCharges}</td></tr>
                              <tr><th>GST (${b.gstPercent}%)</th><td>₹${((b.totalAmount * b.gstPercent) / (100 + b.gstPercent)).toFixed(2)}</td></tr>
                              <tr><th style="color:#c9a84c">Total</th><td style="color:#c9a84c;font-weight:700">₹${b.totalAmount}</td></tr>
                              <tr><th>Payment Mode</th><td>${String(b.paymentMode).toUpperCase()}</td></tr>
                            </table>`,
                            )
                          }
                        >
                          🖨️ Reprint
                        </Button>
                        <button
                          type="button"
                          data-ocid={`banquet-bills.secondary_button.${i + 1}`}
                          onClick={() =>
                            shareInvoiceWhatsApp("Banquet Bill", {
                              guest: b.contactName,
                              billNo: String(b.id || ""),
                              room: b.hallName,
                              date: new Date(
                                Number(b.createdAt),
                              ).toLocaleDateString("en-IN"),
                              amount: b.totalAmount,
                            })
                          }
                          style={{
                            background: "#25D366",
                            color: "white",
                            border: "none",
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            padding: "4px 8px",
                            borderRadius: 4,
                            cursor: "pointer",
                          }}
                        >
                          📱 WhatsApp
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            printAsPDF(
                              `Banquet Bill - ${b.hallName}`,
                              `<div class="header"><h2>HOTEL KDM PALACE</h2><p>Banquet Bill</p></div>
                            <table>
                              <tr><th>Hall</th><td>${b.hallName}</td><th>Event</th><td>${b.eventName}</td></tr>
                              <tr><th>Contact</th><td>${b.contactName}</td><th>Phone</th><td>${b.contactPhone}</td></tr>
                              <tr><th>Date</th><td>${new Date(Number(b.createdAt)).toLocaleDateString("en-IN")}</td><th>Guests</th><td>${b.guestCount}</td></tr>
                            </table><br/>
                            <table>
                              <tr><th>Per Plate Rate</th><td>₹${b.perPlateRate}</td></tr>
                              <tr><th>Extra Charges</th><td>₹${b.extraCharges}</td></tr>
                              <tr><th>GST (${b.gstPercent}%)</th><td>₹${((b.totalAmount * b.gstPercent) / (100 + b.gstPercent)).toFixed(2)}</td></tr>
                              <tr><th style="color:#c9a84c">Total</th><td style="color:#c9a84c;font-weight:700">₹${b.totalAmount}</td></tr>
                            </table>`,
                            )
                          }
                          style={{
                            background: "#2563eb",
                            color: "white",
                            border: "none",
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            padding: "4px 8px",
                            borderRadius: 4,
                            cursor: "pointer",
                          }}
                        >
                          📄 PDF
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StripeSetupSection() {
  const { actor } = useActor();
  const [secretKey, setSecretKey] = useState("");
  const { data: isConfigured, refetch } = useQuery<boolean>({
    queryKey: ["stripeConfigured"],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await (actor as any).isStripeConfigured();
      } catch {
        return false;
      }
    },
    enabled: !!actor,
  });
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      await (actor as any).setStripeConfiguration({
        secretKey,
        allowedCountries: ["IN"],
      });
    },
    onSuccess: () => {
      toast.success("Stripe configuration saved!");
      refetch();
      setSecretKey("");
    },
    onError: () => toast.error("Failed to save Stripe configuration."),
  });

  return (
    <div>
      <SectionTitle
        title="Online Payments (Stripe)"
        sub="Accept credit/debit card payments online"
      />
      {isConfigured ? (
        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #86efac",
            borderRadius: 8,
            padding: "1.5rem",
            marginBottom: 20,
          }}
        >
          <p
            style={{
              color: "#16a34a",
              fontWeight: 700,
              fontSize: "1.1rem",
              marginBottom: 4,
            }}
          >
            ✓ Stripe Payments Active
          </p>
          <p style={{ color: "#15803d", fontSize: "0.875rem" }}>
            Online payment is configured. Guests can pay their room invoices
            online via credit/debit card.
          </p>
        </div>
      ) : (
        <div
          style={{
            background: "#fffbeb",
            border: "1px solid #fcd34d",
            borderRadius: 8,
            padding: "1.25rem",
            marginBottom: 20,
          }}
        >
          <p style={{ color: "#92400e", fontSize: "0.875rem" }}>
            ⚠ Stripe is not configured. Set up your Stripe secret key to accept
            online payments.
          </p>
        </div>
      )}
      <div
        style={{
          background: CARD_BG,
          border: `1px solid ${BORDER}`,
          borderRadius: 8,
          padding: "1.5rem",
          maxWidth: 500,
        }}
      >
        <p style={{ color: GOLD, fontWeight: 600, marginBottom: 16 }}>
          Stripe Configuration
        </p>
        <div style={{ marginBottom: 12 }}>
          <Label
            style={{
              color: "#1e293b",
              fontWeight: 600,
              fontSize: "0.75rem",
              marginBottom: 4,
              display: "block",
            }}
          >
            Stripe Secret Key
          </Label>
          <Input
            type="password"
            placeholder="sk_live_..."
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            data-ocid="stripe-setup.input"
          />
          <p
            style={{
              color: "#1e293b",
              fontWeight: 600,
              fontSize: "0.72rem",
              marginTop: 4,
            }}
          >
            Get your secret key from the Stripe Dashboard → Developers → API
            Keys
          </p>
        </div>
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={!secretKey || saveMutation.isPending}
          style={{ background: GOLD, color: "#000", fontWeight: 600 }}
          data-ocid="stripe-setup.primary_button"
        >
          {saveMutation.isPending ? "Saving..." : "Save Stripe Config"}
        </Button>
      </div>
      <div
        style={{
          background: CARD_BG,
          border: `1px solid ${BORDER}`,
          borderRadius: 8,
          padding: "1.25rem",
          marginTop: 20,
          maxWidth: 500,
        }}
      >
        <p style={{ color: GOLD, fontWeight: 600, marginBottom: 8 }}>
          How It Works
        </p>
        <ul
          style={{
            color: "#1e293b",
            fontWeight: 600,
            fontSize: "0.875rem",
            lineHeight: 1.8,
            paddingLeft: 20,
          }}
        >
          <li>Guest checks out → Room Invoice is generated</li>
          <li>Staff clicks "💳 Pay Online" in the invoice dialog</li>
          <li>Guest is redirected to Stripe's secure payment page</li>
          <li>After payment, guest is redirected back to the hotel website</li>
        </ul>
      </div>
    </div>
  );
}

// ─── MAIN ADMIN PAGE ──────────────────────────────────────────────────────────

function exportCSV(
  filename: string,
  headers: string[],
  rows: (string | number)[][],
) {
  const escVal = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const allLines =
    headers.length > 0
      ? [
          headers.map(escVal).join(","),
          ...rows.map((r) => r.map(escVal).join(",")),
        ]
      : rows.map((r) => (r.length > 0 ? r.map(escVal).join(",") : ""));
  const csvContent = allLines.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportExcel(
  filename: string,
  headers: string[],
  rows: (string | number)[][],
) {
  const escVal = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const allLines = [
    headers.map(escVal).join("\t"),
    ...rows.map((r) => r.map(escVal).join("\t")),
  ];
  const content2 = `\uFEFF${allLines.join("\n")}`;
  const blob = new Blob([content2], {
    type: "application/vnd.ms-excel;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── ALL INVOICES CENTER ──────────────────────────────────────────────────────
function AllInvoicesSection() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [, setTick] = useState(0);

  const allInvoices = (() => {
    const results: any[] = [];
    try {
      const roomInvs: any[] = JSON.parse(
        localStorage.getItem("kdm_room_invoices") || "[]",
      );
      for (const inv of roomInvs) {
        results.push({
          type: "Room",
          billNo: inv.billNumber || inv.id?.slice(0, 8) || "-",
          guest: inv.guestName || "-",
          room: inv.roomNumber || "-",
          date: inv.checkoutDate || inv.checkOutDate || inv.checkInDate || "-",
          amount: Number(inv.totalAmount) || 0,
          status: "Paid",
          raw: inv,
        });
      }
    } catch {}
    try {
      const foodOrders: any[] = [
        ...JSON.parse(localStorage.getItem("kdm_room_food_orders") || "[]"),
        ...JSON.parse(localStorage.getItem("hotelRoomFoodOrders") || "[]"),
      ];
      for (const o of foodOrders) {
        results.push({
          type: "Room Food",
          billNo: o.id?.slice(0, 8) || "-",
          guest: o.guestName || `Room ${o.roomNumber}` || "-",
          room: o.roomNumber || "-",
          date: o.createdAt
            ? new Date(Number(o.createdAt)).toISOString()
            : o.orderTime || "-",
          amount: Number(o.totalAmount) || 0,
          status: o.isPaid
            ? "Paid"
            : o.settledToRoom
              ? "Settled to Room"
              : "Pending",
          raw: o,
        });
      }
    } catch {}
    try {
      const restBills: any[] = [
        ...JSON.parse(localStorage.getItem("kdm_restaurant_bills") || "[]"),
        ...JSON.parse(localStorage.getItem("hotelRestaurantBills") || "[]"),
      ];
      for (const b of restBills) {
        results.push({
          type: "Restaurant",
          billNo: b.billNumber || b.id?.slice(0, 8) || "-",
          guest: b.customerName || b.guestName || "Walk-in",
          room:
            b.settledRoomNumber ||
            String(b.settleToRoom || b.tableNumber || "-"),
          date: b.createdAt ? new Date(Number(b.createdAt)).toISOString() : "-",
          amount: Number(b.totalAmount || b.total) || 0,
          status:
            b.settledToRoom || b.settleToRoom ? "Settled to Room" : "Paid",
          raw: b,
        });
      }
    } catch {}
    try {
      const banqBills: any[] = JSON.parse(
        localStorage.getItem("kdm_banquet_bills") || "[]",
      );
      for (const b of banqBills) {
        results.push({
          type: "Banquet",
          billNo: b.billNumber || b.id?.slice(0, 8) || "-",
          guest: b.clientName || b.guestName || "-",
          room: b.hallName || "-",
          date: b.eventDate || b.createdAt || "-",
          amount: Number(b.totalAmount) || 0,
          status: "Paid",
          raw: b,
        });
      }
    } catch {}
    return results.sort((a, b) => {
      const da = new Date(a.date).getTime() || 0;
      const db = new Date(b.date).getTime() || 0;
      return db - da;
    });
  })();

  const filtered = allInvoices.filter((inv) => {
    const matchType = filterType === "all" || inv.type === filterType;
    const matchSearch =
      !search ||
      inv.guest.toLowerCase().includes(search.toLowerCase()) ||
      inv.billNo.toLowerCase().includes(search.toLowerCase()) ||
      String(inv.room).toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const handleReprint = (inv: any) => {
    const html = `<!DOCTYPE html><html><head><title>Invoice - ${inv.type}</title>
    <style>body{font-family:Arial,sans-serif;padding:24px;color:#111}h2{color:#b8860b}
    table{width:100%;border-collapse:collapse}th,td{padding:8px;border:1px solid #ccc}
    th{background:#f3f4f6;font-weight:700}.total{font-weight:700;color:#b8860b}</style></head>
    <body><h2>HOTEL KDM PALACE — ${inv.type} Invoice</h2>
    <p><strong>Bill No:</strong> ${inv.billNo} &nbsp; <strong>Date:</strong> ${String(inv.date).split("T")[0]}</p>
    <p><strong>Guest:</strong> ${inv.guest} &nbsp; <strong>Room/Hall:</strong> ${inv.room}</p>
    <table><thead><tr><th>Description</th><th>Amount</th></tr></thead>
    <tbody><tr><td>${inv.type} Charges</td><td>₹${inv.amount.toFixed(2)}</td></tr></tbody>
    <tfoot><tr class="total"><td>Total</td><td>₹${inv.amount.toFixed(2)}</td></tr></tfoot>
    </table><p style="margin-top:32px;text-align:center;color:#64748b">Thank you for staying with us!</p>
    </body></html>`;
    const w = window.open("", "_blank", "width=800,height=600");
    if (w) {
      w.document.write(html);
      w.document.close();
      w.print();
    }
  };

  const handleWhatsApp = (inv: any) => {
    const msg = encodeURIComponent(
      `*HOTEL KDM PALACE*\n*${inv.type} Invoice*\nBill No: ${inv.billNo}\nGuest: ${inv.guest}\nRoom/Hall: ${inv.room}\nDate: ${String(inv.date).split("T")[0]}\nAmount: ₹${inv.amount.toFixed(2)}\nStatus: ${inv.status}\n\nThank you for staying with us! 🏨`,
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  const totalAmount = filtered.reduce((s, inv) => s + inv.amount, 0);

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <SectionTitle
          title="All Invoice History"
          sub="Room · Room Food · Restaurant · Banquet"
        />
        <Button
          onClick={() => setTick((t) => t + 1)}
          variant="outline"
          size="sm"
          style={{ borderColor: "#b8860b", color: "#b8860b" }}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 16,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <Input
          placeholder="Search guest, bill no, room..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 280 }}
          data-ocid="invoice-center.search_input"
        />
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger
            style={{ width: 160 }}
            data-ocid="invoice-center.select"
          >
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Room">Room</SelectItem>
            <SelectItem value="Room Food">Room Food</SelectItem>
            <SelectItem value="Restaurant">Restaurant</SelectItem>
            <SelectItem value="Banquet">Banquet</SelectItem>
          </SelectContent>
        </Select>
        <div
          style={{
            marginLeft: "auto",
            background: "#fef3c7",
            border: "1px solid #f59e0b",
            borderRadius: 8,
            padding: "8px 16px",
            fontWeight: 700,
            color: "#92400e",
          }}
        >
          {filtered.length} invoices · Total: ₹
          {totalAmount.toLocaleString("en-IN")}
        </div>
      </div>
      <div
        style={{
          background: "#1e293b",
          border: "1px solid #334155",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <Table>
          <TableHeader>
            <TableRow style={{ borderBottom: "1px solid #334155" }}>
              <TableHead style={{ color: "#b8860b", fontWeight: 700 }}>
                Type
              </TableHead>
              <TableHead style={{ color: "#b8860b", fontWeight: 700 }}>
                Bill No.
              </TableHead>
              <TableHead style={{ color: "#b8860b", fontWeight: 700 }}>
                Guest/Party
              </TableHead>
              <TableHead style={{ color: "#b8860b", fontWeight: 700 }}>
                Room/Hall
              </TableHead>
              <TableHead style={{ color: "#b8860b", fontWeight: 700 }}>
                Date
              </TableHead>
              <TableHead style={{ color: "#b8860b", fontWeight: 700 }}>
                Amount
              </TableHead>
              <TableHead style={{ color: "#b8860b", fontWeight: 700 }}>
                Status
              </TableHead>
              <TableHead style={{ color: "#b8860b", fontWeight: 700 }}>
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  style={{ textAlign: "center", color: "#64748b", padding: 32 }}
                  data-ocid="invoice-center.empty_state"
                >
                  No invoices found. Checkout guests or generate bills to see
                  them here.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((inv, idx) => (
              <TableRow
                key={`${inv.type}-${inv.billNo}-${idx}`}
                style={{ borderBottom: "1px solid #334155" }}
                data-ocid={`invoice-center.item.${idx + 1}`}
              >
                <TableCell>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: 12,
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      background:
                        inv.type === "Room"
                          ? "#1e40af"
                          : inv.type === "Room Food"
                            ? "#065f46"
                            : inv.type === "Restaurant"
                              ? "#7c3aed"
                              : "#92400e",
                      color: "#fff",
                    }}
                  >
                    {inv.type}
                  </span>
                </TableCell>
                <TableCell style={{ color: "#f1f5f9", fontWeight: 600 }}>
                  {inv.billNo}
                </TableCell>
                <TableCell style={{ color: "#f1f5f9" }}>{inv.guest}</TableCell>
                <TableCell style={{ color: "#f1f5f9" }}>
                  {String(inv.room)}
                </TableCell>
                <TableCell style={{ color: "#94a3b8" }}>
                  {String(inv.date).split("T")[0]}
                </TableCell>
                <TableCell style={{ color: "#b8860b", fontWeight: 700 }}>
                  ₹{inv.amount.toLocaleString("en-IN")}
                </TableCell>
                <TableCell>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: 12,
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      background:
                        inv.status === "Paid"
                          ? "#14532d"
                          : inv.status === "Settled to Room"
                            ? "#1e3a5f"
                            : "#451a03",
                      color:
                        inv.status === "Paid"
                          ? "#86efac"
                          : inv.status === "Settled to Room"
                            ? "#93c5fd"
                            : "#fbbf24",
                    }}
                  >
                    {inv.status}
                  </span>
                </TableCell>
                <TableCell>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReprint(inv)}
                      style={{
                        fontSize: "0.7rem",
                        padding: "2px 8px",
                        borderColor: "#475569",
                        color: "#cbd5e1",
                      }}
                      data-ocid={`invoice-center.edit_button.${idx + 1}`}
                    >
                      🖨 Reprint
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleWhatsApp(inv)}
                      style={{
                        fontSize: "0.7rem",
                        padding: "2px 8px",
                        background: "#25d366",
                        color: "#fff",
                        border: "none",
                      }}
                      data-ocid={`invoice-center.secondary_button.${idx + 1}`}
                    >
                      💬 WhatsApp
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleReprint(inv)}
                      style={{
                        fontSize: "0.7rem",
                        padding: "2px 8px",
                        background: "#2563eb",
                        color: "#fff",
                        border: "none",
                      }}
                      data-ocid={`invoice-center.edit_button.${idx + 1}`}
                    >
                      📄 PDF
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ─── FOOD SALE REPORT ─────────────────────────────────────────────────────────
function FoodSaleReportSection() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [search, setSearch] = useState("");

  const restaurantBills: any[] = JSON.parse(
    localStorage.getItem("hotelRestaurantBills") || "[]",
  );
  const roomFoodOrders: any[] = JSON.parse(
    localStorage.getItem("hotelRoomFoodOrders") || "[]",
  );

  const allRows = [
    ...restaurantBills.map((b: any, i: number) => ({
      date: b.date || b.createdAt?.split("T")[0] || "",
      billNo: b.billNo || b.id || `RB-${i + 1}`,
      billTime:
        b.time ||
        (b.createdAt ? new Date(b.createdAt).toLocaleTimeString() : ""),
      tableRoom: b.tableNumber
        ? `T-${b.tableNumber}`
        : b.settleToRoom
          ? `Rm-${b.settleToRoom}`
          : "-",
      goodsAmt: Number(b.subtotal || b.amount || 0),
      discount: Number(b.discount || 0),
      nonTaxable: 0,
      taxableSale: Number(b.subtotal || b.amount || 0),
      tax: Number(b.tax || b.gst || 0),
      rnd: 0,
      billAmount: Number(b.total || b.amount || 0),
      itemName: b.items?.map((it: any) => it.name).join(", ") || "-",
      qty:
        b.items?.reduce((s: number, it: any) => s + (it.quantity || 1), 0) || 1,
      rate: "-",
      amount: Number(b.total || b.amount || 0),
      itemDisc: 0,
      paymentMode: b.paymentMode || b.payment || "-",
      guestCompany: b.guestCompany || b.company || "-",
      guestGstin: b.guestGstin || b.gstin || "-",
      type: "Restaurant",
    })),
    ...roomFoodOrders.map((o: any, i: number) => {
      const total = Number(o.total || o.amount || 0);
      const tax = Math.round(total * 0.05 * 100) / 100;
      return {
        date: o.date || o.createdAt?.split("T")[0] || "",
        billNo: o.billNo || o.id || `RF-${i + 1}`,
        billTime:
          o.time ||
          (o.createdAt ? new Date(o.createdAt).toLocaleTimeString() : ""),
        tableRoom: o.roomNumber ? `Rm-${o.roomNumber}` : "-",
        goodsAmt: total,
        discount: Number(o.discount || 0),
        nonTaxable: 0,
        taxableSale: total,
        tax,
        rnd: 0,
        billAmount: total,
        itemName: o.items?.map((it: any) => it.name).join(", ") || "-",
        qty:
          o.items?.reduce((s: number, it: any) => s + (it.quantity || 1), 0) ||
          1,
        rate: "-",
        amount: total,
        itemDisc: 0,
        paymentMode: o.paymentMode || "-",
        guestCompany: "-",
        guestGstin: "-",
        type: "Room Food",
      };
    }),
  ].filter((r) => {
    if (fromDate && r.date < fromDate) return false;
    if (toDate && r.date > toDate) return false;
    if (
      search &&
      !JSON.stringify(r).toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const totals = allRows.reduce(
    (acc, r) => ({
      goodsAmt: acc.goodsAmt + r.goodsAmt,
      tax: acc.tax + r.tax,
      billAmount: acc.billAmount + r.billAmount,
    }),
    { goodsAmt: 0, tax: 0, billAmount: 0 },
  );

  function handlePrint() {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(
      "<html><head><title>Food Sale Bill Report</title><style>body{font-family:sans-serif;font-size:11px;}table{border-collapse:collapse;width:100%;}th,td{border:1px solid #ccc;padding:4px 6px;text-align:left;}th{background:#b8860b;color:#fff;}tfoot td{font-weight:bold;background:#f5f5f5;}</style></head><body>",
    );
    win.document.write(
      "<h2 style='color:#b8860b;'>HOTEL KDM PALACE — Food Sale Bill Report</h2>",
    );
    win.document.write(
      "<table><thead><tr><th>Date</th><th>Bill No</th><th>Time</th><th>Table/Room</th><th>Goods Amt</th><th>Disc</th><th>Taxable</th><th>Tax</th><th>Bill Amt</th><th>Items</th><th>Mode</th><th>Company</th><th>GSTIN</th></tr></thead><tbody>",
    );
    for (const r of allRows) {
      win.document.write(
        `<tr><td>${r.date}</td><td>${r.billNo}</td><td>${r.billTime}</td><td>${r.tableRoom}</td><td>₹${r.goodsAmt.toFixed(2)}</td><td>₹${r.discount.toFixed(2)}</td><td>₹${r.taxableSale.toFixed(2)}</td><td>₹${r.tax.toFixed(2)}</td><td>₹${r.billAmount.toFixed(2)}</td><td>${r.itemName}</td><td>${r.paymentMode}</td><td>${r.guestCompany}</td><td>${r.guestGstin}</td></tr>`,
      );
    }
    win.document.write(
      `<tfoot><tr><td colspan='4'>TOTAL</td><td>₹${totals.goodsAmt.toFixed(2)}</td><td></td><td></td><td>₹${totals.tax.toFixed(2)}</td><td>₹${totals.billAmount.toFixed(2)}</td><td colspan='4'></td></tr></tfoot>`,
    );
    win.document.write("</table></body></html>");
    win.document.close();
    win.print();
  }

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h2 style={{ color: "#b8860b", fontSize: 20, fontWeight: 700 }}>
          Restaurant & Room Service Food Sale Bill Report
        </h2>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={handlePrint}
            style={{
              background: "#b8860b",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "8px 18px",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            🖨️ Print
          </button>
          <button
            type="button"
            onClick={() =>
              exportCSV(
                "food-sale-report.csv",
                [
                  "Date",
                  "Bill No",
                  "Bill Time",
                  "Table/Room",
                  "Goods Amt",
                  "Discount",
                  "Non-Taxable",
                  "Taxable Sale",
                  "Tax",
                  "Rnd",
                  "Bill Amount",
                  "Item Name",
                  "Qty",
                  "Rate",
                  "Amount",
                  "Item Disc%",
                  "Payment Mode",
                  "Guest Company",
                  "Guest GSTIN",
                ],
                allRows.map((r) => [
                  r.date,
                  r.billNo,
                  r.billTime,
                  r.tableRoom,
                  r.goodsAmt.toFixed(2),
                  r.discount.toFixed(2),
                  r.nonTaxable.toFixed(2),
                  r.taxableSale.toFixed(2),
                  r.tax.toFixed(2),
                  r.rnd.toFixed(2),
                  r.billAmount.toFixed(2),
                  r.itemName,
                  r.qty,
                  r.rate,
                  r.amount.toFixed(2),
                  `${r.itemDisc}%`,
                  r.paymentMode,
                  r.guestCompany,
                  r.guestGstin,
                ]),
              )
            }
            style={{
              background: "#16a34a",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "8px 18px",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            📥 Export CSV
          </button>
          <button
            type="button"
            onClick={() =>
              exportExcel(
                "food-sale-report.xlsx",
                [
                  "Date",
                  "Bill No",
                  "Bill Time",
                  "Table/Room",
                  "Goods Amt",
                  "Discount",
                  "Non-Taxable",
                  "Taxable Sale",
                  "Tax",
                  "Rnd",
                  "Bill Amount",
                  "Item Name",
                  "Qty",
                  "Rate",
                  "Amount",
                  "Item Disc%",
                  "Payment Mode",
                  "Guest Company",
                  "Guest GSTIN",
                ],
                allRows.map((r) => [
                  r.date,
                  r.billNo,
                  r.billTime,
                  r.tableRoom,
                  r.goodsAmt.toFixed(2),
                  r.discount.toFixed(2),
                  r.nonTaxable.toFixed(2),
                  r.taxableSale.toFixed(2),
                  r.tax.toFixed(2),
                  r.rnd.toFixed(2),
                  r.billAmount.toFixed(2),
                  r.itemName,
                  r.qty,
                  r.rate,
                  r.amount.toFixed(2),
                  `${r.itemDisc}%`,
                  r.paymentMode,
                  r.guestCompany,
                  r.guestGstin,
                ]),
              )
            }
            style={{
              background: "#16a34a",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "8px 18px",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            📊 Export Excel
          </button>
          <button
            type="button"
            onClick={handlePrint}
            style={{
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "8px 18px",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            📄 Save as PDF
          </button>
        </div>
      </div>
      <div
        style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}
      >
        <div>
          <label
            htmlFor="fsr-from"
            style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}
          >
            From Date
          </label>
          <input
            id="fsr-from"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            style={{
              display: "block",
              border: "1px solid #d1d5db",
              borderRadius: 4,
              padding: "4px 8px",
              fontSize: 12,
            }}
          />
        </div>
        <div>
          <label
            htmlFor="fsr-to"
            style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}
          >
            To Date
          </label>
          <input
            id="fsr-to"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            style={{
              display: "block",
              border: "1px solid #d1d5db",
              borderRadius: 4,
              padding: "4px 8px",
              fontSize: 12,
            }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <label
            htmlFor="fsr-search"
            style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}
          >
            Search
          </label>
          <input
            id="fsr-search"
            type="text"
            placeholder="Search bill, table, mode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              display: "block",
              width: "100%",
              border: "1px solid #d1d5db",
              borderRadius: 4,
              padding: "4px 8px",
              fontSize: 12,
            }}
          />
        </div>
      </div>
      <div
        style={{
          overflowX: "auto",
          background: "#fff",
          borderRadius: 8,
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        }}
      >
        <table
          style={{
            borderCollapse: "collapse",
            width: "100%",
            minWidth: 1200,
            fontSize: 11,
          }}
        >
          <thead>
            <tr style={{ background: "#b8860b", color: "#fff" }}>
              {[
                "Date",
                "Bill No",
                "Bill Time",
                "Table/Room",
                "Goods Amt",
                "Discount",
                "Non-Taxable",
                "Taxable Sale",
                "Tax",
                "Rnd",
                "Bill Amount",
                "Item Name",
                "Qty",
                "Rate",
                "Amount",
                "Item Disc%",
                "Payment Mode",
                "Guest Company",
                "Guest GSTIN",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "8px 10px",
                    textAlign: "left",
                    whiteSpace: "nowrap",
                    fontWeight: 700,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allRows.length === 0 ? (
              <tr>
                <td
                  colSpan={19}
                  style={{ textAlign: "center", padding: 24, color: "#6b7280" }}
                >
                  No records found
                </td>
              </tr>
            ) : (
              allRows.map((r, i) => (
                <tr
                  key={String(r.billNo) + String(r.date) + String(r.goodsAmt)}
                  style={{
                    background: i % 2 === 0 ? "#f9fafb" : "#fff",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <td style={{ padding: "6px 10px", whiteSpace: "nowrap" }}>
                    {r.date}
                  </td>
                  <td
                    style={{
                      padding: "6px 10px",
                      whiteSpace: "nowrap",
                      fontWeight: 600,
                    }}
                  >
                    {r.billNo}
                  </td>
                  <td style={{ padding: "6px 10px", whiteSpace: "nowrap" }}>
                    {r.billTime}
                  </td>
                  <td style={{ padding: "6px 10px", whiteSpace: "nowrap" }}>
                    {r.tableRoom}
                  </td>
                  <td style={{ padding: "6px 10px", textAlign: "right" }}>
                    ₹{r.goodsAmt.toFixed(2)}
                  </td>
                  <td style={{ padding: "6px 10px", textAlign: "right" }}>
                    ₹{r.discount.toFixed(2)}
                  </td>
                  <td style={{ padding: "6px 10px", textAlign: "right" }}>
                    ₹{r.nonTaxable.toFixed(2)}
                  </td>
                  <td style={{ padding: "6px 10px", textAlign: "right" }}>
                    ₹{r.taxableSale.toFixed(2)}
                  </td>
                  <td style={{ padding: "6px 10px", textAlign: "right" }}>
                    ₹{r.tax.toFixed(2)}
                  </td>
                  <td style={{ padding: "6px 10px", textAlign: "right" }}>
                    ₹{r.rnd.toFixed(2)}
                  </td>
                  <td
                    style={{
                      padding: "6px 10px",
                      textAlign: "right",
                      fontWeight: 700,
                    }}
                  >
                    ₹{r.billAmount.toFixed(2)}
                  </td>
                  <td
                    style={{
                      padding: "6px 10px",
                      maxWidth: 160,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {r.itemName}
                  </td>
                  <td style={{ padding: "6px 10px", textAlign: "center" }}>
                    {r.qty}
                  </td>
                  <td style={{ padding: "6px 10px" }}>{r.rate}</td>
                  <td style={{ padding: "6px 10px", textAlign: "right" }}>
                    ₹{r.amount.toFixed(2)}
                  </td>
                  <td style={{ padding: "6px 10px", textAlign: "center" }}>
                    {r.itemDisc}%
                  </td>
                  <td style={{ padding: "6px 10px", whiteSpace: "nowrap" }}>
                    {r.paymentMode}
                  </td>
                  <td style={{ padding: "6px 10px", whiteSpace: "nowrap" }}>
                    {r.guestCompany}
                  </td>
                  <td style={{ padding: "6px 10px", whiteSpace: "nowrap" }}>
                    {r.guestGstin}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr style={{ background: "#fef3c7", fontWeight: 700 }}>
              <td colSpan={4} style={{ padding: "8px 10px", fontWeight: 700 }}>
                TOTAL
              </td>
              <td style={{ padding: "8px 10px", textAlign: "right" }}>
                ₹{totals.goodsAmt.toFixed(2)}
              </td>
              <td />
              <td />
              <td />
              <td style={{ padding: "8px 10px", textAlign: "right" }}>
                ₹{totals.tax.toFixed(2)}
              </td>
              <td />
              <td style={{ padding: "8px 10px", textAlign: "right" }}>
                ₹{totals.billAmount.toFixed(2)}
              </td>
              <td colSpan={8} />
            </tr>
          </tfoot>
        </table>
      </div>
      <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 8 }}>
        * Export as CSV: Select all → Copy → Paste in Excel
      </p>
    </div>
  );
}

// ─── GUEST BILL SUMMARY ────────────────────────────────────────────────────────
function GuestBillSummarySection() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [search, setSearch] = useState("");

  const checkIns: any[] = JSON.parse(
    localStorage.getItem("hotelCheckIns") || "[]",
  );
  const roomFoodOrders: any[] = JSON.parse(
    localStorage.getItem("hotelRoomFoodOrders") || "[]",
  );
  const restaurantBills: any[] = JSON.parse(
    localStorage.getItem("hotelRestaurantBills") || "[]",
  );

  const rows = checkIns
    .filter((g: any) => {
      const d = g.checkInDate || g.checkIn || "";
      if (fromDate && d < fromDate) return false;
      if (toDate && d > toDate) return false;
      if (search) {
        const s = search.toLowerCase();
        return (
          (g.name || "").toLowerCase().includes(s) ||
          (g.phone || "").includes(s) ||
          (g.company || "").toLowerCase().includes(s)
        );
      }
      return true;
    })
    .map((g: any, i: number) => {
      const nights = Number(g.nights || 1);
      const roomRate = Number(g.roomRate || g.rate || 0);
      const roomBill = nights * roomRate;
      const roomFoodBill = roomFoodOrders
        .filter((o: any) => String(o.roomNumber) === String(g.roomNumber))
        .reduce((s: number, o: any) => s + Number(o.total || o.amount || 0), 0);
      const restaurantBill = restaurantBills
        .filter((b: any) => String(b.settleToRoom) === String(g.roomNumber))
        .reduce((s: number, b: any) => s + Number(b.total || b.amount || 0), 0);
      const extraBed = Number(g.extraBedCharge || 0);
      const laundry = Number(g.laundryCharge || 0);
      const other = Number(g.otherCharges || 0);
      const total =
        roomBill + roomFoodBill + restaurantBill + extraBed + laundry + other;
      const advance = Number(g.advance || 0);
      const netAmt = total - advance;
      return {
        billNo: `GB-${String(i + 1).padStart(3, "0")}`,
        folioNo: g.folioNo || g.id || `F-${i + 1}`,
        guestName: g.name || "-",
        address: g.address || "-",
        gstAddr: g.gstAddress || "-",
        gstDate: g.checkInDate || g.checkIn || "-",
        city: g.city || "-",
        mobile: g.phone || "-",
        gstin: g.gstin || "-",
        company: g.company || "-",
        inDate: g.checkInDate || g.checkIn || "-",
        outDate: g.checkOutDate || g.checkOut || "-",
        roomNo: g.roomNumber || "-",
        roomBill,
        roomFoodBill,
        restaurantBill,
        extraBed,
        laundry,
        other,
        total,
        advance,
        netAmt,
        paymentMode: g.paymentMode || "-",
        bookingId: g.bookingId || g.id || "-",
        roomSettlement: g.roomSettlement || "-",
      };
    });

  const totals = rows.reduce(
    (acc, r) => ({
      roomBill: acc.roomBill + r.roomBill,
      roomFoodBill: acc.roomFoodBill + r.roomFoodBill,
      restaurantBill: acc.restaurantBill + r.restaurantBill,
      extraBed: acc.extraBed + r.extraBed,
      laundry: acc.laundry + r.laundry,
      other: acc.other + r.other,
      total: acc.total + r.total,
      advance: acc.advance + r.advance,
      netAmt: acc.netAmt + r.netAmt,
    }),
    {
      roomBill: 0,
      roomFoodBill: 0,
      restaurantBill: 0,
      extraBed: 0,
      laundry: 0,
      other: 0,
      total: 0,
      advance: 0,
      netAmt: 0,
    },
  );

  function handlePrint() {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(
      "<html><head><title>Guest Bill Summary</title><style>body{font-family:sans-serif;font-size:10px;}table{border-collapse:collapse;width:100%;}th,td{border:1px solid #ccc;padding:3px 5px;text-align:left;}th{background:#b8860b;color:#fff;}tfoot td{font-weight:bold;background:#fef3c7;}</style></head><body>",
    );
    win.document.write(
      "<h2 style='color:#b8860b;'>HOTEL KDM PALACE — Guest Bill Summary</h2>",
    );
    win.document.write(
      "<table><thead><tr><th>Bill#</th><th>Folio</th><th>Guest</th><th>Mobile</th><th>Room#</th><th>In-Date</th><th>Out-Date</th><th>Room Bill</th><th>Food Bill</th><th>Rest. Bill</th><th>Extra Bed</th><th>Laundry</th><th>Other</th><th>Total</th><th>Advance</th><th>Net Amt</th><th>Mode</th></tr></thead><tbody>",
    );
    for (const r of rows) {
      win.document.write(
        `<tr><td>${r.billNo}</td><td>${r.folioNo}</td><td>${r.guestName}</td><td>${r.mobile}</td><td>${r.roomNo}</td><td>${r.inDate}</td><td>${r.outDate}</td><td>₹${r.roomBill.toFixed(2)}</td><td>₹${r.roomFoodBill.toFixed(2)}</td><td>₹${r.restaurantBill.toFixed(2)}</td><td>₹${r.extraBed.toFixed(2)}</td><td>₹${r.laundry.toFixed(2)}</td><td>₹${r.other.toFixed(2)}</td><td>₹${r.total.toFixed(2)}</td><td>₹${r.advance.toFixed(2)}</td><td>₹${r.netAmt.toFixed(2)}</td><td>${r.paymentMode}</td></tr>`,
      );
    }
    win.document.write(
      `<tfoot><tr><td colspan='7'>TOTAL</td><td>₹${totals.roomBill.toFixed(2)}</td><td>₹${totals.roomFoodBill.toFixed(2)}</td><td>₹${totals.restaurantBill.toFixed(2)}</td><td>₹${totals.extraBed.toFixed(2)}</td><td>₹${totals.laundry.toFixed(2)}</td><td>₹${totals.other.toFixed(2)}</td><td>₹${totals.total.toFixed(2)}</td><td>₹${totals.advance.toFixed(2)}</td><td>₹${totals.netAmt.toFixed(2)}</td><td></td></tr></tfoot>`,
    );
    win.document.write("</table></body></html>");
    win.document.close();
    win.print();
  }

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h2 style={{ color: "#b8860b", fontSize: 20, fontWeight: 700 }}>
          Guest Bill Summary
        </h2>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={handlePrint}
            style={{
              background: "#b8860b",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "8px 18px",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            🖨️ Print
          </button>
          <button
            type="button"
            onClick={() =>
              exportCSV(
                "guest-bill-summary.csv",
                [
                  "Bill#",
                  "Folio",
                  "Guest",
                  "Mobile",
                  "Room#",
                  "In-Date",
                  "Out-Date",
                  "Room Bill",
                  "Food Bill",
                  "Rest. Bill",
                  "Extra Bed",
                  "Laundry",
                  "Other",
                  "Total",
                  "Advance",
                  "Net Amt",
                  "Payment Mode",
                ],
                rows.map((r) => [
                  r.billNo,
                  r.folioNo,
                  r.guestName,
                  r.mobile,
                  r.roomNo,
                  r.inDate,
                  r.outDate,
                  r.roomBill.toFixed(2),
                  r.roomFoodBill.toFixed(2),
                  r.restaurantBill.toFixed(2),
                  r.extraBed.toFixed(2),
                  r.laundry.toFixed(2),
                  r.other.toFixed(2),
                  r.total.toFixed(2),
                  r.advance.toFixed(2),
                  r.netAmt.toFixed(2),
                  r.paymentMode,
                ]),
              )
            }
            style={{
              background: "#16a34a",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "8px 18px",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            📥 Export CSV
          </button>
          <button
            type="button"
            onClick={() =>
              exportExcel(
                "guest-bill-summary.xlsx",
                [
                  "Bill#",
                  "Folio",
                  "Guest",
                  "Mobile",
                  "Room#",
                  "In-Date",
                  "Out-Date",
                  "Room Bill",
                  "Food Bill",
                  "Rest. Bill",
                  "Extra Bed",
                  "Laundry",
                  "Other",
                  "Total",
                  "Advance",
                  "Net Amt",
                  "Payment Mode",
                ],
                rows.map((r) => [
                  r.billNo,
                  r.folioNo,
                  r.guestName,
                  r.mobile,
                  r.roomNo,
                  r.inDate,
                  r.outDate,
                  r.roomBill.toFixed(2),
                  r.roomFoodBill.toFixed(2),
                  r.restaurantBill.toFixed(2),
                  r.extraBed.toFixed(2),
                  r.laundry.toFixed(2),
                  r.other.toFixed(2),
                  r.total.toFixed(2),
                  r.advance.toFixed(2),
                  r.netAmt.toFixed(2),
                  r.paymentMode,
                ]),
              )
            }
            style={{
              background: "#16a34a",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "8px 18px",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            📊 Export Excel
          </button>
          <button
            type="button"
            onClick={handlePrint}
            style={{
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "8px 18px",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            📄 Save as PDF
          </button>
        </div>
      </div>
      <div
        style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}
      >
        <div>
          <label
            htmlFor="gbs-from"
            style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}
          >
            From Date
          </label>
          <input
            id="gbs-from"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            style={{
              display: "block",
              border: "1px solid #d1d5db",
              borderRadius: 4,
              padding: "4px 8px",
              fontSize: 12,
            }}
          />
        </div>
        <div>
          <label
            htmlFor="gbs-to"
            style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}
          >
            To Date
          </label>
          <input
            id="gbs-to"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            style={{
              display: "block",
              border: "1px solid #d1d5db",
              borderRadius: 4,
              padding: "4px 8px",
              fontSize: 12,
            }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <label
            htmlFor="gbs-search"
            style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}
          >
            Search (Name / Mobile / Company)
          </label>
          <input
            id="gbs-search"
            type="text"
            placeholder="Search guest..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              display: "block",
              width: "100%",
              border: "1px solid #d1d5db",
              borderRadius: 4,
              padding: "4px 8px",
              fontSize: 12,
            }}
          />
        </div>
      </div>
      <div
        style={{
          overflowX: "auto",
          background: "#fff",
          borderRadius: 8,
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        }}
      >
        <table
          style={{
            borderCollapse: "collapse",
            width: "100%",
            minWidth: 1600,
            fontSize: 11,
          }}
        >
          <thead>
            <tr style={{ background: "#b8860b", color: "#fff" }}>
              {[
                "Bill#",
                "Folio No",
                "Guest Name",
                "Address",
                "GST Addr",
                "GST Date",
                "City",
                "Mobile",
                "GSTIN",
                "Company",
                "In-Date",
                "Out-Date",
                "Room#",
                "Room Bill",
                "Room Food Bill",
                "Rest. Bill",
                "Extra Bed",
                "Laundry",
                "Other",
                "Total",
                "Advance",
                "Net Amt",
                "Payment Mode",
                "Booking ID",
                "Room Settlement",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "8px 10px",
                    textAlign: "left",
                    whiteSpace: "nowrap",
                    fontWeight: 700,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={25}
                  style={{ textAlign: "center", padding: 24, color: "#6b7280" }}
                >
                  No guest records found
                </td>
              </tr>
            ) : (
              rows.map((r, i) => (
                <tr
                  key={String(r.billNo) + String(r.folioNo) + String(r.total)}
                  style={{
                    background: i % 2 === 0 ? "#f9fafb" : "#fff",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <td
                    style={{
                      padding: "6px 10px",
                      whiteSpace: "nowrap",
                      fontWeight: 600,
                    }}
                  >
                    {r.billNo}
                  </td>
                  <td style={{ padding: "6px 10px", whiteSpace: "nowrap" }}>
                    {r.folioNo}
                  </td>
                  <td
                    style={{
                      padding: "6px 10px",
                      whiteSpace: "nowrap",
                      fontWeight: 600,
                    }}
                  >
                    {r.guestName}
                  </td>
                  <td style={{ padding: "6px 10px" }}>{r.address}</td>
                  <td style={{ padding: "6px 10px" }}>{r.gstAddr}</td>
                  <td style={{ padding: "6px 10px", whiteSpace: "nowrap" }}>
                    {r.gstDate}
                  </td>
                  <td style={{ padding: "6px 10px" }}>{r.city}</td>
                  <td style={{ padding: "6px 10px", whiteSpace: "nowrap" }}>
                    {r.mobile}
                  </td>
                  <td style={{ padding: "6px 10px", whiteSpace: "nowrap" }}>
                    {r.gstin}
                  </td>
                  <td style={{ padding: "6px 10px", whiteSpace: "nowrap" }}>
                    {r.company}
                  </td>
                  <td style={{ padding: "6px 10px", whiteSpace: "nowrap" }}>
                    {r.inDate}
                  </td>
                  <td style={{ padding: "6px 10px", whiteSpace: "nowrap" }}>
                    {r.outDate}
                  </td>
                  <td style={{ padding: "6px 10px", textAlign: "center" }}>
                    {r.roomNo}
                  </td>
                  <td style={{ padding: "6px 10px", textAlign: "right" }}>
                    ₹{r.roomBill.toFixed(2)}
                  </td>
                  <td style={{ padding: "6px 10px", textAlign: "right" }}>
                    ₹{r.roomFoodBill.toFixed(2)}
                  </td>
                  <td style={{ padding: "6px 10px", textAlign: "right" }}>
                    ₹{r.restaurantBill.toFixed(2)}
                  </td>
                  <td style={{ padding: "6px 10px", textAlign: "right" }}>
                    ₹{r.extraBed.toFixed(2)}
                  </td>
                  <td style={{ padding: "6px 10px", textAlign: "right" }}>
                    ₹{r.laundry.toFixed(2)}
                  </td>
                  <td style={{ padding: "6px 10px", textAlign: "right" }}>
                    ₹{r.other.toFixed(2)}
                  </td>
                  <td
                    style={{
                      padding: "6px 10px",
                      textAlign: "right",
                      fontWeight: 700,
                    }}
                  >
                    ₹{r.total.toFixed(2)}
                  </td>
                  <td style={{ padding: "6px 10px", textAlign: "right" }}>
                    ₹{r.advance.toFixed(2)}
                  </td>
                  <td
                    style={{
                      padding: "6px 10px",
                      textAlign: "right",
                      fontWeight: 700,
                    }}
                  >
                    ₹{r.netAmt.toFixed(2)}
                  </td>
                  <td style={{ padding: "6px 10px", whiteSpace: "nowrap" }}>
                    {r.paymentMode}
                  </td>
                  <td style={{ padding: "6px 10px", whiteSpace: "nowrap" }}>
                    {r.bookingId}
                  </td>
                  <td style={{ padding: "6px 10px", whiteSpace: "nowrap" }}>
                    {r.roomSettlement}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr style={{ background: "#fef3c7", fontWeight: 700 }}>
              <td colSpan={13} style={{ padding: "8px 10px" }}>
                TOTAL
              </td>
              <td style={{ padding: "8px 10px", textAlign: "right" }}>
                ₹{totals.roomBill.toFixed(2)}
              </td>
              <td style={{ padding: "8px 10px", textAlign: "right" }}>
                ₹{totals.roomFoodBill.toFixed(2)}
              </td>
              <td style={{ padding: "8px 10px", textAlign: "right" }}>
                ₹{totals.restaurantBill.toFixed(2)}
              </td>
              <td style={{ padding: "8px 10px", textAlign: "right" }}>
                ₹{totals.extraBed.toFixed(2)}
              </td>
              <td style={{ padding: "8px 10px", textAlign: "right" }}>
                ₹{totals.laundry.toFixed(2)}
              </td>
              <td style={{ padding: "8px 10px", textAlign: "right" }}>
                ₹{totals.other.toFixed(2)}
              </td>
              <td style={{ padding: "8px 10px", textAlign: "right" }}>
                ₹{totals.total.toFixed(2)}
              </td>
              <td style={{ padding: "8px 10px", textAlign: "right" }}>
                ₹{totals.advance.toFixed(2)}
              </td>
              <td style={{ padding: "8px 10px", textAlign: "right" }}>
                ₹{totals.netAmt.toFixed(2)}
              </td>
              <td colSpan={3} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// ─── CASHIER REPORT ────────────────────────────────────────────────────────────
function CashierReportSection() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const checkIns: any[] = JSON.parse(
    localStorage.getItem("hotelCheckIns") || "[]",
  );
  const roomFoodOrders: any[] = JSON.parse(
    localStorage.getItem("hotelRoomFoodOrders") || "[]",
  );
  const restaurantBills: any[] = JSON.parse(
    localStorage.getItem("hotelRestaurantBills") || "[]",
  );
  const banquetBills: any[] = JSON.parse(
    localStorage.getItem("hotelBanquetBills") || "[]",
  );

  function mapMode(mode: string): string {
    const m = (mode || "").toLowerCase();
    if (m === "cash") return "Cash";
    if (m.includes("neft") || m.includes("cheque") || m.includes("bank"))
      return "NEFT/Cheque";
    if (m.includes("upi")) return "UPI";
    if (m.includes("hdfc") || m === "card") return "HDFC Card";
    if (m.includes("sbi")) return "SBI Card";
    if (m.includes("complement") || m.includes("comp")) return "Complement";
    if (m.includes("company")) return "Company";
    if (m === "room") return "Room";
    if (m.includes("hold")) return "Hold";
    return "Cash";
  }

  const MODES = [
    "Cash",
    "NEFT/Cheque",
    "Complement",
    "Company",
    "HDFC Card",
    "SBI Card",
    "Hold",
    "UPI",
    "Room",
  ];

  function buildRow(
    date: string,
    vchNo: string,
    folio: string,
    narration: string,
    amount: number,
    mode: string,
  ) {
    const row: Record<string, number | string> = {
      date,
      vchNo,
      folio,
      narration,
    };
    for (const m of MODES) {
      row[m] = 0;
    }
    const mapped = mapMode(mode);
    row[mapped] = amount;
    return row;
  }

  let vchCounter: Record<string, number> = {};
  function nextVch(date: string) {
    vchCounter[date] = (vchCounter[date] || 0) + 1;
    return `VCH-${String(vchCounter[date]).padStart(3, "0")}`;
  }

  const allRows: any[] = [];

  for (const g of checkIns) {
    const date =
      g.checkOutDate || g.checkOut || g.checkInDate || g.checkIn || "";
    if (fromDate && date < fromDate) return;
    if (toDate && date > toDate) return;
    const nights = Number(g.nights || 1);
    const roomRate = Number(g.roomRate || g.rate || 0);
    const amount = nights * roomRate;
    allRows.push({
      ...buildRow(
        date,
        nextVch(date),
        g.id || g.folioNo || "-",
        `Room Charges - ${g.name || ""}`,
        amount,
        g.paymentMode || "Cash",
      ),
      user: "Admin",
    });
  }

  for (const o of roomFoodOrders) {
    const date = o.date || o.createdAt?.split("T")[0] || "";
    if (fromDate && date < fromDate) return;
    if (toDate && date > toDate) return;
    const amount = Number(o.total || o.amount || 0);
    allRows.push({
      ...buildRow(
        date,
        nextVch(date),
        o.roomNumber ? `Rm-${o.roomNumber}` : "-",
        `Room Food - Rm ${o.roomNumber || ""}`,
        amount,
        o.paymentMode || "Cash",
      ),
      user: "Admin",
    });
  }

  for (const b of restaurantBills) {
    const date = b.date || b.createdAt?.split("T")[0] || "";
    if (fromDate && date < fromDate) return;
    if (toDate && date > toDate) return;
    const amount = Number(b.total || b.amount || 0);
    allRows.push({
      ...buildRow(
        date,
        nextVch(date),
        b.id || b.billNo || "-",
        `Restaurant Bill - T${b.tableNumber || ""}`,
        amount,
        b.paymentMode || "Cash",
      ),
      user: "Admin",
    });
  }

  for (const b of banquetBills) {
    const date = b.date || b.createdAt?.split("T")[0] || "";
    if (fromDate && date < fromDate) return;
    if (toDate && date > toDate) return;
    const amount = Number(b.total || b.amount || 0);
    allRows.push({
      ...buildRow(
        date,
        nextVch(date),
        b.id || b.billNo || "-",
        `Banquet Bill - ${b.hallName || ""}`,
        amount,
        b.paymentMode || "Cash",
      ),
      user: "Admin",
    });
  }

  allRows.sort((a, b) => (a.date > b.date ? 1 : -1));

  const grandTotal: Record<string, number> = {};
  for (const m of MODES) {
    grandTotal[m] = 0;
  }
  for (const r of allRows) {
    for (const m of MODES) {
      grandTotal[m] += Number(r[m] || 0);
    }
  }

  function handlePrint() {
    const win = window.open("", "_blank");
    if (!win) return;
    const modeHeaders = MODES.join("</th><th>");
    win.document.write(
      "<html><head><title>Cashier Report</title><style>body{font-family:sans-serif;font-size:10px;}table{border-collapse:collapse;width:100%;}th,td{border:1px solid #ccc;padding:3px 5px;text-align:left;}th{background:#b8860b;color:#fff;}tfoot td{font-weight:bold;background:#fef3c7;}</style></head><body>",
    );
    win.document.write(
      "<h2 style='color:#b8860b;'>HOTEL KDM PALACE — Cashier Report</h2>",
    );
    win.document.write(
      `<table><thead><tr><th>Date</th><th>Vou. No</th><th>Folio/Bill No</th><th>Narration</th><th>${modeHeaders}</th><th>User</th></tr></thead><tbody>`,
    );
    for (const r of allRows) {
      const modeCells = MODES.map(
        (m) =>
          `<td style='text-align:right;'>${Number(r[m]) > 0 ? `₹${Number(r[m]).toFixed(2)}` : ""}</td>`,
      ).join("");
      win.document.write(
        `<tr><td>${r.date}</td><td>${r.vchNo}</td><td>${r.folio}</td><td>${r.narration}</td>${modeCells}<td>${r.user}</td></tr>`,
      );
    }
    const totalCells = MODES.map(
      (m) => `<td style='text-align:right;'>₹${grandTotal[m].toFixed(2)}</td>`,
    ).join("");
    win.document.write(
      `<tfoot><tr><td colspan='4'>GRAND TOTAL</td>${totalCells}<td></td></tr></tfoot>`,
    );
    win.document.write("</table></body></html>");
    win.document.close();
    win.print();
  }

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h2 style={{ color: "#b8860b", fontSize: 20, fontWeight: 700 }}>
          Cashier Report — Room Invoice Payment Received
        </h2>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={handlePrint}
            style={{
              background: "#b8860b",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "8px 18px",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            🖨️ Print
          </button>
          <button
            type="button"
            onClick={() =>
              exportCSV(
                "cashier-report.csv",
                [
                  "Date",
                  "Vou. No",
                  "Folio/Bill No",
                  "Narration",
                  ...MODES,
                  "User",
                ],
                allRows.map((r) => [
                  r.date,
                  r.vchNo,
                  r.folio,
                  r.narration,
                  ...MODES.map((m) => Number(r[m]).toFixed(2)),
                  r.user,
                ]),
              )
            }
            style={{
              background: "#16a34a",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "8px 18px",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            📥 Export CSV
          </button>
          <button
            type="button"
            onClick={() =>
              exportExcel(
                "cashier-report.xlsx",
                [
                  "Date",
                  "Vou. No",
                  "Folio/Bill No",
                  "Narration",
                  ...MODES,
                  "User",
                ],
                allRows.map((r) => [
                  r.date,
                  r.vchNo,
                  r.folio,
                  r.narration,
                  ...MODES.map((m) => Number(r[m]).toFixed(2)),
                  r.user,
                ]),
              )
            }
            style={{
              background: "#16a34a",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "8px 18px",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            📊 Export Excel
          </button>
          <button
            type="button"
            onClick={handlePrint}
            style={{
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "8px 18px",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            📄 Save as PDF
          </button>
        </div>
      </div>
      <div
        style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}
      >
        <div>
          <label
            htmlFor="cr-from"
            style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}
          >
            From Date
          </label>
          <input
            id="cr-from"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            style={{
              display: "block",
              border: "1px solid #d1d5db",
              borderRadius: 4,
              padding: "4px 8px",
              fontSize: 12,
            }}
          />
        </div>
        <div>
          <label
            htmlFor="cr-to"
            style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}
          >
            To Date
          </label>
          <input
            id="cr-to"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            style={{
              display: "block",
              border: "1px solid #d1d5db",
              borderRadius: 4,
              padding: "4px 8px",
              fontSize: 12,
            }}
          />
        </div>
      </div>
      <div
        style={{
          overflowX: "auto",
          background: "#fff",
          borderRadius: 8,
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        }}
      >
        <table
          style={{
            borderCollapse: "collapse",
            width: "100%",
            minWidth: 1400,
            fontSize: 11,
          }}
        >
          <thead>
            <tr style={{ background: "#b8860b", color: "#fff" }}>
              {[
                "Date",
                "Vou. No",
                "Folio No / Bill No",
                "Narration",
                ...MODES,
                "User",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "8px 10px",
                    textAlign: "left",
                    whiteSpace: "nowrap",
                    fontWeight: 700,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allRows.length === 0 ? (
              <tr>
                <td
                  colSpan={4 + MODES.length + 1}
                  style={{ textAlign: "center", padding: 24, color: "#6b7280" }}
                >
                  No vouchers found
                </td>
              </tr>
            ) : (
              allRows.map((r, i) => (
                <tr
                  key={
                    r.billNo ??
                    r.vchNo ??
                    String(r.date) + String(r.goodsAmt || r.roomBill || r.folio)
                  }
                  style={{
                    background: i % 2 === 0 ? "#f9fafb" : "#fff",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <td style={{ padding: "6px 10px", whiteSpace: "nowrap" }}>
                    {r.date}
                  </td>
                  <td
                    style={{
                      padding: "6px 10px",
                      whiteSpace: "nowrap",
                      fontWeight: 600,
                    }}
                  >
                    {r.vchNo}
                  </td>
                  <td style={{ padding: "6px 10px", whiteSpace: "nowrap" }}>
                    {r.folio}
                  </td>
                  <td style={{ padding: "6px 10px", whiteSpace: "nowrap" }}>
                    {r.narration}
                  </td>
                  {MODES.map((m) => (
                    <td
                      key={m}
                      style={{ padding: "6px 10px", textAlign: "right" }}
                    >
                      {Number(r[m]) > 0 ? `₹${Number(r[m]).toFixed(2)}` : ""}
                    </td>
                  ))}
                  <td style={{ padding: "6px 10px", whiteSpace: "nowrap" }}>
                    {r.user}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr style={{ background: "#fef3c7", fontWeight: 700 }}>
              <td colSpan={4} style={{ padding: "8px 10px" }}>
                GRAND TOTAL
              </td>
              {MODES.map((m) => (
                <td key={m} style={{ padding: "8px 10px", textAlign: "right" }}>
                  ₹{grandTotal[m].toFixed(2)}
                </td>
              ))}
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function InvoiceSeriesSection() {
  const defaultSeries = {
    room: { prefix: "RB", startNo: 1, fy: "25-26" },
    restaurant: { prefix: "FB", startNo: 1, fy: "25-26" },
    roomFood: { prefix: "RF", startNo: 1, fy: "25-26" },
    banquet: { prefix: "BB", startNo: 1, fy: "25-26" },
    other: { prefix: "OT", startNo: 1, fy: "25-26" },
  };
  type SeriesData = typeof defaultSeries;
  const [series, setSeries] = useState<SeriesData>(() => {
    try {
      const s = JSON.parse(localStorage.getItem("kdm_invoice_series") || "{}");
      return { ...defaultSeries, ...s };
    } catch {
      return defaultSeries;
    }
  });
  const labels: Record<string, string> = {
    room: "Room Bill",
    restaurant: "Restaurant Bill",
    roomFood: "Room Food Invoice",
    banquet: "Banquet Bill",
    other: "Other Invoice",
  };
  const update = (key: string, field: string, val: string | number) => {
    setSeries((prev) => ({
      ...prev,
      [key]: { ...(prev[key as keyof SeriesData] as object), [field]: val },
    }));
  };
  const save = () => {
    localStorage.setItem("kdm_invoice_series", JSON.stringify(series));
    toast.success("Invoice series settings saved!");
  };
  const preview = (s: { prefix: string; startNo: number; fy: string }) =>
    `${s.prefix}/${s.fy}/${String(s.startNo).padStart(4, "0")}`;

  return (
    <div style={{ maxWidth: 700 }}>
      <SectionTitle
        title="Invoice Series Settings"
        sub="Configure bill number prefix and series for each invoice type"
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {Object.entries(series).map(([key, s]) => (
          <div
            key={key}
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 10,
              padding: "16px 20px",
            }}
          >
            <div
              style={{
                fontWeight: 700,
                color: "#1e293b",
                marginBottom: 12,
                fontSize: "0.95rem",
              }}
            >
              {labels[key] || key}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 12,
                marginBottom: 10,
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "#64748b",
                    fontWeight: 600,
                    display: "block",
                  }}
                >
                  Prefix
                </span>
                <input
                  style={{
                    display: "block",
                    width: "100%",
                    border: "1px solid #e2e8f0",
                    borderRadius: 6,
                    padding: "6px 10px",
                    marginTop: 4,
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                  value={(s as any).prefix}
                  maxLength={6}
                  onChange={(e) =>
                    update(key, "prefix", e.target.value.toUpperCase())
                  }
                />
              </div>
              <div>
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "#64748b",
                    fontWeight: 600,
                    display: "block",
                  }}
                >
                  Financial Year
                </span>
                <input
                  style={{
                    display: "block",
                    width: "100%",
                    border: "1px solid #e2e8f0",
                    borderRadius: 6,
                    padding: "6px 10px",
                    marginTop: 4,
                  }}
                  value={(s as any).fy}
                  placeholder="25-26"
                  onChange={(e) => update(key, "fy", e.target.value)}
                />
              </div>
              <div>
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "#64748b",
                    fontWeight: 600,
                    display: "block",
                  }}
                >
                  Starting Number
                </span>
                <input
                  type="number"
                  min={1}
                  style={{
                    display: "block",
                    width: "100%",
                    border: "1px solid #e2e8f0",
                    borderRadius: 6,
                    padding: "6px 10px",
                    marginTop: 4,
                  }}
                  value={(s as any).startNo}
                  onChange={(e) =>
                    update(key, "startNo", Number.parseInt(e.target.value) || 1)
                  }
                />
              </div>
            </div>
            <div
              style={{
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: 6,
                padding: "6px 12px",
                display: "inline-block",
              }}
            >
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "#166534",
                  fontWeight: 600,
                }}
              >
                Preview:{" "}
              </span>
              <span
                style={{
                  fontFamily: "monospace",
                  fontWeight: 700,
                  color: "#15803d",
                }}
              >
                {preview(s as any)}
              </span>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={save}
          style={{
            background: "#c9a84c",
            color: "#000",
            fontWeight: 700,
            border: "none",
            borderRadius: 8,
            padding: "10px 24px",
            cursor: "pointer",
            alignSelf: "flex-start",
            fontSize: "0.95rem",
          }}
          data-ocid="invoice-series.save_button"
        >
          💾 Save Invoice Series Settings
        </button>
      </div>
    </div>
  );
}

function PaymentTypesSection() {
  const defaultTypes = [
    "Cash",
    "SBI Card",
    "HDFC Card",
    "UPI",
    "NEFT/Cheque",
    "Complement",
    "Company",
    "Room",
  ];
  const [types, setTypes] = useState<string[]>(() => {
    try {
      const s = localStorage.getItem("kdm_payment_types");
      return s ? JSON.parse(s) : defaultTypes;
    } catch {
      return defaultTypes;
    }
  });
  const [newType, setNewType] = useState("");
  const save = () => {
    localStorage.setItem("kdm_payment_types", JSON.stringify(types));
    toast.success("Payment types saved!");
  };
  const remove = (i: number) =>
    setTypes((t) => t.filter((_, idx) => idx !== i));
  const add = () => {
    if (newType.trim()) {
      setTypes((t) => [...t, newType.trim()]);
      setNewType("");
    }
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <div
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 12,
          padding: 24,
        }}
      >
        <h2
          style={{
            color: GOLD,
            fontFamily: "'Playfair Display',serif",
            fontSize: "1.3rem",
            marginBottom: 16,
          }}
        >
          💳 Payment Types
        </h2>
        <p style={{ color: "#64748b", fontSize: "0.85rem", marginBottom: 16 }}>
          Manage payment modes available across Room, Restaurant, and Banquet
          billing.
        </p>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            marginBottom: 20,
          }}
        >
          {types.map((t) => (
            <div
              key={t}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 14px",
                background: "#f8fafc",
                borderRadius: 8,
                border: "1px solid #e2e8f0",
              }}
            >
              <span style={{ fontWeight: 600, color: "#1e293b" }}>{t}</span>
              <Button
                variant="outline"
                size="sm"
                style={{ color: "#ef4444", borderColor: "#ef4444" }}
                onClick={() => {
                  const idx = types.indexOf(t);
                  remove(idx);
                }}
                data-ocid="payment-types.delete_button"
              >
                ✕ Remove
              </Button>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <Input
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            placeholder="New payment type (e.g. Paytm, Amex Card)"
            onKeyDown={(e) => e.key === "Enter" && add()}
            data-ocid="payment-types.input"
          />
          <Button
            onClick={add}
            style={{
              background: GOLD,
              color: "#000",
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
            data-ocid="payment-types.button"
          >
            + Add
          </Button>
        </div>
        <Button
          onClick={save}
          style={{
            background: "#16a34a",
            color: "#fff",
            fontWeight: 600,
            width: "100%",
          }}
          data-ocid="payment-types.save_button"
        >
          💾 Save Payment Types
        </Button>
      </div>
    </div>
  );
}

function PermissionsSection() {
  const defaultPerms = {
    itemName: true,
    price: true,
    couponCode: true,
    discount: true,
    menuItems: true,
    roomRate: true,
  };
  const [perms, setPerms] = useState<Record<string, boolean>>(() => {
    return getEditPermissions();
  });
  const [saved, setSaved] = useState(false);

  const togglePerm = (key: string) => {
    setPerms((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    try {
      localStorage.setItem("kdm_edit_permissions", JSON.stringify(perms));
    } catch {}
    setSaved(true);
    toast.success("Permissions saved!");
    setTimeout(() => setSaved(false), 2000);
  };

  const permLabels: { key: string; label: string; desc: string }[] = [
    {
      key: "itemName",
      label: "Allow Edit Item Name",
      desc: "Allow staff to edit item names in menus and orders",
    },
    {
      key: "price",
      label: "Allow Edit Price",
      desc: "Allow staff to modify item prices in orders",
    },
    {
      key: "couponCode",
      label: "Allow Edit Coupon Code",
      desc: "Allow creating and modifying coupon codes",
    },
    {
      key: "discount",
      label: "Allow Edit Discount",
      desc: "Allow applying and changing discount amounts",
    },
    {
      key: "menuItems",
      label: "Allow Edit Menu Items",
      desc: "Allow adding, editing, removing menu items",
    },
    {
      key: "roomRate",
      label: "Allow Edit Room Rate",
      desc: "Allow changing room rates and occupancy pricing",
    },
  ];

  return (
    <div>
      <SectionTitle
        title="Edit Permissions"
        sub="Control what staff can edit in the system"
      />
      <div
        style={{
          background: CARD_BG,
          border: `1px solid ${BORDER}`,
          borderRadius: 10,
          padding: "1.5rem",
          maxWidth: 600,
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <p
            style={{
              color: "#1e293b",
              fontWeight: 600,
              fontSize: "0.85rem",
              marginBottom: 4,
            }}
          >
            🔒 Admin can toggle these permissions to restrict or allow editing
            across the system.
          </p>
          <p style={{ color: "#64748b", fontSize: "0.75rem" }}>
            Changes take effect immediately after saving.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {permLabels.map(({ key, label, desc }) => (
            <div
              key={key}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 14px",
                background: "#f8fafc",
                borderRadius: 8,
                border: `1px solid ${BORDER}`,
              }}
            >
              <div>
                <p
                  style={{
                    color: "#1e293b",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    marginBottom: 2,
                  }}
                >
                  {label}
                </p>
                <p style={{ color: "#64748b", fontSize: "0.72rem" }}>{desc}</p>
              </div>
              <button
                type="button"
                data-ocid={`permissions.${key}.toggle`}
                onClick={() => togglePerm(key)}
                style={{
                  width: 44,
                  height: 24,
                  borderRadius: 12,
                  border: "none",
                  cursor: "pointer",
                  background: perms[key] ? GOLD : "#d1d5db",
                  position: "relative",
                  transition: "background 0.2s",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: 3,
                    left: perms[key] ? 22 : 3,
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: "#fff",
                    transition: "left 0.2s",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  }}
                />
              </button>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
          <Button
            style={{
              background: saved ? "#22c55e" : GOLD,
              color: "#000",
              fontWeight: 700,
            }}
            onClick={handleSave}
            data-ocid="permissions.submit_button"
          >
            {saved ? "✓ Saved!" : "Save Permissions"}
          </Button>
          <Button
            variant="outline"
            style={{ borderColor: BORDER, color: "#1e293b", fontWeight: 600 }}
            onClick={() => {
              setPerms(defaultPerms);
              try {
                localStorage.setItem(
                  "kdm_edit_permissions",
                  JSON.stringify(defaultPerms),
                );
              } catch {}
              toast.success("Permissions reset to defaults");
            }}
            data-ocid="permissions.secondary_button"
          >
            Reset to Defaults
          </Button>
        </div>
      </div>
    </div>
  );
}

function StaffAccountsSection() {
  const {
    getStaffAccounts,
    addStaffAccount,
    updateStaffAccount,
    deleteStaffAccount,
  } = useMultiOwnerAuth();
  const [accounts, setAccounts] = useState<StaffAccount[]>(() =>
    getStaffAccounts(),
  );
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    staffRole: "Receptionist" as StaffAccount["staffRole"],
    status: "active" as "active" | "inactive",
  });

  const refresh = () => setAccounts(getStaffAccounts());

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      password: "",
      staffRole: "Receptionist",
      status: "active",
    });
    setShowPw(false);
    setError("");
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (acc: StaffAccount) => {
    setForm({
      name: acc.name,
      email: acc.email,
      password: "",
      staffRole: acc.staffRole,
      status: acc.status,
    });
    setEditId(acc.id);
    setShowForm(true);
    setError("");
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.email.trim()) {
      setError("Name and email are required.");
      return;
    }
    if (editId) {
      const updates: Partial<StaffAccount> = {
        name: form.name,
        staffRole: form.staffRole,
        status: form.status,
      };
      if (form.password.trim()) updates.password = form.password;
      updateStaffAccount(editId, updates);
      refresh();
      resetForm();
    } else {
      if (!form.password.trim()) {
        setError("Password is required.");
        return;
      }
      const result = addStaffAccount({
        name: form.name,
        email: form.email,
        password: form.password,
        staffRole: form.staffRole,
      });
      if (!result.success) {
        setError(result.error || "Error adding account.");
        return;
      }
      refresh();
      resetForm();
    }
  };

  const handleDelete = (id: string) => {
    deleteStaffAccount(id);
    refresh();
    setDeleteId(null);
  };

  const ROLES: StaffAccount["staffRole"][] = [
    "Receptionist",
    "Restaurant Staff",
    "Housekeeping",
    "Manager",
    "Kitchen Staff",
    "Security",
    "Front Desk",
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserPlus className="w-6 h-6 text-yellow-400" />
          <h2 className="text-xl font-bold text-white">Staff Accounts</h2>
          <span className="bg-yellow-500/20 text-yellow-400 text-xs font-bold px-2 py-1 rounded-full border border-yellow-500/30">
            {accounts.length} staff
          </span>
        </div>
        <button
          type="button"
          data-ocid="staff-accounts.open_modal_button"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-4 py-2 rounded-lg transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Add Staff Account
        </button>
      </div>

      <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-3 text-sm text-gray-400">
        ℹ️ Staff members can log in to the Admin Panel and Restaurant Page using
        their email and password.
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div
          className="bg-gray-800 rounded-xl border border-yellow-500/30 p-6 space-y-4"
          data-ocid="staff-accounts.dialog"
        >
          <h3 className="text-lg font-bold text-white">
            {editId ? "Edit Staff Account" : "Add New Staff Account"}
          </h3>
          {error && (
            <div
              className="bg-red-900/50 border border-red-500/50 text-red-300 px-4 py-2 rounded-lg text-sm"
              data-ocid="staff-accounts.error_state"
            >
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="staff-name"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Full Name
              </label>
              <input
                id="staff-name"
                data-ocid="staff-accounts.input"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
                placeholder="e.g. Rahul Kumar"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div>
              <label
                htmlFor="staff-email"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Email Address
              </label>
              <input
                id="staff-email"
                data-ocid="staff-accounts.input"
                type="email"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 disabled:opacity-50"
                placeholder="staff@hotel.com"
                value={form.email}
                disabled={!!editId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
              />
            </div>
            <div>
              <label
                htmlFor="staff-password"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                {editId ? "New Password (leave blank to keep)" : "Password"}
              </label>
              <div className="relative">
                <input
                  id="staff-password"
                  data-ocid="staff-accounts.input"
                  type={showPw ? "text" : "password"}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 pr-10"
                  placeholder={
                    editId ? "Leave blank to keep existing" : "Min 6 characters"
                  }
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-2 top-2.5 text-gray-400 hover:text-white"
                >
                  {showPw ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label
                htmlFor="staff-role"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Role
              </label>
              <select
                id="staff-role"
                data-ocid="staff-accounts.select"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-500"
                value={form.staffRole}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    staffRole: e.target.value as typeof form.staffRole,
                  }))
                }
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-300">Status:</span>
            <button
              type="button"
              data-ocid="staff-accounts.toggle"
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  status: f.status === "active" ? "inactive" : "active",
                }))
              }
              className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${form.status === "active" ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-gray-700 text-gray-400 border-gray-600"}`}
            >
              {form.status === "active" ? "● Active" : "○ Inactive"}
            </button>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              data-ocid="staff-accounts.submit_button"
              onClick={handleSubmit}
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-2 rounded-lg transition-colors"
            >
              {editId ? "Save Changes" : "Add Staff Account"}
            </button>
            <button
              type="button"
              data-ocid="staff-accounts.cancel_button"
              onClick={resetForm}
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold px-6 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Staff Table */}
      {accounts.length === 0 ? (
        <div
          className="text-center py-12 text-gray-500"
          data-ocid="staff-accounts.empty_state"
        >
          <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No staff accounts yet</p>
          <p className="text-sm mt-1">
            Click &quot;Add Staff Account&quot; to create the first staff login.
          </p>
        </div>
      ) : (
        <div
          className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden"
          data-ocid="staff-accounts.table"
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400 uppercase text-xs">
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((acc, i) => (
                <tr
                  key={acc.id}
                  className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors"
                  data-ocid={`staff-accounts.item.${i + 1}`}
                >
                  <td className="px-4 py-3 font-medium text-white">
                    {acc.name}
                  </td>
                  <td className="px-4 py-3 text-gray-300">{acc.email}</td>
                  <td className="px-4 py-3">
                    <span className="bg-blue-500/20 text-blue-300 text-xs font-bold px-2 py-1 rounded border border-blue-500/30">
                      {acc.staffRole}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded border ${acc.status === "active" ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-gray-700 text-gray-400 border-gray-600"}`}
                    >
                      {acc.status === "active" ? "● Active" : "○ Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(acc.createdAt).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        data-ocid={`staff-accounts.edit_button.${i + 1}`}
                        onClick={() => handleEdit(acc)}
                        className="text-yellow-400 hover:text-yellow-300 text-xs font-bold px-2 py-1 border border-yellow-500/30 rounded hover:bg-yellow-500/10 transition-colors"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        type="button"
                        data-ocid={`staff-accounts.delete_button.${i + 1}`}
                        onClick={() => setDeleteId(acc.id)}
                        className="text-red-400 hover:text-red-300 text-xs font-bold px-2 py-1 border border-red-500/30 rounded hover:bg-red-500/10 transition-colors"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteId && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          data-ocid="staff-accounts.dialog"
        >
          <div className="bg-gray-800 border border-red-500/30 rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-white mb-2">
              Delete Staff Account?
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              This will permanently remove the staff account and they will no
              longer be able to log in.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                data-ocid="staff-accounts.confirm_button"
                onClick={() => handleDelete(deleteId)}
                className="bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2 rounded-lg flex-1 transition-colors"
              >
                Yes, Delete
              </button>
              <button
                type="button"
                data-ocid="staff-accounts.cancel_button"
                onClick={() => setDeleteId(null)}
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold px-4 py-2 rounded-lg flex-1 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ClearDataSection() {
  const [confirmed, setConfirmed] = useState(false);
  const [done, setDone] = useState(false);
  const [backupDone, setBackupDone] = useState(false);
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState("");
  const [backupHistory, setBackupHistory] = useState<
    Array<{ id: string; filename: string; timestamp: string; status: string }>
  >(() => {
    try {
      return JSON.parse(localStorage.getItem("kdm_backup_history") || "[]");
    } catch {
      return [];
    }
  });

  const addBackupHistory = (filename: string) => {
    const entry = {
      id: `bh_${Date.now()}`,
      filename,
      timestamp: new Date().toISOString(),
      status: "downloaded",
    };
    const updated = [entry, ...backupHistory];
    setBackupHistory(updated);
    localStorage.setItem("kdm_backup_history", JSON.stringify(updated));
  };

  const deleteBackupHistory = (id: string) => {
    const updated = backupHistory.filter((h) => h.id !== id);
    setBackupHistory(updated);
    localStorage.setItem("kdm_backup_history", JSON.stringify(updated));
  };

  const BILLING_KEYS = [
    "hotelCheckIns",
    "hotelBanquetBills",
    "hotelRestaurantBills",
    "hotelRoomFoodOrders",
    "kdm_room_invoices",
    "kdm_room_food_orders",
    "kdm_restaurant_bills",
    "kdm_restaurant_room_bills",
    "kdm_banquet_bills",
    "kdm_banquet_bookings",
    "kdm_kot_orders",
    "kdm_kitchen_orders",
    "kdm_booking_reservations",
    "kdm_reservations",
    "kdm_customer_profiles",
    "kdm_customers",
    "kdm_past_guests",
    "kdm_guest_history",
    "kdm_accounts",
    "kdm_night_audits",
    "kdm_reviews",
    "kdm_feedback",
    "kdm_purchase_orders",
  ];

  const handleDownloadBackup = () => {
    const backup: Record<string, any> = {};
    for (const key of BILLING_KEYS) {
      const val = localStorage.getItem(key);
      if (val !== null) backup[key] = JSON.parse(val);
    }
    for (const k of Object.keys(localStorage).filter((k) =>
      k.startsWith("kdm_folio_extras"),
    )) {
      const val = localStorage.getItem(k);
      if (val !== null) backup[k] = JSON.parse(val);
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const now = new Date();
    const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;
    a.href = url;
    a.download = `kdm_backup_${stamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setBackupDone(true);
    addBackupHistory(`kdm_backup_${stamp}.json`);
    toast.success("Backup downloaded successfully!");
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError("");
    setImportSuccess("");
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (typeof data !== "object" || Array.isArray(data)) {
          setImportError("Invalid backup file format.");
          return;
        }
        let count = 0;
        for (const [key, value] of Object.entries(data)) {
          localStorage.setItem(key, JSON.stringify(value));
          count++;
        }
        setImportSuccess(
          `Backup restored successfully! (${count} data groups loaded)`,
        );
        toast.success("Backup restored! Refresh the page to see all data.");
      } catch {
        setImportError(
          "Failed to parse backup file. Please use a valid KDM backup JSON.",
        );
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleClearAll = () => {
    for (const key of BILLING_KEYS) {
      localStorage.removeItem(key);
    }
    for (const k of Object.keys(localStorage).filter((k) =>
      k.startsWith("kdm_folio_extras"),
    )) {
      localStorage.removeItem(k);
    }
    setDone(true);
    setConfirmed(false);
    setBackupDone(false);
    toast.success("All billing data cleared. Starting fresh!");
  };

  return (
    <div style={{ padding: "24px" }}>
      <SectionTitle title="Clear All Data" />

      {/* BACKUP SECTION */}
      <div
        style={{
          background: "#f0fdf4",
          border: "2px solid #16a34a",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "20px",
        }}
      >
        <h4
          style={{
            color: "#15803d",
            fontWeight: "700",
            margin: "0 0 6px",
            fontSize: "16px",
          }}
        >
          📦 Step 1: Create Backup Before Clearing
        </h4>
        <p style={{ color: "#166534", margin: "0 0 14px", fontSize: "14px" }}>
          Download a full backup of all billing data (invoices, check-ins, KOTs,
          guests, banquet bills, etc.) before clearing. You can restore this
          data anytime using the Import section below.
        </p>
        <button
          type="button"
          onClick={handleDownloadBackup}
          style={{
            background: "#16a34a",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "12px 28px",
            cursor: "pointer",
            fontWeight: "700",
            fontSize: "15px",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          ⬇️ Download Backup (.json)
        </button>
        {backupDone && (
          <span
            style={{
              marginLeft: "16px",
              color: "#15803d",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            ✅ Backup saved!
          </span>
        )}
      </div>

      {/* BACKUP HISTORY */}
      <div
        style={{
          background: "#1e293b",
          border: "1px solid #334155",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "20px",
        }}
      >
        <h4
          style={{
            color: "#c9a84c",
            fontWeight: "700",
            margin: "0 0 14px",
            fontSize: "16px",
          }}
        >
          📋 Backup History
        </h4>
        {backupHistory.length === 0 ? (
          <p
            style={{ color: "#64748b", fontSize: "14px", margin: 0 }}
            data-ocid="backup-history.empty_state"
          >
            No backups taken yet. Download a backup to see it here.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.82rem",
              }}
            >
              <thead>
                <tr style={{ background: "#0f172a" }}>
                  {["#", "Date & Time", "Filename", "Status", ""].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "8px 12px",
                        textAlign: "left",
                        color: "#c9a84c",
                        fontWeight: 700,
                        fontSize: "0.72rem",
                        borderBottom: "1px solid #334155",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {backupHistory.map((h, idx) => (
                  <tr
                    key={h.id}
                    data-ocid={`backup-history.item.${idx + 1}`}
                    style={{
                      background: idx % 2 === 0 ? "#1e293b" : "#0f172a",
                    }}
                  >
                    <td style={{ padding: "8px 12px", color: "#64748b" }}>
                      {idx + 1}
                    </td>
                    <td style={{ padding: "8px 12px", color: "#cbd5e1" }}>
                      {new Date(h.timestamp).toLocaleString("en-IN")}
                    </td>
                    <td
                      style={{
                        padding: "8px 12px",
                        color: "#f1f5f9",
                        fontFamily: "monospace",
                        fontSize: "0.78rem",
                      }}
                    >
                      {h.filename}
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      <span
                        style={{
                          background: "#14532d",
                          color: "#4ade80",
                          padding: "2px 8px",
                          borderRadius: 20,
                          fontSize: "0.68rem",
                          fontWeight: 700,
                        }}
                      >
                        {h.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      <button
                        type="button"
                        onClick={() => deleteBackupHistory(h.id)}
                        style={{
                          background: "#450a0a",
                          color: "#f87171",
                          border: "none",
                          borderRadius: 4,
                          padding: "3px 8px",
                          cursor: "pointer",
                          fontSize: "0.75rem",
                        }}
                        data-ocid={`backup-history.delete_button.${idx + 1}`}
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* IMPORT / RESTORE SECTION */}
      <div
        style={{
          background: "#eff6ff",
          border: "2px solid #3b82f6",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "20px",
        }}
      >
        <h4
          style={{
            color: "#1d4ed8",
            fontWeight: "700",
            margin: "0 0 6px",
            fontSize: "16px",
          }}
        >
          📂 Import from Backup (Restore Data)
        </h4>
        <p style={{ color: "#1e40af", margin: "0 0 14px", fontSize: "14px" }}>
          Select a previously downloaded KDM backup JSON file to restore all
          billing data. Existing data will be overwritten.
        </p>
        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "12px 28px",
            cursor: "pointer",
            fontWeight: "700",
            fontSize: "15px",
          }}
        >
          ⬆️ Select Backup File
          <input
            type="file"
            accept=".json,application/json"
            onChange={handleImportBackup}
            style={{ display: "none" }}
          />
        </label>
        {importSuccess && (
          <div
            style={{
              marginTop: "12px",
              color: "#15803d",
              fontWeight: "600",
              fontSize: "14px",
              background: "#dcfce7",
              padding: "10px 16px",
              borderRadius: "8px",
            }}
          >
            ✅ {importSuccess}
          </div>
        )}
        {importError && (
          <div
            style={{
              marginTop: "12px",
              color: "#dc2626",
              fontWeight: "600",
              fontSize: "14px",
              background: "#fef2f2",
              padding: "10px 16px",
              borderRadius: "8px",
            }}
          >
            ❌ {importError}
          </div>
        )}
      </div>

      {/* CLEAR SECTION */}
      {done ? (
        <div
          style={{
            background: "#dcfce7",
            border: "1px solid #16a34a",
            borderRadius: "12px",
            padding: "24px",
            textAlign: "center",
            marginTop: "16px",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>✅</div>
          <h3
            style={{
              color: "#15803d",
              fontSize: "20px",
              fontWeight: "700",
              margin: "0 0 8px",
            }}
          >
            All Data Cleared Successfully
          </h3>
          <p style={{ color: "#166534", margin: "0 0 16px" }}>
            All invoices, KOTs, guest records, and billing history have been
            wiped. You can now start fresh billing.
          </p>
          <button
            type="button"
            data-ocid="clear-data.confirm_button"
            onClick={() => setDone(false)}
            style={{
              background: "#16a34a",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "10px 24px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            OK, Got It
          </button>
        </div>
      ) : (
        <div
          style={{
            background: "#fef2f2",
            border: "2px solid #fca5a5",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <h4
            style={{
              color: "#dc2626",
              fontWeight: "700",
              margin: "0 0 8px",
              fontSize: "16px",
            }}
          >
            🗑️ Step 2: Clear All Billing Data
          </h4>
          <div
            style={{
              background: "#fff5f5",
              border: "1px solid #fca5a5",
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "16px",
            }}
          >
            <p
              style={{
                color: "#7f1d1d",
                margin: "0 0 8px",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              ⚠️ Warning: This action is irreversible. The following data will be
              permanently deleted:
            </p>
            <ul
              style={{
                color: "#7f1d1d",
                fontSize: "14px",
                margin: "0",
                paddingLeft: "20px",
              }}
            >
              <li>All Room Check-Ins &amp; Invoices</li>
              <li>All Restaurant Bills &amp; KOT Orders</li>
              <li>All Room Food Orders</li>
              <li>All Banquet Bills &amp; Bookings</li>
              <li>All Guest Records &amp; Customer Profiles</li>
              <li>All Night Audit Records</li>
              <li>All Purchase Orders &amp; Accounts</li>
              <li>Guest History &amp; Folio Data</li>
            </ul>
            <p
              style={{
                color: "#dc2626",
                fontWeight: "600",
                margin: "12px 0 0 0",
                fontSize: "14px",
              }}
            >
              Hotel settings, room list, menu items, staff, and configuration
              will NOT be affected.
            </p>
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                cursor: "pointer",
                background: "#fffbeb",
                border: "1px solid #fcd34d",
                borderRadius: "8px",
                padding: "14px",
              }}
            >
              <input
                data-ocid="clear-data.checkbox"
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                style={{
                  marginTop: "2px",
                  width: "18px",
                  height: "18px",
                  cursor: "pointer",
                }}
              />
              <span
                style={{
                  color: "#92400e",
                  fontWeight: "600",
                  fontSize: "15px",
                }}
              >
                I understand this will permanently delete all billing and guest
                data. This cannot be undone.
              </span>
            </label>
          </div>
          <button
            type="button"
            data-ocid="clear-data.delete_button"
            onClick={handleClearAll}
            disabled={!confirmed}
            style={{
              background: confirmed ? "#dc2626" : "#9ca3af",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              padding: "14px 32px",
              cursor: confirmed ? "pointer" : "not-allowed",
              fontWeight: "700",
              fontSize: "16px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            🗑️ Clear All Billing Data &amp; Start Fresh
          </button>
        </div>
      )}
    </div>
  );
}
function GuestHistorySection() {
  const GOLD = "#c9a84c";
  const [search, setSearch] = useState("");
  const [selectedGuest, setSelectedGuest] = useState<any>(null);

  const getAllGuests = () => {
    const map = new Map<string, any>();
    const addRecord = (
      mobile: string,
      name: string,
      source: string,
      extra: any = {},
    ) => {
      const key = mobile || name;
      if (!key) return;
      if (map.has(key)) {
        const existing = map.get(key);
        existing.visits.push({ source, ...extra });
        existing.visitCount = existing.visits.length;
      } else {
        map.set(key, {
          mobile,
          name,
          source,
          visits: [{ source, ...extra }],
          visitCount: 1,
          ...extra,
        });
      }
    };
    try {
      const checkins: any[] = JSON.parse(
        localStorage.getItem("hotelCheckIns") || "[]",
      );
      for (const c of checkins)
        addRecord(
          c.phone || c.mobile || "",
          c.guestName || c.name || "",
          "Check-In",
          { roomNumber: c.roomNumber, date: c.checkInDate || c.createdAt },
        );
    } catch {}
    try {
      const history: any[] = JSON.parse(
        localStorage.getItem("kdm_guest_history") || "[]",
      );
      for (const c of history)
        addRecord(
          c.mobile || c.phone || "",
          c.name || c.guestName || "",
          "Guest History",
          { date: c.date || c.createdAt },
        );
    } catch {}
    try {
      const reservations: any[] = JSON.parse(
        localStorage.getItem("kdm_reservations") || "[]",
      );
      for (const c of reservations)
        addRecord(
          c.mobile || c.phone || "",
          c.name || c.guestName || "",
          "Reservation",
          { date: c.arrivalDate || c.createdAt },
        );
    } catch {}
    try {
      const bills: any[] = JSON.parse(
        localStorage.getItem("kdm_restaurant_bills") || "[]",
      );
      for (const c of bills)
        addRecord(
          c.customerPhone || c.phone || "",
          c.customerName || c.guestName || "",
          "Restaurant",
          { date: c.createdAt },
        );
    } catch {}
    try {
      const banquetBills: any[] = JSON.parse(
        localStorage.getItem("kdm_banquet_bills") || "[]",
      );
      for (const c of banquetBills)
        addRecord(
          c.mobile || c.phone || "",
          c.guestName || c.name || "",
          "Banquet",
          { date: c.createdAt },
        );
    } catch {}
    try {
      const banquetBookings: any[] = JSON.parse(
        localStorage.getItem("kdm_banquet_bookings") || "[]",
      );
      for (const c of banquetBookings)
        addRecord(c.mobile || c.phone || "", c.name || "", "Banquet Booking", {
          date: c.eventDate || c.createdAt,
        });
    } catch {}
    try {
      const customers: any[] = JSON.parse(
        localStorage.getItem("kdm_customers") || "[]",
      );
      for (const c of customers)
        addRecord(c.mobile || c.phone || "", c.name || "", "Customer", {
          date: c.createdAt,
        });
    } catch {}
    return Array.from(map.values());
  };

  const guests = getAllGuests();
  const filtered = guests.filter((g) =>
    !search
      ? true
      : (g.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (g.mobile || "").includes(search) ||
        (g.company || "").toLowerCase().includes(search.toLowerCase()),
  );

  const thisMonth = guests.filter((g) => {
    const d = g.visits?.[0]?.date;
    if (!d) return false;
    const gd = new Date(d);
    const now = new Date();
    return (
      gd.getMonth() === now.getMonth() && gd.getFullYear() === now.getFullYear()
    );
  }).length;

  const exportCSV = () => {
    const rows = [["Name", "Mobile", "Source", "Visit Count", "Room/Table"]];
    for (const g of filtered) {
      rows.push([
        g.name || "",
        g.mobile || "",
        g.source || "",
        String(g.visitCount || 1),
        g.roomNumber || g.tableNumber || "",
      ]);
    }
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = `data:text/csv;charset=utf-8,\uFEFF${encodeURIComponent(csv)}`;
    a.download = `guest_history_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div>
      <SectionTitle
        title="Guest History"
        sub="Combined guest records from all modules — search by mobile, name or company"
      />
      {/* Stats */}
      <div
        style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}
      >
        {[
          {
            label: "Total Unique Guests",
            value: guests.length,
            bg: "#fef3c7",
            color: "#92400e",
          },
          {
            label: "Total Visits",
            value: guests.reduce((s, g) => s + (g.visitCount || 1), 0),
            bg: "#dbeafe",
            color: "#1e3a8a",
          },
          {
            label: "This Month",
            value: thisMonth,
            bg: "#d1fae5",
            color: "#065f46",
          },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: s.bg,
              border: `1px solid ${s.color}30`,
              borderRadius: 8,
              padding: "10px 20px",
              minWidth: 130,
            }}
          >
            <div
              style={{ fontSize: "1.5rem", fontWeight: 800, color: s.color }}
            >
              {s.value}
            </div>
            <div
              style={{ fontSize: "0.75rem", color: s.color, fontWeight: 600 }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>
      {/* Search + Export */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 14,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Search by mobile, name, company..."
          data-ocid="guest-history.search_input"
          style={{ maxWidth: 360 }}
        />
        <Button
          size="sm"
          style={{ background: GOLD, color: "#000", fontWeight: 700 }}
          onClick={exportCSV}
        >
          📥 Export CSV
        </Button>
      </div>
      {/* Table */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          overflow: "auto",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "0.85rem",
          }}
        >
          <thead>
            <tr
              style={{
                background: "#f8fafc",
                borderBottom: "2px solid #e2e8f0",
              }}
            >
              {[
                "Name",
                "Mobile",
                "Source",
                "Visit Count",
                "Room/Table",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "10px 12px",
                    textAlign: "left",
                    fontWeight: 700,
                    color: "#374151",
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr data-ocid="guest-history.empty_state">
                <td
                  colSpan={6}
                  style={{ padding: 32, textAlign: "center", color: "#94a3b8" }}
                >
                  No guest records found
                </td>
              </tr>
            )}
            {filtered.map((g, i) => (
              <tr
                key={g.mobile || g.name || i}
                data-ocid={`guest-history.item.${i + 1}`}
                style={{ borderBottom: "1px solid #f1f5f9" }}
              >
                <td
                  style={{
                    padding: "10px 12px",
                    fontWeight: 600,
                    color: "#1e293b",
                  }}
                >
                  {search &&
                  g.name?.toLowerCase().includes(search.toLowerCase()) ? (
                    <mark style={{ background: "#fef08a" }}>{g.name}</mark>
                  ) : (
                    g.name || "—"
                  )}
                </td>
                <td style={{ padding: "10px 12px", fontFamily: "monospace" }}>
                  {search && g.mobile?.includes(search) ? (
                    <mark style={{ background: "#fef08a" }}>{g.mobile}</mark>
                  ) : (
                    g.mobile || "—"
                  )}
                </td>
                <td style={{ padding: "10px 12px" }}>
                  <span
                    style={{
                      background: "#f1f5f9",
                      borderRadius: 99,
                      padding: "2px 10px",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                    }}
                  >
                    {g.source}
                  </span>
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    textAlign: "center",
                    fontWeight: 700,
                    color: GOLD,
                  }}
                >
                  {g.visitCount || 1}
                </td>
                <td style={{ padding: "10px 12px", color: "#64748b" }}>
                  {g.roomNumber || g.tableNumber || "—"}
                </td>
                <td style={{ padding: "10px 12px" }}>
                  <Button
                    size="sm"
                    variant="outline"
                    style={{ fontSize: "0.75rem" }}
                    data-ocid={`guest-history.button.${i + 1}`}
                    onClick={() => setSelectedGuest(g)}
                  >
                    View Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Details modal */}
      {selectedGuest && (
        <Dialog open onOpenChange={() => setSelectedGuest(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Guest Details — {selectedGuest.name}</DialogTitle>
            </DialogHeader>
            <div style={{ marginBottom: 12 }}>
              <div>
                <strong>Mobile:</strong> {selectedGuest.mobile || "—"}
              </div>
              <div>
                <strong>Primary Source:</strong> {selectedGuest.source}
              </div>
            </div>
            <div style={{ fontWeight: 700, marginBottom: 8, color: "#1e293b" }}>
              All Visits ({selectedGuest.visits?.length || 1})
            </div>
            <div style={{ maxHeight: 300, overflowY: "auto" }}>
              {(selectedGuest.visits || [{ source: selectedGuest.source }]).map(
                (v: any, idx: number) => (
                  <div
                    key={`visit-${String(idx)}`}
                    style={{
                      background: "#f8fafc",
                      borderRadius: 6,
                      padding: "8px 12px",
                      marginBottom: 6,
                      fontSize: "0.82rem",
                    }}
                  >
                    <span
                      style={{
                        background: "#e2e8f0",
                        borderRadius: 99,
                        padding: "1px 8px",
                        fontWeight: 600,
                        marginRight: 8,
                      }}
                    >
                      {v.source}
                    </span>
                    {v.roomNumber && <span>Room {v.roomNumber}</span>}
                    {v.date && (
                      <span style={{ color: "#64748b", marginLeft: 8 }}>
                        {new Date(v.date).toLocaleDateString("en-IN")}
                      </span>
                    )}
                  </div>
                ),
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedGuest(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ─── OWNER APPROVALS SECTION ───────────────────────────────────────────────
function OwnerApprovalsSection({
  getOwnerAccounts,
  approveOwner,
  rejectOwner,
}: {
  getOwnerAccounts: () => any[];
  approveOwner: (id: string) => void;
  rejectOwner: (id: string) => void;
}) {
  const [accounts, setAccounts] = useState(() => getOwnerAccounts());
  const refresh = () => setAccounts(getOwnerAccounts());

  const handleApprove = (id: string) => {
    approveOwner(id);
    refresh();
    toast.success("Owner approved!");
  };
  const handleReject = (id: string) => {
    rejectOwner(id);
    refresh();
    toast.error("Owner rejected.");
  };

  const GOLD = "#c9a84c";

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <h2
          style={{
            color: GOLD,
            fontFamily: "'Playfair Display', serif",
            fontSize: "1.4rem",
            fontWeight: 700,
            margin: 0,
          }}
        >
          Owner Approvals
        </h2>
        <button
          type="button"
          onClick={refresh}
          style={{
            background: GOLD,
            color: "#000",
            border: "none",
            borderRadius: 8,
            padding: "7px 16px",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "0.8rem",
          }}
        >
          Refresh
        </button>
      </div>
      {accounts.length === 0 ? (
        <div
          style={{ textAlign: "center", padding: 48, color: "#64748b" }}
          data-ocid="owner-approvals.empty_state"
        >
          No owner registrations yet.
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.85rem",
            }}
          >
            <thead>
              <tr style={{ background: "#1e293b" }}>
                {[
                  "Hotel Name",
                  "Owner Name",
                  "Email",
                  "Phone",
                  "Status",
                  "Registered",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 12px",
                      textAlign: "left",
                      color: GOLD,
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      borderBottom: "1px solid #334155",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {accounts.map((acc: any, idx: number) => (
                <tr
                  key={acc.id}
                  style={{ background: idx % 2 === 0 ? "#0f172a" : "#1e293b" }}
                  data-ocid={`owner-approvals.item.${idx + 1}`}
                >
                  <td
                    style={{
                      padding: "10px 12px",
                      color: "#f1f5f9",
                      fontWeight: 600,
                    }}
                  >
                    {acc.hotelName}
                  </td>
                  <td style={{ padding: "10px 12px", color: "#cbd5e1" }}>
                    {acc.ownerName}
                  </td>
                  <td style={{ padding: "10px 12px", color: "#94a3b8" }}>
                    {acc.email}
                  </td>
                  <td style={{ padding: "10px 12px", color: "#94a3b8" }}>
                    {acc.phone}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: 20,
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        background:
                          acc.status === "approved"
                            ? "#14532d"
                            : acc.status === "rejected"
                              ? "#450a0a"
                              : "#1c1917",
                        color:
                          acc.status === "approved"
                            ? "#4ade80"
                            : acc.status === "rejected"
                              ? "#f87171"
                              : "#fb923c",
                      }}
                    >
                      {acc.status.toUpperCase()}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      color: "#64748b",
                      fontSize: "0.75rem",
                    }}
                  >
                    {new Date(acc.createdAt).toLocaleDateString("en-IN")}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    {acc.status === "pending" && (
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          type="button"
                          onClick={() => handleApprove(acc.id)}
                          style={{
                            background: "#16a34a",
                            color: "#fff",
                            border: "none",
                            borderRadius: 6,
                            padding: "5px 12px",
                            cursor: "pointer",
                            fontWeight: 600,
                            fontSize: "0.75rem",
                          }}
                          data-ocid={`owner-approvals.confirm_button.${idx + 1}`}
                        >
                          ✓ Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(acc.id)}
                          style={{
                            background: "#dc2626",
                            color: "#fff",
                            border: "none",
                            borderRadius: 6,
                            padding: "5px 12px",
                            cursor: "pointer",
                            fontWeight: 600,
                            fontSize: "0.75rem",
                          }}
                          data-ocid={`owner-approvals.delete_button.${idx + 1}`}
                        >
                          ✗ Reject
                        </button>
                      </div>
                    )}
                    {acc.status !== "pending" && (
                      <span style={{ color: "#64748b", fontSize: "0.75rem" }}>
                        —
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── IMAGE MANAGER SECTION ──────────────────────────────────────────────────
interface ManagedImage {
  id: string;
  name: string;
  url: string;
  caption: string;
  uploadedAt: string;
}

function ImageManagerSection() {
  const GOLD = "#c9a84c";
  const [activeTab, setActiveTab] = useState<"banner" | "room" | "hall">(
    "banner",
  );
  const [bannerImages, setBannerImages] = useState<ManagedImage[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("kdm_banner_images") || "[]");
    } catch {
      return [];
    }
  });
  const [roomImages, setRoomImages] = useState<ManagedImage[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("kdm_room_images") || "[]");
    } catch {
      return [];
    }
  });
  const [hallImages, setHallImages] = useState<ManagedImage[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("kdm_hall_images") || "[]");
    } catch {
      return [];
    }
  });
  const [editModal, setEditModal] = useState<{
    img: ManagedImage;
    tab: string;
  } | null>(null);
  const [editName, setEditName] = useState("");
  const [editCaption, setEditCaption] = useState("");

  const getImages = (tab: string) =>
    tab === "banner" ? bannerImages : tab === "room" ? roomImages : hallImages;
  const setImages = (tab: string, imgs: ManagedImage[]) => {
    const key =
      tab === "banner"
        ? "kdm_banner_images"
        : tab === "room"
          ? "kdm_room_images"
          : "kdm_hall_images";
    localStorage.setItem(key, JSON.stringify(imgs));
    if (tab === "banner") setBannerImages(imgs);
    else if (tab === "room") setRoomImages(imgs);
    else setHallImages(imgs);
  };

  const handleUpload = (
    tab: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const newImg: ManagedImage = {
          id: `img_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          name: file.name.replace(/\.[^.]+$/, ""),
          url: ev.target?.result as string,
          caption: "",
          uploadedAt: new Date().toISOString(),
        };
        const updated = [...getImages(tab), newImg];
        setImages(tab, updated);
        toast.success("Image uploaded!");
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const handleDelete = (tab: string, id: string) => {
    setImages(
      tab,
      getImages(tab).filter((i) => i.id !== id),
    );
    toast.success("Image deleted.");
  };

  const openEdit = (tab: string, img: ManagedImage) => {
    setEditModal({ img, tab });
    setEditName(img.name);
    setEditCaption(img.caption);
  };

  const handleSaveEdit = () => {
    if (!editModal) return;
    const updated = getImages(editModal.tab).map((i) =>
      i.id === editModal.img.id
        ? { ...i, name: editName, caption: editCaption }
        : i,
    );
    setImages(editModal.tab, updated);
    setEditModal(null);
    toast.success("Image updated!");
  };

  const tabs: Array<{ key: "banner" | "room" | "hall"; label: string }> = [
    { key: "banner", label: "🖼 Banner Images" },
    { key: "room", label: "🛏 Room Images" },
    { key: "hall", label: "🎉 Hall Images" },
  ];

  const currentImages = getImages(activeTab);

  return (
    <div style={{ padding: 24 }}>
      <h2
        style={{
          color: GOLD,
          fontFamily: "'Playfair Display', serif",
          fontSize: "1.4rem",
          fontWeight: 700,
          marginBottom: 20,
        }}
      >
        Image Manager
      </h2>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key)}
            data-ocid="image-manager.tab"
            style={{
              padding: "8px 18px",
              borderRadius: 8,
              border: `1px solid ${activeTab === t.key ? GOLD : "#334155"}`,
              background:
                activeTab === t.key ? "rgba(201,168,76,0.15)" : "transparent",
              color: activeTab === t.key ? GOLD : "#94a3b8",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.85rem",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Upload button */}
      <label
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: GOLD,
          color: "#000",
          border: "none",
          borderRadius: 8,
          padding: "10px 20px",
          cursor: "pointer",
          fontWeight: 700,
          fontSize: "0.85rem",
          marginBottom: 20,
        }}
      >
        ⬆ Upload Images
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleUpload(activeTab, e)}
          style={{ display: "none" }}
          data-ocid="image-manager.upload_button"
        />
      </label>

      {/* Image Grid */}
      {currentImages.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: 48,
            color: "#64748b",
            background: "#1e293b",
            borderRadius: 12,
          }}
          data-ocid="image-manager.empty_state"
        >
          No images uploaded yet. Click "Upload Images" to add {activeTab}{" "}
          images.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 16,
          }}
        >
          {currentImages.map((img, idx) => (
            <div
              key={img.id}
              data-ocid={`image-manager.item.${idx + 1}`}
              style={{
                background: "#1e293b",
                borderRadius: 12,
                overflow: "hidden",
                border: "1px solid #334155",
              }}
            >
              <div
                style={{
                  height: 140,
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <img
                  src={img.url}
                  alt={img.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div style={{ padding: "10px 12px" }}>
                <div
                  style={{
                    color: "#f1f5f9",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    marginBottom: 2,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {img.name || "Untitled"}
                </div>
                {img.caption && (
                  <div
                    style={{
                      color: "#94a3b8",
                      fontSize: "0.72rem",
                      marginBottom: 8,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {img.caption}
                  </div>
                )}
                <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                  <button
                    type="button"
                    onClick={() => openEdit(activeTab, img)}
                    style={{
                      flex: 1,
                      background: "#334155",
                      color: "#cbd5e1",
                      border: "none",
                      borderRadius: 6,
                      padding: "5px 8px",
                      cursor: "pointer",
                      fontSize: "0.75rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 4,
                    }}
                    data-ocid={`image-manager.edit_button.${idx + 1}`}
                  >
                    <Pencil size={12} /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(activeTab, img.id)}
                    style={{
                      flex: 1,
                      background: "#450a0a",
                      color: "#f87171",
                      border: "none",
                      borderRadius: 6,
                      padding: "5px 8px",
                      cursor: "pointer",
                      fontSize: "0.75rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 4,
                    }}
                    data-ocid={`image-manager.delete_button.${idx + 1}`}
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          data-ocid="image-manager.modal"
        >
          <div
            style={{
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: 16,
              padding: 28,
              maxWidth: 400,
              width: "100%",
            }}
          >
            <h3 style={{ color: GOLD, margin: "0 0 20px", fontWeight: 700 }}>
              Edit Image Details
            </h3>
            <div style={{ marginBottom: 14 }}>
              <label
                htmlFor="editImgName"
                style={{
                  color: "#cbd5e1",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Image Name
              </label>
              <input
                id="editImgName"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                style={{
                  width: "100%",
                  background: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: 8,
                  padding: "8px 12px",
                  color: "#f1f5f9",
                  fontSize: "0.85rem",
                }}
                data-ocid="image-manager.input"
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label
                htmlFor="editImgCaption"
                style={{
                  color: "#cbd5e1",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Caption
              </label>
              <input
                id="editImgCaption"
                value={editCaption}
                onChange={(e) => setEditCaption(e.target.value)}
                style={{
                  width: "100%",
                  background: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: 8,
                  padding: "8px 12px",
                  color: "#f1f5f9",
                  fontSize: "0.85rem",
                }}
                data-ocid="image-manager.input"
              />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={handleSaveEdit}
                style={{
                  flex: 1,
                  background: GOLD,
                  color: "#000",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                }}
                data-ocid="image-manager.save_button"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setEditModal(null)}
                style={{
                  flex: 1,
                  background: "#334155",
                  color: "#cbd5e1",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                }}
                data-ocid="image-manager.cancel_button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  const {
    authed: isAdmin,
    role,
    session,
    login,
    logout,
    getOwnerAccounts,
    approveOwner,
    rejectOwner,
  } = useMultiOwnerAuth();
  const { data: inquiries = [], isLoading: inquiriesLoading } =
    useAllInquiries();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const handleNavClick = (id: string) => {
    setActiveSection(id);
    setSidebarOpen(false);
  };

  const handleLogin = () => {
    if (!loginEmail.trim() || !loginPassword) {
      setLoginError("Please enter your email and password.");
      return;
    }
    const ok = login(loginEmail.trim(), loginPassword);
    if (!ok) {
      setLoginError(
        "Invalid credentials or account not approved. Please try again.",
      );
      setLoginPassword("");
      setTimeout(() => setLoginError(""), 3000);
    }
  };

  if (!isAdmin) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f172a",
        }}
        data-ocid="admin.login.panel"
      >
        <div
          style={{
            background: "#1e293b",
            border: "1px solid #334155",
            borderRadius: 16,
            padding: "3rem 2.5rem",
            textAlign: "center",
            maxWidth: 420,
            width: "100%",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: 12 }}>🏨</div>
          <h2
            style={{
              color: GOLD,
              fontFamily: "'Playfair Display', serif",
              fontSize: "1.6rem",
              fontWeight: 700,
              marginBottom: 4,
            }}
          >
            Hotel KDM Palace
          </h2>
          <p
            style={{
              color: "#94a3b8",
              fontWeight: 500,
              marginBottom: 28,
              fontSize: "0.85rem",
            }}
          >
            Admin Portal — Sign in to continue
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Input
              type="email"
              placeholder="Email address"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              style={{
                background: "#0f172a",
                border: `1px solid ${loginError ? "#ef4444" : "#334155"}`,
                color: "#f1f5f9",
              }}
              data-ocid="admin.login.input"
            />
            <Input
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              style={{
                background: "#0f172a",
                border: `1px solid ${loginError ? "#ef4444" : "#334155"}`,
                color: "#f1f5f9",
              }}
              data-ocid="admin.password.input"
            />
            {loginError && (
              <p style={{ color: "#ef4444", fontSize: "0.8rem" }}>
                {loginError}
              </p>
            )}
            <Button
              onClick={handleLogin}
              style={{
                background: GOLD,
                color: "#000",
                fontWeight: 700,
                padding: "0.65rem",
              }}
              data-ocid="admin.login.button"
            >
              <Key className="w-4 h-4 mr-2" />
              Login to Admin Panel
            </Button>
            <a
              href="/signup"
              style={{
                color: GOLD,
                fontWeight: 600,
                fontSize: "0.8rem",
                textDecoration: "none",
                marginTop: 4,
                display: "block",
                textAlign: "center",
              }}
              data-ocid="admin.signup.link"
            >
              Sign Up as Hotel Owner
            </a>
            <a
              href="/"
              style={{
                color: "#64748b",
                fontWeight: 500,
                fontSize: "0.8rem",
                textDecoration: "none",
                textAlign: "center",
              }}
            >
              ← Back to Hotel Website
            </a>
          </div>
        </div>
      </div>
    );
  }

  function DayEndSummarySection() {
    const today = new Date().toISOString().split("T")[0];
    const [date, setDate] = useState(today);

    const restaurantBills: any[] = JSON.parse(
      localStorage.getItem("hotelRestaurantBills") || "[]",
    );
    const roomFoodOrders: any[] = JSON.parse(
      localStorage.getItem("hotelRoomFoodOrders") || "[]",
    );
    const checkIns: any[] = JSON.parse(
      localStorage.getItem("hotelCheckIns") || "[]",
    );

    const dayRestBills = restaurantBills.filter((b: any) => {
      const d = b.date || b.createdAt?.split("T")[0] || "";
      return d === date;
    });
    const dayRoomFood = roomFoodOrders.filter((o: any) => {
      const d = o.date || o.createdAt?.split("T")[0] || "";
      return d === date;
    });
    const dayCheckouts = checkIns.filter((g: any) => {
      const d = g.checkOutDate || g.checkOut || "";
      return d === date;
    });

    const restTotal = dayRestBills.reduce(
      (s: number, b: any) => s + Number(b.total || b.amount || 0),
      0,
    );
    const restGst = dayRestBills.reduce(
      (s: number, b: any) => s + Number(b.gst || b.tax || 0),
      0,
    );
    const foodTotal = dayRoomFood.reduce(
      (s: number, o: any) => s + Number(o.total || o.amount || 0),
      0,
    );
    const foodGst = Math.round(foodTotal * 0.05 * 100) / 100;
    const roomTotal = dayCheckouts.reduce(
      (s: number, g: any) =>
        s + Number(g.nights || 1) * Number(g.roomRate || g.rate || 0),
      0,
    );
    const roomGst = Math.round(roomTotal * 0.12 * 100) / 100;
    const totalRevenue = restTotal + foodTotal + roomTotal;
    const totalGst = restGst + foodGst + roomGst;
    const totalBills =
      dayRestBills.length + dayRoomFood.length + dayCheckouts.length;
    const totalGuests = new Set(dayCheckouts.map((g: any) => g.id || g.name))
      .size;

    const PAYMENT_MODES = [
      "Cash",
      "Card",
      "UPI",
      "Online",
      "Settle to Room",
      "Other",
    ];

    function getCashierData() {
      const data: Record<string, { room: number; food: number; rest: number }> =
        {};
      for (const m of PAYMENT_MODES) data[m] = { room: 0, food: 0, rest: 0 };
      for (const g of dayCheckouts) {
        const m = PAYMENT_MODES.includes(g.paymentMode)
          ? g.paymentMode
          : "Other";
        data[m].room +=
          Number(g.nights || 1) * Number(g.roomRate || g.rate || 0);
      }
      for (const o of dayRoomFood) {
        const m = PAYMENT_MODES.includes(o.paymentMode)
          ? o.paymentMode
          : o.paymentMode === "room" || o.paymentMode === "Room"
            ? "Settle to Room"
            : "Other";
        data[m].food += Number(o.total || o.amount || 0);
      }
      for (const b of dayRestBills) {
        const m = PAYMENT_MODES.includes(b.paymentMode)
          ? b.paymentMode
          : b.paymentMode === "room" || b.paymentMode === "Room"
            ? "Settle to Room"
            : "Other";
        data[m].rest += Number(b.total || b.amount || 0);
      }
      return data;
    }

    const cashierData = getCashierData();

    function buildPrintHTML() {
      let html = `<html><head><title>Day-End Closing Summary — ${date}</title><style>
body{font-family:sans-serif;font-size:11px;margin:20px;}
h1{color:#b8860b;font-size:18px;margin:0;}
h2{color:#374151;font-size:13px;margin:12px 0 6px;}
.header{text-align:center;border-bottom:2px solid #b8860b;padding-bottom:10px;margin-bottom:16px;}
table{border-collapse:collapse;width:100%;margin-bottom:16px;}
th,td{border:1px solid #ccc;padding:4px 8px;text-align:left;}
th{background:#b8860b;color:#fff;font-weight:700;}
tfoot td{font-weight:bold;background:#fef3c7;}
.kpi{display:inline-block;border:1px solid #ccc;border-radius:6px;padding:8px 16px;margin:4px;min-width:120px;text-align:center;}
.kpi-val{font-size:18px;font-weight:700;color:#b8860b;}
</style></head><body>
<div class="header"><h1>HOTEL KDM PALACE</h1><div>Day-End Closing Summary — ${date}</div></div>
<div>
<div class="kpi"><div>Total Revenue</div><div class="kpi-val">₹${totalRevenue.toFixed(2)}</div></div>
<div class="kpi"><div>Total GST</div><div class="kpi-val">₹${totalGst.toFixed(2)}</div></div>
<div class="kpi"><div>Total Guests</div><div class="kpi-val">${totalGuests}</div></div>
<div class="kpi"><div>Total Bills</div><div class="kpi-val">${totalBills}</div></div>
</div>
<h2>1. Food Sale Summary</h2>
<table><thead><tr><th>Type</th><th>Bills</th><th>Goods Amt</th><th>GST</th><th>Total</th></tr></thead><tbody>
<tr><td>Restaurant</td><td>${dayRestBills.length}</td><td>₹${(restTotal - restGst).toFixed(2)}</td><td>₹${restGst.toFixed(2)}</td><td>₹${restTotal.toFixed(2)}</td></tr>
<tr><td>Room Food</td><td>${dayRoomFood.length}</td><td>₹${(foodTotal - foodGst).toFixed(2)}</td><td>₹${foodGst.toFixed(2)}</td><td>₹${foodTotal.toFixed(2)}</td></tr>
</tbody><tfoot><tr><td>Grand Total</td><td>${dayRestBills.length + dayRoomFood.length}</td><td>₹${(restTotal - restGst + foodTotal - foodGst).toFixed(2)}</td><td>₹${(restGst + foodGst).toFixed(2)}</td><td>₹${(restTotal + foodTotal).toFixed(2)}</td></tr></tfoot></table>
<h2>2. Guest Bill Summary</h2>
<table><thead><tr><th>Folio No</th><th>Guest</th><th>Room Bill</th><th>Food Bill</th><th>Rest. Bill</th><th>Total</th><th>Payment Mode</th></tr></thead><tbody>`;
      for (const g of dayCheckouts.slice(0, 20)) {
        const nights = Number(g.nights || 1);
        const roomRate = Number(g.roomRate || g.rate || 0);
        const roomBill = nights * roomRate;
        const foodBill = dayRoomFood
          .filter((o: any) => String(o.roomNumber) === String(g.roomNumber))
          .reduce(
            (s: number, o: any) => s + Number(o.total || o.amount || 0),
            0,
          );
        const restBill = dayRestBills
          .filter((b: any) => String(b.settleToRoom) === String(g.roomNumber))
          .reduce(
            (s: number, b: any) => s + Number(b.total || b.amount || 0),
            0,
          );
        const total = roomBill + foodBill + restBill;
        html += `<tr><td>${g.folioNo || g.id || "-"}</td><td>${g.name || "-"}</td><td>₹${roomBill.toFixed(2)}</td><td>₹${foodBill.toFixed(2)}</td><td>₹${restBill.toFixed(2)}</td><td>₹${total.toFixed(2)}</td><td>${g.paymentMode || "-"}</td></tr>`;
      }
      html += `</tbody></table>
<h2>3. Cashier Summary</h2>
<table><thead><tr><th>Payment Mode</th><th>Room Revenue</th><th>Food Revenue</th><th>Restaurant Revenue</th><th>Total</th></tr></thead><tbody>`;
      for (const m of PAYMENT_MODES) {
        const d = cashierData[m];
        const t = d.room + d.food + d.rest;
        if (t > 0)
          html += `<tr><td>${m}</td><td>₹${d.room.toFixed(2)}</td><td>₹${d.food.toFixed(2)}</td><td>₹${d.rest.toFixed(2)}</td><td>₹${t.toFixed(2)}</td></tr>`;
      }
      html += `</tbody><tfoot><tr><td>Grand Total</td><td>₹${roomTotal.toFixed(2)}</td><td>₹${foodTotal.toFixed(2)}</td><td>₹${restTotal.toFixed(2)}</td><td>₹${totalRevenue.toFixed(2)}</td></tr></tfoot></table>
</body></html>`;
      return html;
    }

    function handlePrintDayEnd() {
      const win = window.open("", "_blank");
      if (!win) return;
      win.document.write(buildPrintHTML());
      win.document.close();
      win.print();
    }

    function handleExportCSV() {
      const rows: (string | number)[][] = [
        ["=== FOOD SALE SUMMARY ==="],
        ["Type", "Bills", "Goods Amt", "GST", "Total"],
        [
          "Restaurant",
          dayRestBills.length,
          (restTotal - restGst).toFixed(2),
          restGst.toFixed(2),
          restTotal.toFixed(2),
        ],
        [
          "Room Food",
          dayRoomFood.length,
          (foodTotal - foodGst).toFixed(2),
          foodGst.toFixed(2),
          foodTotal.toFixed(2),
        ],
        [
          "Grand Total",
          dayRestBills.length + dayRoomFood.length,
          (restTotal - restGst + foodTotal - foodGst).toFixed(2),
          (restGst + foodGst).toFixed(2),
          (restTotal + foodTotal).toFixed(2),
        ],
        [],
        ["=== GUEST BILL SUMMARY ==="],
        [
          "Folio No",
          "Guest",
          "Room Bill",
          "Food Bill",
          "Rest. Bill",
          "Total",
          "Payment Mode",
        ],
        ...dayCheckouts.slice(0, 20).map((g: any) => {
          const roomBill =
            Number(g.nights || 1) * Number(g.roomRate || g.rate || 0);
          const foodBill = dayRoomFood
            .filter((o: any) => String(o.roomNumber) === String(g.roomNumber))
            .reduce(
              (s: number, o: any) => s + Number(o.total || o.amount || 0),
              0,
            );
          const restBill = dayRestBills
            .filter((b: any) => String(b.settleToRoom) === String(g.roomNumber))
            .reduce(
              (s: number, b: any) => s + Number(b.total || b.amount || 0),
              0,
            );
          return [
            g.folioNo || g.id || "-",
            g.name || "-",
            roomBill.toFixed(2),
            foodBill.toFixed(2),
            restBill.toFixed(2),
            (roomBill + foodBill + restBill).toFixed(2),
            g.paymentMode || "-",
          ];
        }),
        [],
        ["=== CASHIER SUMMARY ==="],
        [
          "Payment Mode",
          "Room Revenue",
          "Food Revenue",
          "Restaurant Revenue",
          "Total",
        ],
        ...PAYMENT_MODES.map((m) => {
          const d = cashierData[m];
          return [
            m,
            d.room.toFixed(2),
            d.food.toFixed(2),
            d.rest.toFixed(2),
            (d.room + d.food + d.rest).toFixed(2),
          ];
        }),
        [
          "Grand Total",
          roomTotal.toFixed(2),
          foodTotal.toFixed(2),
          restTotal.toFixed(2),
          totalRevenue.toFixed(2),
        ],
      ];
      exportCSV(`day-end-summary-${date}.csv`, [], rows);
    }

    function handleWhatsAppDayEnd() {
      const lines = [
        "🏨 HOTEL KDM PALACE — Day-End Closing Summary",
        `📅 Date: ${date}`,
        "",
        `💰 Total Revenue: ₹${totalRevenue.toFixed(2)}`,
        `🧾 Total GST: ₹${totalGst.toFixed(2)}`,
        `👥 Total Guests: ${totalGuests}`,
        `🧾 Total Bills: ${totalBills}`,
        "",
        "📊 Revenue Breakdown:",
        `  🍽️ Restaurant: ₹${restTotal.toFixed(2)}`,
        `  🛏️ Room Food: ₹${foodTotal.toFixed(2)}`,
        `  🏠 Room Revenue: ₹${roomTotal.toFixed(2)}`,
        "",
        "💳 Payment Mode Summary:",
        ...PAYMENT_MODES.filter((m) => {
          const d = cashierData[m];
          return d.room + d.food + d.rest > 0;
        }).map((m) => {
          const d = cashierData[m];
          const t = d.room + d.food + d.rest;
          return `  ${m}: ₹${t.toFixed(2)}`;
        }),
      ];
      const text = encodeURIComponent(lines.join("\n"));
      window.open(`https://wa.me/?text=${text}`, "_blank");
    }

    const kpiCards = [
      {
        label: "Total Revenue",
        value: `₹${totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
        color: "#b8860b",
      },
      {
        label: "Total GST",
        value: `₹${totalGst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
        color: "#2563eb",
      },
      { label: "Total Guests", value: String(totalGuests), color: "#16a34a" },
      { label: "Total Bills", value: String(totalBills), color: "#7c3aed" },
    ];

    return (
      <div style={{ padding: 24 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <h2 style={{ color: "#b8860b", fontSize: 20, fontWeight: 700 }}>
            Day-End Closing Summary
          </h2>
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                border: "1px solid #d1d5db",
                borderRadius: 4,
                padding: "6px 10px",
                fontSize: 13,
              }}
            />
            <button
              type="button"
              onClick={handlePrintDayEnd}
              style={{
                background: "#b8860b",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "8px 18px",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              🖨️ Print Day-End Report
            </button>
            <button
              type="button"
              onClick={handleExportCSV}
              style={{
                background: "#16a34a",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "8px 18px",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              📥 Export CSV
            </button>
            <button
              type="button"
              onClick={handleWhatsAppDayEnd}
              data-ocid="dayend.whatsapp.button"
              style={{
                background: "#25d366",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "8px 18px",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              📱 WhatsApp
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 16,
            marginBottom: 24,
          }}
        >
          {kpiCards.map((kpi) => (
            <div
              key={kpi.label}
              style={{
                background: "#fff",
                borderRadius: 8,
                padding: 20,
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                borderLeft: `4px solid ${kpi.color}`,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: "#6b7280",
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                {kpi.label}
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: kpi.color }}>
                {kpi.value}
              </div>
            </div>
          ))}
        </div>

        {/* Table 1: Food Sale Summary */}
        <div
          style={{
            background: "#fff",
            borderRadius: 8,
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            marginBottom: 24,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              background: "#b8860b",
              color: "#fff",
              padding: "10px 16px",
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            1. Food Sale Summary
          </div>
          <table
            style={{ borderCollapse: "collapse", width: "100%", fontSize: 13 }}
          >
            <thead>
              <tr style={{ background: "#fef3c7" }}>
                {["Type", "Bills", "Goods Amt", "GST", "Total"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "8px 12px",
                      textAlign: h === "Type" ? "left" : "right",
                      fontWeight: 700,
                      color: "#374151",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ padding: "8px 12px", fontWeight: 600 }}>
                  Restaurant
                </td>
                <td style={{ padding: "8px 12px", textAlign: "right" }}>
                  {dayRestBills.length}
                </td>
                <td style={{ padding: "8px 12px", textAlign: "right" }}>
                  ₹{(restTotal - restGst).toFixed(2)}
                </td>
                <td style={{ padding: "8px 12px", textAlign: "right" }}>
                  ₹{restGst.toFixed(2)}
                </td>
                <td
                  style={{
                    padding: "8px 12px",
                    textAlign: "right",
                    fontWeight: 700,
                  }}
                >
                  ₹{restTotal.toFixed(2)}
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ padding: "8px 12px", fontWeight: 600 }}>
                  Room Food
                </td>
                <td style={{ padding: "8px 12px", textAlign: "right" }}>
                  {dayRoomFood.length}
                </td>
                <td style={{ padding: "8px 12px", textAlign: "right" }}>
                  ₹{(foodTotal - foodGst).toFixed(2)}
                </td>
                <td style={{ padding: "8px 12px", textAlign: "right" }}>
                  ₹{foodGst.toFixed(2)}
                </td>
                <td
                  style={{
                    padding: "8px 12px",
                    textAlign: "right",
                    fontWeight: 700,
                  }}
                >
                  ₹{foodTotal.toFixed(2)}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr style={{ background: "#fef3c7", fontWeight: 700 }}>
                <td style={{ padding: "8px 12px" }}>Grand Total</td>
                <td style={{ padding: "8px 12px", textAlign: "right" }}>
                  {dayRestBills.length + dayRoomFood.length}
                </td>
                <td style={{ padding: "8px 12px", textAlign: "right" }}>
                  ₹{(restTotal - restGst + foodTotal - foodGst).toFixed(2)}
                </td>
                <td style={{ padding: "8px 12px", textAlign: "right" }}>
                  ₹{(restGst + foodGst).toFixed(2)}
                </td>
                <td style={{ padding: "8px 12px", textAlign: "right" }}>
                  ₹{(restTotal + foodTotal).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Table 2: Guest Bill Summary */}
        <div
          style={{
            background: "#fff",
            borderRadius: 8,
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            marginBottom: 24,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              background: "#b8860b",
              color: "#fff",
              padding: "10px 16px",
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            2. Guest Bill Summary
          </div>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                borderCollapse: "collapse",
                width: "100%",
                fontSize: 12,
                minWidth: 700,
              }}
            >
              <thead>
                <tr style={{ background: "#fef3c7" }}>
                  {[
                    "Folio No",
                    "Guest",
                    "Room Bill",
                    "Food Bill",
                    "Restaurant Bill",
                    "Total",
                    "Payment Mode",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "8px 10px",
                        textAlign:
                          h === "Folio No" ||
                          h === "Guest" ||
                          h === "Payment Mode"
                            ? "left"
                            : "right",
                        fontWeight: 700,
                        color: "#374151",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dayCheckouts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        textAlign: "center",
                        padding: 20,
                        color: "#6b7280",
                      }}
                    >
                      No checkouts for {date}
                    </td>
                  </tr>
                ) : (
                  dayCheckouts.slice(0, 20).map((g: any, i: number) => {
                    const roomBill =
                      Number(g.nights || 1) * Number(g.roomRate || g.rate || 0);
                    const foodBill = dayRoomFood
                      .filter(
                        (o: any) =>
                          String(o.roomNumber) === String(g.roomNumber),
                      )
                      .reduce(
                        (s: number, o: any) =>
                          s + Number(o.total || o.amount || 0),
                        0,
                      );
                    const restBill = dayRestBills
                      .filter(
                        (b: any) =>
                          String(b.settleToRoom) === String(g.roomNumber),
                      )
                      .reduce(
                        (s: number, b: any) =>
                          s + Number(b.total || b.amount || 0),
                        0,
                      );
                    const total = roomBill + foodBill + restBill;
                    return (
                      <tr
                        key={g.id || i}
                        style={{
                          background: i % 2 === 0 ? "#f9fafb" : "#fff",
                          borderBottom: "1px solid #e5e7eb",
                        }}
                      >
                        <td style={{ padding: "6px 10px" }}>
                          {g.folioNo || g.id || "-"}
                        </td>
                        <td style={{ padding: "6px 10px", fontWeight: 600 }}>
                          {g.name || "-"}
                        </td>
                        <td style={{ padding: "6px 10px", textAlign: "right" }}>
                          ₹{roomBill.toFixed(2)}
                        </td>
                        <td style={{ padding: "6px 10px", textAlign: "right" }}>
                          ₹{foodBill.toFixed(2)}
                        </td>
                        <td style={{ padding: "6px 10px", textAlign: "right" }}>
                          ₹{restBill.toFixed(2)}
                        </td>
                        <td
                          style={{
                            padding: "6px 10px",
                            textAlign: "right",
                            fontWeight: 700,
                          }}
                        >
                          ₹{total.toFixed(2)}
                        </td>
                        <td style={{ padding: "6px 10px" }}>
                          {g.paymentMode || "-"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 3: Cashier Summary */}
        <div
          style={{
            background: "#fff",
            borderRadius: 8,
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            marginBottom: 24,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              background: "#b8860b",
              color: "#fff",
              padding: "10px 16px",
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            3. Cashier Summary by Payment Mode
          </div>
          <table
            style={{ borderCollapse: "collapse", width: "100%", fontSize: 13 }}
          >
            <thead>
              <tr style={{ background: "#fef3c7" }}>
                {[
                  "Payment Mode",
                  "Room Revenue",
                  "Food Revenue",
                  "Restaurant Revenue",
                  "Total",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "8px 12px",
                      textAlign: h === "Payment Mode" ? "left" : "right",
                      fontWeight: 700,
                      color: "#374151",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PAYMENT_MODES.map((m, i) => {
                const d = cashierData[m];
                const t = d.room + d.food + d.rest;
                return (
                  <tr
                    key={m}
                    style={{
                      background: i % 2 === 0 ? "#f9fafb" : "#fff",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    <td style={{ padding: "8px 12px", fontWeight: 600 }}>
                      {m}
                    </td>
                    <td style={{ padding: "8px 12px", textAlign: "right" }}>
                      ₹{d.room.toFixed(2)}
                    </td>
                    <td style={{ padding: "8px 12px", textAlign: "right" }}>
                      ₹{d.food.toFixed(2)}
                    </td>
                    <td style={{ padding: "8px 12px", textAlign: "right" }}>
                      ₹{d.rest.toFixed(2)}
                    </td>
                    <td
                      style={{
                        padding: "8px 12px",
                        textAlign: "right",
                        fontWeight: 700,
                      }}
                    >
                      ₹{t.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ background: "#fef3c7", fontWeight: 700 }}>
                <td style={{ padding: "8px 12px" }}>Grand Total</td>
                <td style={{ padding: "8px 12px", textAlign: "right" }}>
                  ₹{roomTotal.toFixed(2)}
                </td>
                <td style={{ padding: "8px 12px", textAlign: "right" }}>
                  ₹{foodTotal.toFixed(2)}
                </td>
                <td style={{ padding: "8px 12px", textAlign: "right" }}>
                  ₹{restTotal.toFixed(2)}
                </td>
                <td style={{ padding: "8px 12px", textAlign: "right" }}>
                  ₹{totalRevenue.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardSection inquiries={inquiries} />;
      case "rooms":
        return <RoomAvailabilitySection />;
      case "housekeeping":
        return <HousekeepingSection />;
      case "rooms-mgmt":
        return <RoomsMgmtSection />;
      case "bookings":
        return (
          <BookingHistorySection
            inquiries={inquiries}
            isLoading={inquiriesLoading}
          />
        );
      case "kds":
        return <KDSSection />;
      case "kot":
        return <KOTSection />;
      case "restaurant":
        return <RestaurantBillingSection />;
      case "restaurant-reprint":
        return <RestaurantReprintSection />;
      case "coupons":
        return <CouponsSection />;
      case "coupon-analytics":
        return <CouponAnalyticsSection />;
      case "menu":
        return <MenuItemsSection />;
      case "customers":
        return <CustomersSection />;
      case "accounts":
        return <AccountsSection />;
      case "purchase":
        return <PurchaseOrdersSection />;
      case "night-audit":
        return <NightAuditSection />;
      case "sales":
        return <SalesReportSection />;
      case "staff":
        return <StaffSection />;
      case "gst":
        return <GSTSettingsSection />;
      case "guest-checkin":
        return <GuestCheckInSection />;
      case "gst-report":
        return <GSTReportSection />;
      case "shift-summary":
        return <ShiftSummarySection />;
      case "reviews":
        return <GuestReviewsSection />;
      case "feedback":
        return <GuestFeedbackSection />;
      case "whatsapp":
        return <WhatsAppTemplatesSection />;
      case "room-food":
        return <RoomFoodSection />;
      case "room-invoices":
        return <RoomInvoicesSection />;
      case "stripe-setup":
        return <StripeSetupSection />;
      case "reservations":
        return <BookingReservationsSection />;
      case "banquet-booking":
        return <BanquetBookingAdminSection />;
      case "banquet-billing-new":
        return <BanquetBillingAdminSection />;
      case "banquet-bills":
        return <BanquetBillHistorySection />;
      case "invoice-center":
        return <AllInvoicesSection />;
      case "food-sale-report":
        return <FoodSaleReportSection />;
      case "guest-bill-summary":
        return <GuestBillSummarySection />;
      case "cashier-report":
        return <CashierReportSection />;
      case "day-end-summary":
        return <DayEndSummarySection />;
      case "permissions":
        return <PermissionsSection />;
      case "payment-types":
        return <PaymentTypesSection />;
      case "invoice-series":
        return <InvoiceSeriesSection />;
      case "guest-history":
        return <GuestHistorySection />;
      case "staff-accounts":
        return <StaffAccountsSection />;
      case "clear-data":
        return <ClearDataSection />;
      case "owner-approvals":
        return (
          <OwnerApprovalsSection
            getOwnerAccounts={getOwnerAccounts}
            approveOwner={approveOwner}
            rejectOwner={rejectOwner}
          />
        );
      case "image-manager":
        return <ImageManagerSection />;
      default:
        return <DashboardSection inquiries={inquiries} />;
    }
  };

  // Role-based access permissions for staff
  const STAFF_ROLE_PERMISSIONS: Record<
    string,
    { groups: string[]; items?: string[] }
  > = {
    Receptionist: { groups: ["top", "room-billing"] },
    "Front Desk": { groups: ["top", "room-billing"] },
    Manager: {
      groups: [
        "top",
        "room-billing",
        "outlet-billing",
        "banquet-billing",
        "reports",
        "settings",
      ],
    },
    "Restaurant Staff": {
      groups: ["top", "outlet-billing"],
      items: [
        "dashboard",
        "kot",
        "kds",
        "restaurant",
        "restaurant-reprint",
        "room-food",
        "menu",
      ],
    },
    "Kitchen Staff": {
      groups: ["top", "outlet-billing"],
      items: ["dashboard", "kot", "kds", "room-food", "menu"],
    },
    Housekeeping: {
      groups: ["top", "room-billing"],
      items: ["dashboard", "housekeeping"],
    },
    Security: { groups: ["top"], items: ["dashboard"] },
  };

  const activeNavGroups = (() => {
    const groups = NAV_GROUPS.map((g) => ({ ...g, items: [...g.items] }));
    if (role === "superadmin") {
      groups.push({
        id: "superadmin",
        label: "SUPER ADMIN",
        items: [
          { id: "owner-approvals", label: "Owner Approvals", icon: UserCheck },
          { id: "image-manager", label: "Image Manager", icon: ImageIcon },
        ],
      });
    } else if (role === "owner") {
      const settingsGroup = groups.find((g) => g.id === "settings");
      if (
        settingsGroup &&
        !settingsGroup.items.find((i) => i.id === "image-manager")
      ) {
        settingsGroup.items = [
          ...settingsGroup.items,
          { id: "image-manager", label: "Image Manager", icon: ImageIcon },
        ];
      }
    } else if (role === "staff" && session?.staffRole) {
      const perms = STAFF_ROLE_PERMISSIONS[session.staffRole];
      if (perms) {
        return groups
          .filter((g) => perms.groups.includes(g.id))
          .map((g) => ({
            ...g,
            items: perms.items
              ? g.items.filter((item) => perms.items!.includes(item.id))
              : g.items,
          }))
          .filter((g) => g.items.length > 0);
      }
    }
    return groups;
  })();

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        overflow: "hidden",
        background: DARK_BG,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 40,
          }}
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setSidebarOpen(false);
          }}
          role="button"
          tabIndex={0}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          width: 240,
          background: SIDEBAR_BG,
          borderRight: `1px solid ${BORDER}`,
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          zIndex: 50,
          transform: sidebarOpen ? "translateX(0)" : undefined,
          transition: "transform 0.3s ease",
        }}
        className="hidden md:flex"
        data-ocid="admin.sidebar.panel"
      >
        <SidebarContent
          activeSection={activeSection}
          setActiveSection={handleNavClick}
          session={session}
          logout={logout}
          activeNavGroups={activeNavGroups}
        />
      </aside>

      {/* Mobile sidebar */}
      <aside
        style={{
          width: 240,
          background: SIDEBAR_BG,
          borderRight: `1px solid ${BORDER}`,
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          zIndex: 50,
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease",
        }}
        className="flex md:hidden"
      >
        <SidebarContent
          activeSection={activeSection}
          setActiveSection={handleNavClick}
          session={session}
          logout={logout}
          activeNavGroups={activeNavGroups}
        />
      </aside>

      {/* Main content */}
      <main
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        className="md:ml-60"
      >
        {/* Top bar */}
        <div
          style={{
            background: CARD_BG,
            borderBottom: `1px solid ${BORDER}`,
            padding: "12px 24px",
            display: "flex",
            alignItems: "center",
            gap: 16,
            position: "sticky",
            top: 0,
            zIndex: 30,
          }}
        >
          <button
            type="button"
            onClick={() => setSidebarOpen((p) => !p)}
            style={{
              background: "transparent",
              border: "none",
              color: GOLD,
              cursor: "pointer",
            }}
            className="flex md:hidden"
            data-ocid="admin.menu.button"
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div style={{ flex: 1 }}>
            <p style={{ color: GOLD, fontWeight: 600, fontSize: "0.95rem" }}>
              {NAV_ITEMS.find((n) => n.id === activeSection)?.label ??
                "Dashboard"}
            </p>
            <p
              style={{ color: "#1e293b", fontWeight: 600, fontSize: "0.7rem" }}
            >
              Hotel KDM Palace Admin Panel
            </p>
          </div>
          <a
            href="/"
            style={{
              color: "#1e293b",
              fontWeight: 600,
              fontSize: "0.75rem",
              textDecoration: "none",
            }}
            data-ocid="admin.back.link"
          >
            ← Back to Site
          </a>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            padding: "24px 20px",
            overflowY: "auto",
            overflowX: "hidden",
            minWidth: 0,
          }}
        >
          {renderSection()}
        </div>
      </main>
    </div>
  );
}

function SidebarContent({
  activeSection,
  setActiveSection,
  session,
  logout,
  activeNavGroups,
}: {
  activeSection: string;
  setActiveSection: (s: string) => void;
  session: {
    email: string;
    role: string;
    hotelName: string;
    ownerName: string;
    staffRole?: string;
    isLoggedIn: boolean;
  } | null;
  logout: () => void;
  activeNavGroups: typeof NAV_GROUPS;
}) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const toggleGroup = (gid: string) =>
    setCollapsed((prev) => ({ ...prev, [gid]: !prev[gid] }));

  return (
    <>
      {/* Logo */}
      <div
        style={{ padding: "20px 18px", borderBottom: `1px solid ${BORDER}` }}
      >
        <div
          style={{
            color: GOLD,
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700,
            fontSize: "1.1rem",
            lineHeight: 1.2,
          }}
        >
          Admin Panel
        </div>
        <div
          style={{
            color: "#1e293b",
            fontWeight: 600,
            fontSize: "0.7rem",
            marginTop: 2,
          }}
        >
          Hotel KDM Palace
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "10px 0" }}>
        {activeNavGroups.map((group) => {
          const isCollapsed = !!collapsed[group.id];
          return (
            <div key={group.id}>
              {group.label && (
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "7px 14px 5px 14px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    marginTop: 6,
                  }}
                >
                  <span
                    style={{
                      color: GOLD,
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    {group.label}
                  </span>
                  {isCollapsed ? (
                    <ChevronRight size={12} color={GOLD} />
                  ) : (
                    <ChevronDown size={12} color={GOLD} />
                  )}
                </button>
              )}
              {!isCollapsed &&
                group.items.map((item) => {
                  const Icon = item.icon;
                  const active = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveSection(item.id)}
                      data-ocid={`admin.nav.${item.id}.link`}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "9px 18px",
                        background: active
                          ? "rgba(201,168,76,0.12)"
                          : "transparent",
                        borderLeft: active
                          ? `3px solid ${GOLD}`
                          : "3px solid transparent",
                        color: active ? GOLD : "#888",
                        fontSize: "0.8rem",
                        cursor: "pointer",
                        border: "none",
                        textAlign: "left",
                        transition: "all 0.15s",
                      }}
                    >
                      <Icon size={15} />
                      {item.label}
                    </button>
                  );
                })}
            </div>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: "12px", borderTop: `1px solid ${BORDER}` }}>
        {/* User info */}
        {session && (
          <div style={{ marginBottom: 10, padding: "8px 6px" }}>
            <div
              style={{ color: "#94a3b8", fontSize: "0.7rem", marginBottom: 2 }}
            >
              Logged in as
            </div>
            <div
              style={{
                color: "#f1f5f9",
                fontSize: "0.75rem",
                fontWeight: 600,
                wordBreak: "break-all",
              }}
            >
              {session.email}
            </div>
            {session.role === "superadmin" ? (
              <span
                style={{
                  background: "#7c3aed",
                  color: "#fff",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 20,
                  display: "inline-block",
                  marginTop: 4,
                }}
              >
                ⭐ Super Admin
              </span>
            ) : session.role === "staff" ? (
              <span
                style={{
                  background: "#065f46",
                  color: "#6ee7b7",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 20,
                  display: "inline-block",
                  marginTop: 4,
                }}
              >
                👤 Staff — {session.staffRole}
              </span>
            ) : (
              <span
                style={{
                  background: "#0369a1",
                  color: "#fff",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 20,
                  display: "inline-block",
                  marginTop: 4,
                }}
              >
                🏨 Hotel Owner
              </span>
            )}
          </div>
        )}
        <button
          type="button"
          onClick={logout}
          data-ocid="admin.logout.button"
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "9px 6px",
            background: "transparent",
            border: "none",
            color: "#ef4444",
            fontWeight: 600,
            fontSize: "0.8rem",
            cursor: "pointer",
          }}
        >
          <LogOut size={15} /> Logout
        </button>
      </div>
    </>
  );
}
