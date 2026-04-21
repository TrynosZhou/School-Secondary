/* eslint-disable prettier/prettier */
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject, of } from 'rxjs';
import { takeUntil, map, catchError } from 'rxjs/operators';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { RolesPermissionsService } from '../services/roles-permissions.service';
import { Role, Permission, CreateRole, UpdateRole } from '../models/role.model';
import { ThemeService, Theme } from 'src/app/services/theme.service';

@Component({
  selector: 'app-roles-permissions',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatDialogModule,
    MatTooltipModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSnackBarModule,
  ],
  templateUrl: './roles-permissions.component.html',
  styleUrls: ['./roles-permissions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolesPermissionsComponent implements OnInit, OnDestroy {
  // Data
  roles: Role[] = [];
  permissions: Permission[] = [];
  permissions$: Observable<Permission[]> = new Observable();
  
  // Forms
  roleForm: FormGroup;
  permissionForm: FormGroup;
  
  // UI State
  selectedTab = 0;
  isEditingRole = false;
  isEditingPermission = false;
  selectedRole: Role | null = null;
  selectedPermission: Permission | null = null;
  isLoading = false;
  currentTheme: Theme = 'light';
  
  // Table columns
  rolesDisplayedColumns: string[] = ['name', 'description', 'permissions', 'active', 'actions'];
  permissionsDisplayedColumns: string[] = ['name', 'resource', 'action', 'description', 'active', 'actions'];
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private rolesPermissionsService: RolesPermissionsService,
    private snackBar: MatSnackBar,
    private themeService: ThemeService,
    private cdr: ChangeDetectorRef,
  ) {
    this.roleForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      active: [true],
      selectedPermissions: this.fb.array([]), // Will store selected permission IDs
    });
    
    this.permissionForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      resource: [''],
      action: [''],
      active: [true],
    });
  }

  ngOnInit(): void {
    // Subscribe to theme
    this.themeService.theme$
      .pipe(takeUntil(this.destroy$))
      .subscribe(theme => {
        this.currentTheme = theme;
        this.cdr.markForCheck();
      });
    
    // Load data
    this.loadPermissions();
    this.loadRoles();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get selectedPermissionsArray(): FormArray {
    return this.roleForm.get('selectedPermissions') as FormArray;
  }

  loadRoles(): void {
    this.isLoading = true;
    this.cdr.markForCheck();
    
    this.rolesPermissionsService.getRoles(true)
      .pipe(
        map(roles => {
          this.roles = roles;
          this.isLoading = false;
          this.cdr.markForCheck();
          return roles;
        }),
        catchError(error => {
          console.error('Error loading roles:', error);
          this.snackBar.open('Failed to load roles', 'Dismiss', { duration: 3000 });
          this.isLoading = false;
          this.cdr.markForCheck();
          return [];
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  loadPermissions(): void {
    this.isLoading = true;
    this.cdr.markForCheck();
    
    this.permissions$ = this.rolesPermissionsService.getPermissions(true);
    
    this.permissions$.pipe(
      map(permissions => {
        this.permissions = permissions;
        this.isLoading = false;
        this.updatePermissionCheckboxes();
        this.cdr.markForCheck();
        return permissions;
      }),
      catchError(error => {
        console.error('Error loading permissions:', error);
        this.snackBar.open('Failed to load permissions', 'Dismiss', { duration: 3000 });
        this.isLoading = false;
        this.permissions = [];
        this.cdr.markForCheck();
        return [];
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }
  
  private updatePermissionCheckboxes(): void {
    // This is called after permissions are loaded to initialize checkboxes
    // The checkboxes are managed by isPermissionSelected() and togglePermission()
  }

  // Role Methods
  onCreateRole(): void {
    this.selectedRole = null;
    this.isEditingRole = true;
    this.roleForm.reset({
      name: '',
      description: '',
      active: true,
    });
    
    // Clear permission array
    const permissionArray = this.roleForm.get('selectedPermissions') as FormArray;
    permissionArray.clear();
    
    this.cdr.markForCheck();
  }

  onEditRole(role: Role): void {
    if (role.isSystemRole) {
      this.snackBar.open('Cannot edit system roles', 'Dismiss', { duration: 3000 });
      return;
    }
    
    this.selectedRole = role;
    this.isEditingRole = true;
    
    this.roleForm.patchValue({
      name: role.name,
      description: role.description || '',
      active: role.active,
    });
    
    // Clear and set permission checkboxes
    const permissionArray = this.roleForm.get('selectedPermissions') as FormArray;
    permissionArray.clear();
    
    // Add selected permission IDs
    if (role.permissions && role.permissions.length > 0) {
      role.permissions.forEach(permission => {
        permissionArray.push(this.fb.control(permission.id));
      });
    }
    
    this.cdr.markForCheck();
  }

  onSaveRole(): void {
    if (this.roleForm.invalid) {
      this.snackBar.open('Please fill in all required fields', 'Dismiss', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    this.cdr.markForCheck();

    const formValue = this.roleForm.value;
    const permissionIds = this.selectedPermissionsArray.value.filter((id: any) => id && typeof id === 'string');

    let operation: Observable<Role>;
    if (this.selectedRole) {
      const updateData: UpdateRole = {
        name: formValue.name,
        description: formValue.description,
        active: formValue.active,
        permissionIds: permissionIds.length > 0 ? permissionIds : undefined,
      };
      operation = this.rolesPermissionsService.updateRole(this.selectedRole.id, updateData);
    } else {
      const createData: CreateRole = {
        name: formValue.name,
        description: formValue.description,
        active: formValue.active,
        permissionIds: permissionIds.length > 0 ? permissionIds : undefined,
      };
      operation = this.rolesPermissionsService.createRole(createData);
    }

    operation
      .pipe(
        map(() => {
          this.snackBar.open(`Role ${this.selectedRole ? 'updated' : 'created'} successfully`, 'Dismiss', { duration: 3000 });
          this.isEditingRole = false;
          this.selectedRole = null;
          this.isLoading = false;
          this.roleForm.reset();
          this.loadRoles();
          this.loadPermissions(); // Reload to get updated permission counts
        }),
        catchError(error => {
          console.error('Error saving role:', error);
          this.snackBar.open(
            error.error?.message || `Failed to ${this.selectedRole ? 'update' : 'create'} role`,
            'Dismiss',
            { duration: 5000 }
          );
          this.isLoading = false;
          this.cdr.markForCheck();
          return of(null);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  onDeleteRole(role: Role): void {
    if (role.isSystemRole) {
      this.snackBar.open('Cannot delete system roles', 'Dismiss', { duration: 3000 });
      return;
    }

    if (!confirm(`Are you sure you want to delete role "${role.name}"?`)) {
      return;
    }

    this.isLoading = true;
    this.cdr.markForCheck();

    this.rolesPermissionsService.deleteRole(role.id)
      .pipe(
        map(() => {
          this.snackBar.open('Role deleted successfully', 'Dismiss', { duration: 3000 });
          this.loadRoles();
        }),
        catchError(error => {
          console.error('Error deleting role:', error);
          this.snackBar.open(
            error.error?.message || 'Failed to delete role',
            'Dismiss',
            { duration: 5000 }
          );
          this.isLoading = false;
          this.cdr.markForCheck();
          return of(null);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  onCancelRole(): void {
    this.isEditingRole = false;
    this.selectedRole = null;
    this.roleForm.reset();
    this.cdr.markForCheck();
  }

  togglePermission(permissionId: string, checked: boolean): void {
    const permissionArray = this.roleForm.get('selectedPermissions') as FormArray;
    
    if (checked) {
      // Add if not already present
      const existingIndex = permissionArray.value.findIndex((id: string) => id === permissionId);
      if (existingIndex === -1) {
        permissionArray.push(this.fb.control(permissionId));
      }
    } else {
      // Remove
      const index = permissionArray.value.findIndex((id: string) => id === permissionId);
      if (index !== -1) {
        permissionArray.removeAt(index);
      }
    }
    this.cdr.markForCheck();
  }

  isPermissionSelected(permissionId: string): boolean {
    const permissionArray = this.roleForm.get('selectedPermissions') as FormArray;
    return permissionArray.value && permissionArray.value.includes(permissionId);
  }

  getRolePermissions(role: Role): string {
    if (!role.permissions || role.permissions.length === 0) {
      return 'No permissions';
    }
    return role.permissions.length === 1
      ? '1 permission'
      : `${role.permissions.length} permissions`;
  }

  // Permission Methods
  onCreatePermission(): void {
    this.selectedPermission = null;
    this.isEditingPermission = true;
    this.permissionForm.reset({
      name: '',
      description: '',
      resource: '',
      action: '',
      active: true,
    });
    this.cdr.markForCheck();
  }

  onEditPermission(permission: Permission): void {
    this.selectedPermission = permission;
    this.isEditingPermission = true;
    
    this.permissionForm.patchValue({
      name: permission.name,
      description: permission.description || '',
      resource: permission.resource || '',
      action: permission.action || '',
      active: permission.active,
    });
    
    this.cdr.markForCheck();
  }

  onSavePermission(): void {
    if (this.permissionForm.invalid) {
      this.snackBar.open('Please fill in all required fields', 'Dismiss', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    this.cdr.markForCheck();

    const formValue = this.permissionForm.value;
    const permissionData = {
      name: formValue.name,
      description: formValue.description,
      resource: formValue.resource,
      action: formValue.action,
      active: formValue.active,
    };

    const operation = this.selectedPermission
      ? this.rolesPermissionsService.updatePermission(this.selectedPermission.id, permissionData)
      : this.rolesPermissionsService.createPermission(permissionData);

    operation
      .pipe(
        map(() => {
          this.snackBar.open(`Permission ${this.selectedPermission ? 'updated' : 'created'} successfully`, 'Dismiss', { duration: 3000 });
          this.isEditingPermission = false;
          this.selectedPermission = null;
          this.permissionForm.reset();
          this.loadPermissions();
        }),
        catchError(error => {
          console.error('Error saving permission:', error);
          this.snackBar.open(
            error.error?.message || `Failed to ${this.selectedPermission ? 'update' : 'create'} permission`,
            'Dismiss',
            { duration: 5000 }
          );
          this.isLoading = false;
          this.cdr.markForCheck();
          return of(null);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  onDeletePermission(permission: Permission): void {
    if (!confirm(`Are you sure you want to delete permission "${permission.name}"?`)) {
      return;
    }

    this.isLoading = true;
    this.cdr.markForCheck();

    this.rolesPermissionsService.deletePermission(permission.id)
      .pipe(
        map(() => {
          this.snackBar.open('Permission deleted successfully', 'Dismiss', { duration: 3000 });
          this.loadPermissions();
        }),
        catchError(error => {
          console.error('Error deleting permission:', error);
          this.snackBar.open(
            error.error?.message || 'Failed to delete permission',
            'Dismiss',
            { duration: 5000 }
          );
          this.isLoading = false;
          this.cdr.markForCheck();
          return of(null);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  onCancelPermission(): void {
    this.isEditingPermission = false;
    this.selectedPermission = null;
    this.permissionForm.reset();
    this.cdr.markForCheck();
  }
}

