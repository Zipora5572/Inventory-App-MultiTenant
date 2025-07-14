export interface Item {
  id: number;
  tenantId: string;
  name: string;
  category: string;
  isCheckedOut: boolean;
  checkedOutBy?: string | null;
  isActive: boolean;
}