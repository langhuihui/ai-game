#!/usr/bin/env node
import express from 'express';
import { ToolHandler } from './utils/ToolRouter.js';
export declare class SuperAdminServer implements ToolHandler {
    private mcpServer;
    private webApp;
    private superAdminTools;
    private superAdminResourceTools;
    private characterService;
    private sceneService;
    private itemService;
    private memoryService;
    private loggingService;
    private identityService;
    private citizenshipService;
    private connectedClients;
    private permissionConnections;
    constructor();
    private setupWebApp;
    private setupWebRoutes;
    private setupMCPHandlers;
    getTools(): (import("zod").objectOutputType<{
        name: import("zod").ZodString;
        description: import("zod").ZodOptional<import("zod").ZodString>;
        inputSchema: import("zod").ZodObject<{
            type: import("zod").ZodLiteral<"object">;
            properties: import("zod").ZodOptional<import("zod").ZodObject<{}, "passthrough", import("zod").ZodTypeAny, import("zod").objectOutputType<{}, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{}, import("zod").ZodTypeAny, "passthrough">>>;
        }, "passthrough", import("zod").ZodTypeAny, import("zod").objectOutputType<{
            type: import("zod").ZodLiteral<"object">;
            properties: import("zod").ZodOptional<import("zod").ZodObject<{}, "passthrough", import("zod").ZodTypeAny, import("zod").objectOutputType<{}, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{}, import("zod").ZodTypeAny, "passthrough">>>;
        }, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{
            type: import("zod").ZodLiteral<"object">;
            properties: import("zod").ZodOptional<import("zod").ZodObject<{}, "passthrough", import("zod").ZodTypeAny, import("zod").objectOutputType<{}, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{}, import("zod").ZodTypeAny, "passthrough">>>;
        }, import("zod").ZodTypeAny, "passthrough">>;
    }, import("zod").ZodTypeAny, "passthrough"> | {
        name: string;
        description: string;
        inputSchema: {
            type: "object";
            properties: {
                uri?: undefined;
            };
            required: never[];
        };
    } | {
        name: string;
        description: string;
        inputSchema: {
            type: "object";
            properties: {
                uri: {
                    type: string;
                    description: string;
                };
            };
            required: string[];
        };
    })[];
    getSuperAdminTools(): import("zod").objectOutputType<{
        name: import("zod").ZodString;
        description: import("zod").ZodOptional<import("zod").ZodString>;
        inputSchema: import("zod").ZodObject<{
            type: import("zod").ZodLiteral<"object">;
            properties: import("zod").ZodOptional<import("zod").ZodObject<{}, "passthrough", import("zod").ZodTypeAny, import("zod").objectOutputType<{}, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{}, import("zod").ZodTypeAny, "passthrough">>>;
        }, "passthrough", import("zod").ZodTypeAny, import("zod").objectOutputType<{
            type: import("zod").ZodLiteral<"object">;
            properties: import("zod").ZodOptional<import("zod").ZodObject<{}, "passthrough", import("zod").ZodTypeAny, import("zod").objectOutputType<{}, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{}, import("zod").ZodTypeAny, "passthrough">>>;
        }, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{
            type: import("zod").ZodLiteral<"object">;
            properties: import("zod").ZodOptional<import("zod").ZodObject<{}, "passthrough", import("zod").ZodTypeAny, import("zod").objectOutputType<{}, import("zod").ZodTypeAny, "passthrough">, import("zod").objectInputType<{}, import("zod").ZodTypeAny, "passthrough">>>;
        }, import("zod").ZodTypeAny, "passthrough">>;
    }, import("zod").ZodTypeAny, "passthrough">[];
    handleToolCall(name: string, args: any): Promise<any>;
    handleSuperAdminToolCall(name: string, args: any): Promise<any>;
    getWebApp(): express.Application;
    getSSEHandler(): {
        setupSSEServer: () => void;
        handleMCPRequest: (request: any) => Promise<any>;
    };
    private setupSSEServer;
    private handleMCPRequest;
}
//# sourceMappingURL=super-admin-server.d.ts.map