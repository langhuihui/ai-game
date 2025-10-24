export class PromptService {
    /**
     * 获取所有可用的提示词模板
     */
    getAllPrompts() {
        return [
            {
                name: 'character_analysis',
                description: '分析指定角色的状态、记忆和活动历史',
                arguments: [
                    {
                        name: 'character_name',
                        description: '要分析的角色名称',
                        required: true
                    }
                ]
            },
            {
                name: 'scene_description',
                description: '生成指定场景的详细描述，包括其中的角色和物品',
                arguments: [
                    {
                        name: 'scene_name',
                        description: '要描述的场景名称',
                        required: true
                    }
                ]
            },
            {
                name: 'world_status',
                description: '生成游戏世界的整体状态报告',
                arguments: []
            },
            {
                name: 'character_interaction',
                description: '为两个角色生成互动对话场景',
                arguments: [
                    {
                        name: 'character1_name',
                        description: '第一个角色名称',
                        required: true
                    },
                    {
                        name: 'character2_name',
                        description: '第二个角色名称',
                        required: true
                    },
                    {
                        name: 'scene_name',
                        description: '互动发生的场景',
                        required: false
                    }
                ]
            },
            {
                name: 'quest_generation',
                description: '基于当前游戏状态生成新的任务或剧情',
                arguments: [
                    {
                        name: 'character_name',
                        description: '接受任务的角色名称',
                        required: true
                    },
                    {
                        name: 'quest_type',
                        description: '任务类型（exploration, trade, social, combat等）',
                        required: false
                    }
                ]
            },
            {
                name: 'memory_analysis',
                description: '分析角色的记忆模式和心理状态',
                arguments: [
                    {
                        name: 'character_name',
                        description: '要分析记忆的角色名称',
                        required: true
                    }
                ]
            },
            {
                name: 'trade_negotiation',
                description: '生成交易谈判的对话场景',
                arguments: [
                    {
                        name: 'seller_name',
                        description: '卖家的角色名称',
                        required: true
                    },
                    {
                        name: 'buyer_name',
                        description: '买家的角色名称',
                        required: true
                    },
                    {
                        name: 'item_name',
                        description: '交易的物品名称',
                        required: true
                    }
                ]
            },
            {
                name: 'citizenship_review',
                description: '生成公民申请审查的评估报告',
                arguments: [
                    {
                        name: 'applicant_name',
                        description: '申请人的角色名称',
                        required: true
                    }
                ]
            },
            {
                name: 'permission_audit',
                description: '生成权限系统的审计报告',
                arguments: []
            },
            {
                name: 'game_narrative',
                description: '基于当前游戏状态生成叙事性描述',
                arguments: [
                    {
                        name: 'focus_area',
                        description: '关注的区域（characters, scenes, activities等）',
                        required: false
                    }
                ]
            }
        ];
    }
    /**
     * 根据提示词名称和参数生成提示词消息
     */
    async getPromptMessages(name, args = {}) {
        switch (name) {
            case 'character_analysis':
                return this.generateCharacterAnalysisPrompt(args);
            case 'scene_description':
                return this.generateSceneDescriptionPrompt(args);
            case 'world_status':
                return this.generateWorldStatusPrompt();
            case 'character_interaction':
                return this.generateCharacterInteractionPrompt(args);
            case 'quest_generation':
                return this.generateQuestGenerationPrompt(args);
            case 'memory_analysis':
                return this.generateMemoryAnalysisPrompt(args);
            case 'trade_negotiation':
                return this.generateTradeNegotiationPrompt(args);
            case 'citizenship_review':
                return this.generateCitizenshipReviewPrompt(args);
            case 'permission_audit':
                return this.generatePermissionAuditPrompt();
            case 'game_narrative':
                return this.generateGameNarrativePrompt(args);
            default:
                throw new Error(`Unknown prompt: ${name}`);
        }
    }
    generateCharacterAnalysisPrompt(args) {
        const characterName = args.character_name;
        return [
            {
                role: 'system',
                content: {
                    type: 'text',
                    text: `你是一个游戏角色分析师。请分析名为"${characterName}"的角色。你需要从以下几个方面进行分析：

1. **基本状态分析**：
   - 健康状态和心理健康状态
   - 当前所在场景
   - 拥有的货币和物品

2. **记忆分析**：
   - 短期记忆的内容和模式
   - 长期记忆的重要性和主题
   - 记忆对角色性格的影响

3. **活动历史**：
   - 最近的活动记录
   - 行为模式和趋势
   - 与其他角色的互动情况

4. **性格特征**：
   - 基于描述和行为的性格分析
   - 可能的动机和目标
   - 性格的发展变化

5. **建议**：
   - 角色的发展方向建议
   - 可能的剧情发展建议

请提供详细、深入的分析报告。`
                }
            }
        ];
    }
    generateSceneDescriptionPrompt(args) {
        const sceneName = args.scene_name;
        return [
            {
                role: 'system',
                content: {
                    type: 'text',
                    text: `你是一个游戏场景描述师。请为场景"${sceneName}"生成一个生动、详细的描述。

你的描述应该包括：

1. **场景外观**：
   - 环境的视觉特征
   - 氛围和感觉
   - 光线、声音、气味等感官细节

2. **场景中的角色**：
   - 当前在场的角色
   - 他们的活动和状态
   - 角色之间的关系

3. **场景中的物品**：
   - 可交互的物品
   - 装饰性和功能性物品
   - 物品的分布和摆放

4. **场景连接**：
   - 通往其他场景的路径
   - 连接的类型和描述

5. **互动可能性**：
   - 角色可以进行的活动
   - 可能的剧情发展点

请用生动的语言创造一个沉浸式的场景体验。`
                }
            }
        ];
    }
    generateWorldStatusPrompt() {
        return [
            {
                role: 'system',
                content: {
                    type: 'text',
                    text: `你是一个游戏世界状态分析师。请基于当前的游戏数据生成一个全面的世界状态报告。

报告应该包括：

1. **整体概况**：
   - 游戏世界的总体状态
   - 活跃角色数量
   - 场景和物品的分布

2. **角色状态分析**：
   - 角色的健康和心理状态分布
   - 活跃度统计
   - 角色之间的关系网络

3. **经济活动**：
   - 货币流通情况
   - 交易活动统计
   - 物品分布和流动

4. **社会动态**：
   - 公民申请情况
   - 权限分布
   - 社交互动模式

5. **发展趋势**：
   - 游戏世界的发展方向
   - 潜在的问题和机遇
   - 建议的改进措施

请提供一个专业、详细的状态报告。`
                }
            }
        ];
    }
    generateCharacterInteractionPrompt(args) {
        const { character1_name, character2_name, scene_name } = args;
        return [
            {
                role: 'system',
                content: {
                    type: 'text',
                    text: `你是一个角色互动场景编剧。请为角色"${character1_name}"和"${character2_name}"生成一个自然的互动对话场景。

场景设置：${scene_name ? `发生在"${scene_name}"场景中` : '场景未指定，请选择合适的场景'}

你的任务：

1. **角色设定**：
   - 基于角色的性格和背景
   - 考虑他们的当前状态和记忆
   - 保持角色的一致性

2. **对话内容**：
   - 自然、真实的对话
   - 符合角色性格的语言风格
   - 有意义的互动和情感交流

3. **场景描述**：
   - 互动的环境和氛围
   - 角色的肢体语言和表情
   - 场景中的细节

4. **剧情发展**：
   - 对话的起因和目的
   - 可能的冲突或合作
   - 对后续剧情的影响

请创建一个引人入胜的互动场景。`
                }
            }
        ];
    }
    generateQuestGenerationPrompt(args) {
        const { character_name, quest_type } = args;
        return [
            {
                role: 'system',
                content: {
                    type: 'text',
                    text: `你是一个游戏任务设计师。请为角色"${character_name}"生成一个合适的任务。

任务类型：${quest_type || '根据角色情况自动选择'}

任务设计要素：

1. **任务背景**：
   - 与角色当前状态的关联
   - 任务的重要性和意义
   - 任务来源和动机

2. **任务目标**：
   - 明确、具体的目标
   - 可衡量的完成标准
   - 与角色能力匹配的难度

3. **任务内容**：
   - 具体的行动步骤
   - 需要收集的信息或物品
   - 可能的挑战和障碍

4. **奖励机制**：
   - 完成任务后的奖励
   - 对角色发展的影响
   - 对游戏世界的影响

5. **剧情发展**：
   - 任务如何推动剧情
   - 与其他角色的互动机会
   - 可能的分支选择

请设计一个有趣、有挑战性且符合角色特点的任务。`
                }
            }
        ];
    }
    generateMemoryAnalysisPrompt(args) {
        const characterName = args.character_name;
        return [
            {
                role: 'system',
                content: {
                    type: 'text',
                    text: `你是一个记忆分析专家。请分析角色"${characterName}"的记忆模式和心理状态。

分析重点：

1. **记忆内容分析**：
   - 短期记忆的主题和模式
   - 长期记忆的重要性和影响
   - 记忆之间的关联性

2. **心理状态评估**：
   - 基于记忆的心理健康状态
   - 情绪和情感模式
   - 认知能力和发展

3. **记忆影响**：
   - 记忆对行为的影响
   - 记忆对决策的影响
   - 记忆对人际关系的影响

4. **发展轨迹**：
   - 记忆的发展趋势
   - 心理状态的变化
   - 潜在的问题和机遇

5. **建议措施**：
   - 改善心理状态的建议
   - 记忆管理策略
   - 角色发展方向

请提供专业的心理分析报告。`
                }
            }
        ];
    }
    generateTradeNegotiationPrompt(args) {
        const { seller_name, buyer_name, item_name } = args;
        return [
            {
                role: 'system',
                content: {
                    type: 'text',
                    text: `你是一个交易谈判场景编剧。请为"${seller_name}"（卖家）和"${buyer_name}"（买家）关于物品"${item_name}"的交易生成谈判对话。

谈判要素：

1. **角色设定**：
   - 卖家和买家的性格特点
   - 他们的经济状况和需求
   - 对物品的态度和认知

2. **谈判策略**：
   - 各自的谈判策略
   - 价格期望和底线
   - 可能的妥协方案

3. **对话内容**：
   - 自然的谈判对话
   - 价格讨论和议价过程
   - 情感和策略的平衡

4. **场景描述**：
   - 谈判的环境和氛围
   - 角色的表情和肢体语言
   - 紧张感和戏剧性

5. **结果处理**：
   - 谈判的成功或失败
   - 对双方关系的影响
   - 后续可能的发展

请创造一个真实、有趣的交易谈判场景。`
                }
            }
        ];
    }
    generateCitizenshipReviewPrompt(args) {
        const applicantName = args.applicant_name;
        return [
            {
                role: 'system',
                content: {
                    type: 'text',
                    text: `你是一个公民申请审查员。请对申请人"${applicantName}"进行全面的评估。

评估标准：

1. **申请材料分析**：
   - 申请人的描述和性格
   - 申请动机和理由
   - 申请材料的完整性和真实性

2. **背景调查**：
   - 申请人的历史记录
   - 在游戏中的行为表现
   - 与其他角色的互动情况

3. **适合性评估**：
   - 是否符合公民标准
   - 对游戏社区的贡献潜力
   - 可能的负面影响

4. **风险评估**：
   - 潜在的安全风险
   - 对现有秩序的威胁
   - 长期影响评估

5. **审查建议**：
   - 批准或拒绝的建议
   - 具体的理由和依据
   - 后续的监督措施

请提供客观、专业的审查报告。`
                }
            }
        ];
    }
    generatePermissionAuditPrompt() {
        return [
            {
                role: 'system',
                content: {
                    type: 'text',
                    text: `你是一个权限系统审计专家。请对整个权限系统进行全面审计。

审计内容：

1. **权限分布分析**：
   - 各权限级别的分布情况
   - 权限分配的合理性
   - 权限使用情况统计

2. **安全性评估**：
   - 权限系统的安全性
   - 潜在的权限滥用风险
   - 访问控制的有效性

3. **合规性检查**：
   - 权限分配的合规性
   - 权限管理的规范性
   - 违规行为的识别

4. **效率分析**：
   - 权限管理的效率
   - 系统响应时间
   - 用户体验评估

5. **改进建议**：
   - 权限系统的优化建议
   - 安全性的增强措施
   - 管理流程的改进

请提供详细的审计报告和改进建议。`
                }
            }
        ];
    }
    generateGameNarrativePrompt(args) {
        const focusArea = args.focus_area || 'general';
        return [
            {
                role: 'system',
                content: {
                    type: 'text',
                    text: `你是一个游戏叙事师。请基于当前的游戏状态生成一个引人入胜的叙事性描述。

关注领域：${focusArea}

叙事要求：

1. **故事性**：
   - 将游戏数据转化为故事
   - 创造戏剧性和冲突
   - 保持叙事的连贯性

2. **角色发展**：
   - 展现角色的成长和变化
   - 角色的内心世界和动机
   - 角色之间的关系发展

3. **世界构建**：
   - 游戏世界的氛围和特色
   - 场景的生动描述
   - 世界的规则和逻辑

4. **情感共鸣**：
   - 引发读者的情感反应
   - 创造共鸣和理解
   - 传达深层的情感

5. **未来发展**：
   - 暗示可能的剧情发展
   - 埋下伏笔和悬念
   - 为后续故事做铺垫

请创造一个引人入胜的游戏叙事。`
                }
            }
        ];
    }
}
//# sourceMappingURL=PromptService.js.map