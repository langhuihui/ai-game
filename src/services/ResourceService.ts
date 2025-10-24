import { gameDb } from '../database.js';
import { CharacterService } from './CharacterService.js';
import { SceneService } from './SceneService.js';
import { ItemService } from './ItemService.js';
import { MemoryService } from './MemoryService.js';
import { LoggingService } from './LoggingService.js';
import { IdentityService } from './IdentityService.js';
import { CitizenshipApplicationService } from './CitizenshipApplicationService.js';
import { i18n } from './I18nService.js';

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

export class ResourceService {
  private characterService: CharacterService;
  private sceneService: SceneService;
  private itemService: ItemService;
  private memoryService: MemoryService;
  private loggingService: LoggingService;
  private identityService: IdentityService;
  private citizenshipService: CitizenshipApplicationService;

  constructor() {
    this.characterService = new CharacterService();
    this.sceneService = new SceneService();
    this.itemService = new ItemService();
    this.memoryService = new MemoryService();
    this.loggingService = new LoggingService();
    this.identityService = new IdentityService();
    this.citizenshipService = new CitizenshipApplicationService();
  }

  /**
   * 获取所有可用的资源列表
   */
  getAllResources(): GameResource[] {
    return [
      // 角色相关资源
      {
        uri: 'game://characters/all',
        name: i18n.t('resources.characters.all.name'),
        description: i18n.t('resources.characters.all.description'),
        mimeType: 'application/json'
      },
      {
        uri: 'game://character/{name}',
        name: i18n.t('resources.characters.single.name'),
        description: i18n.t('resources.characters.single.description'),
        mimeType: 'application/json'
      },
      {
        uri: 'game://characters/stats',
        name: i18n.t('resources.characters.stats.name'),
        description: i18n.t('resources.characters.stats.description'),
        mimeType: 'application/json'
      },

      // 场景相关资源
      {
        uri: 'game://scenes/all',
        name: i18n.t('resources.scenes.all.name'),
        description: i18n.t('resources.scenes.all.description'),
        mimeType: 'application/json'
      },
      {
        uri: 'game://scene/{name}',
        name: i18n.t('resources.scenes.single.name'),
        description: i18n.t('resources.scenes.single.description'),
        mimeType: 'application/json'
      },
      {
        uri: 'game://scenes/connections',
        name: i18n.t('resources.scenes.connections.name'),
        description: i18n.t('resources.scenes.connections.description'),
        mimeType: 'application/json'
      },

      // 物品相关资源
      {
        uri: 'game://items/all',
        name: i18n.t('resources.items.all.name'),
        description: i18n.t('resources.items.all.description'),
        mimeType: 'application/json'
      },
      {
        uri: 'game://item/{id}',
        name: i18n.t('resources.items.single.name'),
        description: i18n.t('resources.items.single.description'),
        mimeType: 'application/json'
      },
      {
        uri: 'game://items/distribution',
        name: i18n.t('resources.items.distribution.name'),
        description: i18n.t('resources.items.distribution.description'),
        mimeType: 'application/json'
      },

      // 记忆相关资源
      {
        uri: 'game://memories/recent',
        name: i18n.t('resources.memories.recent.name'),
        description: i18n.t('resources.memories.recent.description'),
        mimeType: 'application/json'
      },
      {
        uri: 'game://character/{name}/memories',
        name: i18n.t('resources.memories.character.name'),
        description: i18n.t('resources.memories.character.description'),
        mimeType: 'application/json'
      },

      // 活动日志资源
      {
        uri: 'game://logs/recent',
        name: i18n.t('resources.logs.recent.name'),
        description: i18n.t('resources.logs.recent.description'),
        mimeType: 'application/json'
      },
      {
        uri: 'game://logs/character-activity',
        name: i18n.t('resources.logs.characterActivity.name'),
        description: i18n.t('resources.logs.characterActivity.description'),
        mimeType: 'application/json'
      },
      {
        uri: 'game://character/{name}/activity',
        name: i18n.t('resources.logs.characterHistory.name'),
        description: i18n.t('resources.logs.characterHistory.description'),
        mimeType: 'application/json'
      },

      // 交易相关资源
      {
        uri: 'game://trade/offers',
        name: i18n.t('resources.trade.offers.name'),
        description: i18n.t('resources.trade.offers.description'),
        mimeType: 'application/json'
      },
      {
        uri: 'game://trade/history',
        name: i18n.t('resources.trade.history.name'),
        description: i18n.t('resources.trade.history.description'),
        mimeType: 'application/json'
      },

      // 权限相关资源
      {
        uri: 'game://identities/all',
        name: i18n.t('resources.identities.all.name'),
        description: i18n.t('resources.identities.all.description'),
        mimeType: 'application/json'
      },
      {
        uri: 'game://identities/stats',
        name: i18n.t('resources.identities.stats.name'),
        description: i18n.t('resources.identities.stats.description'),
        mimeType: 'application/json'
      },

      // 公民申请相关资源
      {
        uri: 'game://citizenship/applications',
        name: i18n.t('resources.citizenship.applications.name'),
        description: i18n.t('resources.citizenship.applications.description'),
        mimeType: 'application/json'
      },
      {
        uri: 'game://citizenship/application/{character_id}',
        name: i18n.t('resources.citizenship.single.name'),
        description: i18n.t('resources.citizenship.single.description'),
        mimeType: 'application/json'
      },
      {
        uri: 'game://citizenship/stats',
        name: i18n.t('resources.citizenship.stats.name'),
        description: i18n.t('resources.citizenship.stats.description'),
        mimeType: 'application/json'
      },

      // 游戏信息资源
      {
        uri: 'game://info/rules',
        name: i18n.t('resources.info.rules.name'),
        description: i18n.t('resources.info.rules.description'),
        mimeType: 'application/json'
      },
      {
        uri: 'game://character/{id}/basic-info',
        name: i18n.t('resources.info.basicInfo.name'),
        description: i18n.t('resources.info.basicInfo.description'),
        mimeType: 'application/json'
      },

      // 游戏状态资源
      {
        uri: 'game://state/overview',
        name: i18n.t('resources.state.overview.name'),
        description: i18n.t('resources.state.overview.description'),
        mimeType: 'application/json'
      },
      {
        uri: 'game://state/world-map',
        name: i18n.t('resources.state.worldMap.name'),
        description: i18n.t('resources.state.worldMap.description'),
        mimeType: 'application/json'
      }
    ];
  }

