import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminGateComponent } from './admin-gate/admin-gate.component';
import { RegisterFormComponent } from './register-form/register-form.component';
import { AgenciesComponent } from './agencies/agencies.component';
import { PhotoSlotsComponent } from './photo-slots/photo-slots.component';   // ✅ NEW

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, AdminGateComponent,PhotoSlotsComponent, RegisterFormComponent, AgenciesComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  unlocked = false;

  activeTab: 'register' | 'agencies' |'photo-slots' = 'register';

  handleAccess(event: boolean) {
    this.unlocked = event;
  }

switchTab(tab: 'register' | 'agencies' | 'photo-slots'){
    this.activeTab = tab;
  }

}