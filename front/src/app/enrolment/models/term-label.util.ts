import { TermsModel } from './terms.model';

export function formatTermLabel(term: TermsModel): string {
  if ((term.type || 'regular') === 'vacation') {
    if (term.label && term.label.trim().length > 0) {
      return `Vacation: ${term.label.trim()} (${term.year})`;
    }
    return `Vacation ${term.num} - ${term.year}`;
  }
  return `Term ${term.num} - ${term.year}`;
}

