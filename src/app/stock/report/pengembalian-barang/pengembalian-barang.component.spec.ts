import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PengembalianBarangComponent } from './pengembalian-barang.component';

describe('PengembalianBarangComponent', () => {
  let component: PengembalianBarangComponent;
  let fixture: ComponentFixture<PengembalianBarangComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PengembalianBarangComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PengembalianBarangComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
