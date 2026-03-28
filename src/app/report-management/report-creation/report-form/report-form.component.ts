import {
  Component, OnInit, ChangeDetectorRef,
  Input, SimpleChanges, OnChanges,
  Output,EventEmitter
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UploadHeaderComponent } from '../upload-header/upload-header.component';
import { RepmanageserviceService } from '../../repmanageservice.service';
import { VisitDataService } from '../service/visit-data.service';
import { AmountInWordsPipe } from '../../../shared/pipes/amount-in-words.pipe';
import { PincodeService } from '../../../shared/services/pincode.service';
import { FieldSafetyService } from '../service/field-safety.service';
import { AgreementVerificationComponent } from './agreement-verification/agreement-verification.component';
import {
  AreaCalculationComponent,
  AreaCalculationState,
  SearchForm           // ← import the type
} from './area-calculation/area-calculation.component';
const SQM_TO_SQFT = 10.7639;

@Component({
  selector: 'app-report-form',
  standalone: true,
  imports: [CommonModule, FormsModule, UploadHeaderComponent   , AreaCalculationComponent, AmountInWordsPipe, AgreementVerificationComponent],
  templateUrl: './report-form.component.html',
  styleUrl: './report-form.component.css'
})
export class ReportFormComponent implements OnInit {

  // @Input() indexTwoPreviewUrl: string | null = null;
  // @Input() indexTwoFile: File | null = null;
  @Output() extractionComplete = new EventEmitter<any>(); // 1. Create the emitter
  isExtracting = false;
  private extractionAbortController: AbortController | null = null;

  pincodeError = false;
  reportId = '';
  draftId = '';
  certs: any = {};
  loading = 0;
  agreementVerification: any = null;
  showVerification = false;

  private readonly FIELD_LABELS: Record<string, string> = {
    developerorsellar: 'Seller / Developer',
    ownerName: 'Owner / Buyer',
    buildingName: 'Building Name',
    surveyNo: 'Survey No',
  };
  formData: any = {
    filename: '', ownerName: '',
    propertyLocation: '', locationContext: '', buildingName: '',
    briefdisofproject: '', repDate: '',
    plotNum: '', surveyNo: '', flatNo: '', floor: '',
    village: '', taluka: '', district: '', pincode: '',
    casm: '', casf: '', loading: '',
    bdsm: '', bdsf: '',
    sbdsm: '', sbdsf: '',
    balcony1sm: '', balcony1sf: '',
    balcony2sm: '', balcony2sf: '',
    balcony3sm: '', balcony3sf: '',
    totalBalconySm: '', totalBalconySf: '',
    terrace1sm: '', terrace1sf: '',
    terrace2sm: '', terrace2sf: '',
    totalTerraceSm: '', totalTerraceSf: '',
    totalBuiltSqm: '0.00', totalBuiltSqft: '0.00',
    indexiiserveno: '', indexiidate: '',
    developerorsellar: '', agreementvalue: ''
  };

  areas = [{ type: 'Carpet', sqm: '', sqft: '', builtSqm: '', builtSqft: '' }];
  balconies = [{ type: 'Balcony 1', sqm: '', sqft: '', builtSqm: '', builtSqft: '' }];
  terraces = [{ type: 'Terrace 1', sqm: '', sqft: '', builtSqm: '', builtSqft: '' }];

  totalSqm = '0.00';
  totalSqft = '0.00';
  totalBuiltSqm = '0.00';
  totalBuiltSqft = '0.00';

  // local sets kept in sync via subscription
  mismatchedFields = new Set<string>();
  missingFields = new Set<string>();
  emptyAfterExtract = new Set<string>();
// Replace single-file properties
uploadedFiles: Array<{ file: File; previewUrl: string | null }> = [];
activeFileIndex = 0;


  constructor(
    private route: ActivatedRoute,
    private reportService: RepmanageserviceService,
    private cdr: ChangeDetectorRef,
    private visitDataService: VisitDataService,
    private pincodeService: PincodeService,
    private fieldSafetyService: FieldSafetyService
  ) { }

