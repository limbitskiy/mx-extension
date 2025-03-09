export interface Path {
  classList: string[] | null;
  id: string | null;
  tagName: string | null;
  index: number | null;
}

export interface QueryObject {
  id: string;
  title: string;
  href: string;
  query: string;
  value: string;
}

export interface Folder {
  discount: number;
  id: string;
  items: Item[];
  itemCnt: number;
  name: string;
  timer: string; // "16:25"
}

export interface Link {
  id: string;
  name: string;
  url: string;
  price: number;
  discount: number;
}

export interface ThemeConfig {
  colors: Record<string, string>;
  fonts: Record<string, string>;
  misc: Record<string, string>;
}
