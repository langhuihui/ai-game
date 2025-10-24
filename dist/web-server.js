import express from 'express';
import cors from 'cors';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { CharacterService } from './services/CharacterService.js';
import { SceneService } from './services/SceneService.js';
import { ItemService } from './services/ItemService.js';
import { MemoryService } from './services/MemoryService.js';
import { LoggingService } from './services/LoggingService.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, '..', 'src', 'public')));
// Services
const characterService = new CharacterService();
const sceneService = new SceneService();
const itemService = new ItemService();
const memoryService = new MemoryService();
const loggingService = new LoggingService();
// API Routes
// Characters
app.get('/api/characters', (req, res) => {
    try {
        const characters = characterService.getAllCharacters();
        res.json({ success: true, characters });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
});
app.get('/api/characters/:id', (req, res) => {
    try {
        const character = characterService.getCharacterById(parseInt(req.params.id));
        if (!character) {
            return res.status(404).json({ success: false, error: 'Character not found' });
        }
        res.json({ success: true, character });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
});
app.get('/api/characters/:id/memories', (req, res) => {
    try {
        const memories = memoryService.getAllMemories(parseInt(req.params.id));
        res.json({ success: true, memories });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
});
app.get('/api/characters/:id/items', (req, res) => {
    try {
        const items = itemService.getItemsByCharacter(parseInt(req.params.id));
        res.json({ success: true, items });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
});
// Scenes
app.get('/api/scenes', (req, res) => {
    try {
        const scenes = sceneService.getAllScenes();
        res.json({ success: true, scenes });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
});
app.get('/api/scenes/:id', (req, res) => {
    try {
        const scene = sceneService.getSceneDetails(parseInt(req.params.id));
        if (!scene) {
            return res.status(404).json({ success: false, error: 'Scene not found' });
        }
        res.json({ success: true, scene });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
});
// Items
app.get('/api/items', (req, res) => {
    try {
        const items = itemService.getAllItems();
        res.json({ success: true, items });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
});
// Logs
app.get('/api/logs', (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : 1000;
        const logs = loggingService.getLogsWithCharacterInfo(limit);
        res.json({ success: true, logs });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
});
app.get('/api/logs/date/:date', (req, res) => {
    try {
        const logs = loggingService.getLogsByDate(req.params.date);
        res.json({ success: true, logs });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
});
app.get('/api/logs/character/:id', (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : 100;
        const logs = loggingService.getLogsByCharacter(parseInt(req.params.id), limit);
        res.json({ success: true, logs });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
});
// Dashboard stats
app.get('/api/stats', (req, res) => {
    try {
        const characters = characterService.getAllCharacters();
        const scenes = sceneService.getAllScenes();
        const items = itemService.getAllItems();
        const recentLogs = loggingService.getAllLogs(10);
        res.json({
            success: true,
            stats: {
                totalCharacters: characters.length,
                totalScenes: scenes.length,
                totalItems: items.length,
                recentActivity: recentLogs.length
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
});
// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, '..', 'src', 'public', 'index.html'));
});
// Start server
app.listen(PORT, () => {
    console.log(`Web server running on http://localhost:${PORT}`);
});
export { app };
//# sourceMappingURL=web-server.js.map