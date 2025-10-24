// Global variables
let currentCharacters = [];
let currentScenes = [];
let currentLogs = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function () {
  showDashboard();
  loadStats();
});

// Navigation functions
function showDashboard() {
  hideAllSections();
  document.getElementById('dashboard').classList.add('active');
  updateActiveNav('dashboard');
  loadStats();
}

function showCharacters() {
  hideAllSections();
  document.getElementById('characters').classList.add('active');
  updateActiveNav('characters');
  loadCharacters();
}

function showScenes() {
  hideAllSections();
  document.getElementById('scenes').classList.add('active');
  updateActiveNav('scenes');
  loadScenes();
}

function showItems() {
  hideAllSections();
  document.getElementById('items').classList.add('active');
  updateActiveNav('items');
  loadItems();
}

function showLogs() {
  hideAllSections();
  document.getElementById('logs').classList.add('active');
  updateActiveNav('logs');
  loadLogs();
}

function showMCPConfig() {
  hideAllSections();
  document.getElementById('mcp-config').classList.add('active');
  updateActiveNav('mcp-config');
  loadMCPConfig();
}

function hideAllSections() {
  const sections = document.querySelectorAll('.content-section');
  sections.forEach(section => section.classList.remove('active'));
}

function updateActiveNav(activeSection) {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => link.classList.remove('active'));

  let activeLink;
  if (activeSection === 'mcp-config') {
    activeLink = document.querySelector('[onclick="showMCPConfig()"]');
  } else {
    activeLink = document.querySelector(`[onclick="show${activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}()"]`);
  }

  if (activeLink) {
    activeLink.classList.add('active');
  }
}

// API functions
async function apiCall(endpoint) {
  try {
    const response = await fetch(`/api${endpoint}`);
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'API call failed');
    }
    return data;
  } catch (error) {
    console.error('API Error:', error);
    showAlert('error', `API 错误: ${error.message}`);
    return null;
  }
}

// Dashboard functions
async function loadStats() {
  const data = await apiCall('/stats');
  if (data) {
    document.getElementById('totalCharacters').textContent = data.stats.totalCharacters;
    document.getElementById('totalScenes').textContent = data.stats.totalScenes;
    document.getElementById('totalItems').textContent = data.stats.totalItems;
    document.getElementById('recentActivity').textContent = data.stats.recentActivity;
  }

  // Load recent logs
  const logsData = await apiCall('/logs?limit=10');
  if (logsData) {
    displayRecentLogs(logsData.logs);
  }
}

function displayRecentLogs(logs) {
  const container = document.getElementById('recentLogs');
  if (logs.length === 0) {
    container.innerHTML = '<p class="text-muted">暂无最近活动</p>';
    return;
  }

  container.innerHTML = logs.map(log => `
        <div class="log-entry ${log.result ? 'success' : 'error'}">
            <div class="d-flex justify-content-between">
                <div>
                    <strong>${log.character_name || '系统'}</strong> - ${log.action_type}
                </div>
                <small class="text-muted">${formatDateTime(log.timestamp)}</small>
            </div>
            <div class="text-muted small">${log.action_data}</div>
        </div>
    `).join('');
}

// Character functions
async function loadCharacters() {
  const data = await apiCall('/characters');
  if (data) {
    currentCharacters = data.characters;
    displayCharacters(data.characters);
  }
}

function displayCharacters(characters) {
  const container = document.getElementById('charactersList');
  if (characters.length === 0) {
    container.innerHTML = '<div class="col-12"><p class="text-muted">暂无角色</p></div>';
    return;
  }

  container.innerHTML = characters.map(character => `
        <div class="col-md-6 col-lg-4 mb-3">
            <div class="card character-card card-hover" onclick="showCharacterDetail(${character.id})">
                <div class="card-body">
                    <h5 class="card-title">${character.name}</h5>
                    <p class="card-text text-muted">${character.description}</p>
                    <div class="d-flex justify-content-between">
                        <span class="badge bg-primary status-badge">
                            <i class="bi bi-heart"></i> ${character.health}
                        </span>
                        <span class="badge bg-info status-badge">
                            <i class="bi bi-brain"></i> ${character.mental_state}
                        </span>
                    </div>
                    <small class="text-muted">场景ID: ${character.current_scene_id || '无'}</small>
                </div>
            </div>
        </div>
    `).join('');
}

