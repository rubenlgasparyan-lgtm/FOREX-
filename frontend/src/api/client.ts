const BASE = 'http://localhost:3001/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  auth: {
    login: (email: string, password: string) => request<{ token: string; user: User }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    register: (data: RegisterData) => request<{ token: string; user: User }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    me: () => request<User>('/auth/me'),
  },
  rates: {
    getAll: () => request<ExchangeRate[]>('/rates'),
    update: (id: string, buyRate: number, sellRate: number) => request<ExchangeRate>(`/rates/${id}`, { method: 'PUT', body: JSON.stringify({ buyRate, sellRate }) }),
  },
  transactions: {
    getAll: () => request<Transaction[]>('/transactions'),
    create: (data: { fromCurrency: string; toCurrency: string; fromAmount: number }) => request<Transaction>('/transactions', { method: 'POST', body: JSON.stringify(data) }),
  },
  negotiations: {
    getAll: () => request<Negotiation[]>('/negotiations'),
    create: (data: NegotiationCreate) => request<Negotiation>('/negotiations', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: { status: string; adminNote?: string; approvedRate?: number }) => request<Negotiation>(`/negotiations/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  },
  admin: {
    dashboard: () => request<AdminDashboard>('/admin/dashboard'),
    users: () => request<User[]>('/admin/users'),
  },
};

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN';
  createdAt?: string;
}

export interface ExchangeRate {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  buyRate: number;
  sellRate: number;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  fromCurrency: string;
  toCurrency: string;
  fromAmount: number;
  toAmount: number;
  rate: number;
  status: string;
  type: string;
  createdAt: string;
}

export interface Negotiation {
  id: string;
  userId: string;
  user?: { firstName: string; lastName: string; email: string };
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  requestedRate: number;
  marketRate: number;
  purpose?: string;
  status: string;
  adminNote?: string;
  approvedRate?: number;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface NegotiationCreate {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  requestedRate: number;
  purpose: string;
}

export interface AdminDashboard {
  totalUsers: number;
  pendingNegotiations: number;
  totalTransactions: number;
  totalVolume: number;
  recentTransactions: Transaction[];
}
