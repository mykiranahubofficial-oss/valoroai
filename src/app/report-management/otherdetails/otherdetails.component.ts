import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RateValuationComponent } from './rate-valuation/rate-valuation.component';
import { FinalValuationComponent } from './final-valuation/final-valuation.component';
import { RepmanageserviceService } from '../repmanageservice.service';
import { SiteDetailsComponent } from './site-details/site-details.component';
import { ValuationTableComponent, ValuationTablePayload } from './valuation-table/valuation-table.component';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';

@Component({
  selector: 'app-otherdetails',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RateValuationComponent,
    FinalValuationComponent,
    SiteDetailsComponent,
    ValuationTableComponent
  ],
  templateUrl: './otherdetails.component.html',
  styleUrls: ['./otherdetails.component.css']
})
export class OtherdetailsComponent implements OnInit {

  @ViewChild(SiteDetailsComponent) siteDetails!: SiteDetailsComponent;
  @ViewChild(ValuationTableComponent) valuationTable!: ValuationTableComponent;

  // ── Stores latest emitted data from ValuationTableComponent ──
  valuationTableData: ValuationTablePayload | null = null;

  // 1. Data Mapping
  districts = ['Pune', 'Mumbai', 'Nagpur', 'Nashik', 'Thane'];

  municipalitiesMap: { [key: string]: string[] } = {
    'Pune': [
      'Pune Municipal Corporation (PMC)',
      'Pimpri Chinchwad Municipal Corporation (PCMC)'
    ],
    'Mumbai': ['Brihanmumbai Municipal Corporation (BMC)'],
    'Thane': ['Thane Municipal Corporation (TMC)', 'Kalyan-Dombivli Municipal Corporation (KDMC)'],
  };

  availableMunicipalities: string[] = [];
  reportId = '';
  draftId = '';
  isSaving = false;
  tableData: any = null;
  private platformId = inject(PLATFORM_ID);

  constructor(
    private route: ActivatedRoute,
    private reportService: RepmanageserviceService
  ) { }

  // 3. Fix the ngOnInit — wrap the localStorage call
// ✅ REPLACE WITH — read tableData from localStorage instead
ngOnInit() {
  console.log("🟢 OtherdetailsComponent initialized");
  this.onDistrictChange();

  this.route.queryParams.subscribe(params => {
    this.reportId = params['reportId'] || '';
    this.draftId  = params['draftId']  || '';

    if (!isPlatformBrowser(this.platformId)) return;

    // ✅ Tables already saved to localStorage by report-selection
    const rawTables = localStorage.getItem('draftTables');
    if (rawTables) {
      const tables = JSON.parse(rawTables);
      this.tableData = tables?.[0] || null;
      console.log("📊 TABLE DATA SET from localStorage:", this.tableData);
    }
  });
}

  /* ════════════════════════
     VALUATION TABLE — receives emitted data from child
  ════════════════════════ */
  onValuationTableChange(payload: ValuationTablePayload) {
    this.valuationTableData = payload;

    // ── Push sayValue → fairMarketValue ──
    if (payload.sayValue) {
      const raw = payload.sayValue
        .replace('Rs. ', '')
        .replace('/-', '')
        .replace(/,/g, '')
        .trim();

      // Spread to trigger ngOnChanges in FinalValuationComponent
      this.formData = {
        ...this.formData,
        fairMarketValue: Number(raw).toLocaleString('en-IN')
      };
    }
  }

  formData: any = {
    classificationOfArea: 'High',
    localityType: 'Urban',
    localAuthority: 'Municipality',
    rateFrom: '',
    rateTo: '',
    adoptedRateFrom: '',
    adoptedRateTo: '',
    buildingServiceRate: '',
    landOtherRate: '',
    guidelineRate: '',
    depreciatedGuidelineRate: '',
    builtUpArea: '',
    guidelineCalculatedValue: '',
    buildingAge: '',
    buildingLife: '65',
    depreciationPercent: '05.00',
    compositeRate: '',
    fairMarketValue: '',
    realizableValue: '',
    distressValue: '',
    insurableValue: '',
    rentalValue: '',
    guidelineBookValue: ''
  };

  /* ════════════════════════
     CLEAN CURRENCY
  ════════════════════════ */
  cleanCurrency(value: any) {
    if (!value) return null;
    const cleaned = String(value).replace(/,/g, '').replace('/-', '').trim();
    const num = Number(cleaned);
    return isNaN(num) ? null : num;
  }

  onDistrictChange() {
    this.availableMunicipalities = this.municipalitiesMap[this.formData.district] || [];
    this.formData.localAuthority = this.availableMunicipalities[0] || '';
  }

  /* ════════════════════════
     SAVE VALUATION DETAILS
  ════════════════════════ */
  saveValuationDetails() {
    if (!this.reportId) {
      console.warn("ReportId missing");
      return;
    }

    console.log('🔍 [OtherDetails] valuationTableData at save time:', this.valuationTableData);

    const payload = {
      reportId: this.reportId,
      draftId: this.draftId,

      // ── Site Details ──
      extentofsite: this.siteDetails?.formData?.extentSite || '',
      extentofsiteconsiderforvaluation: this.siteDetails?.formData?.extentValuation || '',
      plinthareaofflat: this.siteDetails?.formData?.plinthArea || '',
      carpetareaofflat: this.siteDetails?.formData?.carpetArea || '',

      // ── Valuation Table — from emitted data ──
      valuationTables: this.valuationTableData || null,

      classificationOfArea: this.formData.classificationOfArea,
      localityType: this.formData.localityType,
      localAuthority: this.formData.localAuthority,
      rateFrom: this.formData.rateFrom,
      rateTo: this.formData.rateTo,
      adoptedRateFrom: this.formData.adoptedRateFrom,
      adoptedRateTo: this.formData.adoptedRateTo,
      buildingServiceRate: this.formData.buildingServiceRate,
      landOtherRate: this.formData.landOtherRate,
      guidelineRate: this.formData.guidelineRate,
      depreciatedGuidelineRate: this.formData.depreciatedGuidelineRate,
      builtUpArea: this.formData.builtUpArea,
      guidelineCalculatedValue: this.cleanCurrency(this.formData.guidelineCalculatedValue),
      buildingAge: this.formData.buildingAge,
      buildingLife: this.formData.buildingLife,
      depreciationPercent: this.formData.depreciationPercent,
      compositeRate: this.formData.compositeRate,
      fairMarketValue: this.cleanCurrency(this.formData.fairMarketValue),
      fairMarketValueCharacter: this.formData.fairMarketValueCharacter,
      realizableValue: this.cleanCurrency(this.formData.realizableValue),
      realizableValueCharacter: this.formData.realizableValueCharacter,
      distressValue: this.cleanCurrency(this.formData.distressValue),
      insurableValue: this.cleanCurrency(this.formData.insurableValue),
      rentalValue: this.cleanCurrency(this.formData.rentalValue),
      guidelineBookValue: this.cleanCurrency(this.formData.guidelineBookValue)
    };

    console.log("📤 [OtherDetails] Sending valuation payload:", JSON.stringify(payload, null, 2));

    this.isSaving = true;
    this.reportService.saveValuationDetails(payload).subscribe({
      next: (res) => {
        console.log("✅ Valuation saved successfully:", res);
        this.isSaving = false;
      },
      error: (err) => {
        console.error("❌ Error saving valuation:", err);
        this.isSaving = false;
      }
    });
  }
}