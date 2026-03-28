import { Component, Input,OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AmountInWordsPipe } from '../../../shared/pipes/amount-in-words.pipe';

@Component({
  selector: 'app-final-valuation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule ],
  providers: [AmountInWordsPipe],
  templateUrl: './final-valuation.component.html',
  styleUrls: ['./final-valuation.component.css']
})
export class FinalValuationComponent {

  @Input() formData: any;

  realizablePercent = 8;
  distressPercent = 20;
  rentalPercent = 3;

  /* manual override flags */

  manualOverride: Record<'realizableValue' | 'distressValue' | 'rentalValue', boolean> = {
  realizableValue: false,
  distressValue: false,
  rentalValue: false
};

  constructor(private wordsPipe: AmountInWordsPipe) {}
  ngOnChanges(changes: SimpleChanges) {
    if (changes['formData'] && this.formData?.fairMarketValue) {
      const raw = this.getRawNumber(this.formData.fairMarketValue);
      if (raw > 0) {
        this.formData.fairMarketValueCharacter = this.wordsPipe.transform(raw);
        this.calculateValuations();
      }
    }
  }

  formatIndianCurrency(value: any) {

    if (!value) return '';

    const raw = value.toString().replace(/,/g, '');

    if (isNaN(raw)) return value;

    return Number(raw).toLocaleString('en-IN');
  }

  onCurrencyInput(event: any, field: string) {

let raw = event.target.value
  .replace(/,/g, '')
  .replace('/-', '')
  .trim();
    if (!raw) {
      this.formData[field] = '';
      return;
    }

    const formatted = Number(raw).toLocaleString('en-IN');

    this.formData[field] = formatted;

    /* store words for FMV */

    if (field === 'fairMarketValue') {
      const words = this.wordsPipe.transform(Number(raw));
      this.formData.fairMarketValueCharacter = words;
    }

    this.calculateValuations();
  }

 getRawNumber(value: any) {

  if (!value) return 0;

  const cleaned = String(value)
    .replace(/,/g, '')
    .replace('/-', '')
    .trim();

  const num = Number(cleaned);

  return isNaN(num) ? 0 : num;
}

  /* enable manual edit */

enableManualEdit(field: 'realizableValue' | 'distressValue' | 'rentalValue') {
  this.manualOverride[field] = true;
}

  calculateValuations() {

    const fmv = this.getRawNumber(this.formData.fairMarketValue);

    if (!fmv) return;

    /* Realizable */

    if (!this.manualOverride.realizableValue) {

      const realizable = fmv - (fmv * this.realizablePercent / 100);

      this.formData.realizableValue =
        this.formatIndianCurrency(realizable);

      this.formData.realizableValueCharacter =
        this.wordsPipe.transform(realizable);
    }

    /* Distress */

    if (!this.manualOverride.distressValue) {

      const distress = fmv - (fmv * this.distressPercent / 100);

      this.formData.distressValue =
        this.formatIndianCurrency(Math.round(distress));
    }

    /* Rental */

    if (!this.manualOverride.rentalValue) {

      const rental = (fmv * this.rentalPercent / 100) / 12;

      this.formData.rentalValue =
        this.formatIndianCurrency(Math.round(rental));
    }
  }

  addSlash(field: string) {

    if (!this.formData[field]) return;

    if (!this.formData[field].includes('/-')) {
      this.formData[field] = this.formData[field] + ' /-';
    }
  }

  removeSlash(field: string) {

    if (!this.formData[field]) return;

    this.formData[field] =
      this.formData[field].replace(' /-','');
  }

}