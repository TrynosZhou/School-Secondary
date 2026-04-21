import {
  selectIsParent,
  selectLinkedChildrenAnyRole,
  selectLinkedChildrenForParent,
  selectLinkedStudentNumbers,
  selectHasLinkedChildrenProfile,
} from './auth.selectors';
import * as fromAuthReducer from './auth.reducer';
import { ROLES } from 'src/app/registration/models/roles.enum';

describe('Auth selectors (parent / linked children)', () => {
  const baseState: fromAuthReducer.State = {
    accessToken: '',
    errorMessage: '',
    isLoggedin: true,
    user: null,
    accStats: null,
    isLoading: false,
    userDetails: null,
  };

  describe('selectIsParent', () => {
    it('should return true when role is "parent"', () => {
      expect(selectIsParent.projector(ROLES.parent)).toBe(true);
    });

    it('should return true when role is "Parent" (case-insensitive)', () => {
      expect(selectIsParent.projector('Parent' as any)).toBe(true);
    });

    it('should return false when role is teacher or student', () => {
      expect(selectIsParent.projector(ROLES.teacher)).toBe(false);
      expect(selectIsParent.projector(ROLES.student)).toBe(false);
    });

    it('should return false when role is null or undefined', () => {
      expect(selectIsParent.projector(undefined)).toBe(false);
    });
  });

  describe('selectLinkedChildrenAnyRole', () => {
    it('should return students from userDetails when present', () => {
      const state: fromAuthReducer.State = {
        ...baseState,
        userDetails: {
          students: [
            { studentNumber: 'S1', name: 'A', surname: 'B' },
            { studentNumber: 'S2' },
          ],
        } as any,
      };
      expect(selectLinkedChildrenAnyRole.projector(state)).toEqual([
        { studentNumber: 'S1', name: 'A', surname: 'B' },
        { studentNumber: 'S2' },
      ]);
    });

    it('should return empty array when userDetails has no students', () => {
      const state: fromAuthReducer.State = {
        ...baseState,
        userDetails: {} as any,
      };
      expect(selectLinkedChildrenAnyRole.projector(state)).toEqual([]);
    });

    it('should return empty array when userDetails is null', () => {
      expect(selectLinkedChildrenAnyRole.projector(baseState)).toEqual([]);
    });
  });

  describe('selectLinkedChildrenForParent', () => {
    it('should return linked children when role is parent and userDetails has students', () => {
      const state: fromAuthReducer.State = {
        ...baseState,
        user: { id: 'u1', username: 'p', role: ROLES.parent, iat: 0, exp: 0 },
        userDetails: {
          students: [{ studentNumber: 'S1', name: 'X', surname: 'Y' }],
        } as any,
      };
      expect(selectLinkedChildrenForParent.projector(state)).toEqual([
        { studentNumber: 'S1', name: 'X', surname: 'Y' },
      ]);
    });

    it('should return empty array when role is not parent', () => {
      const state: fromAuthReducer.State = {
        ...baseState,
        user: { id: 'u1', username: 't', role: ROLES.teacher, iat: 0, exp: 0 },
        userDetails: { students: [{ studentNumber: 'S1' }] } as any,
      };
      expect(selectLinkedChildrenForParent.projector(state)).toEqual([]);
    });
  });

  describe('selectLinkedStudentNumbers', () => {
    it('should return student numbers when role is parent and userDetails has students', () => {
      const state: fromAuthReducer.State = {
        ...baseState,
        user: { id: 'u1', username: 'p', role: ROLES.parent, iat: 0, exp: 0 },
        userDetails: {
          students: [
            { studentNumber: 'S1' },
            { studentNumber: 'S2' },
          ],
        } as any,
      };
      expect(selectLinkedStudentNumbers.projector(state)).toEqual(['S1', 'S2']);
    });

    it('should return null when role is not parent', () => {
      const state: fromAuthReducer.State = {
        ...baseState,
        user: { id: 'u1', username: 't', role: ROLES.teacher, iat: 0, exp: 0 },
      };
      expect(selectLinkedStudentNumbers.projector(state)).toBeNull();
    });
  });

  describe('selectHasLinkedChildrenProfile', () => {
    it('should return true when linked children list is non-empty', () => {
      expect(
        selectHasLinkedChildrenProfile.projector([
          { studentNumber: 'S1' },
        ] as any)
      ).toBe(true);
    });

    it('should return false when linked children list is empty', () => {
      expect(selectHasLinkedChildrenProfile.projector([])).toBe(false);
    });
  });
});
