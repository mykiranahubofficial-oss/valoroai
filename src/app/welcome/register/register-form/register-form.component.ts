import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RegistrationService } from '../services/registration.service';

import { RegisterForm } from '../model/agency.model';

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register-form.component.html',
  styleUrl: './register-form.component.css'
})
export class RegisterFormComponent {

  form: RegisterForm = {   // ✅ FIXED (was orm)
    agencyName: '',
    ownerName: '',
    address: '',
    mobileNumber: '',
    email: '',
    userId: '',
    userPass: ''
  };

  constructor(private registrationService: RegistrationService) {}

  registerAgency() {

    console.log("📤 Submitting Agency Data");
    console.log(this.form);

    this.registrationService.registerAgency(this.form).subscribe({

      next: (res) => {
        console.log("✅ Agency Created:", res);

        localStorage.setItem('agencyToken', res.agencyToken);
        localStorage.setItem('userId', res.userId);

        alert(res.message);
      },

      error: (err) => {
        console.error("❌ Registration Failed:", err);
        alert(err?.error?.message || "Failed to register agency");
      }

    });

  }

}