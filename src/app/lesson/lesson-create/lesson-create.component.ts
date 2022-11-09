import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl,Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Lesson } from '../lesson.model';
import { LessonService } from '../lesson.service';
import {Subscription} from 'rxjs';
import { AuthService } from '../../auth/auth.service';


@Component({
  selector: 'app-lesson-create',
  templateUrl: './lesson-create.component.html',
  styleUrls: ['./lesson-create.component.css'],
})
export class LessonCreateComponent implements OnInit, OnDestroy {
  lessonForm: FormGroup;
  lessonData: Lesson;
  editMode = false;
  isLoading=false;
  private lessonId=null;
  private creator=null;

  private authStatusSub: Subscription;

  constructor(
    private lessonService: LessonService,
    public activatedRoute: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit() {

    this.authStatusSub=this.authService
                          .getAuthStatusListener()
                          .subscribe(authStatus=>{
                            this.isLoading=false;
                          });

    this.activatedRoute.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('lessonId')) {
        this.editMode = true;
        this.lessonId = paramMap.get('lessonId');
        this.isLoading=true;
        this.lessonService.getLesson(this.lessonId)
                        .subscribe(lessonDataObtained=>{
                          this.isLoading=false;
                          this.lessonData=lessonDataObtained.lesson
                          this.creator=this.lessonData.creator
                          // //console.log(lessonDataObtained)
                          // //console.log("on edit")
                          // //console.log("this.lessonData=",this.lessonData)
                          this.lessonForm = new FormGroup({
                            lessonName: new FormControl(this.lessonData.lessonName,{validators:[Validators.required,]}),
                          });
                          // this.lessonForm.setValue({
                          //   lesson:this.lessonData.lesson,                             
                          // })
                        })
      } else {
        this.editMode = false;
        this.lessonId = null;
        this.creator=null;
        this.lessonForm = new FormGroup({
          lessonName: new FormControl('',{validators:[Validators.required,]}),
        });
      }
    });
  }

  onSubmit() {
    //console.log("lesson create=",this.lessonForm.value);
    if (this.lessonForm.invalid) {
      return;
    }
    
    const lessonData: Lesson = {_id: this.lessonId,lessonName: this.lessonForm.value.lessonName,creator:this.creator};
    this.isLoading=true;
    if (!this.editMode) {
      this.lessonService.addLesson(lessonData);
    }else{
      this.lessonService.updateLesson(lessonData);
    }
    this.lessonForm.reset();
    this.isLoading=false;
  }

  ngOnDestroy(){
    this.authStatusSub.unsubscribe();
  }
}
