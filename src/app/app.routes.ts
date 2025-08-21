import { Routes } from '@angular/router';
import { TestFormsComponent } from './pages/test-forms/test-forms.component';
import { ApproveOrdersGuard } from './guards/approve-orders.guard';
import { DefaultGuard } from './guards/default.guard';
import { TableDemoComponent } from './mockups/table-demo/table-demo.component';
import { HomepageComponent } from './pages/homepage/homepage.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { UnauthorizedComponent } from './pages/unauthorized/unauthorized.component';
import { AddressesComponent } from './pages/addresses/add-address/addresses.component';
import { EditAddressComponent } from './pages/addresses/edit-address/edit-address.component';
import { AddressDetailComponent } from './pages/addresses/address-detail/address-detail.component';
import { PersonsPageComponent } from './pages/persons/persons-page/persons-page.component';

export const routes: Routes = [
    {
        title: 'BeSy',
        path: '',
        component: HomepageComponent
    },
    {
        title: 'table demo',
        path: 'table',
        component: TableDemoComponent
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
      title: 'Addresses',
      path: 'addresses',
      component: AddressesComponent
    },
    {
      title: 'Address Detail',
      path: 'addresses/:id/detail',
      component: AddressDetailComponent
    },
    {
      title: 'Edit Address',
      path: 'addresses/:id/edit',
      component: EditAddressComponent
    },
    {
      title: 'Persons',
      path: 'persons',
      component: PersonsPageComponent
    },
    {
      title: 'Test Forms',
      path: 'test',
      component: TestFormsComponent
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
