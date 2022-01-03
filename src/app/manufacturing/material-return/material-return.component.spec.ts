import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialReturnComponent } from './material-return.component';

describe('MaterialReturnComponent', () => {
  let component: MaterialReturnComponent;
  let fixture: ComponentFixture<MaterialReturnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MaterialReturnComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaterialReturnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
