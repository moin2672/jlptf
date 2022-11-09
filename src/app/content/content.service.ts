import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { Content } from './content.model';
import Swal from 'sweetalert2';
import { environment } from '../../environments/environment';

const ENV_URL=environment.apiUrl;
const BACKEND_URL=ENV_URL+"/contents";
@Injectable()
export class ContentService {
  private contents: Content[] = [];
  private contentsUpdated = new Subject<{contents:Content[], contentCount:number}>();

  private contentPhoneNos=[]
private contentPhoneNosUpdated = new Subject<{contentPhoneNos:string[]}>();

private homeContentProp: BehaviorSubject<{totalPosts:number, searchLesson:string, clicked:boolean}> = new BehaviorSubject<{totalPosts:number, searchLesson:string, clicked:boolean}>({totalPosts:0, searchLesson:"", clicked:false});
  public homeContentProp$: Observable<{totalPosts:number, searchLesson:string, clicked:boolean}> = this.homeContentProp.asObservable();

  Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  })

  constructor(private httpClient: HttpClient,private router:Router) {}

  setHomeContentProp(totalPosts:number, searchLesson:string, clicked:boolean){
    this.homeContentProp.next({totalPosts:totalPosts, searchLesson:searchLesson, clicked: clicked})
  }

  getContents(postsPerPage:number, currentPage: number) {
    const queryParams=`?pagesize=${postsPerPage}&currentpage=${currentPage}`;
    this.httpClient
      .get<{ message: string; contents: Content[], maxContents:number }>(
        BACKEND_URL+queryParams
      )
      .subscribe((contentData) => {
        //console.log("contentData=",contentData)
        this.contents = contentData.contents;
        // this.contentPhoneNos=this.contents.map(cust=>cust.contentPhoneNo)
        this.contentsUpdated.next({contents:[...this.contents], contentCount:contentData.maxContents});
      });
  }

  getContentsWithFilters(
    postsPerPage: number,
    currentPage: number,
    searchText: string
  ) {
    // return [...this.contents];
    let queryParams = `?pagesize=${postsPerPage}&currentpage=${currentPage}&searchtext=${searchText}`;
    if (searchText == "") {
      queryParams = `?pagesize=${postsPerPage}&currentpage=${currentPage}`;
    }
    ////console.log(queryParams);
    this.httpClient
      .get<{ message: string; contents: Content[]; maxContents: number }>(
        BACKEND_URL+"/search" + queryParams
      )
      .subscribe(postData => {
        this.contents = postData.contents;

        ////console.log(postData);
        this.contentsUpdated.next({
          contents: [...this.contents],
          contentCount: postData.maxContents
        });
      });
  }

  getContentsNameWithFilters(
    postsPerPage: number,
    currentPage: number,
    searchText: string
  ) {
    // return [...this.contents];
    let queryParams = `?pagesize=${postsPerPage}&currentpage=${currentPage}&searchtext=${searchText}`;
    if (searchText == "") {
      queryParams = `?pagesize=${postsPerPage}&currentpage=${currentPage}`;
    }
    ////console.log(queryParams);
    this.httpClient
      .get<{ message: string; contents: Content[]; maxContents: number }>(
        BACKEND_URL+"/searchName" + queryParams
      )
      .subscribe(postData => {
        this.contents = postData.contents;

        ////console.log(postData);
        this.contentsUpdated.next({
          contents: [...this.contents],
          contentCount: postData.maxContents
        });
      });
  }

  getContentGroupList(){
    return this.httpClient
    .get<{ message: string; contentsGroupList: any[]; }>(
      BACKEND_URL+"/groupbyList"
    )
  }

  getContentUpdateListener() {
    return this.contentsUpdated.asObservable();
  }

  getContent(contentId:string){
    // return {...this.contents.find(p=>p._id===contentId)};
    return this.httpClient.get<{content:Content}>(BACKEND_URL+"/"+contentId);
  }


  getTotalNoOfContents(){
    return this.httpClient.get<{message:string; totalContents:number}>(BACKEND_URL+'/total')
  }

  getNoOfContentsGroupByLesson(){
    return this.httpClient.get<{message:string; contentsGroupByLesson:any[]}>(BACKEND_URL+'/groupby')
  }

getContentPhoneNos(){
  this.httpClient.get<{contentPhoneNos:any[]}>(BACKEND_URL+'/phone')
                .subscribe((custData)=>{
                  this.contentPhoneNos=custData.contentPhoneNos;
                  this.contentPhoneNosUpdated.next({contentPhoneNos:[...this.contentPhoneNos]})
                })
}

getContentPhoneNosUpdateListener() {
  return this.contentPhoneNosUpdated.asObservable();
}

  addContent(content: Content) {
    //console.log("adding content=",content)
    this.httpClient
      .post<{ message: string, contentId:string }>(BACKEND_URL, content)
      .subscribe((responseData) => {
        //console.log("responseData.message=",responseData);
        this.Toast.fire({
          icon: 'success',
          title: 'Content Added Successfully'
        })
        this.router.navigate(['/content']);   
      });
  }

  addContentThroughExcel(content: Content) {
    //console.log("adding content=",content)
    return this.httpClient
      .post<{ message: string, contentId:string }>(BACKEND_URL, content)
      
  }

  updateContentThroughExcel(content: Content) {
    //console.log("adding content=",content)
    return this.httpClient.put(BACKEND_URL+"/"+content._id, content)
      
  }

  updateContent(content: Content){
    //console.log("in updateContent",content)
    this.httpClient.put(BACKEND_URL+"/"+content._id, content)
    .subscribe(response=>{
      // //console.log(response)
      this.Toast.fire({
        icon: 'success',
        title: 'Content Updated Successfully'
      })
      this.router.navigate(['/content']);
    })
  }

  deleteContent(contentId: string) {
    return this.httpClient
      .delete(BACKEND_URL+'/' + contentId)
     
  }
}
