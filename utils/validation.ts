export function validateRequiredText(
    value: string,
    label: string
): string | undefined {
    if (!value.trim()) {
        return `${label} is required.`;
    }

    return undefined;
}

export function validateEmailAddress(value: string): string | undefined {
    const email = value.trim();

    if (!email) {
        return "Email address is required.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return "Enter a valid email address.";
    }

    return undefined;
}

export function validateWholeNumber(
    value: number | undefined,
    label: string,
    allowZero = false
): string | undefined {
    if (value === undefined || !Number.isFinite(value)) {
        return `${label} is required.`;
    }

    if (!Number.isInteger(value) || value < (allowZero ? 0 : 1)) {
        return allowZero
            ? `${label} must be a whole number of zero or more.`
            : `${label} must be a whole number greater than zero.`;
    }

    return undefined;
}
