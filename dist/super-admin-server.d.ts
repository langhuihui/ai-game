#!/usr/bin/env node
import { Tool } from '@modelcontextprotocol/sdk/types.js';
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
    getTools(): Tool[];
    getSuperAdminTools(): Tool[];
    handleToolCall(name: string, args: any): Promise<any>;
    handleSuperAdminToolCall(name: string, args: any): Promise<any>;
    getWebApp(): express.Application;
    getSSEHandler(): {
        setupSSEServer: () => void;
        handleMCPRequest: (request: any, headers?: any) => Promise<any>;
    };
    private setupSSEServer;
    private handleMCPRequest;
}
//# sourceMappingURL=super-admin-server.d.ts.map