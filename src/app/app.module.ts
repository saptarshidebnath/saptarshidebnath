import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BackgroundComponent } from './background/background.component';
import { ContentsComponent } from './contents/contents.component';
import { HeaderComponent } from './contents/header/header.component';
import { HomeComponent } from './contents/pages/home/home.component';

@NgModule({
  declarations: [
    AppComponent,
    BackgroundComponent,
    ContentsComponent,
    HeaderComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
