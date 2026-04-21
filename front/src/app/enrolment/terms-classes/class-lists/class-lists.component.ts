import {
  Component,
  OnInit,
  ViewChild,
  OnDestroy,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TermsModel } from '../../models/terms.model';
import { Store } from '@ngrx/store';
import { Subject, combineLatest, debounceTime, distinctUntilChanged, startWith } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import {
  selectClasses,
  selectEnrols,
  selectTerms,
  selectEnrolErrorMsg,
} from '../../store/enrolment.selectors';
import { Title } from '@angular/platform-browser';
import { getEnrolmentByClass } from '../../store/enrolment.actions';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { EnrolsModel } from '../../models/enrols.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { formatTermLabel } from '../../models/term-label.util';

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
  selector: 'app-class-lists',
  templateUrl: './class-lists.component.html',
  styleUrls: ['./class-lists.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClassListsComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor(
    private store: Store, 
    public title: Title,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) {
    this.dataSource.filterPredicate = this.customFilterPredicate;
  }

  classes$ = this.store.select(selectClasses);
  terms$ = this.store.select(selectTerms);
  enrols$ = this.store.select(selectEnrols);
  errorMsg$ = this.store.select(selectEnrolErrorMsg);
  
  classForm!: FormGroup;
  searchControl = new FormControl('');
  searchSubject = new Subject<string>();
  
  isLoading = false;
  hasData = false;
  selectedClassName = '';
  selectedTermName = '';

  public totalBoys = 0;
  public totalGirls = 0;
  public totalBoarders = 0;
  public totalDayScholars = 0;
  public totalStudents = 0;

  public dataSource = new MatTableDataSource<EnrolsModel>();
  displayedColumns: string[] = [
    'index',
    'studentNumber',
    'surname',
    'name',
    'gender',
    'residence',
  ];

  // Subject to signal component destruction
  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.initializeForm();
    this.setupObservables();
    this.setupSearch();
  }

  private initializeForm(): void {
    this.classForm = new FormGroup({
      term: new FormControl('', Validators.required),
      clas: new FormControl('', Validators.required),
    });
  }

  private setupObservables(): void {
    // Handle enrollment data
    this.enrols$
      .pipe(takeUntil(this.destroy$))
      .subscribe((enrols) => {
        this.dataSource.data = enrols;
        this.hasData = enrols.length > 0;
        this.calculateSummary(enrols);
        this.cdr.markForCheck();
      });

    // Handle error messages
    this.errorMsg$
      .pipe(takeUntil(this.destroy$))
      .subscribe((errorMsg) => {
        if (errorMsg) {
          this.snackBar.open(errorMsg, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  private setupSearch(): void {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((searchTerm) => {
        this.dataSource.filter = searchTerm.trim().toLowerCase();
        if (this.dataSource.paginator) {
          this.dataSource.paginator.firstPage();
        }
      });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    // Added this lifecycle hook
    this.destroy$.next(); // Emit a value to complete the destroy$ subject
    this.destroy$.complete(); // Complete the subject to ensure it's closed
  }

  get clas() {
    return this.classForm.get('clas');
  }

  get term() {
    return this.classForm.get('term');
  }

  fetchClassList() {
    if (this.classForm.invalid) {
      this.classForm.markAllAsTouched();
      this.snackBar.open('Please select both term and class', 'Close', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
      return;
    }

    this.isLoading = true;
    this.cdr.markForCheck();

    const name = this.clas?.value;
    const term: TermsModel = this.term?.value;

    this.selectedClassName = name;
    this.selectedTermName = formatTermLabel(term);

    const num = term.num;
    const year = term.year;
    const termId = term.id;

    this.store.dispatch(getEnrolmentByClass({ name, num, year, termId }));
    
    // Reset loading state after a short delay
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.markForCheck();
    }, 1000);
  }

  onSearchChange(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.searchSubject.next(searchTerm);
  }

  clearSearch(): void {
    this.searchControl.setValue('');
    this.searchSubject.next('');
  }

  customFilterPredicate = (data: EnrolsModel, filter: string): boolean => {
    const searchString = filter.trim().toLowerCase();

    const dataStr = (
      data.student.studentNumber +
      data.student.surname +
      data.student.name +
      data.student.gender +
      (data.residence || '')
    ).toLowerCase();

    return dataStr.includes(searchString);
  };

  private calculateSummary(enrols: EnrolsModel[]): void {
    this.totalBoys = enrols.filter(
      (enrol) => enrol.student.gender === 'Male'
    ).length;
    this.totalGirls = enrols.filter(
      (enrol) => enrol.student.gender === 'Female'
    ).length;
    this.totalBoarders = enrols.filter(
      (enrol) => enrol.residence === 'Boarder'
    ).length;
    this.totalDayScholars = enrols.filter(
      (enrol) => enrol.residence === 'Day'
    ).length;
    this.totalStudents = enrols.length;
  }

  trackByEnrolId(index: number, enrol: EnrolsModel): string {
    return enrol.student.studentNumber;
  }

  getGenderIcon(gender: string): string {
    return gender === 'Male' ? 'male' : 'female';
  }

  getResidenceIcon(residence: string): string {
    return residence === 'Boarder' ? 'hotel' : 'home';
  }

  getGenderColor(gender: string): string {
    return gender === 'Male' ? 'primary' : 'warn';
  }

  getResidenceColor(residence: string): string {
    return residence === 'Boarder' ? 'accent' : 'primary';
  }

  formatTerm(term: TermsModel): string {
    return formatTermLabel(term);
  }

  downloadPDF(): void {
    // Check if there is data to export
    if (!this.dataSource.data || this.dataSource.data.length === 0) {
      this.snackBar.open('No class list data to download. Please fetch a class list first.', 'Close', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
      return;
    }

    const doc = new jsPDF() as any; // Cast jsPDF to any to access autoTable

    // Define the columns for the PDF table
    const head = [['#', 'Student Number', 'Surname', 'Name', 'Gender', 'Residence']];

    // Map your data to the format required by autoTable
    const body = this.dataSource.data.map((enrol, index) => [
      index + 1,
      enrol.student.studentNumber,
      enrol.student.surname,
      enrol.student.name,
      enrol.student.gender,
      enrol.residence,
    ]);

    // Add a title to the document
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    const title = `Class List - ${this.selectedClassName}`;
    doc.text(title, 14, 20);

    // Add subtitle with term info
    doc.setFontSize(14);
    doc.setFont(undefined, 'normal');
    doc.text(this.selectedTermName, 14, 30);

    // Add the summary to the PDF
    doc.setFontSize(12);
    const summaryText = `Total Students: ${this.totalStudents} | Boys: ${this.totalBoys} | Girls: ${this.totalGirls} | Boarders: ${this.totalBoarders} | Day Scholars: ${this.totalDayScholars}`;
    doc.text(summaryText, 14, 40);

    // Add generation date
    const currentDate = new Date().toLocaleDateString();
    doc.setFontSize(10);
    doc.text(`Generated on: ${currentDate}`, 14, 50);

    // This is the core autoTable call
    doc.autoTable({
      head: head,
      body: body,
      startY: 60, // Start the table below the title and summary
      theme: 'striped',
      headStyles: {
        fillColor: [63, 81, 181],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 12,
      },
      bodyStyles: {
        fontSize: 10,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      styles: {
        cellPadding: 4,
        fontSize: 10,
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      columnStyles: {
        0: { cellWidth: 15 }, // Index column
        1: { cellWidth: 30 }, // Student Number
        2: { cellWidth: 35 }, // Surname
        3: { cellWidth: 35 }, // Name
        4: { cellWidth: 25 }, // Gender
        5: { cellWidth: 30 }, // Residence
      },
    });

    // Generate a filename and save the PDF
    const termValue = this.term?.value;
    const termName = termValue
      ? `Term_${termValue.num}_${termValue.year}`
      : 'Current_Term';
    const className = this.selectedClassName || 'Class_List';

    const fileName = `${className.replace(/\s+/g, '_')}_${termName}.pdf`;
    doc.save(fileName);

    this.snackBar.open('Class list PDF downloaded successfully!', 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }
}
