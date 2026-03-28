// C:\Users\mykiranahub1\Desktop\Valora\valorademo\src\app\report-management\visit-details.model.ts

export interface VisitDetails {

  reportId?: string;
  draftId?: string;

  // BOUNDARIES
  north?: string;
  south?: string;
  east?: string;
  west?: string;

  // PROPERTY DETAILS
  occupied?: string;
  flatBHK?: string;
  floors?: string;
  perfloor?: string;
  totalflats?: string;
  lifts?: string;
  parking?: string;

  // STRUCTURE DETAILS
  perfloorflat?: string;
  flatNo?: string;
  rent?: string;
  landmark:string;

}