  private readonly EXPECTED_FIELDS = [
    'ownerName', 'buildingName', 'flatNo', 'floor',
    'plotNum', 'surveyNo',
    'village', 'taluka', 'district', 'pincode',
    'indexiiserveno', 'indexiidate', 'developerorsellar', 'agreementvalue',
    'casm', 'casf','latlong'
  ];


  /* =========================
     LIFECYCLE
  ========================= */

  ngOnInit() {
    this.route.queryParams.subscribe(p => {
      this.reportId = p['reportId'] || '';
      this.draftId = p['draftId'] || '';
    });

    // Listen to visit data updates (e.g. when visit-details parses a message)
    this.visitDataService.visitData$.subscribe(data => {
      const floors = data?.totalFloor || '----------------';
      this.updateBriefDescription(floors);
    });

    // Keep local sets in sync with service
    this.fieldSafetyService.mismatchedFields$.subscribe(fields => {
      this.mismatchedFields = fields;
      this.cdr.markForCheck();
    });
    this.fieldSafetyService.missingFields$.subscribe(fields => {
      this.missingFields = fields;
      this.cdr.markForCheck();
    });
  }

  // ngOnChanges(changes: SimpleChanges) {
  //   if (changes['indexTwoFile'] && this.indexTwoFile) {
  //     console.log('Index II File updated:', this.indexTwoFile.name);
  //   }
  // }



get indexTwoFile(): File | null {
  return this.uploadedFiles[0]?.file ?? null;
}

onMultiFileSelect(event: any) {
  const files: FileList = event.target.files;
  if (!files?.length) return;

  Array.from(files).forEach((file: File) => {
    const isImage = file.type.startsWith('image/');
    const previewUrl = isImage ? URL.createObjectURL(file) : null;
    this.uploadedFiles.push({ file, previewUrl });
  });

  // Reset input so same file can be re-added if needed
  event.target.value = '';
  this.activeFileIndex = this.uploadedFiles.length - 1;
  this.cdr.detectChanges();
}

setActiveFile(index: number) {
  this.activeFileIndex = index;
}

removeUploadedFile(index: number, event: Event) {
  event.stopPropagation();
  const f = this.uploadedFiles[index];
  if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
  this.uploadedFiles.splice(index, 1);
  if (this.activeFileIndex >= this.uploadedFiles.length) {
    this.activeFileIndex = Math.max(0, this.uploadedFiles.length - 1);
  }
  this.cdr.detectChanges();
}
  /* =========================
     BRIEF DESCRIPTION
  ========================= */

 updateBriefDescription(floorInfo: string) {
  const b = this.formData.buildingName || '';
  const l = this.formData.locationContext || this.formData.propertyLocation || '';

  // Strip old pincode suffix before rebuilding
  const trimLocation = (s: string) =>
    s.replace(/\.\d{3}-\d{3}$/, '').replace(/\.\d{6}$/, '');

  this.formData.briefdisofproject =
    `The Building Named "${b}" In Building Comprising off ${floorInfo} Floors. ${trimLocation(l)}`;
}

  /* =========================
     FIELD SAFETY — template helpers
  ========================= */

  isMismatched(field: string): boolean {
    return this.mismatchedFields.has(field);
  }

  isMissing(field: string): boolean {
    return this.missingFields.has(field);
  }
  isEmptyField(field: string): boolean {
    return this.emptyAfterExtract.has(field);
  }

  /**
   * Call this from the template whenever a "watched" field changes.
   * e.g. (ngModelChange)="onWatchedFieldChange()"
   */
  onWatchedFieldChange() {
    this.fieldSafetyService.setReportData(this.formData);
  }

