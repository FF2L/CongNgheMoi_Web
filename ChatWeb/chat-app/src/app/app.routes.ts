import { Routes } from '@angular/router';
import { AuthComponent } from './pages/auth/auth.component';
import { LayoutComponent } from './pages/layout/layout.component';
import { ChattingComponent } from './pages/chatting/chatting.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ContactsComponent } from './pages/contacts/contacts.component';
import { ForgetPasswordComponent } from './pages/auth/forget-password/forget-password.component';
import { ChangePassComponent } from './pages/auth/change-pass/change-pass.component';

export const routes: Routes = [
    {path:'', redirectTo:'auth', pathMatch:'full'},
    {path:'auth', component: AuthComponent, children:[
        {path:'forgot-password', component: ForgetPasswordComponent},
        {path:'change-password', component: ChangePassComponent}
    ]},
    {path:'', component: LayoutComponent, children:[
        {path:'chat', component: ChattingComponent},
        {path:'profile', component:ProfileComponent},
        {path:'contacts', component:ContactsComponent}
    ]}
];