async function showCharacterDetail(characterId) {
  const [characterData, memoriesData, itemsData] = await Promise.all([
    apiCall(`/characters/${characterId}`),
    apiCall(`/characters/${characterId}/memories`),
    apiCall(`/characters/${characterId}/items`)
  ]);

  if (characterData) {
    const character = characterData.character;
    const memories = memoriesData ? memoriesData.memories : { short_memories: [], long_memories: [] };
    const items = itemsData ? itemsData.items : [];

    const detailHtml = `
            <div class="row">
                <div class="col-md-6">
                    <h4>${character.name}</h4>
                    <p><strong>描述:</strong> ${character.description}</p>
                    <p><strong>性格:</strong> ${character.personality}</p>
                    <div class="row">
                        <div class="col-6">
                            <div class="card text-center">
                                <div class="card-body">
                                    <h6>健康度</h6>
                                    <div class="progress">
                                        <div class="progress-bar bg-danger" style="width: ${character.health}%"></div>
                                    </div>
                                    <small>${character.health}/100</small>
                                </div>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="card text-center">
                                <div class="card-body">
                                    <h6>精神状态</h6>
                                    <div class="progress">
                                        <div class="progress-bar bg-info" style="width: ${character.mental_state}%"></div>
                                    </div>
                                    <small>${character.mental_state}/100</small>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p><strong>当前场景:</strong> ${character.current_scene_id || '无'}</p>
                    <p><strong>创建时间:</strong> ${formatDateTime(character.created_at)}</p>
                </div>
                <div class="col-md-6">
                    <h5>物品 (${items.length})</h5>
                    <div class="mb-3">
                        ${items.length === 0 ? '<p class="text-muted">无物品</p>' :
        items.map(item => `<span class="badge bg-secondary me-1">${item.name}</span>`).join('')}
                    </div>
                    
                    <h5>短时记忆 (${memories.short_memories.length})</h5>
                    <div class="mb-3" style="max-height: 200px; overflow-y: auto;">
                        ${memories.short_memories.length === 0 ? '<p class="text-muted">无短时记忆</p>' :
        memories.short_memories.map(memory => `
                            <div class="border-bottom pb-2 mb-2">
                                <small class="text-muted">${formatDateTime(memory.timestamp)}</small>
                                <p class="mb-0">${memory.content}</p>
                            </div>
                          `).join('')}
                    </div>
                    
                    <h5>长时记忆 (${memories.long_memories.length})</h5>
                    <div style="max-height: 200px; overflow-y: auto;">
                        ${memories.long_memories.length === 0 ? '<p class="text-muted">无长时记忆</p>' :
        memories.long_memories.map(memory => `
                            <div class="border-bottom pb-2 mb-2">
                                <div class="d-flex justify-content-between">
                                    <small class="text-muted">${formatDateTime(memory.timestamp)}</small>
                                    <span class="badge bg-warning">重要性: ${memory.importance}</span>
                                </div>
                                <p class="mb-0">${memory.content}</p>
                            </div>
                          `).join('')}
                    </div>
                </div>
            </div>
        `;

    document.getElementById('characterDetail').innerHTML = detailHtml;
    new bootstrap.Modal(document.getElementById('characterModal')).show();
  }
}

// Scene functions
async function loadScenes() {
  const data = await apiCall('/scenes');
  if (data) {
    currentScenes = data.scenes;
    displayScenes(data.scenes);
  }
}

function displayScenes(scenes) {
  const container = document.getElementById('scenesList');
  if (scenes.length === 0) {
    container.innerHTML = '<div class="col-12"><p class="text-muted">暂无场景</p></div>';
    return;
  }

  container.innerHTML = scenes.map(scene => `
        <div class="col-md-6 col-lg-4 mb-3">
            <div class="card scene-card card-hover" onclick="showSceneDetail(${scene.id})">
                <div class="card-body">
                    <h5 class="card-title">${scene.name}</h5>
                    <p class="card-text text-muted">${scene.description}</p>
                    <small class="text-muted">创建时间: ${formatDateTime(scene.created_at)}</small>
                </div>
            </div>
        </div>
    `).join('');
}

