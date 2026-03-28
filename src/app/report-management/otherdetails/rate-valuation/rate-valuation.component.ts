// C:\Users\Prashant\Desktop\valorademo\src\app\report-management\otherdetails\rate-valuation\rate-valuation.component.ts

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-rate-valuation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rate-valuation.component.html',
  styleUrls: ['./rate-valuation.component.css']
})
export class RateValuationComponent {

  @Input() formData: any;

  calculateCompositeRate() {

    const building = Number(this.formData.buildingServiceRate);
    const land = Number(this.formData.landOtherRate);

    if (!building || !land) {
      this.formData.compositeRate = '';
      return;
    }

    const total = building + land;

    this.formData.compositeRate = total.toFixed(2);
  }


  calculateGuidelineValue() {

    const area = Number(this.formData.builtUpArea);
    const rate = Number(this.formData.depreciatedGuidelineRate);

    if (!area || !rate) {
      this.formData.guidelineCalculatedValue = '';
      return;
    }

    const value = area * rate;

    this.formData.guidelineCalculatedValue = value.toFixed(2);
  }


  calculateDepreciation() {

    const age = Number(this.formData.buildingAge);
    const life = Number(this.formData.buildingLife);

    if (!age || !life) {
      this.formData.depreciationPercent = '';
      return;
    }

    const depreciation = (age / life) * 100;

    this.formData.depreciationPercent = depreciation.toFixed(2);
  }

}