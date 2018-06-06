import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewOnlyDirective } from './view-only.directive';

@NgModule({
  imports : [CommonModule],
  declarations : [ViewOnlyDirective],
  exports : [ViewOnlyDirective]
})

export class ViewOnlyModule {}