async function showSceneDetail(sceneId) {
  const data = await apiCall(`/scenes/${sceneId}`);
  if (data) {
    const scene = data.scene;
    const detailHtml = `
            <div class="row">
                <div class="col-md-6">
                    <h4>${scene.name}</h4>
                    <p><strong>描述:</strong> ${scene.description}</p>
                    <p><strong>创建时间:</strong> ${formatDateTime(scene.created_at)}</p>
                    
                    <h5>在场角色 (${scene.characters.length})</h5>
                    <div class="mb-3">
                        ${scene.characters.length === 0 ? '<p class="text-muted">无角色在场</p>' :
        scene.characters.map(char => `<span class="badge bg-primary me-1">${char.name}</span>`).join('')}
                    </div>
                </div>
                <div class="col-md-6">
                    <h5>场景物品 (${scene.items.length})</h5>
                    <div class="mb-3">
                        ${scene.items.length === 0 ? '<p class="text-muted">无物品</p>' :
        scene.items.map(item => `
                            <div class="border-bottom pb-2 mb-2">
                                <strong>${item.name}</strong>
                                <p class="mb-0 text-muted">${item.description}</p>
                            </div>
                          `).join('')}
                    </div>
                    
                    <h5>连接出口 (${scene.connections.length})</h5>
                    <div>
                        ${scene.connections.length === 0 ? '<p class="text-muted">无连接</p>' :
        scene.connections.map(conn => `
                            <div class="border-bottom pb-2 mb-2">
                                <div class="d-flex justify-content-between">
                                    <strong>${conn.to_scene_name}</strong>
                                    <span class="badge bg-secondary">${conn.connection_type}</span>
                                </div>
                                <p class="mb-0 text-muted">${conn.description}</p>
                            </div>
                          `).join('')}
                    </div>
                </div>
            </div>
        `;

    document.getElementById('sceneDetail').innerHTML = detailHtml;
    new bootstrap.Modal(document.getElementById('sceneModal')).show();
  }
}

// Item functions
async function loadItems() {
  const data = await apiCall('/items');
  if (data) {
    displayItems(data.items);
  }
}

function displayItems(items) {
  const tbody = document.getElementById('itemsTable');
  if (items.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">暂无物品</td></tr>';
    return;
  }

  tbody.innerHTML = items.map(item => `
        <tr>
            <td>${item.id}</td>
            <td>${item.name}</td>
            <td>${item.description}</td>
            <td>
                ${item.scene_id ? `场景 ${item.scene_id}` :
      item.character_id ? `角色 ${item.character_id}` : '未知'}
            </td>
            <td>${formatDateTime(item.created_at)}</td>
        </tr>
    `).join('');
}

// Log functions
async function loadLogs() {
  const data = await apiCall('/logs');
  if (data) {
    currentLogs = data.logs;
    displayLogs(data.logs);
    populateCharacterFilter(data.logs);
  }
}

function displayLogs(logs) {
  const container = document.getElementById('logsList');
  if (logs.length === 0) {
    container.innerHTML = '<p class="text-muted">暂无日志</p>';
    return;
  }

  container.innerHTML = logs.map(log => `
        <div class="log-entry ${log.result ? 'success' : 'error'}">
            <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                    <div class="d-flex align-items-center mb-1">
                        <strong>${log.character_name || '系统'}</strong>
                        <span class="badge bg-secondary ms-2">${log.action_type}</span>
                    </div>
                    <div class="text-muted small mb-1">${log.action_data}</div>
                    ${log.result ? `<div class="text-success small">结果: ${log.result}</div>` : ''}
                </div>
                <small class="text-muted">${formatDateTime(log.timestamp)}</small>
            </div>
        </div>
    `).join('');
}

function populateCharacterFilter(logs) {
  const select = document.getElementById('logCharacter');
  const characters = [...new Set(logs.map(log => log.character_name).filter(name => name))];

  select.innerHTML = '<option value="">所有角色</option>' +
    characters.map(name => `<option value="${name}">${name}</option>`).join('');
}

async function filterLogsByDate() {
  const date = document.getElementById('logDate').value;
  if (!date) {
    loadLogs();
    return;
  }

  const data = await apiCall(`/logs/date/${date}`);
  if (data) {
    displayLogs(data.logs);
  }
}

function filterLogsByCharacter() {
  const characterName = document.getElementById('logCharacter').value;
  if (!characterName) {
    displayLogs(currentLogs);
    return;
  }

  const filteredLogs = currentLogs.filter(log => log.character_name === characterName);
  displayLogs(filteredLogs);
}

function refreshLogs() {
  loadLogs();
}

// Utility functions
function formatDateTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN');
}

