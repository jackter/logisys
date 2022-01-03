import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProduksiParamsComponent } from './produksi-params.component';

describe('ProduksiParamsComponent', () => {
  let component: ProduksiParamsComponent;
  let fixture: ComponentFixture<ProduksiParamsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProduksiParamsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProduksiParamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
