import { Routes } from '@angular/router';
import { ApproveOrdersGuard } from './guards/approve-orders.guard';
import { DefaultGuard } from './guards/default.guard';
import { CostCentersPageComponent } from './pages/cost-center/cost-center-component/cost-center-page.component';
import { HomepageComponent } from './pages/homepage/homepage.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { CreateOrderPageComponent } from './pages/order/create-order-page/create-order-page/create-order-page.component';
import { EditOrderPageComponent } from './pages/order/edit-order-page/edit-order-page.component';
import { OrdersPageComponent } from './pages/order/orders-page/orders-page.component';
import { ViewOrderPageComponent } from './pages/order/view-order-page/view-order-page.component';
import { PersonsPageComponent } from './pages/persons/persons-page/persons-page.component';
import { EditSuppliersPageComponent } from './pages/suppliers/edit-suppliers-page/edit-suppliers-page.component';
import { SuppliersPageComponent } from './pages/suppliers/suppliers-page/suppliers-page.component';
import { UnauthorizedComponent } from './pages/unauthorized/unauthorized.component';
import { OrderResolver } from './resolver/order.resolver';

export const routes: Routes = [
    {
        title: 'BeSy',
        path: '',
        component: HomepageComponent
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
        title: 'Bestellungen',
        path: 'orders/:id',
        component: ViewOrderPageComponent,
        resolve: {
            order: OrderResolver
        },
        canActivate: [DefaultGuard]
    },
    {
        title: 'Bestellung bearbeiten',
        path: 'orders/:id/edit',
        component: EditOrderPageComponent
    },
    {
        title: 'Personen',
        path: 'persons',
        component: PersonsPageComponent
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
