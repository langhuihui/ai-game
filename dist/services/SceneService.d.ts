import { Scene, SceneDetails, CreateSceneData, CreateConnectionData, SceneConnection } from '../models/Scene.js';
export declare class SceneService {
    private db;
    private characterService;
    createScene(data: CreateSceneData): Scene;
    getSceneById(id: number): Scene | null;
    getSceneByName(name: string): Scene | null;
    getAllScenes(): Scene[];
    getSceneDetails(id: number): SceneDetails | null;
    connectScenes(data: CreateConnectionData): SceneConnection | null;
    getConnectionById(id: number): SceneConnection | null;
    getConnectionsFromScene(sceneId: number): SceneConnection[];
    canMoveBetweenScenes(fromSceneId: number, toSceneId: number): boolean;
    deleteScene(id: number): boolean;
    deleteConnection(id: number): boolean;
}
//# sourceMappingURL=SceneService.d.ts.map