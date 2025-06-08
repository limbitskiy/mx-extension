export interface Item {
  discount: number;
  id: string;
  name: string;
  price: number;
  url: string;
}

export interface Folder {
  discount: number;
  id: string;
  items: Item[];
  itemCnt: number;
  name: string;
  timer: string; // "16:25"
}

export interface Task {
  id: string;
  period: number; // in seconds
  url: string;
  updateIn?: number;
}

export interface Locale {
  [key: string]: string;
}
