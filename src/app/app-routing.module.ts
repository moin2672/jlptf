import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { LoginComponent } from './auth/login/login.component';
import { ResetComponent } from './auth/reset/reset.component';
import { SignupComponent } from './auth/signup/signup.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ContentCreateComponent } from './content/content-create/content-create.component';
import { ContentGroupListComponent } from './content/content-group-list/content-group-list.component';
import { ContentListComponent } from './content/content-list/content-list.component';
import { SheetComponent } from './sheet/sheet.component';

import { LessonCreateComponent } from './lesson/lesson-create/lesson-create.component';
import { LessonListComponent } from './lesson/lesson-list/lesson-list.component';


const routes: Routes = [
  { path: 'home', component: DashboardComponent,canActivate:[AuthGuard] },
  { path: 'upload', component: SheetComponent,canActivate:[AuthGuard] },
  { path: 'lesson', component: LessonListComponent, canActivate:[AuthGuard] },
  { path: 'lesson/new', component: LessonCreateComponent, canActivate:[AuthGuard] },
  { path:'lesson/edit/:lessonId', component: LessonCreateComponent, canActivate:[AuthGuard]},
  { path: 'content', component: ContentListComponent, canActivate:[AuthGuard] },
  { path: 'content/new', component: ContentCreateComponent, canActivate:[AuthGuard] },
  { path: 'content/group', component: ContentGroupListComponent, canActivate:[AuthGuard] },
  { path: 'content/edit/:contentId', component: ContentCreateComponent, canActivate:[AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'reset', component: ResetComponent, canActivate:[AuthGuard]  },
  { path: 'signup', component: SignupComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers:[AuthGuard]
})
export class AppRoutingModule {}
