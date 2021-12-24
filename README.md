# class-from-any

Allows use of decorator to get, convert and validate class from raw object data

# Installation

```bash
npm install class-from-any --save
```

# Usage

```bash

class Cat extends FromAny {
    @GetFrom("nickname") @Validate(isString, notEmpty) "name": string;
    constructor(data: AnyObject) {
        super(data);
    }
}

const cat = new Cat(JSON.parse(jsonData) as AnyObject);

```