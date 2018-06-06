import { Directive , Inject, ElementRef } from '@angular/core';
import { WindowRef } from './window/window-ref.service';

@Directive({
  selector: '[viewonly]'
})

export class ViewOnlyDirective {

  before  : ElementRef
  after   : ElementRef

  constructor(
    @Inject('window') window : WindowRef ,
    private list : ElementRef
  ){
    console.log("Directive Ready")
  }

}
