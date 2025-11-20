/**
 * UniVibe Design Tokens
 * Exported for developer usage
 */

export const colors = {
    primary: {
        start: "#2dd4bf", // teal-400
        end: "#8b5cf6",   // violet-500
        gradient: "linear-gradient(to right, #2dd4bf, #8b5cf6)",
    },
    secondary: "#8b5cf6",
    accent: "#fbbf24",  // amber-400
    background: {
        light: "#f8fafc", // slate-50
        dark: "#0f172a",  // slate-900
    },
    foreground: {
        light: "#0f172a", // slate-900
        dark: "#f8fafc",  // slate-50
    },
    status: {
        success: "#22c55e",
        error: "#ef4444",
        warning: "#f59e0b",
        info: "#3b82f6",
    }
};

export const typography = {
    fontFamily: {
        heading: "Space Grotesk, sans-serif",
        body: "Inter, sans-serif",
    },
    fontWeight: {
        regular: 400,
        medium: 500,
        bold: 700,
    },
};

export const spacing = {
    container: "1280px",
    headerHeight: "56px",
    bottomNavHeight: "64px",
};

export const borderRadius = {
    sm: "0.375rem", // 6px
    md: "0.5rem",   // 8px
    lg: "0.75rem",  // 12px
    xl: "1rem",     // 16px
    full: "9999px",
};
