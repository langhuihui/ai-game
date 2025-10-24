export interface CitizenshipApplication {
  id: number;
  character_id: string; // 游客的临时ID，不重复
  character_name: string;
  description: string;
  personality: string;
  message: string; // 申请留言
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: number; // 审核者的角色ID
  review_message?: string; // 审核留言
}

export interface CreateCitizenshipApplicationData {
  character_id: string;
  character_name: string;
  description: string;
  personality: string;
  message: string;
  preferred_character_id?: string; // 期望的角色ID
}

export interface ReviewCitizenshipApplicationData {
  application_id: number;
  status: 'approved' | 'rejected';
  review_message?: string;
  reviewer_character_id: number;
}

export interface CharacterInfo {
  id: number;
  name: string;
  identity_role: string;
  // 其他详细信息不暴露给其他角色
}

export interface GameRules {
  title: string;
  description: string;
  rules: string[];
  identities: {
    [key: string]: {
      name: string;
      description: string;
      capabilities: string[];
    };
  };
  gameplay: {
    trading: string[];
    messaging: string[];
    character_interaction: string[];
  };
}
