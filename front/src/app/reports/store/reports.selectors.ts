import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromReportsReducer from './reports.reducer';
import { StudentsModel } from 'src/app/registration/models/students.model';
import { ReportsModel } from '../models/reports.model';

export const reportsState =
  createFeatureSelector<fromReportsReducer.State>('reports');

export const selectReports = createSelector(
  reportsState,
  (state: fromReportsReducer.State) => state.reports
);

export const selectReportsErrorMsg = createSelector(
  reportsState,
  (state: fromReportsReducer.State) => state.errorMessage
);

export const selectIsLoading = createSelector(
  reportsState,
  (state: fromReportsReducer.State) => state.isLoading
);

export const selectReportsLoaded = createSelector(
  reportsState,
  (state: fromReportsReducer.State) => state.isLoaded
);

export const selectReportsGenerated = createSelector(
  reportsState,
  (state: fromReportsReducer.State) => state.reportsGenerated
);

export const selectStudentReports = createSelector(
  reportsState,
  (state: fromReportsReducer.State) => state.studentReports
);

export const selectSelectedReport = createSelector(
  reportsState,
  (state: fromReportsReducer.State) => state.selectedReport
);

// ---------- Results Analysis Selectors -------------//

// --- Interfaces for processed data (copied from component for clarity) ---
interface OverallAnalysisData {
  subjectPassRates: { subjectName: string; passRate: number }[];
  top5StudentsOverall: { student: StudentsModel; averageMark: number }[];
  bottom5StudentsOverall: { student: StudentsModel; averageMark: number }[];
  uniqueSubjects: { code: string; name: string }[];
  reportsRaw: ReportsModel[];
}

interface SubjectAnalysisData {
  bestStudents: { student: StudentsModel; mark: number; grade: string }[]; // Changed 'mark' to 'averageMark' in concept
  worstStudents: { student: StudentsModel; mark: number; grade: string }[]; // Changed 'mark' to 'averageMark' in concept
  gradeDistribution: { grade: string; count: number }[];
}

interface StudentPerformanceDisplayData {
  student: StudentsModel;
  chartData: any;
}
// --- END Interfaces ---

// =======================================================================
//                       HELPER FUNCTIONS (PRIVATE TO SELECTORS)
// =======================================================================

/**
 * Helper function to compute grades based on mark and class form.
 * This logic is replicated from your backend for frontend consistency.
 * @param mark The student's mark.
 * @param clasName The class name (e.g., '1 Blue', '5 Red').
 * @returns The computed grade as a string.
 */
function computeGrade(mark: number, clasName: string): string {
  const form = clasName.charAt(0);

  switch (form) {
    case '5':
    case '6': {
      if (mark >= 90) return 'A*';
      else if (mark >= 75) return 'A';
      else if (mark >= 65) return 'B';
      else if (mark >= 50) return 'C';
      else if (mark >= 40) return 'D';
      else if (mark >= 35) return 'E';
      else return 'F';
    }
    case '1':
    case '2':
    case '3':
    case '4': {
      if (mark >= 90) return 'A*';
      else if (mark >= 70) return 'A';
      else if (mark >= 60) return 'B';
      else if (mark >= 50) return 'C';
      else if (mark >= 40) return 'D';
      else if (mark >= 35) return 'E';
      else return 'U';
    }
    default:
      return 'N/A';
  }
}

/**
 * Extracts a unique list of StudentsModel from the reports data.
 * Used for the student selection dropdown for individual performance.
 * @param reports The array of ReportsModel.
 * @returns A unique array of StudentsModel.
 */
function extractAllStudents(reports: ReportsModel[]): StudentsModel[] {
  if (!reports) return [];
  const studentsMap = new Map<string, StudentsModel>();
  reports.forEach((reportItem) => {
    const studentDetails: StudentsModel = {
      studentNumber: reportItem.studentNumber,
      name: reportItem.report.name,
      surname: reportItem.report.surname,
      dob: new Date(),
      gender: '',
      idnumber: '',
      dateOfJoining: new Date(),
      cell: '',
      email: '',
      address: '',
      prevSchool: '',
      role: null as any,
    };
    if (!studentsMap.has(studentDetails.studentNumber)) {
      studentsMap.set(studentDetails.studentNumber, studentDetails);
    }
  });
  return Array.from(studentsMap.values()).sort((a, b) => {
    const nameA = `${a.name} ${a.surname}`.toLowerCase();
    const nameB = `${b.name} ${b.surname}`.toLowerCase();
    return nameA.localeCompare(nameB);
  });
}

/**
 * Processes raw ReportsModel[] to generate overall class analysis data.
 * @param reports The array of ReportsModel fetched from the store.
 * @returns OverallAnalysisData or null if no reports.
 */
