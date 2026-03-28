// import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ActivatedRoute } from '@angular/router';
// import { UploadHeaderComponent } from './upload-header/upload-header.component';
// import { ReportFormComponent } from './report-form/report-form.component';
// import { VisitDetailsComponent } from './visit-details/visit-details.component';
// import { PhotoOrganizerComponent } from './photo-organizer/photo-organizer.component';
// import { MarcketPhotoComponent } from './marcket-photo/marcket-photo.component';
// import { OtherdetailsComponent } from '../otherdetails/otherdetails.component';
// import { RepmanageserviceService } from '../repmanageservice.service';
// import { PhotoOrganizerService } from './service/photo-organizer.service';
// import { MediaUploadComponent } from './media-upload/media-upload.component';
// import { concatMap, tap } from 'rxjs/operators';
// import { of } from 'rxjs';
// import { Router } from '@angular/router';
// import { SlotPhotoUploaderComponent, SlotPhotoEntry } from './slotphotouploader/slotphotouploader.component';
// import { LandOtherdetailsComponent, LandValuationData } from '../land-otherdetails/land-otherdetails.component';

// @Component({
//   selector: 'app-report-creation',
//   standalone: true,
//   imports: [
//     CommonModule,
//     UploadHeaderComponent,
//     ReportFormComponent,
//     OtherdetailsComponent,
//     VisitDetailsComponent,
//     PhotoOrganizerComponent,
//     MarcketPhotoComponent,
//     MediaUploadComponent,
//     SlotPhotoUploaderComponent,
//     LandOtherdetailsComponent
//   ],
//   templateUrl: './report-creation.component.html',
//   styleUrl: './report-creation.component.css'
// })
// export class ReportCreationComponent implements OnInit, AfterViewInit {

//   visitMessage = '';
//   uploadedFiles: any = {};
//   propertyPhotos: any[] = [];
//   selectedPhotos: any[] = [];
//   marketPhotos: File[] = [];
//   reportType: 'flat' | 'land' | '' = '';

//   @ViewChild(ReportFormComponent) reportForm!: ReportFormComponent;
//   @ViewChild(VisitDetailsComponent) visitDetails!: VisitDetailsComponent;
//   @ViewChild(OtherdetailsComponent) valuationDetails!: OtherdetailsComponent;
//   @ViewChild(MediaUploadComponent) mapAttachments!: MediaUploadComponent;
//   @ViewChild(SlotPhotoUploaderComponent) slotUploader!: SlotPhotoUploaderComponent;
//   @ViewChild(LandOtherdetailsComponent, { static: false }) landDetails!: LandOtherdetailsComponent;
//   landValuationData: LandValuationData | null = null;
//   slotPhotoEntries: SlotPhotoEntry[] = [];

//   reportId = '';
//   draftId = '';
//   creatingReport = false;

//   constructor(
//     private route: ActivatedRoute,
//     private reportService: RepmanageserviceService,
//     private photoService: PhotoOrganizerService,
//     private cdr: ChangeDetectorRef,
//     private router: Router  // ✅ add this

//   ) {
//     console.log("ReportCreation service:", this.photoService);
//   }

//   ngOnInit() {
//   const params    = this.route.snapshot.queryParams;
//   this.reportId   = params['reportId']  || '';
//   this.draftId    = params['draftId']   || '';
//   this.reportType = params['reportType'] === 'land' ? 'land' : 'flat';

//   console.log('🔍 reportType:', this.reportType);

//   this.cdr.detectChanges(); // ← now runs AFTER reportType is known

//   this.photoService.selectedPhotos$.subscribe(photos => {
//     this.selectedPhotos = photos;
//   });
// }

//   ngAfterViewInit() {
//     console.log("ReportForm:", this.reportForm);
//     console.log("VisitDetails:", this.visitDetails);
//   }
//   get isLandReport(): boolean {
//     return this.reportType === 'land';
//   }
//   handleLandValuationSaved(data: LandValuationData): void {
//     this.landValuationData = data;

//     console.group('✅ [ReportCreation] handleLandValuationSaved() received:');
//     console.log('Full data:', data);
//     console.log('fairMarketValue:', data.fairMarketValue);
//     console.log('circleTotalValue:', data.circleTotalValue);
//     console.groupEnd();
//   }
//   /* ════════════════════════
//      VALIDATION
//   ════════════════════════ */

//   validateBeforeCreate(): string[] {
//     const errors: string[] = [];

//     if (!this.reportForm) {
//       errors.push("Form not loaded yet");
//       return errors;
//     }

//     const form = this.reportForm.formData;

//     // ── Common validations (both flat and land) ──
//     if (!form.ownerName?.trim()) errors.push("Owner Name is required");
//     if (!form.propertyLocation?.trim()) errors.push("Property Location is required");
//     if (!form.village?.trim()) errors.push("Village is required");
//     if (!form.district?.trim()) errors.push("District is required");
//     if (!form.pincode?.trim()) errors.push("Pincode is required");

//     // ── Flat-only validations ──
//     if (!this.isLandReport) {
//       if (!this.visitDetails) errors.push("Form not loaded yet");
//       const visit = this.visitDetails?.visitDetails;
//       if (!visit?.buildingName?.trim()) errors.push("Building Name is required");
//       if (!visit?.flatNo?.trim()) errors.push("Flat Number is required");
//       if (!this.selectedPhotos?.length) errors.push("At least one property photo is required");
//       const missingSlots = this.slotUploader?.getMissingRequired() ?? [];
//       if (missingSlots.length > 0) {
//         errors.push(`Missing required photos: ${missingSlots.join(', ')}`);
//       }
//     }
//     return errors;
//   }

