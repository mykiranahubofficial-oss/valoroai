import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Output, EventEmitter } from '@angular/core';
interface PhotoSlot {
  id: number;
  file: File | null;
  previewUrl: string | null;
  caption: string;
}

@Component({
  selector: 'app-marcket-photo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './marcket-photo.component.html',
  styleUrl: './marcket-photo.component.css'
})
export class MarcketPhotoComponent implements OnInit {
  
  @Output() marketPhotosChange = new EventEmitter<File[]>();
  photoSlots: PhotoSlot[] = [
    { id: 1, file: null, previewUrl: null, caption: 'Photo 1' },
    { id: 2, file: null, previewUrl: null, caption: 'Photo 2' },
    { id: 3, file: null, previewUrl: null, caption: 'Photo 3' },
    { id: 4, file: null, previewUrl: null, caption: 'Photo 4' },
  ];

  photosPerPage = 2;
  pages: PhotoSlot[][] = [];
  // ADD this new variable
  ngOnInit() {
    this.generatePages();
  }

  /* ==============================
     MULTIPLE FILE UPLOAD
  ============================== */
  onFilesSelected(event: any) {

    const files: FileList = event.target.files;

    if (!files) return;

    let slotIndex = this.photoSlots.findIndex(s => !s.file);

    if (slotIndex === -1) return; // no empty slots

    for (let i = 0; i < files.length && slotIndex < this.photoSlots.length; i++) {

      const file = files[i];

      if (!file.type.startsWith('image/')) continue;

      const slot = this.photoSlots[slotIndex];

      if (slot.previewUrl) {
        URL.revokeObjectURL(slot.previewUrl);
      }

      slot.file = file;
      slot.previewUrl = URL.createObjectURL(file);

      slotIndex++;
    }

    this.generatePages();
    this.emitPhotos();   // ⭐ IMPORTANT

  }

  /* ==============================
     PASTE IMAGE SUPPORT
  ============================== */

  @HostListener('paste', ['$event'])
  handlePaste(event: ClipboardEvent) {

    const items = event.clipboardData?.items;

    if (!items) return;

    for (let i = 0; i < items.length; i++) {

      const item = items[i];

      if (item.type.indexOf("image") === -1) continue;

      const file = item.getAsFile();

      if (!file) return;

      const emptySlot = this.photoSlots.find(s => !s.file);

      if (!emptySlot) return;

      emptySlot.file = file;
      emptySlot.previewUrl = URL.createObjectURL(file);

    }

    this.generatePages();
    this.emitPhotos();
  }
 removePhoto(slotId: number) {

  const slot = this.photoSlots.find(s => s.id === slotId);
  if (!slot) return;

  if (slot.previewUrl) {
    URL.revokeObjectURL(slot.previewUrl);
  }

  slot.file = null;
  slot.previewUrl = null;
  slot.caption = `Photo ${slotId}`;

  this.generatePages();

  this.emitPhotos(); // ⭐ IMPORTANT
}

  /* ==============================
     PAGE GENERATION
  ============================== */

  generatePages() {

    this.pages = [];

    for (let i = 0; i < this.photoSlots.length; i += this.photosPerPage) {

      this.pages.push(
        this.photoSlots.slice(i, i + this.photosPerPage)
      );

    }

  }
  emitPhotos() {

    const files = this.photoSlots
      .filter(slot => slot.file)
      .map(slot => slot.file as File);

    console.log("🏪 Market photos emitted:", files.length);

    this.marketPhotosChange.emit(files);

  }

}