import { financeReducer, initialState } from './finance.reducer';
import { invoiceActions } from './finance.actions';

describe('financeReducer bulk invoicing', () => {
  it('stores bulk invoicing summary on success', () => {
    const loadingState = financeReducer(
      initialState,
      invoiceActions.bulkInvoiceClass({
        className: 'Form 1A',
        num: 1,
        year: 2026,
      }),
    );

    const next = financeReducer(
      loadingState,
      invoiceActions.bulkInvoiceClassSuccess({
        result: {
          className: 'Form 1A',
          termNum: 1,
          year: 2026,
          termType: 'regular',
          totalStudents: 2,
          successCount: 2,
          failureCount: 0,
          results: [],
        },
      }),
    );

    expect(next.bulkInvoiceLoading).toBe(false);
    expect(next.bulkInvoiceResult?.successCount).toBe(2);
    expect(next.bulkInvoiceResult?.className).toBe('Form 1A');
  });
});
