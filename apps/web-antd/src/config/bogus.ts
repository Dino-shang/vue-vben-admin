// Bogus API 配置文件
export const bogusConfig = {
  // 基础URL配置，支持环境切换
  baseURL: import.meta.env.VITE_BOGUS_API_URL || 'http://localhost:5012',
  
  // 默认认证信息
  defaultCredentials: {
    username: 'testuser',
    password: 'password123'
  },
  
  // API路径前缀
  apiPrefix: '/api',
  
  // 请求超时时间
  timeout: 30000,
  
  // 最大批量生成数量
  maxBatchCount: 10000,
  
  // 默认生成数量
  defaultBatchCount: 100,
  
  // 支持的语言环境
  supportedLocales: [
    'zh_CN', 'zh_TW', 'zh_HK',
    'en_US', 'en_GB', 'en_CA', 'en_AU',
    'de_DE', 'fr_FR', 'it_IT', 'es_ES',
    'pt_PT', 'nl_NL', 'sv_SE', 'no_NO',
    'da_DK', 'fi_FI', 'ja_JP', 'ko_KR',
    'th_TH', 'vi_VN', 'id_ID', 'ar_SA',
    'he_IL', 'tr_TR', 'ru_RU'
  ],
  
  // 支持的国家代码
  supportedCountryCodes: [
    '+86', '+1', '+44', '+49', '+33', '+81', '+82', '+91', '+55', '+7',
    'CN', 'US', 'GB', 'DE', 'FR', 'JP', 'KR', 'IN', 'BR', 'RU',
    'CA', 'AU'
  ]
};

// 获取完整的API URL
export function getBogusApiUrl(path: string): string {
  return `${bogusConfig.baseURL}${bogusConfig.apiPrefix}${path}`;
}

// 验证语言环境是否支持
export function isLocaleSupported(locale: string): boolean {
  return bogusConfig.supportedLocales.includes(locale);
}

// 验证国家代码是否支持
export function isCountryCodeSupported(countryCode: string): boolean {
  return bogusConfig.supportedCountryCodes.includes(countryCode);
}

// 获取环境信息
export function getEnvironmentInfo() {
  return {
    baseURL: bogusConfig.baseURL,
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
    nodeEnv: import.meta.env.MODE
  };
} 
