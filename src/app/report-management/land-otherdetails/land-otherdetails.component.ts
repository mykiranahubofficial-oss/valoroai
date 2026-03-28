import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface LandValuationData {
  // Circle rate
  circleRate:     number;
  landArea:       number;
  circlePartB:    number;
  circlePartC:    number;
  circleTotalValue: number;

  // Market rate – Part A
  plotArea:       number;
  mktRateLow:     number;
  mktRateHigh:    number;
  adoptedRate:    number;
  adoptedReason:  string;
  partAValue:     number;

  // Market rate – Part B rows
  partBRows: PartBRow[];
  partBTotal: number;

  // Market rate – Part C rows
  partCRows: PartCRow[];
  partCTotal: number;

  marketTotalValue: number;

  // Final valuation
  fairMarketValue:  number;
  circleRateValue:  number;
  realizableValue:  number;
  distressValue:    number;
  insurableValue:   number;
  rentalValue:      number;
}

export interface PartBRow {
  particulars:      string;
  plinthArea:       number;
  replacementRate:  number;
  replacementValue: number;
  depreciation:     number;
  netValue:         number;
}

export interface PartCRow {
  particulars:      string;
  quantity:         number;
  replacementRate:  number;
  replacementCost:  number;
  depreciation:     number;
  netValue:         number;
}

@Component({
  selector: 'app-land-otherdetails',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './land-otherdetails.component.html',
  styleUrl:    './land-otherdetails.component.css'
})
export class LandOtherdetailsComponent {

  @Output() valuationSaved = new EventEmitter<LandValuationData>();

  // ── Circle Rate ──
  circleRate  = 0;
  landArea    = 0;
  circlePartB = 0;
  circlePartC = 0;

  // ── Market Rate – Part A ──
  plotArea      = 0;
  mktRateLow    = 0;
  mktRateHigh   = 0;
  adoptedRate   = 0;
  adoptedReason = '';

  // ── Part B rows ──
  partBRows: PartBRow[] = Array.from({ length: 3 }, () => ({
    particulars: '', plinthArea: 0, replacementRate: 0,
    replacementValue: 0, depreciation: 0, netValue: 0
  }));

  // ── Part C rows ──
  partCRows: PartCRow[] = Array.from({ length: 3 }, () => ({
    particulars: '', quantity: 1, replacementRate: 0,
    replacementCost: 0, depreciation: 0, netValue: 0
  }));

  // ── Final overrides ──
  realizableValue = 0;
  distressValue   = 0;
  insurableValue  = 0;
  rentalValue     = 0;

  // ── Computed getters ──
  get circleLandValue(): number {
    return Math.round(this.landArea * this.circleRate);
  }

  get circleTotalValue(): number {
    return this.circleLandValue + this.circlePartB + this.circlePartC;
  }

  get partAValue(): number {
    return this.plotArea * this.adoptedRate;
  }

  get partBTotal(): number {
    return this.partBRows.reduce((s, r) => s + (r.netValue || 0), 0);
  }

  get partCTotal(): number {
    return this.partCRows.reduce((s, r) => s + (r.netValue || 0), 0);
  }

  get marketTotalValue(): number {
    return this.partAValue + this.partBTotal + this.partCTotal;
  }

  // ── Helpers ──
  fmt(n: number): string {
    if (!n && n !== 0) return '—';
    return Math.round(n).toLocaleString('en-IN');
  }

  addPartBRow(): void {
    this.partBRows.push({
      particulars: '', plinthArea: 0, replacementRate: 0,
      replacementValue: 0, depreciation: 0, netValue: 0
    });
  }

  addPartCRow(): void {
    this.partCRows.push({
      particulars: '', quantity: 1, replacementRate: 0,
      replacementCost: 0, depreciation: 0, netValue: 0
    });
  }

