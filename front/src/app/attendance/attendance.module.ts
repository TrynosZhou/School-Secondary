import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkRegisterComponent } from './mark-register/mark-register.component';
import { AttendanceReportsComponent } from './attendance-reports/attendance-reports.component';
import { MaterialModule } from '../material/material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { attendanceReducer } from './store/attendance.reducer';
import { EffectsModule } from '@ngrx/effects';
import { AttendanceEffects } from './store/attendance.effects';

@NgModule({
  declarations: [
    MarkRegisterComponent,
    AttendanceReportsComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    StoreModule.forFeature('attendance', attendanceReducer),
    EffectsModule.forFeature(AttendanceEffects),
  ],
})
export class AttendanceModule {}
