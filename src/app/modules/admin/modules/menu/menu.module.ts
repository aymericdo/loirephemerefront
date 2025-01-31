import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EffectsModule } from '@ngrx/effects';

import { MenuRoutingModule } from 'src/app/modules/admin/modules/menu/menu-routing.module';
import { PastryFormComponent } from 'src/app/modules/admin/modules/menu/components/pastry-form/pastry-form.component';
import { MenuEffects } from 'src/app/modules/admin/modules/menu/store/menu.effects';
import { PastryCardComponent } from 'src/app/shared/components/pastry-card/pastry-card.component';
import { InformationPopoverComponent } from 'src/app/shared/components/information-popover/information-popover.component';

@NgModule({
  imports: [
    MenuRoutingModule,
    CommonModule,
    EffectsModule.forFeature([MenuEffects]),
    PastryCardComponent,
    InformationPopoverComponent,
    PastryFormComponent,
],
})
export class MenuModule { }