  // ── Autofill (dev/test helper) ──
  autofill(): void {
    // Circle Rate
    this.circleRate  = 5500;
    this.landArea    = 250;
    this.circlePartB = 800000;
    this.circlePartC = 50000;

    // Market Rate – Part A
    this.plotArea      = 250;
    this.mktRateLow    = 6000;
    this.mktRateHigh   = 7000;
    this.adoptedRate   = 6500;
    this.adoptedReason = 'Adopted due to average of prevailing market rates in the locality';

    // Part B rows
    this.partBRows = [
      {
        particulars:      'RCC Framed Structure',
        plinthArea:       120,
        replacementRate:  18000,
        replacementValue: 2160000,
        depreciation:     216000,
        netValue:         1944000
      },
      {
        particulars:      'Ground Floor Extension',
        plinthArea:       60,
        replacementRate:  15000,
        replacementValue: 900000,
        depreciation:     90000,
        netValue:         810000
      },
      {
        particulars:      'Boundary Wall',
        plinthArea:       30,
        replacementRate:  8000,
        replacementValue: 240000,
        depreciation:     24000,
        netValue:         216000
      }
    ];

    // Part C rows
    this.partCRows = [
      {
        particulars:      'Water Tank (Overhead)',
        quantity:         1,
        replacementRate:  25000,
        replacementCost:  25000,
        depreciation:     2500,
        netValue:         22500
      },
      {
        particulars:      'Bore Well',
        quantity:         1,
        replacementRate:  80000,
        replacementCost:  80000,
        depreciation:     8000,
        netValue:         72000
      },
      {
        particulars:      'Compound Gate (Steel)',
        quantity:         1,
        replacementRate:  35000,
        replacementCost:  35000,
        depreciation:     3500,
        netValue:         31500
      }
    ];

    // Final values
    this.realizableValue = 4200000;
    this.distressValue   = 3500000;
    this.insurableValue  = 2970000;
    this.rentalValue     = 18000;

    console.log('🧪 [Autofill] Test data loaded into land valuation form');
  }

  // ── Save ──
  saveValuation(): void {
    const data: LandValuationData = {
      circleRate:       this.circleRate,
      landArea:         this.landArea,
      circlePartB:      this.circlePartB,
      circlePartC:      this.circlePartC,
      circleTotalValue: this.circleTotalValue,

      plotArea:         this.plotArea,
      mktRateLow:       this.mktRateLow,
      mktRateHigh:      this.mktRateHigh,
      adoptedRate:      this.adoptedRate,
      adoptedReason:    this.adoptedReason,
      partAValue:       this.partAValue,

      partBRows:        this.partBRows,
      partBTotal:       this.partBTotal,

      partCRows:        this.partCRows,
      partCTotal:       this.partCTotal,

      marketTotalValue: this.marketTotalValue,
      fairMarketValue:  this.marketTotalValue,
      circleRateValue:  this.circleTotalValue,
      realizableValue:  this.realizableValue,
      distressValue:    this.distressValue,
      insurableValue:   this.insurableValue,
      rentalValue:      this.rentalValue
    };

    console.group('📤 [LandOtherdetails] saveValuation()');

    console.group('🔵 Circle Rate Section');
    console.log('Circle Rate (Rs./Sq.mt):', data.circleRate);
    console.log('Land Area (Sq.mt):', data.landArea);
    console.log('Part B - Building Value (Rs.):', data.circlePartB);
    console.log('Part C - Other Amenities (Rs.):', data.circlePartC);
    console.log('✅ Circle Total Value (Rs.):', data.circleTotalValue);
    console.groupEnd();

    console.group('🟢 Market Rate Section');
    console.group('Part A — Land');
    console.log('Plot Area (Sq.mt):', data.plotArea);
    console.log('Adopted Rate (Rs./Sq.mt):', data.adoptedRate);
    console.log('Adopted Reason:', data.adoptedReason);
    console.log('Part A Value (Rs.):', data.partAValue);
    console.groupEnd();

    console.group('Part B — Building Rows');
    console.table(data.partBRows);
    console.log('Part B Total (Rs.):', data.partBTotal);
    console.groupEnd();

    console.group('Part C — Other Amenities Rows');
    console.table(data.partCRows);
    console.log('Part C Total (Rs.):', data.partCTotal);
    console.groupEnd();

    console.log('✅ Market Total Value (Rs.):', data.marketTotalValue);
    console.groupEnd();

    console.group('🟣 Final Valuation Summary');
    console.log('Fair Market Value (Rs.):', data.fairMarketValue);
    console.log('Circle Rate Value (Rs.):', data.circleRateValue);
    console.log('Realizable Value (Rs.):', data.realizableValue);
    console.log('Distress Sale Value (Rs.):', data.distressValue);
    console.log('Insurable Value (Rs.):', data.insurableValue);
    console.log('Rental Value (Rs./mo):', data.rentalValue);
    console.groupEnd();

    console.groupEnd();

    this.valuationSaved.emit(data);
  }
}