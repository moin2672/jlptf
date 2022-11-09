import { BrowserModule } from '@angular/platform-browser';
import {
  NgModule,
  CUSTOM_ELEMENTS_SCHEMA,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { AppComponent } from './app.component';

import { HeaderComponent } from './header/header.component';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { AuthService } from './auth/auth.service';
import { AuthInterceptor } from './auth/auth-interceptor';

import { LessonCreateComponent } from './lesson/lesson-create/lesson-create.component';
import { LessonListComponent } from './lesson/lesson-list/lesson-list.component';
import { LessonService } from './lesson/lesson.service';

import { ContentCreateComponent } from './content/content-create/content-create.component';
import { ContentListComponent } from './content/content-list/content-list.component';
import { ContentService } from './content/content.service';

import { ErrorInterceptor } from './error-interceptor';
import { DateService } from './shared/date.service';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UrlService } from './shared/url.service';
import { ContentGroupListComponent } from './content/content-group-list/content-group-list.component';
import { SheetComponent } from './sheet/sheet.component';
import { ResetComponent } from './auth/reset/reset.component';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    CommonModule,
  ],
  declarations: [
    AppComponent,
    HeaderComponent,
    LoginComponent,
    ResetComponent,
    SignupComponent,
    LessonCreateComponent,
    LessonListComponent,
    ContentCreateComponent,
    ContentListComponent,
    ContentGroupListComponent,
    DashboardComponent,
    SheetComponent,
  ],
  providers: [
    LessonService,
    ContentService,
    AuthService,
    DateService,
    UrlService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
  schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
