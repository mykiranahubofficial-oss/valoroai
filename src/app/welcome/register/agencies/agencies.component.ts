import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { RegistrationService } from '../services/registration.service';
import { Agency, Draft } from '../model/agency.model';
import { TableBuilderComponent } from '../table-builder/table-builder.component';
import { DraftBuilderComponent } from '../draft-builder/draft-builder.component';

@Component({
  selector: 'app-agencies',
  standalone: true,
  imports: [CommonModule, FormsModule, TableBuilderComponent, DraftBuilderComponent],
  templateUrl: './agencies.component.html',
  styleUrl: './agencies.component.css'
})
export class AgenciesComponent implements OnInit {

  agencies: Agency[] = [];
  userId = '';

  /* ── Edit Popup ── */
  showEditPopup = false;
  editForm: any = { userId: '', agencyName: '', ownerName: '' };
  selectedFile: File | null = null;
  uploading = false;

  /* ── Draft Builder ── */
  showDraftBuilder    = false;
  draftBuilderUserId  = '';       // ✅ per agency userId

  /* ── Table Builder ── */
  showTableBuilder    = false;
  tableBuilderUserId  = '';
  tableBuilderDraftId = '';

  // ✅ Track active draft per agency — key = userId
  activeDraftMap: { [userId: string]: Draft } = {};

  constructor(private registrationService: RegistrationService) {}

  ngOnInit(): void {
    this.userId = localStorage.getItem('userId') || '';
    this.loadAgencies();
  }

  loadAgencies() {
    this.registrationService.getAgencies().subscribe({
      next: (res) => {
        if (res.success) {
          this.agencies = res.data;
          console.log('✅ Agencies loaded:', this.agencies.length);
        }
      },
      error: (err) => console.error('❌ Failed to fetch agencies', err)
    });
  }

  trackByUserId(_: number, agency: Agency) {
    return agency.userId;
  }

  /* ── Edit Agency ── */
  openEditPopup(agency: Agency) {
    this.editForm = {
      userId:     agency.userId,
      agencyName: agency.agencyName,
      ownerName:  agency.ownerName
    };
    this.showEditPopup = true;
  }

  closeEditPopup() {
    this.showEditPopup = false;
  }

  saveEdit() {
    this.registrationService.updateAgencyConfig({
      userId:     this.editForm.userId,
      agencyName: this.editForm.agencyName,
      ownerName:  this.editForm.ownerName
    }).subscribe({
      next:  () => { this.showEditPopup = false; this.loadAgencies(); },
      error: (err) => console.error('❌ Update failed', err)
    });
  }

  /* ── File Upload ── */
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      console.log('📄 Selected file:', file.name);
    }
  }

  uploadReport() {
    if (!this.selectedFile) { alert('Please select a file first'); return; }
    this.uploading = true;
    this.registrationService.uploadReport(this.selectedFile).subscribe({
      next: (res) => {
        console.log('✅ Upload success:', res);
        alert('Report uploaded successfully');
        this.selectedFile = null;
        this.uploading    = false;
      },
      error: (err) => {
        console.error('❌ Upload failed:', err);
        alert('Upload failed');
        this.uploading = false;
      }
    });
  }

  /* ── Draft Builder ── */
  openDraftBuilder(agency: Agency) {
    this.draftBuilderUserId = agency.userId;  // ✅ per agency
    this.showDraftBuilder   = true;
  }

  onDraftCreated(draft: { draftId: string; draftName: string }): void {
    console.log('✅ Draft created:', draft);
    this.showDraftBuilder = false;
    this.loadAgencies();   // ✅ reload to show new draft on card
  }

  /* ── Table Builder ── */
  openTableBuilder(agency: Agency, draft: Draft) {
    this.tableBuilderUserId  = agency.userId;
    this.tableBuilderDraftId = draft.draftId;   // ✅ from specific draft
    this.showTableBuilder    = true;
    console.log('📊 Opening table builder for draft:', draft.draftId);
  }

  onTableBuilderClosed() {
    this.showTableBuilder = false;
    this.loadAgencies();   // ✅ reload to show new table on card
  }
}