import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { Lesson } from './lesson.model';
import Swal from 'sweetalert2';
import { environment } from '../../environments/environment';

const ENV_URL=environment.apiUrl;
const BACKEND_URL=ENV_URL+"/lessons";

@Injectable()
export class LessonService {
  private lessons: Lesson[] = [];
  private lessonsUpdated = new Subject<{lessons:Lesson[], lessonCount:number}>();
  private lessonsOnly: string[] = [];
  private lessonsOnlyUpdated = new Subject<{lessonsOnly:string[]}>();


  private homeLessonProp: BehaviorSubject<{totalPosts:number, clicked:boolean}> = new BehaviorSubject<{totalPosts:number, clicked:boolean}>({totalPosts:0, clicked:false});
  public homeLessonProp$: Observable<{totalPosts:number, clicked:boolean}> = this.homeLessonProp.asObservable();

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

  setHomeLessonProp(totalPosts:number, clicked:boolean){
    this.homeLessonProp.next({totalPosts:totalPosts, clicked: clicked})
  }

  getLessons(postsPerPage:number, currentPage: number) {
    const queryParams=`?pagesize=${postsPerPage}&currentpage=${currentPage}`;
    this.httpClient
      .get<{ message: string; lessons: Lesson[], maxLessons:number }>(
        BACKEND_URL+queryParams
      )
      .subscribe((lessonData) => {
        //console.log("lessonData=",lessonData)
        this.lessons = lessonData.lessons;
        this.lessonsUpdated.next({lessons:[...this.lessons], lessonCount:lessonData.maxLessons});
      });
  }
  getLessonUpdateListener() {
    return this.lessonsUpdated.asObservable();
  }

  getLessonsWithFilters(
    postsPerPage: number,
    currentPage: number,
    searchText: string
  ) {
    // return [...this.lessons];
    let queryParams = `?pagesize=${postsPerPage}&currentpage=${currentPage}&searchtext=${searchText}`;
    if (searchText == "") {
      queryParams = `?pagesize=${postsPerPage}&currentpage=${currentPage}`;
    }
    ////console.log(queryParams);
    this.httpClient
      .get<{ message: string; lessons: Lesson[]; maxLessons: number }>(
        BACKEND_URL+"/search" + queryParams
      )
      .subscribe(postData => {
        this.lessons = postData.lessons;

        ////console.log(postData);
        this.lessonsUpdated.next({
          lessons: [...this.lessons],
          lessonCount: postData.maxLessons
        });
      });
  }
  
  getLessonsOnly() {
    this.httpClient
      .get<{ lessonsOnly: any[] }>(
        BACKEND_URL+'/lessononly'
      )
      .subscribe((lessonData) => {
        this.lessonsOnly = lessonData.lessonsOnly;
        this.lessonsOnlyUpdated.next({lessonsOnly:[...this.lessonsOnly]});
      });
  }
  getLessonOnlyUpdateListener() {
    return this.lessonsOnlyUpdated.asObservable();
  }

  getLesson(lessonId:string){
    return this.httpClient.get<{lesson:Lesson}>(BACKEND_URL+"/"+lessonId);
  }

  getTotalNoOfLessons(){
    return this.httpClient.get<{message:string; totalLessons:number}>(BACKEND_URL+'/total')
  }

  addLesson(lesson: Lesson) {
    this.httpClient
      .post<{ message: string, lessonId:string }>(BACKEND_URL, lesson)
      .subscribe((responseData) => {
        //console.log("responseData.message=",responseData);
        this.Toast.fire({
          icon: 'success',
          title: 'Lesson Added Successfully'
        })
        this.router.navigate(['/lesson']);   
      });
  }

  addLessonThroughExcel(lesson: Lesson) {
    return this.httpClient
      .post<{ message: string, lessonId:string }>(BACKEND_URL, lesson)
     
  }
  
  updateLessonThroughExcel(lesson: Lesson) {
    return this.httpClient.put(BACKEND_URL+"/"+lesson._id, lesson)
  }

  updateLesson(lesson: Lesson){
    //console.log("in updateLesson",lesson)
    this.httpClient.put(BACKEND_URL+"/"+lesson._id, lesson)
    .subscribe(response=>{
      // //console.log(response)
      this.Toast.fire({
        icon: 'success',
        title: 'Lesson Updated Successfully'
      })
      this.router.navigate(['/lesson']);
    })
  }

  deleteLesson(lessonId: string) {
    return this.httpClient
      .delete(BACKEND_URL+'/' + lessonId)
     
  }
}
