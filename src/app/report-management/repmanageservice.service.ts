//// C:\Users\mykiranahub1\Desktop\Valora\valorademo\src\app\report-management\repmanageservice.service.ts

//// C:\Users\mykiranahub1\Desktop\Valora\valorademo\src\app\report-management\repmanageservice.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { switchMap, catchError, tap } from 'rxjs/operators';
import { fromFetch } from 'rxjs/fetch';

import { environment } from '../../environments/environment';
export interface SelectDraftResponse {
  success: boolean;
  message: string;
  reportId: string;
  draftId: string;
  draftName: string;
  tables: any[];
    photoSlots: any[];   // ✅ add this
  agencyName: string;
}
@Injectable({
  providedIn: 'root'
})
export class RepmanageserviceService {

  private baseUrl = `${environment.apiBaseUrl}/report`;
  private autoDocuUrl = `${environment.apiBaseUrl}/autodocu`;

  constructor(private http: HttpClient) {}

  /* ===============================
     Select Draft (Improved)
  =============================== */
  selectDraft(
    draftId: string,
    agencyToken: string
  ): Observable<SelectDraftResponse> {

    const url = `${this.baseUrl}/selectdraft`;

    /* ✅ Safe params building */
    let params = new HttpParams().set('agencyToken', agencyToken);

    if (draftId) {
      params = params.set('draftId', draftId);
    }

    /* ✅ Debug log */
    console.log("📤 API CALL → selectDraft", {
      url,
      draftId,
      agencyToken
    });

    return this.http.get<SelectDraftResponse>(url, { params }).pipe(

      /* ✅ Response log */
      tap((res) => {
        console.log("📥 API RESPONSE → selectDraft", res);
      }),

      /* ✅ Error handling */
      catchError((err) => {
        console.error("❌ API ERROR → selectDraft", err);
        return throwError(() => err);
      })
    );
  }


  /* ===============================
   Get All Drafts With Slots
=============================== */
getDraftsWithSlots(userId: string, agencyToken: string): Observable<any> {
  const url    = `${this.baseUrl}/agency-draft/all`;
  const params = new HttpParams().set('agencyToken', agencyToken);  // ✅ token not userId

  console.log("📤 API CALL → getDraftsWithSlots", { url, agencyToken });

  return this.http.get<any>(url, { params }).pipe(
    tap((res) => console.log("📥 API RESPONSE → getDraftsWithSlots", res)),
    catchError((err) => {
      console.error("❌ API ERROR → getDraftsWithSlots", err);
      return throwError(() => err);
    })
  );
}

  /* ===============================
     Save Basic Details
  =============================== */

  saveBasicDetails(data: any): Observable<any> {
    const url = `${this.baseUrl}/basic-details/save`;
    console.log("Saving Basic Details:", data);
    return this.http.post(url, data);
  }

  /* ===============================
     Save Visit Details
  =============================== */

  saveVisitDetails(data: any): Observable<any> {
    const url = `${this.baseUrl}/visit-details/save`;
    console.log("Saving Visit Details:", data);
    return this.http.post(url, data);
  }

  /* ===============================
     OCR TEXT EXTRACTION
     Supports AbortSignal for cancellation via fromFetch
  =============================== */

  extractText(files: File | File[], reportId: string, signal?: AbortSignal): Observable<any> {

    const url = `${this.autoDocuUrl}/extract-text`;
    const formData = new FormData();
    const fileArray = Array.isArray(files) ? files : [files];

    fileArray.forEach(file => formData.append("files", file));
    formData.append("reportId", reportId);

    console.log("Calling OCR API:", url);
    console.log("ReportId:", reportId);
    console.log("File count:", fileArray.length);

    // ── Use fromFetch to support AbortSignal for cancellation ──
    return fromFetch(url, {
      method: 'POST',
      body: formData,
      signal: signal
    }).pipe(
      switchMap(response => {
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }
        return response.json();
      }),
      catchError(err => {
        if (err.name === 'AbortError') {
          console.log('🛑 Extraction request aborted by user');
          return of({ aborted: true });
        }
        console.error('🚨 extractText error:', err);
        throw err;
      })
    );
  }

  /* ===============================
     CREATE FINAL REPORT (SERVICES )
  =============================== */

  
  /* ===============================
     CREATE FINAL REPORT (SERVICES )
  =============================== */

