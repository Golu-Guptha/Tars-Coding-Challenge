export function formatMessageTime(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();

    const isToday =
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

    const isThisYear = date.getFullYear() === now.getFullYear();

    const timeStr = date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });

    if (isToday) {
        return timeStr;
    }

    const dateStr = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        ...(isThisYear ? {} : { year: "numeric" }),
    });

    return `${dateStr}, ${timeStr}`;
}
