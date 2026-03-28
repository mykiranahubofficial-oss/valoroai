export interface BasicDetails {

  reportId?: string;
  draftId?: string;
  filename?: string;
  ownerName?: string;
  propertyLocation?: string;
    locationContext?:string ,
buildingName?:string,
  plotNum?: string;
  surveyNo?: string;   // ✅ corrected spelling
  flatNo?: string;
  floor?: string;
  village?: string;
  taluka?: string;
  district?: string;

  // AREA DETAILS

  bdsm?: string;     // Built up area Sq.Mt
  bdsf?: string;     // Built up area Sq.Ft
  loading?: string;  // Loading %
  casm?: string;     // Carpet area Sq.Mt
  casf?: string;     // Carpet area Sq.Ft

  // OPEN BALCONY
  obm?: string; // Sq.Mt
  obf?: string; // Sq.Ft
  
  // ADJ TERRACE
  atm?: string; // Sq.Mt
  atf?: string; // Sq.Ft
  
  // OPEN TERRACE
  otm?: string; // Sq.Mt
  otf?: string; // Sq.Ft
  // INDEX II DETAILS

  indexiiserveno?: string;
  indexiidate?: string;
  developerorsellar?: string;
  agreementvalue?: string;
  pincode?: string;
  landmark?: string;

}