  onFieldChange(field: string) {
  const val = (this.formData[field] || '').toString().trim();
  if (val) {
    this.emptyAfterExtract.delete(field);
  }
  // re-run safety check for watched fields
  if (['ownerName', 'buildingName', 'flatNo'].includes(field)) {
    this.fieldSafetyService.setReportData(this.formData);
  }
  // ── When buildingName changes, update briefdisofproject and propertyLocation ──
  if (field === 'buildingName') {
    this.updateBriefDescription('----------------');
    this.updateBuildingNameInLocation();
  }
}

updateBuildingNameInLocation() {
  const newName = this.formData.buildingName || '';
  const loc = this.formData.propertyLocation || '';

  // Replace whatever is inside the first pair of quotes with the new building name
  // Handles both "OldName" and empty ""
  if (loc.includes('"')) {
    this.formData.propertyLocation = loc.replace(/"[^"]*"/, `"${newName}"`);
  }
}

  onAreaStateChange(state: AreaCalculationState): void {
    this.areas = state.areas;
    this.balconies = state.balconies;
    this.terraces = state.terraces;
    this.loading = state.loading;
    this.totalSqm = state.totalSqm;
    this.totalSqft = state.totalSqft;
    this.totalBuiltSqm = state.totalBuiltSqm;
    this.totalBuiltSqft = state.totalBuiltSqft;
    // sync grand total back to formData for save payload
    this.formData.totalBuiltSqm = state.totalBuiltSqm;
    this.formData.totalBuiltSqft = state.totalBuiltSqft;
  }

  // ── Fix onSearchFormChange — now SearchForm is imported ──
  onSearchFormChange(updated: SearchForm): void {
    this.searchForm = { ...updated };
  }

  // ── Fix onBalconyAdded / onTerraceAdded — use string not null ──
  onBalconyAdded(): void {
    this.balconies = [
      ...this.balconies,
      { type: `Balcony ${this.balconies.length + 1}`, sqm: '', sqft: '', builtSqm: '', builtSqft: '' }
    ];
  }

  onTerraceAdded(): void {
    this.terraces = [
      ...this.terraces,
      { type: `Terrace ${this.terraces.length + 1}`, sqm: '', sqft: '', builtSqm: '', builtSqft: '' }
    ];
  }

  // ── autoFillSearchForm — keep because parent calls it on extraction ──
// Inside report-form.component.ts
// Inside report-form.component.ts

autoFillSearchForm(): void {
  this.searchForm.buildingName = this.formData.buildingName || '';
  
  // 1. Extract specifically Village, Taluka, and District
  const fullAddress = this.formData.propertyLocation || '';
  
  // This regex finds the keyword and everything following it until a comma or period
  const locationParts = fullAddress.match(/(Village|Taluka|District)[^,.]+/gi);
  
  if (locationParts) {
    // 2. Format as "Village X, Taluka Y, District Z"
    this.searchForm.address = locationParts.join(', ').trim();
  } else {
    // Fallback to specific fields if regex on propertyLocation fails
    const parts = [];
    if (this.formData.village) parts.push(`Village ${this.formData.village}`);
    if (this.formData.taluka) parts.push(`Taluka ${this.formData.taluka}`);
    if (this.formData.district) parts.push(`District ${this.formData.district}`);
    
    this.searchForm.address = parts.length > 0 ? parts.join(', ') : fullAddress;
  }

  this.searchForm.areaSqft = this.areas[0]?.sqft || '';
  this.searchForm.bhk = '';
  
  this.cdr.detectChanges();
}

stopExtraction() {
    if (this.extractionAbortController) {
      this.extractionAbortController.abort();
      this.extractionAbortController = null;
      this.isExtracting = false;
      console.log('🛑 Extraction cancelled by user');
      this.cdr.detectChanges();
    }
  }

  onClearSearch() {
    this.searchListings = [];
    this.searchError = '';
    this.searchForm = { buildingName: '', address: '', areaSqft: '', areaType: 'carpet', bhk: '' };
  }
  /* =========================
     OCR EXTRACTION
  ========================= */