  /**
   * 根据URI读取资源内容
   */
  async readResource(uri: string): Promise<ResourceContent> {
    // 处理动态URI模式
    const characterMatch = uri.match(/^game:\/\/character\/(.+)$/);
    if (characterMatch) {
      const characterName = decodeURIComponent(characterMatch[1]);
      return await this.getCharacterResource(characterName);
    }

    const sceneMatch = uri.match(/^game:\/\/scene\/(.+)$/);
    if (sceneMatch) {
      const sceneName = decodeURIComponent(sceneMatch[1]);
      return await this.getSceneResource(sceneName);
    }

    const itemMatch = uri.match(/^game:\/\/item\/(\d+)$/);
    if (itemMatch) {
      const itemId = parseInt(itemMatch[1]);
      return await this.getItemResource(itemId);
    }

    const characterMemoriesMatch = uri.match(/^game:\/\/character\/(.+)\/memories$/);
    if (characterMemoriesMatch) {
      const characterName = decodeURIComponent(characterMemoriesMatch[1]);
      return await this.getCharacterMemoriesResource(characterName);
    }

    const characterActivityMatch = uri.match(/^game:\/\/character\/(.+)\/activity$/);
    if (characterActivityMatch) {
      const characterName = decodeURIComponent(characterActivityMatch[1]);
      return await this.getCharacterActivityResource(characterName);
    }

    const characterBasicInfoMatch = uri.match(/^game:\/\/character\/(\d+)\/basic-info$/);
    if (characterBasicInfoMatch) {
      const characterId = parseInt(characterBasicInfoMatch[1]);
      return await this.getCharacterBasicInfoResource(characterId);
    }

    const citizenshipApplicationMatch = uri.match(/^game:\/\/citizenship\/application\/(.+)$/);
    if (citizenshipApplicationMatch) {
      const characterId = decodeURIComponent(citizenshipApplicationMatch[1]);
      return await this.getCitizenshipApplicationResource(characterId);
    }

    // 处理静态URI
    switch (uri) {
      case 'game://characters/all':
        return {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify({
            characters: this.characterService.getAllCharacters(),
            total_count: this.characterService.getAllCharacters().length,
            timestamp: new Date().toISOString()
          }, null, 2)
        };

      case 'game://characters/stats':
        const characters = this.characterService.getAllCharacters();
        return {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify({
            total_characters: characters.length,
            average_health: characters.reduce((sum, c) => sum + c.health, 0) / characters.length,
            average_mental_state: characters.reduce((sum, c) => sum + c.mental_state, 0) / characters.length,
            total_currency: characters.reduce((sum, c) => sum + c.currency, 0),
            characters_by_scene: this.getCharactersByScene(characters),
            timestamp: new Date().toISOString()
          }, null, 2)
        };

      case 'game://scenes/all':
        return {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify({
            scenes: this.sceneService.getAllScenes(),
            total_count: this.sceneService.getAllScenes().length,
            timestamp: new Date().toISOString()
          }, null, 2)
        };

      case 'game://scenes/connections':
        return {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify({
            connections: this.getSceneConnections(),
            timestamp: new Date().toISOString()
          }, null, 2)
        };

      case 'game://items/all':
        return {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify({
            items: this.itemService.getAllItems(),
            total_count: this.itemService.getAllItems().length,
            timestamp: new Date().toISOString()
          }, null, 2)
        };

      case 'game://items/distribution':
        return {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify({
            items_in_scenes: this.getItemsByScene(),
            items_with_characters: this.getItemsByCharacter(),
            total_items: this.itemService.getAllItems().length,
            timestamp: new Date().toISOString()
          }, null, 2)
        };

      case 'game://memories/recent':
        return {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify({
            recent_memories: this.getRecentMemories(),
            timestamp: new Date().toISOString()
          }, null, 2)
        };

      case 'game://logs/recent':
        return {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify({
            recent_logs: this.loggingService.getAllLogs(50),
            timestamp: new Date().toISOString()
          }, null, 2)
        };

      case 'game://logs/character-activity':
        return {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify({
            character_activity: this.getCharacterActivityStats(),
            timestamp: new Date().toISOString()
          }, null, 2)
        };

      case 'game://trade/offers':
        return {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify({
            active_trade_offers: this.getActiveTradeOffers(),
            timestamp: new Date().toISOString()
          }, null, 2)
        };

      case 'game://trade/history':
        return {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify({
            trade_history: this.getTradeHistory(),
            timestamp: new Date().toISOString()
          }, null, 2)
        };

      case 'game://identities/all':
        return {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify({
            identities: this.identityService.getAllIdentities(),
            timestamp: new Date().toISOString()
          }, null, 2)
        };

      case 'game://identities/stats':
        return {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify({
            identity_stats: this.identityService.getIdentityStats(),
            timestamp: new Date().toISOString()
          }, null, 2)
        };

      case 'game://citizenship/applications':
        return {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify({
            applications: this.citizenshipService.getAllApplications(),
            pending_applications: this.citizenshipService.getPendingApplications(),
            timestamp: new Date().toISOString()
          }, null, 2)
        };

      case 'game://citizenship/stats':
        return {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify({
            application_stats: this.citizenshipService.getApplicationStats(),
            timestamp: new Date().toISOString()
          }, null, 2)
        };

      case 'game://state/overview':
        return {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify({
            game_overview: this.getGameOverview(),
            timestamp: new Date().toISOString()
          }, null, 2)
        };

      case 'game://state/world-map':
        return {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify({
            world_map: this.getWorldMap(),
            timestamp: new Date().toISOString()
          }, null, 2)
        };

      case 'game://info/rules':
        return {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify({
            game_rules: this.citizenshipService.getGameRules(),
            timestamp: new Date().toISOString()
          }, null, 2)
        };

      default:
        throw new Error(i18n.t('errors.resourceNotFound', { uri }));
    }
  }

