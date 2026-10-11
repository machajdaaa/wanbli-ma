import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PeopleSearchPage } from './people-search.page';
import { provideTestDefaults } from '../../../testing/test-providers';

describe('PeopleSearchPage', () => {
  let fixture: ComponentFixture<PeopleSearchPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PeopleSearchPage],
      providers: provideTestDefaults(),
    }).compileComponents();

    fixture = TestBed.createComponent(PeopleSearchPage);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
