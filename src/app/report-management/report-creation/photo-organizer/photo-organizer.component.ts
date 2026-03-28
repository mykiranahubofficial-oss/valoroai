import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhotoGalleryComponent } from '../photo-gallery/photo-gallery.component';
import { PhotoLayoutPreviewComponent } from '../photo-layout-preview/photo-layout-preview.component';
import { MarcketPhotoComponent } from '../marcket-photo/marcket-photo.component'; // ← ADD THIS

@Component({
  selector: 'app-photo-organizer',
  standalone: true,
  imports: [
    CommonModule,
    PhotoGalleryComponent,
    PhotoLayoutPreviewComponent,
    MarcketPhotoComponent  // ← ADD THIS
  ],
  templateUrl: './photo-organizer.component.html',
  styleUrl: './photo-organizer.component.css'
})
export class PhotoOrganizerComponent implements OnChanges {

  @Input() uploadedPhotos: any[] = [];
  @Output() photosChanged = new EventEmitter<any[]>();
  @Output() marketPhotosForwarded = new EventEmitter<File[]>();

  selectedPhotos: any[] = [];
  pages: any[][] = [];
  photosPerPage = 4;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['uploadedPhotos']) {
      this.distributePhotosToPages();
    }
  }

  // ← FIX: correct type File[] not Event
 onMarketPhotosChange(files: File[]) {
  console.log('Market photos received in organizer:', files.length);
  this.marketPhotosForwarded.emit(files); // ✅ Forward to parent
}
  changeLayout(num: number) {
    this.photosPerPage = num;
    const maxPhotos = num * 2;
    if (this.selectedPhotos.length > maxPhotos) {
      this.selectedPhotos = this.selectedPhotos.slice(0, maxPhotos);
    }
    this.distributePhotosToPages();
  }

  togglePhotoSelection(photo: any) {
    const index = this.selectedPhotos.findIndex(p => p.preview === photo.preview);
    const maxPhotos = this.photosPerPage * 2;
    if (index > -1) {
      this.selectedPhotos.splice(index, 1);
    } else {
      if (this.selectedPhotos.length < maxPhotos) {
        this.selectedPhotos.push(photo);
      }
    }
    this.distributePhotosToPages();
    this.photosChanged.emit(this.selectedPhotos);
  }

  deletePhoto(photo: any) {
    this.uploadedPhotos = this.uploadedPhotos.filter(p => p.preview !== photo.preview);
    this.selectedPhotos = this.selectedPhotos.filter(p => p.preview !== photo.preview);
    if (photo.preview?.startsWith('blob:')) {
      URL.revokeObjectURL(photo.preview);
    }
    this.distributePhotosToPages();
    this.photosChanged.emit(this.selectedPhotos);
  }

  distributePhotosToPages() {
    const maxPhotos = this.photosPerPage * 2;
    if (this.selectedPhotos.length > maxPhotos) {
      this.selectedPhotos = this.selectedPhotos.slice(0, maxPhotos);
    }
    this.pages = [
      this.selectedPhotos.slice(0, this.photosPerPage),
      this.selectedPhotos.slice(this.photosPerPage, maxPhotos)
    ];
  }


  // Inside PhotoOrganizerComponent
ngOnDestroy() {
  this.selectedPhotos = [];
  this.pages = [];
  // Cleanup any lingering blob URLs to prevent memory leaks
  this.uploadedPhotos.forEach(p => {
    if (p.preview?.startsWith('blob:')) URL.revokeObjectURL(p.preview);
  });
}
}