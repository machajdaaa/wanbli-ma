import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GroupPage } from './group.page';
import { provideTestDefaults } from '../../../testing/test-providers';

describe('GroupPage', () => {
  let component: GroupPage;
  let fixture: ComponentFixture<GroupPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupPage],
      providers: provideTestDefaults(),
    }).compileComponents();

    fixture = TestBed.createComponent(GroupPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
