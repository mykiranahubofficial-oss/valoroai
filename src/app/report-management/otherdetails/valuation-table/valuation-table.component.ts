import { 
  Component, Input, Output, EventEmitter, 
  OnInit, OnChanges, AfterViewInit,
  SimpleChanges, ChangeDetectorRef 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AmountInWordsPipe } from '../../../shared/pipes/amount-in-words.pipe';

export interface ValuationRow {
  srNo:        number;
  description: string;        // from rowHeaders[i].title
  cells:       string[];      // dynamic data cells (col 2, 3, 4...)
  isFixed:     boolean;
}

export interface ValuationTablePayload {
  reportId:      string;
  valuationRows: ValuationRow[];
  totalValue:    string;
  sayValue:      string;
  amountInWords: string;
}

@Component({
  selector: 'app-valuation-table',
  standalone: true,
  imports: [CommonModule, FormsModule, AmountInWordsPipe],
  templateUrl: './valuation-table.component.html',
  styleUrl:    './valuation-table.component.css'
})
export class ValuationTableComponent implements OnInit, OnChanges, AfterViewInit {

  @Input() reportId  = '';
  @Input() tableData: any;
  @Output() dataChange = new EventEmitter<ValuationTablePayload>();

  columnHeaders: string[]     = [];   // Sr.No. + rowHeader label + data cols + Estimated Value
  dataCols:      string[]     = [];   // only the middle editable cols (from backend columnHeaders)
  rows:          ValuationRow[] = [];
  totalValue    = '';
  sayValue      = '';
  sayNumber     = 0;
  amountInWords = '';

  private viewReady   = false;
  private pendingData: any = null;

  constructor(private cdr: ChangeDetectorRef) {}

  /* ══════════════════════════════════════
     LIFECYCLE
  ══════════════════════════════════════ */
  ngOnInit() {
    if (!this.tableData) this.initEmptyRows();
  }

  ngAfterViewInit() {
    this.viewReady = true;
    if (this.pendingData) {
      this.loadFromBackend(this.pendingData);
      this.pendingData = null;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['tableData']) {
      const curr = changes['tableData'].currentValue;
      if (!curr) return;
      if (this.viewReady) this.loadFromBackend(curr);
      else                this.pendingData = curr;
    }
  }

  /* ══════════════════════════════════════
     LOAD FROM BACKEND
  ══════════════════════════════════════ */
  private loadFromBackend(data: any): void {
    console.log('[ValuationTable] loadFromBackend:', data);
    if (!data) return;

    /* ── Shape A: legacy valuationRows[] ── */
    if (Array.isArray(data.valuationRows) && data.valuationRows.length > 0) {
      console.log('[ValuationTable] Shape A — valuationRows[]');

      this.dataCols     = ['Qty', 'Rate per unit'];
      this.columnHeaders = ['Sr. No.', 'Description', ...this.dataCols, 'Estimated Value (Rs.)'];

      this.rows = data.valuationRows.map((row: any, i: number) => ({
        srNo:        row.srNo ?? i + 1,
        description: row.description ?? '',
        cells:       [row.qty || '', row.ratePerUnit || ''],
        isFixed:     true
      }));

      if (data.totalValue) this.totalValue = data.totalValue;
      if (data.sayValue)   this.sayValue   = data.sayValue;

      this.cdr.detectChanges();
      this.onAnyChange();
      return;
    }

    /* ── Shape B: new format ──
       columnHeaders: [{title:"aa"}, {title:"BB"}, {title:"CC"}]
       rowHeaders:    [{title:"bb"}, {title:"cc"}]
       cells:         [] or [{rowIndex, colIndex, value}]
    ── */
    if (Array.isArray(data.columnHeaders) || Array.isArray(data.rowHeaders)) {
      console.log('[ValuationTable] Shape B — columnHeaders + rowHeaders');

      // Middle editable columns (all backend columnHeaders except last one)
      // Last backend column becomes "Estimated Value"
      const backendCols: string[] = (data.columnHeaders ?? []).map((h: any) => h.title || '');

      // All cols except last = editable, last = estimated value
      this.dataCols      = backendCols.slice(0, -1);                   // aa, BB
      const estColTitle  = backendCols[backendCols.length - 1] || 'Estimated Value (Rs.)'; // CC

      this.columnHeaders = [
        'Sr. No.',
        'Description',
        ...this.dataCols,
        estColTitle        // ✅ last col = estimated value
      ];

      console.log('[ValuationTable] columnHeaders:', this.columnHeaders);
      console.log('[ValuationTable] dataCols:', this.dataCols);

      const rowHeaders: any[]  = data.rowHeaders ?? [];
      const savedCells: any[]  = data.cells      ?? [];

      if (rowHeaders.length > 0) {

        this.rows = rowHeaders.map((rh: any, i: number) => {
  const getCell = (colIndex: number): string =>
    savedCells.find(
      (c: any) => c.rowIndex === i && c.colIndex === colIndex
    )?.value || '';

  // ✅ Always create cells array matching dataCols length exactly
  const cells = this.dataCols.map((_, ci) => getCell(ci + 2));

  return {
    srNo:        i + 1,
    description: rh.title ?? '',
    cells,                          // ✅ length = dataCols.length always
    isFixed:     true
  };
});

      } else {
        this.initEmptyRows();
      }

      console.log('[ValuationTable] ✅ Rows:', this.rows);
      this.cdr.detectChanges();
      this.onAnyChange();
      return;
    }

    console.error('[ValuationTable] ❌ Unknown shape:', Object.keys(data));
  }

