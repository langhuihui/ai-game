#!/usr/bin/env node
/**
 * MCP Tools Test Script
 * Tests MCP tools via HTTP requests
 */

const BASE_URL = 'http://localhost:3000';

async function callMCPTool(toolName, args = {}) {
  try {
    const response = await fetch(`${BASE_URL}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: args
        }
      })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return { error: error.message };
  }
}

async function listMCPTools() {
  try {
    const response = await fetch(`${BASE_URL}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list',
        params: {}
      })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return { error: error.message };
  }
}

async function testEffectSystem() {
  console.log('\n🧪 Testing Effect System\n');
  console.log('='.repeat(60));

  // Step 1: Create a test character
  console.log('\n1️⃣ Creating test character...');
  const testCharName = `TestHero_${Date.now()}`;
  const createCharResult = await callMCPTool('create_character', {
    name: testCharName,
    description: 'A brave test character',
    personality: 'Curious and adventurous',
    health: 100,
    mental_state: 100
  });

  let characterId;
  if (createCharResult.result?.content?.[0]?.text) {
    const charData = JSON.parse(createCharResult.result.content[0].text);
    if (charData.success && charData.character) {
      characterId = charData.character.id;
      console.log(`✅ Character created: ${charData.character.name} (ID: ${characterId})`);
    } else if (createCharResult.error) {
      // Try to get existing character by listing
      console.log('Character may already exist, listing characters...');
      const listResult = await callMCPTool('list_characters', {});
      if (listResult.result?.content?.[0]?.text) {
        const listData = JSON.parse(listResult.result.content[0].text);
        if (listData.success && listData.characters && listData.characters.length > 0) {
          characterId = listData.characters[0].id;
          console.log(`✅ Using existing character: ${listData.characters[0].name} (ID: ${characterId})`);
        } else {
          console.error('❌ No characters found');
          return;
        }
      } else {
        console.error('❌ Failed to list characters');
        return;
      }
    } else {
      console.error('❌ Character creation failed:', charData.error);
      return;
    }
  } else {
    console.error('❌ Failed to create character');
    return;
  }

  if (!characterId) {
    console.error('❌ No character ID available');
    return;
  }

  // Step 2: Apply poison effect
  console.log('\n2️⃣ Applying poison effect...');
  const poisonResult = await callMCPTool('apply_effect', {
    character_id: characterId,
    effect_name: 'poison',
    duration: 30000,
    power: 2
  });
  console.log('Result:', JSON.stringify(poisonResult, null, 2));

  if (poisonResult.result?.content?.[0]?.text) {
    const poisonData = JSON.parse(poisonResult.result.content[0].text);
    if (poisonData.success) {
      console.log(`✅ Poison effect applied: ${poisonData.message}`);
      console.log(`   Effect: ${JSON.stringify(poisonData.effect, null, 2)}`);
    } else {
      console.error(`❌ Failed to apply poison: ${poisonData.error}`);
    }
  }

  // Step 3: Apply regeneration effect
  console.log('\n3️⃣ Applying regeneration effect...');
  const regenResult = await callMCPTool('apply_effect', {
    character_id: characterId,
    effect_name: 'regeneration',
    duration: 60000,
    power: 3
  });
  console.log('Result:', JSON.stringify(regenResult, null, 2));

  if (regenResult.result?.content?.[0]?.text) {
    const regenData = JSON.parse(regenResult.result.content[0].text);
    if (regenData.success) {
      console.log(`✅ Regeneration effect applied: ${regenData.message}`);
      console.log(`   Effect: ${JSON.stringify(regenData.effect, null, 2)}`);
    } else {
      console.error(`❌ Failed to apply regeneration: ${regenData.error}`);
    }
  }

  // Step 4: List all effects
  console.log('\n4️⃣ Listing all effects...');
  const listResult = await callMCPTool('list_effects', {
    character_id: characterId
  });
  console.log('Result:', JSON.stringify(listResult, null, 2));

  if (listResult.result?.content?.[0]?.text) {
    const listData = JSON.parse(listResult.result.content[0].text);
    if (listData.success) {
      console.log(`✅ Effects listed for ${listData.character_name}:`);
      console.log(`   Health: ${listData.character_health || 'N/A'}`);
      console.log(`   Total effects: ${listData.total || 0}`);
      if (listData.summary) {
        console.log(`   Buffs: ${listData.summary.buffs || 0}`);
        console.log(`   Debuffs: ${listData.summary.debuffs || 0}`);
      }
      if (listData.effects && listData.effects.length > 0) {
        console.log('\n   Active effects:');
        listData.effects.forEach((effect, idx) => {
          console.log(`   ${idx + 1}. ${effect.name} (${effect.type}) - Duration: ${effect.duration}ms, Remaining: ${effect.remaining}ms`);
        });
      }
    } else {
      console.error(`❌ Failed to list effects: ${listData.error}`);
    }
  }

  // Step 5: Test other bundle commands
  console.log('\n5️⃣ Testing move_character command...');
  const sceneResult = await callMCPTool('create_scene', {
    name: 'TestRoom',
    description: 'A test room for movement'
  });

  if (sceneResult.result?.content?.[0]?.text) {
    const sceneData = JSON.parse(sceneResult.result.content[0].text);
    if (sceneData.success && sceneData.scene) {
      const sceneId = sceneData.scene.id;
      console.log(`✅ Scene created: ${sceneData.scene.name} (ID: ${sceneId})`);

      // Move character to scene
      const moveResult = await callMCPTool('move_character', {
        character_id: characterId,
        target_scene_id: sceneId
      });
      console.log('Move result:', JSON.stringify(moveResult, null, 2));
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Effect system test completed!\n');
}

async function main() {
  console.log('🚀 Starting MCP Tools Test\n');

  // Wait for server to be ready
  console.log('⏳ Waiting for server to be ready...');
  let retries = 10;
  while (retries > 0) {
    try {
      const response = await fetch(`${BASE_URL}/mcp-info`);
      if (response.ok) {
        console.log('✅ Server is ready!\n');
        break;
      }
    } catch (error) {
      // Server not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
    retries--;
  }

  if (retries === 0) {
    console.error('❌ Server is not responding. Please start the server first: npm start');
    process.exit(1);
  }

  // List available tools
  console.log('📋 Listing available MCP tools...');
  const toolsResult = await listMCPTools();
  if (toolsResult.result?.tools) {
    const effectTools = toolsResult.result.tools.filter(t =>
      t.name.includes('effect') || t.name.includes('apply') || t.name.includes('list')
    );
    console.log(`\nFound ${toolsResult.result.tools.length} total tools`);
    console.log(`Found ${effectTools.length} effect-related tools:`);
    effectTools.forEach(tool => {
      console.log(`  - ${tool.name}: ${tool.description}`);
    });
  }

  // Run Effect system tests
  await testEffectSystem();
}

main().catch(console.error);

