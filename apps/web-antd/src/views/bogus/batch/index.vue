<template>
  <div class="bogus-batch-page">
    <Page title="批量数据生成" description="根据预定义配置批量生成虚拟数据">
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

      <!-- 可用端点列表 -->
      <Card title="可用端点" class="mb-4">
        <div class="mb-4">
          <Button @click="fetchBatchEndpoints" :loading="bogusStore.loading">
            刷新端点列表
          </Button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card 
            v-for="endpoint in bogusStore.batchEndpoints" 
            :key="endpoint.id"
            size="small"
            class="cursor-pointer hover:shadow-md transition-shadow"
            :class="{ 'ring-2 ring-blue-500': selectedEndpoint?.id === endpoint.id }"
            @click="selectEndpoint(endpoint)"
          >
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <Tag :color="getMethodColor(endpoint.httpMethod)">{{ endpoint.httpMethod }}</Tag>
                <span class="text-sm text-gray-500">{{ endpoint.category }}</span>
              </div>
              <h4 class="font-medium">{{ endpoint.endpointName }}</h4>
              <p class="text-sm text-gray-600">{{ endpoint.description }}</p>
              <div class="text-xs text-gray-500">
                <div>字段数量: {{ endpoint.fields.length }}</div>
                <div>状态: {{ endpoint.isActive ? '启用' : '禁用' }}</div>
              </div>
            </div>
          </Card>
        </div>
      </Card>

      <!-- 字段映射详情 -->
      <Card v-if="selectedEndpoint" title="字段映射配置" class="mb-4">
        <div class="space-y-4">
          <div class="flex items-center space-x-2 mb-4">
            <Tag color="blue">{{ selectedEndpoint.endpointName }}</Tag>
            <span class="text-gray-600">{{ selectedEndpoint.description }}</span>
          </div>

          <Table 
            :columns="fieldColumns" 
            :data-source="selectedEndpoint.fields"
            :pagination="false"
            size="small"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'isRequired'">
                <Tag :color="record.isRequired ? 'red' : 'green'">
                  {{ record.isRequired ? '必需' : '可选' }}
                </Tag>
              </template>
              <template v-else-if="column.key === 'defaultValue'">
                <span v-if="record.defaultValue" class="text-blue-600">{{ record.defaultValue }}</span>
                <span v-else class="text-gray-400">无</span>
              </template>
            </template>
          </Table>
        </div>
      </Card>

      <!-- 批量生成配置 -->
      <Card v-if="selectedEndpoint" title="批量生成配置" class="mb-4">
        <div class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2">
                生成数量 <span class="text-red-500">*</span>
              </label>
              <InputNumber 
                v-model:value="batchConfig.count"
                :min="1"
                :max="10000"
                style="width: 100%"
                placeholder="请输入生成数量 (1-10000)"
              />
            </div>
          </div>

          <!-- 自定义字段值 -->
          <div v-if="selectedEndpoint.fields.length > 0">
            <h4 class="font-medium mb-2">自定义字段值 (可选)</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-for="field in selectedEndpoint.fields" :key="field.id">
                <label class="block text-sm font-medium mb-2">
                  {{ field.fieldName }}
                  <span class="text-xs text-gray-500">({{ field.bogusField }}.{{ field.bogusMethod }})</span>
                </label>
                <Input 
                  v-model="customValues[field.fieldName]"
                  :placeholder="`默认值: ${field.defaultValue || '无'}`"
                />
                <div class="text-xs text-gray-500 mt-1">{{ field.fieldDescription }}</div>
              </div>
            </div>
          </div>

          <!-- 生成按钮 -->
          <div class="flex space-x-2">
            <Button 
              type="primary" 
              :loading="bogusStore.loading"
              @click="handleBatchGenerate"
            >
              批量生成数据
            </Button>
            <Button @click="clearGeneratedData">清空结果</Button>
            <Button @click="exportData" :disabled="!bogusStore.generatedData.length">
              导出数据
            </Button>
          </div>
        </div>
      </Card>

      <!-- 生成结果 -->
      <Card v-if="bogusStore.generatedData.length > 0" title="生成结果" class="mb-4">
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">
              共生成 {{ bogusStore.generatedData.length }} 条数据
            </span>
            <Button size="small" @click="previewData = !previewData">
              {{ previewData ? '隐藏预览' : '显示预览' }}
            </Button>
          </div>

          <!-- 数据预览 -->
          <div v-if="previewData" class="bg-gray-50 p-4 rounded border max-h-96 overflow-auto">
            <Table 
              :columns="dataPreviewColumns" 
              :data-source="bogusStore.generatedData"
              :pagination="{ pageSize: 10 }"
              size="small"
            />
          </div>

          <!-- 原始数据 -->
          <div class="bg-gray-50 p-4 rounded border">
            <div class="flex items-center justify-between mb-2">
              <h4 class="font-medium">原始数据 (JSON)</h4>
              <Button size="small" @click="copyToClipboard">复制到剪贴板</Button>
            </div>
            <pre class="text-sm overflow-auto max-h-64">{{ JSON.stringify(bogusStore.generatedData, null, 2) }}</pre>
          </div>
        </div>
      </Card>

      <!-- 可用Bogus字段信息 -->
      <Card title="可用Bogus字段和方法" class="mt-4">
        <div class="mb-4">
          <Button @click="fetchAvailableFields" :loading="bogusStore.loading">
            获取字段信息
          </Button>
        </div>
        
        <div v-if="availableFields" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card 
            v-for="(fieldInfo, fieldName) in availableFields" 
            :key="fieldName"
            size="small"
          >
            <div class="space-y-2">
              <h4 class="font-medium text-blue-600">{{ fieldName }}</h4>
              <div class="text-sm text-gray-600">
                <div>字段: {{ fieldInfo.fields }}</div>
                <div class="mt-1">方法:</div>
                <div class="flex flex-wrap gap-1 mt-1">
                  <Tag 
                    v-for="method in fieldInfo.methods" 
                    :key="method"
                    size="small"
                    color="blue"
                  >
                    {{ method }}
                  </Tag>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </Card>
    </Page>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { Card, Button, Badge, Tag, Input, InputNumber, Table, message } from 'ant-design-vue';
