import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeatherPage } from './feather.page';
import { provideTestDefaults } from '../../../../testing/test-providers';

describe('FeatherPage', () => {
  let fixture: ComponentFixture<FeatherPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatherPage],
      providers: provideTestDefaults(),
    }).compileComponents();

    fixture = TestBed.createComponent(FeatherPage);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