  /* ══════════════════════════════════════
     INIT EMPTY ROWS
  ══════════════════════════════════════ */
  private initEmptyRows(): void {
  this.dataCols      = ['Qty', 'Rate per unit'];
  this.columnHeaders = ['Sr. No.', 'Description', ...this.dataCols, 'Estimated Value (Rs.)'];
  this.rows = Array.from({ length: 7 }, (_, i) => ({
    srNo:        i + 1,
    description: '',
    cells:       new Array(this.dataCols.length).fill(''),  // ✅ correct length
    isFixed:     true
  }));
}

  /* ══════════════════════════════════════
     ESTIMATED VALUE — last cell of each row
     = product of all editable numeric cells
  ══════════════════════════════════════ */
/* ══════════════════════════════════════
   ESTIMATED VALUE
   qty = cells[0], rate = cells[1]
   est = qty × rate (standard formula)
   If only 1 data col — use it directly
══════════════════════════════════════ */
getEstimatedValue(row: ValuationRow): string {
  if (!row.cells || row.cells.length === 0) return '';

  if (row.cells.length === 1) {
    // Only 1 editable col — estimated = that value directly
    const val = parseFloat((row.cells[0] || '').replace(/,/g, ''));
    return isNaN(val) ? '' : val.toLocaleString('en-IN');
  }

  // 2+ editable cols — multiply first two (qty × rate)
  const qty  = parseFloat((row.cells[0] || '').replace(/,/g, ''));
  const rate = parseFloat((row.cells[1] || '').replace(/,/g, ''));

  if (isNaN(qty) || isNaN(rate)) return '';

  return (qty * rate).toLocaleString('en-IN');
}

/* ══════════════════════════════════════
   CALCULATIONS
══════════════════════════════════════ */
get computedTotal(): number {
  return this.rows.reduce((sum, row) => {
    const est = parseFloat(
      (this.getEstimatedValue(row) || '').replace(/,/g, '')
    );
    return sum + (isNaN(est) ? 0 : est);
  }, 0);
}

onAnyChange() {
  // ✅ Force Angular to re-evaluate getEstimatedValue() per row
  // by creating a new rows array reference
  this.rows = this.rows.map(row => ({ ...row }));

  const total     = this.computedTotal;
  this.totalValue = total > 0 ? this.formatIndianCurrency(total) : '';

  const rounded   = Math.round(total / 1000) * 1000;
  this.sayNumber  = rounded;
  this.sayValue   = rounded > 0 ? this.formatIndianCurrency(rounded) : '';

  this.cdr.detectChanges();
}

  formatIndianCurrency(value: number): string {
    return 'Rs. ' + value.toLocaleString('en-IN') + '/-';
  }

  autoGrow(event: Event) {
    const el = event.target as HTMLTextAreaElement;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }

  trackByIndex(index: number, row: ValuationRow): number { return row.srNo; }
  trackByColIndex(index: number): number { return index; }

  /* ══════════════════════════════════════
     PAYLOAD
  ══════════════════════════════════════ */
  private buildPayload(): ValuationTablePayload {
    return {
      reportId:      this.reportId,
      valuationRows: this.rows.map(r => ({ ...r })),
      totalValue:    this.totalValue,
      sayValue:      this.sayValue,
      amountInWords: this.amountInWords
    };
  }

  getPayload(): ValuationTablePayload { return this.buildPayload(); }

  saveTable() {
    const payload = this.buildPayload();
    console.log('[ValuationTable] saveTable:', payload);
    this.dataChange.emit(payload);
  }
}