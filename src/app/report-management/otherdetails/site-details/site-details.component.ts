import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TextFieldModule } from '@angular/cdk/text-field'; // ✅ important

const SQM_TO_SQFT = 10.7639;

@Component({
  selector: 'app-site-details',
  standalone: true,
  imports: [CommonModule, FormsModule,TextFieldModule  ],
  templateUrl: './site-details.component.html',
  styleUrl: './site-details.component.css'
})
export class SiteDetailsComponent implements OnInit {

  @Input() reportId = '';

  formData: any = {
    extentSite:      '',
    extentValuation: '',
    plinthArea:      '',
    carpetArea:      '',
  };

  get showValuationWarning(): boolean {
    const a = parseFloat(this.formData.extentSiteSqm);
    const b = parseFloat(this.formData.extentValuationSqm);
    return !isNaN(a) && !isNaN(b) && b > a;
  }

  ngOnInit() {}

  private toSqft(sqm: number): string {
    return (sqm * SQM_TO_SQFT).toFixed(2);
  }

  private toSqm(sqft: number): string {
    return (sqft / SQM_TO_SQFT).toFixed(2);
  }

  onSqmChange(field: string) {
    const sqm = parseFloat(this.formData[field + 'Sqm']);
    this.formData[field + 'Sqft'] = isNaN(sqm) ? '' : this.toSqft(sqm);
  }

  onSqftChange(field: string) {
    const sqft = parseFloat(this.formData[field + 'Sqft']);
    this.formData[field + 'Sqm'] = isNaN(sqft) ? '' : this.toSqm(sqft);
  }

  autoGrow(event: Event) {
    const el = event.target as HTMLTextAreaElement;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }
}