import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RegistrationService } from '../services/registration.service';

interface PhotoSlot {
  slotId?: string;
  pageNumber: number | null;
  photoName: string;
  isRequired: boolean;
}

interface PageGroup {
  page: number;
  slots: PhotoSlot[];
}

interface Draft {
  draftId: string;
  draftName: string;
}

interface Agency {
  _id: string;
  userId: string;
  agencyName: string;
  drafts: Draft[];
}

@Component({
  selector: 'app-photo-slots',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './photo-slots.component.html',
  styleUrl: './photo-slots.component.css'
})
export class PhotoSlotsComponent implements OnInit {

  // ── Step state ──
  step: 1 | 2 | 3 = 1;

  // ── Data ──
  agencies:   Agency[]    = [];
  drafts:     Draft[]     = [];
  slots:      PhotoSlot[] = [];   // edit form rows
  savedSlots: PhotoSlot[] = [];   // read view — what's in DB

  // ── Computed grouped view ──
  slotsByPage: PageGroup[] = [];

  // ── Selections ──
  selectedAgency: Agency | null = null;
  selectedDraft:  Draft  | null = null;

  // ── UI state ──
  editMode = false;
  loading  = false;
  saving   = false;
  message  = '';
  isError  = false;

  constructor(private regService: RegistrationService) {}

  ngOnInit(): void {
    this.loadAgencies();
  }

  // ── Step 1 ──
  loadAgencies(): void {
    this.loading = true;
    this.regService.getAgencies().subscribe({
      next: (res: any) => {
        this.agencies = res.data ?? res ?? [];
        this.loading  = false;
      },
      error: () => {
        this.showMessage('Failed to load agencies', true);
        this.loading = false;
      }
    });
  }

  selectAgency(agency: Agency): void {
    this.selectedAgency = agency;
    this.drafts         = agency.drafts ?? [];
    this.selectedDraft  = null;
    this.slots          = [];
    this.savedSlots     = [];
    this.slotsByPage    = [];
    this.editMode       = false;
    this.step           = 2;
  }

  // ── Step 2 ──
  selectDraft(draft: Draft): void {
    this.selectedDraft = draft;
    this.editMode      = false;
    this.step          = 3;
    this.loadSlots();
  }

  // ── Load existing slots from DB ──
  loadSlots(): void {
    if (!this.selectedAgency || !this.selectedDraft) return;
    this.loading = true;

    this.regService
      .getPhotoSlots(this.selectedAgency.userId, this.selectedDraft.draftId)
      .subscribe({
        next: (res: any) => {
          const raw        = res.data?.slots ?? [];
          this.savedSlots  = raw;
          this.slotsByPage = this.groupByPage(raw);
          this.loading     = false;
        },
        error: () => {
          this.savedSlots  = [];
          this.slotsByPage = [];
          this.loading     = false;
        }
      });
  }

  // ── Group slots by pageNumber for the read view ──
  groupByPage(slots: PhotoSlot[]): PageGroup[] {
    const map = new Map<number, PhotoSlot[]>();

    slots.forEach((s) => {
      const page = s.pageNumber ?? 0;
      if (!map.has(page)) map.set(page, []);
      map.get(page)!.push(s);
    });

    return Array.from(map.entries())
      .sort((a, b) => a[0] - b[0])          // sort ascending by page number
      .map(([page, slots]) => ({ page, slots }));
  }

  // ── Edit mode ──
  startEdit(): void {
    // Populate edit rows from saved slots, or one empty row if none
    this.slots    = this.savedSlots.length
      ? this.savedSlots.map((s) => ({ ...s }))   // clone so edits don't mutate read view
      : [this.emptySlot()];
    this.editMode = true;
  }

  cancelEdit(): void {
    this.editMode = false;
    this.slots    = [];
  }

  toggleEdit(): void {
    this.editMode ? this.cancelEdit() : this.startEdit();
  }

  // ── Slot row management ──
  emptySlot(): PhotoSlot {
    return { pageNumber: null, photoName: '', isRequired: false };
  }

  addSlot(): void {
    this.slots.push(this.emptySlot());
  }

  removeSlot(index: number): void {
    this.slots.splice(index, 1);
    if (this.slots.length === 0) this.slots.push(this.emptySlot());
  }

  // ── Save ──
  saveSlots(): void {
    if (!this.selectedAgency || !this.selectedDraft) return;

    const invalid = this.slots.some((s) => !s.pageNumber || !s.photoName?.trim());
    if (invalid) {
      this.showMessage('Every slot needs a page number and a photo name', true);
      return;
    }

    this.saving = true;

    const payload = {
      userId:  this.selectedAgency.userId,
      draftId: this.selectedDraft.draftId,
      slots:   this.slots.map((s) => ({
        pageNumber: s.pageNumber as number,
        photoName:  s.photoName.trim(),
        isRequired: s.isRequired
      }))
    };

    this.regService.setPhotoSlots(payload).subscribe({
      next: (res: any) => {
        this.saving      = false;
        const saved      = res.data ?? [];
        this.savedSlots  = saved;
        this.slotsByPage = this.groupByPage(saved);
        this.editMode    = false;    // go back to read view
        this.slots       = [];
        this.showMessage(`${saved.length} slot(s) saved`, false);
      },
      error: () => {
        this.saving = false;
        this.showMessage('Failed to save slots', true);
      }
    });
  }

  // ── Navigation ──
  goBack(): void {
    if (this.step === 3) {
      this.step          = 2;
      this.selectedDraft = null;
      this.slots         = [];
      this.savedSlots    = [];
      this.slotsByPage   = [];
      this.editMode      = false;
    } else if (this.step === 2) {
      this.step           = 1;
      this.selectedAgency = null;
      this.drafts         = [];
    }
  }

  // ── Helpers ──
  showMessage(msg: string, isError: boolean): void {
    this.message = msg;
    this.isError = isError;
    setTimeout(() => (this.message = ''), 3500);
  }

  trackByIndex(index: number): number {
    return index;
  }
}