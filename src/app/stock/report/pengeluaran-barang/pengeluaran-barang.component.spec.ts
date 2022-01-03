import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PengeluaranBarangComponent } from './pengeluaran-barang.component';

describe('PengeluaranBarangComponent', () => {
  let component: PengeluaranBarangComponent;
  let fixture: ComponentFixture<PengeluaranBarangComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PengeluaranBarangComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PengeluaranBarangComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
