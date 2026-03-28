import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';   // ✅ make sure this is here
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';
interface PhotoSlot {
  slotId:    string;   // ✅ needed for fieldname
  pageNumber: number;
  photoName:  string;   // exact field name eg. "saleInstanceImage1"
  isRequired: boolean;
}

export interface SlotPhotoEntry {
    slotId:    string;   // ✅ add this

  photoName: string;   // field name — used as FormData key
  file:      File;
}

@Component({
  selector:    'app-slot-photo-uploader',
  standalone:  true,
  imports:     [CommonModule,FormsModule    ],
  templateUrl: './slotphotouploader.component.html',
  styleUrl:    './slotphotouploader.component.css'
})
export class SlotPhotoUploaderComponent implements OnInit {

  // Emits filled entries up to report-creation
  @Output() photosChanged = new EventEmitter<SlotPhotoEntry[]>();
private platformId = inject(PLATFORM_ID);

  slots:    PhotoSlot[]  = [];
 files:    { [slotId: string]: File } = {};
previews: { [slotId: string]: string } = {};

ngOnInit(): void {
  if (!isPlatformBrowser(this.platformId)) return;  // ✅

  const raw  = localStorage.getItem('photoSlots');
  this.slots = raw ? JSON.parse(raw) : [];
  console.log('📸 Slot photo uploader — slots loaded:', this.slots);
}

  // ── Group slots by page for display ──
  get slotsByPage(): { page: number; slots: PhotoSlot[] }[] {
    const map = new Map<number, PhotoSlot[]>();
    this.slots.forEach(s => {
      if (!map.has(s.pageNumber)) map.set(s.pageNumber, []);
      map.get(s.pageNumber)!.push(s);
    });
    return Array.from(map.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([page, slots]) => ({ page, slots }));
  }

onFileSelected(event: Event, slot: PhotoSlot): void {
  const input = event.target as HTMLInputElement;
  const file  = input.files?.[0];
  if (!file) return;
  this.files[slot.photoName]    = file;      // ✅ photoName as key
  this.previews[slot.photoName] = '';
  const reader = new FileReader();
  reader.onload = (e) => {
    this.previews[slot.photoName] = e.target?.result as string;
  };
  reader.readAsDataURL(file);
  this.emitChange();
}
removePhoto(photoName: string): void {
  delete this.files[photoName];
  delete this.previews[photoName];
  this.emitChange();
}


getMissingRequired(): string[] {
  return this.slots
    .filter(s => s.isRequired && !this.files[s.photoName])  // ✅
    .map(s => s.photoName);
}

hasFile(slot: PhotoSlot): boolean {
  return !!this.files[slot.photoName];  // ✅
}

private emitChange(): void {
  const entries: SlotPhotoEntry[] = this.slots
    .filter(s => this.files[s.photoName])
    .map(s => ({
      slotId:    s.slotId,
      photoName: s.photoName,
      file:      this.files[s.photoName]
    }));
  this.photosChanged.emit(entries);
}
  // ── Friendly display label ──
  formatLabel(photoName: string): string {
    return photoName
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .trim();
  }
}