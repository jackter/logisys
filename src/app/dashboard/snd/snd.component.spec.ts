import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SndComponent } from './snd.component';

describe('SndComponent', () => {
  let component: SndComponent;
  let fixture: ComponentFixture<SndComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SndComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SndComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
