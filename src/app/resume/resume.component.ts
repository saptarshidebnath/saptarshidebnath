import { Component, OnInit } from '@angular/core';
import { HttpClient } from "@angular/common/http";

@Component({
  selector: 'app-resume',
  templateUrl: './resume.component.html',
  styleUrls: ['./resume.component.scss']
})
export class ResumeComponent implements OnInit {

  constructor(private httpClient: HttpClient) { }

  resume: any = {};

  ngOnInit(): void {
    this.httpClient.get("assets/resume.json").subscribe(data => {
      console.log(data);
      this.resume = data;
    })
  }

  displayPi(): boolean{
    return false;
  }


}