  /**
   * 辅助方法：获取角色按场景分组
   */
  private getCharactersByScene(characters: any[]): any {
    const sceneGroups: { [key: string]: any[]; } = {};
    characters.forEach(character => {
      const sceneId = character.current_scene_id || 'unknown';
      if (!sceneGroups[sceneId]) {
        sceneGroups[sceneId] = [];
      }
      sceneGroups[sceneId].push(character);
    });
    return sceneGroups;
  }

  /**
   * 辅助方法：获取场景连接
   */
  private getSceneConnections(): any[] {
    const db = gameDb.getDatabase();
    return db.prepare(`
      SELECT sc.*, 
             s1.name as from_scene_name, 
             s2.name as to_scene_name
      FROM scene_connections sc
      LEFT JOIN scenes s1 ON sc.from_scene_id = s1.id
      LEFT JOIN scenes s2 ON sc.to_scene_id = s2.id
      ORDER BY sc.created_at
    `).all();
  }

  /**
   * 辅助方法：获取按场景分组的物品
   */
  private getItemsByScene(): any[] {
    const db = gameDb.getDatabase();
    return db.prepare(`
      SELECT i.*, s.name as scene_name
      FROM items i
      LEFT JOIN scenes s ON i.scene_id = s.id
      WHERE i.scene_id IS NOT NULL
      ORDER BY s.name, i.name
    `).all();
  }

