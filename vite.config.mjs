import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
    appType: "mpa",
    base: "",
    build: {
        target: "esnext",
        rollupOptions: {
            input: {
                main: resolve(__dirname, "./index.html"),
                profile: resolve(__dirname, "./profile/index.html"),
                auctions: resolve(__dirname, "./auctions/index.html"),
                listing: resolve(__dirname, "./auctions/listing/index.html"),

            },
        },
    },
});