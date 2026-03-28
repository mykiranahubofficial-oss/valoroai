import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-upload-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './upload-header.component.html',
  styleUrls: ['./upload-header.component.css']
})
export class UploadHeaderComponent {

  uploadedFiles: any = {};
  uploadedPhotos: any[] = [];
  visitMessage: string = '';

  @Output() visitMessageChange = new EventEmitter<string>();
  @Output() fileUploaded = new EventEmitter<any>();
  @Output() photosUploaded = new EventEmitter<any[]>();
  /* ===============================
     FILE UPLOAD
  =============================== */

  onFileSelect(event: any, type: string) {

    const file = event.target.files[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);

    const payload = {
      type,
      file,
      preview
    };

    this.uploadedFiles[type] = payload;

    this.fileUploaded.emit(payload);

    console.log('Uploaded:', payload);
  }

  removeFile(type: string) {

  delete this.uploadedFiles[type];

  this.fileUploaded.emit({
    type,
    removed: true
  });

}

  /* ===============================
     SEND VISIT MESSAGE
  =============================== */

  sendVisitMessage() {

    if (!this.visitMessage) return;

    this.visitMessageChange.emit(this.visitMessage);

    console.log("Visit message sent:", this.visitMessage);
  }

onMultipleFilesSelect(event: any) {
  const files = event.target.files;
  if (!files) return;

  const newPhotos = Array.from(files).map((file: any) => ({
    file: file,
    preview: URL.createObjectURL(file)
  }));

  this.uploadedPhotos = [...this.uploadedPhotos, ...newPhotos];
  
  // Logic: Push the update to the Parent
  this.photosUploaded.emit(this.uploadedPhotos);
}

removePhoto(index: number) {
  this.uploadedPhotos.splice(index, 1);
  this.photosUploaded.emit(this.uploadedPhotos);
}
/* ===============================
    PHOTO MANAGEMENT
=============================== */

// Change this logic to clear everything
removeAllPhotos() {
  // 1. Clear the local array
  this.uploadedPhotos = [];
  
  // 2. Emit the empty array to the Parent so the Photo Organizer updates
  this.photosUploaded.emit(this.uploadedPhotos);
  
  // 3. Reset the file input if needed (optional)
  console.log("All photos removed");
}


// Add these variables to your class
locationLink: string = '';
coordinates: { lat: string; lng: string } | null = null;

// Add this method to handle link parsing
onLinkPaste() {
  if (!this.locationLink) {
    this.coordinates = null;
    return;
  }

  // Regex to catch coordinates in URLs (e.g., @18.5204,73.8567)
  const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
  const match = this.locationLink.match(regex);

  if (match) {
    this.coordinates = {
      lat: match[1],
      lng: match[2]
    };
    // Emit to parent if needed
    this.fileUploaded.emit({ type: 'location', data: this.coordinates });
  }
}

removeLink() {
  this.locationLink = '';
  this.coordinates = null;
}

}