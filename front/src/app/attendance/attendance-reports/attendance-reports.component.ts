import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, Subject, firstValueFrom, combineLatest } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import jsPDF from 'jspdf';
import { applyPlugin } from 'jspdf-autotable';

// Apply the plugin to jsPDF
applyPlugin(jsPDF);
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
import { attendanceActions } from '../store/attendance.actions';
import { 
  selectAttendanceReports, 
  selectAttendanceSummary, 
  selectAttendanceLoading, 
  selectAttendanceError 
} from '../store/attendance.selectors';
import { AttendanceReport, AttendanceSummary } from '../services/attendance.service';

@Component({
  selector: 'app-attendance-reports',
  templateUrl: './attendance-reports.component.html',
  styleUrls: ['./attendance-reports.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AttendanceReportsComponent implements OnInit, OnDestroy {
  terms$!: Observable<TermsModel[]>;
  classes$!: Observable<ClassesModel[]>;
  reportsForm!: FormGroup;
  attendanceReports$!: Observable<AttendanceReport | null>;
  attendanceSummary$!: Observable<AttendanceSummary | null>;
  isLoading$!: Observable<boolean>;
  errorMsg$!: Observable<string>;
  
  destroy$ = new Subject<void>();

  constructor(
    public title: Title,
    private store: Store,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    this.store.dispatch(fetchClasses());
    this.store.dispatch(fetchTerms());
  }

  ngOnInit(): void {
    this.initializeForm();
    this.setupObservables();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.reportsForm = new FormGroup({
      term: new FormControl('', [Validators.required]),
      clas: new FormControl('', [Validators.required]),
    });
  }

  private setupObservables(): void {
    this.classes$ = this.store.select(selectClasses);
    this.terms$ = this.store.select(selectTerms);
    this.attendanceReports$ = this.store.select(selectAttendanceReports);
    this.attendanceSummary$ = this.store.select(selectAttendanceSummary);
    this.isLoading$ = this.store.select(selectAttendanceLoading);
    this.errorMsg$ = this.store.select(selectAttendanceError);

    // Handle error messages
    this.errorMsg$.pipe(
      takeUntil(this.destroy$),
      tap(errorMsg => {
        if (errorMsg) {
          this.snackBar.open(errorMsg, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      })
    ).subscribe();
  }

  get term() {
    return this.reportsForm.get('term');
  }

  get clas() {
    return this.reportsForm.get('clas');
  }

  generateReports(): void {
    if (this.reportsForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const name = this.clas?.value;
    const term: TermsModel = this.term?.value;
    const num = term.num;
    const year = term.year;

    // Use term's startDate and endDate
    const startDate = term.startDate ? new Date(term.startDate).toISOString().split('T')[0] : undefined;
    const endDate = term.endDate ? new Date(term.endDate).toISOString().split('T')[0] : undefined;

    // Generate both reports and summary
    this.store.dispatch(
      attendanceActions.getAttendanceReports({
        className: name,
        termNum: num,
        year,
        startDate,
        endDate
      })
    );

    this.store.dispatch(
      attendanceActions.getAttendanceSummary({
        className: name,
        termNum: num,
        year
      })
    );
  }

  private markFormGroupTouched(): void {
    Object.keys(this.reportsForm.controls).forEach(key => {
      const control = this.reportsForm.get(key);
      control?.markAsTouched();
    });
  }

  getFormErrorMessage(controlName: string): string {
    const control = this.reportsForm.get(controlName);
    if (control?.hasError('required')) {
      return `${this.getFieldDisplayName(controlName)} is required`;
    }
    return '';
  }

  private getFieldDisplayName(controlName: string): string {
    const fieldNames: { [key: string]: string } = {
      term: 'Term',
      clas: 'Class'
    };
    return fieldNames[controlName] || controlName;
  }

  getSortedDates(reports: AttendanceReport | null): string[] {
    if (!reports) return [];
    return Object.keys(reports).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }

  getAttendanceStatusIcon(present: boolean): string {
    return present ? 'check_circle' : 'cancel';
  }

  getAttendanceStatusColor(present: boolean): string {
    return present ? 'present' : 'absent';
  }

  getAttendanceStatusText(present: boolean): string {
    return present ? 'Present' : 'Absent';
  }

  getGenderIcon(gender: string): string {
    return gender?.toLowerCase() === 'male' ? 'male' : 'female';
  }

  getGenderColor(gender: string): string {
    return gender?.toLowerCase() === 'male' ? 'male' : 'female';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  calculateAttendanceRate(summary: AttendanceSummary | null): number {
    if (!summary || summary.totalRecords === 0) return 0;
    return Math.round((summary.presentCount / summary.totalRecords) * 100);
  }

  async exportToPDF(): Promise<void> {
    // Get current reports and summary asynchronously
    const [reports, summary] = await firstValueFrom(
      combineLatest([this.attendanceReports$, this.attendanceSummary$])
    );

    if (!reports || Object.keys(reports).length === 0) {
      this.snackBar.open('No reports available to export. Please generate reports first.', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    // Get class and term info
    const className = this.clas?.value || 'Unknown Class';
    const term: TermsModel | null = this.term?.value;
    const termInfo = term ? `Term ${term.num}, ${term.year}` : '';

    // Create PDF (cast to any to access autoTable method)
    const doc = new jsPDF('landscape', 'mm', 'a4') as any;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPosition = margin;

    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Attendance Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Class: ${className}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 6;
    doc.text(termInfo, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 6;

    // Summary section
    if (summary) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Summary', margin, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const summaryData = [
        ['Total Records', summary.totalRecords.toString()],
        ['Present', summary.presentCount.toString()],
        ['Absent', summary.absentCount.toString()],
        ['Attendance Rate', `${this.calculateAttendanceRate(summary)}%`]
      ];

      doc.autoTable({
        startY: yPosition,
        head: [['Metric', 'Value']],
        body: summaryData,
        theme: 'grid',
        headStyles: { fillColor: [66, 139, 202], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 10 },
        margin: { left: margin, right: margin },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 10;
    }

    // Attendance records by date
    const sortedDates = this.getSortedDates(reports);
    
    sortedDates.forEach((date, dateIndex) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = margin;
      }

      const records = reports![date];
      const formattedDate = this.formatDate(date);

      // Date header
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(formattedDate, margin, yPosition);
      yPosition += 8;

      // Prepare table data
      const tableData = records.map((record, index) => [
        (index + 1).toString(),
        record.studentNumber || '',
        record.surname || '',
        record.name || '',
        record.gender || '',
        record.present ? 'Present' : 'Absent'
      ]);

      // Create table
      doc.autoTable({
        startY: yPosition,
        head: [['#', 'Student Number', 'Surname', 'Name', 'Gender', 'Status']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [66, 139, 202], textColor: 255, fontStyle: 'bold' },
        bodyStyles: { fontSize: 9 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        columnStyles: {
          0: { cellWidth: 15 }, // #
          1: { cellWidth: 40 }, // Student Number
          2: { cellWidth: 50 }, // Surname
          3: { cellWidth: 50 }, // Name
          4: { cellWidth: 30 }, // Gender
          5: { cellWidth: 35 } // Status
        },
        margin: { left: margin, right: margin },
        didParseCell: (data: any) => {
          // Color code status column
          if (data.column.index === 5) {
            if (data.cell.text[0] === 'Present') {
              data.cell.styles.fillColor = [76, 175, 80];
              data.cell.styles.textColor = 255;
            } else if (data.cell.text[0] === 'Absent') {
              data.cell.styles.fillColor = [244, 67, 54];
              data.cell.styles.textColor = 255;
            }
          }
        }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 10;
    });

    // Footer
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Page ${i} of ${totalPages} | Generated on ${new Date().toLocaleDateString()}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    // Generate filename
    const fileName = `Attendance_Report_${className}_${termInfo.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;

    // Save PDF
    doc.save(fileName);

    this.snackBar.open('PDF exported successfully', 'Close', {
      duration: 2000,
      panelClass: ['success-snackbar']
    });
  }
}

