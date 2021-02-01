import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})

export class NavigationComponent implements OnInit {

  navigatorLinkContentElementId: string = "navbarSupportedContent";
  private readonly toggleSwitchSelector = "#sitenav>button.navbar-toggler";
  
  constructor() { }

  ngOnInit(): void {
  }

  toggleMenu() {
    if ((document.getElementById(this.navigatorLinkContentElementId) as HTMLElement).classList.contains("show")) {
      (document.querySelector(this.toggleSwitchSelector) as HTMLElement).click();
    }
  }

}
