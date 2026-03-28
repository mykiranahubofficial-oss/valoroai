import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhotoOrganizerService, Photo } from '../service/photo-organizer.service';

@Component({
  selector: 'app-photo-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './photo-gallery.component.html',
  styleUrl: './photo-gallery.component.css'
})
export class PhotoGalleryComponent {

  private photoService = inject(PhotoOrganizerService);

  constructor() {
    console.log("PhotoGallery service:", this.photoService);
  }

  uploadedPhotos$ = this.photoService.uploadedPhotos$;
  selectedPhotos$ = this.photoService.selectedPhotos$;

  onLocalUpload(event:any) {
    console.log("Files selected:", event.target.files);
    this.photoService.uploadPhotos(event.target.files);
  }

  togglePhoto(photo: Photo){
    console.log("Photo clicked:", photo);
    this.photoService.togglePhoto(photo);
  }

  deletePhoto(event:Event, photo: Photo){
    event.stopPropagation();
    this.photoService.deletePhoto(photo);
  }

  isSelected(photo: Photo, selected: Photo[] | null): boolean {
    if (!selected) return false;
    return selected.some(p => p.id === photo.id);
  }

}