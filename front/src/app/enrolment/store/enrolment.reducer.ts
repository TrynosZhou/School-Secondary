import { createReducer, on } from '@ngrx/store';
import { ClassesModel } from '../models/classes.model';
import { EnrolsModel } from '../models/enrols.model';
import { TermsModel } from '../models/terms.model';
import * as enrolmentActions from './enrolment.actions';
// import { editClassFail } from './enrolment.actions';
import { StudentsModel } from 'src/app/registration/models/students.model';
import { EnrolStats } from '../models/enrol-stats.model';
import { StudentsSummary } from '../models/students-summary.model';
// import { RegisterModel } from '../../attendance/models/register.model';

export interface State {
  terms: TermsModel[];
  classes: ClassesModel[];
  enrols: EnrolsModel[];
  registeredStudents: StudentsModel[];
  isLoading: boolean;
  errorMessage: string;
  deleteSuccess: boolean | null;
  // addSuccess: boolean | null;
  enrolStats: EnrolStats | null;
  migrateClassResult: boolean | null;
  migrateClassMessage: string;
  totalEnrolment: StudentsSummary | null;

  currentEnrolment: EnrolsModel | null;
  currentEnrolmentLoading: boolean;
  currentEnrolmentLoaded: boolean;
  currentEnrolmentLoadError: string;

  currentTerm: TermsModel;
  allEnrols: EnrolsModel[];
  termEnrols: EnrolsModel[];
}

export const initialState: State = {
  terms: [],
  classes: [],
  enrols: [],
  registeredStudents: [],
  isLoading: false,
  errorMessage: '',
  deleteSuccess: null,

  enrolStats: null,
  migrateClassResult: null,
  migrateClassMessage: '',
  totalEnrolment: null,

  currentEnrolment: null,
  currentEnrolmentLoading: false,
  currentEnrolmentLoaded: false,
  currentEnrolmentLoadError: '',

  currentTerm: {} as TermsModel,
  allEnrols: [],
  termEnrols: [],
};

