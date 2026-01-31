import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nameLetters',
})
export class NameLettersPipe implements PipeTransform {
  transform(name: string | undefined): string {
    if (!name) return '';
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .slice(0, 2);
  }
}