//   /* ════════════════════════
//      EVENT HANDLERS
//   ════════════════════════ */
//   handleVisitMessage(message: string) {
//     this.visitMessage = message;
//   }

//   handleFileUpload(fileData: any) {
//     if (fileData.removed) {
//       delete this.uploadedFiles[fileData.type];
//     } else {
//       this.uploadedFiles[fileData.type] = fileData;
//     }
//   }

//   handleMarketPhotos(files: File[]) {
//     console.log("🏪 Market photos received in ReportCreation:", files);
//     this.marketPhotos = files;
//   }

//   handleExtraction(data: any) {
//     console.log("📡 STEP 2: Parent handleExtraction received:", data);
//     if (this.mapAttachments) {
//       console.log("✅ STEP 2.1: mapAttachments component found. Pushing data now...");
//       this.mapAttachments.setAddressData(data);
//     } else {
//       console.error("❌ STEP 2.2: mapAttachments (@ViewChild) is UNDEFINED. Check HTML selector.");
//     }
//   }
//   handleSlotPhotosChanged(entries: SlotPhotoEntry[]): void {
//     this.slotPhotoEntries = entries;
//     console.log('📸 Slot photos updated:', entries.map(e => e.photoName));
//   }
//   /* ════════════════════════
//      CREATE REPORT
//   ════════════════════════ */
//   /* ════════════════════════
//    CREATE REPORT
// ════════════════════════ */
//   createReport() {
//     console.log('🔍 [createReport] reportType:', this.reportType);      // ✅ ADD
//     console.log('🔍 [createReport] isLandReport:', this.isLandReport);  // ✅ ADD
//     const errors = this.validateBeforeCreate();
//     if (errors.length > 0) {
//       alert(errors.join('\n'));
//       return;
//     }

//     if (this.mapAttachments?.isProcessing) {
//       alert('Location map is still being generated.\nPlease wait for it to complete and try again.');
//       return;
//     }

//     this.creatingReport = true;

//     // ── Shared: basic data (both flat and land) ──
//     const basicData = this.reportForm.formData;

//     const rawPin = (basicData.pincode || '').replace(/\D/g, '');
//     const pin = this.reportForm.formatPincode(rawPin);
//     const trimLocation = (s: string) =>
//       s.replace(/\.\d{3}-\d{3}$/, '').replace(/\.\d{6}$/, '');

//     const basicPayload = {
//       reportId: this.reportId,
//       draftId: this.draftId,
//       ...basicData,
//       repDate: this.reportForm.formatToDDMMYYYY(basicData.repDate),
//       indexiidate: this.reportForm.formatToDDMMYYYY(basicData.indexiidate),
//       agreementvalue: this.reportForm.formatIndianCurrency(basicData.agreementvalue),
//       propertyLocation: `${trimLocation(basicData.propertyLocation || '')}.${pin}`,
//       briefdisofproject: `${trimLocation(basicData.briefdisofproject || '')}.${pin}`,
//     };

//     const locationMapUpload$ = this.mapAttachments?.locationMapFile
//       ? this.reportService.uploadLocationImage({
//         reportId: this.reportId,
//         imageFile: this.mapAttachments.locationMapFile,
//         marketLinkFile: this.mapAttachments.reckonerFile
//       }).pipe(tap(res => console.log('✅ Location map saved:', res)))
//       : of(null);

//     // ══════════════════════════════════════════
//     //  LAND REPORT CHAIN
//     // ══════════════════════════════════════════
//     if (this.isLandReport) {
//       if (!this.landDetails) {
//         console.error('❌ landDetails ViewChild is undefined — *ngIf may not have rendered it yet');
//         alert('Valuation form not loaded. Please try again.');
//         this.creatingReport = false;
//         return;
//       }
//       this.landDetails?.saveValuation();

//       const landPayload = {
//         reportId: this.reportId,
//         draftId: this.draftId,
//         reportType: 'land',

//         // ── Circle rate ──
//         circleRate: this.landValuationData?.circleRate ?? 0,
//         landArea: this.landValuationData?.landArea ?? 0,
//         circlePartB: this.landValuationData?.circlePartB ?? 0,
//         circlePartC: this.landValuationData?.circlePartC ?? 0,
//         circleTotalValue: this.landValuationData?.circleTotalValue ?? 0,

//         // ── Market rate ──
//         plotArea: this.landValuationData?.plotArea ?? 0,
//         adoptedRate: this.landValuationData?.adoptedRate ?? 0,
//         adoptedReason: this.landValuationData?.adoptedReason ?? '',
//         partAValue: this.landValuationData?.partAValue ?? 0,
//         partBRows: this.landValuationData?.partBRows ?? [],
//         partBTotal: this.landValuationData?.partBTotal ?? 0,
//         partCRows: this.landValuationData?.partCRows ?? [],
//         partCTotal: this.landValuationData?.partCTotal ?? 0,
//         marketTotalValue: this.landValuationData?.marketTotalValue ?? 0,

//         // ── Final valuation — same keys backend already knows ──
//         fairMarketValue: this.landValuationData?.fairMarketValue ?? 0,
//         realizableValue: this.landValuationData?.realizableValue ?? 0,
//         distressValue: this.landValuationData?.distressValue ?? 0,
//         insurableValue: this.landValuationData?.insurableValue ?? 0,
//         rentalValue: this.landValuationData?.rentalValue ?? 0,
//         guidelineBookValue: this.landValuationData?.circleRateValue ?? 0,
//       };

