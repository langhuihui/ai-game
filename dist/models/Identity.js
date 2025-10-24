export var IdentityRole;
(function (IdentityRole) {
    IdentityRole["PRISONER"] = "prisoner";
    IdentityRole["VISITOR"] = "visitor";
    IdentityRole["CITIZEN"] = "citizen";
    IdentityRole["MANAGER"] = "manager";
    IdentityRole["SUPER_ADMIN"] = "super_admin"; // 超级管理员 - 隐藏身份，开发者身份
})(IdentityRole || (IdentityRole = {}));
// 身份定义
export const IDENTITY_DEFINITIONS = {
    [IdentityRole.PRISONER]: {
        name: '囚犯',
        description: '无身份权利，只能查询自己的信息',
        capabilities: [
            'get_own_character_info',
            'get_own_memories',
            'get_own_items'
        ]
    },
    [IdentityRole.VISITOR]: {
        name: '游客',
        description: '基础身份，可以查看和参与基础活动',
        capabilities: [
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
    [IdentityRole.CITIZEN]: {
        name: '公民',
        description: '标准身份，可以参与大部分游戏活动',
        capabilities: [
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
    [IdentityRole.MANAGER]: {
        name: '管理者',
        description: '高级身份，可以管理游戏内容',
        capabilities: [
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
            'view_character_identities',
            'modify_character_identities',
            'view_server_logs'
        ]
    },
    [IdentityRole.SUPER_ADMIN]: {
        name: '超级管理员',
        description: '开发者身份，可以管理服务器和所有配置',
        capabilities: [
            'all_capabilities', // 拥有所有能力
            'server_management',
            'database_management',
            'identity_management',
            'system_configuration',
            'backup_restore',
            'debug_tools'
        ]
    }
};
// 身份能力验证函数
export function hasCapability(identityRole, requiredCapability) {
    const definition = IDENTITY_DEFINITIONS[identityRole];
    if (!definition)
        return false;
    // 超级管理员拥有所有能力
    if (identityRole === IdentityRole.SUPER_ADMIN) {
        return true;
    }
    return definition.capabilities.includes(requiredCapability) ||
        definition.capabilities.includes('all_capabilities');
}
// 身份等级比较
export function compareIdentityRoles(role1, role2) {
    const roles = [
        IdentityRole.PRISONER,
        IdentityRole.VISITOR,
        IdentityRole.CITIZEN,
        IdentityRole.MANAGER,
        IdentityRole.SUPER_ADMIN
    ];
    const index1 = roles.indexOf(role1);
    const index2 = roles.indexOf(role2);
    if (index1 === -1 || index2 === -1)
        return 0;
    return index1 - index2;
}
// 检查是否有足够的身份等级
export function hasMinimumRole(userRole, requiredRole) {
    return compareIdentityRoles(userRole, requiredRole) >= 0;
}
//# sourceMappingURL=Identity.js.map