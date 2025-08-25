# LagrahhnApi 接口文档

> **基础URL**: `http://localhost:5012`

## 📋 目录

- [1. 认证接口](#1-认证接口)
- [2. Bogus 单一字段生成接口](#2-bogus-单一字段生成接口)
- [3. Bogus 批量生成接口](#3-bogus-批量生成接口)
- [4. 健康检查接口](#4-健康检查接口)
- [5. 错误代码说明](#5-错误代码说明)
- [6. 数据模型](#6-数据模型)
- [7. 附录](#7-附录)

---

## 1. 认证接口

### 1.1 用户注册
**接口路径**: `POST /api/auth/register`

**请求参数**:
```json
{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "confirmPassword": "password123"
}
```

**响应示例**:
```json
{
  "isSuccess": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userId": 1,
    "username": "testuser",
    "email": "test@example.com"
  },
  "message": "用户注册成功",
  "errors": null
}
```

### 1.2 用户登录
**接口路径**: `POST /api/auth/login`

**请求参数**:
```json
{
  "usernameOrEmail": "testuser",
  "password": "password123"
}
```

**响应示例**:
```json
{
  "isSuccess": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userId": 1,
    "username": "testuser",
    "email": "test@example.com"
  },
  "message": "登录成功",
  "errors": null
}
```

---

## 2. Bogus 单一字段生成接口

### 2.1 获取所有可用接口
**接口路径**: `GET /api/bogus/endpoints`

**响应示例**:
```json
{
  "isSuccess": true,
  "data": [
    {
      "name": "生成用户姓名",
      "path": "/api/bogus/generate-name",
      "method": "POST",
      "description": "生成随机用户姓名，支持中文和英文",
      "category": "个人信息",
      "parameters": [
        {
          "name": "nameType",
          "type": "string",
          "required": false,
          "description": "姓名类型：firstname, lastname, fullname, prefix, suffix"
        },
        {
          "name": "locale",
          "type": "string",
          "required": false,
          "description": "语言环境，如：zh_CN, en_US"
        }
      ]
    }
  ],
  "message": "获取可用接口列表成功",
  "errors": null
}
```

### 2.2 生成用户姓名
**接口路径**: `POST /api/bogus/generate-name`

**请求参数**:
```json
{
  "nameType": "fullname",
  "locale": "zh_CN"
}
```

**参数说明**:
- `nameType` (可选): 姓名类型
  - `firstname`: 名字
  - `lastname`: 姓氏
  - `fullname`: 全名 (默认)
  - `prefix`: 前缀
  - `suffix`: 后缀
- `locale` (可选): 语言环境，默认 `zh_CN`

**响应示例**:
```json
{
  "isSuccess": true,
  "data": "张三",
  "message": "姓名生成成功",
  "errors": null
}
```

### 2.3 生成邮箱地址
**接口路径**: `POST /api/bogus/generate-email`

**请求参数**:
```json
{
  "domain": "example.com"
}
```

**参数说明**:
- `domain` (可选): 邮箱域名，如果提供则生成指定域名的邮箱，否则使用随机域名

**响应示例**:
```json
{
  "isSuccess": true,
  "data": "john.doe@example.com",
  "message": "邮箱地址生成成功",
  "errors": null
}
```

### 2.4 生成电话号码
**接口路径**: `POST /api/bogus/generate-phone`

**请求参数**:
```json
{
  "countryCode": "+86"
}
```

**参数说明**:
- `countryCode` (可选): 国家代码，支持多种格式（如 "+86"、"86"、"CN"、"US" 等），如果提供则生成相应格式的电话号码，否则使用默认格式

**支持的国家代码**:
- **中国**: `+86`, `86`, `CN` → +86 138-8888-8888
- **美国**: `+1`, `1`, `US` → +1 (555) 123-4567
- **英国**: `+44`, `44`, `GB` → +44 7000 123456
- **德国**: `+49`, `49`, `DE` → +49 30 1234567
- **法国**: `+33`, `33`, `FR` → +33 1 12345678
- **日本**: `+81`, `81`, `JP` → +81 3 1234 5678
- **韩国**: `+82`, `82`, `KR` → +82 10 1234 5678
- **印度**: `+91`, `91`, `IN` → +91 98765 12345
- **巴西**: `+55`, `55`, `BR` → +55 11 98765 4321
- **俄罗斯**: `+7`, `7`, `RU` → +7 900 1234567
- **加拿大**: `+1`, `CA` → +1 (555) 123-4567
- **澳大利亚**: `+61`, `61`, `AU` → +61 2 12345678

**响应示例**:
```json
{
  "isSuccess": true,
  "data": "+86 138-8888-8888",
  "message": "电话号码生成成功",
  "errors": null
}
```

### 2.5 生成地址信息
**接口路径**: `POST /api/bogus/generate-address`

**请求参数**:
```json
{
  "addressType": "fulladdress",
  "country": "China",
  "city": "Beijing"
}
```

**参数说明**:
- `addressType` (可选): 地址类型
  - `fulladdress`: 完整地址 (默认)
  - `street`: 街道地址
  - `city`: 城市地址
- `country` (可选): 国家名称，支持多种格式（如：China、US、中国、美国等）
- `city` (可选): 城市名称

**支持的国家**:
- **中国**: `China`、`CN`、`中国`
- **美国**: `USA`、`US`、`美国`
- **英国**: `UK`、`GB`、`英国`
- **德国**: `Germany`、`DE`、`德国`
- **法国**: `France`、`FR`、`法国`
- **日本**: `Japan`、`JP`、`日本`
- **韩国**: `Korea`、`KR`、`韩国`
- **俄罗斯**: `Russia`、`RU`、`俄罗斯`
- **加拿大**: `Canada`、`CA`
- **澳大利亚**: `Australia`、`AU`
- **巴西**: `Brazil`、`BR`
- **印度**: `India`、`IN`
- **西班牙**: `Spain`、`ES`
- **意大利**: `Italy`、`IT`
- **荷兰**: `Netherlands`、`NL`
- **瑞典**: `Sweden`、`SE`
- **挪威**: `Norway`、`NO`
- **丹麦**: `Denmark`、`DK`
- **芬兰**: `Finland`、`FI`
- **土耳其**: `Turkey`、`TR`
- **泰国**: `Thailand`、`TH`
- **越南**: `Vietnam`、`VN`
- **印尼**: `Indonesia`、`ID`
- **沙特阿拉伯**: `Saudi Arabia`、`SA`
- **以色列**: `Israel`、`IL`

**功能特性**:
- 根据指定的国家自动设置相应的语言环境（locale）
- 生成符合当地格式的地址信息
- 根据国家范围生成合理的坐标
- 支持指定城市名称

**响应示例**:
```json
{
  "isSuccess": true,
  "data": {
    "fullAddress": "北京市朝阳区建国门外大街1号",
    "streetAddress": "建国门外大街1号",
    "city": "北京市",
    "state": "北京",
    "country": "中国",
    "zipCode": "100001",
    "latitude": 39.9042,
    "longitude": 116.4074
  },
  "message": "地址信息生成成功",
  "errors": null
}
```

**使用示例**:
```bash
# 生成中国北京的地址
curl -X POST "http://localhost:5012/api/bogus/generate-address" \
  -H "Content-Type: application/json" \
  -d '{"country": "China", "city": "Beijing"}'

# 生成美国纽约的街道地址
curl -X POST "http://localhost:5012/api/bogus/generate-address" \
  -H "Content-Type: application/json" \
  -d '{"country": "US", "city": "New York", "addressType": "street"}'

# 生成随机地址
curl -X POST "http://localhost:5012/api/bogus/generate-address" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### 2.6 生成公司信息
**接口路径**: `POST /api/bogus/generate-company`

**请求参数**:
```json
{
  "companyType": "tech",
  "jobType": "developer"
}
```

**参数说明**:
- `companyType` (可选): 公司类型
- `jobType` (可选): 职位类型

**响应示例**:
```json
{
  "isSuccess": true,
  "data": {
    "companyName": "阿里巴巴集团",
    "companySuffix": "有限公司",
    "catchPhrase": "让天下没有难做的生意",
    "bs": "电子商务",
    "jobTitle": "高级软件工程师",
    "jobDescriptor": "高级",
    "jobArea": "技术",
    "jobType": "工程师"
  },
  "message": "公司信息生成成功",
  "errors": null
}
```

### 2.7 生成随机数字
**接口路径**: `POST /api/bogus/generate-number`

**请求参数**:
```json
{
  "minValue": 1,
  "maxValue": 100
}
```

**参数说明**:
- `minValue` (必需): 最小值
- `maxValue` (必需): 最大值

**响应示例**:
```json
{
  "isSuccess": true,
  "data": 42,
  "message": "随机数字生成成功",
  "errors": null
}
```

### 2.8 生成随机日期
**接口路径**: `POST /api/bogus/generate-date`

**请求参数**:
```json
{
  "minYears": 0,
  "maxYears": 5
}
```

**参数说明**:
- `minYears` (必需): 最小年数（过去）
- `maxYears` (必需): 最大年数（过去）

**响应示例**:
```json
{
  "isSuccess": true,
  "data": "2022-05-15T10:30:00Z",
  "message": "随机日期生成成功",
  "errors": null
}
```

### 2.9 生成随机文本
**接口路径**: `POST /api/bogus/generate-text`

**请求参数**:
```json
{
  "textType": "sentence",
  "wordCount": 10,
  "paragraphCount": 2,
  "characterCount": 100
}
```

**参数说明**:
- `textType` (可选): 文本类型
  - `sentence`: 句子 (默认)
  - `paragraph`: 段落
  - `paragraphs`: 多段落
  - `text`: 文本
  - `words`: 单词
- `wordCount` (可选): 单词数量，默认 5
- `paragraphCount` (可选): 段落数量，默认 1
- `characterCount` (可选): 字符数量，默认 100

**响应示例**:
```json
{
  "isSuccess": true,
  "data": "Lorem ipsum dolor sit amet consectetur adipiscing elit.",
  "message": "随机文本生成成功",
  "errors": null
}
```

---

## 3. Bogus 批量生成接口

> **🚀 新功能**: 此接口允许用户根据数据库中的字段映射来批量生成数据，无需手动配置字段映射。

### 📊 功能特点

- **数据库驱动**: 基于预定义的字段映射配置
- **灵活配置**: 支持自定义字段值覆盖
- **批量生成**: 支持1-10000条数据生成
- **实时预览**: 即时返回生成的数据
- **字段验证**: 自动验证字段映射的有效性

### 3.1 获取所有可用的API端点及其字段映射
**接口路径**: `GET /api/BogusBatch/endpoints`

**功能说明**: 获取数据库中所有可用的API端点及其对应的字段映射配置

**响应示例**:
```json
{
  "isSuccess": true,
  "data": [
    {
      "id": 1,
      "endpointName": "生成用户姓名",
      "endpointPath": "/api/bogus/generate-name",
      "httpMethod": "POST",
      "description": "生成随机用户姓名，支持中文和英文",
      "category": "个人信息",
      "isActive": true,
      "fields": [
        {
          "id": 1,
          "fieldName": "nameType",
          "fieldDescription": "姓名类型：firstname, lastname, fullname, prefix, suffix",
          "bogusField": "name",
          "bogusMethod": "FullName",
          "parameters": "[]",
          "dataType": "string",
          "isRequired": false,
          "defaultValue": "fullname",
          "orderIndex": 1
        },
        {
          "id": 2,
          "fieldName": "locale",
          "fieldDescription": "语言环境：zh_CN, en_US, ja_JP等",
          "bogusField": "name",
          "bogusMethod": "Locale",
          "parameters": "[]",
          "dataType": "string",
          "isRequired": false,
          "defaultValue": "zh_CN",
          "orderIndex": 2
        }
      ]
    }
  ],
  "message": "获取API端点及其字段映射成功",
  "errors": null
}
```

### 3.2 根据端点ID批量生成数据
**接口路径**: `POST /api/BogusBatch/generate-by-endpoint/{endpointId}`

**功能说明**: 根据指定的端点ID，使用其预定义的字段映射来批量生成数据

**路径参数**:
- `endpointId` (必需): API端点ID

**请求参数**:
```json
{
  "count": 100,
  "customValues": {
    "nameType": "fullname",
    "locale": "en_US"
  }
}
```

**参数说明**:
- `count` (必需): 生成数据数量，范围1-10000
- `customValues` (可选): 自定义字段值，用于覆盖默认值

**响应示例**:
```json
{
  "isSuccess": true,
  "data": [
    {
      "nameType": "fullname",
      "locale": "en_US"
    },
    {
      "nameType": "fullname",
      "locale": "en_US"
    }
  ],
  "message": "成功生成 100 条数据",
  "errors": null
}
```



### 3.3 获取可用的Bogus字段和方法
**接口路径**: `GET /api/BogusBatch/available-bogus-fields`

**功能说明**: 获取所有可用的Bogus字段和对应的方法

**响应示例**:
```json
{
  "isSuccess": true,
  "data": {
    "Name": {
      "fields": "name",
      "methods": ["FirstName", "LastName", "FullName", "Prefix", "Suffix"]
    },
    "Internet": {
      "fields": "internet",
      "methods": ["Email", "UserName", "Url", "IpAddress", "MacAddress"]
    },
    "Phone": {
      "fields": "phone",
      "methods": ["PhoneNumber", "PhoneNumberFormat"]
    },
    "Address": {
      "fields": "address",
      "methods": ["FullAddress", "StreetAddress", "City", "State", "Country", "ZipCode"]
    },
    "Company": {
      "fields": "company",
      "methods": ["CompanyName", "CompanySuffix", "CatchPhrase", "Bs"]
    },
    "Random": {
      "fields": "random",
      "methods": ["Int", "Double", "Decimal", "Bool", "Enum"]
    },
    "Date": {
      "fields": "date",
      "methods": ["Past", "Future", "Between", "Recent"]
    },
    "Lorem": {
      "fields": "lorem",
      "methods": ["Sentence", "Paragraph", "Paragraphs", "Text", "Words"]
    },
    "Finance": {
      "fields": "finance",
      "methods": ["Account", "AccountName", "Amount", "CreditCardNumber", "Currency"]
    },
    "Commerce": {
      "fields": "commerce",
      "methods": ["ProductName", "ProductAdjective", "ProductMaterial", "Price"]
    }
  },
  "message": "获取可用的Bogus字段和方法成功",
  "errors": null
}
```

### 3.5 使用示例

#### **基于预定义端点的批量生成**
```bash
# 1. 获取可用的端点
curl -X GET "http://localhost:5012/api/BogusBatch/endpoints"

# 2. 根据端点ID批量生成数据
curl -X POST "http://localhost:5012/api/BogusBatch/generate-by-endpoint/1" \
  -H "Content-Type: application/json" \
  -d '{
    "count": 100,
    "customValues": {
      "nameType": "fullname",
      "locale": "en_US"
    }
  }'
```



---

## 4. 健康检查接口

### 4.1 基础健康检查
**接口路径**: `GET /api/health`

**响应示例**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0"
}
```

---

## 5. 错误代码说明

### HTTP 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未授权，需要登录 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

### 业务错误码

| 错误码 | 说明 |
|--------|------|
| AUTH_001 | 用户名或密码错误 |
| AUTH_002 | 用户已存在 |
| AUTH_003 | Token无效或过期 |
| DATA_001 | 字段映射配置错误 |
| DATA_002 | 数据生成失败 |
| SYS_001 | 系统维护中 |

---

## 6. 数据模型

### 6.1 ApiResponse<T>
```csharp
{
  "isSuccess": true,        // 是否成功
  "data": T,                // 返回数据
  "message": "string",      // 消息
  "errors": ["string"]      // 错误列表
}
```

### 6.2 FieldMapping
```csharp
{
  "id": 1,
  "apiEndpointId": 1,
  "fieldName": "string",           // 字段名称
  "fieldDescription": "string",    // 字段描述
  "bogusField": "string",          // Bogus字段名
  "bogusMethod": "string",         // Bogus方法名
  "parameters": "string",          // JSON格式参数
  "dataType": "string",            // 数据类型
  "isRequired": false,             // 是否必需
  "defaultValue": "string",        // 默认值
  "validationRules": "string",     // 验证规则
  "orderIndex": 0,                 // 排序索引
  "isActive": true,                // 是否激活
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### 6.3 ApiEndpoint
```csharp
{
  "id": 1,
  "endpointName": "string",        // 接口名称
  "endpointPath": "string",        // 接口路径
  "httpMethod": "string",          // HTTP方法
  "description": "string",         // 接口描述
  "category": "string",            // 接口分类
  "isActive": true,                // 是否激活
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z",
  "fieldMappings": []              // 关联的字段映射
}
```

---

## 📝 使用示例

### cURL 示例

```bash
# 1. 用户注册
curl -X POST "http://localhost:5012/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'

# 2. 生成用户姓名
curl -X POST "http://localhost:5012/api/bogus/generate-name" \
  -H "Content-Type: application/json" \
  -d '{
    "nameType": "fullname",
    "locale": "zh_CN"
  }'

# 3. 批量生成数据
curl -X POST "http://localhost:5012/api/BogusBatch/generate-by-endpoint/1" \
  -H "Content-Type: application/json" \
  -d '{
    "count": 100,
    "customValues": {
      "nameType": "fullname",
      "locale": "zh_CN"
    }
  }'
```

### JavaScript 示例

```javascript
// 生成随机邮箱
const response = await fetch('http://localhost:5012/api/bogus/generate-email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    domain: 'example.com'
  })
});

const result = await response.json();
console.log(result.data); // "john.doe@example.com"
```

---

---

## 7. 附录

### 7.1 常用 Locale 列表

Bogus 支持多种语言环境，以下是常用的 locale 配置：

#### 中文相关
| Locale | 语言 | 地区 | 示例 |
|--------|------|------|------|
| `zh_CN` | 简体中文 | 中国大陆 | 张三、李四、王五 |
| `zh_TW` | 繁体中文 | 中国台湾 | 陳大文、林小明 |
| `zh_HK` | 繁体中文 | 中国香港 | 陳志強、李美玲 |

#### 英文相关
| Locale | 语言 | 地区 | 示例 |
|--------|------|------|------|
| `en_US` | 英语 | 美国 | John Smith, Mary Johnson |
| `en_GB` | 英语 | 英国 | James Wilson, Emma Brown |
| `en_CA` | 英语 | 加拿大 | Michael Davis, Sarah Miller |
| `en_AU` | 英语 | 澳大利亚 | David Thompson, Lisa Anderson |

#### 欧洲语言
| Locale | 语言 | 地区 | 示例 |
|--------|------|------|------|
| `de_DE` | 德语 | 德国 | Hans Mueller, Anna Schmidt |
| `fr_FR` | 法语 | 法国 | Jean Dupont, Marie Martin |
| `it_IT` | 意大利语 | 意大利 | Marco Rossi, Sofia Bianchi |
| `es_ES` | 西班牙语 | 西班牙 | Carlos Garcia, Maria Rodriguez |
| `pt_PT` | 葡萄牙语 | 葡萄牙 | João Silva, Ana Costa |
| `nl_NL` | 荷兰语 | 荷兰 | Jan Jansen, Lisa de Vries |
| `sv_SE` | 瑞典语 | 瑞典 | Erik Andersson, Anna Johansson |
| `no_NO` | 挪威语 | 挪威 | Ole Hansen, Kari Olsen |
| `da_DK` | 丹麦语 | 丹麦 | Peter Jensen, Mette Nielsen |
| `fi_FI` | 芬兰语 | 芬兰 | Matti Virtanen, Anna Korhonen |

#### 亚洲语言
| Locale | 语言 | 地区 | 示例 |
|--------|------|------|------|
| `ja_JP` | 日语 | 日本 | 田中太郎、佐藤花子 |
| `ko_KR` | 韩语 | 韩国 | 김철수、이영희 |
| `th_TH` | 泰语 | 泰国 | สมชาย ใจดี, สมหญิง รักดี |
| `vi_VN` | 越南语 | 越南 | Nguyễn Văn A, Trần Thị B |
| `id_ID` | 印尼语 | 印度尼西亚 | Budi Santoso, Siti Nurhaliza |

#### 中东语言
| Locale | 语言 | 地区 | 示例 |
|--------|------|------|------|
| `ar_SA` | 阿拉伯语 | 沙特阿拉伯 | أحمد محمد, فاطمة علي |
| `he_IL` | 希伯来语 | 以色列 | דוד כהן, שרה לוי |
| `tr_TR` | 土耳其语 | 土耳其 | Ahmet Yılmaz, Ayşe Demir |

#### 俄语
| Locale | 语言 | 地区 | 示例 |
|--------|------|------|------|
| `ru_RU` | 俄语 | 俄罗斯 | Александр Иванов, Мария Петрова |

#### 使用建议

1. **中文环境**: 推荐使用 `zh_CN`，生成符合中国大陆习惯的姓名
2. **国际化应用**: 根据用户的语言偏好选择合适的 locale
3. **测试数据**: 可以使用多种 locale 生成多样化的测试数据
4. **性能考虑**: 不同 locale 的生成性能略有差异，中文和英文性能最佳

#### 自定义 Locale

如果需要支持其他语言，可以参考 Bogus 的扩展机制：

```csharp
// 创建自定义 locale
var customFaker = new Faker("custom_locale")
    .RuleFor(x => x.Name, f => f.Name.FullName())
    .RuleFor(x => x.Address, f => f.Address.FullAddress());

// 使用自定义 locale
var name = customFaker.Name.FullName();
```