  extractData() {
  if (this.uploadedFiles.length === 0) { alert('Please upload at least one file'); return; }
  if (!this.reportId) { alert('ReportId missing'); return; }

  this.isExtracting          = true;
  this.agreementVerification = null;
  this.showVerification      = false;

  // ── Create abort controller for this request ──
  this.extractionAbortController = new AbortController();

  const files = this.uploadedFiles.map(f => f.file);

  this.reportService.extractText(files, this.reportId, this.extractionAbortController.signal).subscribe({


    next: (res) => {

      // ✅ Unwrap batch vs single response
      // Single file → server returns flat { extractedData, agreementVerification, ... }
      // Multi file  → server returns { results: [{ extractedData, agreementVerification, ... }] }
      const isBatch     = Array.isArray(res?.results);
      const firstResult = isBatch ? res.results?.[0] : res;

      if (!firstResult || firstResult.found === false) {
        alert('No Index II document found in the uploaded file(s)');
        this.isExtracting = false;
        this.cdr.detectChanges();
        return;
      }

      /* ── 1. POPULATE FORM DATA ── */
      const data = firstResult?.extractedData || {};

      Object.keys(data).forEach(key => {
        if (!this.formData.hasOwnProperty(key)) return;
        let value = data[key];
        if (key === 'indexiidate' && value) {
          const p = value.split(/[-\/]/);
          if (p.length === 3) value = `${p[2]}-${p[1]}-${p[0]}`;
        }
        this.formData[key] = value;
      });

      /* ── 2. PINCODE + AREA CALCULATIONS ── */
      this.updatePincodeFromAddress();
      this.onAreaInput('ca', 'm');

      // Seed carpet area row
      if (this.areas[0]) {
        this.areas[0].sqm       = this.formData.casm || '';
        this.areas[0].sqft      = this.formData.casf || '';
        this.areas[0].builtSqm  = this.formData.bdsm || '';
        this.areas[0].builtSqft = this.formData.bdsf || '';
      }

      // Inline calculateBuilt
      const SQM = 10.7639;
      const seedBuilt = (row: any) => {
        const sqm = parseFloat(row.sqm);
        if (!sqm) { row.builtSqm = ''; row.builtSqft = ''; return; }
        const built = sqm * (1 + (Number(this.loading) || 0) / 100);
        row.builtSqm  = built.toFixed(2);
        row.builtSqft = (built * SQM).toFixed(2);
      };

      // Seed balcony rows
      [
        ['balcony1sm', 'balcony1sf'],
        ['balcony2sm', 'balcony2sf'],
        ['balcony3sm', 'balcony3sf']
      ].forEach(([sm, sf], i) => {
        const smv = this.formData[sm], sfv = this.formData[sf];
        if (!smv && !sfv) return;
        if (!this.balconies[i]) {
          this.balconies.push({ type: `Balcony ${i + 1}`, sqm: '', sqft: '', builtSqm: '', builtSqft: '' });
        }
        this.balconies[i].sqm  = smv || '';
        this.balconies[i].sqft = sfv || '';
        seedBuilt(this.balconies[i]);
      });

      // Seed terrace rows
      [
        ['terrace1sm', 'terrace1sf'],
        ['terrace2sm', 'terrace2sf']
      ].forEach(([sm, sf], i) => {
        const smv = this.formData[sm], sfv = this.formData[sf];
        if (!smv && !sfv) return;
        if (!this.terraces[i]) {
          this.terraces.push({ type: `Terrace ${i + 1}`, sqm: '', sqft: '', builtSqm: '', builtSqft: '' });
        }
        this.terraces[i].sqm  = smv || '';
        this.terraces[i].sqft = sfv || '';
        seedBuilt(this.terraces[i]);
      });

      // Recalculate totals
      const allRows = [...this.areas, ...this.balconies, ...this.terraces];
      const totalBuilt        = allRows.reduce((a: number, r: any) => a + (parseFloat(r.builtSqm) || 0), 0);
      this.totalSqm           = allRows.reduce((a: number, r: any) => a + (Number(r.sqm)  || 0), 0).toFixed(2);
      this.totalSqft          = allRows.reduce((a: number, r: any) => a + (Number(r.sqft) || 0), 0).toFixed(2);
      this.totalBuiltSqm      = totalBuilt.toFixed(2);
      this.totalBuiltSqft     = (totalBuilt * SQM).toFixed(2);
      this.formData.totalBuiltSqm  = this.totalBuiltSqm;
      this.formData.totalBuiltSqft = this.totalBuiltSqft;

      this.updateBriefDescription('----------------');

      /* ── 3. SEARCH FORM AUTO-FILL ── */
      this.autoFillSearchForm();

      /* ── 4. EMPTY FIELD TRACKING ── */
      this.emptyAfterExtract.clear();
      this.EXPECTED_FIELDS.forEach(field => {
        const val = (this.formData[field] || '').toString().trim();
        if (!val) this.emptyAfterExtract.add(field);
      });

      /* ── 5. FIELD SAFETY SERVICE SYNC ── */
      this.fieldSafetyService.setReportData(this.formData);

      /* ── 6. AGREEMENT VERIFICATION ── */
      const verification = firstResult?.agreementVerification; // ✅ from firstResult, not res

      if (verification && !verification.error) {
        this.agreementVerification = verification;
        this.showVerification      = true;

        console.group('📋 Agreement Verification Result');
        console.log('Agreement Data:',  verification.agreementData);
        console.log('Corrections:',     verification.corrections);
        console.log('Search Results:',  verification.searchResults);
        console.log('Timings:',         verification.timings);
        console.log('Total MS:',        verification.totalMs);
        console.groupEnd();

        const correctionKeys = Object.keys(verification.corrections || {});
        if (correctionKeys.length > 0) {
          correctionKeys.forEach(field => this.mismatchedFields.add(field));
          this.fieldSafetyService.setReportData(this.formData);
          console.warn(
            `⚠️ ${correctionKeys.length} mismatch(es) detected:`,
            correctionKeys.map(k => ({
              field:     k,
              indexII:   verification.corrections[k].indexII,
              agreement: verification.corrections[k].agreement,
              reason:    verification.corrections[k].reason,
            }))
          );
        } else {
          console.log('✅ All fields match between Index II and Agreement');
        }

      } else if (verification?.error) {
        console.warn('⚠️ Agreement verification error:', verification.error);
        this.agreementVerification = null;
        this.showVerification      = false;

      } else {
        console.log('ℹ️ Agreement verification not available (image/URL input)');
        this.agreementVerification = null;
        this.showVerification      = false;
      }

      /* ── 7. DONE ── */
      this.isExtracting = false;
      this.cdr.detectChanges();

      // --- LOGGING & EMITTING ---
      const pushData = {
        village:      this.formData.village,
        taluka:       this.formData.taluka,
        district:     this.formData.district,
        buildingName: this.formData.buildingName
      };

      console.log("🔍 [Step 1: Form] Emitting extractionComplete event:", pushData);
      this.extractionComplete.emit(pushData);
    },

  error: (err) => {
      if (err.name === 'AbortError' || err.status === 0) {
        console.log('🛑 Extraction was cancelled');
      } else {
        console.error('🚨 Extraction error:', err);
        alert('Extraction failed');
      }
      this.isExtracting = false;
      this.extractionAbortController = null;
      this.cdr.detectChanges();
    }
  });
}

calculateRowBuiltUp(prefix: string) {
  const sqm     = parseFloat(this.formData[prefix === 'ca' ? 'casm'    : prefix + 'm']);
  const loading = parseFloat(this.formData[prefix === 'ca' ? 'loading' : prefix + 'l']);
  const smKey   = prefix === 'ca' ? 'bdsm' : prefix + 'bsm';
  const sfKey   = prefix === 'ca' ? 'bdsf' : prefix + 'bsf';

  if (isNaN(sqm) || isNaN(loading)) {
    this.formData[smKey] = this.formData[sfKey] = '';
  } else {
    const built = sqm * (1 + loading / 100);
    this.formData[smKey] = built.toFixed(2);
    this.formData[sfKey] = this.toSqft(built).toFixed(2);
  }

  // Sync formData grand total inline (calculateGrandTotal was removed)
  const allRows = [...this.areas, ...this.balconies, ...this.terraces];
  const total = allRows.reduce((a: number, r: any) => a + (parseFloat(r.builtSqm) || 0), 0);
  this.formData.totalBuiltSqm  = total.toFixed(2);
  this.formData.totalBuiltSqft = this.toSqft(total).toFixed(2);
  this.cdr.detectChanges();
}

