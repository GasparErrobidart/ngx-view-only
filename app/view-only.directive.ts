import {
  Directive,
  Output,
  Input,
  ElementRef,
  Renderer2,
  HostListener,
  EventEmitter
} from '@angular/core'

@Directive({
  selector: '[viewonly]'
})

export class ViewOnlyDirective {

  VEbefore : any[] = []
  VEafter  : any[] = []
  window : any = false
  body : any
  html : any
  view : any
  ready : boolean = false
  documentHeight : number
  inView : any = []
  DOMElements : any[]
  visible : any[] = []
  before : any
  after : any
  fillingViewPort : boolean = false
  fillingViewPortTimeout : any
  @Input() elements : any = []
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
    if(this.window){
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

      this.ready = true
      this.main()
    }
  }

  ngOnChanges(sch){
    if(sch.hasOwnProperty("elements")){
      this.inView = []
      if(this.ready) this.main()
    }
  }

  @HostListener("window:scroll", ['$event'])
  main(){
    if(this.window && this.ready){
      this.calculateView()
      this.calculateDocumentHeight()
      this.updateDOMElements()
      this.fillViewPort()
      this.selectVisibleElements()
      this.transmit()
    }
  }

  addElement(data,i){
    console.log("ADD ELEMENT")
    this.inView.push({
      _localID : i,
      data : data
    })
  }

  fillViewPort(){
    console.log("FILL VIEW PORT")
    clearTimeout(this.fillingViewPortTimeout)
    if(this.isInView(this.after).visible && this.elements.length < this.inView.length){
      console.log("  - AFTER IS IN VIEW")
      this.fillingViewPort = true
      this.addElement(this.elements[this.inView.length],this.inView.length)
      this.fillingViewPortTimeout = setTimeout(()=>{
        this.fillViewPort()
        this.main()
      },100)
    }else{
      console.log("  - AFTER IS NOT IN VIEW")
      this.fillingViewPort = false
    }
  }

  updateDOMElements(){
    console.log("UPDATING DOM ELEMENTS")
    this.DOMElements = Array.from(this.list.nativeElement.children)
    if(this.DOMElements.length > 2) this.DOMElements = this.DOMElements.slice(1,this.DOMElements.length-2)
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

  selectVisibleElements(){
    console.log("SELECTING VISIBLE ELEMENTS")
    if(this.DOMElements.length > 2){
      let first = this.DOMElements[1]
      let last = this.DOMElements[this.DOMElements.length-2]
      console.log("FIRST",first)
      let slice = {
        start : first.attributes.find((el)=> el.name == "ViewOnlyIndex").value,
        end   : last.attributes.find((el) => el.name == "ViewOnlyIndex").value
      }
      this.visible  = this.inView.slice(slice.start,slice.end - slice.start)
      this.VEbefore = this.inView.slice(0,slice.start)
      this.VEafter  = this.inView.slice(slice.end,this.inView.length - this.before.length - this.visible.length)
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
      visible : horizontalVisibility=="isAtCenter" && verticalVisibility=="isAtCenter",
      boundries : boundries
    }

    return result

  }

  transmit(){
    this.update.emit(this.visible)
  }

  /*
    before = row.each(Math.max(element.height))
    visible = elements.visible + offset
    after = row(total - visible - before).each(Math.max(element.height))
    inView = visible

    inView element prototype = {
      _localID : this.elements.forEach(i),
      data : this.elements[i]
    }
  */



}
