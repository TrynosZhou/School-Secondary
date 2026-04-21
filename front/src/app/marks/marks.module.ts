import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EnterMarksComponent } from './enter-marks/enter-marks.component';
import { SubjectsComponent } from './subjects/subjects.component';
import { MaterialModule } from '../material/material.module';
import { StoreModule } from '@ngrx/store';
import { marksReducer } from './store/marks.reducer';
import { EffectsModule } from '@ngrx/effects';
import { MarksEffects } from './store/marks.effects';
import { AddEditSubjectComponent } from './subjects/add-edit-subject/add-edit-subject.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { MarksSheetsComponent } from './marks-sheets/marks-sheets.component';
import { markSheetsReducer } from './marks-sheets/store/reducer';
import { MarkSheetEffects } from './marks-sheets/store/effects';
import { MarksProgressComponent } from './marks-progress/marks-progress.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    EnterMarksComponent,
    SubjectsComponent,
    AddEditSubjectComponent,
    MarksSheetsComponent,
    MarksProgressComponent,
  ],
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    NgChartsModule,
    SharedModule,
    StoreModule.forFeature('marks', marksReducer),
    StoreModule.forFeature('markSheet', markSheetsReducer),
    EffectsModule.forFeature(MarksEffects),
    EffectsModule.forFeature(MarkSheetEffects),
  ],
  exports: [
    SubjectsComponent,
    AddEditSubjectComponent,
  ],
})
export class MarksModule {}
