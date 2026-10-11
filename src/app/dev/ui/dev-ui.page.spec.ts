import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DevUiPage } from './dev-ui.page';
import { provideTestDefaults } from '../../../testing/test-providers';

// Renders every design-system component in every state, so this doubles as
// a smoke test for the whole design system.
describe('DevUiPage', () => {
  let component: DevUiPage;
  let fixture: ComponentFixture<DevUiPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DevUiPage],
      providers: provideTestDefaults(),
    }).compileComponents();

    fixture = TestBed.createComponent(DevUiPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
