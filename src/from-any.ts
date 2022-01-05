import "reflect-metadata";

/* Any object */

type key = string | symbol;

interface AnyObject {
    [key: key]: unknown;
}

const isAnyObject: (val: unknown) => boolean = (val: unknown) => {
    return val !== null && !Array.isArray(val) && typeof val === "object";
};

const throwError = (description: string, data: AnyObject, key?: key, value?: unknown): void => {
    const dataAsString: string = isAnyObject(data) ? JSON.stringify(data) : String(data);

    const errorText = `${String(description)};
        Key: ${String(key)}; Value: ${String(value)}; Data: ${dataAsString}`;

    throw new Error(errorText);
};

/* FromAny */

export class FromAny {
    [key: key]: unknown;
    from(data: AnyObject): this {
        if (typeof data !== "object") {
            throwError("Data is not object", data);
        }
        const keys = Reflect.ownKeys(this);
        keys.forEach((key: key) => {
            const propertyName = getPropertyName(this, key);
            const validateFuncs = getValidateFuncs(this, key);
            const convertFunc = getConvertFunc(this, key);
            const childArray = getChildArray(this, key);
            const childObject = getChildObject(this, key);

            let val = convertFunc(data[propertyName]);

            val =
                childArray && Array.isArray(val)
                    ? val.map((arrayElement) => {
                          if (isAnyObject(arrayElement)) {
                              return new childArray().from(arrayElement as AnyObject);
                          } else {
                              throwError("Child element is not object", data, key, arrayElement);
                          }
                      })
                    : val;

            val = childObject && isAnyObject(val) ? new childObject().from(val as AnyObject) : val;

            validateFuncs.forEach((func) => {
                if (!func(val)) {
                    throwError(`Validate function ${func.name} fail`, data, key, val);
                }
            });

            this[key] = val;
        });
        return this;
    }
}

/* GetFrom */

export const GetFrom = (propertyName: key) => {
    return Reflect.metadata(getFromMetadataKey, propertyName);
};

const getFromMetadataKey = "GetFrom";

const getPropertyName = (fromAnyInstance: FromAny, key: key): key => {
    const propertyName = Reflect.getMetadata(getFromMetadataKey, fromAnyInstance, key) as key | undefined;
    return propertyName ? propertyName : key;
};

/* Validate */

export const Validate = (...validateFunc: validateFunc[]) => {
    return Reflect.metadata(validateMetadataKey, validateFunc);
};

type validateFunc = (val: unknown) => boolean;
const validateMetadataKey = "Validate";

const getValidateFuncs = (fromAnyInstance: FromAny, key: key): validateFunc[] => {
    const funcs = Reflect.getMetadata(validateMetadataKey, fromAnyInstance, key) as validateFunc[] | undefined;
    return funcs ? funcs : [];
};

/* Child object */

export const ChildObject = (childClass: typeof FromAny) => {
    return Reflect.metadata(childObjectMetadataKey, childClass);
};

const childObjectMetadataKey = "ChildObject";

const getChildObject = (fromAnyInstance: FromAny, key: key): typeof FromAny | undefined => {
    return Reflect.getMetadata(childObjectMetadataKey, fromAnyInstance, key) as typeof FromAny | undefined;
};

/* Child array */

export const ChildArray = (childClass: typeof FromAny) => {
    return Reflect.metadata(childArrayMetadataKey, childClass);
};

const childArrayMetadataKey = "ChildArray";

const getChildArray = (fromAnyInstance: FromAny, key: key): typeof FromAny | undefined => {
    return Reflect.getMetadata(childArrayMetadataKey, fromAnyInstance, key) as typeof FromAny | undefined;
};

/* Convert */

export const Convert = (converter: converterFunc) => {
    return Reflect.metadata(convertMetadataKey, converter);
};

type converterFunc = (val: unknown) => unknown;
const convertMetadataKey = "Convert";

const getConvertFunc = (fromAnyInstance: FromAny, key: key): converterFunc => {
    const func = Reflect.getMetadata(convertMetadataKey, fromAnyInstance, key) as converterFunc | undefined;
    return func ? func : (val) => val;
};
