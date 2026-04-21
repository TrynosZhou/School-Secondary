import { createReducer, on } from '@ngrx/store';
import { SubjectsModel } from '../models/subjects.model';
import * as marksActions from './marks.actions';
import { MarksModel } from '../models/marks.model';
import { ChartConfiguration } from 'chart.js';
import { StudentComment } from '../models/student-comment';
import { MarksProgressModel } from '../models/marks-progress.model';

export interface State {
  subjects: SubjectsModel[];
  marks: MarksModel[];
  comments: StudentComment[];
  isLoading: boolean;
  errorMessage: string;
  data: {
    subjects: SubjectsModel[];
    subjectsMarks: Array<MarksModel[]>;
    marks: Array<number[]>;
    xAxes: number[];
  };
  lineChartData: ChartConfiguration<'line'>['data'];
  marksProgress: MarksProgressModel[];

  studentMarks: MarksModel[];
  studentMarksLoading: boolean;
  studentMarksLoaded: boolean;
  studentMarksError: string;
}

export const initialState: State = {
  subjects: [],
  marks: [],
  comments: [],
  isLoading: false,
  errorMessage: '',
  data: {
    subjects: [],
    subjectsMarks: [],
    marks: [],
    xAxes: [],
  },
  lineChartData: {
    labels: [],
    datasets: [],
  },
  marksProgress: [],

  studentMarks: [],
  studentMarksLoading: false,
  studentMarksLoaded: false,
  studentMarksError: '',
};

