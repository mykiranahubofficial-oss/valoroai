//src\app\model\agency.model.ts
export interface TableCell {
  value?: string;
  variable?: string;
}

export interface TableHeader {
  title: string;
  variable: string;
}

export interface DraftTable {
  tableName: string;
  columnHeaders: TableHeader[];
  rowHeaders: TableHeader[];
  cells: TableCell[][];
}

export interface Draft {
  draftId: string;
  draftName: string;
  tables: DraftTable[];
}

export interface Agency {
  agencyName: string;
  ownerName: string;
  address: string;
  mobileNumber: string;
  email: string;
  userId: string;
  drafts: Draft[];
}

export interface AgencyResponse {
  success: boolean;
  data: Agency;
}