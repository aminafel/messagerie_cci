import { InstantMessage } from './instant-message';
/*import { DiscussionsListItem } from "./discussions-list-item";*/

export class Discussion { /*extends  DiscussionsListItem {*/
    constructor(public discussionId: string, public participants: string[], public history: InstantMessage[]) {

     }
  }
