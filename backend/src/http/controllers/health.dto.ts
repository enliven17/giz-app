import { BaseClass } from "../../domain/base-class.ts";

export class HealthResponseDto extends BaseClass {
  declare result: {
    status: "ok";
  };
}
