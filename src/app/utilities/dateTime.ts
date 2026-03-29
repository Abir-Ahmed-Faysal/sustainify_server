/* eslint-disable @typescript-eslint/no-explicit-any */
import { format, toZonedTime } from "date-fns-tz";

const TIME_ZONE = "Asia/Dhaka";

/**
 * Safely formats a date into a specific timezone.
 * Returns the formatted string or the original value if invalid/null.
 */
export const formatToLocalTime = (date: Date | string | number | undefined | null): string | any => {
    if (!date) return date;
    
    try {
        const d = new Date(date);
        // Check if date is valid
        if (isNaN(d.getTime())) return date;
        
        return format(toZonedTime(d, TIME_ZONE), "dd MMM yyyy, hh:mm a");
    } catch (error :any) {
        console.error(error);
        return date;
    }
};
