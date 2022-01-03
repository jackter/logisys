import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IgaComponent } from './iga.component';

describe('IgaComponent', () => {
  let component: IgaComponent;
  let fixture: ComponentFixture<IgaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IgaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IgaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
