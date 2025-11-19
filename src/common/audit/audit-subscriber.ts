import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
  DataSource,
} from 'typeorm';
import { ClsService } from 'nestjs-cls';

@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface {
  constructor(
    private readonly cls: ClsService,
    dataSource: DataSource,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return Object;
  }

  private getCurrentUser() {
    return this.cls.get('userId');
  }

  beforeInsert(event: InsertEvent<any>) {
    const user = this.getCurrentUser();
    if (user && event.entity && !event.entity.createdBy) {
      event.entity.createdBy = user;
    }
  }

  beforeUpdate(event: UpdateEvent<any>) {
    const user = this.getCurrentUser();
    if (user && event.entity && !event.entity.updatedBy) {
      event.entity.updatedBy = user;
    }
  }
}
