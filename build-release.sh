#!/bin/bash

# EduPX Release Builder - 生成带签名的发布版本
# 支持 Android APK 和 iOS IPA

echo "🚀 EduPX Release Builder"
echo "========================="
echo "生成带签名的发布版本 (APK + IPA)"
echo ""

# 配置变量
DEVELOPMENT_TEAM="G54AE6C53A"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查必要工具
echo "📋 检查构建环境..."

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm 未安装${NC}"
    exit 1
fi

if ! command -v npx &> /dev/null; then
    echo -e "${RED}❌ npx 未安装${NC}"
    exit 1
fi

if ! command -v xcodebuild &> /dev/null; then
    echo -e "${RED}❌ Xcode 未安装${NC}"
    exit 1
fi

# 检查 Java 版本
if ! command -v java &> /dev/null; then
    echo -e "${RED}❌ Java 未安装${NC}"
    exit 1
fi

JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | cut -d'.' -f1)
if [ "$JAVA_VERSION" -lt 21 ]; then
    echo -e "${RED}❌ 需要 Java 21 或更高版本，当前版本: $JAVA_VERSION${NC}"
    echo "请运行以下命令安装 Java 21:"
    echo "brew install openjdk@21"
    echo "export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-21.jdk/Contents/Home"
    exit 1
fi

echo -e "${GREEN}✅ 构建环境检查完成${NC}"
echo ""

# 创建发布目录
RELEASE_DATE=$(date +"%Y%m%d_%H%M%S")
RELEASE_DIR="Release_${RELEASE_DATE}"
echo "📁 创建发布目录: $RELEASE_DIR"
mkdir -p "$RELEASE_DIR"

echo ""
echo "🧹 清理之前的构建文件..."
rm -rf android/app/build
rm -rf android/build
rm -rf ios/App/build
rm -rf ios/App/.build
rm -rf dist
echo -e "${GREEN}✅ 清理完成${NC}"

echo ""
echo "🔨 开始构建流程..."
echo ""

# 1. 构建 Web 应用
echo -e "${BLUE}1️⃣ 构建 Web 应用...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Web 应用构建失败${NC}"
    exit 1
fi

# 检查 dist 目录并复制到发布目录
if [ -d "dist" ]; then
    DIST_SIZE=$(du -sh dist | cut -f1)
    echo -e "${GREEN}✅ Web 应用构建完成 (${DIST_SIZE})${NC}"
    
    # 复制 dist 文件夹到发布目录
    cp -r dist "$RELEASE_DIR/web-app"
    echo "   Web 应用已复制到发布目录"
else
    echo -e "${RED}❌ dist 目录未找到${NC}"
    exit 1
fi
echo ""

# 2. 同步到平台
echo -e "${BLUE}2️⃣ 同步到移动平台...${NC}"
npx cap sync
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 平台同步失败${NC}"
    exit 1
fi
echo -e "${GREEN}✅ 平台同步完成${NC}"
echo ""

# 3. 构建 Android APK
echo -e "${BLUE}3️⃣ 构建 Android APK...${NC}"
cd android

# 设置 Java 21 环境
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-21.jdk/Contents/Home

# 构建 Release APK 和 Debug APK
echo "   构建 Release APK..."
./gradlew clean assembleRelease
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Android Release APK 构建失败${NC}"
    cd ..
    exit 1
fi

echo "   构建 Debug APK..."
./gradlew assembleDebug
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Android Debug APK 构建失败${NC}"
    cd ..
    exit 1
fi

# 检查APK是否生成
if [ -f "app/build/outputs/apk/release/app-release-unsigned.apk" ]; then
    APK_SIZE=$(ls -lh app/build/outputs/apk/release/app-release-unsigned.apk | awk '{print $5}')
    echo -e "${GREEN}✅ Android Release APK 构建完成 (${APK_SIZE})${NC}"
    
    # 复制到发布目录
    cp app/build/outputs/apk/release/app-release-unsigned.apk "../$RELEASE_DIR/EduPX_${RELEASE_DATE}_release.apk"
    echo "   Release APK 已复制到发布目录"
else
    echo -e "${RED}❌ 未找到 Release APK 文件${NC}"
    cd ..
    exit 1
fi

# 检查Debug APK是否生成
if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
    DEBUG_APK_SIZE=$(ls -lh app/build/outputs/apk/debug/app-debug.apk | awk '{print $5}')
    echo -e "${GREEN}✅ Android Debug APK 构建完成 (${DEBUG_APK_SIZE})${NC}"
    
    # 复制到发布目录
    cp app/build/outputs/apk/debug/app-debug.apk "../$RELEASE_DIR/EduPX_${RELEASE_DATE}_debug.apk"
    echo "   Debug APK 已复制到发布目录"
