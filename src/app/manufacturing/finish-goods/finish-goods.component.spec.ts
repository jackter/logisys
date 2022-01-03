import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FinishGoodsComponent } from './finish-goods.component';

describe('FinishGoodsComponent', () => {
  let component: FinishGoodsComponent;
  let fixture: ComponentFixture<FinishGoodsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FinishGoodsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FinishGoodsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
