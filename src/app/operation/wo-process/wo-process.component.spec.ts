import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WoProcessComponent } from './wo-process.component';

describe('WoProcessComponent', () => {
  let component: WoProcessComponent;
  let fixture: ComponentFixture<WoProcessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WoProcessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WoProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
