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
  aproximatedHeight : number = 0
  fillingViewPort : boolean = false
  fillingViewPortTimeout : any
  fillingViewPortBackTimeout : any
  boundriesTimeout : any
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
    console.clear()
    if(this.window && this.ready){
      this.calculateView()
      this.calculateDocumentHeight()
      this.updateDOMElements()
      this.fillViewPort()
      this.selectVisibleElements()
      this.transmit()
      this.calculatePadding()
      clearTimeout(this.boundriesTimeout)
      this.boundriesTimeout = setTimeout(()=>{
        this.setBoundries()
      },50)
      console.log(this.inView)
    }
  }

  addElement(data,i){
    // console.log(i,"ADD ELEMENT",data)
    this.inView.push({
      _localID : i,
      _inViewData : null,
      data : data
    })
  }

  getRows(list : any[]){
    let rows = {}
    list.forEach((el)=>{
      if(!rows.hasOwnProperty(el._inViewData.boundries.top)) rows[el._inViewData.boundries.top] = []
      rows[el._inViewData.boundries.top].push(el)
    })
    return rows
  }

  fillViewPort(){
    // console.log("FILL VIEW PORT")
    clearTimeout(this.fillingViewPortTimeout)
    // console.log("AFTER",this.after)
    // console.log("AFTER VIEW REPORT",this.isInView(this.after))

    let isLastVisible = (this.visible.length > 0 && this.VEafter.length == 0)
    let totalElementCount = this.inView.length

    if(this.isInView(this.after).visible && this.elements.length > this.inView.length && (isLastVisible || totalElementCount <= 0) ){
      this.fillingViewPort = true
      for(let i = 0; i < 3; i ++){
        this.addElement(this.elements[this.inView.length],this.inView.length)
      }
      this.fillingViewPortTimeout = setTimeout(()=>{
        this.main()
      },1)
    }else{
      // console.log("  - AFTER IS NOT IN VIEW")
      this.fillingViewPort = false
    }
  }

  updateDOMElements(){
    // console.log("UPDATING DOM ELEMENTS")
    this.DOMElements = Array.from(this.list.nativeElement.children)
    if(this.DOMElements.length >= 2) this.DOMElements = this.DOMElements.slice(1,this.DOMElements.length-1)
    this.DOMElements = this.DOMElements.filter((el)=> this.isInView(el).visible )
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
    console.log("Calculate View",this.window.pageYOffset)
    return this.view
  }

  calculateDocumentHeight(){
    this.documentHeight = Math.max( this.body.scrollHeight, this.body.offsetHeight,this.html.clientHeight, this.html.scrollHeight, this.html.offsetHeight );
  }


  selectVisibleElements(){

    clearTimeout(this.fillingViewPortBackTimeout)
    let slice = { start : 0 , end : 0 }

    const splitSections = (slice)=>{
      // VE stands for Virtual Elements
      if(this.fillingViewPort){
        slice.end = this.inView.length
      }
      let afterEnd = this.inView.length-1;
      if(afterEnd < 0) afterEnd = 0
      this.visible  = this.inView.slice(slice.start,slice.end)
      this.VEbefore = this.inView.slice(0,slice.start)
      this.VEafter  = this.inView.slice(slice.end,afterEnd)
    }

    if(this.DOMElements.length > 0 && ((!this.isInView(this.after).visible && !this.isInView(this.before).visible) || (this.VEbefore.length == 0 && this.VEafter.length == 0) || this.fillingViewPort) ){

      let first = this.DOMElements[0]
      let last = this.DOMElements[this.DOMElements.length-1]
      slice = {
        start : parseInt(first.getAttribute("viewonlyindex")),
        end   : parseInt(last.getAttribute("viewonlyindex"))+1
      }
      splitSections(slice)

    }else if(this.isInView(this.after).visible && this.VEafter.length > 0){

      slice.start = (this.DOMElements.length > 0) ? parseInt(this.DOMElements[0].getAttribute("viewonlyindex")) : this.VEafter[0]._localID
      slice.end = (this.DOMElements.length > 0) ? parseInt(this.DOMElements[this.DOMElements.length-1].getAttribute("viewonlyindex"))+4 : slice.start+3
      splitSections(slice)

      this.fillingViewPortBackTimeout = setTimeout(()=>{
        this.main()
      },1)


    }else if(this.isInView(this.before).visible && this.VEbefore.length > 0){

      slice.start = this.VEbefore.length - 3
      slice.end = (this.DOMElements.length > 0) ? parseInt(this.DOMElements[this.DOMElements.length-1].getAttribute("viewonlyindex"))+1 : this.VEbefore.length
      splitSections(slice)
      this.fillingViewPortBackTimeout = setTimeout(()=>{
        this.main()
      },1)



    }else if(this.visible.length + this.VEbefore.length + this.VEafter.length == 0 && this.DOMElements.length == 0){
      slice.end = 3;
      splitSections(slice)



    }

  }

  setBoundries(){
    this.DOMElements.forEach((el)=>{
      this.inView[parseInt(el.getAttribute("viewonlyindex"))]._inViewData = this.isInView(el)
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

  transmit(){
    this.update.emit(this.visible)
  }

  calculatePadding(){
    // if(this.DOMElements.length > 0){
      let beforeHeight = 0
      let afterHeight = 0
      this.aproximatedHeight = (this.DOMElements.length > 0) ? this.DOMElements[0].getBoundingClientRect().height : this.aproximatedHeight
      if(this.VEbefore.length > 0) beforeHeight = Math.ceil(this.VEbefore.length/3) * this.aproximatedHeight
      if(this.VEafter.length > 0) afterHeight = Math.ceil(this.VEafter.length/3) * this.aproximatedHeight
      this.before.style.height = beforeHeight + "px"
      this.after.style.height = afterHeight + "px"

    // }
  }

}