  /**
   * 辅助方法：获取按角色分组的物品
   */
  private getItemsByCharacter(): any[] {
    const db = gameDb.getDatabase();
    return db.prepare(`
      SELECT i.*, c.name as character_name
      FROM items i
      LEFT JOIN characters c ON i.character_id = c.id
      WHERE i.character_id IS NOT NULL
      ORDER BY c.name, i.name
    `).all();
  }

  /**
   * 辅助方法：获取最近的记忆
   */
  private getRecentMemories(): any {
    const db = gameDb.getDatabase();
    const shortMemories = db.prepare(`
      SELECT sm.*, c.name as character_name
      FROM short_memories sm
      LEFT JOIN characters c ON sm.character_id = c.id
      ORDER BY sm.timestamp DESC
      LIMIT 20
    `).all();

    const longMemories = db.prepare(`
      SELECT lm.*, c.name as character_name
      FROM long_memories lm
      LEFT JOIN characters c ON lm.character_id = c.id
      ORDER BY lm.timestamp DESC
      LIMIT 20
    `).all();

    return {
      short_memories: shortMemories,
      long_memories: longMemories
    };
  }

  /**
   * 辅助方法：获取角色活动统计
   */
  private getCharacterActivityStats(): any[] {
    const db = gameDb.getDatabase();
    return db.prepare(`
      SELECT c.id, c.name, 
             COUNT(al.id) as action_count,
             MAX(al.timestamp) as last_action_time
      FROM characters c
      LEFT JOIN action_logs al ON c.id = al.character_id
      GROUP BY c.id, c.name
      ORDER BY action_count DESC, last_action_time DESC
    `).all();
  }

  /**
   * 辅助方法：获取活跃的交易报价
   */
  private getActiveTradeOffers(): any[] {
    const db = gameDb.getDatabase();
    return db.prepare(`
      SELECT to.*, 
             c1.name as from_character_name,
             c2.name as to_character_name,
             i.name as item_name
      FROM trade_offers to
      LEFT JOIN characters c1 ON to.from_character_id = c1.id
      LEFT JOIN characters c2 ON to.to_character_id = c2.id
      LEFT JOIN items i ON to.item_id = i.id
      WHERE to.status = 'pending'
      ORDER BY to.created_at DESC
    `).all();
  }

