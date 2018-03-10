import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { MessageListComponent } from './message-list/message-list.component';
import { InstantMessageComponent } from './instant-message/instant-message.component';
import { NewMessageFormComponent } from './new-message-form/new-message-form.component';
import { InstantMessagingService } from './instant-messaging.service';
import { RoutingService } from './routing.service';
import { LoginFormComponent } from './login-form/login-form.component';
import { AutoScrollDirective } from './auto-scroll.directive';
import { ConnectedPeopleListComponent } from './connected-people-list/connected-people-list.component';
import { AppRoutingModule } from './app-routing.module';
import { ChatComponent } from './chat/chat.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { SubscribeFormComponent } from './subscribe-form/subscribe-form.component';
import { InstantInvitationComponent } from './instant-invitation/instant-invitation.component';
import { InvitationListComponent } from './invitation-list/invitation-list.component';
import { InvitationFormComponent } from './invitation-form/invitation-form.component';
import { ContactListComponent } from './contact-list/contact-list.component';

@NgModule({
  declarations: [
    AppComponent,
    MessageListComponent,
    InstantMessageComponent,
    NewMessageFormComponent,
    LoginFormComponent,
    AutoScrollDirective,
    ConnectedPeopleListComponent,
    ChatComponent,
    WelcomeComponent,
    SubscribeFormComponent,
    InstantInvitationComponent,
    InvitationListComponent,
    InvitationFormComponent,
    ContactListComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule
  ],
  providers: [
    InstantMessagingService,
    RoutingService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
