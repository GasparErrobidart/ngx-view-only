import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewOnlyDirective } from './view-only.directive';

@NgModule({
  imports : [CommonModule],
  exports : [ViewOnlyDirective]
})

export class ViewOnlyModule {}
