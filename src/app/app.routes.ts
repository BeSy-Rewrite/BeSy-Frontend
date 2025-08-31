import { Routes } from '@angular/router';
import { ApproveOrdersGuard } from './guards/approve-orders.guard';
import { DefaultGuard } from './guards/default.guard';
import { FilterDemoComponent } from './mockups/filter-demo/filter-demo.component';
import { TableDemoComponent } from './mockups/table-demo/table-demo.component';
import { HomepageComponent } from './pages/homepage/homepage.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { UnauthorizedComponent } from './pages/unauthorized/unauthorized.component';
import { PersonsPageComponent } from './pages/persons/persons-page/persons-page.component';
import { SuppliersPageComponent } from './pages/suppliers/suppliers-page/suppliers-page.component';

export const routes: Routes = [
    {
        title: 'BeSy',
        path: '',
        component: HomepageComponent
    },
    {
        title: 'Table Demo',
        path: 'table',
        component: TableDemoComponent
    },
    {
        title: 'Filter Demo',
        path: 'filter',
        component: FilterDemoComponent
    },
    {
        title: 'Guard Test',
        path: 'default',
        component: HomepageComponent,
        canActivate: [DefaultGuard]
    },
    {
        title: 'Approve Orders Test',
        path: 'dekanat',
        component: HomepageComponent,
        canActivate: [
            DefaultGuard,
            ApproveOrdersGuard
        ]
    },
    {
      title: 'Persons',
      path: 'persons',
      component: PersonsPageComponent
    },
    {
      title: 'Suppliers',
      path: 'suppliers',
      component: SuppliersPageComponent
    },
    {
        title: 'Unauthorisiert',
        path: 'unauthorized',
        component: UnauthorizedComponent
    },
    {
        title: '404 Not Found',
        path: 'not-found',
        component: NotFoundComponent
    },
    {
        title: '404 Not Found',
        path: '**',
        component: NotFoundComponent
    }
];
