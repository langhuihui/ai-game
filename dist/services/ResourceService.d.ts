export interface GameResource {
    uri: string;
    name: string;
    description: string;
    mimeType: string;
}
export interface ResourceContent {
    uri: string;
    mimeType: string;
    text?: string;
    blob?: string;
}
export declare class ResourceService {
    private characterService;
    private sceneService;
    private itemService;
    private memoryService;
    private loggingService;
    private identityService;
    private citizenshipService;
    constructor();
    /**
     * 获取所有可用的资源列表
     */
    getAllResources(): GameResource[];
    /**
     * 根据URI读取资源内容
     */
    readResource(uri: string): Promise<ResourceContent>;
    /**
     * 辅助方法：获取角色按场景分组
     */
    private getCharactersByScene;
    /**
     * 辅助方法：获取场景连接
     */
    private getSceneConnections;
    /**
     * 辅助方法：获取按场景分组的物品
     */
    private getItemsByScene;
    /**
     * 辅助方法：获取按角色分组的物品
     */
    private getItemsByCharacter;
    /**
     * 辅助方法：获取最近的记忆
     */
    private getRecentMemories;
    /**
     * 辅助方法：获取角色活动统计
     */
    private getCharacterActivityStats;
    /**
     * 辅助方法：获取活跃的交易报价
     */
    private getActiveTradeOffers;
    /**
     * 辅助方法：获取交易历史
     */
    private getTradeHistory;
    /**
     * 辅助方法：获取游戏概览
     */
    private getGameOverview;
    /**
     * 辅助方法：获取世界地图
     */
    private getWorldMap;
    /**
     * 获取单个角色的完整资源
     */
    private getCharacterResource;
    /**
     * 获取单个场景的完整资源
     */
    private getSceneResource;
    /**
     * 获取单个物品的完整资源
     */
    private getItemResource;
    /**
     * 获取角色的所有记忆资源
     */
    private getCharacterMemoriesResource;
    /**
     * 获取角色的活动历史资源
     */
    private getCharacterActivityResource;
    /**
     * 获取角色的基本信息资源
     */
    private getCharacterBasicInfoResource;
    /**
     * 获取公民申请状态资源
     */
    private getCitizenshipApplicationResource;
}
//# sourceMappingURL=ResourceService.d.ts.map