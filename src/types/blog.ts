export interface BlogFlow {
  id: number;
  name: string;
  slug: string;
  schema: { [key: string]: string };
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface BlogEntry {
  id: number;
  flowId: number;
  payload: { [key: string]: any };
  createdAt: string;
  updatedAt: string;
}