export const marksReducer = createReducer(
  initialState,
  on(marksActions.fetchSubjects, (state) => ({
    ...state,
    isLoading: true,
  })),
  on(marksActions.fetchSubjectsSuccess, (state, { subjects }) => ({
    ...state,
    subjects,
    isLoading: false,
  })),
  on(marksActions.fetchSubjectsFailure, (state, { error }) => ({
    ...state,
    errorMessage: error.message,
    isLoading: false,
  })),
  on(marksActions.addSubjectAction, (state, { subject }) => ({
    ...state,
    isLoading: true,
  })),
  on(marksActions.addSubjectActionSuccess, (state, { subject }) => ({
    ...state,
    isLoading: false,
    subjects: [subject, ...state.subjects],
  })),
  on(marksActions.addSubjectActionFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
  })),
  on(marksActions.deleteSubjectAction, (state, { subject }) => ({
    ...state,
    isLoading: true,
  })),
  on(marksActions.deleteSubjectSuccess, (state, { code }) => ({
    ...state,
    isLoading: false,
    subjects: [...state.subjects.filter((subj) => subj.code !== code)],
  })),
  on(marksActions.deleteSubjectFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
  })),
  on(
    marksActions.fetchSubjectMarksInClass,
    (state, { name, num, year, subjectCode }) => ({
      ...state,
      isLoading: true,
    })
  ),
  on(marksActions.fetchSubjectMarksInClassSuccess, (state, { marks }) => ({
    ...state,
    isLoading: false,
    marks,
  })),
  on(marksActions.fetchSubjectMarksInFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
  })),
  on(marksActions.saveMarkAction, (state, { mark }) => ({
    ...state,
    isLoading: true,
  })),
  on(marksActions.saveMarkActionSuccess, (state, { mark }) => ({
    ...state,
    isLoading: false,
    marks: [
      ...state.marks.map((mrk) =>
        mrk.student.studentNumber === mark.student.studentNumber
          ? (mrk = mark)
          : (mrk = mrk)
      ),
    ],
    // marks: [...state.marks.filter(mrk => mrk.student.studentNumber !== mark.student.studentNumber), mark],
  })),
  on(marksActions.saveMarkActionFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
  })),
  on(marksActions.editSubjectActions.editSubject, (state, { subject }) => ({
    ...state,
    isLoading: true,
  })),
  on(
    marksActions.editSubjectActions.editSubjectSuccess,
    (state, { subject }) => ({
      ...state,
      isLoading: false,
      subjects: [
        ...state.subjects.map((subj) =>
          subj.code !== subject.code ? subj : subject
        ),
      ],
    })
  ),
  on(marksActions.editSubjectActions.editSubjectFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
  })),
  on(marksActions.deleteMarkActions.deleteMark, (state, { mark }) => ({
    ...state,
    isLoading: true,
  })),
  on(marksActions.deleteMarkActions.deleteMarkSuccess, (state, { mark }) => ({
    ...state,
    isLoading: false,
    marks: [
      ...state.marks.map((mrk) =>
        mrk.student.studentNumber === mark.student.studentNumber
          ? (mrk = mark)
          : (mrk = mrk)
      ),
    ],
  })),
  on(marksActions.deleteMarkActions.deleteMarkFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
  })),
  on(
    marksActions.perfomanceActions.fetchPerfomanceData,
    (state, { num, year, name }) => ({
      ...state,
      isLoading: true,
    })
  ),
  on(
    marksActions.perfomanceActions.fetchPerfomanceDataSuccess,
    (state, { data }) => ({
      ...state,
      isLoading: false,
      data: data,
      lineChartData: {
        labels: [...data.xAxes],
        datasets: [
          ...data.marks.map((markArr, index) => {
            return {
              label: data.subjects[index].name,
              data: markArr,
              tension: 0.5,
            };
          }),
        ],
      },
    })
  ),
  on(
    marksActions.perfomanceActions.plotSubjectPerf,
    (state, { subject, index }) => ({
      ...state,
      lineChartData: {
        labels: [subject],
        datasets: [
          {
            label: subject,
            data: [...state.data.marks[index]],
            tension: 0.5,
          },
        ],
      },
    })
  ),
  on(
    marksActions.perfomanceActions.fetchPerfomanceDataFail,
    (state, { error }) => ({
      ...state,
      isLoading: false,
      errorMessage: error.message,
    })
  ),
  on(marksActions.saveCommentActions.saveComment, (state, { comment }) => ({
    ...state,
    isLoading: true,
  })),
  on(
    marksActions.saveCommentActions.saveCommentSuccess,
    (state, { comment }) => ({
      ...state,
      comments: [
        ...state.comments.map((cmmt) =>
          cmmt.id === comment.id ? (cmmt = comment) : (cmmt = cmmt)
        ),
      ],
      //omments: [...state.comments.map(cmm => cmm.id === comment.id ? cmm.comment = comment.comment : cmm = cmm)],
      isLoading: false,
    })
  ),
  on(marksActions.saveCommentActions.saveCommentFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
  })),
  on(
    marksActions.saveCommentActions.fetchClassComments,
    (state, { name, num, year }) => ({
      ...state,
      isLoading: true,
    })
  ),
  on(
    marksActions.saveCommentActions.fetchClassCommentsSuccess,
    (state, { comments }) => ({
      ...state,
      isLoading: false,
      comments: comments,
    })
  ),
  on(marksActions.saveCommentActions.saveCommentFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    error: error.message,
  })),
  on(marksActions.fetchMarksProgressActions.fetchMarksProgress, (state) => ({
    ...state,
    isLoading: true,
  })),
  on(
    marksActions.fetchMarksProgressActions.fetchMarksProgressSuccess,
    (state, { marksProgress }) => ({
      ...state,
      isLoading: false,
      marksProgress,
    })
  ),
  on(
    marksActions.fetchMarksProgressActions.fetchMarksProgressFail,
    (state, { error }) => ({
      ...state,
      isLoading: false,
      errorMessage: error.message,
    })
  ),
  on(marksActions.studentMarksActions.fetchStudentMarks, (state) => ({
    ...state,
    studentMarksLoading: true,
    studentMarksLoaded: false,
    studentMarksError: '',
  })),
  on(
    marksActions.studentMarksActions.fetchStudentMarksSuccess,
    (state, { marks }) => ({
      ...state,
      studentMarks: marks,
      studentMarksLoading: false,
      studentMarksLoaded: true,
      studentMarksError: '',
    })
  ),
  on(
    marksActions.studentMarksActions.fetchStudentMarksFail,
    (state, { error }) => ({
      ...state,
      studentMarksLoading: false,
      studentMarksLoaded: false,
      studentMarksError: error.message,
    })
  )
);
