import { Injectable } from '@angular/core';
import { HttpClient , HttpHeaders } from '@angular/common/http';


@Injectable()
export class FlyerDriverService{

  map : any;
  config : any;
  flyerList : any[];

  constructor( private http : HttpClient ){
  }


  getExtensionFromName(name){
    let ext = name.match(/\.[a-z A-Z 0-9]+$/gi)[0]
    ext = ext.replace(/^\./,'').replace("jpg","jpeg")
    return ext;
  }

  upload(metadata,file){

    return new Promise((resolve,reject)=>{

      metadata.extension = this.getExtensionFromName(file.name)
      let formData = this.generateFormData({metadata})
      formData.append('file',file,file.name)

      const httpOptions = {
        headers: new HttpHeaders({
          'Accept' : 'application/json'
        })
      };

      this.http.post('/api/flyerdriver/post/file', formData, httpOptions)
          .subscribe(
              resolve,
              reject
          )

    }) // <--END PROMISE

  }

  generateFormData(data){
    let formData = new FormData();
    Object.keys(data).forEach(key=>{
      let value = data[key]
      if(typeof value == "object") value = JSON.stringify(value)
      formData.append(key,value)
    })
    return formData;
  }

  getById(id,opts){
    return new Promise((resolve,reject)=>{

      this.getFlyerList(opts).then((list)=>{
        try{
          resolve((<any[]>list).find(flyer=> id == `${flyer.type}_${flyer.id}`));
        }catch(e){
          reject(e);
        }
      });

    });
  }

  exists(type,id){
    return new Promise((resolve,reject)=>{
      this.getFlyerList({}).then((list)=>{
        resolve((<any[]>list).find(flyer=> flyer.type == type && flyer.id == id));
      });
    })
  }



  getFlyerList(opts){

    const buildList = (map)=>{

      let list = [];
      let flyerTypes = Object.keys(map.flyer);
      flyerTypes.forEach(type=>{

        let flyersId = Object.keys(map.flyer[type]);
        flyersId.forEach(id=>{

          let aspectRatioNames = Object.keys(map.flyer[type][id]);
          let format = {};
          aspectRatioNames.forEach(aspectRatio=>{

            let resolutionKeys = Object.keys(map.flyer[type][id][aspectRatio]);
            format[aspectRatio] = {};
            resolutionKeys.forEach(resolution=>{

              format[aspectRatio][resolution] = { objKey : map.flyer[type][id][aspectRatio][resolution]['objKey'] };
            });
          })
          let metadata = {};
          switch(type){
            case 'artist':
              metadata = { artist : id};
              break
            case 'event':
              metadata = { event : id};
              break
            case 'venue':
              metadata = { venue : id};
              break
            case 'artist_venue':
              metadata = {
                venue : id.replace(/^[a-zA-Z0-9-]+/gi,'').replace("\_",''),
                artist : id.replace(/[a-zA-Z0-9-]+$/gi,'').replace("\_",'')
              };
              break

          }

          let originalItem = "https://flyerdriver.com";
          if(map.flyer[type] && map.flyer[type][id] && map.flyer[type][id]['original'] && map.flyer[type][id]['original']['original']['objKey']){
            originalItem = map.flyer[type][id]['original']['original']['objKey']

            if(map.flyer[type] && map.flyer[type][id] && map.flyer[type][id]['squared'] && map.flyer[type][id]['squared']['640']){
              originalItem = map.flyer[type][id]['squared']['640']['objKey']
            }

            let listElement = {
              type : type,
              id : id,
              objKey : originalItem,
              format : format
            };

            Object.keys(metadata).forEach(key=>{
              listElement[key] = metadata[key];
            });

            list.push(listElement);

          }else{

            delete map.flyer[type][id]

          }

        })
      })

      return list.filter((item)=> !/gz$/gi.test(item.objKey) );
    }
    // console.log("Service, buildList with opts:",opts)
    return new Promise((resolve,reject)=>{
      if(this.flyerList && !opts.reload){
        resolve(this.flyerList);
      }else{

        this.getMap(opts).then((map)=>{
          if(this.map.flyer && Object.keys(this.map.flyer).length > 0){
            this.flyerList = buildList(this.map);
          }else{
            this.flyerList = []
          }

          resolve(this.flyerList);
        });

      }
    });

  }

  getConfig(){

    return new Promise((resolve,reject)=>{
      if(this.config){
        resolve(this.config);
      }else{
        this.http.get("/api/flyerdriver/get/config").subscribe(
          (data)=>{
            this.config = data;
            resolve(this.config);
          }
        );
      }
    });

  }

  getMap(opts){
    // console.log("Getting map",opts)
    return new Promise((resolve,reject)=>{

      if(this.map && !opts.reload){
        resolve(this.map);
      }else{
        // console.log("Truly requesting")
        this.http.get("/api/flyerdriver/get/resource-map").subscribe(
          (data)=>{
            this.map = data;
            // console.log(data)
            // console.log("Flyer driver map response",data)
            resolve(this.map);
          }
        );
      }

    });

  }

}