  /**
   * 辅助方法：获取交易历史
   */
  private getTradeHistory(): any[] {
    const db = gameDb.getDatabase();
    return db.prepare(`
      SELECT to.*, 
             c1.name as from_character_name,
             c2.name as to_character_name,
             i.name as item_name
      FROM trade_offers to
      LEFT JOIN characters c1 ON to.from_character_id = c1.id
      LEFT JOIN characters c2 ON to.to_character_id = c2.id
      LEFT JOIN items i ON to.item_id = i.id
      WHERE to.status IN ('accepted', 'rejected')
      ORDER BY to.responded_at DESC
      LIMIT 50
    `).all();
  }

  /**
   * 辅助方法：获取游戏概览
   */
  private getGameOverview(): any {
    const characters = this.characterService.getAllCharacters();
    const scenes = this.sceneService.getAllScenes();
    const items = this.itemService.getAllItems();
    const identityStats = this.identityService.getIdentityStats();
    const applicationStats = this.citizenshipService.getApplicationStats();

    return {
      total_characters: characters.length,
      total_scenes: scenes.length,
      total_items: items.length,
      identity_stats: identityStats,
      application_stats: applicationStats,
      recent_activity: this.loggingService.getAllLogs(10).length
    };
  }

  /**
   * 辅助方法：获取世界地图
   */
  private getWorldMap(): any {
    const scenes = this.sceneService.getAllScenes();
    const connections = this.getSceneConnections();

    return {
      scenes: scenes,
      connections: connections,
      total_scenes: scenes.length,
      total_connections: connections.length
    };
  }

  /**
   * 获取单个角色的完整资源
   */
  private async getCharacterResource(characterName: string): Promise<ResourceContent> {
    const character = this.characterService.getCharacterByName(characterName);
    if (!character) {
      throw new Error(i18n.t('errors.characterNotFound', { name: characterName }));
    }

    // 获取角色的物品
    const items = this.itemService.getItemsByCharacter(character.id);

    // 获取角色的记忆
    const shortMemories = this.memoryService.getShortMemories(character.id);
    const longMemories = this.memoryService.getLongMemories(character.id);

    // 获取角色的活动日志
    const db = gameDb.getDatabase();
    const activityLogs = db.prepare(`
      SELECT * FROM action_logs 
      WHERE character_id = ? 
      ORDER BY timestamp DESC 
      LIMIT 20
    `).all(character.id);

    // 获取角色的权限信息
    const identity = this.identityService.getIdentityByCharacterId(character.id);

    return {
      uri: `game://character/${characterName}`,
      mimeType: 'application/json',
      text: JSON.stringify({
        character: character,
        items: items,
        memories: {
          short_memories: shortMemories,
          long_memories: longMemories
        },
        recent_activity: activityLogs,
        identity: identity,
        timestamp: new Date().toISOString()
      }, null, 2)
    };
  }

  /**
   * 获取单个场景的完整资源
   */
  private async getSceneResource(sceneName: string): Promise<ResourceContent> {
    const scene = this.sceneService.getSceneByName(sceneName);
    if (!scene) {
      throw new Error(i18n.t('errors.sceneNotFound', { name: sceneName }));
    }

    // 获取场景中的角色
    const charactersInScene = this.characterService.getCharactersInScene(scene.id);

    // 获取场景中的物品
    const itemsInScene = this.itemService.getItemsInScene(scene.id);

    // 获取场景的连接
    const db = gameDb.getDatabase();
    const outgoingConnections = db.prepare(`
      SELECT sc.*, s.name as to_scene_name
      FROM scene_connections sc
      LEFT JOIN scenes s ON sc.to_scene_id = s.id
      WHERE sc.from_scene_id = ?
    `).all(scene.id);

    const incomingConnections = db.prepare(`
      SELECT sc.*, s.name as from_scene_name
      FROM scene_connections sc
      LEFT JOIN scenes s ON sc.from_scene_id = s.id
      WHERE sc.to_scene_id = ?
    `).all(scene.id);

    return {
      uri: `game://scene/${sceneName}`,
      mimeType: 'application/json',
      text: JSON.stringify({
        scene: scene,
        characters: charactersInScene,
        items: itemsInScene,
        connections: {
          outgoing: outgoingConnections,
          incoming: incomingConnections
        },
        timestamp: new Date().toISOString()
      }, null, 2)
    };
  }

