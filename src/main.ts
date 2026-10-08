import { addIcons } from 'ionicons';
import { calendarOutline, cartOutline, cashOutline, checkmarkOutline, chevronBackOutline, chevronForwardOutline, documentTextOutline, helpCircleOutline, homeOutline, locationOutline, medicalOutline, medkitOutline, personCircleOutline, removeOutline, storefrontOutline, swapHorizontalOutline, trashOutline } from 'ionicons/icons';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withComponentInputBinding, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

addIcons({ calendarOutline, cartOutline, cashOutline, checkmarkOutline, chevronBackOutline, chevronForwardOutline, documentTextOutline, helpCircleOutline, homeOutline, locationOutline, medicalOutline, medkitOutline, personCircleOutline, removeOutline, storefrontOutline, swapHorizontalOutline, trashOutline });

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules), withComponentInputBinding()),
  ],
});
