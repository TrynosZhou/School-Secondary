import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material/material.module';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { enrolmentReducer } from './store/enrolment.reducer';
import { EnrolmentEffects } from './store/enrolment.effects';
import { TermsClassesComponent } from './terms-classes/terms-classes.component';
import { TermsComponent } from './terms-classes/terms/terms.component';
import { ClassesComponent } from './terms-classes/classes/classes.component';
import { AddEditClassComponent } from './terms-classes/classes/add-edit-class/add-edit-class.component';
import { AddEditTermComponent } from './terms-classes/terms/add-edit-term/add-edit-term.component';
import { EnrolStudentComponent } from './terms-classes/enrol-student/enrol-student.component';
import { MigrateClassEnrolmentComponent } from './migrate-class-enrolment/migrate-class-enrolment.component';
import { ClassListsComponent } from './terms-classes/class-lists/class-lists.component';
import { EnrolService } from './services/enrol.service';

@NgModule({
  declarations: [
    TermsClassesComponent,
    TermsComponent,
    ClassesComponent,
    AddEditClassComponent,
    AddEditTermComponent,
    EnrolStudentComponent,
    MigrateClassEnrolmentComponent,
    ClassListsComponent,
  ],
  imports: [
    FormsModule,
    CommonModule,
    MaterialModule,
    RouterModule,
    ReactiveFormsModule,
    StoreModule.forFeature('enrol', enrolmentReducer),
    EffectsModule.forFeature([EnrolmentEffects]),
  ],
  exports: [
    TermsComponent,
    ClassesComponent,
    AddEditClassComponent,
    AddEditTermComponent,
  ],
  // exports: [EnrolService]
})
export class EnrolmentModule {}
