export var PermissionLevel;
(function (PermissionLevel) {
    PermissionLevel["PRISONER"] = "prisoner";
    PermissionLevel["VISITOR"] = "visitor";
    PermissionLevel["CITIZEN"] = "citizen";
    PermissionLevel["MANAGER"] = "manager";
    PermissionLevel["SUPER_ADMIN"] = "super_admin"; // 超级管理员 - 隐藏身份，开发者权限
})(PermissionLevel || (PermissionLevel = {}));
// 权限定义
export const PERMISSION_DEFINITIONS = {
    [PermissionLevel.PRISONER]: {
        name: '囚犯',
        description: '无权限，只能查询自己的信息',
        permissions: [
            'get_own_character_info',
            'get_own_memories',
            'get_own_items'
        ]
    },
    [PermissionLevel.VISITOR]: {
        name: '游客',
        description: '基础权限，可以查看和参与基础活动',
        permissions: [
            'get_own_character_info',
            'get_own_memories',
            'get_own_items',
            'view_scenes',
            'view_other_characters',
            'send_direct_messages',
            'receive_direct_messages',
            'create_trade_offers',
            'respond_to_trade_offers'
        ]
    },
    [PermissionLevel.CITIZEN]: {
        name: '公民',
        description: '标准权限，可以参与大部分游戏活动',
        permissions: [
            'get_own_character_info',
            'get_own_memories',
            'get_own_items',
            'view_scenes',
            'view_other_characters',
            'send_direct_messages',
            'receive_direct_messages',
            'create_trade_offers',
            'respond_to_trade_offers',
            'move_between_scenes',
            'pick_up_items',
            'drop_items',
            'use_items',
            'create_memories'
        ]
    },
    [PermissionLevel.MANAGER]: {
        name: '管理者',
        description: '高级权限，可以管理游戏内容',
        permissions: [
            'get_own_character_info',
            'get_own_memories',
            'get_own_items',
            'view_scenes',
            'view_other_characters',
            'send_direct_messages',
            'receive_direct_messages',
            'create_trade_offers',
            'respond_to_trade_offers',
            'move_between_scenes',
            'pick_up_items',
            'drop_items',
            'use_items',
            'create_memories',
            'create_scenes',
            'modify_scenes',
            'create_items',
            'modify_items',
            'view_all_characters',
            'view_character_permissions',
            'modify_character_permissions',
            'view_server_logs'
        ]
    },
    [PermissionLevel.SUPER_ADMIN]: {
        name: '超级管理员',
        description: '开发者权限，可以管理服务器和所有配置',
        permissions: [
            'all_permissions', // 拥有所有权限
            'server_management',
            'database_management',
            'permission_management',
            'system_configuration',
            'backup_restore',
            'debug_tools'
        ]
    }
};
// 权限验证函数
export function hasPermission(permissionLevel, requiredPermission) {
    const definition = PERMISSION_DEFINITIONS[permissionLevel];
    if (!definition)
        return false;
    // 超级管理员拥有所有权限
    if (permissionLevel === PermissionLevel.SUPER_ADMIN) {
        return true;
    }
    return definition.permissions.includes(requiredPermission) ||
        definition.permissions.includes('all_permissions');
}
// 权限等级比较
export function comparePermissionLevels(level1, level2) {
    const levels = [
        PermissionLevel.PRISONER,
        PermissionLevel.VISITOR,
        PermissionLevel.CITIZEN,
        PermissionLevel.MANAGER,
        PermissionLevel.SUPER_ADMIN
    ];
    const index1 = levels.indexOf(level1);
    const index2 = levels.indexOf(level2);
    if (index1 === -1 || index2 === -1)
        return 0;
    return index1 - index2;
}
// 检查是否有足够权限
export function hasMinimumPermission(userLevel, requiredLevel) {
    return comparePermissionLevels(userLevel, requiredLevel) >= 0;
}
//# sourceMappingURL=Permission.js.map