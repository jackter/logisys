import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PMRComponent } from './pmr.component';

describe('PMRComponent', () => {
  let component: PMRComponent;
  let fixture: ComponentFixture<PMRComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PMRComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PMRComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
