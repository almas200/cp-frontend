import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCourseFormComponent } from './admin-course-form.component';

describe('AdminCourseFormComponent', () => {
  let component: AdminCourseFormComponent;
  let fixture: ComponentFixture<AdminCourseFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCourseFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminCourseFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
