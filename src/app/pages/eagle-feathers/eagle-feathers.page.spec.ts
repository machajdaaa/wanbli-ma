import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EagleFeathersPage } from './eagle-feathers.page';
import { provideTestDefaults } from '../../../testing/test-providers';

describe('EagleFeathersPage', () => {
  let component: EagleFeathersPage;
  let fixture: ComponentFixture<EagleFeathersPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EagleFeathersPage],
      providers: provideTestDefaults(),
    }).compileComponents();

    fixture = TestBed.createComponent(EagleFeathersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
