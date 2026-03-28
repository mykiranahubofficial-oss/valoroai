// C:\Users\Prashant\Desktop\valorademo\src\app\report-management\report-selection\report-selection.component.ts

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RepmanageserviceService } from '../repmanageservice.service';
import { SlotsByPagePipe } from '../../shared/pipes/page.pipe';   // ✅ imported

interface PhotoSlot {
  slotId:     string;
  pageNumber: number;
  photoName:  string;
  isRequired: boolean;
}

interface Table {
  tableId:       string;
  tableName:     string;
  columnHeaders: { title: string; variable: string }[];
  rowHeaders:    { title: string; variable: string }[];
}

interface Draft {
  draftId:    string;
  draftName:  string;
  tables:     Table[];
  photoSlots: PhotoSlot[];
}

@Component({
  selector: 'app-report-selection',
  standalone: true,
  imports: [
    CommonModule,
    SlotsByPagePipe    // ✅ registered
  ],
  templateUrl: './report-selection.component.html',
  styleUrl:    './report-selection.component.css'
})
export class ReportSelectionComponent implements OnInit {

  agencyName  = '';
  agencyToken = '';
  userId      = '';

  drafts:          Draft[] = [];
  selectedDraftId: string  = '';
  loading          = false;
  proceeding       = false;

  constructor(
    private router:        Router,
    private reportService: RepmanageserviceService
  ) {}

  ngOnInit(): void {
    this.agencyName  = localStorage.getItem('agencyName')  || '';
    this.agencyToken = localStorage.getItem('agencyToken') || '';
  // ✅ Add this
  console.log('🔍 localStorage values:', {
    agencyName:  this.agencyName,
    agencyToken: this.agencyToken,
    userId:      this.userId       // ← check if this is empty
  });
    if (!this.agencyToken) {
      alert('Session expired. Please login again.');
      this.router.navigate(['/']);
      return;
    }

    this.loadDrafts();
  }

  /* ── Load all drafts with tables + photo slots ── */
  loadDrafts(): void {
    this.loading = true;

    this.reportService.getDraftsWithSlots(this.userId, this.agencyToken).subscribe({
      next: (res: any) => {
        this.drafts  = res.data?.drafts ?? res.drafts ?? [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        alert('Failed to load drafts. Please try again.');
      }
    });
  }

  /* ── Select a draft card ── */
  selectDraft(draftId: string): void {
    this.selectedDraftId = draftId;
  }

  get selectedDraft(): Draft | null {
    return this.drafts.find(d => d.draftId === this.selectedDraftId) ?? null;
  }

  /* ── Proceed with selected draft ── */
  selectFlatReport(): void {
    if (!this.selectedDraftId) {
      alert('Please select a draft first.');
      return;
    }

    this.proceeding = true;

    this.reportService.selectDraft(this.selectedDraftId, this.agencyToken).subscribe({
      next: (res: any) => {
        const draft = this.selectedDraft;

        // Store for report-creation to read
        localStorage.setItem('draftId',     this.selectedDraftId);
        localStorage.setItem('draftTables', JSON.stringify(draft?.tables     ?? []));
        localStorage.setItem('photoSlots',  JSON.stringify(draft?.photoSlots ?? []));

        this.proceeding = false;

        this.router.navigate(['/report-creation'], {
          queryParams: {
            reportId:   res.reportId,
            draftId:    this.selectedDraftId,
            draftName:  res.draftName,
            agencyName: this.agencyName
          }
        });
      },
      error: (err: any) => {
        console.error('selectDraft failed:', err);
        this.proceeding = false;
        alert('Failed to load report. Please try again.');
      }
    });
  }

selectLandReport(): void {
  if (!this.selectedDraftId) {
    alert('Please select a draft first.');
    return;
  }

  this.proceeding = true;

  this.reportService.selectDraft(this.selectedDraftId, this.agencyToken).subscribe({
    next: (res: any) => {
      const draft = this.selectedDraft;

      localStorage.setItem('draftId',     this.selectedDraftId);
      localStorage.setItem('draftTables', JSON.stringify(draft?.tables     ?? []));
      localStorage.setItem('photoSlots',  JSON.stringify(draft?.photoSlots ?? []));

      this.proceeding = false;

      this.router.navigate(['/report-creation'], {
        queryParams: {
          reportId:   res.reportId,
          draftId:    this.selectedDraftId,
          draftName:  res.draftName,
          agencyName: this.agencyName,
          reportType: 'land'          // ✅ only change vs selectFlatReport()
        }
      });
    },
    error: (err: any) => {
      console.error('selectLandReport failed:', err);
      this.proceeding = false;
      alert('Failed to load report. Please try again.');
    }
  });
}

  /* ── Helpers ── */
  requiredSlots(draft: Draft): PhotoSlot[] {
    return (draft.photoSlots ?? []).filter(s => s.isRequired);
  }

  optionalSlots(draft: Draft): PhotoSlot[] {
    return (draft.photoSlots ?? []).filter(s => !s.isRequired);
  }

  uniquePages(draft: Draft): number[] {
    const pages = new Set((draft.photoSlots ?? []).map(s => s.pageNumber));
    return Array.from(pages).sort((a, b) => a - b);
  }
}