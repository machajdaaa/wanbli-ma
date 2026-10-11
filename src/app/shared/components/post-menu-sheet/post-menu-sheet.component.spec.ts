import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostMenuSheetComponent } from './post-menu-sheet.component';
import { provideTestDefaults } from '../../../../testing/test-providers';

describe('PostMenuSheetComponent', () => {
  let fixture: ComponentFixture<PostMenuSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostMenuSheetComponent],
      providers: provideTestDefaults(),
    }).compileComponents();

    fixture = TestBed.createComponent(PostMenuSheetComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
