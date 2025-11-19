---
to: src/<%= h.inflection.transform(name, ['pluralize', 'underscore', 'dasherize']) %>/infrastructure/persistence/relational/entities/<%= h.inflection.transform(name, ['underscore', 'dasherize']) %>.entity.ts
---
import { Entity } from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';

@Entity({
  name: '<%= h.inflection.transform(name, ['underscore']) %>',
})
export class <%= name %>Entity extends EntityRelationalHelper {
  // Add your entity columns here
}