import { Page } from '@vben/common-ui';

import { useBogusStore } from '#/store/bogus';
import { bogusBatchApi } from '#/api/bogus';
import type { BatchEndpointInfo, BogusFieldInfo } from '#/api/bogus';

const bogusStore = useBogusStore();

// 状态
const selectedEndpoint = ref<BatchEndpointInfo | null>(null);
const availableFields = ref<BogusFieldInfo | null>(null);
const previewData = ref(false);

// 批量生成配置
const batchConfig = reactive({
  count: 100
});

// 自定义字段值
const customValues = reactive<Record<string, any>>({});

// 表格列定义
const fieldColumns = [
  {
    title: '字段名',
    dataIndex: 'fieldName',
    key: 'fieldName',
  },
  {
    title: '描述',
    dataIndex: 'fieldDescription',
    key: 'fieldDescription',
    ellipsis: true,
  },
  {
    title: 'Bogus字段',
    dataIndex: 'bogusField',
    key: 'bogusField',
  },
  {
    title: 'Bogus方法',
    dataIndex: 'bogusMethod',
    key: 'bogusMethod',
  },
  {
    title: '数据类型',
    dataIndex: 'dataType',
    key: 'dataType',
  },
  {
    title: '是否必需',
    dataIndex: 'isRequired',
    key: 'isRequired',
  },
  {
    title: '默认值',
    dataIndex: 'defaultValue',
    key: 'defaultValue',
  },
  {
    title: '排序',
    dataIndex: 'orderIndex',
    key: 'orderIndex',
  },
];

const dataPreviewColumns = ref<any[]>([]);

// 方法
async function handleLogin() {
  const success = await bogusStore.loginToBogus();
  if (success) {
    await fetchBatchEndpoints();
    await fetchAvailableFields();
  }
}

function handleLogout() {
  bogusStore.logoutFromBogus();
  selectedEndpoint.value = null;
  availableFields.value = null;
  resetForm();
}

async function fetchBatchEndpoints() {
  await bogusStore.fetchBatchEndpoints();
}

async function fetchAvailableFields() {
  try {
    const response = await bogusBatchApi.getAvailableBogusFields();
    if (response.isSuccess) {
      availableFields.value = response.data;
    }
  } catch (error: any) {
    message.error('获取可用字段信息失败: ' + error.message);
  }
}

function selectEndpoint(endpoint: BatchEndpointInfo) {
  selectedEndpoint.value = endpoint;
  resetForm();
  
  // 生成数据预览列
  dataPreviewColumns.value = endpoint.fields.map(field => ({
    title: field.fieldName,
    dataIndex: field.fieldName,
    key: field.fieldName,
    ellipsis: true,
  }));
}

function resetForm() {
  batchConfig.count = 100;
  Object.keys(customValues).forEach(key => delete customValues[key]);
}

async function handleBatchGenerate() {
  if (!selectedEndpoint.value) return;
  
  if (!batchConfig.count || batchConfig.count < 1 || batchConfig.count > 10000) {
    message.error('请输入有效的生成数量 (1-10000)');
    return;
  }

  // 过滤有效的自定义值
  const validCustomValues: Record<string, any> = {};
  Object.keys(customValues).forEach(key => {
    if (customValues[key] !== undefined && customValues[key] !== '') {
      validCustomValues[key] = customValues[key];
    }
  });

  const result = await bogusStore.generateBatchData(
    selectedEndpoint.value.id,
    batchConfig.count,
    Object.keys(validCustomValues).length > 0 ? validCustomValues : undefined
  );
  
  if (result) {
    previewData.value = true;
  }
}

function clearGeneratedData() {
  bogusStore.generatedData = [];
}

function exportData() {
  if (!bogusStore.generatedData.length) return;
  
  const dataStr = JSON.stringify(bogusStore.generatedData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `bogus-data-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  message.success('数据导出成功');
}

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(JSON.stringify(bogusStore.generatedData, null, 2));
    message.success('已复制到剪贴板');
  } catch (error) {
    message.error('复制失败，请手动复制');
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

// 生命周期
onMounted(async () => {
  // 如果已经认证，获取端点列表
  if (bogusStore.isAuthenticated) {
    console.log('页面加载时检测到已认证状态，开始获取端点信息...');
    await fetchBatchEndpoints();
    await fetchAvailableFields();
  } else {
    console.log('页面加载时未检测到认证状态');
  }
});
</script>

<style scoped>
.bogus-batch-page {
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

.max-h-96 {
  max-height: 24rem;
}

.max-h-64 {
  max-height: 16rem;
}
</style> 
