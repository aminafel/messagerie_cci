import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MessageListComponent } from './message-list/message-list.component';
import { NewMessageFormComponent } from './new-message-form/new-message-form.component';
import { LoginFormComponent } from './login-form/login-form.component';
import { ConnectedPeopleListComponent } from './connected-people-list/connected-people-list.component';
import { ChatComponent } from './chat/chat.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { SubscribeFormComponent } from './subscribe-form/subscribe-form.component';

const routes: Routes = [
  { path: '', redirectTo: '/welcome', pathMatch: 'full' },
  { path: 'welcome', component: WelcomeComponent },
  { path: 'login', component: LoginFormComponent },
  { path: 'subscribe', component: SubscribeFormComponent },
  { path: 'chat', component: ChatComponent }
];

@NgModule({
  exports: [ RouterModule ],
  imports: [ RouterModule.forRoot(routes) ],
})

export class AppRoutingModule { }


