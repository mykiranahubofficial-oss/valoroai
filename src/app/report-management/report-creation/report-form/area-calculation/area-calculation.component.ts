import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface AreaRow {
  type: string;
  sqm: string;       // ← was: number | null
  sqft: string;      // ← was: number | null
  builtSqm: string;
  builtSqft: string;
}

export interface SearchListing {
  buildingName: string;
  bhk?: string;
  distance?: string;
  areaType?: string;
  area?: number;
  pricePerSqft?: number;
  price?: number;
  website?: string;
  url?: string;
}

export interface SearchForm {
  buildingName: string;
  address: string;
  areaSqft: string;  // ← was: number | null
  areaType: string;
  bhk: string;
  agreementvalue?: string | null;
}

export interface AreaCalculationState {
  areas: AreaRow[];
  balconies: AreaRow[];
  terraces: AreaRow[];
  loading: number;
  totalSqm: string;
  totalSqft: string;
  totalBuiltSqm: string;
  totalBuiltSqft: string;
}

@Component({
  selector: 'app-area-calculation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './area-calculation.component.html',
  styleUrl: './area-calculation.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AreaCalculationComponent implements OnInit {

  // ── Inputs from parent ──────────────────────────────────────
  @Input() areas: AreaRow[] = [];
  @Input() balconies: AreaRow[] = [];
  @Input() terraces: AreaRow[] = [];
  @Input() loading: number = 0;
  @Input() totalSqm: string = '0';
  @Input() totalSqft: string = '0';
  @Input() totalBuiltSqm: string = '0';
  @Input() totalBuiltSqft: string = '0';

  // Search-related inputs
// area-calculation.component.ts

@Input() searchForm: SearchForm = {
  buildingName: '', address: '', areaSqft: '',  // ← null → ''
  areaType: 'carpet', bhk: ''
};
  @Input() searchListings: SearchListing[] = [];
  @Input() isSearching: boolean = false;
  @Input() searchError: string = '';

  // ── Outputs back to parent ──────────────────────────────────
  @Output() stateChange = new EventEmitter<AreaCalculationState>();
  @Output() searchFormChange = new EventEmitter<SearchForm>();
  @Output() searchRequested = new EventEmitter<void>();
  @Output() searchCleared = new EventEmitter<void>();
  @Output() autoFillRequested = new EventEmitter<void>();
  @Output() balconyAdded = new EventEmitter<void>();
  @Output() terraceAdded = new EventEmitter<void>();

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {}

  // ── Area calculation logic (mirrors parent exactly) ─────────

private SQM_TO_SQFT = 10.7639;
private calculateBuilt(row: AreaRow): void {
  const sqm = parseFloat(row.sqm);
  if (!sqm) { row.builtSqm = ''; row.builtSqft = ''; return; }
  const load = Number(this.loading) || 0;
  const built = sqm * (1 + load / 100);
  row.builtSqm  = built.toFixed(2);
  row.builtSqft = (built * this.SQM_TO_SQFT).toFixed(2);
}
updateSqm(row: AreaRow): void {
  const v = parseFloat(row.sqm);
  if (!v) { row.sqft = ''; row.builtSqm = ''; row.builtSqft = ''; }
  else { row.sqft = (v * this.SQM_TO_SQFT).toFixed(2); }
  this.calculateAllBuilt();
}

updateSqft(row: AreaRow): void {
  const v = parseFloat(row.sqft);
  if (!v) { row.sqm = ''; row.builtSqm = ''; row.builtSqft = ''; }
  else { row.sqm = (v / this.SQM_TO_SQFT).toFixed(2); }
  this.calculateAllBuilt();
}

calculateAllBuilt(): void {
  [...this.areas, ...this.balconies, ...this.terraces].forEach(row => {
    this.calculateBuilt(row);
  });

  const allRows = [...this.areas, ...this.balconies, ...this.terraces];
  const sum = (key: keyof AreaRow) =>
    allRows.reduce((a, r) => a + (Number(r[key]) || 0), 0);

  this.totalSqm      = sum('sqm').toFixed(2);
  this.totalSqft     = sum('sqft').toFixed(2);
  this.totalBuiltSqm = sum('builtSqm').toFixed(2);
  this.totalBuiltSqft= sum('builtSqft').toFixed(2);

  this.emitState();
  this.cdr.markForCheck();
}

  private emitState(): void {
    this.stateChange.emit({
      areas:          this.areas,
      balconies:      this.balconies,
      terraces:       this.terraces,
      loading:        this.loading,
      totalSqm:       this.totalSqm,
      totalSqft:      this.totalSqft,
      totalBuiltSqm:  this.totalBuiltSqm,
      totalBuiltSqft: this.totalBuiltSqft,
    });
  }

  // ── Loading change ──────────────────────────────────────────
onLoadingChange(): void {
  this.calculateAllBuilt();
}

onAddBalcony(): void { this.balconyAdded.emit(); }
onAddTerrace(): void { this.terraceAdded.emit(); }
  // ── Search ──────────────────────────────────────────────────
onSearchFormChange(): void {
  this.searchFormChange.emit({ ...this.searchForm });
}
onSearch(): void    { this.searchRequested.emit(); }
onClearSearch(): void { this.searchCleared.emit(); }
onAutoFill(): void  { this.autoFillRequested.emit(); }

// Inside area-calculation.component.ts

getSearchUrl(item: SearchListing): string {
  const name = encodeURIComponent(item.buildingName || '');
  
  // The address is already "Village..., Taluka..., District..." from the parent
  const rawAddress = this.searchForm.address || '';
  
  // Just strip the technical prefixes for the actual URL search query to make it cleaner for Google/99Acres
  const cleanForUrl = rawAddress
    .replace(/Village-|Taluka-|District-/gi, '')
    .replace(/,/g, ' ')
    .trim();

  const address = encodeURIComponent(cleanForUrl);
  const site = (item.website || '').toLowerCase();
  
  switch (site) {
    case 'magicbricks':
      return `https://www.magicbricks.com/property-for-sale/residential-real-estate?keyword=${name}%20${address}`;
    case '99acres':
      return `https://www.99acres.com/search/property/buy/residential?keyword=${name}%20${address}`;
    case 'housing':
      return `https://housing.com/in/buy/search?query=${name}%20${address}`;
    default:
      return `https://www.google.com/search?q=${name}+${address}+property`;
  }
}
}