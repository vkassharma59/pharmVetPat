import { Routes } from '@angular/router';
import { pharmaDatabaseSearchComponent } from './components/pharma-database-search/pharma-database-search.component';

export const routes: Routes = [
  { path: 'pharma-database-search', component: pharmaDatabaseSearchComponent },
  { path: '', redirectTo: 'pharma-database-search', pathMatch: 'full' } // optional default route
];

