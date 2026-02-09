import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Goal Setting and Planning",
    short_name: "Goal Planner",
    description: "Standalone app for yearly, monthly, weekly goals and baby steps.",
    start_url: "/",
    display: "standalone",
    background_color: "#f3efe6",
    theme_color: "#205f42",
    icons: [
      {
        src: "/icons/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml"
      },
      {
        src: "/icons/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml"
      }
    ]
  };
}
