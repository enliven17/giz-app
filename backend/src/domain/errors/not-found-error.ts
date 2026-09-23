import { DomainError } from "./domain-error.ts";

export class NotFoundError extends DomainError {
  readonly entityName: string;
  readonly entityId: string;

  constructor(entity: { name: string }, entityId: string) {
    super("NOT_FOUND", `${entity.name} not found: ${entityId}`);
    this.entityName = entity.name;
    this.entityId = entityId;
  }
}
