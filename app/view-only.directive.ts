import {
  Directive,
  Inject,
  ElementRef,
  HostListener,
  EventEmitter,
  Output,
  Input
} from '@angular/core'

@Directive({
  selector: '[viewonly]'
})

export class ViewOnlyDirective {

  before : ElementRef
  after  : ElementRef
  itemCount : number = 1
  inView : any
  window : any = false
  body : any
  html : any
  view : any
  documentHeight : number
  _incrementCountTimeout : any
  DOMElements : any[]
  @Input() elements : any
  @Output() update = new EventEmitter()

  constructor(
    private list : ElementRef
  ){
    if(window){
      this.window = window
      this.body = document.body
      this.html = document.documentElement
      console.log("Directive Ready")
    }
  }

  @HostListener("window:scroll", ['$event'])
  main(){
    if(this.window){
      this.calculateView()
      console.log("[ViewOnly] View:",this.view)
      this.calculateDocumentHeight()
      this.incrementItemCount()
      this.updateDOMElements()
      this.visibilityCheck()
      this.transmit()
    }
  }

  calculateView(){
    this.view =  {
      top:    this.window.pageYOffset,
      right:  this.window.pageXOffset + this.window.innerWidth,
      bottom: this.window.pageYOffset + this.window.innerHeight,
      left:   this.window.pageXOffset,
      height: this.window.innerHeight,
      width:  this.window.innerWidth
    }
    return this.view
  }

  calculateDocumentHeight(){
    this.documentHeight = Math.max( this.body.scrollHeight, this.body.offsetHeight,this.html.clientHeight, this.html.scrollHeight, this.html.offsetHeight );
  }

  incrementItemCount(){
    clearTimeout(this._incrementCountTimeout)
    let offsetToBottom = this.view.height * 1.7
    if(this.view.bottom >= this.documentHeight - offsetToBottom && this.itemCount <= this.elements.length){
      this.itemCount += 1
      this._incrementCountTimeout = setTimeout(()=>this.incrementItemCount(),100)
    }
  }

  updateDOMElements(){
    this.DOMElements = this.list.nativeElement.children
  }

  visibilityCheck(){
    this.DOMElements.forEach((el)=>{
      if(!this.isInView(el)){

      }
    })
  }

  isInView(element : ElementRef){
    let boundries = this.getElementBoundries(element)
    let verticalVisibility = boundries.top > this.view.bottom || boundries.bottom < this.view.top
    let horizontalVisibility = boundries.left > this.view.right || boundries.right < this.view.left
    return verticalVisibility && horizontalVisibility
  }

  getElementBoundries(element : ElementRef){
    let el = element.nativeElement
    return {
      top:     el.getBoundingClientRect().top,
      right:   el.getBoundingClientRect().left + el.offsetWidth,
      bottom:  el.getBoundingClientRect().top  + el.offsetHeight,
      left:    el.getBoundingClientRect().left,
      height:  el.offsetHeight,
      width:   el.offsetWidth
    }
  }

  transmit(){
    this.update.emit(this.inView)
  }



}
