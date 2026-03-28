/// C:\Users\mykiranahub1\Desktop\Valora\valorademo\valorademo\src\app\report-management\report-creation\report-preview\report-preview.component.ts


import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
@Component({
  selector: 'app-report-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './report-preview.component.html',
  styleUrl: './report-preview.component.css'
})
export class ReportPreviewComponent implements OnInit {

  reportPath = '';
  reportId = '';
  downloadUrl = '';
  googleDocsUrl = '';
  isLocalhostServer = false;
  previewUrl = '';
pdfUrl = '';
docxUrl = '';
safeUrl!: SafeResourceUrl;
  constructor(private route: ActivatedRoute,   private sanitizer: DomSanitizer
) { }

ngOnInit() {
  this.route.queryParams.subscribe(params => {

    this.previewUrl = params['previewUrl'] || '';
    this.pdfUrl = params['pdfUrl'] || '';
    this.docxUrl = params['docxUrl'] || '';
    this.reportId = params['reportId'] || '';

    if (!this.previewUrl) {
      console.error("❌ No preview URL");
      return;
    }

    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.previewUrl);
  });
}






downloadDocx() {
  if (!this.docxUrl) return;

  const link = document.createElement('a');
  link.href = this.docxUrl;
  link.download = `Report_${this.reportId}.docx`;
  link.click();
}
downloadPdf() {
  if (!this.pdfUrl) return;
  window.open(this.pdfUrl, '_blank');
}
openInWord() {
  if (!this.docxUrl) return;
  window.open(this.docxUrl, '_blank');
}
ngOnDestroy() {
  if (this.previewUrl) {
    URL.revokeObjectURL(this.previewUrl);
  }
}
  
}