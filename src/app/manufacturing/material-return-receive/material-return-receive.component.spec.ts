import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialReturnReceiveComponent } from './material-return-receive.component';

describe('MaterialReturnReceiveComponent', () => {
  let component: MaterialReturnReceiveComponent;
  let fixture: ComponentFixture<MaterialReturnReceiveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MaterialReturnReceiveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaterialReturnReceiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
