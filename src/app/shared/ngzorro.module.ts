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
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzBadgeModule } from 'ng-zorro-antd/badge';

@NgModule({
  exports: [
    NzAvatarModule,
    NzLayoutModule,
    NzGridModule,
    NzCardModule,
    NzMenuModule,
    NzIconModule,
    NzDividerModule,
    NzBadgeModule,
    NzButtonModule,
    NzSelectModule,
    NzPageHeaderModule,
    NzCollapseModule,
    NzSkeletonModule,
    NzTabsModule,
    NzInputModule,
    NzResultModule,
    NzModalModule,
  ],
  declarations: [],
})
export class NgZorroModule {}
