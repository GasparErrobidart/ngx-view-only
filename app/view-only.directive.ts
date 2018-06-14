import {
  Directive,
  Inject,
  ElementRef,
  HostListener,
  EventEmitter,
  Output,
  Input,
  Renderer2
} from '@angular/core'

@Directive({
  selector: '[viewonly]'
})

export class ViewOnlyDirective {

  before : any
  after  : any
  itemCount : number = 1
  inView : any = []
  window : any = false
  body : any
  html : any
  view : any
  start : number
  end : number
  documentHeight : number
  _incrementCountTimeout : any
  DOMElements : any[]
  OOVElements : any[]
  virtualElements : any
  @Input() elements : any
  @Output() update = new EventEmitter()

  constructor(
    private list : ElementRef,
    private renderer : Renderer2
  ){
    if(window){
      this.window = window
      this.body = document.body
      this.html = document.documentElement
    }
  }

  ngOnInit(){
    if(window){
      const before = document.createElement('div')
      const after = document.createElement('div')

      this.renderer.setProperty(before, 'id', 'ngx-view-only-before')
      this.renderer.setProperty(after, 'id', 'ngx-view-only-after')

      this.list.nativeElement.appendChild(after)
      this.list.nativeElement.insertBefore(before,this.list.nativeElement.firstChild)
      this.before = document.getElementById('ngx-view-only-before')
      this.after = document.getElementById('ngx-view-only-after')

      this.before.style.width = "100%"
      this.after.style.width = "100%"

      this.virtualElements = { before : [] , visible : [] , after : [] }

    }
  }

  @HostListener("window:scroll", ['$event'])
  main(){
    if(this.window){
      this.calculateView()
      this.calculateDocumentHeight()
      this.incrementItemCount()
      this.updateDOMElements()
      this.updateVirtualElements()
      this.selectElementsInView()
      this.calculatePadding()
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
    let offsetToBottom = this.view.height * 1.0
    if(this.view.bottom >= this.documentHeight - offsetToBottom && this.itemCount <= this.elements.length){
      this.itemCount += 1
      this.inView.push(this.elements[this.itemCount-1])
      this._incrementCountTimeout = setTimeout(()=>this.main(),100)
    }
  }

  updateDOMElements(){
    this.DOMElements = Array.from(this.list.nativeElement.children)
  }

  updateVirtualElements(){
    this.DOMElements.forEach((el,i)=>{
      let visibility = this.isInView(el)
      if(visibility.vertical == "isAbove"){
        this.virtualElements.before.push({ el, i })
      }else if(visibility.visible){
        this.virtualElements.visible.push({el,i})
      }
    })
  }

  ngOnChanges(sch){
    if(sch.hasOwnProperty("elements")){
      this.start=this.elements.length
      this.end=0
      this.main()
    }
  }

  isInView(element : any){

    let verticalVisibility, horizontalVisibility, boundries = element.getBoundingClientRect()

    if(boundries.bottom >= 0 && boundries.bottom <= this.view.height+element.offsetHeight){
      verticalVisibility = "isAtCenter"
    }else if(boundries.bottom >= 0){
      verticalVisibility = "isBeneath"
    }else if(boundries.bottom < 0){
      verticalVisibility = "isAbove"
    }

    if(boundries.right >= 0 && boundries.right <= this.view.width+element.offsetWidth){
      horizontalVisibility = "isAtCenter"
    }else if(boundries.right >= 0){
      horizontalVisibility = "isNext"
    }else if(boundries.right < 0){
      horizontalVisibility = "isBefore"
    }

    let result = {
      horizontal : horizontalVisibility,
      vertical : verticalVisibility,
      visible : horizontalVisibility=="isAtCenter" && verticalVisibility=="isAtCenter"
    }

    return result

  }


  selectElementsInView(){
    // if(this.elements && this.elements.length > 0){
    //   let min = (this.DOMElements.length > 0) ? this.start : this.start = 0
    //   let max = (this.DOMElements.length > 0) ? this.itemCount : this.itemCount
    //   this.inView = this.elements.slice(min,max+1)
    //   console.log("[ViewOnly] \nmin:",min,"max:",max,"itemCount:",this.itemCount,"start:",this.start,"end:",this.end)
    //
    //   // REPLACE ELEMENTS OUT OF VIEW WITH PADDING
    //
    //   // BEFORE HEIGHT += VIRTUAL.ELEMENTS.BEFORE.EACH.HEIGHT
    //   // AFTER HEIGHT += VIRTUAL.ELEMENTS.AFTER.EACH.HEIGHT
    //
    //
    //
    //
    // }

  }

  calculatePadding(){
    // let height = 0
    // this.virtualElements.before.forEach(el=> height += parseInt(el.el.style.height.replace('px','')))
    // this.before.style.height = this.virtualElements.before
  }

  transmit(){
    this.update.emit(this.inView.slice(this.virtualElements.before.length,this.inView.length - this.virtualElements.before.length))
  }



}
