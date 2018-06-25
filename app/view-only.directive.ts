import {
  Directive
} from '@angular/core'

@Directive({
  selector: '[viewonly]'
})

export class ViewOnlyDirective {


  before : any
  after  : any
  window : any = false
  body : any
  html : any
  view : any
  ready : boolean = false
  documentHeight : number
  inView : any = []
  DOMElements : any[]
  visible : any[]
  @Input() elements : any = []
  @Output() update = new EventEmitter()

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

      this.main()
      this.ready = true

    }
  }

  ngOnChanges(sch){
    if(sch.hasOwnProperty("elements")){
      this.assignElements()
      if(this.ready) this.main()
    }
  }

  assignElements(){
    this.inView = this.elements.map((element , i)=>{
      return {
        _localID : i,
        data : element
      }
    })
  }

  @HostListener("window:scroll", ['$event'])
  main(){
    if(this.window){
      this.calculateView()
      this.calculateDocumentHeight()
      this.updateDOMElements()
      this.selectVisibleElements()
    }
  }

  updateDOMElements(){
    this.DOMElements = Array.from(this.list.nativeElement.children)
    if(this.DOMElements.length > 0) this.DOMElements = this.DOMElements.slice(1,this.DOMElements.length-1)
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
    this.visible = this.DOMElements.filter((element)=>{
      return this.isInView(element).visible
    })
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
