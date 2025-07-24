import { Routes } from '@angular/router';
import { DefaultGuard } from './guards/default-guard.guard';
import { HomepageComponent } from './homepage/homepage.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { UnauthorizedComponent } from './pages/unauthorized/unauthorized.component';

export const routes: Routes = [
    {
        title: 'BeSy',
        path: '',
        component: HomepageComponent
    },
    {
        title: 'test',
        path: 'test',
        component: HomepageComponent,
        canActivate: [DefaultGuard]
    },
    {
        title: 'Unautorisiert',
        path: 'unauthorized',
        component: UnauthorizedComponent
    },
    {
        title: '404 Not Found',
        path: '**',
        component: NotFoundComponent
    }
];
