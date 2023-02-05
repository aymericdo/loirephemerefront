import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EffectsModule } from '@ngrx/effects';
import { SharedModule } from 'src/app/shared/shared.module';
import { MenuRoutingModule } from 'src/app/modules/admin/modules/menu/menu-routing.module';
import { MenuComponent } from 'src/app/modules/admin/modules/menu/components/menu.component';
import { AssociationComponent } from 'src/app/modules/admin/modules/menu/components/association/association.component';
import { EditPastryModalComponent } from 'src/app/modules/admin/modules/menu/components/edit-pastry-modal/edit-pastry-modal.component';
import { NewPastryModalComponent } from 'src/app/modules/admin/modules/menu/components/new-pastry-modal/new-pastry-modal.component';
import { PastryFormComponent } from 'src/app/modules/admin/modules/menu/components/pastry-form/pastry-form.component';
import { SequenceComponent } from 'src/app/modules/admin/modules/menu/components/sequence/sequence.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MenuEffects } from 'src/app/modules/admin/modules/menu/store/menu.effects';

@NgModule({
  declarations: [
    MenuComponent,
    NewPastryModalComponent,
    EditPastryModalComponent,
    PastryFormComponent,
    AssociationComponent,
    SequenceComponent,
  ],
  imports: [
    MenuRoutingModule,
    CommonModule,
    SharedModule,
    DragDropModule,
    EffectsModule.forFeature([MenuEffects]),
  ]
})
export class MenuModule { }
