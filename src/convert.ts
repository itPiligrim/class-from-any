export const toInt = (val: unknown): number => {
    if (typeof val === "number") {
        return val;
    }
    if (typeof val === "string") {
        return parseInt(val, 10);
    }
    if (!val) {
        return 0;
    }
    throw new Error(`Unknown property value`);
};

export const toFloat = (val: unknown): number => {
    if (typeof val === "number") {
        return val;
    }
    if (typeof val === "string") {
        return parseFloat(val);
    }
    if (!val) {
        return 0;
    }
    throw new Error(`Unknown property value`);
};

export const toDate = (val: number | string): Date => {
    if (!val) {
        return new Date(0);
    }
    return new Date(val);
}
