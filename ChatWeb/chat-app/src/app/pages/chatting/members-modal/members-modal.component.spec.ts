import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MembersModalComponent } from './members-modal.component';

describe('MembersModalComponent', () => {
  let component: MembersModalComponent;
  let fixture: ComponentFixture<MembersModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MembersModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MembersModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
