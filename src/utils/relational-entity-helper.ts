import { instanceToPlain } from 'class-transformer';
import { AfterLoad } from 'typeorm';
import { BaseRelational } from '../common/base-relational';

export class EntityRelationalHelper extends BaseRelational {
  __entity?: string;

  @AfterLoad()
  setEntityName() {
    this.__entity = this.constructor.name;
  }

  toJSON() {
    return instanceToPlain(this);
  }
}