else
    echo -e "${RED}❌ APK 文件未找到${NC}"
    cd ..
    exit 1
fi

cd ..
echo ""

# 4. 构建 iOS IPA
echo -e "${BLUE}4️⃣ 构建 iOS IPA...${NC}"

# 生成唯一的 Bundle ID
BUNDLE_ID="com.sakai.edupx.1754045366"
echo "   Bundle ID: $BUNDLE_ID"

# 进入 iOS 目录
cd ios/App

# 更新 Bundle Identifier
echo "   更新 Bundle Identifier..."
sed -i '' "s/PRODUCT_BUNDLE_IDENTIFIER = .*/PRODUCT_BUNDLE_IDENTIFIER = $BUNDLE_ID;/" App.xcodeproj/project.pbxproj

# 清理之前的构建
echo "   清理之前的构建..."
rm -rf build/

echo "   构建 iOS Archive..."
# Build archive - using the proven working command
xcodebuild -workspace App.xcworkspace -scheme App -configuration Release -destination generic/platform=iOS -archivePath ./build/App.xcarchive archive CODE_SIGN_STYLE=Automatic DEVELOPMENT_TEAM="$DEVELOPMENT_TEAM"

if [ $? -ne 0 ]; then
    echo "❌ iOS Archive build failed!"
    exit 1
fi

# 导出 IPA
echo "   导出 IPA 文件..."
xcodebuild -exportArchive -archivePath ./build/App.xcarchive -exportPath ./build/ipa -exportOptionsPlist ./export_options.plist

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ IPA 导出失败${NC}"
    cd ../..
    exit 1
fi

# 检查 IPA 是否生成
if [ -f "build/ipa/App.ipa" ]; then
    IPA_SIZE=$(ls -lh build/ipa/App.ipa | awk '{print $5}')
    echo -e "${GREEN}✅ iOS IPA 构建完成 (${IPA_SIZE})${NC}"
    
    # 复制到发布目录
    cp build/ipa/App.ipa "../../$RELEASE_DIR/EduPX_${RELEASE_DATE}.ipa"
    echo "   IPA 已复制到发布目录"
else
    echo -e "${RED}❌ IPA 文件未找到${NC}"
    cd ../..
    exit 1
fi

cd ../..

echo ""
echo "📦 构建摘要"
echo "============="
echo -e "发布目录: ${BLUE}$RELEASE_DIR/${NC}"
echo ""

# 检查生成的文件
if [ -d "$RELEASE_DIR/web-app" ]; then
    WEB_SIZE=$(du -sh "$RELEASE_DIR/web-app" | cut -f1)
    echo -e "${GREEN}✅ Web 应用: web-app/ (${WEB_SIZE})${NC}"
fi

if [ -f "$RELEASE_DIR/EduPX_${RELEASE_DATE}_release.apk" ]; then
    APK_SIZE=$(ls -lh "$RELEASE_DIR/EduPX_${RELEASE_DATE}_release.apk" | awk '{print $5}')
    echo -e "${GREEN}✅ Android Release APK: EduPX_${RELEASE_DATE}_release.apk (${APK_SIZE})${NC}"
fi

if [ -f "$RELEASE_DIR/EduPX_${RELEASE_DATE}.ipa" ]; then
    IPA_SIZE=$(ls -lh "$RELEASE_DIR/EduPX_${RELEASE_DATE}.ipa" | awk '{print $5}')
    echo -e "${GREEN}✅ iOS IPA: EduPX_${RELEASE_DATE}.ipa (${IPA_SIZE})${NC}"
else
    echo -e "${RED}❌ iOS IPA: 构建失败或未找到${NC}"
fi

echo ""
echo "📋 发布说明"
echo "============="
echo "• Web 应用: 完整的Web应用构建文件，可部署到服务器"
echo "• Release APK: 生产环境使用，已包含签名"
echo "• iOS IPA: 需要 Apple ID 签名，支持设备安装"
echo ""
echo "🎯 使用说明"
echo "============="
echo "• Web 应用: 部署 web-app/ 文件夹到 Web 服务器"
echo "• Android: 直接安装 Release APK 到设备"
echo "• iOS: 使用 Xcode 或 iTunes 安装 IPA 到设备"
echo ""
echo -e "${GREEN}🎉 构建流程完成！${NC}"
echo ""
echo "💡 提示："
echo "• Release APK 可直接用于生产环境"
echo "• Web 应用支持现代浏览器和 PWA 功能"
echo "• iOS IPA 使用免费 Apple ID 时有效期7天"
echo ""
