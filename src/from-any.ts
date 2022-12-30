import "reflect-metadata";

type key = string | symbol;

const isAnyObject: (val: unknown) => boolean = (val: unknown) => {
    return val !== null && !Array.isArray(val) && typeof val === "object";
};

const errorText = (description: string, data: object, key?: key, value?: unknown): string => {
    const dataAsString: string = isAnyObject(data) ? JSON.stringify(data) : String(data);

    return `${String(description)};
        Key: ${String(key)}; Value: ${String(value)}; Data: ${dataAsString}`;
};

const getObjectPropertyByString = function(obj: object, path: string, defaultValue: unknown) {
    // https://stackoverflow.com/a/6491621/4604351
    path = path.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    path = path.replace(/^\./, '');           // strip a leading dot
    const props = path.split('.');
    for (let i = 0, n = props.length; i < n; ++i) {
        const currentProp = props[i];
        if (currentProp in obj) {
            obj = obj[currentProp as keyof typeof obj];
        } else {
            return defaultValue;
        }
    }
    return obj;
}

/* FromAny */

export class FromAny {
    [key: key]: unknown;
    from(data: object): this {
        if (typeof data !== "object") {
            throw errorText("Data is not object", data);
        }
        const keys = Reflect.ownKeys(this);
        keys.forEach((key: key) => {
            const propertyName = getPropertyName(this, key);
            const validateFuncs = getValidateFuncs(this, key);
            const convertFunc = getConvertFunc(this, key);
            const defaultValue = getDefaultValue(this, key);
            const childArray = getChildArray(this, key);
            const childObject = getChildObject(this, key);
            const isEqualValue = getIsEqualValue(this, key);

            let val = getObjectPropertyByString(data, String(propertyName), defaultValue);
            
            val = convertFunc(val);

            val =
                childArray && Array.isArray(val)
                    ? val.map((arrayElement) => {
                          if (isAnyObject(arrayElement)) {
                              return new childArray().from(arrayElement as object);
                          } else {
                              throw errorText("Child element is not object", data, key, arrayElement);
                          }
                      })
                    : val;

            val = childObject && isAnyObject(val) ? new childObject().from(val as object) : val;

            validateFuncs.forEach((func) => {
                if (!func(val)) {
                    throw errorText(`Validate function ${func.name} fail`, data, key, val);
                }
            });

            if (isEqualValue !== undefined) {
                if (isEqualValue !== val) {
                    throw errorText(
                        `The value of the ${String(key)} property must be equal to ${String(isEqualValue)}`,
                        data,
                        key,
                        val
                    );
                }
            }

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

type converterFunc = (val: any) => any;
const convertMetadataKey = "Convert";

const getConvertFunc = (fromAnyInstance: FromAny, key: key): converterFunc => {
    const func = Reflect.getMetadata(convertMetadataKey, fromAnyInstance, key) as converterFunc | undefined;
    return func ? func : (val) => val;
};

/* DefaultValue */

export const DefaultValue = (value: unknown) => {
    return Reflect.metadata(defaultValueMetadataKey, value);
};

const defaultValueMetadataKey = "Value";

const getDefaultValue = (fromAnyInstance: FromAny, key: key): unknown => {
    return Reflect.getMetadata(defaultValueMetadataKey, fromAnyInstance, key) as unknown;
};

/* IsEqual */

export const IsEqual = (isEqualFunc: unknown) => {
    return Reflect.metadata(isEqualMetadataKey, isEqualFunc);
};

const isEqualMetadataKey = "IsEqual";

const getIsEqualValue = (fromAnyInstance: FromAny, key: key): unknown => {
    return Reflect.getMetadata(isEqualMetadataKey, fromAnyInstance, key) as unknown;
};
