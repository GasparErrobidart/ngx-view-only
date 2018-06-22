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
  ready : boolean = false
  documentHeight : number
  _incrementCountTimeout : any
  DOMElements : any[]
  OOVElements : any[]
  virtualElements : any = { before : [] , visible : [] , after : [] }
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


      this.main()
      this.ready = true

    }
  }

  @HostListener("window:scroll", ['$event'])
  main(){
    if(this.window){
      this.calculateView()
      this.calculateDocumentHeight()
      // this.incrementItemCount()
      this.updateDOMElements()
      this.updateVirtualElements()
      this.selectElementsInView()
      this.transmit()
      this.calculatePadding()
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
    // console.log("DOCUMENT HEIGHT:",this.documentHeight,"VIEW BOTTOM:",this.view.bottom)
    clearTimeout(this._incrementCountTimeout)
    let offsetToBottom = this.view.height * 0.1
    if(this.view.bottom >= this.documentHeight - offsetToBottom && this.itemCount <= this.elements.length){
      this.itemCount += 1
      this.inView.push(this.elements[this.itemCount-1])
      this._incrementCountTimeout = setTimeout(()=>this.main(),100)
    }
  }

  updateDOMElements(){
    this.DOMElements = Array.from(this.list.nativeElement.children)
  }



  ngOnChanges(sch){
    if(sch.hasOwnProperty("elements")){
      this.start=this.elements.length
      this.end=0
      if(this.ready) this.main()
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

  updateVirtualElements(){
    clearTimeout(this._incrementCountTimeout)
    this.virtualElements.visible = []
    this.DOMElements.slice(1,this.DOMElements.length-1).forEach((el,i)=>{

      let index = i += this.virtualElements.before.length -1

      let visibility = this.isInView(el)
      if(visibility.vertical == "isAbove"){


        if(!(this.virtualElements.before.find((element) => element.index == index))) this.virtualElements.before.push({ el, index , boundries : visibility.boundries })

        let found = false
        this.virtualElements.visible.find((element,x) =>{
          if(element.index == index) found = x
          return element.index == index
        })
        if(found != false) this.virtualElements.visible.splice(found,1)




      }else if(visibility.vertical == "isBeneath"){

        if(!(this.virtualElements.after.find((element) => element.index == index))) this.virtualElements.after.push({ el, index , boundries : visibility.boundries })

        let found = false;
        this.virtualElements.visible.find((element,x) =>{
          if(element.index == index) found = x
          return el.index == index
        })
        if(found != false) this.virtualElements.visible.splice(found,1)

      }else if(visibility.visible){
        this.virtualElements.visible.push({el, index , boundries : visibility.boundries})
      }
    })

    let beforeVisibility = this.isInView(this.before)
    let afterVisibility = this.isInView(this.after)

    if(beforeVisibility.visible && this.virtualElements.before.length > 0){
      this.virtualElements.before.splice(this.virtualElements.before-3,3)
        .forEach(el => this.virtualElements.visible.unshift(el))
    }



    if(afterVisibility.boundries.top > -100){
      // console.log("AFTER VISIBLE")
      if(this.virtualElements.after.length > 0){
        this.virtualElements.after.splice(this.virtualElements.after-3,3)
          .forEach(el => this.virtualElements.visible.push(el))
      }else{
        // console.log("ITEM COUNT",this.itemCount)

        this.itemCount += 1
        this.inView.push(this.elements[this.itemCount-1])
        this._incrementCountTimeout = setTimeout(()=>this.main(),100)
      }
    }


  }

  calculatePadding(){
    // console.log("Virtual elements",this.virtualElements)
    let newHeightBefore = 0 + "px"
    // console.log("New height",newHeight)

    if(this.virtualElements.before.length > 0){
      // console.log("DOME ELEMENTS:",this.DOMElements)
      // console.log("Virtual Elements:",this.virtualElements)
      // console.log(this.DOMElements.slice(1,this.DOMElements.length-1))
      // console.log("Height", this.virtualElements.before , "Virtual elements before:",this.virtualElements.before.length)
      newHeightBefore = (this.virtualElements.before[0].boundries.height * Math.ceil(this.virtualElements.before.length/3)) + "px"
    }

    let newHeightAfter = 0 + "px"
    if(this.virtualElements.after.length > 0){
      // console.log("DOME ELEMENTS:",this.DOMElements)
      // console.log("Height", this.virtualElements.after , "Virtual elements before:",this.virtualElements.after.length)
      newHeightAfter = (this.virtualElements.after[0].boundries.height * Math.ceil(this.virtualElements.after.length/3)) + "px"
      // console.log("New height",newHeightAfter)

    }

    this.after.style.height = newHeightAfter
    this.before.style.height = newHeightBefore
  }

  transmit(){
    let result = this.inView.slice(this.virtualElements.before.length,this.inView.length - this.virtualElements.after.length)
    console.clear()
    console.log(this.virtualElements)
    console.log("Rendering ",result.length," elements.")
    this.update.emit(result)
  }



}
