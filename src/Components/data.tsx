import { Vector2 } from "three";

class Space {
  public parkedId: String | null;
  public spacePosition: Vector2;
  public spaceDirection: number;
  public parkPosition: Vector2;
  public parkDirection: number;
  public id: number;
  constructor(
    spacePosition: Vector2,
    spaceDirection: number,
    parkPosition: Vector2,
    parkDirection: number,
    id: number
  ) {
    this.parkedId = null;
    this.spacePosition = spacePosition;
    this.spaceDirection = spaceDirection;
    this.parkPosition = parkPosition;
    this.parkDirection = parkDirection;
    this.id = id;
  }
}

const Spaces = new Array();
let cnt = 0;
for (let i = -50; i <= 50; i += 10) {
  Spaces.push(
    new Space(new Vector2(i, -20), -180, new Vector2(i + 10, -5), -90, cnt++)
  );
}
for (let i = -50; i <= 50; i += 10) {
  Spaces.push(
    new Space(new Vector2(i, 10), 0, new Vector2(i + 10, -5), -90, cnt++)
  );
}
export { Space, Spaces };
