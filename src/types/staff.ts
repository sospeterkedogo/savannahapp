export type StaffFolder = {
  id: string;
  user_id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
};

export type StaffFile = {
  id: string;
  folder_id: string | null;
  user_id: string | null;
  name: string;
  path: string;
  type: string;
  size: number;
  is_reference?: boolean;
  created_at: string;
};

export type OnboardingTask = {
  id: string;
  title: string;
  description: string;
  role: string;
  sort_order: number;
  completed_at?: string;
};

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  is_read: boolean;
  created_at: string;
};

export type AuditLog = {
  id: string;
  user_id: string;
  action: string;
  target_type: string;
  target_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
};

export type StaffMetrics = {
  totalStaff: number;
  onboardingCompletionRate: number;
  recentLogs: AuditLog[];
  shiftUpdatesCount: number;
  menuUpdatesCount: number;
  lowStockItems?: number;
  totalInventoryValue?: number;
};

export type InventoryItem = {
  id: string;
  name: string;
  category: string;
  unit: string;
  current_stock: number;
  min_stock: number;
  capacity: number;
  last_check_in: string;
  created_at: string;
  updated_at: string;
};

export type InventoryLog = {
  id: string;
  inventory_id: string;
  user_id: string;
  change_amount: number;
  reason: 'check-in' | 'order' | 'waste' | 'correction';
  notes?: string;
  receipt_url?: string;
  created_at: string;
};
