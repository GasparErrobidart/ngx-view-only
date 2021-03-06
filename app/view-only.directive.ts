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
  rows : any = {}
  aproximatedHeight : number = 0
  fillingViewPort : boolean = false
  fillingViewPortTimeout : any
  fillingViewPortBackTimeout : any
  boundriesTimeout : any

  resizeTimeout : any

  _previous : any = { first : null,  last : null , length : 0 }
  _changedDom : any = { first : false , last : false, length : false }

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

      this.restart()

    }
  }


  restart(){
    this.inView = []
    this.VEbefore = []
    this.VEafter = []
    this.DOMElements = []
    this.visible = []
    this.rows = {}
    this.aproximatedHeight = 0
    this.fillingViewPort = false
    this._previous = { first : null,  last : null , length : 0 }
    this._changedDom = { first : false , last : false, length : false }
    clearTimeout(this.fillingViewPortTimeout)
    clearTimeout(this.fillingViewPortBackTimeout)
    clearTimeout(this.boundriesTimeout)
    clearTimeout(this.resizeTimeout)
    this.transmit()
    if(this.ready) setTimeout(()=>{this.main()},10)
  }

  @HostListener("window:resize", ['$event'])
  resize(){
    if(this.window && this.ready){
      clearTimeout(this.resizeTimeout)
      this.resizeTimeout = setTimeout(()=>{this.restart()},10)
    }
  }

  @HostListener("window:scroll", ['$event'])
  main(){
    // console.clear()
    // console.log("\n\n------------------------------------\n\n")

    if(this.window && this.ready){
      // console.log("Col count",this.colCount())
      this.calculateView()
      this.calculateDocumentHeight()
      this.updateDOMElements()
      // if(this._changedDom.first || this._changedDom.last){
        this.setBoundries()
        this.rows = this.getRows(this.inView)
      // }
      this.fillViewPort()
      // console.log("Filling viewport",this.fillingViewPort)
      this.selectVisibleElements()
      this.transmit()
      this.calculatePadding()
      // console.log(this.inView)
    }
  }

  addElement(data,i){
    // console.log(i,"ADD ELEMENT",data)
    // console.log("Adding element ",i)
    this.inView.push({
      _localID : i,
      _inViewData : null,
      data : data
    })
  }

  getRows(list : any[]){
    let rows = {}
    // console.log("In view rows ",list)
    list.forEach((el)=>{
      if(el._inViewData && el._inViewData.boundries){
        if(!rows.hasOwnProperty(el._inViewData.boundries.top)) rows[el._inViewData.boundries.top] = []
        rows[el._inViewData.boundries.top].push(el)
      }
    })
    return rows
  }

  getLastRow(){
    let heights : any = Object.keys(this.rows).sort((a,b)=> parseInt(b)-parseInt(a) )
    return (heights.length > 0) ? this.rows[heights[0]] : null
  }

  rowCount(){
    return Object.keys(this.rows).length
  }

  colCount(){
    // console.log("Rows:",this.rows)
    let rowPositions = Object.keys(this.rows)
    if( rowPositions.length < 1 ) return 1
    return this.rows[ rowPositions[0] ].length
  }

  fillViewPort(){
    // console.log("FILL VIEW PORT")
    clearTimeout(this.fillingViewPortTimeout)
    // console.log("AFTER",this.after)
    // console.log("AFTER VIEW REPORT",this.isInView(this.after))
    let lastRow = this.getLastRow()

    let isLastVisible = (this.visible.length > 0 && this.VEafter.length == 0)
    let totalElementCount = this.inView.length

    if(this.isInView(this.after).visible && this.elements.length > this.inView.length && (isLastVisible || totalElementCount <= 0) || ( this.rowCount() > 1 && lastRow.length != this.colCount()) ){


      if(( (this.fillingViewPort && this._changedDom.last) || !this.fillingViewPort ) || totalElementCount == 0 ){
        this.fillingViewPort = true
        let offset = (this.rowCount() > 1) ? this.colCount() : 1
        if(offset < 1 ) offset = 1
        // console.log("FILL VIEWPORT, OFFSET:",offset)
        for(let i = 0; i < offset ; i ++){
          // console.log("For: i",i," < offset",offset)
          if(this.elements.length > this.inView.length) this.addElement(this.elements[this.inView.length],this.inView.length)
        }
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

    if(this.DOMElements.length > 0){

      let first = this.DOMElements[0].getAttribute("viewonlyindex")
      let last = this.DOMElements[this.DOMElements.length-1].getAttribute("viewonlyindex")

      this._changedDom = {
        first : first != this._previous.first ,
        last : last != this._previous.last ,
        length : this._previous.length != this.DOMElements.length
      }

      this._previous = { first, last, length : this.DOMElements.length }
    }

    // console.log("DOM CHANGE",this._changedDom)

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
    // console.log("Calculate View",this.window.pageYOffset)
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
      slice.end = (this.DOMElements.length > 0) ? parseInt(this.DOMElements[this.DOMElements.length-1].getAttribute("viewonlyindex"))+ this.colCount()+1 : slice.start+this.colCount()
      splitSections(slice)

      this.fillingViewPortBackTimeout = setTimeout(()=>{
        this.main()
      },1)


    }else if(this.isInView(this.before).visible && this.VEbefore.length > 0){

      slice.start = this.VEbefore.length - this.colCount()
      slice.end = (this.DOMElements.length > 0) ? parseInt(this.DOMElements[this.DOMElements.length-1].getAttribute("viewonlyindex"))+1 : this.VEbefore.length
      splitSections(slice)
      this.fillingViewPortBackTimeout = setTimeout(()=>{
        this.main()
      },1)



    }else if(this.visible.length + this.VEbefore.length + this.VEafter.length == 0 && this.DOMElements.length == 0){

      slice.end = this.colCount()
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
      if(this.VEbefore.length > 0) beforeHeight = Math.ceil(this.VEbefore.length/this.colCount()) * this.aproximatedHeight
      if(this.VEafter.length > 0) afterHeight = Math.ceil(this.VEafter.length/this.colCount()) * this.aproximatedHeight
      this.before.style.height = beforeHeight + "px"
      this.after.style.height = afterHeight + "px"

    // }
  }

}
