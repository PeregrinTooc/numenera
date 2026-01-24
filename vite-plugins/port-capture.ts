import type { Plugin, ViteDevServer, PreviewServer } from "vite";
import { writePort } from "../tests/e2e/support/port-manager.js";

export function portCapturePlugin(): Plugin {
    return {
        name: "port-capture",
        configureServer(server: ViteDevServer) {
            if (!process.env.PORT_CAPTURE) return;
            server.httpServer?.once("listening", () => {
                const address = server.httpServer?.address();
                if (address && typeof address === "object") {
                    writePort(address.port);
                }
            });
        },
        configurePreviewServer(server: PreviewServer) {
            if (!process.env.PORT_CAPTURE) return;
            server.httpServer.once("listening", () => {
                const address = server.httpServer.address();
                if (address && typeof address === "object") {
                    writePort(address.port);
                }
            });
        },
    };
}