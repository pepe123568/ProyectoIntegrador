import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CitaExitosaPage } from './cita-exitosa.page';

describe('CitaExitosaPage', () => {
  let component: CitaExitosaPage;
  let fixture: ComponentFixture<CitaExitosaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CitaExitosaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