function processOverallAnalysis(
  reports: ReportsModel[]
): OverallAnalysisData | null {
  if (!reports || reports.length === 0) {
    return null;
  }

  const subjectPassCounts: {
    [subjectCode: string]: {
      totalStudents: number;
      passedStudents: number;
      subjectName: string;
    };
  } = {};
  const studentAverageMap = new Map<
    string,
    { totalPercentage: number; reportCount: number; student: StudentsModel }
  >();
  const uniqueSubjectsMap = new Map<string, { code: string; name: string }>();

  reports.forEach((reportItem) => {
    const studentNumber = reportItem.studentNumber;

    // Aggregate student overall averages
    if (!studentAverageMap.has(studentNumber)) {
      studentAverageMap.set(studentNumber, {
        totalPercentage: 0,
        reportCount: 0,
        student: {
          // Capture student details once per unique student
          studentNumber: reportItem.studentNumber,
          name: reportItem.report.name,
          surname: reportItem.report.surname,
          dob: new Date(),
          gender: '',
          idnumber: '',
          dateOfJoining: new Date(),
          cell: '',
          email: '',
          address: '',
          prevSchool: '',
          role: null as any,
        },
      });
    }
    const studentData = studentAverageMap.get(studentNumber)!;
    studentData.totalPercentage += reportItem.report.percentageAverge;
    studentData.reportCount++;

    reportItem.report.subjectsTable.forEach((subjectInfo) => {
      if (!subjectPassCounts[subjectInfo.subjectCode]) {
        subjectPassCounts[subjectInfo.subjectCode] = {
          totalStudents: 0,
          passedStudents: 0,
          subjectName: subjectInfo.subjectName,
        };
      }
      subjectPassCounts[subjectInfo.subjectCode].totalStudents++;
      if (subjectInfo.mark !== null && subjectInfo.mark >= 50) {
        subjectPassCounts[subjectInfo.subjectCode].passedStudents++;
      }
      uniqueSubjectsMap.set(subjectInfo.subjectCode, {
        code: subjectInfo.subjectCode,
        name: subjectInfo.subjectName,
      });
    });
  });

  const studentAverages: { student: StudentsModel; averageMark: number }[] =
    Array.from(studentAverageMap.values()).map((data) => ({
      student: data.student,
      averageMark:
        data.reportCount > 0 ? data.totalPercentage / data.reportCount : 0,
    }));

  const subjectPassRates = Object.values(subjectPassCounts)
    .map((data) => ({
      subjectName: data.subjectName,
      passRate:
        data.totalStudents > 0
          ? (data.passedStudents / data.totalStudents) * 100
          : 0,
    }))
    .sort((a, b) => a.subjectName.localeCompare(b.subjectName));

  studentAverages.sort((a, b) => b.averageMark - a.averageMark);
  const top5StudentsOverall = studentAverages.slice(0, 5);
  const bottom5StudentsOverall = studentAverages.slice(
    Math.max(0, studentAverages.length - 5)
  );

  return {
    subjectPassRates,
    top5StudentsOverall,
    bottom5StudentsOverall,
    uniqueSubjects: Array.from(uniqueSubjectsMap.values()),
    reportsRaw: reports,
  };
}

/**
 * Processes raw ReportsModel[] to generate per-subject analysis data for a specific subject.
 * Now correctly aggregates marks for unique students within the subject.
 * @param reports The array of ReportsModel.
 * @param subjectCode The code of the subject to analyze.
 * @returns SubjectAnalysisData or null.
 */
function processSubjectAnalysis(
  reports: ReportsModel[],
  subjectCode: string
): SubjectAnalysisData | null {
  if (!reports || reports.length === 0 || !subjectCode) {
    return null;
  }

  // Use a Map to aggregate marks for each unique student for the specific subject
  const studentSubjectMarksMap = new Map<
    string,
    {
      totalMark: number;
      count: number;
      student: StudentsModel;
      className: string;
    }
  >();
  const gradeCounts: { [grade: string]: number } = {};

  reports.forEach((reportItem) => {
    const studentNumber = reportItem.studentNumber;
    const subjectInfo = reportItem.report.subjectsTable.find(
      (s) => s.subjectCode === subjectCode
    );

    if (subjectInfo && subjectInfo.mark !== null) {
      if (!studentSubjectMarksMap.has(studentNumber)) {
        studentSubjectMarksMap.set(studentNumber, {
          totalMark: 0,
          count: 0,
          student: {
            // Capture student details once
            studentNumber: reportItem.studentNumber,
            name: reportItem.report.name,
            surname: reportItem.report.surname,
            dob: new Date(),
            gender: '',
            idnumber: '',
            dateOfJoining: new Date(),
            cell: '',
            email: '',
            address: '',
            prevSchool: '',
            role: null as any,
          },
          className: reportItem.report.className, // Need class name for grade calculation
        });
      }
      const studentData = studentSubjectMarksMap.get(studentNumber)!;
      studentData.totalMark += subjectInfo.mark;
      studentData.count++;
    }
  });

  const studentsForSubject: {
    student: StudentsModel;
    mark: number;
    grade: string;
  }[] = Array.from(studentSubjectMarksMap.values()).map((data) => {
    const averageMark = data.count > 0 ? data.totalMark / data.count : 0;
    const grade = computeGrade(averageMark, data.className); // Compute grade based on average mark for this subject
    gradeCounts[grade] = (gradeCounts[grade] || 0) + 1; // Accumulate grade counts
    return {
      student: data.student,
      mark: averageMark, // Use the average mark for the subject
      grade: grade,
    };
  });

  studentsForSubject.sort((a, b) => b.mark - a.mark);
  const bestStudents = studentsForSubject.slice(0, 5);
  const worstStudents = studentsForSubject.slice(
    Math.max(0, studentsForSubject.length - 5)
  );

  const gradeOrder = ['A*', 'A', 'B', 'C', 'D', 'E', 'F', 'U', 'N/A'];
  const gradeDistribution = Object.keys(gradeCounts)
    .map((grade) => ({
      grade,
      count: gradeCounts[grade],
    }))
    .sort((a, b) => {
      const indexA = gradeOrder.indexOf(a.grade);
      const indexB = gradeOrder.indexOf(b.grade);
      return (
        (indexA === -1 ? Infinity : indexA) -
        (indexB === -1 ? Infinity : indexB)
      );
    });

  return {
    bestStudents,
    worstStudents,
    gradeDistribution,
  };
}

