import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { ContentService } from '../content.service';

@Component({
  selector: 'app-content-group-list',
  templateUrl: './content-group-list.component.html',
  styleUrls: ['./content-group-list.component.css']
})
export class ContentGroupListComponent implements OnInit, OnDestroy {

  userIsAuthenticated = false;
  private authStatusSub: Subscription;
  userId: string="";
  isLoading=false;

  contentGroupList=[];

  constructor(private authService: AuthService,private contentService: ContentService) { }

  ngOnInit() {
    this.isLoading=true
    this.userId = this.authService.getUserId();
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe((isAuthenticated) => {
        this.userIsAuthenticated = isAuthenticated;
        this.userId = this.authService.getUserId();
      });

      this.contentService.getContentGroupList().subscribe((backEndData)=>{
        //console.log("backEndData=",backEndData)
        this.contentGroupList=backEndData.contentsGroupList;
        this.isLoading=false
      })

  }

  ngOnDestroy(){
    this.authStatusSub.unsubscribe();
  }

}