import { Component, OnInit, ElementRef, ViewChild, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ClassesModel } from 'src/app/enrolment/models/classes.model';
import { TermsModel } from 'src/app/enrolment/models/terms.model';
import {
  fetchClasses,
  fetchTerms,
} from 'src/app/enrolment/store/enrolment.actions';
import {
  selectClasses,
  selectTerms,
} from 'src/app/enrolment/store/enrolment.selectors';
import { markSheetActions } from './store/actions';
import { selectIsLoading, selectMarkSheet } from './store/selectors';
import { ReportsModel } from 'src/app/reports/models/reports.model';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { SubjectsModel } from '../models/subjects.model';
import { SubjectInfoModel } from 'src/app/reports/models/subject-info.model';
import { ExamType } from '../models/examtype.enum';
import { MatSnackBar } from '@angular/material/snack-bar';

// ADDED: Import jsPDF and html2canvas
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// NEW: Import jspdf-autotable as a module
import { applyPlugin } from 'jspdf-autotable';

// IMPORTANT: Apply the plugin to the jsPDF object
applyPlugin(jsPDF);

// This is the custom interface that extends jsPDF and adds the autoTable method.
interface jsPDFWithPlugin extends jsPDF {
  autoTable: any;
}

@Component({
  selector: 'app-marks-sheets',
  templateUrl: './marks-sheets.component.html',
  styleUrls: ['./marks-sheets.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarksSheetsComponent implements OnInit, OnDestroy {
  @ViewChild('pdfReportContainer') pdfReportContainer!: ElementRef;
  @ViewChild('pdfHeader') pdfHeader!: ElementRef;
  @ViewChild('marksheetTable') marksheetTable!: ElementRef;
  @ViewChild('tableHeaderRow') tableHeaderRow!: ElementRef;

  markSheetForm!: FormGroup;
  terms$!: Observable<TermsModel[]>;
  classes$!: Observable<ClassesModel[]>;
  isLoading$!: Observable<boolean>;
  markSheet$!: Observable<ReportsModel[]>;
  reports!: ReportsModel[];
  subjects: SubjectsModel[] = [];
  examtype: ExamType[] = [ExamType.midterm, ExamType.endofterm];
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private dialog: MatDialog,
    public title: Title,
    private snackBar: MatSnackBar
  ) {
    this.store.dispatch(fetchTerms());
    this.store.dispatch(fetchClasses());
  }

  ngOnInit(): void {
    this.classes$ = this.store.select(selectClasses);
    this.terms$ = this.store.select(selectTerms);
    this.isLoading$ = this.store.select(selectIsLoading);

    // Process reports with proper subscription management
    this.store.select(selectMarkSheet)
      .pipe(takeUntil(this.destroy$))
      .subscribe((reps) => {
      const modifiedReports: ReportsModel[] = [];
      const subjectsArr: SubjectsModel[] = [];

      // First, find all unique subjects across all reports
      reps.forEach((rep) => {
        rep.report.subjectsTable.forEach((subj) => {
          const code = subj.subjectCode;
          const name = subj.subjectName;
          const newSubj = { code, name };
          const found = subjectsArr.find((sbj) => sbj.code === newSubj.code);
          if (!found) {
            subjectsArr.push(newSubj);
          }
        });
      });
      subjectsArr.sort((a, b) => +a.code - +b.code);
      this.subjects = [...subjectsArr];

      // Second, pad the subjectsTable for each report to a consistent length
      reps.map((rep) => {
        const newSubjectsTable = Array<SubjectInfoModel>(this.subjects.length); // Initialize with a fixed length
        rep.report.subjectsTable.map((subjInfo) => {
          const code = subjInfo.subjectCode;
          const name = subjInfo.subjectName;
          const subjPosInSubjsArr = this.subjects.findIndex(
            (sbj) => sbj.code === code && sbj.name === name
          );
          // Place subject info at its correct, fixed position
          newSubjectsTable[subjPosInSubjsArr] = subjInfo;
        });

        const newReport: ReportsModel = {
          ...rep,
          report: {
            ...rep.report,
            subjectsTable: newSubjectsTable, // All tables now have the same length
          },
        };
        modifiedReports.push(newReport);
      });

      this.reports = [...modifiedReports];
      console.log('Reports data loaded:', this.reports.length, 'reports');
    });

    this.markSheetForm = new FormGroup({
      term: new FormControl('', [Validators.required]),
      clas: new FormControl('', [Validators.required]),
      examType: new FormControl('', [Validators.required]),
    });
  }

  get term() {
    return this.markSheetForm.get('term');
  }

  get clas() {
    return this.markSheetForm.get('clas');
  }

  get examType() {
    return this.markSheetForm.get('examType');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchMarkSheet() {
    if (this.markSheetForm.invalid) {
      this.snackBar.open(
        'Please select Term, Class, and Exam Type to generate mark sheet.',
        'Close',
        { duration: 3000, panelClass: ['warning-snackbar'] }
      );
      this.markSheetForm.markAllAsTouched();
      return;
    }

    const name = this.clas?.value;
    const term: TermsModel = this.term?.value;
    const num = term.num;
    const year = term.year;
    const examType = this.examType?.value;

    this.store.dispatch(
      markSheetActions.fetchMarkSheet({ name, num, year, examType })
    );

    this.snackBar.open(
      `Generating mark sheet for ${name} - Term ${num} ${year} (${examType})`,
      'Dismiss',
      { duration: 2000, panelClass: ['info-snackbar'] }
    );
  }

  // You can keep the printDocument() as a fallback for users who prefer it.
  printDocument(): void {
    console.log('Print button clicked. Triggering browser print dialog.');
    window.print();
  }

  // UPDATED: The new downloadPDF method using jspdf-autotable with HTML
  downloadPDF(): void {
    if (!this.marksheetTable || !this.reports.length) {
      this.snackBar.open('No mark sheet data available to download.', 'Dismiss', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    try {
      // Cast jsPDF to any to access the autoTable method
      const doc = new jsPDF('l', 'mm', 'a4') as any;
      const header = this.pdfHeader.nativeElement;

      // First, use html2canvas to generate the header image only once
      html2canvas(header, { scale: 2 }).then((canvas) => {
        const headerImgData = canvas.toDataURL('image/png');
        const headerHeight =
          (canvas.height * doc.internal.pageSize.getWidth()) / canvas.width;

        // Add the header to the first page only
        doc.addImage(
          headerImgData,
          'PNG',
          0,
          0,
          doc.internal.pageSize.getWidth(),
          headerHeight
        );

        // Define the table headers
        const tableHeaders = [
          '#',
          'Student Name',
          ...this.subjects.map((s) => s.name.substring(0, 9)),
          'Passed',
          'A*s',
          'As',
          'Bs',
          'Cs',
          'Ds',
          'Av Mark',
          'Position',
        ];

        // Define the table body data, applying styles for color
        const tableBody = this.reports.map((rep, index) => {
          const studentName = `${rep.report.name} ${rep.report.surname}`;
          const rowData = [
            { content: index + 1, styles: {} },
            { content: studentName, styles: { halign: 'left' } },
            ...rep.report.subjectsTable.map((subjInfo) => {
              const mark = subjInfo ? subjInfo.mark : '';
              const styles =
                mark && mark >= 50
                  ? { textColor: [0, 0, 255] } // Blue for passing marks
                  : mark && mark < 50
                  ? { textColor: [255, 0, 0] } // Red for failing marks
                  : {};
              return { content: mark, styles: styles };
            }),
            { content: rep.report.subjectsPassed, styles: {} },
            { content: rep.report.symbols[0], styles: {} },
            { content: rep.report.symbols[1], styles: {} },
            { content: rep.report.symbols[2], styles: {} },
            { content: rep.report.symbols[3], styles: {} },
            { content: rep.report.symbols[4], styles: {} },
            {
              content: rep.report.percentageAverge
                ? rep.report.percentageAverge.toFixed(1)
                : '',
              styles: {},
            },
            { content: rep.report.classPosition, styles: {} },
          ];
          return rowData;
        });

        // This is the core autoTable call
        doc.autoTable({
          head: [tableHeaders],
          body: tableBody,
          // Start the table at the correct position after the header
          startY: headerHeight + 5,
          theme: 'grid',
          styles: {
            fontSize: 7,
            cellPadding: 2,
            halign: 'center',
            valign: 'middle',
          },
          headStyles: {
            fillColor: [240, 240, 240],
            textColor: 50,
            fontStyle: 'bold',
          },
          rowPageBreak: 'avoid',
        });

        const fileName = `${this.reports[0].name}_Marksheet_Term_${this.reports[0].num}_${this.reports[0].year}_${this.reports[0].examType}.pdf`;
        doc.save(fileName);

        this.snackBar.open('Mark sheet downloaded successfully!', 'Dismiss', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }).catch((error) => {
        console.error('Error generating PDF:', error);
        this.snackBar.open('Failed to generate PDF. Please try again.', 'Dismiss', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      });
    } catch (error) {
      console.error('Error in downloadPDF:', error);
      this.snackBar.open('Failed to download PDF. Please try again.', 'Dismiss', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }
}
