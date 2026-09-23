export class InfrastructureError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    options?: { cause: unknown },
  ) {
    super(message, options);
    this.name = new.target.name;
  }
}
