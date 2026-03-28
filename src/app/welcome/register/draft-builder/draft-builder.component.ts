import {
  Component, Input, Output, EventEmitter,
  OnChanges, SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { v4 as uuidv4 } from 'uuid';
import { RegistrationService } from '../services/registration.service';

@Component({
  selector: 'app-draft-builder',
  standalone: true,
  imports: [CommonModule, FormsModule],  // ✅ TextFieldModule removed
  templateUrl: './draft-builder.component.html',
  styleUrl:    './draft-builder.component.css'
})
export class DraftBuilderComponent implements OnChanges {

  @Input() visible = false;
  @Input() userId  = '';

  @Output() draftCreated = new EventEmitter<{ draftId: string; draftName: string }>();
  @Output() closed       = new EventEmitter<void>();

  draftName     = '';
  templateFile: File | null = null;
  templateName  = '';
  templateType  = '';

  isSaving    = false;
  isSaved     = false;
  saveError   = '';
  uploadError = '';

  constructor(private registrationService: RegistrationService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue === true) {
      this.reset();
    }
  }

  private reset(): void {
    this.draftName    = '';
    this.templateFile = null;
    this.templateName = '';
    this.templateType = '';
    this.isSaving     = false;
    this.isSaved      = false;
    this.saveError    = '';
    this.uploadError  = '';
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file    = input.files[0];
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowed.includes(file.type)) {
      this.uploadError = 'Only PDF, DOCX or Excel files allowed.';
      return;
    }

    this.uploadError  = '';
    this.templateFile = file;
    this.templateName = file.name;
    this.templateType = file.type === 'application/pdf' ? 'pdf'
                      : file.type.includes('word')      ? 'docx'
                      : 'excel';

    console.log('📎 File selected:', this.templateName, '| Type:', this.templateType);
  }

  removeFile(): void {
    this.templateFile = null;
    this.templateName = '';
    this.templateType = '';
    this.uploadError  = '';
  }

  get canSave(): boolean {
    return !!this.draftName.trim() && !!this.userId && !this.isSaving;
  }

  saveDraft(): void {
    if (!this.canSave) {
      if (!this.draftName.trim()) this.saveError = 'Draft name is required.';
      if (!this.userId)           this.saveError = 'Missing userId.';
      return;
    }

    this.isSaving  = true;
    this.saveError = '';

    // ✅ Always create draft first — then upload file
    this.createDraftFirst();
  }

  // ── Step 1: Create draft in DB first
  private createDraftFirst(): void {
    const draftId = `draft-${uuidv4()}`;  // ✅ generate once, reuse everywhere

    const payload = {
      userId:    this.userId,
      draftId,
      draftName: this.draftName.trim()
      // ✅ no draftLink here — file upload saves it separately
    };

    console.log('📝 Step 1 — Creating draft:', payload);

    this.registrationService.updateAgencyConfig(payload).subscribe({
      next: (res: any) => {
        console.log('✅ Draft created:', res);

        // ✅ Step 2 — Upload file if selected
        if (this.templateFile) {
          this.uploadTemplate(draftId);
        } else {
          // No file — done
          this.onSaveComplete(draftId);
        }
      },
      error: (err) => {
        console.error('❌ Draft creation failed:', err);
        this.isSaving  = false;
        this.saveError = err?.error?.message || 'Draft creation failed.';
      }
    });
  }

  // ── Step 2: Upload file to that draftId
  private uploadTemplate(draftId: string): void {
    const formData = new FormData();
    formData.append('file',    this.templateFile!);
    formData.append('userId',  this.userId);
    formData.append('draftId', draftId);   // ✅ draftId now exists in DB

    console.log('📤 Step 2 — Uploading template for draft:', draftId);

    this.registrationService.uploadDraftTemplate(formData).subscribe({
      next: (uploadRes: any) => {
        console.log('✅ Template uploaded:', uploadRes);
        this.onSaveComplete(draftId);
      },
      error: (err) => {
        console.error('❌ Upload failed:', err);
        this.isSaving    = false;
        this.uploadError = err?.error?.message || 'File upload failed.';
      }
    });
  }

  // ── Step 3: Done
  private onSaveComplete(draftId: string): void {
    this.isSaving = false;
    this.isSaved  = true;

    this.draftCreated.emit({
      draftId,
      draftName: this.draftName.trim()
    });

    setTimeout(() => {
      this.isSaved = false;
      this.close();
    }, 1500);
  }

  close(): void {
    this.closed.emit();
  }
}