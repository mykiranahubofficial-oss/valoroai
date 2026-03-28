import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PhotoOrganizerService } from '../service/photo-organizer.service';

@Component({
  selector: 'app-photo-layout-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './photo-layout-preview.component.html',
  styleUrl: './photo-layout-preview.component.css'
})
export class PhotoLayoutPreviewComponent {

  private service = inject(PhotoOrganizerService);

  pages$ = this.service.pages$;
  photosPerPage$ = this.service.photosPerPage$;

  changeLayout(num:number){
    this.service.changeLayout(num);
  }

}