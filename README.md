# ngx-view-only
Render only visible DOM nodes within a list of elements.

## Quick start
Install and save the module `npm install --save ngx-view-only`.
Import the module to your project
```
...
import { ViewOnlyModule } from 'ngx-view-only'

@NgModule({
    imports: [
      ...
      ViewOnlyModule,
      ...
    ]
})
```

Implement directive in your component
```
import { ViewOnlyDirective } from 'ngx-view-only'

@Component({
  ...
})

...
```

Component template:
```

<div viewonly [elements]="ArraySourceList" (update)="viewOnlyList = $event">

  <div *ngFor="let item of viewOnlyList" [attr.ViewOnlyIndex]="item._localID">
    {{item.data.title}} // title is just an example attribute
  </div>

</div>

```
- Add `viewonly` directive
- Assign the array of elements to the `elements` attribute
- Assign the processed list provided through the `update` event
- Generate your elements using the list from the previous step
- Each item must have a `ViewOnlyIndex` attribute with the `item._localID`

## TODO
- Balance uneven rows (The last row)
- Add support for scrolling elements other than window
- Unit tests
