import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { first, fromEvent, Observable, Subscription } from 'rxjs';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AuthService } from '../../auth/auth.service';
import { Content } from '../content.model';
import { ContentService } from '../content.service';
import Swal from 'sweetalert2';
import { UrlService } from '../../shared/url.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-content-list',
  templateUrl: './content-list.component.html',
  styleUrls: ['./content-list.component.css'],
})
export class ContentListComponent implements OnInit, AfterViewInit, OnDestroy {
  showAns = false;
  sortDescending = false;
  isShuffled = false;

  @ViewChild('searchInput') searchName: ElementRef;
  requestedData = null;
  searchText_Value = null;
  prev_Url = '';

  clicked = false;
  isLoading = false;

  previousUrl: Observable<string> = this.urlService.previousUrl$;

  contents: Content[] = [];
  contents_copy: Content[] = [];
  private contentSub: Subscription;

  totalPosts = 0; //total no of posts
  postsPerPage = 100; //current page
  currentPage = 1;
  pageSizeOptions = [100, 150, 200];

  /* checking the new pagination */
  totalPages = 0;
  // totalPages = Math.ceil(this.totalPosts / this.postsPerPage);
  forward = false;
  backward = false;

  userIsAuthenticated = false;
  private authStatusSub: Subscription;

  userId: string;

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

  toggleAns() {
    this.showAns = !this.showAns;
  }

