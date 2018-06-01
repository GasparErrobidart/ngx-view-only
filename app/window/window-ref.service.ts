import { Injectable } from '@angular/core';

function _window() : any {
   if(typeof window !== "undefined") return window;
   return {};
}

@Injectable()
export class WindowRef {
   get nativeWindow() : any {
      return _window();
   }
}
