import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

import { Agency, AgencyResponse,RegisterResponse } from '../model/agency.model';

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {

  private apiUrl = `${environment.apiBaseUrl}`;

  constructor(private http: HttpClient) {}

  /* =========================================
     CREATE / UPDATE AGENCY
  ========================================= */


  registerAgency(payload: any): Observable<RegisterResponse> {

    const url = `${this.apiUrl}/resistration/register`;

    console.log("🚀 Sending Agency Registration");
    console.log("📦 Payload:", payload);
    console.log("🌐 URL:", url);

    return this.http.post<RegisterResponse>(url, payload);
  }

/* =========================================
   FETCH ALL AGENCIES
========================================= */

getAgencies(): Observable<AgencyResponse> {

  const url = `${this.apiUrl}/report/agency-draft`;

  console.log("📡 Fetching all agencies");
  console.log("🌐 URL:", url);

  return this.http.get<AgencyResponse>(url);

}


  uploadReport(file: File): Observable<any> {

    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(
      `${this.apiUrl}upload/upload-report`,
      formData
    );

  }

 /* =========================================
     UPDATE AGENCY / DRAFT / TABLE
  ========================================= */

  updateAgencyConfig(payload: any): Observable<any> {

    const url = `${this.apiUrl}/report/agency-draft/update`;

    console.log("✏️ Updating agency config");
    console.log(payload);

    return this.http.patch(url, payload);

  }



// Upload template file
uploadDraftTemplate(formData: FormData): Observable<any> {
  return this.http.post(`${this.apiUrl}/report/upload-template`, formData);
}


/* =========================================
     PHOTO SLOTS — ADMIN
  ========================================= */
 
  setPhotoSlots(payload: {
    userId: string;
    draftId: string;
    slots: { pageNumber: number; photoName: string; isRequired: boolean }[];
  }): Observable<any> {
    const url = `${this.apiUrl}/admin/draft/photo-slots`;
    console.log('📸 Setting photo slots', payload);
    return this.http.post(url, payload);
  }
 
  getPhotoSlots(userId: string, draftId: string): Observable<any> {
    const url = `${this.apiUrl}/admin/draft/photo-slots?userId=${userId}&draftId=${draftId}`;
    console.log('📡 Fetching photo slots');
    return this.http.get(url);
  }
 
  deletePhotoSlot(slotId: string, userId: string, draftId: string): Observable<any> {
    const url = `${this.apiUrl}/admin/draft/photo-slots/${slotId}?userId=${userId}&draftId=${draftId}`;
    console.log('🗑️ Deleting photo slot', slotId);
    return this.http.delete(url);
  }
 
}