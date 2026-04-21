import {
  AfterViewInit,
  Component,
  Inject,
  OnInit,
  ViewChild,
  OnDestroy, // Import OnDestroy
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EnrolsModel } from '../../models/enrols.model';
import { StudentsModel } from 'src/app/registration/models/students.model';
import { Store } from '@ngrx/store';
import * as registrationActions from '../../../registration/store/registration.actions';
import { selectStudents } from 'src/app/registration/store/registration.selectors';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { enrolStudents } from '../../store/enrolment.actions';
import { Subject, combineLatest } from 'rxjs'; // Import Subject and combineLatest
import { takeUntil, filter as rxFilter } from 'rxjs/operators'; // Import takeUntil and rename filter to rxFilter
import { selectEnrols } from '../../store/enrolment.selectors';
import { Residence } from '../../models/residence.enum';

@Component({
  selector: 'app-enrol-student',
  templateUrl: './enrol-student.component.html',
  styleUrls: ['./enrol-student.component.css'],
})
export class EnrolStudentComponent implements OnInit, AfterViewInit, OnDestroy {
  // Implement OnDestroy
  studentsToEnrol: StudentsModel[] = []; // Holds students selected for enrollment
  enrols: EnrolsModel[] = []; // Stores currently enrolled students from the store

  public dataSource = new MatTableDataSource<StudentsModel>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns = ['studentNumber', 'surname', 'name', 'gender', 'action'];

  private destroy$ = new Subject<void>(); // For managing subscriptions

  constructor(
    private store: Store,
    private dialogRef: MatDialogRef<EnrolStudentComponent>,
    @Inject(MAT_DIALOG_DATA)
    private data: { name: string; num: number; year: number }
  ) {
    this.store.dispatch(registrationActions.fetchStudents());
    // Set the custom filter predicate in the constructor
    this.dataSource.filterPredicate = this.customFilterPredicate;
  }

  ngOnInit(): void {
    // Combine both student and enrolments observables to filter students
    combineLatest([
      this.store.select(selectEnrols),
      this.store.select(selectStudents),
    ])
      .pipe(takeUntil(this.destroy$)) // Unsubscribe when component is destroyed
      .subscribe(([enrols, allStudents]) => {
        this.enrols = enrols; // Store current enrolments

        // Filter out students who are already enrolled in the current class/term combination
        // Note: This logic assumes 'enrols' from store is specifically for the current class/term.
        // If selectEnrols returns all enrolments, you might need to filter by class/term too.
        this.dataSource.data = allStudents.filter((student) => {
          return !this.enrols.some(
            (enrol) => enrol.student.studentNumber === student.studentNumber
          );
        });
      });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.destroy$.next(); // Signal to unsubscribe
    this.destroy$.complete(); // Complete the subject
  }

  /**
   * Adds a student to the temporary list of students to be enrolled.
   * Removes the student from the main table.
   * @param student The student to add.
   */
  addToEnrolList(student: StudentsModel) {
    this.studentsToEnrol.push(student);
    // Update dataSource by filtering out the added student
    this.dataSource.data = this.dataSource.data.filter(
      (st) => st.studentNumber !== student.studentNumber
    );
    // Important: Reapply filter and sort after modifying dataSource.data
    this.applyFilter(null); // Pass null or a dummy event if applyFilter doesn't need it
  }

  /**
   * Removes a student from the temporary list of students to be enrolled.
   * Adds the student back to the main table.
   * @param student The student to remove.
   */
  removeFromEnrolList(student: StudentsModel) {
    this.studentsToEnrol = this.studentsToEnrol.filter(
      (st) => st.studentNumber !== student.studentNumber
    );
    // Add student back to dataSource, and re-sort/filter if needed
    // Using unshift to add to the beginning, but sort/filter will reorder
    this.dataSource.data = [student, ...this.dataSource.data];
    // Important: Reapply filter and sort after modifying dataSource.data
    this.applyFilter(null); // Pass null or a dummy event
  }

  /**
   * Custom filter predicate for MatTableDataSource to search within StudentsModel properties.
   * Filters by student number, surname, name, gender.
   * @param data The StudentsModel object for the current row.
   * @param filter The filter string entered by the user.
   * @returns True if the row matches the filter, false otherwise.
   */
  customFilterPredicate = (data: StudentsModel, filter: string): boolean => {
    const searchString = filter.trim().toLowerCase();

    // Concatenate all relevant string fields from StudentsModel
    const dataStr = (
      data.studentNumber +
      data.surname +
      data.name +
      data.gender
    )
      // data.residence can also be added if needed, but it's optional in model
      // + (data.residence || '')
      .toLowerCase();

    return dataStr.includes(searchString);
  };

  /**
   * Applies the filter to the MatTableDataSource.
   * @param event The keyup event from the filter input, or null/dummy for programmatic calls.
   */
  applyFilter(event: Event | null) {
    // Allow null for programmatic calls
    const filterValue = event
      ? (event.target as HTMLInputElement).value
      : this.dataSource.filter;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /**
   * Closes the dialog without enrolling any students.
   */
  closeDialog() {
    this.dialogRef.close();
  }

  /**
   * Dispatches the action to enrol the selected students.
   */
  enrolStudents() {
    const enrolsToDispatch: EnrolsModel[] = [];

    // Map the selected students into EnrolsModel objects
    if (this.studentsToEnrol.length > 0) {
      this.studentsToEnrol.forEach((student) => {
        // Ensure residence is handled. If it's always Boarder, then fine.
        // If it should come from the student model, use student.residence.
        const enrol: EnrolsModel = {
          student,
          name: this.data.name, // class name
          num: this.data.num, // term number
          year: this.data.year, // term year
          residence: Residence.Boarder, // Use student's residence if available, else default
          // id: '', // id should typically be generated by backend
        };
        enrolsToDispatch.push(enrol);
      });

      this.store.dispatch(enrolStudents({ enrols: enrolsToDispatch }));
      this.dialogRef.close(); // Close dialog after dispatching enrol action
    }
    // Optional: Add a snackbar/toast if no students are selected for enrolment
  }
}
