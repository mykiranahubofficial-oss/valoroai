import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RepmanageserviceService } from '../../repmanageservice.service';
import { VisitDetails } from '../../visit-details.model';
import { VisitDataService } from '../service/visit-data.service';
import { FieldSafetyService } from '../service/field-safety.service';

@Component({
  selector: 'app-visit-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './visit-details.component.html',
  styleUrls: ['./visit-details.component.css']
})
export class VisitDetailsComponent implements OnInit, OnChanges {
  @Input() visitMessage: string = '';

  reportId: string = '';
  draftId: string = '';

  visitDetails: any = {
    visitorName: '', ownerName: '', buildingName: '', flatNo: '',
    flatType: '', totalFloor: '', perFloor: '', totalFlat: '',
    wings: '', lift: '', parking: '', occupied: '', landmark: '',
    eastBoundary: '', westBoundary: '', southBoundary: '', northBoundary: ''
  };

  // LOCAL sets — kept in sync via subscription
  mismatchedFields = new Set<string>();
  missingFields    = new Set<string>();

  constructor(
    private route: ActivatedRoute,
    private reportService: RepmanageserviceService,
    private visitDataService: VisitDataService,
    private fieldSafetyService: FieldSafetyService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.reportId = params['reportId'] || '';
      this.draftId  = params['draftId']  || '';
    });

    // Keep local sets in sync with service
    this.fieldSafetyService.mismatchedFields$.subscribe(fields => {
      this.mismatchedFields = fields;
    });
    this.fieldSafetyService.missingFields$.subscribe(fields => {
      this.missingFields = fields;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['visitMessage'] && this.visitMessage) {
      this.parseVisitMessage();
    }
  }

  // ── template helpers ──────────────────────────────────────────────────────

  isMismatched(field: string): boolean {
    return this.mismatchedFields.has(field);
  }

  isMissing(field: string): boolean {
    return this.missingFields.has(field);
  }
onWatchedFieldChange() {
  this.fieldSafetyService.setVisitData(this.visitDetails);
}
  // ── parsing ───────────────────────────────────────────────────────────────

  extractValue(line: string): string {
    const parts = line.split(/[:\-]/);
    if (parts.length < 2) return '';
    return parts.slice(1).join(':').trim().replace(/^BY\s+/i, '').trim();
  }

  parseVisitMessage() {
    this.resetFields();

    const records = this.visitMessage.split(/AARAMBH GROUP/i).filter(r => r.trim().length > 10);
    const targetRecord = records[0] || this.visitMessage;

    const lines = targetRecord.split('\n').map(l => l.trim()).filter(l => l);

    
lines.forEach(line => {
  const lower = line.toLowerCase().trim();

  // ── Extract value — handle BOTH colon and dash-only separators ──────
  // Some lines use "Flat on - 1RK" (dash, no colon)
  // Most lines use "Key :- Value" or "Key- :- Value"
  let value = '';
  const colonIndex = line.indexOf(':');

  if (colonIndex !== -1) {
    // Normal case: split on first colon
    value = line.slice(colonIndex + 1)
                .replace(/^[\s:\-]+/, '')
                .replace(/^BY\s+/i, '')
                .trim();
  } else {
    // Fallback: no colon — try splitting on first dash
    const dashIndex = line.indexOf('-');
    if (dashIndex === -1) return; // nothing useful
    value = line.slice(dashIndex + 1)
                .replace(/^[\s\-]+/, '')
                .replace(/^BY\s+/i, '')
                .trim();
  }

  if (!value) return; // skip empty values

  // ── BOUNDARIES FIRST — checked by line START ─────────────────────────
  if (!lower.includes('landmark')) {
    if      (lower.startsWith('east'))  { this.visitDetails.eastBoundary  = value; return; }
    else if (lower.startsWith('west'))  { this.visitDetails.westBoundary  = value; return; }
    else if (lower.startsWith('south')) { this.visitDetails.southBoundary = value; return; }
    else if (lower.startsWith('north')) { this.visitDetails.northBoundary = value; return; }
  }

  // ── NAMED FIELDS ─────────────────────────────────────────────────────
  if      (/visitor\s*name/i.test(lower))   this.visitDetails.visitorName  = value;
  else if (/owner\s*name/i.test(lower))     this.visitDetails.ownerName    = value;
  else if (/building\s*name/i.test(lower))  this.visitDetails.buildingName = value;
  else if (/^flat\s*no/i.test(lower))       this.visitDetails.flatNo       = value;
  else if (/^flat\s*on|^flat\s*type/i.test(lower)) this.visitDetails.flatType = value;
  else if (/total\s*floor/i.test(lower))    this.visitDetails.totalFloor   = value;
  else if (/per\s*floor/i.test(lower))      this.visitDetails.perFloor     = value;
  else if (/total\s*flat/i.test(lower))     this.visitDetails.totalFlat    = value;
  else if (/^wings/i.test(lower))           this.visitDetails.wings        = value;
  else if (/^lift/i.test(lower))            this.visitDetails.lift         = value;
  else if (/^occupied/i.test(lower))        this.visitDetails.occupied     = value;
  else if (/^parking/i.test(lower))         this.visitDetails.parking      = value;
  else if (/landmark/i.test(lower))         this.visitDetails.landmark     = value;
});

    this.applyLandmarkLogic();

    // ── push visit data to BOTH services ──────────────────────────────────
    this.visitDataService.setVisitData(this.visitDetails);

    // KEY FIX: tell FieldSafetyService about visit side only.
    // Report side was already set by ReportFormComponent when it loaded / extracted.
    this.fieldSafetyService.setVisitData(this.visitDetails);
  }

  private applyLandmarkLogic() {
    const lm = this.visitDetails.landmark.toLowerCase();
    if (lm.includes('open space')) {
      ['north', 'south', 'east', 'west'].forEach(dir => {
        if (lm.includes(dir)) {
          this.visitDetails[`${dir}Boundary`] = 'Open Space';
        }
      });
    }
  }

  resetFields() {
    Object.keys(this.visitDetails).forEach(key => this.visitDetails[key] = '');
  }

  // ── save ──────────────────────────────────────────────────────────────────

  saveVisitDetails() {
    const payload: VisitDetails = {
      reportId:     this.reportId,
      draftId:      this.draftId,
      north:        this.visitDetails.northBoundary,
      south:        this.visitDetails.southBoundary,
      east:         this.visitDetails.eastBoundary,
      west:         this.visitDetails.westBoundary,
      occupied:     this.visitDetails.occupied,
      flatBHK:      this.visitDetails.flatType,
      floors:       this.visitDetails.totalFloor,
      perfloor:     this.visitDetails.perFloor,
      totalflats:   this.visitDetails.totalFlat,
      lifts:        this.visitDetails.lift,
      parking:      this.visitDetails.parking,
      perfloorflat: this.visitDetails.perFloor,
      flatNo:       this.visitDetails.flatNo,
      landmark:     this.visitDetails.landmark
    };

    this.reportService.saveVisitDetails(payload).subscribe({
      next:  ()    => alert('Visit Details Saved Successfully'),
      error: (err) => { console.error(err); alert('Failed to save visit details'); }
    });
  }
}