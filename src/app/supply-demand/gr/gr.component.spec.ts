import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GRComponent } from './gr.component';

describe('GRComponent', () => {
  let component: GRComponent;
  let fixture: ComponentFixture<GRComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GRComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GRComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
