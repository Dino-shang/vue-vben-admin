import { RequestClient } from '@vben/request';

import { bogusConfig } from '#/config/bogus';

// 基础URL配置，支持环境切换
const BOGUS_BASE_URL = bogusConfig.baseURL;

// 创建专门的bogus请求客户端
const bogusClient = new RequestClient({
  baseURL: BOGUS_BASE_URL,
  responseReturn: 'data',
});

// 添加请求拦截器，自动添加认证token
bogusClient.addRequestInterceptor({
  fulfilled: async (config) => {
    // 从localStorage或sessionStorage获取token
    const token = localStorage.getItem('bogus_token') || sessionStorage.getItem('bogus_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
});

// 类型定义
export interface ApiResponse<T = any> {
  isSuccess: boolean;
  data: T;
  message: string;
  errors: string[] | null;
}

export interface AuthRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  userId: number;
  username: string;
  email: string;
}

export interface EndpointInfo {
  name: string;
  path: string;
  method: string;
  description: string;
  category: string;
  parameters: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
}

export interface BatchEndpointInfo {
  id: number;
  endpointName: string;
  endpointPath: string;
  httpMethod: string;
  description: string;
  category: string;
  isActive: boolean;
  fields: Array<{
    id: number;
    fieldName: string;
    fieldDescription: string;
    bogusField: string;
    bogusMethod: string;
    parameters: string;
    dataType: string;
    isRequired: boolean;
    defaultValue: string;
    orderIndex: number;
  }>;
}

export interface BogusFieldInfo {
  [key: string]: {
    fields: string;
    methods: string[];
  };
}

// 认证接口
export const authApi = {
  // 用户注册
  register: (data: AuthRequest) =>
    bogusClient.post<ApiResponse<AuthResponse>>('/api/auth/register', data),

  // 用户登录
  login: (data: { username: string; password: string }) =>
    bogusClient.post<ApiResponse<AuthResponse>>('/api/auth/login', data),
};

// Bogus单一字段生成接口
export const bogusApi = {
  // 获取所有可用接口
  getEndpoints: () =>
    bogusClient.get<ApiResponse<EndpointInfo[]>>('/api/bogus/endpoints'),

  // 生成用户姓名
  generateName: (data: { nameType?: string; locale?: string }) =>
    bogusClient.post<ApiResponse<string>>('/api/bogus/generate-name', data),

  // 生成邮箱地址
  generateEmail: (data: { domain?: string }) =>
    bogusClient.post<ApiResponse<string>>('/api/bogus/generate-email', data),

  // 生成电话号码
  generatePhone: (data: { countryCode?: string }) =>
    bogusClient.post<ApiResponse<string>>('/api/bogus/generate-phone', data),

  // 生成地址信息
  generateAddress: (data: { addressType?: string; country?: string; city?: string }) =>
    bogusClient.post<ApiResponse<any>>('/api/bogus/generate-address', data),

  // 生成公司信息
  generateCompany: (data: { companyType?: string; jobType?: string }) =>
    bogusClient.post<ApiResponse<any>>('/api/bogus/generate-company', data),

  // 生成随机数字
  generateNumber: (data: { minValue: number; maxValue: number }) =>
    bogusClient.post<ApiResponse<number>>('/api/bogus/generate-number', data),

  // 生成随机日期
  generateDate: (data: { minYears: number; maxYears: number }) =>
    bogusClient.post<ApiResponse<string>>('/api/bogus/generate-date', data),

  // 生成随机文本
  generateText: (data: { textType?: string; wordCount?: number; paragraphCount?: number; characterCount?: number }) =>
    bogusClient.post<ApiResponse<string>>('/api/bogus/generate-text', data),
};

// Bogus批量生成接口
export const bogusBatchApi = {
  // 获取所有可用的API端点及其字段映射
  getEndpoints: () =>
    bogusClient.get<ApiResponse<BatchEndpointInfo[]>>('/api/BogusBatch/endpoints'),

  // 根据端点ID批量生成数据
  generateByEndpoint: (endpointId: number, data: { count: number; customValues?: Record<string, any> }) =>
    bogusClient.post<ApiResponse<any[]>>(`/api/BogusBatch/generate-by-endpoint/${endpointId}`, data),

  // 获取可用的Bogus字段和方法
  getAvailableBogusFields: () =>
    bogusClient.get<ApiResponse<BogusFieldInfo>>('/api/BogusBatch/available-bogus-fields'),
};

// 健康检查接口
export const healthApi = {
  // 基础健康检查
  check: () => bogusClient.get<{ status: string; timestamp: string; version: string }>('/api/health'),
};

// 导出基础URL，方便后续配置
export { BOGUS_BASE_URL };
