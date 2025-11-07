export const en = {
  // Common
  common: {
    welcome: 'Welcome',
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    filter: 'Filter',
    submit: 'Submit',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    confirm: 'Confirm',
    close: 'Close',
    yes: 'Yes',
    no: 'No',
  },

  // Navigation
  nav: {
    dashboard: 'Dashboard',
    menu: 'Menu',
    orders: 'Orders',
    tables: 'Tables',
    kitchen: 'Kitchen',
    settings: 'Settings',
    logout: 'Logout',
  },

  // Order Page
  order: {
    title: 'Place Your Order',
    selectLanguage: 'Select Language',
    browseMenu: 'Browse Menu',
    allCategories: 'All Categories',
    cart: 'Your Cart',
    cartEmpty: 'Your cart is empty',
    addToCart: 'Add to Cart',
    removeFromCart: 'Remove',
    quantity: 'Quantity',
    notes: 'Notes',
    addNotes: 'Add special notes...',
    customerInfo: 'Customer Information',
    customerName: 'Your Name',
    customerPhone: 'Phone Number',
    orderNotes: 'Order Notes',
    orderNotesPlaceholder: 'Any special requests for your order?',
    totalAmount: 'Total Amount',
    placeOrder: 'Place Order',
    orderSuccess: 'Order Placed Successfully!',
    orderNumber: 'Order Number',
    thankYou: 'Thank you for your order!',
    trackOrder: 'We will prepare your order shortly.',
    placeAnother: 'Place Another Order',
    itemNotes: 'Item notes',
    available: 'Available',
    unavailable: 'Unavailable',
    outOfStock: 'Out of Stock',
  },

  // Menu Categories
  categories: {
    COFFEE: 'Coffee',
    TEA: 'Tea',
    COLD_DRINKS: 'Cold Drinks',
    HOT_DRINKS: 'Hot Drinks',
    CABINET_FOOD: 'Cabinet Food',
    KITCHEN_FOOD: 'Kitchen Food',
    CAKES: 'Cakes',
  },

  // Order Status
  orderStatus: {
    PENDING: 'Pending',
    PAID: 'Paid',
    WAITING: 'Waiting',
    COOKING: 'Cooking',
    READY: 'Ready',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  },

  // Payment Status
  paymentStatus: {
    PENDING: 'Pending',
    PAID: 'Paid',
    PARTIAL: 'Partial',
    REFUNDED: 'Refunded',
  },

  // Kitchen Display
  kitchen: {
    title: 'Kitchen Display',
    activeOrders: 'Active Orders',
    liveUpdates: 'Live Updates',
    disconnected: 'Disconnected',
    refreshNow: 'Refresh Now',
    noOrders: 'No active orders',
    allCompleted: 'All orders have been completed!',
    cooking: 'COOKING',
    waitingToCook: 'WAITING TO COOK',
    startCooking: 'Start Cooking',
    markCompleted: 'Mark as Completed',
    specialNotes: 'Special Notes',
    justNow: 'Just now',
    minAgo: 'min ago',
    hoursAgo: 'h ago',
  },

  // Validation Messages
  validation: {
    required: 'This field is required',
    invalidEmail: 'Invalid email address',
    invalidPhone: 'Invalid phone number',
    minLength: 'Minimum length is {length} characters',
    maxLength: 'Maximum length is {length} characters',
    minValue: 'Minimum value is {value}',
    maxValue: 'Maximum value is {value}',
  },

  // Error Messages
  error: {
    generic: 'An error occurred',
    networkError: 'Network error. Please check your connection.',
    notFound: 'Not found',
    unauthorized: 'Unauthorized access',
    serverError: 'Server error. Please try again later.',
  },

  // Success Messages
  success: {
    orderPlaced: 'Order placed successfully!',
    orderUpdated: 'Order updated successfully!',
    settingsSaved: 'Settings saved successfully!',
    itemAdded: 'Item added to cart',
    itemRemoved: 'Item removed from cart',
  },
};

export type Translation = typeof en;
