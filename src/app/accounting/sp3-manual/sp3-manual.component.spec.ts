import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Sp3ManualComponent } from './sp3-manual.component';

describe('Sp3ManualComponent', () => {
  let component: Sp3ManualComponent;
  let fixture: ComponentFixture<Sp3ManualComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Sp3ManualComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Sp3ManualComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
