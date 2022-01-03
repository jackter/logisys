import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WoRequestComponent } from './wo-request.component';

describe('WoRequestComponent', () => {
  let component: WoRequestComponent;
  let fixture: ComponentFixture<WoRequestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WoRequestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WoRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
