import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KartuStockComponent } from './kartu-stock.component';

describe('KartuStockComponent', () => {
  let component: KartuStockComponent;
  let fixture: ComponentFixture<KartuStockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KartuStockComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KartuStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
