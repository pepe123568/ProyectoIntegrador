import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PagoEfectivoPage } from './pago-efectivo.page';

describe('PagoEfectivoPage', () => {
  let component: PagoEfectivoPage;
  let fixture: ComponentFixture<PagoEfectivoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PagoEfectivoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
