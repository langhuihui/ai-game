export type SupportedLanguage = 'en' | 'zh';
export interface TranslationData {
    [key: string]: string | TranslationData;
}
export declare class I18nService {
    private static instance;
    private currentLanguage;
    private translations;
    private constructor();
    /**
     * 获取单例实例
     */
    static getInstance(): I18nService;
    /**
     * 检测系统语言
     */
    private detectSystemLanguage;
    /**
     * 获取当前语言
     */
    getCurrentLanguage(): SupportedLanguage;
    /**
     * 设置当前语言
     */
    setLanguage(language: SupportedLanguage): void;
    /**
     * 翻译函数
     */
    t(key: string, params?: {
        [key: string]: string | number;
    }): string;
    /**
     * 英文翻译
     */
    private getEnglishTranslations;
    /**
     * 中文翻译
     */
    private getChineseTranslations;
}
export declare const i18n: I18nService;
//# sourceMappingURL=I18nService.d.ts.map