export const enrolmentReducer = createReducer(
  initialState,
  on(enrolmentActions.fetchClasses, (state) => ({
    ...state,
    isLoading: true,
  })),
  on(enrolmentActions.fetchClassesSuccess, (state, { classes }) => ({
    ...state,
    classes,
    errorMessage: '',
    isLoading: false,
  })),
  on(enrolmentActions.fetchClassesFailure, (state, { error }) => ({
    ...state,
    errorMessage: error.message,
    isLoading: false,
  })),
  on(enrolmentActions.addClassAction, (state, { clas }) => ({
    ...state,
    isLoading: true,
    errorMessage: '',
  })),
  on(enrolmentActions.addClassActionSuccess, (state, { clas }) => ({
    ...state,
    isLoading: false,
    errorMessage: '',
    classes: [clas, ...state.classes],
    addSuccess: true,
  })),
  on(enrolmentActions.addClassActionFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
    addSuccess: false,
  })),
  on(enrolmentActions.deleteClassAction, (state, { name }) => ({
    ...state,
    isLoading: true,
    errorMessage: '',
  })),
  on(enrolmentActions.deleteClassSuccess, (state, { name }) => ({
    ...state,
    isLoading: false,
    classes: [...state.classes.filter((clas) => clas.name !== name)],
    deleteSuccess: true,
  })),
  on(enrolmentActions.deleteClassFail, (state, { error }) => ({
    ...state,
    errorMessage: error.message,
    isLoading: false,
    deleteSuccess: false,
  })),
  on(enrolmentActions.editClassAction, (state, { clas }) => ({
    ...state,
    isLoading: true,
    errorMessage: '',
  })),
  on(enrolmentActions.editClassSuccess, (state, { clas }) => ({
    ...state,
    isLoading: false,
    editSuccess: true,
    classes: [...state.classes.map((cl) => (cl.id !== clas.id ? cl : clas))],
  })),
  on(enrolmentActions.editClassFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
    editSuccess: false,
  })),
  on(enrolmentActions.fetchTerms, (state) => ({
    ...state,
    isLoading: true,
  })),
  on(enrolmentActions.fetchTermsSuccess, (state, { terms }) => ({
    ...state,
    terms,
    errorMessage: '',
    isLoading: false,
  })),
  on(enrolmentActions.fetchTermsFailure, (state, { error }) => ({
    ...state,
    errorMessage: error.message,
    isLoading: false,
  })),
  on(enrolmentActions.addTermAction, (state, { term }) => ({
    ...state,
    isLoading: true,
  })),
  on(enrolmentActions.addTermActionSuccess, (state, { term }) => ({
    ...state,
    isLoading: false,
    errorMessage: '',
    terms: [term, ...state.terms],
  })),
  on(enrolmentActions.addTermActionFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
  })),
  on(enrolmentActions.editTermAction, (state, { term }) => ({
    ...state,
    isLoading: true,
    errorMessage: '',
  })),
  on(enrolmentActions.editTermSuccess, (state, { term }) => ({
    ...state,
    isLoading: false,
    errorMessage: '',
    terms: [
      ...state.terms.map((trm) =>
        trm.num === term.num && trm.year === term.year ? term : trm
      ),
    ],
  })),
  on(enrolmentActions.fetchTotalEnrols, (state) => ({
    ...state,
    isLoading: true,
  })),
  on(enrolmentActions.fetchTotalEnrolsSuccess, (state, { summary }) => ({
    ...state,
    isLoading: false,
    totalEnrolment: summary,
  })),
  on(enrolmentActions.fetchTotalEnrolsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: 'Failed to get total',
  })),
  on(enrolmentActions.getEnrolmentByClass, (state, { name, num, year }) => ({
    ...state,
    isLoading: true,
  })),
  on(enrolmentActions.getEnrolmentByClassSuccess, (state, { enrols }) => ({
    ...state,
    isLoading: false,
    enrols,
  })),
  on(enrolmentActions.getEnrolmentByClassFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
  })),
  on(enrolmentActions.enrolStudents, (state, { enrols }) => ({
    ...state,
    isLoading: true,
  })),
  on(enrolmentActions.enrolStudentsSuccess, (state, { enrols }) => ({
    ...state,
    isLoading: false,
    enrols: [...enrols, ...state.enrols],
  })),
  on(enrolmentActions.enrolStudentsFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
  })),
  on(enrolmentActions.fetchEnrolsStats, (state) => ({
    ...state,
    isLoading: true,
  })),
  on(enrolmentActions.fetchEnrolsStatsSuccess, (state, { stats }) => ({
    ...state,
    isLoading: false,
    enrolStats: stats,
  })),
  on(enrolmentActions.fetchEnrolsStatsFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
  })),
  on(
    enrolmentActions.UnenrolStudentActions.unenrolStudent,
    (state, { enrol }) => ({
      ...state,
      isLoading: true,
    })
  ),
  on(
    enrolmentActions.UnenrolStudentActions.unenrolStudentSuccess,
    (state, { enrol }) => ({
      ...state,
      isLoading: false,
      enrols: [
        ...state.enrols.filter(
          (enr) => enr.student.studentNumber !== enrol.student.studentNumber
        ),
      ],
    })
  ),
  on(
    enrolmentActions.UnenrolStudentActions.unenrolStudentFail,
    (state, { error }) => ({
      ...state,
      isLoading: false,
      errorMessage: error.message,
    })
  ),

  on(
    enrolmentActions.migrateClassActions.migrateClassEnrolment,
    (state, { fromName, fromNum, fromYear, toName, toNum, toYear }) => ({
      ...state,
      isLoading: true,
      errorMessage: '',
      migrateClassResult: null,
      migrateClassMessage: '',
    })
  ),
  on(
    enrolmentActions.migrateClassActions.migrateClassEnrolmentSuccess,
    (state, { result, message }) => ({
      ...state,
      isLoading: false,
      errorMessage: '',
      migrateClassResult: result,
      migrateClassMessage: message || '',
    })
  ),
  on(
    enrolmentActions.migrateClassActions.migrateClassEnrolmentFail,
    (state, { error }) => ({
      ...state,
      isLoading: false,
      errorMessage: error.message,
      migrateClassResult: false,
      migrateClassMessage: error.message || 'Class migration failed.',
    })
  ),
  on(enrolmentActions.migrateClassActions.resetMigrateClassResult, (state) => ({
    ...state,
    migrateClassResult: null,
    migrateClassMessage: '',
  })),
  on(
    enrolmentActions.currentEnrolementActions.fetchCurrentEnrolment,
    (state) => ({
      ...state,
      currentEnrolmentLoading: true,
      currentEnrolmentLoaded: false,
      currentEnrolmentLoadError: '',
    })
  ),
  on(
    enrolmentActions.currentEnrolementActions.fetchCurrentEnrolmentSuccess,
    (state, { enrols }) => ({
      ...state,
      currentEnrolmentLoaded: true,
      currentEnrolmentLoading: false,
      currentEnrolmentLoadError: '',
      currentEnrolment: enrols,
    })
  ),
  on(
    enrolmentActions.currentEnrolementActions.fetchCurrentEnrolmentFail,
    (state, { error }) => ({
      ...state,
      currentEnrolmentLoading: false,
      currentEnrolmentLoaded: false,
      currentEnrolmentLoadError: error.message,
    })
  ),
  on(
    enrolmentActions.currentEnrolementActions.updateCurrentEnrolment,
    (state, { enrol }) => ({
      ...state,
      isLoading: true,
    })
  ),
  on(
    enrolmentActions.currentEnrolementActions.updateCurrentEnrolmentSuccess,
    (state, { enrol }) => {
      return {
        ...state,
        isLoading: false,
        enrols: [
          ...state.enrols.map((enr) => (enr.id === enrol.id ? enrol : enr)),
        ],
        currentEnrolment: {
          ...enrol, // Ensure enrol is an object or safely spread
        },
      };
    }
  ),
  on(
    enrolmentActions.currentEnrolementActions.updateCurrentEnrolmentFail,
    (state, { error }) => ({
      ...state,
      isLoading: false,
      errorMessage: error.message,
    })
  ),
  on(enrolmentActions.currentTermActions.fetchCurrentTerm, (state) => ({
    ...state,
    isLoading: true,
    errorMessage: '',
  })),
  on(
    enrolmentActions.currentTermActions.fetchCurrentTermSuccess,
    (state, { term }) => ({
      ...state,
      isLoading: false,
      errorMessage: '',
      currentTerm: term,
    })
  ),
  on(
    enrolmentActions.currentTermActions.fetchCurrentTermFail,
    (state, { error }) => ({
      ...state,
      isLoading: false,
      errorMessage: error.message,
    })
  ),
  on(enrolmentActions.termEnrolsActions.fetchTermEnrols, (state) => ({
    ...state,
    isLoading: true,
    errorMessage: '',
  })),
  on(
    enrolmentActions.termEnrolsActions.fetchTermEnrolsSuccess,
    (state, { termEnrols }) => ({
      ...state,
      isLoading: false,
      errorMessage: '',
      termEnrols,
    })
  ),
  on(
    enrolmentActions.termEnrolsActions.fetchTermEnrolsFail,
    (state, { error }) => ({
      ...state,
      isLoading: false,
      errorMessage: error.message,
    })
  )
);
