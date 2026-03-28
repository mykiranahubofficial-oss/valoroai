/* ===============================
   DRAFT LINK
================================ */
export interface DraftLink {
  templateUrl:  string;
  templateName: string;
  templateType: string;
  uploadedAt:   string | null;
}

/* ===============================
   LATEST REPORT
================================ */
export interface LatestReport {
  reportId:    string;
  reportName:  string;
  status:      string;
  generatedAt: string;
}

/* ===============================
   TABLE HEADER
================================ */
export interface TableHeader {
  title:    string;
  variable: string;
}

/* ===============================
   TABLE CELL
================================ */
export interface TableCell {
  rowIndex: number;
  colIndex: number;
  value:    string;
  variable: string;
}

/* ===============================
   DRAFT TABLE
================================ */
export interface DraftTable {
  tableId:       string;
  tableName:     string;
  columnCount:   number;        // ✅ added
  rowCount:      number;        // ✅ added
  cellCount:     number;        // ✅ added
  columnHeaders: TableHeader[];
  rowHeaders:    TableHeader[];
}

/* ===============================
   DRAFT
================================ */
export interface Draft {
  draftId:      string;
  draftName:    string;

  draftLink:    DraftLink;      // ✅ added
  reportCount:  number;         // ✅ added
  latestReport: LatestReport | null;  // ✅ added
  tableCount:   number;         // ✅ added
  tables:       DraftTable[];
  reports:      any[];
}

/* ===============================
   AGENCY
================================ */
export interface Agency {
  _id?:         string;

  agencyName:   string;
  ownerName?:   string;
  address?:     string;
  mobileNumber?: string;
  email?:       string;
  userId:       string;
  userPass?:    string;
  agencyToken?: string;

  drafts:       Draft[];

  createdAt?:   string;
  updatedAt?:   string;
  credits?:     number;
}

/* ===============================
   API RESPONSES
================================ */
export interface AgencyResponse {
  success: boolean;
  count?:  number;
  data:    Agency[];
}

export interface RegisterResponse {
  success:      boolean;
  message:      string;
  agencyToken:  string;
  userId:       string;
}

export interface RegisterForm {
  agencyName:   string;
  ownerName?:   string;
  address?:     string;
  mobileNumber?: string;
  email?:       string;
  userId:       string;
  userPass:     string;
}