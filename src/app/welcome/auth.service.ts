import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LoginResponse {
  success: boolean;
  message: string;
  agencyToken?: string;
  agencyName?: string;
    drafts?:      { draftId: string; draftName: string }[];  // ✅ array

}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  /* ================= LOGIN ================= */
login(userId: string, userPass: string): Observable<LoginResponse> {
  const url = `${this.apiUrl}/autodocu/login`;

  console.log("🚀 LOGIN API CALLED");
  console.log("➡ URL:", url);
  console.log("➡ Payload:", { userId, userPass });

  return this.http.post<LoginResponse>(url, { userId, userPass });
}
}