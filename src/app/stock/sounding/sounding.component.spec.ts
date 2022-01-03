import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SoundingComponent } from './sounding.component';

describe('SoundingComponent', () => {
  let component: SoundingComponent;
  let fixture: ComponentFixture<SoundingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SoundingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SoundingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
