export function capitalize(word: string | undefined): string {
  if (!word) return '';

  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

type DateFormat = 'short' | 'numeric';

export function formatDate(
    dateString?: string | null,
    mode: DateFormat = 'short'
): string {
    if (!dateString) return '';

    const date = new Date(dateString);

    if (isNaN(date.getTime())) return '';

    if (mode === 'numeric') {
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    }

    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export function getDaysLeft(
    createdAt?: string | null,
    totalDays?: number
): number {
    if (!createdAt || totalDays === undefined) return 0;

    const created = new Date(createdAt);

    if (isNaN(created.getTime())) return 0;

    const today = new Date();

    // Compare dates only
    created.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const elapsedMs = today.getTime() - created.getTime();
    const elapsedDays = Math.floor(
        elapsedMs / (1000 * 60 * 60 * 24)
    );

    return Math.max(totalDays - elapsedDays, 0);
}

export type TempUnit = "celcius" | "fahrenheit" | "kelvin";

export function convertTemperature(
    temp: number,
    from: TempUnit,
    to: TempUnit
): number {
    if (from === to) {
        return temp;
    }

    // Convert from Celsius to the target unit
    if (from === "celcius") {
        if (to === "fahrenheit") {
            return (temp * 9) / 5 + 32;
        }

        if (to === "kelvin") {
            return temp + 273.15;
        }
    }

    // Convert from Fahrenheit to the target unit
    if (from === "fahrenheit") {
        if (to === "celcius") {
            return ((temp - 32) * 5) / 9;
        }

        if (to === "kelvin") {
            return ((temp - 32) * 5) / 9 + 273.15;
        }
    }

    // Convert from Kelvin to the target unit
    if (from === "kelvin") {
        if (to === "celcius") {
            return temp - 273.15;
        }

        if (to === "fahrenheit") {
            return ((temp - 273.15) * 9) / 5 + 32;
        }
    }

    throw new Error(`Unsupported temperature conversion: ${from} to ${to}`);
}

export function getTemperatureSuffix(unit: TempUnit): string {
    switch (unit) {
        case "celcius":
            return "°C";

        case "fahrenheit":
            return "°F";

        case "kelvin":
            return " K";

        default:
            return "°C";
    }
}