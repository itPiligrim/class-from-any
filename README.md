# class-from-any

Allows use of decorator to get, convert and validate class from raw object data.

# Installation

```bash
npm install class-from-any --save
```

Enable esModuleInterop,  experimentalDecorators and useDefineForClassFields and disable strictPropertyInitialization in the tsconfig.json.

```bash

"compilerOptions": {
    ...
    "esModuleInterop": true,
    "strictPropertyInitialization": false,
    "experimentalDecorators": true,
    "useDefineForClassFields": true,
}

```

# Hello world

```bash

import { FromAny, GetFrom, Validate, isString, notEmpty } from "class-from-any";

const worldJSONData = `{"name": "Earth"}`;

class World extends FromAny {
    @GetFrom("name") @Validate(isString, notEmpty) title: string;
}

const world = new World().from(
    JSON.parse(worldJSONData) as Record<string, unknown>
);
```

# Full example

For example, you have this JSON object data:

```bash

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
    "satellites": [{
        "name": "Moon"
    }]
}`;

const worldData = JSON.parse(worldJSONData) as Record<string, unknown>;

```

We want to get and validate classes or interfaces from JSON:

```bash

class World {
    title: string; // not name
    description: string;
    date: Date;
    otherNames: string[]; // not alternativeNames
    chemicalComposition: ChemicalComposition;
    satellites: Satellite[];
    star: string; // star.name property in JSON
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

Note that the class structure does not exactly replicate the JSON available to us.
Declare implements from our clear classes or interfaces:

```bash

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

```

Get, convert and validate class from JSON data

```bash

const world = new WorldFromJSON().from(worldData);

```

# Under construction

Modules "validate" and "convert" are under construction.
We welcome contributors!