import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { ContentService } from '../content/content.service';
import { LessonService } from '../lesson/lesson.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

  totalContents=0
  totalLessons=0
  contentsGroupByLesson=[]

  userIsAuthenticated = false;
  private authStatusSub: Subscription;
  userId: string;

  constructor(private contentService: ContentService, private lessonService: LessonService, private router:Router, private authService: AuthService) { }

  ngOnInit() {
    this.userId = this.authService.getUserId();
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe((isAuthenticated) => {
        this.userIsAuthenticated = isAuthenticated;
        this.userId = this.authService.getUserId();
      });

    this.contentService.getTotalNoOfContents().subscribe((backEndData)=>{
      // //console.log(backEndData)
      this.totalContents=backEndData.totalContents
    })

    this.lessonService.getTotalNoOfLessons().subscribe((backEndData)=>{
      // //console.log(backEndData)
      this.totalLessons=backEndData.totalLessons
    })

    this.contentService.getNoOfContentsGroupByLesson().subscribe((backEndData)=>{
      //console.log(backEndData.contentsGroupByLesson)
      this.contentsGroupByLesson=backEndData.contentsGroupByLesson;
    })

  }

  getTotalContents(searchTerm){
   
    this.contentService.setHomeContentProp(this.totalContents,searchTerm,true)
    this.router.navigate(["/content"])
  }

  getTotalLessons(){
   
    this.lessonService.setHomeLessonProp(this.totalLessons,true)
    this.router.navigate(["/lesson"])
  }

  ngOnDestroy(){
    this.authStatusSub.unsubscribe()
  }

}