export const isString = (val: unknown): boolean => {
    return typeof val === "string";
};

export const isNumber = (val: unknown): boolean => {
    return typeof val === "number";
};

export const notEmpty = (val: unknown): boolean => {
    return !!val;
};

export const notEmptyArray = (val: unknown): boolean => {
    return Array.isArray(val) && val.length ? true : false;
};

export const isArray = (val: unknown): boolean => {
    return Array.isArray(val) ? true : false;
};

export const isObject = (val: unknown): boolean => {
    return !!val && typeof val === "object";
};

