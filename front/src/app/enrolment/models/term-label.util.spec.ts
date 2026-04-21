import { formatTermLabel } from './term-label.util';
import { TermsModel } from './terms.model';

describe('formatTermLabel', () => {
  it('formats regular terms with default label', () => {
    const term: TermsModel = {
      num: 1,
      year: 2026,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-04-01'),
      type: 'regular',
    };

    expect(formatTermLabel(term)).toBe('Term 1 - 2026');
  });

  it('formats vacation terms with custom label', () => {
    const term: TermsModel = {
      num: 2,
      year: 2026,
      startDate: new Date('2026-04-15'),
      endDate: new Date('2026-05-15'),
      type: 'vacation',
      label: 'April Holiday School',
    };

    expect(formatTermLabel(term)).toBe('Vacation: April Holiday School (2026)');
  });
});

