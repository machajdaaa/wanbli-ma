import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CategoryPage } from './category.page';
import { provideTestDefaults } from '../../../../testing/test-providers';

describe('CategoryPage', () => {
  let fixture: ComponentFixture<CategoryPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryPage],
      providers: provideTestDefaults(),
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryPage);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
