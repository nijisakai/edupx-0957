# EduPX 统一构建脚本

## 概述

`build.sh` 是一个统一的构建脚本，支持多种构建类型，并自动生成带时间戳的构建目录。

## 使用方法

```bash
./build.sh [type]
```

### 构建类型

| 类型 | 描述 | 输出 |
|------|------|------|
| `dev` | iOS开发版本 (默认) | Web应用 + iOS开发版IPA |
| `release` | 发布版本 | Web应用 + Android Release APK + iOS发布版IPA |
| `debug` | 调试版本 | Web应用 + Android Debug APK + iOS开发版IPA |
| `all` | 所有版本 | Web应用 + 所有APK和IPA |
| `web` | 仅Web应用 | Web应用 |

### 示例

```bash
# 构建iOS开发版本（默认）
./build.sh

# 构建发布版本
./build.sh release

# 构建调试版本
./build.sh debug

# 构建所有版本
./build.sh all

# 仅构建Web应用
./build.sh web

# 显示帮助信息
./build.sh help
```

## 输出目录

脚本会自动创建带时间戳的构建目录：

```
Build_[类型]_[时间戳]/
├── web-app/              # Web应用构建文件
├── EduPX_[时间戳]_dev.ipa       # iOS开发版
├── EduPX_[时间戳]_release.ipa   # iOS发布版
├── EduPX_[时间戳]_debug.apk     # Android调试版
└── EduPX_[时间戳]_release.apk   # Android发布版
```

## 文件说明

### Web应用 (`web-app/`)
- 完整的Web应用构建文件
- 可直接部署到Web服务器
- 支持PWA功能

### Android APK
- **Debug APK**: 包含调试信息，便于开发测试
- **Release APK**: 生产环境使用，已优化

### iOS IPA  
- **开发版**: 使用开发者证书签名，用于测试
- **发布版**: 使用分发证书签名，用于App Store或企业分发

## 环境要求

### 基础工具
- Node.js & npm
- npx

### iOS构建
- Xcode (macOS)
- Apple Developer Account

### Android构建  
- Java 21+
- Android SDK

## 构建配置

### 开发者团队ID
```bash
DEVELOPMENT_TEAM="G54AE6C53A"
```

### Bundle ID
```bash
BUNDLE_ID="com.sakai.edupx.1754045366"
```

## 故障排除

### Java版本错误
如果遇到Java版本问题：
```bash
brew install openjdk@21
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-21.jdk/Contents/Home
```

### iOS签名问题
确保已在Xcode中登录Apple ID并同意开发者协议。

### Android构建失败
检查Android SDK和Java环境是否正确配置。

## 自动化部署

可以将此脚本集成到CI/CD流水线中：

```bash
# 在CI中构建发布版本
./build.sh release

# 获取构建产物
BUILD_DIR=$(ls -d Build_Release_* | tail -1)
echo "Build directory: $BUILD_DIR"
```

## 更新历史

- v1.0: 初始版本，支持基本构建功能
- v1.1: 添加带时间戳的构建目录
- v1.2: 支持多种构建类型和统一接口
