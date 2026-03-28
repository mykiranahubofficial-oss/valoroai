import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class VisitDataService {

  private visitData = new BehaviorSubject<any>(null);
  visitData$ = this.visitData.asObservable();

  setVisitData(data:any){
    this.visitData.next(data);
  }

}