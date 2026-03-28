//src\app\shared\pipes\amount-in-words.pipe.ts

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'amountInWords',
  standalone: true
})
export class AmountInWordsPipe implements PipeTransform {

  private ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six',
    'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve',
    'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];

  private tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty',
    'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];

  transform(value: number | string): string {

    if (!value) return '';

    const num = Number(value.toString().replace(/,/g, ''));

    if (isNaN(num)) return '';

    if (num === 0) return 'Zero Rupees Only';

    return this.convertToIndianWords(num).trim() + ' Rupees Only';
  }

  private convertBelowThousand(num: number): string {

    let word = '';

    if (num > 99) {
      word += this.ones[Math.floor(num / 100)] + ' Hundred ';
      num = num % 100;
    }

    if (num > 19) {
      word += this.tens[Math.floor(num / 10)] + ' ';
      num = num % 10;
    }

    if (num > 0) {
      word += this.ones[num] + ' ';
    }

    return word;
  }

  private convertToIndianWords(num: number): string {

    let result = '';

    const crore = Math.floor(num / 10000000);
    num %= 10000000;

    const lakh = Math.floor(num / 100000);
    num %= 100000;

    const thousand = Math.floor(num / 1000);
    num %= 1000;

    const hundred = num;

    if (crore) result += this.convertBelowThousand(crore) + 'Crore ';
    if (lakh) result += this.convertBelowThousand(lakh) + 'Lakh ';
    if (thousand) result += this.convertBelowThousand(thousand) + 'Thousand ';
    if (hundred) result += this.convertBelowThousand(hundred);

    return result;
  }
}