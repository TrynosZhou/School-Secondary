// Assuming these are globally available or imported from other modules
// For the purpose of this response, I'll define basic structures if not provided directly in the prompt for context.

import { ExemptionType } from '../enums/exemption-type.enum';
// Corrected import path based on typical @ngrx/store usage
import { createSelector } from '@ngrx/store';
import { selectAllInvoices } from './finance.selector';
import { selectTerms } from 'src/app/enrolment/store/enrolment.selectors';
import { InvoiceModel } from '../models/invoice.model';
import { TermsModel } from 'src/app/enrolment/models/terms.model';

// --- Adjusted Models based on your latest input ---

// --- Exemption Report Specific Models ---

// Filters interface for the Exemption Reports - Adjusted studentId to string

export interface ExemptionReportFilters {
  termNum: number | null;
  termYear: number | null;
  exemptionType: ExemptionType | null;
  startDate?: Date | null; // REMOVED
  endDate?: Date | null; // REMOVED
  studentNumber?: string | null; // REMOVED
  enrolId?: number | null; // REMOVED
}

// Data structures for the derived reports - Adjusted studentId to string
export interface ExemptionReportSummaryByType {
  type: ExemptionType;
  totalExempted: number;
  count: number; // How many invoices had this type of exemption
}

export interface ExemptionReportSummaryByStudent {
  studentNumber: string; // Changed from studentId to studentNumber
  studentName: string;
  totalExempted: number;
  invoiceCount: number; // How many invoices for this student had an exemption
}

export interface ExemptionReportSummaryByEnrolment {
  enrolId: number;
  enrolName: string;
  totalExempted: number;
  invoiceCount: number; // How many invoices for this enrolment had an exemption
}

export interface ExemptionReportDetailedItem {
  invoiceId: number;
  invoiceNumber: string;
  invoiceDate: Date;
  studentName: string;
  studentNumber: string; // Ensure this is consistent
  enrolName: string;
  exemptionType: ExemptionType;
  exemptedAmount: number;
  grossBill: number; // Corresponds to InvoiceModel.totalBill
  netBillAfterExemption: number; // totalBill - exemptedAmount
}

// Overall structure of the data returned by the exemption report selector
export interface ExemptionReportData {
  totalExemptedAmount: number;
  summaryByType: ExemptionReportSummaryByType[];
  summaryByStudent: ExemptionReportSummaryByStudent[];
  summaryByEnrolment: ExemptionReportSummaryByEnrolment[];
  detailedExemptions: ExemptionReportDetailedItem[];
}

/**
 * Factory function that returns a memoized selector for financial reports related to exemptions.
 * This selector can generate:
 * 1. Total Exemption Value
 * 2. Exemption Breakdown by Type
 * 3. Exemptions by Student
 * 4. Exemptions by Enrollment/Class
 * 5. Detailed Exemption List
 *
 * @param filters - An object containing criteria to filter the invoices for the report.
 * @returns A memoized selector that returns ExemptionReportData.
 */
