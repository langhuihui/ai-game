import { execSync } from 'child_process';
import * as os from 'os';

export type SupportedLanguage = 'en' | 'zh';

export interface TranslationData {
  [key: string]: string | TranslationData;
}

export class I18nService {
  private static instance: I18nService;
  private currentLanguage: SupportedLanguage;
  private translations: { [key in SupportedLanguage]: TranslationData };

  private constructor() {
    // 检测操作系统语言
    this.currentLanguage = this.detectSystemLanguage();
    this.translations = {
      en: this.getEnglishTranslations(),
      zh: this.getChineseTranslations()
    };

    console.log(`🌍 I18n initialized with language: ${this.currentLanguage}`);
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): I18nService {
    if (!I18nService.instance) {
      I18nService.instance = new I18nService();
    }
    return I18nService.instance;
  }

  /**
   * 检测系统语言
   */
  private detectSystemLanguage(): SupportedLanguage {
    try {
      const platform = os.platform();
      let systemLang = '';

      if (platform === 'darwin' || platform === 'linux') {
        // macOS or Linux
        try {
          systemLang = process.env.LANG || process.env.LANGUAGE || process.env.LC_ALL || '';
        } catch (error) {
          console.error('Error detecting system language:', error);
        }
      } else if (platform === 'win32') {
        // Windows
        try {
          const output = execSync('powershell -Command "Get-Culture | Select-Object -ExpandProperty Name"', {
            encoding: 'utf8',
            timeout: 1000
          });
          systemLang = output.trim();
        } catch (error) {
          console.error('Error detecting system language on Windows:', error);
        }
      }

      // 解析语言代码
      const langCode = systemLang.toLowerCase();

      if (langCode.includes('zh') || langCode.includes('cn')) {
        return 'zh';
      }

      // 默认返回英文
      return 'en';
    } catch (error) {
      console.error('Error in detectSystemLanguage:', error);
      return 'en'; // 默认英文
    }
  }

  /**
   * 获取当前语言
   */
  public getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  /**
   * 设置当前语言
   */
  public setLanguage(language: SupportedLanguage): void {
    this.currentLanguage = language;
    console.log(`🌍 Language changed to: ${language}`);
  }

  /**
   * 翻译函数
   */
  public t(key: string, params?: { [key: string]: string | number; }): string {
    const keys = key.split('.');
    let value: any = this.translations[this.currentLanguage];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // 如果找不到翻译，返回 key 本身
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }

    if (typeof value !== 'string') {
      console.warn(`Translation value is not a string: ${key}`);
      return key;
    }

    // 替换参数
    if (params) {
      Object.keys(params).forEach(paramKey => {
        value = value.replace(new RegExp(`{${paramKey}}`, 'g'), String(params[paramKey]));
      });
    }

