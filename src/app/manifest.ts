import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Academy Desk",
    short_name: "Academy Desk",
    description: "Academy Desk sports academy management platform",
    start_url: "/",
    display: "standalone",
    background_color: "#101828",
    theme_color: "#101828",
    icons: [
      {
        src: "/icons/192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
