//src\app\report-management\report-creation\service\photo-organizer.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Photo {
  id: string;
  file: File;
  preview: string;
}

@Injectable({
  providedIn: 'root'
})
export class PhotoOrganizerService {

  private uploadedPhotos = new BehaviorSubject<Photo[]>([]);
  uploadedPhotos$ = this.uploadedPhotos.asObservable();

  private selectedPhotos = new BehaviorSubject<Photo[]>([]);
  selectedPhotos$ = this.selectedPhotos.asObservable();

  private pages = new BehaviorSubject<Photo[][]>([]);
  pages$ = this.pages.asObservable();

  private photosPerPage = new BehaviorSubject<number>(6);
  photosPerPage$ = this.photosPerPage.asObservable();

private marketPhotos = new BehaviorSubject<File[]>([]);
marketPhotos$ = this.marketPhotos.asObservable();
    constructor() {
    this.generatePages();   // 👈 add here
  }
  /* =============================
     UPLOAD PHOTOS
  ============================= */

uploadPhotos(files: FileList) {
  // 1. Create the new photo objects
  const newPhotos: Photo[] = Array.from(files).map(file => ({
    id: crypto.randomUUID(),
    file,
    preview: URL.createObjectURL(file)
  }));

  // 2. Update the master list of uploaded photos
  const updatedUploaded = [...this.uploadedPhotos.value, ...newPhotos];
  this.uploadedPhotos.next(updatedUploaded);

  // 3. AUTO-SELECT LOGIC:
  const currentSelected = [...this.selectedPhotos.value];
  const slotsAvailable = 12 - currentSelected.length;

  if (slotsAvailable > 0) {
    // Take either all new photos or just enough to fill the 12 slots
    const photosToAutoSelect = newPhotos.slice(0, slotsAvailable);
    this.selectedPhotos.next([...currentSelected, ...photosToAutoSelect]);
  }

  // 4. Refresh pages
  this.generatePages();
}
  /* =============================
     SELECT PHOTO
  ============================= */
togglePhoto(photo: Photo) {

  const current = this.selectedPhotos.value;

  const exists = current.find(p => p.id === photo.id);

  /* If already selected → remove */
  if (exists) {

    this.selectedPhotos.next(
      current.filter(p => p.id !== photo.id)
    );

  } else {

    /* 🚫 Prevent selecting more than 12 */
    if (current.length >= 12) {
      console.warn("Maximum 12 photos allowed");
      alert("You can select maximum 12 photos for the report.");
      return;
    }

    this.selectedPhotos.next([...current, photo]);

  }

  this.generatePages();
}

  /* =============================
     DELETE PHOTO
  ============================= */

  deletePhoto(photo: Photo) {

    this.uploadedPhotos.next(
      this.uploadedPhotos.value.filter(p => p.id !== photo.id)
    );

    this.selectedPhotos.next(
      this.selectedPhotos.value.filter(p => p.id !== photo.id)
    );

    if (photo.preview.startsWith('blob:')) {
      URL.revokeObjectURL(photo.preview);
    }

    this.generatePages();
  }

  /* =============================
     CHANGE LAYOUT
  ============================= */

  changeLayout(num: number) {
    this.photosPerPage.next(num);
    this.generatePages();
  }

  /* =============================
     PAGE GENERATION
  ============================= */
updateMarketPhotos(files: File[]) {
  console.log("💾 Service: Updating market photos stream", files.length);
  this.marketPhotos.next(files);
}
generatePages() {

  const selected = this.selectedPhotos.value;
  const perPage = this.photosPerPage.value;

  const pages: Photo[][] = [];

  /* First page */
  pages.push(selected.slice(0, perPage));

  /* Second page */
  pages.push(selected.slice(perPage, perPage * 2));

  /* Always exactly 2 pages */
  this.pages.next(pages);

}
/* Inside PhotoOrganizerService */

resetService() {
  // 1. Revoke all blob URLs to prevent memory leaks
  this.uploadedPhotos.value.forEach(photo => {
    if (photo.preview.startsWith('blob:')) {
      URL.revokeObjectURL(photo.preview);
    }
  });

  // 2. Reset all subjects to initial values
  this.uploadedPhotos.next([]);
  this.selectedPhotos.next([]);
  this.marketPhotos.next([]); // 👈 Clear market photos on reset
  this.photosPerPage.next(6); // default to 6
  this.generatePages(); // This will clear the pages subject
  
  console.log("PhotoOrganizerService has been reset.");
}

}