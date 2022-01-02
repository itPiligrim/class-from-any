# class-from-any

Allows use of decorator to get, convert and validate class from raw object data.

# Installation

```bash
npm install class-from-any --save
```

# Usage

For example, you have this JSON object data:

```bash

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

```

We want to get and validate classes or interfaces from JSON:

```bash

class World {
    title: string; // not name
    description: string;
    otherNames: string[];
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

```

Declare implements from our clear classes or interfaces:

```bash

import {
    FromAny,
    GetFrom,
    Validate,
    ChildArray,
    Convert,
    ChildObject
} from "class-from-any";

import { isString, notEmpty, isNumber, notEmptyArray } from "class-from-any";

import { toInt, toFloat } from "class-from-any";

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
    @GetFrom("name") @Validate(isString, notEmpty) title: string;
    @Validate(isString, notEmpty) description: string;
    @GetFrom("alternativeNames") @Validate(notEmptyArray) otherNames: string[];
    @ChildObject(ChemicalCompositionFromJSON) chemicalComposition: ChemicalComposition;
    @ChildArray(SatelliteFromJSON) satellites: Satellite[];
}

```

Get, convert and validate class from JSON data

```bash

const worldData = JSON.parse(worldJSONData) as Record<string, unknown>;
const world = new WorldFromJSON().from(worldData);

```