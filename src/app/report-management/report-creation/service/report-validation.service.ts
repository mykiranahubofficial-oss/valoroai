import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ReportValidationService {

  validateReport(data: any) {

    const errors: string[] = [];

    /* ======================
       BASIC DETAILS
    ====================== */

    if (!data.ownerName) {
      errors.push("Owner Name is required");
    }

    if (!data.propertyLocation) {
      errors.push("Property Location is required");
    }

    if (!data.village) {
      errors.push("Village is required");
    }

    /* ======================
       VISIT DETAILS
    ====================== */

    if (!data.visitDate) {
      errors.push("Visit date is required");
    }

    if (!data.visitorName) {
      errors.push("Visitor name is required");
    }

    /* ======================
       PHOTOS
    ====================== */

    if (!data.photos || data.photos.length === 0) {
      errors.push("At least one property photo is required");
    }

    return {
      valid: errors.length === 0,
      errors
    };

  }

}