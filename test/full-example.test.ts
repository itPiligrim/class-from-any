import {
    FromAny,
    GetFrom,
    Validate,
    ChildArray,
    Convert,
    ChildObject,
    IsEqual,
    isString,
    notEmpty,
    isNumber,
    notEmptyArray,
    isObject,
    toInt,
    toFloat,
    toDate
} from "../src";

test("FullExample", () => {
    const worldJSONData = `{
        "name": "Earth",
        "date": 1668271586239,
        "description": "Earth is the third planet from the Sun.",
        "alternativeNames": ["Gaia", "Terra", "Tellus"],        
        "chemicalComposition": {
          "iron": "32%",
          "oxygen": "30%",
          "silicon": "15%",
          "magnesium": "13.9%"
        },
        "star": {
            "name": "The Sun"
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
        date: Date;
        otherNames: string[]; // not alternativeNames
        chemicalComposition: ChemicalComposition;
        satellites: Satellite[];
        star: string;
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

    class ChemicalCompositionFromJSON extends FromAny implements ChemicalComposition {
        @Convert(toInt) @Validate(isNumber, notEmpty) iron: number;
        @Convert(toInt) @Validate(isNumber, notEmpty) oxygen: number;
        @Convert(toInt) @Validate(isNumber, notEmpty) silicon: number;
        @Convert(toFloat) @Validate(isNumber, notEmpty) magnesium: number;
    }

    class SatelliteFromJSON extends FromAny implements Satellite {
        @Validate(isString, notEmpty) name: string;
    }

    class WorldFromJSON extends FromAny implements World {
        @GetFrom("name") @Validate(isString, notEmpty) @IsEqual("Earth") title: string;
        @Convert(toDate) @Validate(notEmpty) date: Date;

        @Validate(isString, notEmpty) description: string;

        @GetFrom("alternativeNames")
        @Validate(notEmptyArray)
        otherNames: string[]; // not alternativeNames

        @ChildObject(ChemicalCompositionFromJSON)
        @Validate(isObject)
        chemicalComposition: ChemicalComposition;

        @ChildArray(SatelliteFromJSON) satellites: Satellite[];
        @GetFrom("star.name") @Validate(isString, notEmpty) star: string;
    }
    const worldData = JSON.parse(worldJSONData) as Record<string, unknown>;

    const world = new WorldFromJSON().from(worldData);

    expect(JSON.stringify(world)).toBe(
        `{"title":"Earth","date":"2022-11-12T16:46:26.239Z","description":"Earth is the third planet from the Sun.","otherNames":["Gaia","Terra","Tellus"],"chemicalComposition":{"iron":32,"oxygen":30,"silicon":15,"magnesium":13.9},"satellites":[{"name":"Moon"}],"star":"The Sun"}`
    ); 
    
});
