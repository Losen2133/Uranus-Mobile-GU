export const toBoolean = (
    value: string | boolean | undefined
): boolean | undefined => {
    if (value === undefined) {
        return undefined;
    }

    return value === true || value === "true";
};