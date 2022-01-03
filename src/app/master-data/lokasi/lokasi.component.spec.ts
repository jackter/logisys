import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LokasiComponent } from './lokasi.component';

describe('LokasiComponent', () => {
  let component: LokasiComponent;
  let fixture: ComponentFixture<LokasiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LokasiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LokasiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
