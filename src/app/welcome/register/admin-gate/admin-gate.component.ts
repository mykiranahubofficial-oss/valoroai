import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-gate',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-gate.component.html',
  styleUrl: './admin-gate.component.css'
})
export class AdminGateComponent {

  @Output() accessGranted = new EventEmitter<boolean>();
  constructor(private router: Router){}


  password = '';
  error = '';

  private adminPassword = '1111';

  unlock() {

    if (this.password === this.adminPassword) {
      this.accessGranted.emit(true);
    } else {
      this.error = 'Incorrect password';
    }

  }
  goBack(){
  this.router.navigate(['/']);
}
  

}