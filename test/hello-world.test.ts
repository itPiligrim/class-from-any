import { FromAny, GetFrom, Validate, isString, notEmpty } from "../src";

test("HelloWorld", () => {
    const worldJSONData = `{"name": "Earth"}`;

    class World extends FromAny {
        @GetFrom("name") @Validate(isString, notEmpty) title: string;
    }

    const world = new World().from(
        JSON.parse(worldJSONData) as Record<string, unknown>
    );
    expect(JSON.stringify(world)).toBe(`{"title":"Earth"}`);
});
