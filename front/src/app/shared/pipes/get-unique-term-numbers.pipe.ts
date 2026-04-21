import { Pipe, PipeTransform } from '@angular/core';
import { TermsModel } from 'src/app/enrolment/models/terms.model'; // Adjust path to your TermsModel

@Pipe({
  name: 'getUniqueTermNumbers',
})
export class GetUniqueTermNumbersPipe implements PipeTransform {
  transform(terms: TermsModel[] | null): number[] {
    if (!terms) {
      return [];
    }
    // Extract all term numbers, create a Set to get unique values, then convert back to array and sort
    return [...new Set(terms.map((t) => t.num))].sort((a, b) => a - b);
  }
}