  toggleSorting() {
    this.sortDescending = !this.sortDescending;

    if (this.sortDescending) {
      // this.contents.sort((a,b)=>b-a)
      // this.contents.sort((a,b)=>b-a)
      this.contents.sort((a, b) => {
        const nameA = a._id.toUpperCase(); // ignore upper and lowercase
        const nameB = b._id.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return 1;
        }
        if (nameA > nameB) {
          return -1;
        }

        // names must be equal
        return 0;
      });
    } else {
      this.contents.sort((a, b) => {
        const nameA = a._id.toUpperCase(); // ignore upper and lowercase
        const nameB = b._id.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }

        // names must be equal
        return 0;
      });
    }
  }

  shuffleArray() {
    this.isShuffled = !this.isShuffled;
    // if(this.isShuffled){
    for (let i = 0; i < this.contents_copy.length; i++) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.contents[i], this.contents[j]] = [
        this.contents[j],
        this.contents[i],
      ];
    }
    // }else{
    //   this.contents=[...this.contents_copy]
    // }
  }

  constructor(
    private contentService: ContentService,
    private authService: AuthService,
    private urlService: UrlService
  ) {}

  onIncrement() {
    //console.log('calling functon onIncrement');
    this.isLoading = true;
    //console.log('on Inc');
    //console.log(this.currentPage, this.totalPages);
    if (this.currentPage < this.totalPages) {
      this.currentPage = this.currentPage + 1;
      if (this.searchText_Value && this.searchText_Value != '') {
        this.contentService.getContentsWithFilters(
          this.postsPerPage,
          this.currentPage,
          this.searchText_Value
        );
        //console.log('calling content filter service 4');
      } else {
        this.contentService.getContents(this.postsPerPage, this.currentPage);
      }
      this.updatePagination();
    }
  }
  onDecrement() {
    //console.log('calling functon onDecrement');
    this.isLoading = true;
    //console.log('on Dec');
    if (this.currentPage > 1) {
      this.currentPage = this.currentPage - 1;
      if (this.searchText_Value && this.searchText_Value != '') {
        this.contentService.getContentsWithFilters(
          this.postsPerPage,
          this.currentPage,
          this.searchText_Value
        );
        //console.log('calling content filter service 5');
      } else {
        this.contentService.getContents(this.postsPerPage, this.currentPage);
      }
      this.updatePagination();
    }
  }
  updatePagination() {
    //console.log('calling functon updatePagination');
    this.totalPages = Math.ceil(this.totalPosts / this.postsPerPage);
    //console.log('currentpage=', this.currentPage);
    //console.log('totalPages=', this.totalPages);
    //console.log('totalPosts=', this.totalPosts);
    //console.log(Math.ceil(this.totalPosts / this.postsPerPage));
    if (this.currentPage <= 1) {
      //console.log('calling 0');
      if (this.totalPages <= 1) {
        //console.log('calling 00');
        // this.hide = true;
        this.forward = false;
        this.backward = false;
      } else {
        // this.hide = false;
        //console.log('calling 000');
        if (this.currentPage < this.totalPages) {
          //console.log('calling 1');
          this.forward = true;
          this.backward = false;
        }
      }
    } else {
      //console.log('calling 0000');
      if (this.currentPage < this.totalPages) {
        //console.log('calling 2');
        this.forward = true;
        this.backward = true;
      }
      if (this.currentPage == this.totalPages) {
        //console.log('calling 3');
        this.forward = false;
        this.backward = true;
      }
    }
  }

  ngOnInit() {
    // this.content = this.contentService.getContent()
    // //console.log(this.content)
    // //console.log("inside on init")
    // //console.log("this.searchText_Value=",this.searchText_Value)

    this.isLoading = true;
    this.urlService.previousUrl$
      .pipe(first())
      .subscribe((previousUrl: string) => {
        //console.log('previousUrl=', previousUrl);
        this.prev_Url = previousUrl;
        ////console.log("NEW ORDER previous url: ", previousUrl);
      });

    if (this.prev_Url === '/home') {
      this.contentService.homeContentProp$.pipe(first()).subscribe((data) => {
        //console.log('obtained data=', data);

        if (data && data.clicked) {
          this.clicked = !this.clicked;
          this.postsPerPage = data.totalPosts;
          this.currentPage = 1;
          if (data.searchLesson != '') {
            // this.searchText_Value=data.searchLesson
            this.contentService.getContentsWithFilters(
              this.postsPerPage,
              this.currentPage,
              data.searchLesson
            );
            //console.log('calling content filter service 1');
          } else {
            this.contentService.getContents(
              this.postsPerPage,
              this.currentPage
            );
            //console.log('calling content service 1');
          }
        } else {
          this.contentService.getContents(this.postsPerPage, this.currentPage);
          //console.log('calling content service 2');
        }
      });
    } else {
      if (this.searchText_Value && this.searchText_Value != '') {
        this.contentService.getContentsWithFilters(
          this.postsPerPage,
          this.currentPage,
          this.searchText_Value
        );
        //console.log('calling content filter service 6');
      } else {
        this.contentService.getContents(this.postsPerPage, this.currentPage);
        //console.log('calling content service 3');
      }
    }

    this.contentSub = this.contentService
      .getContentUpdateListener()
      .subscribe(
        (contentData: { contents: Content[]; contentCount: number }) => {
          this.isLoading = false;
          this.contents = contentData.contents;
          this.contents_copy = contentData.contents;
          this.totalPosts = contentData.contentCount;
          this.updatePagination();
          //console.log('from db:', contentData);
        }
      );
    this.userId = this.authService.getUserId();
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe((isAuthenticated) => {
        this.userIsAuthenticated = isAuthenticated;
        this.userId = this.authService.getUserId();
      });
  }

  OnDelete(contentId: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0d6efd',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.contentService.deleteContent(contentId).subscribe({
          next: () => {
            if (this.searchText_Value && this.searchText_Value != '') {
              this.contentService.getContentsWithFilters(
                this.postsPerPage,
                this.currentPage,
                this.searchText_Value
              );
              //console.log('calling content filter service 2');
            } else {
              this.contentService.getContents(
                this.postsPerPage,
                this.currentPage
              );
            }
            this.Toast.fire({
              icon: 'success',
              title: 'Content Deleted Successfully',
            });
          },
          error: () => {
            this.isLoading = false;
          },
          complete: () => {
            console.info('Content Deletion Complete');
          },
        });
        // Swal.fire(
        //   'Deleted!',
        //   'Your file has been deleted.',
        //   'success'
        // )
      } else {
        Swal.fire({
          title: 'Cancelled',
          text: 'Your data is safe :)',
          icon: 'error',
          confirmButtonColor: '#0d6efd',
        });
      }
    });
  }

  ngAfterViewInit() {
    const searchTerm = fromEvent<any>(
      this.searchName.nativeElement,
      'keyup'
    ).pipe(
      map((event) => event.target.value),
      debounceTime(1000)
      //distinctUntilChanged()
    );

    searchTerm.subscribe((res) => {
      //console.log('=>', res);
      this.requestedData = res;
      this.searchText_Value = res;
      setTimeout(() => {
        this.requestedData = null;
      }, 2000);

      // this.totalPosts = 0;
      // this.postsPerPage = 3; //current page
      // this.currentPage = 1;

      if (this.searchText_Value && this.searchText_Value != '') {
        //console.log('value');
        this.postsPerPage = 100;
        this.currentPage = 1;

        this.contentService.getContentsWithFilters(
          this.postsPerPage,
          this.currentPage,
          this.searchText_Value
        );
        //console.log('calling content filter service 3');
        this.contentSub = this.contentService
          .getContentUpdateListener()
          .subscribe(
            (contentData: { contents: Content[]; contentCount: number }) => {
              this.isLoading = false;
              this.contents = contentData.contents;
              this.totalPosts = contentData.contentCount;
              this.updatePagination();
              //console.log(this.contents);
            }
          );
      } else {
        //console.log('no value');
        this.contentService.getContents(this.postsPerPage, this.currentPage);
        this.contentSub = this.contentService
          .getContentUpdateListener()
          .subscribe(
            (contentData: { contents: Content[]; contentCount: number }) => {
              this.isLoading = false;
              this.contents = contentData.contents;
              this.totalPosts = contentData.contentCount;
              this.updatePagination();
              //console.log('from db:', contentData);
            }
          );
      }
    });
  }

  ngOnDestroy() {
    this.contentSub.unsubscribe();
    this.authStatusSub.unsubscribe();
    this.contentService.setHomeContentProp(0, '', false);
    this.clicked = !this.clicked;
  }

  export() {
    //console.log(this.contents);
    // arr.map(sub_arr=>[sub_arr[1],sub_arr[2],sub_arr[3],sub_arr[4],sub_arr[5],sub_arr[6],sub_arr[7]])
    let arr = this.object_to_array_converter(this.contents);
    // //console.log(arr);
    // let arr_result=arr.map(sub_arr=>[sub_arr[1],sub_arr[2],sub_arr[3],sub_arr[4],sub_arr[5],sub_arr[6],sub_arr[7]])
    let arr_result=arr
     /* generate worksheet */
     const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(arr_result);
     /* generate workbook and add the worksheet */
     const wb: XLSX.WorkBook = XLSX.utils.book_new();
     XLSX.utils.book_append_sheet(wb, ws, 'Contents');

     /* save to file */
     XLSX.writeFile(wb, "Contents_Data.xlsx");
  }

  object_to_array_converter(result) {
    let array_output = [
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

    result.forEach((val) => {
      // //console.log("val",val, Object.keys(val))
      let out = [];
      for (const key of Object.keys(val)) {
        // //console.log(key)
        // if (array_output.length === 0) {
        //   out.push(key);
        // } else {
        //   out.push(val[key]);
        // }
        out.push(val[key]);
      }
      array_output.push(out);
    });
    // //console.log("=>",array_output)
    return array_output;
  }
}
