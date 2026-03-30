import Time "mo:core/Time";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Float "mo:core/Float";
import Text "mo:core/Text";
import Set "mo:core/Set";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";


// Actor declaration with migration

actor {
  let inquiries = Map.empty<Nat, Inquiry>();
  var nextInquiryId = 0;
  let userProfiles = Map.empty<Principal, UserProfile>();

  type BookingInquiry = {
    name : Text;
    email : Text;
    phone : Text;
    checkIn : Text;
    checkOut : Text;
    roomType : Text;
    guests : Nat;
    message : Text;
    timestamp : Int;
  };

  type ContactInquiry = {
    name : Text;
    email : Text;
    phone : Text;
    subject : Text;
    message : Text;
    timestamp : Int;
  };

  type BanquetInquiry = {
    name : Text;
    email : Text;
    phone : Text;
    eventType : Text;
    eventDate : Text;
    guestCount : Nat;
    message : Text;
    timestamp : Int;
  };

  type Inquiry = {
    id : Nat;
    inquiryType : InquiryType.Type;
    details : InquiryDetails;
    timestamp : Int;
  };

  type InquiryDetails = {
    #booking : BookingInquiry;
    #contact : ContactInquiry;
    #banquet : BanquetInquiry;
  };

  module ServiceType {
    public type Type = { #banquet; #boardRoom; #party };

    public func compare(type1 : Type, type2 : Type) : Order.Order {
      switch (type1, type2) {
        case (#banquet, #banquet) { #equal };
        case (#banquet, _) { #less };
        case (#boardRoom, #banquet) { #greater };
        case (#boardRoom, #boardRoom) { #equal };
        case (#boardRoom, #party) { #less };
        case (#party, #party) { #equal };
        case (#party, _) { #greater };
      };
    };
  };

  module EventType {
    public type Type = { #wedding; #corporate; #birthday; #other };

    public func compare(type1 : Type, type2 : Type) : Order.Order {
      switch (type1, type2) {
        case (#wedding, #wedding) { #equal };
        case (#wedding, _) { #less };
        case (#corporate, #wedding) { #greater };
        case (#corporate, #corporate) { #equal };
        case (#corporate, #birthday) { #less };
        case (#corporate, #other) { #less };
        case (#birthday, #birthday) { #equal };
        case (#birthday, #other) { #less };
        case (#other, #other) { #equal };
        case (#birthday, #corporate) { #greater };
        case (#other, #corporate) { #greater };
        case (#other, #birthday) { #greater };
        case (#birthday, #wedding) { #greater };
        case (#other, #wedding) { #greater };
      };
    };
  };

  module InquiryType {
    public type Type = { #booking; #contact; #banquet };

    public func compare(type1 : Type, type2 : Type) : Order.Order {
      switch (type1, type2) {
        case (#booking, #booking) { #equal };
        case (#booking, _) { #less };
        case (#contact, #booking) { #greater };
        case (#contact, #contact) { #equal };
        case (#contact, #banquet) { #less };
        case (#banquet, #banquet) { #equal };
        case (#banquet, _) { #greater };
      };
    };
  };

  // Entity Types
  type TableStatus = { #free; #occupied; #reserved };
  type OrderStatus = { #pending; #cooking; #served; #billed };
  type PaymentMode = { #cash; #card; #upi };

  type MenuCategory = {
    id : Text;
    name : Text;
    sortOrder : Nat;
  };

  type MenuItem = {
    id : Text;
    categoryId : Text;
    name : Text;
    description : Text;
    price : Float;
    gstPercent : Float;
    isVeg : Bool;
    isAvailable : Bool;
  };

  type RestaurantTable = {
    id : Text;
    seats : Nat;
    status : TableStatus;
    currentOrderId : ?Text;
  };

  type OrderItem = {
    menuItemId : Text;
    name : Text;
    qty : Nat;
    price : Float;
    notes : Text;
  };

  type RestaurantOrder = {
    id : Text;
    tableId : Text;
    items : [OrderItem];
    status : OrderStatus;
    createdAt : Int;
    customerName : ?Text;
    totalAmount : Float;
    gstAmount : Float;
  };

  type RestaurantBill = {
    id : Text;
    orderId : Text;
    tableId : Text;
    items : [OrderItem];
    subtotal : Float;
    discount : Float;
    gstAmount : Float;
    totalAmount : Float;
    paymentMode : PaymentMode;
    createdAt : Int;
    customerName : ?Text;
  };

  type BanquetBill = {
    id : Text;
    eventName : Text;
    hallName : Text;
    guestCount : Nat;
    perPlateRate : Float;
    extraCharges : Float;
    gstPercent : Float;
    totalAmount : Float;
    paymentMode : PaymentMode;
    createdAt : Int;
    contactName : Text;
    contactPhone : Text;
  };

  type RestaurantCustomer = {
    id : Text;
    name : Text;
    phone : Text;
    email : Text;
    address : Text;
    loyaltyPoints : Nat;
    totalSpend : Float;
  };

  type RestaurantInventory = {
    id : Text;
    name : Text;
    unit : Text;
    stockQty : Float;
    reorderLevel : Float;
    costPerUnit : Float;
  };

  type RestaurantExpense = {
    id : Text;
    category : Text;
    description : Text;
    amount : Float;
    date : Int;
    paymentMode : PaymentMode;
  };

  type RestaurantReceipt = {
    id : Text;
    source : Text;
    amount : Float;
    paymentMode : PaymentMode;
    note : Text;
    date : Int;
  };

  type RestaurantDue = {
    id : Text;
    customerId : Text;
    customerName : Text;
    amount : Float;
    description : Text;
    dueDate : Int;
    isPaid : Bool;
  };

  // Guest Check-In Types
  type GuestCheckInStatus = { #checkedIn; #checkedOut };

  type GuestCheckIn = {
    id : Text;
    guestName : Text;
    phone : Text;
    roomNumber : Text;
    idType : Text;
    idNumber : Text;
    adults : Nat;
    children : Nat;
    checkInDate : Text;
    expectedCheckOut : Text;
    actualCheckOut : Text;
    status : GuestCheckInStatus;
    totalAmount : Float;
    advancePaid : Float;
    notes : Text;
    createdAt : Int;
  };

  // Room Food Order
  type RoomFoodOrder = {
    id : Text;
    roomNumber : Text;
    guestName : Text;
    items : [OrderItem];
    totalAmount : Float;
    gstAmount : Float;
    paymentMode : PaymentMode;
    notes : Text;
    createdAt : Int;
    isPaid : Bool;
  };

  // Room Invoice (generated on checkout)
  type RoomInvoice = {
    id : Text;
    guestCheckInId : Text;
    guestName : Text;
    roomNumber : Text;
    roomType : Text;
    checkInDate : Text;
    checkOutDate : Text;
    nights : Nat;
    roomRate : Float;
    roomCharges : Float;
    foodCharges : Float;
    otherCharges : Float;
    discount : Float;
    gstPercent : Float;
    gstAmount : Float;
    totalAmount : Float;
    advancePaid : Float;
    balanceDue : Float;
    paymentMode : PaymentMode;
    notes : Text;
    createdAt : Int;
  };

  // Persistent Storage
  let menuCategories = Map.empty<Text, MenuCategory>();
  let menuItems = Map.empty<Text, MenuItem>();
  let restaurantTables = Map.empty<Text, RestaurantTable>();
  let restaurantOrders = Map.empty<Text, RestaurantOrder>();
  let restaurantBills = Map.empty<Text, RestaurantBill>();
  let banquetBills = Map.empty<Text, BanquetBill>();
  let restaurantCustomers = Map.empty<Text, RestaurantCustomer>();
  let restaurantInventory = Map.empty<Text, RestaurantInventory>();
  let restaurantExpenses = Map.empty<Text, RestaurantExpense>();
  let restaurantReceipts = Map.empty<Text, RestaurantReceipt>();
  let restaurantDues = Map.empty<Text, RestaurantDue>();
  let guestCheckIns = Map.empty<Text, GuestCheckIn>();
  let roomFoodOrders = Map.empty<Text, RoomFoodOrder>();
  let roomInvoices = Map.empty<Text, RoomInvoice>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  // User profile functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Menu Categories
  public shared ({ caller }) func createMenuCategory(category : MenuCategory) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create menu categories");
    };
    if (menuCategories.containsKey(category.id)) {
      Runtime.trap("Menu category already exists");
    };
    menuCategories.add(category.id, category);
  };

  public shared ({ caller }) func updateMenuCategory(category : MenuCategory) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update menu categories");
    };
    if (not menuCategories.containsKey(category.id)) {
      Runtime.trap("Menu category not found");
    };
    menuCategories.add(category.id, category);
  };

  public shared ({ caller }) func deleteMenuCategory(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete menu categories");
    };
    if (not menuCategories.containsKey(id)) {
      Runtime.trap("Menu category not found");
    };
    menuCategories.remove(id);
  };

  public query ({ caller }) func getMenuCategories() : async [MenuCategory] {
    menuCategories.values().toArray();
  };

  public query ({ caller }) func getMenuCategory(id : Text) : async ?MenuCategory {
    menuCategories.get(id);
  };

  // Menu Items
  public shared ({ caller }) func createMenuItem(item : MenuItem) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create menu items");
    };
    if (menuItems.containsKey(item.id)) {
      Runtime.trap("Menu item already exists");
    };
    menuItems.add(item.id, item);
  };

  public shared ({ caller }) func updateMenuItem(item : MenuItem) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update menu items");
    };
    if (not menuItems.containsKey(item.id)) {
      Runtime.trap("Menu item not found");
    };
    menuItems.add(item.id, item);
  };

  public shared ({ caller }) func deleteMenuItem(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete menu items");
    };
    if (not menuItems.containsKey(id)) {
      Runtime.trap("Menu item not found");
    };
    menuItems.remove(id);
  };

  public query ({ caller }) func getMenuItems() : async [MenuItem] {
    menuItems.values().toArray();
  };

  public query ({ caller }) func getMenuItem(id : Text) : async ?MenuItem {
    menuItems.get(id);
  };

  // Restaurant Tables
  public shared ({ caller }) func updateTable(table : RestaurantTable) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update tables");
    };
    if (not restaurantTables.containsKey(table.id)) {
      Runtime.trap("Table not found");
    };
    restaurantTables.add(table.id, table);
  };

  public shared ({ caller }) func deleteTable(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete tables");
    };
    if (not restaurantTables.containsKey(id)) {
      Runtime.trap("Table not found");
    };
    restaurantTables.remove(id);
  };

  public query ({ caller }) func getTables() : async [RestaurantTable] {
    restaurantTables.values().toArray();
  };

  public query ({ caller }) func getTable(id : Text) : async ?RestaurantTable {
    restaurantTables.get(id);
  };

  // Orders
  public shared ({ caller }) func createOrder(order : RestaurantOrder) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create orders");
    };
    if (restaurantOrders.containsKey(order.id)) {
      Runtime.trap("Order already exists");
    };
    restaurantOrders.add(order.id, order);
  };

  public shared ({ caller }) func updateOrder(order : RestaurantOrder) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update orders");
    };
    if (not restaurantOrders.containsKey(order.id)) {
      Runtime.trap("Order not found");
    };
    restaurantOrders.add(order.id, order);
  };

  public shared ({ caller }) func deleteOrder(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete orders");
    };
    if (not restaurantOrders.containsKey(id)) {
      Runtime.trap("Order not found");
    };
    restaurantOrders.remove(id);
  };

  public query ({ caller }) func getOrders() : async [RestaurantOrder] {
    restaurantOrders.values().toArray();
  };

  public query ({ caller }) func getOrder(id : Text) : async ?RestaurantOrder {
    restaurantOrders.get(id);
  };

  // Restaurant Bills
  public shared ({ caller }) func createBill(bill : RestaurantBill) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create bills");
    };
    if (restaurantBills.containsKey(bill.id)) {
      Runtime.trap("Bill already exists");
    };
    restaurantBills.add(bill.id, bill);
  };

  public shared ({ caller }) func updateBill(bill : RestaurantBill) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update bills");
    };
    if (not restaurantBills.containsKey(bill.id)) {
      Runtime.trap("Bill not found");
    };
    restaurantBills.add(bill.id, bill);
  };

  public shared ({ caller }) func deleteBill(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete bills");
    };
    if (not restaurantBills.containsKey(id)) {
      Runtime.trap("Bill not found");
    };
    restaurantBills.remove(id);
  };

  public query ({ caller }) func getBills() : async [RestaurantBill] {
    restaurantBills.values().toArray();
  };

  public query ({ caller }) func getBill(id : Text) : async ?RestaurantBill {
    restaurantBills.get(id);
  };

  // Banquet Bills
  public shared ({ caller }) func createBanquetBill(bill : BanquetBill) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create banquet bills");
    };
    if (banquetBills.containsKey(bill.id)) {
      Runtime.trap("Banquet bill already exists");
    };
    banquetBills.add(bill.id, bill);
  };

  public shared ({ caller }) func updateBanquetBill(bill : BanquetBill) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update banquet bills");
    };
    if (not banquetBills.containsKey(bill.id)) {
      Runtime.trap("Banquet bill not found");
    };
    banquetBills.add(bill.id, bill);
  };

  public shared ({ caller }) func deleteBanquetBill(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete banquet bills");
    };
    if (not banquetBills.containsKey(id)) {
      Runtime.trap("Banquet bill not found");
    };
    banquetBills.remove(id);
  };

  public query ({ caller }) func getBanquetBills() : async [BanquetBill] {
    banquetBills.values().toArray();
  };

  public query ({ caller }) func getBanquetBill(id : Text) : async ?BanquetBill {
    banquetBills.get(id);
  };

  // Customers
  public shared ({ caller }) func createCustomer(customer : RestaurantCustomer) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create customers");
    };
    if (restaurantCustomers.containsKey(customer.id)) {
      Runtime.trap("Customer already exists");
    };
    restaurantCustomers.add(customer.id, customer);
  };

  public shared ({ caller }) func updateCustomer(customer : RestaurantCustomer) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update customers");
    };
    if (not restaurantCustomers.containsKey(customer.id)) {
      Runtime.trap("Customer not found");
    };
    restaurantCustomers.add(customer.id, customer);
  };

  public shared ({ caller }) func deleteCustomer(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete customers");
    };
    if (not restaurantCustomers.containsKey(id)) {
      Runtime.trap("Customer not found");
    };
    restaurantCustomers.remove(id);
  };

  public query ({ caller }) func getCustomers() : async [RestaurantCustomer] {
    restaurantCustomers.values().toArray();
  };

  public query ({ caller }) func getCustomer(id : Text) : async ?RestaurantCustomer {
    restaurantCustomers.get(id);
  };

  // Inventory
  public shared ({ caller }) func createInventoryItem(item : RestaurantInventory) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create inventory items");
    };
    if (restaurantInventory.containsKey(item.id)) {
      Runtime.trap("Inventory item already exists");
    };
    restaurantInventory.add(item.id, item);
  };

  public shared ({ caller }) func updateInventoryItem(item : RestaurantInventory) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update inventory items");
    };
    if (not restaurantInventory.containsKey(item.id)) {
      Runtime.trap("Inventory item not found");
    };
    restaurantInventory.add(item.id, item);
  };

  public shared ({ caller }) func deleteInventoryItem(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete inventory items");
    };
    if (not restaurantInventory.containsKey(id)) {
      Runtime.trap("Inventory item not found");
    };
    restaurantInventory.remove(id);
  };

  public query ({ caller }) func getInventoryItems() : async [RestaurantInventory] {
    restaurantInventory.values().toArray();
  };

  public query ({ caller }) func getInventoryItem(id : Text) : async ?RestaurantInventory {
    restaurantInventory.get(id);
  };

  // Expenses
  public shared ({ caller }) func createExpense(expense : RestaurantExpense) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create expenses");
    };
    if (restaurantExpenses.containsKey(expense.id)) {
      Runtime.trap("Expense already exists");
    };
    restaurantExpenses.add(expense.id, expense);
  };

  public shared ({ caller }) func updateExpense(expense : RestaurantExpense) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update expenses");
    };
    if (not restaurantExpenses.containsKey(expense.id)) {
      Runtime.trap("Expense not found");
    };
    restaurantExpenses.add(expense.id, expense);
  };

  public shared ({ caller }) func deleteExpense(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete expenses");
    };
    if (not restaurantExpenses.containsKey(id)) {
      Runtime.trap("Expense not found");
    };
    restaurantExpenses.remove(id);
  };

  public query ({ caller }) func getExpenses() : async [RestaurantExpense] {
    restaurantExpenses.values().toArray();
  };

  public query ({ caller }) func getExpense(id : Text) : async ?RestaurantExpense {
    restaurantExpenses.get(id);
  };

  // Receipts
  public shared ({ caller }) func createReceipt(receipt : RestaurantReceipt) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create receipts");
    };
    if (restaurantReceipts.containsKey(receipt.id)) {
      Runtime.trap("Receipt already exists");
    };
    restaurantReceipts.add(receipt.id, receipt);
  };

  public shared ({ caller }) func updateReceipt(receipt : RestaurantReceipt) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update receipts");
    };
    if (not restaurantReceipts.containsKey(receipt.id)) {
      Runtime.trap("Receipt not found");
    };
    restaurantReceipts.add(receipt.id, receipt);
  };

  public shared ({ caller }) func deleteReceipt(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete receipts");
    };
    if (not restaurantReceipts.containsKey(id)) {
      Runtime.trap("Receipt not found");
    };
    restaurantReceipts.remove(id);
  };

  public query ({ caller }) func getReceipts() : async [RestaurantReceipt] {
    restaurantReceipts.values().toArray();
  };

  public query ({ caller }) func getReceipt(id : Text) : async ?RestaurantReceipt {
    restaurantReceipts.get(id);
  };

  // Dues
  public shared ({ caller }) func createDue(due : RestaurantDue) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create dues");
    };
    if (restaurantDues.containsKey(due.id)) {
      Runtime.trap("Due already exists");
    };
    restaurantDues.add(due.id, due);
  };

  public shared ({ caller }) func updateDue(due : RestaurantDue) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update dues");
    };
    if (not restaurantDues.containsKey(due.id)) {
      Runtime.trap("Due not found");
    };
    restaurantDues.add(due.id, due);
  };

  public shared ({ caller }) func deleteDue(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete dues");
    };
    if (not restaurantDues.containsKey(id)) {
      Runtime.trap("Due not found");
    };
    restaurantDues.remove(id);
  };

  public query ({ caller }) func getDues() : async [RestaurantDue] {
    restaurantDues.values().toArray();
  };

  public query ({ caller }) func getDue(id : Text) : async ?RestaurantDue {
    restaurantDues.get(id);
  };

  // Guest Check-In Management
  public shared ({ caller }) func createGuestCheckIn(checkIn : GuestCheckIn) : async () {
    if (guestCheckIns.containsKey(checkIn.id)) {
      Runtime.trap("Guest check-in already exists");
    };
    guestCheckIns.add(checkIn.id, checkIn);
  };

  public shared ({ caller }) func updateGuestCheckIn(checkIn : GuestCheckIn) : async () {
    if (not guestCheckIns.containsKey(checkIn.id)) {
      Runtime.trap("Guest check-in not found");
    };
    guestCheckIns.add(checkIn.id, checkIn);
  };

  public shared ({ caller }) func deleteGuestCheckIn(id : Text) : async () {
    if (not guestCheckIns.containsKey(id)) {
      Runtime.trap("Guest check-in not found");
    };
    guestCheckIns.remove(id);
  };

  public query ({ caller }) func getAllGuestCheckIns() : async [GuestCheckIn] {
    guestCheckIns.values().toArray();
  };

  public query ({ caller }) func getGuestCheckIn(id : Text) : async ?GuestCheckIn {
    guestCheckIns.get(id);
  };

  // Room Food Orders (room service)
  public shared ({ caller }) func createRoomFoodOrder(order : RoomFoodOrder) : async () {
    if (roomFoodOrders.containsKey(order.id)) {
      Runtime.trap("Room food order already exists");
    };
    roomFoodOrders.add(order.id, order);
  };

  public shared ({ caller }) func updateRoomFoodOrder(order : RoomFoodOrder) : async () {
    if (not roomFoodOrders.containsKey(order.id)) {
      Runtime.trap("Room food order not found");
    };
    roomFoodOrders.add(order.id, order);
  };

  public shared ({ caller }) func deleteRoomFoodOrder(id : Text) : async () {
    if (not roomFoodOrders.containsKey(id)) {
      Runtime.trap("Room food order not found");
    };
    roomFoodOrders.remove(id);
  };

  public query ({ caller }) func getAllRoomFoodOrders() : async [RoomFoodOrder] {
    roomFoodOrders.values().toArray();
  };

  public query ({ caller }) func getRoomFoodOrder(id : Text) : async ?RoomFoodOrder {
    roomFoodOrders.get(id);
  };

  // Room Invoices (generated on guest checkout)
  public shared ({ caller }) func createRoomInvoice(invoice : RoomInvoice) : async () {
    if (roomInvoices.containsKey(invoice.id)) {
      Runtime.trap("Room invoice already exists");
    };
    roomInvoices.add(invoice.id, invoice);
  };

  public shared ({ caller }) func updateRoomInvoice(invoice : RoomInvoice) : async () {
    if (not roomInvoices.containsKey(invoice.id)) {
      Runtime.trap("Room invoice not found");
    };
    roomInvoices.add(invoice.id, invoice);
  };

  public query ({ caller }) func getAllRoomInvoices() : async [RoomInvoice] {
    roomInvoices.values().toArray();
  };

  public query ({ caller }) func getRoomInvoice(id : Text) : async ?RoomInvoice {
    roomInvoices.get(id);
  };

  // Public inquiry submission functions
  public shared ({ caller }) func submitBooking(inquiry : BookingInquiry) : async Nat {
    let id = nextInquiryId;
    nextInquiryId += 1;
    let newInquiry : Inquiry = {
      id;
      inquiryType = #booking;
      details = #booking inquiry;
      timestamp = Time.now();
    };
    inquiries.add(id, newInquiry);
    id;
  };

  public shared ({ caller }) func submitContact(inquiry : ContactInquiry) : async Nat {
    let id = nextInquiryId;
    nextInquiryId += 1;
    let newInquiry : Inquiry = {
      id;
      inquiryType = #contact;
      details = #contact inquiry;
      timestamp = Time.now();
    };
    inquiries.add(id, newInquiry);
    id;
  };

  public shared ({ caller }) func submitBanquet(inquiry : BanquetInquiry) : async Nat {
    let id = nextInquiryId;
    nextInquiryId += 1;
    let newInquiry : Inquiry = {
      id;
      inquiryType = #banquet;
      details = #banquet inquiry;
      timestamp = Time.now();
    };
    inquiries.add(id, newInquiry);
    id;
  };

  public query ({ caller }) func getAllInquiries() : async [Inquiry] {
    inquiries.values().toArray();
  };
};
