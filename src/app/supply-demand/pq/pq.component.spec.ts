import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PQComponent } from './pq.component';

describe('PQComponent', () => {
  let component: PQComponent;
  let fixture: ComponentFixture<PQComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PQComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PQComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