  /**
   * 获取单个物品的完整资源
   */
  private async getItemResource(itemId: number): Promise<ResourceContent> {
    const item = this.itemService.getItemById(itemId);
    if (!item) {
      throw new Error(i18n.t('errors.itemNotFound', { id: itemId }));
    }

    // 获取物品的位置信息
    let location: any = { type: 'unknown' };
    if (item.character_id) {
      const character = this.characterService.getCharacterById(item.character_id);
      location = {
        type: 'character',
        character: character
      };
    } else if (item.scene_id) {
      const scene = this.sceneService.getSceneById(item.scene_id);
      location = {
        type: 'scene',
        scene: scene
      };
    }

    return {
      uri: `game://item/${itemId}`,
      mimeType: 'application/json',
      text: JSON.stringify({
        item: item,
        location: location,
        timestamp: new Date().toISOString()
      }, null, 2)
    };
  }

  /**
   * 获取角色的所有记忆资源
   */
  private async getCharacterMemoriesResource(characterName: string): Promise<ResourceContent> {
    const character = this.characterService.getCharacterByName(characterName);
    if (!character) {
      throw new Error(i18n.t('errors.characterNotFound', { name: characterName }));
    }

    const shortMemories = this.memoryService.getShortMemories(character.id);
    const longMemories = this.memoryService.getLongMemories(character.id);

    return {
      uri: `game://character/${characterName}/memories`,
      mimeType: 'application/json',
      text: JSON.stringify({
        character_name: characterName,
        short_memories: shortMemories,
        long_memories: longMemories,
        total_short: shortMemories.length,
        total_long: longMemories.length,
        timestamp: new Date().toISOString()
      }, null, 2)
    };
  }

  /**
   * 获取角色的活动历史资源
   */
  private async getCharacterActivityResource(characterName: string): Promise<ResourceContent> {
    const character = this.characterService.getCharacterByName(characterName);
    if (!character) {
      throw new Error(i18n.t('errors.characterNotFound', { name: characterName }));
    }

    const db = gameDb.getDatabase();
    const activityLogs = db.prepare(`
      SELECT * FROM action_logs 
      WHERE character_id = ? 
      ORDER BY timestamp DESC
    `).all(character.id);

    const activityStats = db.prepare(`
      SELECT 
        action_type,
        COUNT(*) as count,
        MAX(timestamp) as last_occurrence
      FROM action_logs
      WHERE character_id = ?
      GROUP BY action_type
      ORDER BY count DESC
    `).all(character.id);

    return {
      uri: `game://character/${characterName}/activity`,
      mimeType: 'application/json',
      text: JSON.stringify({
        character_name: characterName,
        activity_logs: activityLogs,
        activity_stats: activityStats,
        total_actions: activityLogs.length,
        timestamp: new Date().toISOString()
      }, null, 2)
    };
  }

  /**
   * 获取角色的基本信息资源
   */
  private async getCharacterBasicInfoResource(characterId: number): Promise<ResourceContent> {
    const characterInfo = this.citizenshipService.getCharacterBasicInfo(characterId);
    if (!characterInfo) {
      throw new Error(i18n.t('errors.characterNotFound', { name: String(characterId) }));
    }

    return {
      uri: `game://character/${characterId}/basic-info`,
      mimeType: 'application/json',
      text: JSON.stringify({
        character_info: characterInfo,
        timestamp: new Date().toISOString()
      }, null, 2)
    };
  }

  /**
   * 获取公民申请状态资源
   */
  private async getCitizenshipApplicationResource(characterId: string): Promise<ResourceContent> {
    const application = this.citizenshipService.getApplicationByCharacterId(characterId);
    if (!application) {
      throw new Error(i18n.t('errors.noCitizenshipApplication', { characterId }));
    }

    return {
      uri: `game://citizenship/application/${characterId}`,
      mimeType: 'application/json',
      text: JSON.stringify({
        application: application,
        status: application.status,
        timestamp: new Date().toISOString()
      }, null, 2)
    };
  }
}