createReport(formData: FormData): Observable<any> {  // ✅ remove reportType param
  const url = `${this.baseUrl}/create-report`;

  // ❌ DELETE this line — component already appends reportType
  // formData.append('reportType', reportType);

  console.log("🚀 [ReportService] Sending report creation request");
  console.log("🌐 URL:", url);
  console.log("📦 [ReportService] FormData Payload:");
  formData.forEach((value, key) => {
    if (value instanceof File) {
      console.log(`   ${key}: [FILE] ${value.name} (${value.size} bytes)`);
    } else {
      console.log(`   ${key}:`, value);
    }
  });
  console.log("────────────────────────────");

  return this.http.post(url, formData, {
    responseType: 'json'
  });
}
  /* ===============================
     SAVE VALUE LINKS IMAGES
  =============================== */

  saveValueLinks(files: File[], reportId: string): Observable<any> {
    const url = `${this.baseUrl}/value-links`;
    const formData = new FormData();
    formData.append("reportId", reportId);
    files.forEach(file => { formData.append("valueLinks", file); });

    console.log("🏪 Uploading value link images");
    formData.forEach((value, key) => {
      if (value instanceof File) {
        console.log(`📷 ${key}:`, value.name);
      } else {
        console.log(`📝 ${key}:`, value);
      }
    });

    return this.http.post(url, formData);
  }

  /* ===============================
     SAVE VALUATION DETAILS
  =============================== */

  saveValuationDetails(data: any): Observable<any> {
    const url = `${this.baseUrl}/saveValuationDetails/save`;
    console.log("Saving Valuation Details:", data);
    return this.http.post(url, data);
  }

  /* ===============================
     SEARCH COMPARABLE PROPERTY VALUES
  =============================== */

  searchValue(
    buildingName: string,
    address: string,
    areaSqft: number | string,
    areaType: string,
    bhk?: string
  ): Observable<any> {
    let params = `buildingName=${encodeURIComponent(buildingName)}&address=${encodeURIComponent(address)}&areaSqft=${areaSqft}&areaType=${encodeURIComponent(areaType)}`;
    if (bhk) params += `&bhk=${encodeURIComponent(bhk)}`;
    const url = `${this.autoDocuUrl}/searchValue?${params}`;
    console.log("🔍 Calling Search Value API:", url);
    return this.http.get(url);
  }

  /* ===============================
     SATELLITE MAP AUTOMATION
  =============================== */

/* ===============================
   SATELLITE MAP AUTOMATION
=============================== */

// PATH B — address only (trigger automation, no file)
triggerMapAutomation(data: {
  reportId: string;
  buildingName?: string;
  village?: string;
  city?: string;
  district?: string;
}): Observable<any> {
  const url = `${environment.apiBaseUrl}/maps/satellite`;

  const formData = new FormData();
  formData.append('reportId',     data.reportId);
  formData.append('buildingName', data.buildingName || '');
  formData.append('village',      data.village      || '');
  formData.append('city',         data.city         || '');
  formData.append('district',     data.district     || '');
  // NO image appended → backend takes PATH B (automation)

  console.log("🗺️ Triggering Map Automation (PATH B) via API:", url);
  return this.http.post(url, formData);
}

// PATH A — manual image upload
uploadLocationImage(data: {
  reportId: string;
  imageFile: File;
  marketLinkFile?: File | null;
}): Observable<any> {

  const url = `${environment.apiBaseUrl}/maps/satellite`;

  const formData = new FormData();

  formData.append('reportId', data.reportId);
  formData.append('image', data.imageFile); // map image

  // ✅ THIS IS YOUR FIX
  if (data.marketLinkFile) {
    formData.append('marketLinkimg', data.marketLinkFile);
  }

  console.log("📦 Sending:");
  console.log("image:", data.imageFile?.name);
  console.log("marketLinkimg:", data.marketLinkFile?.name);

  return this.http.post(url, formData);
}

}