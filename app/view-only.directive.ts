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
  @Input() elements : any
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

  @HostListener("window:scroll", ['$event'])
  main(){
    if(this.window){
      this.calculateView()
      this.calculateDocumentHeight()
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


  /*
    before = row.each(Math.max(element.height))
    visible = elements.visible + offset
    after = row(total - visible - before).each(Math.max(element.height))
    inView = visible
  */



}