/**
 * Processes raw ReportsModel[] to generate performance chart data for a specific student.
 * @param reports The array of ReportsModel.
 * @param student The selected student.
 * @returns An array containing the processed chart data for the student.
 */
function processStudentPerformance(
  reports: ReportsModel[],
  student: StudentsModel
): StudentPerformanceDisplayData[] | null {
  if (!reports || reports.length === 0 || !student) {
    return null;
  }

  const studentReports = reports.filter(
    (r) => r.studentNumber === student.studentNumber
  );

  if (studentReports.length === 0) {
    return null;
  }

  const subjectMarksMap = new Map<
    string,
    { totalMark: number; count: number; subjectName: string }
  >();

  studentReports.forEach((sReport) => {
    sReport.report.subjectsTable.forEach((sInfo) => {
      if (sInfo.mark !== null) {
        if (!subjectMarksMap.has(sInfo.subjectCode)) {
          subjectMarksMap.set(sInfo.subjectCode, {
            totalMark: 0,
            count: 0,
            subjectName: sInfo.subjectName,
          });
        }
        const current = subjectMarksMap.get(sInfo.subjectCode)!;
        current.totalMark += sInfo.mark;
        current.count++;
      }
    });
  });

  const aggregatedSubjectsData = Array.from(subjectMarksMap.values()).map(
    (data) => ({
      subjectName: data.subjectName,
      averageMark: data.count > 0 ? data.totalMark / data.count : 0,
    })
  );

  aggregatedSubjectsData.sort((a, b) =>
    a.subjectName.localeCompare(b.subjectName)
  );

  const labels = aggregatedSubjectsData.map((s) => s.subjectName);
  const marks = aggregatedSubjectsData.map((s) => s.averageMark);

  const chartData: any = {
    labels: labels,
    datasets: [
      {
        data: marks,
        label: `${student.name} ${student.surname}'s Performance`,
        fill: true,
        tension: 0.3,
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)',
        pointBackgroundColor: 'rgba(75,192,192,1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(75,192,192,1)',
      },
    ],
  };

  return [{ student: student, chartData: chartData }];
}

// =======================================================================
//                              SELECTORS
// =======================================================================

/**
 * Selector for overall analysis data.
 * Depends on `selectReports`.
 */
export const selectOverallAnalysisData = createSelector(
  selectReports,
  (reports) => processOverallAnalysis(reports)
);

/**
 * Selector for the list of available subjects for selection.
 * Depends on `selectOverallAnalysisData`.
 */
export const selectAvailableSubjectsForSelection = createSelector(
  selectOverallAnalysisData,
  (overallData) => (overallData ? overallData.uniqueSubjects : [])
);

/**
 * Selector for the list of available students for selection.
 * Depends on `selectOverallAnalysisData`.
 */
export const selectAvailableStudentsForSelection = createSelector(
  selectOverallAnalysisData,
  (overallData) =>
    overallData ? extractAllStudents(overallData.reportsRaw || []) : []
);

/**
 * Selector for subject-specific analysis data.
 * This is a factory function that returns a selector.
 * It takes `selectedSubjectCode` as an argument.
 */
export const selectSubjectAnalysisData = (selectedSubjectCode: string) =>
  createSelector(selectReports, (reports) =>
    processSubjectAnalysis(reports, selectedSubjectCode)
  );

/**
 * Selector for individual student performance data.
 * This is a factory function that returns a selector.
 * It takes `selectedStudent` as an argument.
 */
export const selectStudentPerformanceData = (
  selectedStudent: StudentsModel | null
) =>
  createSelector(selectReports, (reports) =>
    selectedStudent ? processStudentPerformance(reports, selectedStudent) : null
  );
