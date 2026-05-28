import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "VeyrFlow",
    short_name: "VeyrFlow",
    description: "AI-crafted routines, not just habits.",
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#09090b",
    icons: [
      {
        src: "/icon1",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon2",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
