import { Component} from '@angular/core';
import { InstantMessagingService } from '../instant-messaging.service';
import { DiscussionsListItem } from '../discussions-list-item';


@Component({
  selector: 'app-discussions-list',
  templateUrl: './discussions-list.component.html',
  styleUrls: ['./discussions-list.component.css']
})
export class DiscussionsListComponent {

  constructor(private service: InstantMessagingService) { }

  private onSelect(discussion: DiscussionsListItem) {
    this.service.sendFetchDiscussion(discussion.id);
  }
}
