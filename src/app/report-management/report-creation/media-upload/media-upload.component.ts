import { Component, HostListener, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RepmanageserviceService } from '../../repmanageservice.service';
import { environment } from '../../../../environments/environment';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-media-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './media-upload.component.html',
  styleUrl: './media-upload.component.css'
})
export class MediaUploadComponent {

  @Input() reportId: string = '';

  reckonerPhoto: string | null = null;
  locationMapPhoto: string | null = null;
  pushedAddressData: any = null;

  showManualForm = false;

manualData = {
  buildingName: '',
  village: '',
  city: '',        // ✅ add this
  district: 'Pune'
};


  reckonerFile: File | null = null;
  locationMapFile: File | null = null;

  isGeneratingMap = false;

  get isProcessing(): boolean {
  return this.isGeneratingMap;
}

  constructor(private reportService: RepmanageserviceService) {}

  onFileSelected(event: Event, type: 'reckoner' | 'location') {

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      this.previewFile(file, type);
    }

  }

  toggleManual() {

    this.showManualForm = !this.showManualForm;

    if (this.pushedAddressData) {
      this.manualData.buildingName = this.pushedAddressData.buildingName || '';
      this.manualData.village = this.pushedAddressData.village || '';
      this.manualData.district = this.pushedAddressData.district || 'Pune';
    }

  }

// 2. Fix paste — Blob → File
@HostListener('window:paste', ['$event'])
handlePaste(event: ClipboardEvent) {
  const items = event.clipboardData?.items;
  if (!items) return;

  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf('image') !== -1) {
      const blob = items[i].getAsFile();
      if (blob) {
        if (!this.reckonerPhoto) {
          this.previewFile(blob, 'reckoner');
        } else {
          // ✅ convert to File
          this.locationMapFile = new File(
            [blob],
            `paste-map-${Date.now()}.png`,
            { type: blob.type || 'image/png' }
          );
          this.locationMapPhoto = URL.createObjectURL(this.locationMapFile);
        }
      }
    }
  }
}
  setAddressData(data: any) {
    this.pushedAddressData = data;
    console.log("📍 Address pushed:", this.pushedAddressData);
  }

generateAutoMap(isManual: boolean = false) {
  const source = isManual ? this.manualData : this.pushedAddressData;

  if (!source) {
    alert("Please enter location details");
    return;
  }

  const payload = {
    reportId:     this.reportId,
    buildingName: source.buildingName || '',
    village:      source.village      || '',
    city:         source.city         || '',   // ✅ was missing before
    district:     source.district     || ''
  };

  this.isGeneratingMap = true;

  this.reportService.triggerMapAutomation(payload).subscribe({
    next: async (res) => {
      if (res?.success) {

        const fullUrl = `${environment.apiBaseUrl}${res.data.screenshotUrl}`;
        this.locationMapPhoto = fullUrl; // ✅ preview

        // ✅ fetch screenshot and store as File so createReport() can send it
        try {
          const blob = await fetch(fullUrl).then(r => r.blob());
          this.locationMapFile = new File(
            [blob],
            `map-${this.reportId}.png`,
            { type: 'image/png' }
          );
          console.log("✅ Auto map stored as File:", this.locationMapFile.name);
        } catch (e) {
          console.error("❌ Could not fetch map image:", e);
        }

        this.showManualForm = false;
      }
      this.isGeneratingMap = false;
    },
    error: (err) => {
      console.error("Map generation error:", err);
      alert("Map generation failed");
      this.isGeneratingMap = false;
    }
  });
}

  previewFile(file: File, type: 'reckoner' | 'location') {

   if (type === 'reckoner') this.reckonerFile = file;
    else if (type === 'location') this.locationMapFile = file;

    const reader = new FileReader();

    reader.onload = (e: any) => {

      if (type === 'reckoner') {
        this.reckonerPhoto = e.target.result;
      }
      else {
        this.locationMapPhoto = e.target.result;
      }

    };

    reader.readAsDataURL(file);

  }

  removePhoto(type: 'reckoner' | 'location') {

    if (type === 'reckoner') {
      this.reckonerPhoto = null;
      this.reckonerFile = null;
    }
    else {
      this.locationMapPhoto = null;
      this.locationMapFile = null;
    }

  }

}