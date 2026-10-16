import { Global, Module } from '@nestjs/common';
import { OrgID } from './org-domain/org-domain.service';
import { Hostname } from './hostname/hostname';

@Global()
@Module({
  providers: [OrgID, Hostname],
  exports: [OrgID],
})
export class CommonModule { }
