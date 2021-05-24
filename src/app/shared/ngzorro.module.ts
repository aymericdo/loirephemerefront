import { NgModule } from '@angular/core';

import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';

@NgModule({
  exports: [
    NzAvatarModule,
    NzLayoutModule,
    NzGridModule,
    NzCardModule,
    NzMenuModule,
    NzIconModule,
    NzDividerModule,
    NzButtonModule,
    NzModalModule,
  ],
  declarations: [],
})
export class NgZorroModule {}