    return value;
  }

  /**
   * 英文翻译
   */
  private getEnglishTranslations(): TranslationData {
    return {
      resources: {
        characters: {
          all: {
            name: 'All Characters',
            description: 'Get detailed information of all characters in the game'
          },
          single: {
            name: 'Single Character',
            description: 'Get complete data of a specified character (replace {name} with character name)'
          },
          stats: {
            name: 'Character Statistics',
            description: 'Get character statistics and overview'
          }
        },
        scenes: {
          all: {
            name: 'All Scenes',
            description: 'Get detailed information of all scenes in the game'
          },
          single: {
            name: 'Single Scene',
            description: 'Get complete data of a specified scene (replace {name} with scene name)'
          },
          connections: {
            name: 'Scene Connections',
            description: 'Get connection relationships between all scenes'
          }
        },
        items: {
          all: {
            name: 'All Items',
            description: 'Get detailed information of all items in the game'
          },
          single: {
            name: 'Single Item',
            description: 'Get detailed information of a specified item (replace {id} with item ID)'
          },
          distribution: {
            name: 'Item Distribution',
            description: 'Get the distribution of items across scenes and characters'
          }
        },
        memories: {
          recent: {
            name: 'Recent Memories',
            description: 'Get recent memory activities of all characters'
          },
          character: {
            name: 'Character Memories',
            description: 'Get all memories of a specified character (replace {name} with character name)'
          }
        },
        logs: {
          recent: {
            name: 'Recent Activity',
            description: 'Get recent activity logs in the game'
          },
          characterActivity: {
            name: 'Character Activity',
            description: 'Get activity statistics of all characters'
          },
          characterHistory: {
            name: 'Character Activity History',
            description: 'Get activity history of a specified character (replace {name} with character name)'
          }
        },
        trade: {
          offers: {
            name: 'Trade Offers',
            description: 'Get all current trade offers'
          },
          history: {
            name: 'Trade History',
            description: 'Get trade history records'
          }
        },
        identities: {
          all: {
            name: 'Identity Information',
            description: 'Get all identity and character identity information'
          },
          stats: {
            name: 'Identity Statistics',
            description: 'Get statistics of the identity system'
          }
        },
        citizenship: {
          applications: {
            name: 'Citizenship Applications',
            description: 'Get information of all citizenship applications'
          },
          single: {
            name: 'Single Citizenship Application',
            description: 'Get citizenship application status of a specified character (replace {character_id} with character_id)'
          },
          stats: {
            name: 'Citizenship Statistics',
            description: 'Get statistics of citizenship applications'
          }
        },
        info: {
          rules: {
            name: 'Game Rules',
            description: 'Get game rules and gameplay information'
          },
          basicInfo: {
            name: 'Character Basic Info',
            description: 'Get basic information of a character (ID and permission level, replace {id} with character ID)'
          }
        },
        state: {
          overview: {
            name: 'Game Overview',
            description: 'Get overall game state overview'
          },
          worldMap: {
            name: 'World Map',
            description: 'Get complete map structure of the game world'
          }
        }
      },
      errors: {
        characterNotFound: 'Character "{name}" not found',
        sceneNotFound: 'Scene "{name}" not found',
        itemNotFound: 'Item with ID {id} not found',
        resourceNotFound: 'Resource not found: {uri}',
        noCitizenshipApplication: 'No citizenship application found for character ID: {characterId}'
      },
      server: {
        starting: '🚀 Starting Game Server...',
        webMode: '🚀 Starting Game Server in Web mode...',
        stdioMode: '🚀 Starting MCP Game Server in stdio mode...',
        webInterface: '🌐 Web interface available at http://localhost:3000',
        mcpSse: '🔧 MCP SSE server available at http://localhost:3000/mcp',
        mcpStdio: '🔧 MCP Game Server running on stdio',
        started: '✅ Server started successfully!',
        mcpStarted: '✅ MCP Server started successfully!'
      }
    };
  }

  /**
   * 中文翻译
   */
  private getChineseTranslations(): TranslationData {
    return {
      resources: {
        characters: {
          all: {
            name: '所有角色',
            description: '获取游戏中所有角色的详细信息'
          },
          single: {
            name: '单个角色',
            description: '获取指定角色的完整数据（使用角色名称替换{name}）'
          },
          stats: {
            name: '角色统计',
            description: '获取角色的统计信息和概览'
          }
        },
        scenes: {
          all: {
            name: '所有场景',
            description: '获取游戏中所有场景的详细信息'
          },
          single: {
            name: '单个场景',
            description: '获取指定场景的完整数据（使用场景名称替换{name}）'
          },
          connections: {
            name: '场景连接',
            description: '获取所有场景之间的连接关系'
          }
        },
        items: {
          all: {
            name: '所有物品',
            description: '获取游戏中所有物品的详细信息'
          },
          single: {
            name: '单个物品',
            description: '获取指定物品的详细信息（使用物品ID替换{id}）'
          },
          distribution: {
            name: '物品分布',
            description: '获取物品在场景和角色中的分布情况'
          }
        },
        memories: {
          recent: {
            name: '最近记忆',
            description: '获取所有角色最近的记忆活动'
          },
          character: {
            name: '角色记忆',
            description: '获取指定角色的所有记忆（使用角色名称替换{name}）'
          }
        },
        logs: {
          recent: {
            name: '最近活动',
            description: '获取游戏中的最近活动日志'
          },
          characterActivity: {
            name: '角色活动',
            description: '获取所有角色的活动统计'
          },
          characterHistory: {
            name: '角色活动历史',
            description: '获取指定角色的活动历史（使用角色名称替换{name}）'
          }
        },
        trade: {
          offers: {
            name: '交易报价',
            description: '获取当前所有的交易报价'
          },
          history: {
            name: '交易历史',
            description: '获取交易的历史记录'
          }
        },
        identities: {
          all: {
            name: '身份信息',
            description: '获取所有身份和角色身份信息'
          },
          stats: {
            name: '身份统计',
            description: '获取身份系统的统计信息'
          }
        },
        citizenship: {
          applications: {
            name: '公民申请',
            description: '获取所有公民申请的信息'
          },
          single: {
            name: '单个公民申请',
            description: '获取指定角色的公民申请状态（使用character_id替换{character_id}）'
          },
          stats: {
            name: '公民统计',
            description: '获取公民申请的统计信息'
          }
        },
        info: {
          rules: {
            name: '游戏规则',
            description: '获取游戏规则和玩法信息'
          },
          basicInfo: {
            name: '角色基本信息',
            description: '获取角色的基本信息（ID和权限等级，使用角色ID替换{id}）'
          }
        },
        state: {
          overview: {
            name: '游戏概览',
            description: '获取游戏的总体状态概览'
          },
          worldMap: {
            name: '世界地图',
            description: '获取游戏世界的完整地图结构'
          }
        }
      },
      errors: {
        characterNotFound: '角色 "{name}" 未找到',
        sceneNotFound: '场景 "{name}" 未找到',
        itemNotFound: 'ID 为 {id} 的物品未找到',
        resourceNotFound: '资源未找到: {uri}',
        noCitizenshipApplication: '未找到角色ID {characterId} 的公民申请'
      },
      server: {
        starting: '🚀 正在启动游戏服务器...',
        webMode: '🚀 正在以Web模式启动游戏服务器...',
        stdioMode: '🚀 正在以stdio模式启动MCP游戏服务器...',
        webInterface: '🌐 Web界面可访问: http://localhost:3000',
        mcpSse: '🔧 MCP SSE服务器可访问: http://localhost:3000/mcp',
        mcpStdio: '🔧 MCP游戏服务器运行在stdio模式',
        started: '✅ 服务器启动成功！',
        mcpStarted: '✅ MCP服务器启动成功！'
      }
    };
  }
}

// 导出单例实例
export const i18n = I18nService.getInstance();

