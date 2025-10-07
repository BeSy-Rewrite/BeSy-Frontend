import { Routes } from '@angular/router';
import { ApproveOrdersGuard } from './guards/approve-orders.guard';
import { DefaultGuard } from './guards/default.guard';
import { FilterDemoComponent } from './mockups/filter-demo/filter-demo.component';
import { TableDemoComponent } from './mockups/table-demo/table-demo.component';
import { CostCentersPageComponent } from './pages/cost-center/cost-center-component/cost-center-page.component';
import { HomepageComponent } from './pages/homepage/homepage.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { CreateOrderPageComponent } from './pages/order/create-order-page/create-order-page.component';
import { OrdersPageComponent } from './pages/order/orders-page/orders-page.component';
import { PersonsPageComponent } from './pages/persons/persons-page/persons-page.component';
import { EditSuppliersPageComponent } from './pages/suppliers/edit-suppliers-page/edit-suppliers-page.component';
import { SuppliersPageComponent } from './pages/suppliers/suppliers-page/suppliers-page.component';
import { UnauthorizedComponent } from './pages/unauthorized/unauthorized.component';

export const routes: Routes = [
    {
        title: 'BeSy',
        path: '',
        component: HomepageComponent
    },
    {
        title: 'Table Demo',
        path: 'table',
        component: TableDemoComponent,
        canActivate: [DefaultGuard]
    },
    {
        title: 'Filter Demo',
        path: 'filter',
        component: FilterDemoComponent,
        canActivate: [DefaultGuard]
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
        title: 'Bestellungen',
        path: 'orders',
        component: OrdersPageComponent,
        canActivate: [DefaultGuard]
    },
    {
        title: 'Bestellung erstellen',
        path: 'orders/create',
        component: CreateOrderPageComponent,
        canActivate: [DefaultGuard]
    },
    {
        title: 'Personen',
        path: 'persons',
        component: PersonsPageComponent,
        canActivate: [DefaultGuard]
    },
    {
        title: 'Lieferanten',
        path: 'suppliers',
        component: SuppliersPageComponent,
        canActivate: [DefaultGuard]
    },
    {
        title: 'Lieferant bearbeiten',
        path: 'suppliers/:id/edit',
        component: EditSuppliersPageComponent,
        canActivate: [DefaultGuard]
    },
    {
        title: 'Kostenstellen',
        path: 'cost-centers',
        component: CostCentersPageComponent,
        canActivate: [DefaultGuard]
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
