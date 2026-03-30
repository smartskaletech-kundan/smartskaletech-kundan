import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface RestaurantDue {
    id: string;
    customerName: string;
    dueDate: bigint;
    description: string;
    isPaid: boolean;
    customerId: string;
    amount: number;
}
export interface MenuCategory {
    id: string;
    sortOrder: bigint;
    name: string;
}
export interface RestaurantBill {
    id: string;
    customerName?: string;
    createdAt: bigint;
    tableId: string;
    gstAmount: number;
    orderId: string;
    totalAmount: number;
    discount: number;
    paymentMode: PaymentMode;
    items: Array<OrderItem>;
    subtotal: number;
}
export interface RestaurantTable {
    id: string;
    status: TableStatus;
    seats: bigint;
    currentOrderId?: string;
}
export interface OrderItem {
    qty: bigint;
    name: string;
    notes: string;
    price: number;
    menuItemId: string;
}
export interface GuestCheckIn {
    id: string;
    status: GuestCheckInStatus;
    createdAt: bigint;
    checkInDate: string;
    guestName: string;
    roomNumber: string;
    children: bigint;
    idNumber: string;
    totalAmount: number;
    notes: string;
    advancePaid: number;
    adults: bigint;
    expectedCheckOut: string;
    phone: string;
    idType: string;
    actualCheckOut: string;
}
export interface RoomFoodOrder {
    id: string;
    roomNumber: string;
    guestName: string;
    items: Array<OrderItem>;
    totalAmount: number;
    gstAmount: number;
    paymentMode: PaymentMode;
    notes: string;
    createdAt: bigint;
    isPaid: boolean;
}
export interface RoomInvoice {
    id: string;
    guestCheckInId: string;
    guestName: string;
    roomNumber: string;
    roomType: string;
    checkInDate: string;
    checkOutDate: string;
    nights: bigint;
    roomRate: number;
    roomCharges: number;
    foodCharges: number;
    otherCharges: number;
    discount: number;
    gstPercent: number;
    gstAmount: number;
    totalAmount: number;
    advancePaid: number;
    balanceDue: number;
    paymentMode: PaymentMode;
    notes: string;
    createdAt: bigint;
}
export interface BookingInquiry {
    checkIn: string;
    name: string;
    email: string;
    message: string;
    timestamp: bigint;
    checkOut: string;
    phone: string;
    guests: bigint;
    roomType: string;
}
export interface RestaurantOrder {
    id: string;
    customerName?: string;
    status: OrderStatus;
    createdAt: bigint;
    tableId: string;
    gstAmount: number;
    totalAmount: number;
    items: Array<OrderItem>;
}
export interface RestaurantCustomer {
    id: string;
    name: string;
    email: string;
    loyaltyPoints: bigint;
    totalSpend: number;
    address: string;
    phone: string;
}
export interface RestaurantExpense {
    id: string;
    date: bigint;
    description: string;
    paymentMode: PaymentMode;
    category: string;
    amount: number;
}
export type InquiryDetails = {
    __kind__: "contact";
    contact: ContactInquiry;
} | {
    __kind__: "banquet";
    banquet: BanquetInquiry;
} | {
    __kind__: "booking";
    booking: BookingInquiry;
};
export interface BanquetInquiry {
    guestCount: bigint;
    name: string;
    email: string;
    message: string;
    timestamp: bigint;
    phone: string;
    eventDate: string;
    eventType: string;
}
export interface MenuItem {
    id: string;
    categoryId: string;
    name: string;
    gstPercent: number;
    isAvailable: boolean;
    description: string;
    isVeg: boolean;
    price: number;
}
export interface BanquetBill {
    id: string;
    contactName: string;
    guestCount: bigint;
    createdAt: bigint;
    gstPercent: number;
    hallName: string;
    totalAmount: number;
    paymentMode: PaymentMode;
    extraCharges: number;
    perPlateRate: number;
    eventName: string;
    contactPhone: string;
}
export interface RestaurantReceipt {
    id: string;
    source: string;
    date: bigint;
    note: string;
    paymentMode: PaymentMode;
    amount: number;
}
export interface RestaurantInventory {
    id: string;
    costPerUnit: number;
    stockQty: number;
    name: string;
    unit: string;
    reorderLevel: number;
}
export interface Inquiry {
    id: bigint;
    inquiryType: Type;
    timestamp: bigint;
    details: InquiryDetails;
}
export interface ContactInquiry {
    subject: string;
    name: string;
    email: string;
    message: string;
    timestamp: bigint;
    phone: string;
}
export interface UserProfile {
    name: string;
}
export interface StripeConfiguration {
    secretKey: string;
    allowedCountries: Array<string>;
}
export interface ShoppingItem {
    name: string;
    quantity: bigint;
    amount: bigint;
}
export enum GuestCheckInStatus {
    checkedIn = "checkedIn",
    checkedOut = "checkedOut"
}
export enum OrderStatus {
    pending = "pending",
    served = "served",
    cooking = "cooking",
    billed = "billed"
}
export enum PaymentMode {
    upi = "upi",
    card = "card",
    cash = "cash"
}
export enum TableStatus {
    occupied = "occupied",
    free = "free",
    reserved = "reserved"
}
export enum Type {
    contact = "contact",
    banquet = "banquet",
    booking = "booking"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createBanquetBill(bill: BanquetBill): Promise<void>;
    createBill(bill: RestaurantBill): Promise<void>;
    createCustomer(customer: RestaurantCustomer): Promise<void>;
    createDue(due: RestaurantDue): Promise<void>;
    createExpense(expense: RestaurantExpense): Promise<void>;
    createGuestCheckIn(checkIn: GuestCheckIn): Promise<void>;
    createInventoryItem(item: RestaurantInventory): Promise<void>;
    createMenuCategory(category: MenuCategory): Promise<void>;
    createMenuItem(item: MenuItem): Promise<void>;
    createOrder(order: RestaurantOrder): Promise<void>;
    createReceipt(receipt: RestaurantReceipt): Promise<void>;
    createRoomFoodOrder(order: RoomFoodOrder): Promise<void>;
    createRoomInvoice(invoice: RoomInvoice): Promise<void>;
    deleteBanquetBill(id: string): Promise<void>;
    deleteBill(id: string): Promise<void>;
    deleteCustomer(id: string): Promise<void>;
    deleteDue(id: string): Promise<void>;
    deleteExpense(id: string): Promise<void>;
    deleteGuestCheckIn(id: string): Promise<void>;
    deleteInventoryItem(id: string): Promise<void>;
    deleteMenuCategory(id: string): Promise<void>;
    deleteMenuItem(id: string): Promise<void>;
    deleteOrder(id: string): Promise<void>;
    deleteReceipt(id: string): Promise<void>;
    deleteRoomFoodOrder(id: string): Promise<void>;
    deleteTable(id: string): Promise<void>;
    getAllGuestCheckIns(): Promise<Array<GuestCheckIn>>;
    getAllInquiries(): Promise<Array<Inquiry>>;
    getAllRoomFoodOrders(): Promise<Array<RoomFoodOrder>>;
    getAllRoomInvoices(): Promise<Array<RoomInvoice>>;
    getBanquetBill(id: string): Promise<BanquetBill | null>;
    getBanquetBills(): Promise<Array<BanquetBill>>;
    getBill(id: string): Promise<RestaurantBill | null>;
    getBills(): Promise<Array<RestaurantBill>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCustomer(id: string): Promise<RestaurantCustomer | null>;
    getCustomers(): Promise<Array<RestaurantCustomer>>;
    getDue(id: string): Promise<RestaurantDue | null>;
    getDues(): Promise<Array<RestaurantDue>>;
    getExpense(id: string): Promise<RestaurantExpense | null>;
    getExpenses(): Promise<Array<RestaurantExpense>>;
    getGuestCheckIn(id: string): Promise<GuestCheckIn | null>;
    getInventoryItem(id: string): Promise<RestaurantInventory | null>;
    getInventoryItems(): Promise<Array<RestaurantInventory>>;
    getMenuCategories(): Promise<Array<MenuCategory>>;
    getMenuCategory(id: string): Promise<MenuCategory | null>;
    getMenuItem(id: string): Promise<MenuItem | null>;
    getMenuItems(): Promise<Array<MenuItem>>;
    getOrder(id: string): Promise<RestaurantOrder | null>;
    getOrders(): Promise<Array<RestaurantOrder>>;
    getReceipt(id: string): Promise<RestaurantReceipt | null>;
    getReceipts(): Promise<Array<RestaurantReceipt>>;
    getRoomFoodOrder(id: string): Promise<RoomFoodOrder | null>;
    getRoomInvoice(id: string): Promise<RoomInvoice | null>;
    getTable(id: string): Promise<RestaurantTable | null>;
    getTables(): Promise<Array<RestaurantTable>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitBanquet(inquiry: BanquetInquiry): Promise<bigint>;
    submitBooking(inquiry: BookingInquiry): Promise<bigint>;
    submitContact(inquiry: ContactInquiry): Promise<bigint>;
    updateBanquetBill(bill: BanquetBill): Promise<void>;
    updateBill(bill: RestaurantBill): Promise<void>;
    updateCustomer(customer: RestaurantCustomer): Promise<void>;
    updateDue(due: RestaurantDue): Promise<void>;
    updateExpense(expense: RestaurantExpense): Promise<void>;
    updateGuestCheckIn(checkIn: GuestCheckIn): Promise<void>;
    updateInventoryItem(item: RestaurantInventory): Promise<void>;
    updateMenuCategory(category: MenuCategory): Promise<void>;
    updateMenuItem(item: MenuItem): Promise<void>;
    updateOrder(order: RestaurantOrder): Promise<void>;
    updateReceipt(receipt: RestaurantReceipt): Promise<void>;
    updateRoomFoodOrder(order: RoomFoodOrder): Promise<void>;
    updateRoomInvoice(invoice: RoomInvoice): Promise<void>;
    updateTable(table: RestaurantTable): Promise<void>;
    isStripeConfigured(): Promise<boolean>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    createCheckoutSession(items: ShoppingItem[], successUrl: string, cancelUrl: string): Promise<string>;
}
