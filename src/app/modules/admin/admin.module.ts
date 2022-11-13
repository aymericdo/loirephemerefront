import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { AdminComponent } from './components/admin.component';
import { CommandCardComponent } from './components/command-card/command-card.component';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { AdminEffects } from './store/admin.effects';
import { adminFeatureKey, reducer } from './store/admin.reducer';
import { StatsComponent } from './components/stats/stats.component';
import { NgChartsModule } from 'ng2-charts';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminRoutingModule } from './admin-routing.module';
import { CommandsComponent } from './components/commands/commands.component';
import { MenuComponent } from './components/menu/menu.component';
import { NewPastryModalComponent } from 'src/app/modules/admin/components/new-pastry-modal/new-pastry-modal.component';
import { EditPastryModalComponent } from 'src/app/modules/admin/components/edit-pastry-modal/edit-pastry-modal.component';
import { PastryFormComponent } from 'src/app/modules/admin/components/pastry-form/pastry-form.component';

@NgModule({
  declarations: [
    AdminComponent,
    CommandsComponent,
    StatsComponent,
    CommandCardComponent,
    MenuComponent,
    NewPastryModalComponent,
    EditPastryModalComponent,
    PastryFormComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    NgChartsModule,
    FormsModule,
    ReactiveFormsModule,
    AdminRoutingModule,
    EffectsModule.forFeature([AdminEffects]),
    StoreModule.forFeature(adminFeatureKey, reducer),
  ],
})
export class AdminModule { }
