import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransporterProgressComponent } from './transporter-progress.component';

describe('TransporterProgressComponent', () => {
  let component: TransporterProgressComponent;
  let fixture: ComponentFixture<TransporterProgressComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransporterProgressComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransporterProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
