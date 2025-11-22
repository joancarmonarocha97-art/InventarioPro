
export interface ProductDef {
  id: string;
  name: string;
  category: string;
}

export interface LocationDef {
  id: string;
  name: string;
}

export interface CategoryDef {
  id: string;
  name: string;
}

export interface InventoryItem {
  id: string;
  productName: string;
  category: string; 
  location: string;
  quantity: number;
  timestamp: number;
}

export type ViewState = 'home' | 'entry' | 'results' | 'products' | 'settings';
