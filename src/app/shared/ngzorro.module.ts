import { NgModule } from '@angular/core';

import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDividerModule } from 'ng-zorro-antd/divider';

@NgModule({
    exports: [
      NzAvatarModule,
      NzLayoutModule,
      NzGridModule,
      NzCardModule,
      NzMenuModule,
      NzIconModule,
      NzDividerModule,
    ],
    declarations: []
})
export class NgZorroModule { }