//       console.log('🏗️ Land payload:', landPayload);

//       locationMapUpload$
//         .pipe(
//           concatMap(() => {
//             console.log('🔗 Starting land save chain...');
//             return this.reportService.saveBasicDetails(basicPayload);
//           }),
//           concatMap(() => {
//             console.log('✅ Basic saved');
//             return this.reportService.saveValuationDetails(landPayload); // ✅ same endpoint
//           }),
//           concatMap(() => {
//             console.log('✅ Land valuation saved');

//             const finalForm = new FormData();
//             finalForm.append('reportId', this.reportId);
//             finalForm.append('draftId', this.draftId);
//             finalForm.append('reportType', 'land');

//             if (this.mapAttachments?.reckonerFile)
//               finalForm.append('marketLinkimg', this.mapAttachments.reckonerFile);
//             if (this.mapAttachments?.locationMapFile)
//               finalForm.append('image', this.mapAttachments.locationMapFile);

//             console.log(`📸 Appending ${this.selectedPhotos.length} Visit Photos`);
//             this.selectedPhotos.forEach(p => finalForm.append('visitImages', p.file));

//             console.log(`🏪 Appending ${this.marketPhotos.length} Market Photos`);
//             this.marketPhotos.forEach((file, index) => {
//               console.log(`   > Adding Market Photo ${index + 1}:`, file.name);
//               finalForm.append('marketPhotos', file);
//             });

//             console.log(`📸 Appending ${this.slotPhotoEntries.length} slot photos`);
//             this.slotPhotoEntries.forEach(entry => {
//               console.log(`   > ${entry.photoName}:`, entry.file.name);
//               finalForm.append(`slot_${entry.photoName}`, entry.file);
//             });

//             return this.reportService.createReport(finalForm);
//           })
//         )
//         .subscribe({
//           next: (data: any) => this.handleReportResponse(data),
//           error: (err: any) => {
//             console.error('❌ Land report failed:', err);
//             alert('An error occurred');
//             this.creatingReport = false;
//           }
//         });

//       return; // ← do NOT fall into flat logic below
//     }

//     // ══════════════════════════════════════════
//     //  FLAT REPORT CHAIN (original — untouched)
//     // ══════════════════════════════════════════

//     // ── Trigger valuation table save before building payload ──
//     if (this.valuationDetails?.valuationTable) {
//       this.valuationDetails.valuationTable.saveTable();
//     }

//     const visitDataRaw = this.visitDetails.visitDetails;
//     const valuationData = this.valuationDetails.formData;

//     const visitPayload = {
//       reportId: this.reportId,
//       draftId: this.draftId,
//       north: visitDataRaw.northBoundary,
//       south: visitDataRaw.southBoundary,
//       east: visitDataRaw.eastBoundary,
//       west: visitDataRaw.westBoundary,
//       occupied: visitDataRaw.occupied,
//       flatBHK: visitDataRaw.flatType,
//       floors: visitDataRaw.totalFloor,
//       perfloor: visitDataRaw.perFloor,
//       totalflats: visitDataRaw.totalFlat,
//       lifts: visitDataRaw.lift,
//       parking: visitDataRaw.parking,
//       perfloorflat: visitDataRaw.perFloor,
//       flatNo: visitDataRaw.flatNo,
//       landmark: visitDataRaw.landmark
//     };

//     const valuationPayload = {
//       reportId: this.reportId,
//       draftId: this.draftId,
//       ...valuationData,

//       extentofsite: this.valuationDetails.siteDetails?.formData?.extentSite || '',
//       extentofsiteconsiderforvaluation: this.valuationDetails.siteDetails?.formData?.extentValuation || '',
//       plinthareaofflat: this.valuationDetails.siteDetails?.formData?.plinthArea || '',
//       carpetareaofflat: this.valuationDetails.siteDetails?.formData?.carpetArea || '',
//       valuationTables: this.valuationDetails.valuationTableData || null,

//       guidelineCalculatedValue: this.valuationDetails.cleanCurrency(valuationData.guidelineCalculatedValue),
//       fairMarketValue: this.valuationDetails.cleanCurrency(valuationData.fairMarketValue),
//       realizableValue: this.valuationDetails.cleanCurrency(valuationData.realizableValue),
//       distressValue: this.valuationDetails.cleanCurrency(valuationData.distressValue),
//       insurableValue: this.valuationDetails.cleanCurrency(valuationData.insurableValue),
//       rentalValue: this.valuationDetails.cleanCurrency(valuationData.rentalValue),
//       guidelineBookValue: this.valuationDetails.cleanCurrency(valuationData.guidelineBookValue),

//       guidelineCalculatedValueFormatted: this.reportForm.formatIndianCurrency(this.valuationDetails.cleanCurrency(valuationData.guidelineCalculatedValue)),
//       fairMarketValueFormatted: this.reportForm.formatIndianCurrency(this.valuationDetails.cleanCurrency(valuationData.fairMarketValue)),
//       realizableValueFormatted: this.reportForm.formatIndianCurrency(this.valuationDetails.cleanCurrency(valuationData.realizableValue)),
//       distressValueFormatted: this.reportForm.formatIndianCurrency(this.valuationDetails.cleanCurrency(valuationData.distressValue)),
//       insurableValueFormatted: this.reportForm.formatIndianCurrency(this.valuationDetails.cleanCurrency(valuationData.insurableValue)),
//       rentalValueFormatted: this.reportForm.formatIndianCurrency(this.valuationDetails.cleanCurrency(valuationData.rentalValue)),
//       guidelineBookValueFormatted: this.reportForm.formatIndianCurrency(this.valuationDetails.cleanCurrency(valuationData.guidelineBookValue)),
//     };

