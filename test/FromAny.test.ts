import {
    FromAny,
    GetFrom,
    Validate,
    ChildArray,
    Convert,
    ChildObject
} from "../src";

import { isString, notEmpty, isNumber, notEmptyArray } from "../src/validate";

import { toInt, toFloat } from "../src/convert";

test("FromAny", () => {
    const worldJSONData = `{
        "name": "Earth",
        "description": "Earth is the third planet from the Sun.",
        "alternativeNames": ["Gaia", "Terra", "Tellus"],        
        "chemicalComposition": {
          "iron": "32%",
          "oxygen": "30%",
          "silicon": "15%",
          "magnesium": "13.9%"
        },
        "satellites": [
          {
            "name": "Moon"
          }
        ]
      }`;

    class World {
        title: string; // not name
        description: string;
        otherNames: string[]; // not alternativeNames
        chemicalComposition: ChemicalComposition;
        satellites: Satellite[];
    }

    class ChemicalComposition {
        iron: number;
        oxygen: number;
        silicon: number;
        magnesium: number;
    }

    class Satellite {
        name: string;
    }

    class ChemicalCompositionFromJSON
        extends FromAny
        implements ChemicalComposition
    {
        @Convert(toInt) @Validate(isNumber, notEmpty) iron: number;
        @Convert(toInt) @Validate(isNumber, notEmpty) oxygen: number;
        @Convert(toInt) @Validate(isNumber, notEmpty) silicon: number;
        @Convert(toFloat) @Validate(isNumber, notEmpty) magnesium: number;
    }

    class SatelliteFromJSON extends FromAny implements Satellite {
        @Validate(isString, notEmpty) name: string;
    }

    class WorldFromJSON extends FromAny implements World {
        @GetFrom("name") @Validate(isString, notEmpty) title: string;

        @Validate(isString, notEmpty) description: string;

        @GetFrom("alternativeNames")
        @Validate(notEmptyArray)
        otherNames: string[]; // not alternativeNames

        @ChildObject(ChemicalCompositionFromJSON)
        chemicalComposition: ChemicalComposition;

        @ChildArray(SatelliteFromJSON) satellites: Satellite[];
    }

    const worldData = JSON.parse(worldJSONData) as Record<string, unknown>;

    const world = new WorldFromJSON().from(worldData);
    expect(JSON.stringify(world)).toBe(
        `{"title":"Earth","description":"Earth is the third planet from the Sun.","otherNames":["Gaia","Terra","Tellus"],"chemicalComposition":{"iron":32,"oxygen":30,"silicon":15,"magnesium":13.9},"satellites":[{"name":"Moon"}]}`
    );
});
