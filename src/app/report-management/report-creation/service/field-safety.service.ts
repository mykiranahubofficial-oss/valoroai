import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FieldSafetyService {

  private visitSnapshot:  any = {};
  private reportSnapshot: any = {};

  // RED: both sides filled but differ
  private _mismatched = new BehaviorSubject<Set<string>>(new Set());
  mismatchedFields$ = this._mismatched.asObservable();

  // ORANGE (cross-compare): one side has value, other is blank
  private _missing = new BehaviorSubject<Set<string>>(new Set());
  missingFields$ = this._missing.asObservable();

  // ORANGE (extraction): field expected from OCR but came back empty
  private _emptyAfterExtract = new BehaviorSubject<Set<string>>(new Set());
  emptyAfterExtract$ = this._emptyAfterExtract.asObservable();

  private readonly FIELD_MAP: { visitKey: string; reportKey: string; fieldId: string }[] = [
    { visitKey: 'ownerName',    reportKey: 'ownerName',    fieldId: 'ownerName'    },
    { visitKey: 'buildingName', reportKey: 'buildingName', fieldId: 'buildingName' },
    { visitKey: 'flatNo',       reportKey: 'flatNo',       fieldId: 'flatNo'       },
  ];

  // Every field the OCR is expected to populate — extend as needed
  private readonly EXTRACTED_FIELDS: string[] = [
    'ownerName',
    'buildingName',
    'flatNo',
    'floor',
    'plotNum',
    'surveyNo',
    'village',
    'taluka',
    'district',
    'pincode',
    'indexiiserveno',
    'indexiidate',
    'developerorsellar',
    'agreementvalue',
    'casm',
  ];

  // ── Setters ───────────────────────────────────────────────────────────────

  setVisitData(visitData: any) {
    this.visitSnapshot = visitData || {};
    this._runComparison();
  }

  setReportData(reportData: any) {
    this.reportSnapshot = reportData || {};
    this._runComparison();
  }

  /** Call once after extractData() resolves with the populated formData */
  markEmptyAfterExtraction(formData: any) {
    const empty = new Set<string>();
    this.EXTRACTED_FIELDS.forEach(field => {
      const val = (formData?.[field] ?? '').toString().trim();
      if (!val) empty.add(field);
    });
    this._emptyAfterExtract.next(empty);
  }

  /** Call from (ngModelChange) of any extracted field so orange clears on user input */
  clearEmptyField(fieldId: string) {
    const current = new Set(this._emptyAfterExtract.getValue());
    if (current.has(fieldId)) {
      current.delete(fieldId);
      this._emptyAfterExtract.next(current);
    }
  }

  // Backwards compat
  compare(visitData: any, reportData: any) {
    if (visitData  && Object.keys(visitData).length)  this.visitSnapshot  = visitData;
    if (reportData && Object.keys(reportData).length) this.reportSnapshot = reportData;
    this._runComparison();
  }

  // ── Query helpers ─────────────────────────────────────────────────────────

  isMismatched(fieldId: string): boolean {
    return this._mismatched.getValue().has(fieldId);
  }

  isMissing(fieldId: string): boolean {
    return this._missing.getValue().has(fieldId);
  }

  isEmptyAfterExtract(fieldId: string): boolean {
    return this._emptyAfterExtract.getValue().has(fieldId);
  }

  // ── Internal ──────────────────────────────────────────────────────────────

  private _runComparison() {
    const mismatches = new Set<string>();
    const missing    = new Set<string>();

    this.FIELD_MAP.forEach(({ visitKey, reportKey, fieldId }) => {
      const v = (this.visitSnapshot?.[visitKey]  || '').toString().trim().toLowerCase();
      const r = (this.reportSnapshot?.[reportKey] || '').toString().trim().toLowerCase();
      const visitHas  = v.length > 0;
      const reportHas = r.length > 0;

      if (visitHas && reportHas) {
        if (v !== r) mismatches.add(fieldId);
      } else if (visitHas !== reportHas) {
        missing.add(fieldId);
      }
    });

    this._mismatched.next(mismatches);
    this._missing.next(missing);
  }
}