import {computed, ref} from 'vue';
import {defineStore} from 'pinia';
import {message} from 'ant-design-vue';

import {
    authApi,
    type BatchEndpointInfo,
    bogusApi,
    bogusBatchApi,
    type EndpointInfo
} from '#/api/bogus';
import {bogusConfig} from '#/config/bogus';

export const useBogusStore = defineStore('bogus', () => {
  // 状态
  const bogusToken = ref<string | null>(null);
  const isAuthenticated = ref(false);
  const loading = ref(false);
  const endpoints = ref<EndpointInfo[]>([]);
  const batchEndpoints = ref<BatchEndpointInfo[]>([]);
  const generatedData = ref<any[]>([]);
  
  // 初始化时检查是否有保存的token
  const savedToken = localStorage.getItem('bogus_token');
  if (savedToken) {
    bogusToken.value = savedToken;
    isAuthenticated.value = true;
    console.log('从localStorage恢复token:', savedToken.substring(0, 20) + '...');
  }

    // 计算属性
    const hasToken = computed(() => !!bogusToken.value);

    // 认证相关
    async function loginToBogus() {
        try {
            loading.value = true;
            // 使用配置中的默认账号
            const loginData = {
                username: bogusConfig.defaultCredentials.username,
                password: bogusConfig.defaultCredentials.password
            };

            console.log('尝试登录Bogus API:', {
                url: `${bogusConfig.baseURL}/api/auth/login`,
                data: loginData
            });

            const response = await authApi.login(loginData);

            // 根据响应结构：response.data返回API的数据，response.data.data返回API的data字段的值
            if (response.data && response.data.data && response.data.data.token) {
                const token = response.data.data.token;
                console.log('成功提取token:', token.substring(0, 20) + '...');

                bogusToken.value = token;
                isAuthenticated.value = true;
                
                // 将token保存到localStorage，供API请求使用
                localStorage.setItem('bogus_token', token);
                message.success('Bogus API 认证成功');
                console.log('认证状态已更新:', {
                    token: token.substring(0, 20) + '...',
                    isAuthenticated: true
                });
                
                // 登录成功后，自动获取端点信息
                try {
                    console.log('开始获取端点信息...');
                    await fetchEndpoints();
                    await fetchBatchEndpoints();
                    console.log('端点信息获取完成');
                } catch (error) {
                    console.warn('获取端点信息失败，但不影响登录状态:', error);
                }
                
                return true;
            } else {
                console.log('响应中未找到token，完整响应:', response);
                message.error('响应中未找到有效的token');
                return false;
            }
        } catch (error: any) {
            console.error('Bogus API 登录失败:', error);

            // 显示详细的错误信息
            let errorMessage = '认证失败';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.errors) {
                errorMessage = Array.isArray(error.response.data.errors)
                    ? error.response.data.errors.join(', ')
                    : error.response.data.errors;
            } else if (error.message) {
                errorMessage = error.message;
            }

            message.error(errorMessage);
            return false;
        } finally {
            loading.value = false;
        }
    }

    function logoutFromBogus() {
        bogusToken.value = null;
        isAuthenticated.value = false;
        
        // 清除localStorage中的token
        localStorage.removeItem('bogus_token');
        
        message.success('已退出 Bogus API');
    }

      // 获取端点信息
  async function fetchEndpoints() {
    try {
      loading.value = true;
      const response = await bogusApi.getEndpoints();
      console.log("res"+response);
      if (response.data && response.data.isSuccess) {
        endpoints.value = response.data.data;
      }
    } catch (error: any) {
      message.error('获取端点信息失败: ' + error.message);
    } finally {
      loading.value = false;
    }
  }

      async function fetchBatchEndpoints() {
    try {
      loading.value = true;
      const response = await bogusBatchApi.getEndpoints();
      if (response.data && response.data.isSuccess) {
        batchEndpoints.value = response.data.data;
      }
    } catch (error: any) {
      message.error('获取批量端点信息失败: ' + error.message);
    } finally {
      loading.value = false;
    }
  }

    // 生成数据
    async function generateSingleData(endpoint: string, params: any) {
        try {
            loading.value = true;
            let response;

            switch (endpoint) {
                case 'name':
                    response = await bogusApi.generateName(params);
                    break;
                case 'email':
                    response = await bogusApi.generateEmail(params);
                    break;
                case 'phone':
                    response = await bogusApi.generatePhone(params);
                    break;
                case 'address':
                    response = await bogusApi.generateAddress(params);
                    break;
                case 'company':
                    response = await bogusApi.generateCompany(params);
                    break;
                case 'number':
                    response = await bogusApi.generateNumber(params);
                    break;
                case 'date':
                    response = await bogusApi.generateDate(params);
                    break;
                case 'text':
                    response = await bogusApi.generateText(params);
                    break;
                default:
                    throw new Error('不支持的端点类型');
            }

                  if (response.data && response.data.isSuccess) {
        message.success('数据生成成功');
        return response.data.data;
      } else {
        message.error(response.data?.message || '数据生成失败');
        return null;
      }
        } catch (error: any) {
            message.error('数据生成失败: ' + error.message);
            return null;
        } finally {
            loading.value = false;
        }
    }

    async function generateBatchData(endpointId: number, count: number, customValues?: Record<string, any>) {
        try {
            loading.value = true;
                  const response = await bogusBatchApi.generateByEndpoint(endpointId, {
        count,
        customValues
      });

      if (response.data && response.data.isSuccess) {
        generatedData.value = response.data.data;
        message.success(`成功生成 ${count} 条数据`);
        return response.data.data;
      } else {
        message.error(response.data?.message || '批量数据生成失败');
        return null;
      }
        } catch (error: any) {
            message.error('批量数据生成失败: ' + error.message);
            return null;
        } finally {
            loading.value = false;
        }
    }

    // 重置状态
    function $reset() {
        bogusToken.value = null;
        isAuthenticated.value = false;
        loading.value = false;
        endpoints.value = [];
        batchEndpoints.value = [];
        generatedData.value = [];
    }

    return {
        // 状态
        bogusToken,
        isAuthenticated,
        loading,
        endpoints,
        batchEndpoints,
        generatedData,

        // 计算属性
        hasToken,

        // 方法
        loginToBogus,
        logoutFromBogus,
        fetchEndpoints,
        fetchBatchEndpoints,
        generateSingleData,
        generateBatchData,
        $reset,
    };
});
