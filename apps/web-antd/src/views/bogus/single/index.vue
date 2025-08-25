<template>
  <div class="bogus-single-page">
    <Page title="单一字段生成" description="生成各种类型的虚拟数据">
      <!-- 认证状态 -->
      <Card title="API 认证状态" class="mb-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <Badge :status="bogusStore.isAuthenticated ? 'success' : 'error'" />
            <span>{{ bogusStore.isAuthenticated ? '已认证' : '未认证' }}</span>
            <Tag v-if="bogusStore.bogusToken" color="green">Token: {{ bogusStore.bogusToken.substring(0, 20) }}...</Tag>
          </div>
          <div class="space-x-2">
            <Button 
              v-if="!bogusStore.isAuthenticated" 
              type="primary" 
              :loading="bogusStore.loading"
              @click="handleLogin"
            >
              登录 Bogus API
            </Button>
            <Button 
              v-else 
              @click="handleLogout"
            >
              退出登录
            </Button>
          </div>
        </div>
      </Card>

      <!-- 可用接口列表 -->
      <Card title="可用接口" class="mb-4">
        <div class="mb-4">
          <Button @click="fetchEndpoints" :loading="bogusStore.loading">
            刷新接口列表
          </Button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card 
            v-for="endpoint in bogusStore.endpoints" 
            :key="endpoint.path"
            size="small"
            class="cursor-pointer hover:shadow-md transition-shadow"
            @click="selectEndpoint(endpoint)"
          >
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <Tag :color="getMethodColor(endpoint.method)">{{ endpoint.method }}</Tag>
                <span class="text-sm text-gray-500">{{ endpoint.category }}</span>
              </div>
              <h4 class="font-medium">{{ endpoint.name }}</h4>
              <p class="text-sm text-gray-600">{{ endpoint.description }}</p>
              <div class="text-xs text-gray-500">
                <div v-for="param in endpoint.parameters" :key="param.name">
                  {{ param.name }}: {{ param.type }} {{ param.required ? '(必需)' : '(可选)' }}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </Card>

      <!-- 数据生成表单 -->
      <Card v-if="selectedEndpoint" title="数据生成">
        <div class="space-y-4">
          <div class="flex items-center space-x-2 mb-4">
            <Tag color="blue">{{ selectedEndpoint.name }}</Tag>
            <span class="text-gray-600">{{ selectedEndpoint.description }}</span>
          </div>

          <!-- 参数配置 -->
          <div v-if="selectedEndpoint.parameters.length > 0" class="space-y-4">
            <h4 class="font-medium">参数配置</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-for="param in selectedEndpoint.parameters" :key="param.name">
                <label class="block text-sm font-medium mb-2">
                  {{ param.name }}
                  <span v-if="param.required" class="text-red-500">*</span>
                </label>
                <Input 
                  v-model="formParams[param.name]"
                  :placeholder="param.description"
                  :required="param.required"
                />
              </div>
            </div>
          </div>

          <!-- 生成按钮 -->
          <div class="flex items-center justify-center space-x-3 py-4">
            <Button 
              type="primary" 
              size="large"
              :loading="bogusStore.loading"
              @click="handleGenerate"
              class="min-w-[120px]"
            >
              <template #icon>
                <span class="mr-1">🚀</span>
              </template>
              生成数据
            </Button>
            <Button 
              size="large"
              @click="clearResult"
              class="min-w-[100px]"
            >
              <template #icon>
                <span class="mr-1">🗑️</span>
              </template>
              清空结果
            </Button>
          </div>

          <!-- 生成结果 -->
          <div v-if="generatedResult" class="mt-4">
            <div class="flex items-center justify-between mb-3">
              <h4 class="font-medium text-lg">生成结果</h4>
              <div class="flex space-x-2">
                <Button size="small" @click="copyResult">复制结果</Button>
                <Button size="small" @click="clearResult">清空结果</Button>
              </div>
            </div>
            
            <!-- 结果展示卡片 -->
            <Card class="result-card">
              <div class="text-center py-6">
                <div class="text-3xl font-bold text-blue-600 mb-2">
                  {{ generatedResult }}
                </div>
                <div class="text-sm text-gray-500">
                  生成时间: {{ new Date().toLocaleString() }}
                </div>
              </div>
            </Card>
            
            <!-- 详细信息 -->
            <div class="mt-3">
              <details class="bg-gray-50 rounded p-3">
                <summary class="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                  查看详细信息
                </summary>
                <div class="bg-white p-3 rounded border">
                  <pre class="text-sm overflow-auto text-gray-600">{{ JSON.stringify(generatedResult, null, 2) }}</pre>
                </div>
              </details>
            </div>
          </div>
        </div>
      </Card>

      <!-- 快速生成工具 -->
      <Card title="快速生成工具" class="mt-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="space-y-2">
            <h5 class="font-medium">姓名生成</h5>
            <div class="flex space-x-2">
              <Select v-model="quickName.nameType" style="width: 120px">
                <SelectOption value="firstname">名字</SelectOption>
                <SelectOption value="lastname">姓氏</SelectOption>
                <SelectOption value="fullname">全名</SelectOption>
              </Select>
              <Select v-model="quickName.locale" style="width: 100px">
                <SelectOption value="zh_CN">中文</SelectOption>
                <SelectOption value="en_US">英文</SelectOption>
              </Select>
              <Button size="small" @click="quickGenerateName">生成</Button>
            </div>
            <div v-if="quickName.result" class="mt-2">
              <div class="bg-blue-50 border border-blue-200 rounded p-3">
                <div class="text-center">
                  <div class="text-lg font-semibold text-blue-700 mb-1">
                    {{ quickName.result }}
                  </div>
                  <div class="text-xs text-blue-500">姓名生成结果</div>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <h5 class="font-medium">邮箱生成</h5>
            <div class="flex space-x-2">
              <Input v-model="quickEmail.domain" placeholder="域名" style="width: 120px" />
              <Button size="small" @click="quickGenerateEmail">生成</Button>
            </div>
            <div v-if="quickEmail.result" class="mt-2">
              <div class="bg-green-50 border border-green-200 rounded p-3">
                <div class="text-center">
                  <div class="text-lg font-semibold text-green-700 mb-1">
                    {{ quickEmail.result }}
                  </div>
                  <div class="text-xs text-green-500">邮箱生成结果</div>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <h5 class="font-medium">电话号码生成</h5>
            <div class="flex space-x-2">
              <Select v-model="quickPhone.countryCode" style="width: 100px">
                <SelectOption value="+86">中国</SelectOption>
                <SelectOption value="+1">美国</SelectOption>
                <SelectOption value="+44">英国</SelectOption>
              </Select>
              <Button size="small" @click="quickGeneratePhone">生成</Button>
            </div>
            <div v-if="quickPhone.result" class="mt-2">
              <div class="bg-purple-50 border border-purple-200 rounded p-3">
                <div class="text-center">
                  <div class="text-lg font-semibold text-purple-700 mb-1">
                    {{ quickPhone.result }}
                  </div>
                  <div class="text-xs text-purple-500">电话生成结果</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Page>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { Card, Button, Badge, Tag, Input, Select, SelectOption, message } from 'ant-design-vue';