export const getExemptionReport = (filters: ExemptionReportFilters) =>
  createSelector(
    selectAllInvoices,
    selectTerms,
    // If you need comprehensive student details not available on `InvoiceModel.student`
    // (e.g., if `InvoiceModel.student` is just a partial object), uncomment and import `selectAllStudents`.
    // selectAllStudents,
    (
      allInvoices: InvoiceModel[] | null,
      allTerms: TermsModel[] | null
      // allStudents: StudentsModel[] | null // Uncomment if selectAllStudents is used
    ): ExemptionReportData => {
      // Initialize report data structure
      const reportData: ExemptionReportData = {
        totalExemptedAmount: 0,
        summaryByType: [],
        summaryByStudent: [],
        summaryByEnrolment: [],
        detailedExemptions: [],
      };

      // Return empty report if no invoices are available
      if (!allInvoices || allInvoices.length === 0) {
        return reportData;
      }

      // Maps for efficient aggregation before converting to arrays
      const summaryByTypeMap = new Map<
        ExemptionType,
        { total: number; count: number }
      >();
      const summaryByStudentMap = new Map<
        string, // Key by studentNumber (string)
        { name: string; number: string; total: number; count: number }
      >();
      const summaryByEnrolmentMap = new Map<
        number,
        { name: string; total: number; count: number }
      >();

      // --- Date/Term Filtering Logic ---
      // --- FIX START ---

      // Ensure reportStartDate is a Date object, if it exists
      let reportStartDate: Date | null = null;
      if (filters.startDate) {
        // Attempt to create a Date object from the filter's startDate
        // If it's already a Date, this will essentially clone it.
        // If it's a string, it will parse it.
        const parsedDate = new Date(filters.startDate);
        // Basic check to ensure it's a valid date after parsing
        if (!isNaN(parsedDate.getTime())) {
          reportStartDate = parsedDate;
        }
      }

      // Ensure reportEndDate is a Date object, if it exists
      let reportEndDate: Date | null = null;
      if (filters.endDate) {
        const parsedDate = new Date(filters.endDate);
        if (!isNaN(parsedDate.getTime())) {
          reportEndDate = parsedDate;
        }
      }

      // Now, you can safely call setHours() as reportStartDate and reportEndDate
      // are guaranteed to be Date objects (or null)
      if (reportStartDate) reportStartDate.setHours(0, 0, 0, 0);
      if (reportEndDate) reportEndDate.setHours(23, 59, 59, 999);

      // --- FIX END ---

      // If a term is selected, apply term-based date filtering
      if (
        filters.termNum !== undefined &&
        filters.termNum !== null &&
        allTerms &&
        allTerms.length > 0
      ) {
        const selectedTerm = allTerms.find(
          (t) =>
            t.num === filters.termNum &&
            // Only filter by year if a specific year is provided in filters
            (filters.termYear === undefined ||
              filters.termYear === null ||
              t.year === filters.termYear)
        );

        if (selectedTerm) {
          // --- FIX START: Explicitly convert to Date objects ---
          const termStartDateRaw = selectedTerm.startDate;
          const termEndDateRaw = selectedTerm.endDate;

          // Convert to Date objects and validate
          const parsedTermStartDate = termStartDateRaw
            ? new Date(termStartDateRaw)
            : null;
          const parsedTermEndDate = termEndDateRaw
            ? new Date(termEndDateRaw)
            : null;

          // Assign if valid Date object, otherwise keep as null
          reportStartDate =
            parsedTermStartDate && !isNaN(parsedTermStartDate.getTime())
              ? parsedTermStartDate
              : null;
          reportEndDate =
            parsedTermEndDate && !isNaN(parsedTermEndDate.getTime())
              ? parsedTermEndDate
              : null;
          // --- FIX END ---
          // TermsModel.startDate and endDate are already Date objects
          // reportStartDate = selectedTerm.startDate || null;
          // reportEndDate = selectedTerm.endDate || null;

          // Set hours to ensure full day range for inclusive date filtering
          if (reportStartDate) reportStartDate.setHours(0, 0, 0, 0);
          if (reportEndDate) reportEndDate.setHours(23, 59, 59, 999);
        }
      }

      // Validate dates after potential term assignment
      if (reportStartDate && isNaN(reportStartDate.getTime())) {
        reportStartDate = null;
      }
      if (reportEndDate && isNaN(reportEndDate.getTime())) {
        reportEndDate = null;
      }

      let filteredInvoices = [...allInvoices]; // Start with a copy of all invoices

      // Apply date filtering
      if (reportStartDate && reportEndDate) {
        const startTimestamp = reportStartDate.getTime();
        const endTimestamp = reportEndDate.getTime();

        filteredInvoices = filteredInvoices.filter((invoice) => {
          const invoiceDate = new Date(invoice.invoiceDate);
          if (isNaN(invoiceDate.getTime())) {
            return false; // Filter out invoices with invalid dates
          }
          const invoiceTime = invoiceDate.getTime();
          // Ensure invoice date falls within the inclusive range
          return invoiceTime >= startTimestamp && invoiceTime <= endTimestamp;
        });
      }

      // --- Exemption-Specific Filtering ---

      // Apply exemption type filter
      if (filters.exemptionType) {
        filteredInvoices = filteredInvoices.filter(
          (invoice) => invoice.exemption?.type === filters.exemptionType
        );
      }

      // Apply student filter by studentNumber
      if (filters.studentNumber) {
        filteredInvoices = filteredInvoices.filter(
          (invoice) => invoice.student?.studentNumber === filters.studentNumber
        );
      }

      // Apply enrolment filter by enrolId
      if (filters.enrolId) {
        filteredInvoices = filteredInvoices.filter(
          (invoice) => invoice.enrol?.id === filters.enrolId
        );
      }

      // --- Core Aggregation Loop ---
      filteredInvoices.forEach((invoice) => {
        // Only process invoices that have a valid exempted amount and an associated exemption
        if (
          invoice.exemptedAmount &&
          invoice.exemptedAmount > 0 &&
          invoice.exemption
        ) {
          const exemptedAmount = Number(invoice.exemptedAmount);

          // 1. Calculate Total Exemption Value
          reportData.totalExemptedAmount += exemptedAmount;

          // 2. Aggregate for Summary by Exemption Type
          const currentType = invoice.exemption.type;
          const typeData = summaryByTypeMap.get(currentType) || {
            total: 0,
            count: 0,
          };
          typeData.total += exemptedAmount;
          typeData.count += 1;
          summaryByTypeMap.set(currentType, typeData);

          // 3. Aggregate for Summary by Student
          if (invoice.student) {
            const studentNumber = invoice.student.studentNumber; // Use studentNumber as key
            const studentData = summaryByStudentMap.get(studentNumber) || {
              name: invoice.student.name,
              number: invoice.student.studentNumber,
              total: 0,
              count: 0,
            };
            studentData.total += exemptedAmount;
            studentData.count += 1;
            summaryByStudentMap.set(studentNumber, studentData);
          }

          // 4. Aggregate for Summary by Enrolment
          if (invoice.enrol) {
            const enrolId = invoice.enrol.id;
            // Ensure enrol.id is defined, if not, fallback to 0 or skip
            if (enrolId !== undefined) {
              const enrolData = summaryByEnrolmentMap.get(enrolId) || {
                name: invoice.enrol.name,
                total: 0,
                count: 0,
              };
              enrolData.total += exemptedAmount;
              enrolData.count += 1;
              summaryByEnrolmentMap.set(enrolId, enrolData);
            }
          }

          // 5. Populate Detailed Exemption List
          reportData.detailedExemptions.push({
            invoiceId: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            invoiceDate: invoice.invoiceDate,
            studentName: invoice.student?.name || 'N/A',
            studentNumber: invoice.student?.studentNumber || 'N/A',
            enrolName: invoice.enrol?.name || 'N/A',
            exemptionType: invoice.exemption.type,
            exemptedAmount: exemptedAmount,
            grossBill: Number(invoice.totalBill),
            netBillAfterExemption: Number(invoice.totalBill) - exemptedAmount,
          });
        }
      });

      // --- Convert Maps to Arrays for Final Report Structure ---
      reportData.summaryByType = Array.from(summaryByTypeMap.entries()).map(
        ([type, data]) => ({
          type,
          totalExempted: data.total,
          count: data.count,
        })
      );
      reportData.summaryByStudent = Array.from(
        summaryByStudentMap.entries()
      ).map(([studentNumber, data]) => ({
        studentNumber: studentNumber, // Corrected to use studentNumber as the identifier
        studentName: data.name,
        totalExempted: data.total,
        invoiceCount: data.count,
      }));
      reportData.summaryByEnrolment = Array.from(
        summaryByEnrolmentMap.entries()
      ).map(([id, data]) => ({
        enrolId: id,
        enrolName: data.name,
        totalExempted: data.total,
        invoiceCount: data.count,
      }));

      return reportData;
    }
  );
