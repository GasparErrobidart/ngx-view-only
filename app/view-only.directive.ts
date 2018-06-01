import { Directive , ElementRef } from '@angular/core';
import { WindowRef } from './window/window-ref.service';

@Directive({
  selector: '[ViewOnly]'
})

export class ViewOnlyDirective {

  before  : ElementRef
  after   : ElementRef

  constructor( @Inject('window') window : WindowRef , private list : ElementRef ){
    
  }

}
