import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Content } from '../content.model';
import { ContentService } from '../content.service';
import { fromEvent, Subscription } from 'rxjs';
import { map, } from 'rxjs/operators';
import { AuthService } from '../../auth/auth.service';
import { DateService } from '../../shared/date.service';
import { LessonService } from '../../lesson/lesson.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-content-create',
  templateUrl: './content-create.component.html',
  styleUrls: ['./content-create.component.css'],
})
export class ContentCreateComponent implements OnInit, AfterViewInit, OnDestroy {

  contents: Content[] = [];

  contentForm: FormGroup;
  contentData: Content;
  editMode = false;
  isLoading = false;
  mID = '';

  totalPosts = 0; //total no of posts
  postsPerPePronunciation = 10; //current pePronunciation
  currentPePronunciation = 1;
  pePronunciationSizeOptions = [10, 15, 20];

  lessonName_list = [];

  private contentId = null;
  private creator = null;

  private authStatusSub: Subscription;
  private lessonSub: Subscription;
  private contentSub: Subscription;

  constructor(
    private contentService: ContentService,
    private lessonService: LessonService,
    public activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private dateService: DateService,
    private router:Router
  ) {}



  ngOnInit() {
    this.editMode = false;
    this.contentId = null;
    this.creator = null;

    // GETTING LIST OF CUSTOMER NOS
    this.lessonService.getLessonsOnly();
    this.lessonSub = this.lessonService
      .getLessonOnlyUpdateListener()
      .subscribe((lessonData) => {
        this.lessonName_list = lessonData.lessonsOnly;
      });

    this.contentForm = new FormGroup({
      japanese: new FormControl('', { validators: [Validators.required] }),
      eMeaning: new FormControl('', { validators: [Validators.required] }),
      ePronunciation: new FormControl('', { validators: [Validators.required] }),
      tMeaning: new FormControl('', { validators: [Validators.required] }),
      tPronunciation: new FormControl('', { validators: [Validators.required] }),
      lessonName: new FormControl('', { validators: [Validators.required] }),
    });

    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe((authStatus) => {
        this.isLoading = false;
      });

    this.activatedRoute.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('contentId')) {
        this.editMode = true;
        this.contentId = paramMap.get('contentId');
        this.isLoading = true;
        this.contentService
          .getContent(this.contentId)
          .subscribe((contentDataObtained) => {
            this.isLoading = false;
            this.contentData = contentDataObtained.content;
            //console.log('this.contentData=', this.contentData);
            // this.mID = this.contentData.mID;
            this.creator = this.contentData.creator;
            this.contentForm.setValue({
              japanese: this.contentData.japanese,
              eMeaning: this.contentData.eMeaning,
              ePronunciation: this.contentData.ePronunciation,
              tMeaning: this.contentData.tMeaning,
              tPronunciation: this.contentData.tPronunciation,
              lessonName: this.contentData.lessonName,
            });
          });
      }
    });
  }

  ngAfterViewInit() {
    
  }

  onSubmit() {
    //console.log('content create=', this.contentForm.value);
    if (this.contentForm.invalid) {
      return;
    }

    const contentData: Content = {
      _id: this.contentId,
      japanese: this.contentForm.value.japanese,
      eMeaning: this.contentForm.value.eMeaning,
      ePronunciation: this.contentForm.value.ePronunciation,
      tMeaning: this.contentForm.value.tMeaning,
      tPronunciation: this.contentForm.value.tPronunciation,
      lessonName: this.contentForm.value.lessonName,
      lastUpdatedDate: this.dateService.getTodaysDate(),
      creator: this.creator,
    };
    this.isLoading = true;
    //console.log('this.editMode=', this.editMode);

    if (!this.editMode) {
      if (this.contents.length <= 0) {
        this.saveData_callAPI(contentData);
      } else {
        Swal.fire({
          title: 'Do you want to save a duplicate copy of it?',
          showDenyButton: true,
          showCancelButton: false,
          confirmButtonText: 'Save',
          confirmButtonColor: '#0d6efd',
          denyButtonText: `Don't save`,
        }).then((result) => {
          if (result.isConfirmed) {
            //Swal.fire('Saved!', '', 'success')

            //console.log('inside okay');
            this.saveData_callAPI(contentData);
          } else if (result.isDenied) {
            Swal.fire({title:'Changes are not saved', text: '', icon:'info',confirmButtonColor: '#0d6efd',});
          }
        });
      }
    } else {
      const copyContentDataFromDB = JSON.parse(
        JSON.stringify(this.contentData)
      ) as typeof this.contentData;
      const copyContentDataFromForm = JSON.parse(
        JSON.stringify(contentData)
      ) as typeof contentData;

      delete copyContentDataFromDB['__v'];
      delete copyContentDataFromDB['lastUpdatedDate'];
      delete copyContentDataFromForm['lastUpdatedDate'];

      // //console.log('copyContentDataFromDB=', copyContentDataFromDB);
      // //console.log('copyContentDataFromForm=', copyContentDataFromForm);
      // //console.log('this.contentData=', this.contentData);
      // //console.log('contentData=', contentData);

      //COMPARING OBJECTS
      if (
        JSON.stringify(copyContentDataFromDB) ===
        JSON.stringify(copyContentDataFromForm)
      ) {
        Swal.fire({
          title: 'No Updates done to this content.',
          showDenyButton: true,
          showCancelButton: false,
          confirmButtonText: 'Go to Contents List',
          confirmButtonColor: '#0d6efd',
          denyButtonText: `Stay here`,
        }).then((result) => {
          if (result.isConfirmed) {
            this.router.navigate(['/content']);
          } 
        });
      } else {
        this.saveData_callAPI(contentData);
      }
    }
  }

  saveData_callAPI(contentData) {
    if (!this.editMode) {
      //console.log('contentData=', contentData);
      this.contentService.addContent(contentData);
    } else {
      this.contentService.updateContent(contentData);
    }
    this.contentForm.reset();
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
    this.lessonSub.unsubscribe();
    if (this.contentSub) {
      this.contentSub.unsubscribe();
    }
  }
}
