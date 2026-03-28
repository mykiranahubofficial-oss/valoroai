import {
  Component, Input, Output, EventEmitter,
  OnChanges, SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { switchMap } from 'rxjs/operators';
import { RegistrationService } from '../services/registration.service';

@Component({
  selector: 'app-table-builder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './table-builder.component.html',
  styleUrl: './table-builder.component.css'
})
export class TableBuilderComponent implements OnChanges {

  @Input() visible = false;
  @Input() userId  = '';
  @Input() draftId = '';

  @Output() closed = new EventEmitter<void>();

  tableName  = 'Table 1';
  draftName  = 'Draft 1';       // ✅ separate draftName field

  rowCount    = 3;
  columnCount = 3;

  headerRow: string[]   = [];
  bodyRows:  string[][] = [];

  tableGenerated = false;
  tableSaved     = false;
  isSaving       = false;
  saveError      = '';

  // Sr.No.(1) + RowHeader(1) + user columns
  get totalCols(): number {
    return this.columnCount + 2;
  }

  constructor(private registrationService: RegistrationService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue === true) {
      this.reset();
    }
  }

  private reset(): void {
    this.tableName      = 'Table 1';
    this.draftName      = 'Draft 1';
    this.rowCount       = 3;
    this.columnCount    = 3;
    this.headerRow      = [];
    this.bodyRows       = [];
    this.tableGenerated = false;
    this.tableSaved     = false;
    this.isSaving       = false;
    this.saveError      = '';
  }

generateTable(): void {
  if (this.rowCount < 1 || this.columnCount < 1) return;

  const prevHeader = this.headerRow.slice();
  const prevBody   = this.bodyRows.map(r => r.slice());

  // Header row — only col 0 (Sr.No.) and col 1 (Row Header label) + column titles
  this.headerRow = Array.from({ length: this.totalCols }, (_, c) => {
    if (c === 0) return 'Sr. No.';
    return prevHeader[c] ?? '';
  });

  // Body rows — only col 0 (auto Sr.No.) and col 1 (row label) editable
  // col 2+ are intentionally empty — client fills later
  this.bodyRows = Array.from({ length: this.rowCount }, (_, r) =>
    Array.from({ length: this.totalCols }, (_, c) => {
      if (c === 0) return String(r + 1);  // Sr. No. auto
      if (c === 1) return prevBody[r]?.[1] ?? '';  // row label — editable
      return '';  // ✅ col 2+ always empty on creation
    })
  );

  this.tableGenerated = true;
  this.saveError      = '';
}

  get colRange(): number[] {
    return Array.from({ length: this.totalCols }, (_, i) => i);
  }

  get filledColumnCount(): number {
    return this.headerRow.slice(2).filter(h => !!h).length;
  }

  get filledRowCount(): number {
    return this.bodyRows.filter(row => !!row[1]).length;
  }

  get canSave(): boolean {
    return (
      this.tableGenerated &&
      !!this.userId &&
      !!this.draftId &&
      !this.isSaving
    );
  }

  saveTable(): void {
    if (!this.canSave) {
      if (!this.userId || !this.draftId) {
        this.saveError = 'Missing userId or draftId.';
      }
      return;
    }

    this.isSaving  = true;
    this.saveError = '';

    // ✅ Step 1 — Save/ensure draft exists
    const draftPayload = {
  userId:    this.userId,   // ← needs this.
      draftId:   this.draftId,
      draftName: this.draftName   // ✅ use draftName, not tableName
    };

    // ✅ Step 2 — Save table structure
    // Backend controller accepts headerRow + bodyRows
    // and converts them to flat cells internally
    const tablePayload = {
      userId:    this.userId,
      draftId:   this.draftId,
      tableName: this.tableName,
      headerRow: this.headerRow,
      bodyRows:  this.bodyRows    // 2D — controller flattens this
    };

    console.log('📝 Step 1 — Draft payload:',  draftPayload);
    console.log('📊 Step 2 — Table payload:', tablePayload);

    this.registrationService.updateAgencyConfig(draftPayload).pipe(
      switchMap(() => this.registrationService.updateAgencyConfig(tablePayload))
    ).subscribe({
      next: (res) => {
        console.log('✅ Table structure saved:', res);
        this.isSaving   = false;
        this.tableSaved = true;
        setTimeout(() => (this.tableSaved = false), 2500);
      },
      error: (err) => {
        console.error('❌ Save failed:', err);
        this.isSaving  = false;
        this.saveError = err?.error?.message || 'Save failed. Check console.';
      }
    });
  }

  close(): void {
    this.closed.emit();
  }

  trackByIndex(index: number): number {
    return index;
  }
}