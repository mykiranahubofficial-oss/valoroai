import { Routes } from '@angular/router';
import { WelcomeComponent } from './welcome/welcome/welcome.component';
import { ReportSelectionComponent } from './report-management/report-selection/report-selection.component';
import { ReportCreationComponent } from './report-management/report-creation/report-creation.component';
import { RegisterComponent } from './welcome/register/register.component';
import { ReportPreviewComponent } from './report-management/report-creation/report-preview/report-preview.component';

export const routes = [
  { path: '', component: WelcomeComponent },
  { path: 'report-selection', component: ReportSelectionComponent },
  { path: 'report-creation', component: ReportCreationComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'report-preview', component: ReportPreviewComponent },
];