//     console.group('📋 [ReportCreation] Flat Payload Check');
//     console.log('repDate:', basicPayload.repDate);
//     console.log('indexiidate:', basicPayload.indexiidate);
//     console.log('agreementvalue:', basicPayload.agreementvalue);
//     console.log('valuationTableData:', this.valuationDetails.valuationTableData);
//     console.log('valuationTables:', JSON.stringify(valuationPayload.valuationTables, null, 2));
//     console.groupEnd();

//     locationMapUpload$
//       .pipe(
//         concatMap(() => {
//           console.log('🔗 Starting main save chain...');
//           return this.reportService.saveBasicDetails(basicPayload);
//         }),
//         concatMap(() => {
//           console.log('✅ Basic Details Saved');
//           return this.reportService.saveVisitDetails(visitPayload);
//         }),
//         concatMap(() => {
//           console.log('✅ Visit Details Saved');
//           return this.reportService.saveValuationDetails(valuationPayload);
//         }),
//         concatMap(() => {
//           console.log('📦 Constructing Final FormData...');

//           const finalForm = new FormData();
//           finalForm.append('reportId', this.reportId);
//           finalForm.append('draftId', this.draftId);
//           finalForm.append('reportType', 'flat');   // ✅ ADD THIS

//           if (this.mapAttachments.reckonerFile) {
//             console.log('📄 Appending Market Link (Reckoner)');
//             finalForm.append('marketLinkimg', this.mapAttachments.reckonerFile);
//           }

//           if (this.mapAttachments.locationMapFile) {
//             console.log('📍 Appending Location Map');
//             finalForm.append('image', this.mapAttachments.locationMapFile);
//           }

//           console.log(`📸 Appending ${this.selectedPhotos.length} Visit Photos`);
//           this.selectedPhotos.forEach(p => finalForm.append('visitImages', p.file));

//           console.log(`🏪 Appending ${this.marketPhotos.length} Market Photos`);
//           if (this.marketPhotos?.length > 0) {
//             this.marketPhotos.forEach((file, index) => {
//               console.log(`   > Adding Market Photo ${index + 1}:`, file.name);
//               finalForm.append('marketPhotos', file);
//             });
//           } else {
//             console.warn('⚠️ No Market Photos found');
//           }

//           console.log(`📸 Appending ${this.slotPhotoEntries.length} slot photos`);
//           this.slotPhotoEntries.forEach(entry => {
//             console.log(`   > ${entry.photoName}:`, entry.file.name);
//             finalForm.append(`slot_${entry.photoName}`, entry.file);
//           });

//           return this.reportService.createReport(finalForm);
//         })
//       )
//       .subscribe({
//         next: (data: any) => this.handleReportResponse(data),
//         error: (err: any) => {
//           console.error('❌ Process failed:', err);
//           alert('An error occurred');
//           this.creatingReport = false;
//         }
//       });
//   }

//   /* ════════════════════════
//      SHARED RESPONSE HANDLER
//   ════════════════════════ */
//   private handleReportResponse(data: any): void {
//     console.log('📦 API Response:', data);

//     if (!data.success) {
//       alert('Report generation failed');
//       this.creatingReport = false;
//       return;
//     }

//     const byteCharacters = atob(data.pdfBase64);
//     const byteNumbers = new Array(byteCharacters.length);
//     for (let i = 0; i < byteCharacters.length; i++) {
//       byteNumbers[i] = byteCharacters.charCodeAt(i);
//     }
//     const byteArray = new Uint8Array(byteNumbers);
//     const blob = new Blob([byteArray], { type: 'application/pdf' });
//     const fileURL = URL.createObjectURL(blob);

//     const url = this.router.serializeUrl(
//       this.router.createUrlTree(['/report-preview'], {
//         queryParams: {
//           previewUrl: fileURL,
//           pdfUrl: data.pdfUrl,
//           docxUrl: data.docxUrl,
//           reportId: this.reportId
//         }
//       })
//     );

//     const newTab = window.open('', '_blank');
//     if (newTab) newTab.location.href = url;

//     this.creatingReport = false;
//   }

//   /* ════════════════════════
//      CLEANUP
//   ════════════════════════ */
//   ngOnDestroy() {
//     console.log('🧹 Cleaning up screen data on navigation...');
//     if (this.photoService) {
//       this.photoService.resetService();
//     }
//     this.visitMessage = '';
//     this.selectedPhotos = [];
//     this.uploadedFiles = {};
//   }


// }










