import { Component, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit {
  public skillSet: string[] = [
    'Java 8',
    'Spring Boot',
    'JPA',
    'Angular2+',
    'HTML5',
    'CSS3',
    'Javascript',
    'Typescript',
    'Openshift',
    'AWS'
  ];

  public designPatterns: string[] = [
    'Reactive Programming',
    'Microservices'
  ];
  constructor() {}

  ngAfterViewInit() {}

  public getSkillSets(): string[] {
    return this.skillSet;
  }

  getDesignPatterns(): string[] {
    return this.designPatterns;
  }
}
