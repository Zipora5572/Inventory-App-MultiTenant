import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./pages/inventory-management/inventory-management')
                .then(m => m.InventoryManagement),
    },
 
];