import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { UploadHeaderComponent } from './upload-header/upload-header.component';
import { ReportFormComponent } from './report-form/report-form.component';
import { VisitDetailsComponent } from './visit-details/visit-details.component';
import { PhotoOrganizerComponent } from './photo-organizer/photo-organizer.component';
// ✅ FIX 3: Removed dead MarcketPhotoComponent import
import { OtherdetailsComponent } from '../otherdetails/otherdetails.component';
import { RepmanageserviceService } from '../repmanageservice.service';
import { PhotoOrganizerService } from './service/photo-organizer.service';
import { MediaUploadComponent } from './media-upload/media-upload.component';
import { concatMap, takeUntil, tap } from 'rxjs/operators';
import { of, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { SlotPhotoUploaderComponent, SlotPhotoEntry } from './slotphotouploader/slotphotouploader.component';
import { LandOtherdetailsComponent, LandValuationData } from '../land-otherdetails/land-otherdetails.component';

@Component({
  selector: 'app-report-creation',
  standalone: true,
  imports: [
    CommonModule,
    UploadHeaderComponent,
    ReportFormComponent,
    OtherdetailsComponent,
    VisitDetailsComponent,
    PhotoOrganizerComponent,
    // ✅ FIX 3: Removed MarcketPhotoComponent from imports array
    MediaUploadComponent,
    SlotPhotoUploaderComponent,
    LandOtherdetailsComponent
  ],
  templateUrl: './report-creation.component.html',
  styleUrl: './report-creation.component.css'
})
// ✅ FIX 1: Added OnDestroy to implements list
export class ReportCreationComponent implements OnInit, AfterViewInit, OnDestroy {

  visitMessage = '';
  uploadedFiles: any = {};
  propertyPhotos: any[] = [];
  selectedPhotos: any[] = [];
  marketPhotos: File[] = [];
  reportType: 'flat' | 'land' | '' = '';

  @ViewChild(ReportFormComponent) reportForm!: ReportFormComponent;
  @ViewChild(VisitDetailsComponent) visitDetails!: VisitDetailsComponent;
  @ViewChild(OtherdetailsComponent) valuationDetails!: OtherdetailsComponent;
  @ViewChild(MediaUploadComponent) mapAttachments!: MediaUploadComponent;
  @ViewChild(SlotPhotoUploaderComponent) slotUploader!: SlotPhotoUploaderComponent;
  @ViewChild(LandOtherdetailsComponent, { static: false }) landDetails!: LandOtherdetailsComponent;

  landValuationData: LandValuationData | null = null;
  slotPhotoEntries: SlotPhotoEntry[] = [];

  reportId = '';
  draftId = '';
  creatingReport = false;

  // ✅ FIX 1: Subject to drive takeUntil and prevent memory leaks
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private reportService: RepmanageserviceService,
    private photoService: PhotoOrganizerService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit() {
    // ✅ FIX: reportType set BEFORE cdr.detectChanges() so ViewChild resolves correctly
    const params = this.route.snapshot.queryParams;
    this.reportId = params['reportId'] || '';
    this.draftId = params['draftId'] || '';
    this.reportType = params['reportType'] === 'land' ? 'land' : 'flat';

    console.log('🔍 reportType:', this.reportType);

    this.cdr.detectChanges();

    // ✅ FIX 1: takeUntil(this.destroy$) prevents subscription leak on navigation
    this.photoService.selectedPhotos$
      .pipe(takeUntil(this.destroy$))
      .subscribe(photos => {
        console.log('📸 Selected photos received in ReportCreation:', photos);
        this.selectedPhotos = photos;
      });
  }

  ngAfterViewInit() {
    console.log('ReportForm:', this.reportForm);
    console.log('VisitDetails:', this.visitDetails);
  }

  get isLandReport(): boolean {
    return this.reportType === 'land';
  }

  handleLandValuationSaved(data: LandValuationData): void {
    this.landValuationData = data;

    console.group('✅ [ReportCreation] handleLandValuationSaved() received:');
    console.log('Full data:', data);
    console.log('fairMarketValue:', data.fairMarketValue);
    console.log('circleTotalValue:', data.circleTotalValue);
    console.groupEnd();
  }

  /* ════════════════════════
     VALIDATION
  ════════════════════════ */

  validateBeforeCreate(): string[] {
    const errors: string[] = [];

    if (!this.reportForm) {
      errors.push('Form not loaded yet');
      return errors;
    }

    const form = this.reportForm.formData;

    // ── Common validations (both flat and land) ──
    if (!form.ownerName?.trim()) errors.push('Owner Name is required');
    if (!form.propertyLocation?.trim()) errors.push('Property Location is required');
    if (!form.village?.trim()) errors.push('Village is required');
    if (!form.district?.trim()) errors.push('District is required');
    if (!form.pincode?.trim()) errors.push('Pincode is required');

    // ── Flat-only validations ──
    if (!this.isLandReport) {
      if (!this.visitDetails) errors.push('Form not loaded yet');
      const visit = this.visitDetails?.visitDetails;
      if (!visit?.buildingName?.trim()) errors.push('Building Name is required');
      if (!visit?.flatNo?.trim()) errors.push('Flat Number is required');
      if (!this.selectedPhotos?.length) errors.push('At least one property photo is required');
      const missingSlots = this.slotUploader?.getMissingRequired() ?? [];
      if (missingSlots.length > 0) {
        errors.push(`Missing required photos: ${missingSlots.join(', ')}`);
      }
    }

    return errors;
  }

  /* ════════════════════════
     EVENT HANDLERS
  ════════════════════════ */

  handleVisitMessage(message: string) {
    this.visitMessage = message;
  }

  handleFileUpload(fileData: any) {
    if (fileData.removed) {
      delete this.uploadedFiles[fileData.type];
    } else {
      this.uploadedFiles[fileData.type] = fileData;
    }
  }

  handleMarketPhotos(files: File[]) {
    console.log('🏪 Market photos received in ReportCreation:', files);
    this.marketPhotos = files;
  }

  handleExtraction(data: any) {
    console.log('📡 STEP 2: Parent handleExtraction received:', data);
    if (this.mapAttachments) {
      console.log('✅ STEP 2.1: mapAttachments component found. Pushing data now...');
      this.mapAttachments.setAddressData(data);
    } else {
      console.error('❌ STEP 2.2: mapAttachments (@ViewChild) is UNDEFINED. Check HTML selector.');
    }
  }

  handleSlotPhotosChanged(entries: SlotPhotoEntry[]): void {
    this.slotPhotoEntries = entries;
    console.log('📸 Slot photos updated:', entries.map(e => e.photoName));
  }

  /* ════════════════════════
     CREATE REPORT
  ════════════════════════ */

  createReport() {
    console.log('🔍 [createReport] reportType:', this.reportType);
    console.log('🔍 [createReport] isLandReport:', this.isLandReport);

    const errors = this.validateBeforeCreate();
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    if (this.mapAttachments?.isProcessing) {
      alert('Location map is still being generated.\nPlease wait for it to complete and try again.');
      return;
    }

    this.creatingReport = true;

    // ── Shared: basic data (both flat and land) ──
    const basicData = this.reportForm.formData;

    const rawPin = (basicData.pincode || '').replace(/\D/g, '');
    const pin = this.reportForm.formatPincode(rawPin);
    const trimLocation = (s: string) =>
      s.replace(/\.\d{3}-\d{3}$/, '').replace(/\.\d{6}$/, '');

    const basicPayload = {
      reportId: this.reportId,
      draftId: this.draftId,
      ...basicData,
      repDate: this.reportForm.formatToDDMMYYYY(basicData.repDate),
      indexiidate: this.reportForm.formatToDDMMYYYY(basicData.indexiidate),
      agreementvalue: this.reportForm.formatIndianCurrency(basicData.agreementvalue),
      propertyLocation: `${trimLocation(basicData.propertyLocation || '')}.${pin}`,
      briefdisofproject: `${trimLocation(basicData.briefdisofproject || '')}.${pin}`,
    };

    const locationMapUpload$ = this.mapAttachments?.locationMapFile
      ? this.reportService.uploadLocationImage({
        reportId: this.reportId,
        imageFile: this.mapAttachments.locationMapFile,
        marketLinkFile: this.mapAttachments.reckonerFile
      }).pipe(tap(res => console.log('✅ Location map saved:', res)))
      : of(null);

    // ══════════════════════════════════════════
    //  LAND REPORT CHAIN
    // ══════════════════════════════════════════

    if (this.isLandReport) {
      // ✅ FIX 2: Guard against valuationDetails null (land side — landDetails)
      if (!this.landDetails) {
        console.error('❌ landDetails ViewChild is undefined — *ngIf may not have rendered it yet');
        alert('Valuation form not loaded. Please try again.');
        this.creatingReport = false;
        return;
      }

      // ✅ FIX 5: Removed unnecessary optional chain — guard above confirms it exists
      this.landDetails.saveValuation();

      const landPayload = {
        reportId: this.reportId,
        draftId: this.draftId,
        reportType: 'land',

        // ── Circle rate ──
        circleRate: this.landValuationData?.circleRate ?? 0,
        landArea: this.landValuationData?.landArea ?? 0,
        circlePartB: this.landValuationData?.circlePartB ?? 0,
        circlePartC: this.landValuationData?.circlePartC ?? 0,
        circleTotalValue: this.landValuationData?.circleTotalValue ?? 0,

        // ── Market rate ──
        plotArea: this.landValuationData?.plotArea ?? 0,
        mktRateLow: this.landValuationData?.mktRateLow ?? 0,
        mktRateHigh: this.landValuationData?.mktRateHigh ?? 0,
        adoptedRate: this.landValuationData?.adoptedRate ?? 0,
        adoptedReason: this.landValuationData?.adoptedReason ?? '',
        partAValue: this.landValuationData?.partAValue ?? 0,
        partBRows: this.landValuationData?.partBRows ?? [],
        partBTotal: this.landValuationData?.partBTotal ?? 0,
        partCRows: this.landValuationData?.partCRows ?? [],
        partCTotal: this.landValuationData?.partCTotal ?? 0,
        marketTotalValue: this.landValuationData?.marketTotalValue ?? 0,

        // ── Final valuation ──
        fairMarketValue: this.landValuationData?.fairMarketValue ?? 0,
        realizableValue: this.landValuationData?.realizableValue ?? 0,
        distressValue: this.landValuationData?.distressValue ?? 0,
        insurableValue: this.landValuationData?.insurableValue ?? 0,
        rentalValue: this.landValuationData?.rentalValue ?? 0,
        guidelineBookValue: this.landValuationData?.circleRateValue ?? 0,
      };

      // ── Land payload dispatch logs ──
      console.group('🏗️ [Land Chain] Dispatching to backend');

      console.group('🔵 Circle Rate');
      console.log('circleRate:', landPayload.circleRate);
      console.log('landArea:', landPayload.landArea);
      console.log('circlePartB:', landPayload.circlePartB);
      console.log('circlePartC:', landPayload.circlePartC);
      console.log('circleTotalValue:', landPayload.circleTotalValue);
      console.groupEnd();

      console.group('🟢 Market Rate');
      console.log('plotArea:', landPayload.plotArea);
      console.log('mktRateLow:', landPayload.mktRateLow);
      console.log('mktRateHigh:', landPayload.mktRateHigh);
      console.log('adoptedRate:', landPayload.adoptedRate);
      console.log('adoptedReason:', landPayload.adoptedReason);
      console.log('partAValue:', landPayload.partAValue);
      console.log('partBTotal:', landPayload.partBTotal);
      console.log('partCTotal:', landPayload.partCTotal);
      console.log('marketTotalValue:', landPayload.marketTotalValue);
      console.group('Part B rows');
      console.table(landPayload.partBRows);
      console.groupEnd();
      console.group('Part C rows');
      console.table(landPayload.partCRows);
      console.groupEnd();
      console.groupEnd();

      console.group('🟣 Final Valuation');
      console.log('fairMarketValue:', landPayload.fairMarketValue);
      console.log('realizableValue:', landPayload.realizableValue);
      console.log('distressValue:', landPayload.distressValue);
      console.log('insurableValue:', landPayload.insurableValue);
      console.log('rentalValue:', landPayload.rentalValue);
      console.log('guidelineBookValue:', landPayload.guidelineBookValue);
      console.groupEnd();

      console.log('📦 Full landPayload:', landPayload);
      console.groupEnd();
      console.log('🏗️ Land payload:', landPayload);

      locationMapUpload$
        .pipe(
          concatMap(() => {
            console.log('🔗 Starting land save chain...');
            return this.reportService.saveBasicDetails(basicPayload);
          }),
          concatMap(() => {
            console.log('✅ Basic saved');
            return this.reportService.saveValuationDetails(landPayload);
          }),
          concatMap(() => {
            console.log('✅ Land valuation saved');

            const finalForm = new FormData();
            finalForm.append('reportId', this.reportId);
            finalForm.append('draftId', this.draftId);
            finalForm.append('reportType', 'land');

            if (this.mapAttachments?.reckonerFile)
              finalForm.append('marketLinkimg', this.mapAttachments.reckonerFile);
            if (this.mapAttachments?.locationMapFile)
              finalForm.append('image', this.mapAttachments.locationMapFile);

            console.log(`📸 Appending ${this.selectedPhotos.length} Visit Photos`);
            this.selectedPhotos.forEach(p => finalForm.append('visitImages', p.file));

            console.log(`🏪 Appending ${this.marketPhotos.length} Market Photos`);
            this.marketPhotos.forEach((file, index) => {
              console.log(`   > Adding Market Photo ${index + 1}:`, file.name);
              finalForm.append('marketPhotos', file);
            });

            console.log(`📸 Appending ${this.slotPhotoEntries.length} slot photos`);
            this.slotPhotoEntries.forEach(entry => {
              console.log(`   > ${entry.photoName}:`, entry.file.name);
              finalForm.append(`slot_${entry.photoName}`, entry.file);
            });

            return this.reportService.createReport(finalForm);
          })
        )
        .subscribe({
          next: (data: any) => this.handleReportResponse(data),
          error: (err: any) => {
            console.error('❌ Land report failed:', err);
            alert('An error occurred');
            this.creatingReport = false;
          }
        });

      return; // ← do NOT fall into flat logic below
    }

    // ══════════════════════════════════════════
    //  FLAT REPORT CHAIN
    // ══════════════════════════════════════════

    // ✅ FIX 2: Guard against valuationDetails / visitDetails being undefined
    if (!this.valuationDetails) {
      alert('Valuation form not loaded. Please try again.');
      this.creatingReport = false;
      return;
    }

    if (!this.visitDetails) {
      alert('Visit details form not loaded. Please try again.');
      this.creatingReport = false;
      return;
    }

    // ── Trigger valuation table save before building payload ──
    if (this.valuationDetails?.valuationTable) {
      this.valuationDetails.valuationTable.saveTable();
    }

    const visitDataRaw = this.visitDetails.visitDetails;
    const valuationData = this.valuationDetails.formData;

    const visitPayload = {
      reportId: this.reportId,
      draftId: this.draftId,
      north: visitDataRaw.northBoundary,
      south: visitDataRaw.southBoundary,
      east: visitDataRaw.eastBoundary,
      west: visitDataRaw.westBoundary,
      occupied: visitDataRaw.occupied,
      flatBHK: visitDataRaw.flatType,
      floors: visitDataRaw.totalFloor,
      perfloor: visitDataRaw.perFloor,
      totalflats: visitDataRaw.totalFlat,
      lifts: visitDataRaw.lift,
      parking: visitDataRaw.parking,
      perfloorflat: visitDataRaw.perFloor,
      flatNo: visitDataRaw.flatNo,
      landmark: visitDataRaw.landmark
    };

    const valuationPayload = {
      reportId: this.reportId,
      draftId: this.draftId,
      ...valuationData,

      extentofsite: this.valuationDetails.siteDetails?.formData?.extentSite || '',
      extentofsiteconsiderforvaluation: this.valuationDetails.siteDetails?.formData?.extentValuation || '',
      plinthareaofflat: this.valuationDetails.siteDetails?.formData?.plinthArea || '',
      carpetareaofflat: this.valuationDetails.siteDetails?.formData?.carpetArea || '',
      valuationTables: this.valuationDetails.valuationTableData || null,

      guidelineCalculatedValue: this.valuationDetails.cleanCurrency(valuationData.guidelineCalculatedValue),
      fairMarketValue: this.valuationDetails.cleanCurrency(valuationData.fairMarketValue),
      realizableValue: this.valuationDetails.cleanCurrency(valuationData.realizableValue),
      distressValue: this.valuationDetails.cleanCurrency(valuationData.distressValue),
      insurableValue: this.valuationDetails.cleanCurrency(valuationData.insurableValue),
      rentalValue: this.valuationDetails.cleanCurrency(valuationData.rentalValue),
      guidelineBookValue: this.valuationDetails.cleanCurrency(valuationData.guidelineBookValue),

      guidelineCalculatedValueFormatted: this.reportForm.formatIndianCurrency(this.valuationDetails.cleanCurrency(valuationData.guidelineCalculatedValue)),
      fairMarketValueFormatted: this.reportForm.formatIndianCurrency(this.valuationDetails.cleanCurrency(valuationData.fairMarketValue)),
      realizableValueFormatted: this.reportForm.formatIndianCurrency(this.valuationDetails.cleanCurrency(valuationData.realizableValue)),
      distressValueFormatted: this.reportForm.formatIndianCurrency(this.valuationDetails.cleanCurrency(valuationData.distressValue)),
      insurableValueFormatted: this.reportForm.formatIndianCurrency(this.valuationDetails.cleanCurrency(valuationData.insurableValue)),
      rentalValueFormatted: this.reportForm.formatIndianCurrency(this.valuationDetails.cleanCurrency(valuationData.rentalValue)),
      guidelineBookValueFormatted: this.reportForm.formatIndianCurrency(this.valuationDetails.cleanCurrency(valuationData.guidelineBookValue)),
    };

    console.group('📋 [ReportCreation] Flat Payload Check');
    console.log('repDate:', basicPayload.repDate);
    console.log('indexiidate:', basicPayload.indexiidate);
    console.log('agreementvalue:', basicPayload.agreementvalue);
    console.log('valuationTableData:', this.valuationDetails.valuationTableData);
    console.log('valuationTables:', JSON.stringify(valuationPayload.valuationTables, null, 2));
    console.groupEnd();

    locationMapUpload$
      .pipe(
        concatMap(() => {
          console.log('🔗 Starting main save chain...');
          return this.reportService.saveBasicDetails(basicPayload);
        }),
        concatMap(() => {
          console.log('✅ Basic Details Saved');
          return this.reportService.saveVisitDetails(visitPayload);
        }),
        concatMap(() => {
          console.log('✅ Visit Details Saved');
          return this.reportService.saveValuationDetails(valuationPayload);
        }),
        concatMap(() => {
          console.log('📦 Constructing Final FormData...');

          const finalForm = new FormData();
          finalForm.append('reportId', this.reportId);
          finalForm.append('draftId', this.draftId);
          finalForm.append('reportType', 'flat');

          if (this.mapAttachments.reckonerFile) {
            console.log('📄 Appending Market Link (Reckoner)');
            finalForm.append('marketLinkimg', this.mapAttachments.reckonerFile);
          }

          if (this.mapAttachments.locationMapFile) {
            console.log('📍 Appending Location Map');
            finalForm.append('image', this.mapAttachments.locationMapFile);
          }

          console.log(`📸 Appending ${this.selectedPhotos.length} Visit Photos`);
          this.selectedPhotos.forEach(p => finalForm.append('visitImages', p.file));

          console.log(`🏪 Appending ${this.marketPhotos.length} Market Photos`);
          if (this.marketPhotos?.length > 0) {
            this.marketPhotos.forEach((file, index) => {
              console.log(`   > Adding Market Photo ${index + 1}:`, file.name);
              finalForm.append('marketPhotos', file);
            });
          } else {
            console.warn('⚠️ No Market Photos found');
          }

          console.log(`📸 Appending ${this.slotPhotoEntries.length} slot photos`);
          this.slotPhotoEntries.forEach(entry => {
            console.log(`   > ${entry.photoName}:`, entry.file.name);
            finalForm.append(`slot_${entry.photoName}`, entry.file);
          });

          return this.reportService.createReport(finalForm);
        })
      )
      .subscribe({
        next: (data: any) => this.handleReportResponse(data),
        error: (err: any) => {
          console.error('❌ Process failed:', err);
          alert('An error occurred');
          this.creatingReport = false;
        }
      });
  }

  /* ════════════════════════
     SHARED RESPONSE HANDLER
  ════════════════════════ */

  private handleReportResponse(data: any): void {
    console.log('📦 API Response:', data);

    if (!data.success) {
      alert('Report generation failed');
      this.creatingReport = false;
      return;
    }

    const byteCharacters = atob(data.pdfBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    const fileURL = URL.createObjectURL(blob);

    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/report-preview'], {
        queryParams: {
          previewUrl: fileURL,
          pdfUrl: data.pdfUrl,
          docxUrl: data.docxUrl,
          reportId: this.reportId
        }
      })
    );

    const newTab = window.open('', '_blank');
    if (newTab) newTab.location.href = url;

    this.creatingReport = false;
  }

  /* ════════════════════════
     CLEANUP
  ════════════════════════ */

  ngOnDestroy() {
    console.log('🧹 Cleaning up screen data on navigation...');

    // ✅ FIX 1: Complete the destroy$ subject to unsubscribe all takeUntil streams
    this.destroy$.next();
    this.destroy$.complete();

    if (this.photoService) {
      this.photoService.resetService();
    }

    this.visitMessage = '';
    this.selectedPhotos = [];
    this.uploadedFiles = {};
  }
}