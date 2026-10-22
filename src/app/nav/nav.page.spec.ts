import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTestDefaults } from '../../testing/test-providers';

import { NavPage } from './nav.page';

describe('NavPage', () => {
  let component: NavPage;
  let fixture: ComponentFixture<NavPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavPage],
      providers: provideTestDefaults()
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