function showAlert(type, message) {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type === 'error' ? 'danger' : 'success'} alert-dismissible fade show`;
  alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

  const container = document.querySelector('.main-content');
  container.insertBefore(alertDiv, container.firstChild);

  setTimeout(() => {
    alertDiv.remove();
  }, 5000);
}

// MCP Config functions
async function loadMCPConfig() {
  // Update server start time
  document.getElementById('serverStartTime').textContent = new Date().toLocaleString('zh-CN');

  // Load tools list
  await loadToolsList();
}

async function loadToolsList() {
  const container = document.getElementById('toolsList');

  try {
    // Fetch tools from API
    const data = await apiCall('/tools');
    if (!data || !data.tools) {
      throw new Error('Failed to load tools');
    }

    // Filter out super admin tools (additional client-side filtering for security)
    const superAdminToolPrefixes = [
      'admin_',
      'mcp_admin_'
    ];

    const tools = data.tools.filter(tool => {
      // Check if tool name starts with any super admin prefix
      return !superAdminToolPrefixes.some(prefix => tool.name.startsWith(prefix));
    });

    // Define category mapping for tool names
    const categoryMap = {
      // Character tools
      'create_character': '角色管理',
      'get_character': '角色管理',
      'get_character_by_name': '角色管理',
      'list_characters': '角色管理',
      'update_character': '角色管理',
      'delete_character': '角色管理',

      // Scene tools
      'create_scene': '场景管理',
      'get_scene': '场景管理',
      'get_scene_by_name': '场景管理',
      'get_scene_details': '场景管理',
      'list_scenes': '场景管理',
      'connect_scenes': '场景管理',
      'get_scene_connections': '场景管理',

      // Action tools
      'move_character': '行动系统',
      'speak_public': '行动系统',
      'speak_private': '行动系统',
      'pick_item': '行动系统',
      'drop_item': '行动系统',
      'use_item': '行动系统',
      'get_character_items': '行动系统',

      // Item tools
      'create_item': '物品管理',
      'get_item': '物品管理',
      'list_items': '物品管理',
      'update_item': '物品管理',
      'delete_item': '物品管理',

      // Memory tools
      'add_short_memory': '记忆管理',
      'add_long_memory': '记忆管理',
      'get_short_memories': '记忆管理',
      'get_long_memories': '记忆管理',
      'get_all_memories': '记忆管理',
      'update_short_memory': '记忆管理',
      'update_long_memory': '记忆管理',
      'delete_short_memory': '记忆管理',
      'delete_long_memory': '记忆管理',
      'delete_all_memories': '记忆管理',

      // Trade tools
      'create_trade_offer': '交易系统',
      'respond_to_trade_offer': '交易系统',
      'cancel_trade_offer': '交易系统',
      'get_trade_offers': '交易系统',
      'get_pending_trade_offers': '交易系统',

      // Message tools
      'send_direct_message': '消息系统',
      'get_direct_messages': '消息系统',
      'mark_message_as_read': '消息系统',
      'mark_all_messages_as_read': '消息系统',

      // Identity tools
      'validate_identity': '身份管理',
      'apply_for_citizenship': '身份管理',
      'review_citizenship_application': '身份管理',
      'generate_visitor_id': '身份管理',
      'list_citizenship_applications': '身份管理',

      // Resource tools
      'mcp_list_resources': 'MCP资源',
      'mcp_read_resource': 'MCP资源',
      'mcp_list_prompts': 'MCP资源',
      'mcp_get_prompt': 'MCP资源'
    };

    // Add category to each tool
    const toolsWithCategory = tools.map(tool => ({
      name: tool.name,
      description: tool.description || '无描述',
      category: categoryMap[tool.name] || '其他'
    }));

    // Group by category
    const categories = [...new Set(toolsWithCategory.map(tool => tool.category))];

    container.innerHTML = categories.map(category => {
      const categoryTools = toolsWithCategory.filter(tool => tool.category === category);
      return `
              <div class="col-md-6 col-lg-4 mb-3">
                  <div class="card">
                      <div class="card-header">
                          <h6 class="mb-0">${category}</h6>
                      </div>
                      <div class="card-body">
                          ${categoryTools.map(tool => `
                              <div class="d-flex justify-content-between align-items-center mb-2">
                                  <div>
                                      <code class="text-primary">${tool.name}</code>
                                      <br>
                                      <small class="text-muted">${tool.description}</small>
                                  </div>
                              </div>
                          `).join('')}
                      </div>
                  </div>
              </div>
          `;
    }).join('');

    // Update total tools count
    document.getElementById('totalTools').textContent = tools.length;
  } catch (error) {
    console.error('Failed to load tools:', error);
    container.innerHTML = `
      <div class="col-12">
        <div class="alert alert-danger">
          加载工具列表失败: ${error.message}
        </div>
      </div>
    `;
    document.getElementById('totalTools').textContent = '0';
  }
}

function copyToClipboard(elementId) {
  const element = document.getElementById(elementId);
  const text = element.textContent;

  navigator.clipboard.writeText(text).then(() => {
    showAlert('success', '配置已复制到剪贴板！');
  }).catch(err => {
    console.error('复制失败:', err);
    showAlert('error', '复制失败，请手动复制');
  });
}
