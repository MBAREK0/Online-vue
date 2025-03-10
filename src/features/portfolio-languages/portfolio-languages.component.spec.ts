import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfolioLanguagesComponent } from './portfolio-languages.component';

describe('PortfolioLanguagesComponent', () => {
  let component: PortfolioLanguagesComponent;
  let fixture: ComponentFixture<PortfolioLanguagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortfolioLanguagesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PortfolioLanguagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
