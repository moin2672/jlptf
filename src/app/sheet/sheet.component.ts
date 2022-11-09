import { Component, OnDestroy, OnInit } from '@angular/core';
import * as XLSX from 'xlsx';
import { Content } from '../content/content.model';
import { ContentService } from '../content/content.service';
import { DateService } from '../shared/date.service';
import { Lesson } from '../lesson/lesson.model';
import { LessonService } from '../lesson/lesson.service';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';

type AOA = any[][];

@Component({
  selector: 'app-sheet',
  templateUrl: './sheet.component.html',
  styleUrls: ['./sheet.component.css'],
})
export class SheetComponent implements OnInit, OnDestroy {
  // declaration
  userId: string;
  userIsAuthenticated = false;
  private authStatusSub: Subscription;

  data_Contents: AOA = [
    [
      '_id',
      'japanese',
      'eMeaning',
      'ePronunciation',
      'tMeaning',
      'tPronunciation',
      'lessonName',
      'lastUpdatedDate',
      'creator',
      '__v',
    ],
  ];

  data_Lessons: AOA = [['_id', 'lessonName', 'creator', '__v']];

  fileUploaded = false;
  uploadClicked = false;
  checkResponse = [];

  data: AOA = [
    [1, 2],
    [3, 4],
  ];
  wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'array' };
  fileName: string = 'JLPT_Template.xlsx';
  outputMessage = '';
  progressBarValue = '0';
  progressBarMessage = '';

  Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
  });

  constructor(
    private contentService: ContentService,
    private lessonService: LessonService,
    private dateService: DateService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    //console.log('this.data_Contents=', this.data_Contents);
    //console.log(this.data_Contents.length);
    //console.log(typeof this.data_Contents);

    this.userId = this.authService.getUserId();

    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe((isAuthenticated) => {
        this.userIsAuthenticated = isAuthenticated;
        this.userId = this.authService.getUserId();
      });
  }

  onFileChange(evt: any) {
    /* wire up file reader */
    //console.log(this.data_Contents.length, this.data_Lessons.length);
    const target: DataTransfer = <DataTransfer>evt.target;
    if (target.files.length !== 1) throw new Error('Cannot use multiple files');
    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      /* read workbook */
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

      //console.log('wb.SheetNames=', wb.SheetNames[0]);
      if (wb.SheetNames.indexOf('Contents') !== -1) {
        if (!this.fileUploaded) {
          this.fileUploaded = true;
        }
        const ws_Contents: XLSX.WorkSheet = wb.Sheets['Contents'];
        this.data_Contents = <AOA>(
          XLSX.utils.sheet_to_json(ws_Contents, { header: 1 })
        );
      }
      if (wb.SheetNames.indexOf('Lessons') !== -1) {
        if (!this.fileUploaded) {
          this.fileUploaded = true;
        }
        const ws_Lessons: XLSX.WorkSheet = wb.Sheets['Lessons'];
        this.data_Lessons = <AOA>(
          XLSX.utils.sheet_to_json(ws_Lessons, { header: 1 })
        );
      }
    };
    reader.readAsBinaryString(target.files[0]);
  }

  UploadData() {
    //console.log('clicking upload data');
    //console.log(
    //   'data_Contents:',
    //   this.data_Contents,
    //   this.data_Contents.length
    // );
    //console.log('data_Lessons:', this.data_Lessons, this.data_Lessons.length);

    if (!this.uploadClicked && this.fileUploaded) {
      Swal.fire({
        title: 'Do you want to upload it?',
        text: 'Please upload unique data...',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#0d6efd',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, upload it!',
      }).then((result) => {
        if (result.isConfirmed) {
          this.uploadClicked = true;

          //console.log('button clicked');
          if (this.data_Contents.length <= 1 && this.data_Lessons.length <= 1) {
            this.outputMessage += 'No Data Uploaded...😒<br>';
          }

          if (this.data_Contents.length > 1) {
            let obj_Contents = this.list_to_object_converter(
              this.data_Contents
            );
            let obj_Contents_length = obj_Contents.length;

            obj_Contents.forEach((object, index) => {
              if (index > 0) {
                const interval = 2000;
                const contentData: Content = {
                  _id: object._id,
                  japanese: object.japanese,
                  eMeaning: object.eMeaning,
                  ePronunciation: object.ePronunciation,
                  tMeaning: object.tMeaning,
                  tPronunciation: object.tPronunciation,
                  lessonName: object.lessonName,
                  lastUpdatedDate: this.dateService.getTodaysDate(),
                  creator: object.creator,
                };

                //console.log(contentData);

                setTimeout(() => {
                  //console.log(contentData);
                  this.progressBarMessage = 'Uploading Content Data...';
                  if (
                    contentData.japanese.trim() !== '' &&
                    contentData.eMeaning.trim() !== '' &&
                    contentData.ePronunciation.toString().trim() !== '' &&
                    contentData.lessonName.trim()!=''
                    // && contentData.tMeaning.trim()!==""
                    // && contentData.tPronunciation.trim()!==""
                  ) {
                    if (
                      contentData._id === undefined &&
                      contentData.creator === undefined
                    ) {
                      contentData._id = null;
                      contentData.creator = null;

                      this.contentService
                        .addContentThroughExcel(contentData)
                        .subscribe((responseData) => {
                          //console.log(
                          //   'responseData.message(content add)=',
                          //   responseData
                          // );
                          this.checkResponse.push(responseData.contentId);
                          this.progressBarValue = (
                            ((index + 1) / obj_Contents_length) *
                            100
                          ).toFixed();
                        });
                    }

                    if (
                      contentData._id !== undefined &&
                      contentData.creator === this.userId
                    ) {
                      this.contentService
                        .updateContentThroughExcel(contentData)
                        .subscribe((responseData) => {
                          //console.log(
                          //   'responseData.message(content update)=',
                          //   responseData
                          // );
                          this.checkResponse.push(contentData._id);
                          this.progressBarValue = (
                            ((index + 1) / obj_Contents_length) *
                            100
                          ).toFixed();
                        });
                    }
                  }else{
                    console.info("One of the Content Required data [japanese, eMeaning, ePronunciation, lessonName] is missing.")
                  }
                }, index * interval);
              }
            });

            setTimeout(() => {
              this.outputMessage =
                this.outputMessage +
                '✔ Contents Data Uploaded Successfully...<br>';
            }, 3000 * obj_Contents_length);

            setTimeout(() => {
              this.progressBarValue = '0';
            }, 1000 * obj_Contents_length);

            //console.log('obj_Contents.length=', obj_Contents.length);
          }

          if (this.data_Lessons.length > 1) {
            let obj_Lessons = this.list_to_object_converter(this.data_Lessons);
            let obj_Lessons_length = obj_Lessons.length;

            obj_Lessons.forEach((object, index) => {
              if (index > 0) {
                const interval = 2000;
                const lessonData: Lesson = {
                  _id: object._id,
                  lessonName: object.lessonName,
                  creator: object.creator,
                };

                setTimeout(() => {
                  //console.log(lessonData);
                  this.progressBarMessage = 'Uploading Lesson Data...';
                  if (lessonData.lessonName.trim() !== '') {
                    if (
                      lessonData._id === undefined &&
                      lessonData.creator === undefined
                    ) {
                      lessonData._id = null;
                      lessonData.creator = null;
                      this.lessonService
                        .addLessonThroughExcel(lessonData)
                        .subscribe((responseData) => {
                          //console.log(
                          //   'responseData.message(lesson)=',
                          //   responseData
                          // );
                          this.checkResponse.push(responseData.lessonId);
                          this.progressBarValue = (
                            ((index + 1) / obj_Lessons_length) *
                            100
                          ).toFixed();
                        });
                    }
                    if (
                      lessonData._id !== undefined &&
                      lessonData.creator === this.userId
                    ) {
                      this.lessonService
                        .updateLessonThroughExcel(lessonData)
                        .subscribe((responseData) => {
                          //console.log(
                          //   'responseData.message(lesson update)=',
                          //   responseData
                          // );
                          this.checkResponse.push(lessonData._id);
                          this.progressBarValue = (
                            ((index + 1) / obj_Lessons_length) *
                            100
                          ).toFixed();
                        });
                    }
                  }else{
                    console.info("One of the Lesson Required data [lessonName] is missing.")
                  }
                }, index * interval);
              }
            });

            setTimeout(() => {
              this.progressBarMessage = 'Completed...';
              this.outputMessage =
                this.outputMessage +
                '✔ Lessons Data Uploaded Successfully...<br>';
            }, 3000 * obj_Lessons_length);

            //console.log(
            //   'this.checkResponse.length=',
            //   this.checkResponse.length
            // );
           
          }
          // this.outputMessage = this.outputMessage +
          // '✔ Completed... Please check @  <a class="btn btn-outline-primary" routerLink="/home"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-house-heart-fill" viewBox="0 0 16 16">            <path d="M7.293 1.5a1 1 0 0 1 1.414 0L11 3.793V2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v3.293l2.354 2.353a.5.5 0 0 1-.708.707L8 2.207 1.354 8.853a.5.5 0 1 1-.708-.707L7.293 1.5Z"/>            <path d="m14 9.293-6-6-6 6V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V9.293Zm-6-.811c1.664-1.673 5.825 1.254 0 5.018-5.825-3.764-1.664-6.691 0-5.018Z"/></svg> Home</a><br>';
          // Swal.fire({
          //   title: 'Data uploaded successfully',
          //   text:'Kindly cross verify it.',
          //   icon: 'success',
          //   iconHtml: '',
          //   confirmButtonText: 'Okay',
          //   confirmButtonColor: '#0d6efd',
          //   cancelButtonText: '',
          //   showCancelButton: false,
          //   showCloseButton: false,
          // });
          // this.router.navigate(['/home']);
        } else {
          Swal.fire({
            title: 'Cancelled',
            text: 'No Data uploaded... :)',
            icon: 'error',
            confirmButtonColor: '#0d6efd',
          });
        }
      });
    }
  }

  export(): void {
    /* generate worksheet */
    const ws_Contents: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(
      this.data_Contents
    );
    const ws_Lessons: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(
      this.data_Lessons
    );
    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws_Contents, 'Contents');
    XLSX.utils.book_append_sheet(wb, ws_Lessons, 'Lessons');

    /* save to file */
    XLSX.writeFile(wb, this.fileName);
  }

  list_to_object_converter(data) {
    let result = [];
    // //console.log("data=",data)
    data.forEach((arr) => {
      const obj = {};
      arr.forEach((elem, i) => {
        obj[data[0][i]] = elem;
      });
      result.push(obj);
    });

    return result;
  }

  object_to_array_converter(result) {
    let array_output = [];

    result.forEach((val) => {
      // //console.log("val",val, Object.keys(val))
      let out = [];
      for (const key of Object.keys(val)) {
        // //console.log(key)
        if (array_output.length === 0) {
          out.push(key);
        } else {
          out.push(val[key]);
        }
      }
      array_output.push(out);
    });
    // //console.log("=>",array_output)
    return array_output;
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }
}
