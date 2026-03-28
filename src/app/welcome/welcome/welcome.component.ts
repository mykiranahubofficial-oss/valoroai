import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { FormsModule } from '@angular/forms';     // ✅ REQUIRED
import { CommonModule } from '@angular/common';   // ✅ REQUIRED

@Component({
  selector: 'app-welcome',
    imports: [FormsModule,CommonModule],   // ✅ ADD THIS

  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent {

  userId = '';
  userPass = '';

  loading = false;
  error = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  /* ================= LOGIN ================= */
login() {
  console.log("🔥 LOGIN BUTTON CLICKED");

  this.loading = true;
  this.error = '';

  console.log("📤 Sending Data:", {
    userId: this.userId,
    userPass: this.userPass
  });

  this.authService.login(this.userId, this.userPass).subscribe({

    next: (res) => {
  this.loading = false;

  console.log("📦 FULL LOGIN RESPONSE:", res);

  if (res.success) {
    console.log("✅ Login Success");

    // ✅ draftId is inside drafts array — take first one
    const firstDraft = res.drafts?.[0];

    localStorage.setItem('agencyToken', res.agencyToken        || '');
    localStorage.setItem('agencyName',  res.agencyName         || '');
    localStorage.setItem('draftId',     firstDraft?.draftId    || '');
    localStorage.setItem('draftName',   firstDraft?.draftName  || '');

    console.log("💾 draftId saved:", firstDraft?.draftId);
    console.log("💾 draftName saved:", firstDraft?.draftName);

    this.router.navigate(['/report-selection']);
  } else {
    this.error = res.message;
  }
},

    error: (err) => {
      this.loading = false;

      console.error("❌ API ERROR:", err);

      if (err.status === 0) {
        console.error("🚫 Backend not reachable (CORS or server down)");
      }

      this.error = err.error?.message || 'Login failed';
    }
  });
}

  goToReports() {
    this.router.navigate(['/report-selection']);
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}