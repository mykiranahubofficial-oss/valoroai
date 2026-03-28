import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'slotsByPage', standalone: true })
export class SlotsByPagePipe implements PipeTransform {
  transform(slots: any[], page: number): any[] {
    return (slots ?? []).filter(s => s.pageNumber === page);
  }
}