  /* =========================
     FILE HANDLING
  ========================= */

  // onFileSelect(event: any, type: string) {
  //   const file = event.target.files[0];
  //   if (!file) return;
  //   const preview = URL.createObjectURL(file);
  //   this.certs[type] = { file, preview };
  //   if (type === 'indexII') {
  //     this.indexTwoFile = file;
  //     this.indexTwoPreviewUrl = preview;
  //   }
  //   this.cdr.detectChanges();
  // }

  // handleFileUpload(event: any) {
  //   if (event.type === 'indexII') {
  //     if (event.removed) {
  //       this.indexTwoPreviewUrl = this.indexTwoFile = null;
  //     } else {
  //       this.indexTwoFile = event.file;
  //       this.indexTwoPreviewUrl = event.preview || URL.createObjectURL(event.file);
  //     }
  //   }
  //   this.cdr.detectChanges();
  // }

  // removeFile(type: string) {
  //   if (this.certs[type]?.preview) URL.revokeObjectURL(this.certs[type].preview);
  //   delete this.certs[type];
  //   if (type === 'indexII') this.indexTwoPreviewUrl = this.indexTwoFile = null;
  // }

  /* =========================
     CURRENCY
  ========================= */

  formatIndianCurrency(value: any) {
    if (!value) return '';
    return Number(value).toLocaleString('en-IN');
  }

