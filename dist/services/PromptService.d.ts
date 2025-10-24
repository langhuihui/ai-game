export interface GamePrompt {
    name: string;
    description: string;
    arguments?: Array<{
        name: string;
        description: string;
        required: boolean;
    }>;
}
export interface PromptMessage {
    role: 'user' | 'assistant' | 'system';
    content: {
        type: 'text';
        text: string;
    };
}
export declare class PromptService {
    /**
     * 获取所有可用的提示词模板
     */
    getAllPrompts(): GamePrompt[];
    /**
     * 根据提示词名称和参数生成提示词消息
     */
    getPromptMessages(name: string, args?: Record<string, any>): Promise<PromptMessage[]>;
    private generateCharacterAnalysisPrompt;
    private generateSceneDescriptionPrompt;
    private generateWorldStatusPrompt;
    private generateCharacterInteractionPrompt;
    private generateQuestGenerationPrompt;
    private generateMemoryAnalysisPrompt;
    private generateTradeNegotiationPrompt;
    private generateCitizenshipReviewPrompt;
    private generatePermissionAuditPrompt;
    private generateGameNarrativePrompt;
}
//# sourceMappingURL=PromptService.d.ts.map