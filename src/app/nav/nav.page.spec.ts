import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { NavPage } from './nav.page';

describe('NavPage', () => {
  let component: NavPage;
  let fixture: ComponentFixture<NavPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavPage],
      providers: [provideRouter([])]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NavPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
