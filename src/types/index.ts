export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: 'user' | 'admin';
  token?: string;
  createdAt: Date;
  addresses?: UserAddress[];
}

export interface UserAddress {
  _id?: string;
  type: 'Home' | 'Work' | 'Billing' | 'Shipping' | 'Other';
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface Category {
  id: string;
  name: string;
  name_ta?: string;
  description: string;
  description_ta?: string;
  image: string;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: string;
  name_ta?: string;
  categoryId: string;
}

export interface Product {
  id: string;
  name: string;
  name_ta?: string;
  description: string;
  description_ta?: string;
  quantity: number;
  categoryId: string;
  subcategoryId?: string;
  image: string;
  unit: string;
  discount?: number;
  rating?: number;
  numReviews?: number;
  reviews?: Review[];
  isAvailable: boolean;
  lowStockThreshold: number;
  price?: number;
  availableWeights: Array<{ weight: string; price: number; stock?: number }>;
  createdAt: Date;
}

export interface Review {
  name: string;
  rating: number;
  comment: string;
  user: string;
  createdAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  selectedWeight?: string;
  userId: string;
}

export interface WishlistItem {
  id: string;
  productId: string;
  product: Product;
  userId: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  address: string;
}

export interface Purchase {
  id: string;
  productId: string;
  supplierId: string;
  quantity: number;
  pricePerUnit: number;
  totalAmount: number;
  purchaseDate: Date;
}

export interface Order {
  _id: string; // Backend uses _id
  id?: string; // Frontend mapped id
  user: User | string;
  orderItems: OrderItem[];
  shippingAddress: Address;
  paymentMethod: string;
  paymentResult?: {
    id: string;
    status: string;
    update_time: string;
    email_address: string;
  };
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  status: string;
  createdAt: string;
}

export interface OrderItem {
  name: string;
  qty: number;
  image: string;
  price: number;
  product: string; // Product ID
}

export interface Address {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
}

export type SortOption = 'price-low' | 'price-high' | 'name-asc' | 'name-desc' | 'newest';

export interface FilterState {
  categories: string[];
  subcategories: string[];
  priceRange: [number, number];
}
