import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeatherSearchPage } from './feather-search.page';
import { provideTestDefaults } from '../../../../testing/test-providers';

describe('FeatherSearchPage', () => {
  let fixture: ComponentFixture<FeatherSearchPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatherSearchPage],
      providers: provideTestDefaults(),
    }).compileComponents();

    fixture = TestBed.createComponent(FeatherSearchPage);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
