import {
  Component, Input, Output, EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface VerificationField {
  key: string;
  indexKey: string;
  agreeKey: string;
  label: string;
  searchKey: string;
}

export interface CorrectionEntry {
  indexII: string;
  agreement: string;
  reason: string;
}

export interface AgreementVerificationResult {
  agreementData: {
    agreementSeller:   string;
    agreementOwner:    string;
    agreementBuilding: string;
    agreementSurveyNo: string;
    confidence:        'high' | 'medium' | 'low';
    notes:             string;
  };
  corrections:   Record<string, CorrectionEntry>;
  searchResults: Record<string, { found: boolean; pageNumber: number; lineNumber: number; lineText: string }>;
  timings:       Record<string, string>;
  totalMs:       number;
}

@Component({
  selector: 'app-agreement-verification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './agreement-verification.component.html',
  styleUrl: './agreement-verification.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgreementVerificationComponent {

  /** The full verification result from the backend */
  @Input() verification!: AgreementVerificationResult;

  /** Current form data — needed to read Index II values */
  @Input() formData: any = {};

  /** Emits { fieldKey, correctedValue } when user clicks Apply */
  @Output() correctionApplied = new EventEmitter<{ fieldKey: string; correctedValue: string }>();

  readonly fields: VerificationField[] = [
    { key: 'developerorsellar', indexKey: 'developerorsellar', agreeKey: 'agreementSeller',   label: 'Seller / Developer', searchKey: 'seller'   },
    { key: 'ownerName',         indexKey: 'ownerName',         agreeKey: 'agreementOwner',    label: 'Owner / Buyer',      searchKey: 'owner'    },
    { key: 'buildingName',      indexKey: 'buildingName',      agreeKey: 'agreementBuilding', label: 'Building Name',      searchKey: 'building' },
    { key: 'surveyNo',          indexKey: 'surveyNo',          agreeKey: 'agreementSurveyNo', label: 'Survey No',          searchKey: 'surveyNo' },
  ];

  get hasMismatches(): boolean {
    return Object.keys(this.verification?.corrections || {}).length > 0;
  }

  get mismatchCount(): number {
    return Object.keys(this.verification?.corrections || {}).length;
  }

  isCorrected(fieldKey: string): boolean {
    return !!this.verification?.corrections?.[fieldKey];
  }

  getIndexValue(indexKey: string): string {
    return this.formData?.[indexKey] || '';
  }

  getAgreeValue(agreeKey: string): string {
    return this.verification?.agreementData?.[agreeKey as keyof typeof this.verification.agreementData] as string || '';
  }

  getSearchResult(searchKey: string) {
    return this.verification?.searchResults?.[searchKey];
  }

  applyCorrection(fieldKey: string, agreeKey: string): void {
    const correctedValue = this.getAgreeValue(agreeKey);
    if (!correctedValue) return;
    this.correctionApplied.emit({ fieldKey, correctedValue });
  }

  timingEntries(): { label: string; value: string }[] {
    return Object.entries(this.verification?.timings || {})
      .map(([label, value]) => ({ label, value: value as string }));
  }
}