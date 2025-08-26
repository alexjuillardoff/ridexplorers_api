export interface BlogEntry {
  [key: string]: any;
}

export interface BlogFlow {
  keys: string[];
  entries: BlogEntry[];
}
