interface Item {
  discount: number;
  id: string;
  name: string;
  price: number;
  url: string;
}

interface Folder {
  discount: number;
  id: string;
  items: Item[];
  itemCnt: number;
  name: string;
  timer: string; // "16:25"
}

interface Task {
  id: number;
  period: number; // in seconds
  url: string;
  lastUpdated?: number;
}

interface Locale {
  [key: string]: string;
}

interface RequestData {
  data?: object;
  service?: object;
  key: string;
}

interface ResponseData {
  folders: Folder[];
  tasks: Task[];
  locale: Locale[];
}