  updateAgreementValue(event: any) {
    this.formData.agreementvalue = event.target.value.replace(/,/g, '');
  }

  /* =========================
     SAVE
  ========================= */

  saveBasicDetails() {
    const rawPin = (this.formData.pincode || '').replace(/\D/g, '');
    if (rawPin.length !== 6) {
      this.pincodeError = true;
      alert('Please enter a valid 6 digit pincode');
      const field = document.querySelector('#pincodeField') as HTMLElement;
      field?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    this.pincodeError = false;

    const pin = this.formatPincode(rawPin);
    const trimLocation = (s: string) =>
      s.replace(/\.\d{3}-\d{3}$/, '').replace(/\.\d{6}$/, '');

    const propertyLocation = `${trimLocation(this.formData.propertyLocation || '')}.${pin}`;
    const briefdisofproject = `${trimLocation(this.formData.briefdisofproject || '')}.${pin}`;

    const payload = {
      reportId: this.reportId,
      draftId: this.draftId,
      ...this.formData,
      repDate: this.formatToDDMMYYYY(this.formData.repDate),
      propertyLocation,
      briefdisofproject,
      agreementvalue: this.formatIndianCurrency(this.formData.agreementvalue)
    };

    this.reportService.saveBasicDetails(payload).subscribe({
      next: () => alert('Basic Details Saved Successfully'),
      error: () => alert('Failed to save details')
    });
  }

  /* =========================
     DATE HELPERS
  ========================= */

  formatToDDMMYYYY(date: string) {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return [
      String(d.getDate()).padStart(2, '0'),
      String(d.getMonth() + 1).padStart(2, '0'),
      d.getFullYear()
    ].join('-');
  }

  formatToInputDate(date: string) {
    if (!date) return '';
    const p = date.split('-');
    return p.length === 3 ? `${p[2]}-${p[1]}-${p[0]}` : date;
  }

  /* =========================
     PINCODE HELPERS
  ========================= */

onPincodeChange(event: any) {
  const raw = event.target.value.replace(/\D/g, '').substring(0, 6);
  this.formData.pincode = raw;
  if (raw.length === 6) {
    this.pincodeError = false;
    this.updateLocationWithPincode();

    // ── Auto-save this pincode for future use ──
    const { village, taluka, district } = this.formData;
    if (village && taluka && district) {
      this.pincodeService.saveNewPincode(village, taluka, district, raw);
    }
  }
}

  formatPincode(value?: string) {
    if (!value) return '';
    const d = value.replace(/\D/g, '').substring(0, 6);
    return d.length <= 3 ? d : `${d.substring(0, 3)}-${d.substring(3)}`;
  }

  updateLocationWithPincode() {
    const raw = (this.formData.pincode || '').replace(/\D/g, '');
    if (raw.length !== 6) return;
    const pin = this.formatPincode(raw);
    const trim = (s: string) =>
      s.replace(/\.\d{3}-\d{3}$/, '').replace(/\.\d{6}$/, '');
    this.formData.propertyLocation = `${trim(this.formData.propertyLocation || '')}.${pin}`;
    if (this.formData.briefdisofproject) {
      this.formData.briefdisofproject = `${trim(this.formData.briefdisofproject)}.${pin}`;
    }
  }

  updatePincodeFromAddress() {
    const { village, taluka, district } = this.formData;
    if (!village || !taluka || !district) return;
    const pin = this.pincodeService.getPincode(village, taluka, district);
    if (pin) {
      this.formData.pincode = pin;
      this.updateLocationWithPincode();
    }
  }

  /* =========================
     SEARCH
  ========================= */

  searchListings: any[] = [];
  isSearching = false;
  searchError = '';
  searchForm = {
    buildingName: '', address: '', areaSqft: '', areaType: 'carpet', bhk: ''
  };


  /* =========================
   VERIFICATION HELPERS
========================= */
  onCorrectionApplied(event: { fieldKey: string; correctedValue: string }) {
    this.formData[event.fieldKey] = event.correctedValue;

    // Remove from corrections so card turns green
    if (this.agreementVerification?.corrections) {
      delete this.agreementVerification.corrections[event.fieldKey];
      // Trigger change detection — reassign to new object ref
      this.agreementVerification = { ...this.agreementVerification };
    }

    this.mismatchedFields.delete(event.fieldKey);
    this.fieldSafetyService.setReportData(this.formData);
    this.cdr.detectChanges();
  }

  /* =========================
Area Calculation 
========================= */

  /* =========================
      UNIT HELPERS
   ========================= */

  toSqft(v: number) { return v * SQM_TO_SQFT; }
  toSqm(v: number) { return v / SQM_TO_SQFT; }

  /* =========================
     ROW CALCULATIONS
  ========================= */









  onAreaInput(prefix: string, unit: 'm' | 'f') {
    const smKey = prefix === 'ca' ? 'casm' : prefix + 'm';
    const sfKey = prefix === 'ca' ? 'casf' : prefix + 'f';
    const val = parseFloat(this.formData[unit === 'm' ? smKey : sfKey]);
    if (isNaN(val)) {
      this.formData[unit === 'm' ? sfKey : smKey] = '';
    } else {
      this.formData[unit === 'm' ? sfKey : smKey] =
        (unit === 'm' ? this.toSqft(val) : this.toSqm(val)).toFixed(2);
    }
    this.calculateRowBuiltUp(prefix);
  }


  /* =========================
     ADD ROWS
  ========================= */




  onSearchValues() {
    const { buildingName, address, areaSqft, areaType, bhk } = this.searchForm;
    if (!buildingName || !address || !areaSqft || !areaType) {
      this.searchError = 'Building name, address, area and area type are required.';
      return;
    }
    this.isSearching = true;
    this.searchError = '';
    this.searchListings = [];

    this.reportService.searchValue(buildingName, address, parseFloat(areaSqft), areaType, bhk || undefined)
      .subscribe({
        next: (res) => {
          this.searchListings = res?.listings || [];
          this.isSearching = false;
          if (!this.searchListings.length) this.searchError = 'No comparable listings found.';
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isSearching = false;
          this.searchError = 'Search failed. Please try again.';
          console.error(err);
          this.cdr.detectChanges();
        }
      });
  }
}