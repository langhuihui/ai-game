import { CitizenshipApplication, CreateCitizenshipApplicationData, ReviewCitizenshipApplicationData, CharacterInfo, GameRules } from '../models/CitizenshipApplication.js';
export declare class CitizenshipApplicationService {
    private db;
    private characterService;
    private identityService;
    constructor();
    createApplication(data: CreateCitizenshipApplicationData): CitizenshipApplication;
    getApplicationById(id: number): CitizenshipApplication | null;
    getApplicationByCharacterId(characterId: string): CitizenshipApplication | null;
    getPendingApplications(): CitizenshipApplication[];
    getAllApplications(): CitizenshipApplication[];
    reviewApplication(data: ReviewCitizenshipApplicationData): CitizenshipApplication | null;
    private approveApplication;
    private generateUniqueCharacterNameForApplication;
    getCharacterBasicInfo(characterId: number): CharacterInfo | null;
    getGameRules(): GameRules;
    isCharacterIdUnique(characterId: string): boolean;
    generateUniqueCharacterId(): string;
    generateUniqueCharacterName(preferredName?: string): string;
    generateMultipleUniqueCharacterNames(baseName: string, count: number): string[];
    private isCharacterNameUnique;
    private isCharacterNameUniqueExcludingApplication;
    getApplicationStats(): {
        total: number;
        pending: number;
        approved: number;
        rejected: number;
    };
}
//# sourceMappingURL=CitizenshipApplicationService.d.ts.map