import { Page } from '@vben/common-ui';

import { useBogusStore } from '#/store/bogus';
import type { EndpointInfo } from '#/api/bogus';

const bogusStore = useBogusStore();

// 状态
const selectedEndpoint = ref<EndpointInfo | null>(null);
const generatedResult = ref<any>(null);

// 快速生成工具状态
const quickName = reactive({
  nameType: 'fullname',
  locale: 'zh_CN',
  result: ''
});

const quickEmail = reactive({
  domain: '',
  result: ''
});

const quickPhone = reactive({
  countryCode: '+86',
  result: ''
});

// 表单参数
const formParams = reactive<Record<string, any>>({});

// 方法
async function handleLogin() {
  const success = await bogusStore.loginToBogus();
  if (success) {
    await fetchEndpoints();
  }
}

function handleLogout() {
  bogusStore.logoutFromBogus();
  selectedEndpoint.value = null;
  generatedResult.value = null;
}

async function fetchEndpoints() {
  await bogusStore.fetchEndpoints();
}

function selectEndpoint(endpoint: EndpointInfo) {
  selectedEndpoint.value = endpoint;
  generatedResult.value = null;
  
  // 重置表单参数
  Object.keys(formParams).forEach(key => delete formParams[key]);
  
  // 设置默认值
  endpoint.parameters.forEach(param => {
    if (param.defaultValue) {
      formParams[param.name] = param.defaultValue;
    }
  });
}

