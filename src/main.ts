import { bootstrapApplication } from '@angular/platform-browser';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { jwtInterceptor } from './app/interceptors/jwt.interceptor';



bootstrapApplication(AppComponent, {
providers: [
provideIonicAngular(),
provideHttpClient(withInterceptors([jwtInterceptor])),
provideRouter(routes)
]


});
