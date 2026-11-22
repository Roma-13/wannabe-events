export interface BankAccount {
  id: 'tbc' | 'bog';
  bankName: string;
  shortName: string;
  iban: string;
}

export interface LineupSlot {
  id: string;
  time: string;
  timeRange: string;
  artist: string;
  role: string;
  description: string;
  image: string;
  isHeadliner?: boolean;
  isDj?: boolean;
  isDoors?: boolean;
}

export interface MainEvent {
  id: string;
  title: string;
  subtitle: string;
  dateLabel: string;
  shortDate: string;
  doorsTime: string;
  dayTimeLabel: string;
  isoTargetDate: string;
  venueName: string;
  address: string;
  onlinePrice: number;
  doorPrice: number;
  image: string;
  manifesto: string;
}

export interface PurchasedOrder {
  id?: string;
  userId?: string;
  orderCode: string;
  createdAt: string;
  eventTitle: string;
  eventDate: string;
  venueName: string;
  address: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  bankName: string;
  bankIban: string;
  transferNote: string;
  status?: 'pending' | 'confirmed' | 'cancelled';
  reviewedAt?: string | null;
  adminNote?: string;
  checkedInAt?: string | null;
}

export interface VerifiedTicket {
  orderCode: string;
  eventTitle: string;
  eventDate: string;
  venueName: string;
  address: string;
  buyerName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  checkedInAt: string | null;
  createdAt: string;
  adminNote: string;
}

export interface VenueZone {
  id: 'stage' | 'hall' | 'dj' | 'bar' | 'entrance';
  name: string;
  tag: string;
  capacityNote: string;
  description: string;
}

export interface FaqItem {
  id: string;
  category: 'ბილეთები' | 'შესვლა' | 'ლოკაცია' | 'ლაინაფი';
  question: string;
  answer: string;
}

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  handle: string;
  role?: 'user' | 'admin';
}