async function handleGenerate() {
  if (!selectedEndpoint.value) return;
  
  // 验证必需参数
  const requiredParams = selectedEndpoint.value.parameters.filter(p => p.required);
  for (const param of requiredParams) {
    if (!formParams[param.name]) {
      message.error(`请填写必需参数: ${param.name}`);
      return;
    }
  }

  // 确定端点类型
  const endpointType = getEndpointType(selectedEndpoint.value.path);
  if (!endpointType) {
    message.error('不支持的端点类型');
    return;
  }

  // 生成数据
  const result = await bogusStore.generateSingleData(endpointType, formParams);
  if (result) {
    generatedResult.value = result;
  }
}

function clearResult() {
  generatedResult.value = null;
}

async function copyResult() {
  try {
    await navigator.clipboard.writeText(String(generatedResult.value));
    message.success('结果已复制到剪贴板');
  } catch (error) {
    message.error('复制失败，请手动复制');
  }
}

// 快速生成方法
async function quickGenerateName() {
  const result = await bogusStore.generateSingleData('name', {
    nameType: quickName.nameType,
    locale: quickName.locale
  });
  if (result) {
    quickName.result = result;
  }
}

async function quickGenerateEmail() {
  const result = await bogusStore.generateSingleData('email', {
    domain: quickEmail.domain || undefined
  });
  if (result) {
    quickEmail.result = result;
  }
}

async function quickGeneratePhone() {
  const result = await bogusStore.generateSingleData('phone', {
    countryCode: quickPhone.countryCode
  });
  if (result) {
    quickPhone.result = result;
  }
}

// 工具方法
function getMethodColor(method: string): string {
  const colors: Record<string, string> = {
    GET: 'green',
    POST: 'blue',
    PUT: 'orange',
    DELETE: 'red'
  };
  return colors[method] || 'default';
}

function getEndpointType(path: string): string | null {
  if (path.includes('generate-name')) return 'name';
  if (path.includes('generate-email')) return 'email';
  if (path.includes('generate-phone')) return 'phone';
  if (path.includes('generate-address')) return 'address';
  if (path.includes('generate-company')) return 'company';
  if (path.includes('generate-number')) return 'number';
  if (path.includes('generate-date')) return 'date';
  if (path.includes('generate-text')) return 'text';
  return null;
}

// 生命周期
onMounted(async () => {
  // 如果已经认证，获取端点列表
  if (bogusStore.isAuthenticated) {
    console.log('页面加载时检测到已认证状态，开始获取端点信息...');
    await fetchEndpoints();
  } else {
    console.log('页面加载时未检测到认证状态');
  }
});
</script>

<style scoped>
.bogus-single-page {
  padding: 16px;
}

.space-x-2 > * + * {
  margin-left: 8px;
}

.space-y-2 > * + * {
  margin-top: 8px;
}

.space-y-4 > * + * {
  margin-top: 16px;
}

.mb-4 {
  margin-bottom: 16px;
}

.mt-4 {
  margin-top: 16px;
}

.mb-2 {
  margin-bottom: 8px;
}

.mt-2 {
  margin-top: 8px;
}

.mb-3 {
  margin-bottom: 12px;
}

.mt-3 {
  margin-top: 12px;
}

.mt-2 {
  margin-top: 8px;
}

/* 结果卡片样式 */
.result-card {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.result-card:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
  transition: all 0.2s ease-in-out;
}

/* 快速生成结果样式 */
.bg-blue-50 {
  background-color: #eff6ff;
}

.bg-green-50 {
  background-color: #f0fdf4;
}

.bg-purple-50 {
  background-color: #faf5ff;
}

/* 按钮悬停效果 */
.ant-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease-in-out;
}
</style> 
