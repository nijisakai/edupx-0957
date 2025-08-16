#!/bin/bash

# EduPX Universal Builder
# 统一构建脚本，支持多种构建类型
# 用法: ./build.sh [type]
# type: debug|dev|release|all|web
# 默认: debug (包含 Web App + Android Debug APK + iOS IPA)

echo "🚀 EduPX Universal Builder"
echo "=========================="
echo ""

# 配置变量
DEVELOPMENT_TEAM="G54AE6C53A"
BUILD_TYPE="${1:-debug}"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 显示帮助信息
show_help() {
    echo "用法: ./build.sh [type]"
    echo ""
    echo "构建类型:"
    echo "  debug   - Android Debug APK + iOS IPA + Web App (默认)"
    echo "  dev     - iOS开发版本"
    echo "  release - Android Release APK + iOS IPA"
    echo "  all     - 所有平台所有版本"
    echo "  web     - 仅构建Web应用"
    echo ""
    echo "示例:"
    echo "  ./build.sh          # 构建调试版本（默认）"
    echo "  ./build.sh debug    # 构建调试版本"
    echo "  ./build.sh dev      # 构建iOS开发版本"
    echo "  ./build.sh release  # 构建发布版本"
    echo "  ./build.sh all      # 构建所有版本"
    echo ""
    exit 0
}

# 检查参数
case $BUILD_TYPE in
    "help"|"-h"|"--help")
        show_help
        ;;
    "dev"|"release"|"debug"|"all"|"web")
        echo -e "构建类型: ${CYAN}$BUILD_TYPE${NC}"
        ;;
    *)
        echo -e "${RED}❌ 无效的构建类型: $BUILD_TYPE${NC}"
        echo ""
        show_help
        ;;
esac

echo ""

# 检查必要工具
check_tools() {
    echo "📋 检查构建环境..."
    
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm 未安装${NC}"
        exit 1
    fi
    
    if ! command -v npx &> /dev/null; then
        echo -e "${RED}❌ npx 未安装${NC}"
        exit 1
    fi
    
    # 检查是否需要移动端构建工具
    if [[ "$BUILD_TYPE" != "web" ]]; then
        if ! command -v xcodebuild &> /dev/null; then
            echo -e "${RED}❌ Xcode 未安装${NC}"
            exit 1
        fi
        
        # 检查 Java 版本（Android构建需要）
        if [[ "$BUILD_TYPE" == "release" || "$BUILD_TYPE" == "debug" || "$BUILD_TYPE" == "all" ]]; then
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
        fi
    fi
    
    echo -e "${GREEN}✅ 构建环境检查完成${NC}"
}

# 创建带时间戳的发布目录
create_release_dir() {
    local build_name="$1"
    RELEASE_DATE=$(date +"%Y%m%d_%H%M%S")
    RELEASE_DIR="Build_${build_name}_${RELEASE_DATE}"
    echo -e "📁 创建构建目录: ${BLUE}$RELEASE_DIR${NC}"
    mkdir -p "$RELEASE_DIR"
    echo ""
}

# 清理函数
cleanup_build() {
    echo "🧹 清理之前的构建文件..."
    rm -rf android/app/build 2>/dev/null
    rm -rf android/build 2>/dev/null
    rm -rf ios/App/build 2>/dev/null
    rm -rf ios/App/.build 2>/dev/null
    rm -rf dist 2>/dev/null
    echo -e "${GREEN}✅ 清理完成${NC}"
    echo ""
}

# 构建Web应用
build_web() {
    echo -e "${BLUE}🌐 构建 Web 应用...${NC}"
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
        echo "   Web 应用已复制到构建目录"
    else
        echo -e "${RED}❌ dist 目录未找到${NC}"
        exit 1
    fi
    echo ""
}

# 同步到平台
sync_platforms() {
    echo -e "${BLUE}📱 同步到移动平台...${NC}"
    npx cap sync
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ 平台同步失败${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ 平台同步完成${NC}"
    echo ""
}

# 构建Android APK
build_android_apk() {
    local apk_type="$1"  # debug 或 release
    local apk_type_display=""
    
    if [ "$apk_type" = "debug" ]; then
        apk_type_display="Debug"
    else
        apk_type_display="Release"
    fi
    
    echo -e "${BLUE}🤖 构建 Android ${apk_type_display} APK...${NC}"
    cd android
    
    # 设置 Java 21 环境
    export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-21.jdk/Contents/Home
    
    if [ "$apk_type" = "debug" ]; then
        echo "   构建 Debug APK..."
        ./gradlew clean assembleDebug
        APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
        OUTPUT_NAME="EduPX_${RELEASE_DATE}_debug.apk"
    else
        echo "   构建 Release APK..."
        ./gradlew clean assembleRelease
        APK_PATH="app/build/outputs/apk/release/app-release-unsigned.apk"
        OUTPUT_NAME="EduPX_${RELEASE_DATE}_release.apk"
    fi
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Android ${apk_type_display} APK 构建失败${NC}"
        cd ..
        exit 1
    fi
    
    # 检查APK是否生成
    if [ -f "$APK_PATH" ]; then
        APK_SIZE=$(ls -lh "$APK_PATH" | awk '{print $5}')
        echo -e "${GREEN}✅ Android ${apk_type_display} APK 构建完成 (${APK_SIZE})${NC}"
        
        # 复制到构建目录
        cp "$APK_PATH" "../$RELEASE_DIR/$OUTPUT_NAME"
        echo "   ${apk_type_display} APK 已复制到构建目录"
    else
        echo -e "${RED}❌ ${apk_type_display} APK 文件未找到${NC}"
        cd ..
        exit 1
    fi
    
    cd ..
    echo ""
}

# 构建iOS IPA
build_ios_ipa() {
    local config_type="${1:-Debug}"  # Debug 或 Release
    
    echo -e "${BLUE}🍎 构建 iOS IPA (${config_type})...${NC}"
    
    # 生成唯一的 Bundle ID
    BUNDLE_ID="com.sakai.edupx.1754045366"
    echo "   Bundle ID: $BUNDLE_ID"
    
    # 进入 iOS 目录
    cd ios/App
    
    # 清理之前的构建
    echo "   清理之前的构建..."
    rm -rf build/
    
    echo "   构建 iOS Archive..."
    
    if [ "$config_type" = "Debug" ]; then
        # 开发版本构建
        xcodebuild \
            -workspace App.xcworkspace \
            -scheme App \
            -configuration Debug \
            -destination generic/platform=iOS \
            -archivePath "./build/App.xcarchive" \
            archive \
            CODE_SIGN_STYLE=Automatic \
            DEVELOPMENT_TEAM="$DEVELOPMENT_TEAM" \
            CODE_SIGN_IDENTITY="iPhone Developer" \
            PROVISIONING_PROFILE_SPECIFIER="" \
            2>&1
    else
        # 发布版本构建
        xcodebuild \
            -workspace App.xcworkspace \
            -scheme App \
            -configuration Release \
            -destination generic/platform=iOS \
            -archivePath "./build/App.xcarchive" \
            archive \
            CODE_SIGN_STYLE=Automatic \
            DEVELOPMENT_TEAM="$DEVELOPMENT_TEAM" \
            -allowProvisioningUpdates \
            2>&1
    fi
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ iOS Archive 构建失败${NC}"
        cd ../..
        exit 1
    fi
    
    echo -e "${GREEN}✅ iOS Archive 构建成功！${NC}"
    
    # 导出IPA
    echo "   导出 IPA 文件..."
    
    # 创建导出选项plist文件
    if [ "$config_type" = "Debug" ]; then
        cat > ExportOptions.plist << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>development</string>
    <key>teamID</key>
    <string>G54AE6C53A</string>
    <key>compileBitcode</key>
    <false/>
    <key>stripSwiftSymbols</key>
    <true/>
    <key>thinning</key>
    <string>&lt;none&gt;</string>
</dict>
</plist>
EOF
    else
        cat > ExportOptions.plist << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>ad-hoc</string>
    <key>teamID</key>
    <string>G54AE6C53A</string>
    <key>compileBitcode</key>
    <false/>
    <key>stripSwiftSymbols</key>
    <true/>
    <key>thinning</key>
    <string>&lt;none&gt;</string>
</dict>
</plist>
EOF
    fi
    
    xcodebuild \
        -exportArchive \
        -archivePath "./build/App.xcarchive" \
        -exportPath "./build" \
        -exportOptionsPlist ExportOptions.plist \
        2>&1
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ IPA 导出成功！${NC}"
        
        # 检查 IPA 是否生成
        if [ -f "build/App.ipa" ]; then
            IPA_SIZE=$(ls -lh build/App.ipa | awk '{print $5}')
            echo -e "${GREEN}✅ iOS IPA 构建完成 (${IPA_SIZE})${NC}"
            
            # 复制到构建目录
            if [ "$config_type" = "Debug" ]; then
                cp build/App.ipa "../../$RELEASE_DIR/EduPX_${RELEASE_DATE}_dev.ipa"
                echo "   开发版 IPA 已复制到构建目录"
            else
                cp build/App.ipa "../../$RELEASE_DIR/EduPX_${RELEASE_DATE}_release.ipa"
                echo "   发布版 IPA 已复制到构建目录"
            fi
        else
            echo -e "${RED}❌ IPA 文件未找到${NC}"
            cd ../..
            exit 1
        fi
    else
        echo -e "${RED}❌ IPA 导出失败${NC}"
        cd ../..
        exit 1
    fi
    
    cd ../..
    echo ""
}

# 显示构建摘要
show_summary() {
    echo ""
    echo -e "${PURPLE}📦 构建摘要${NC}"
    echo "============="
    echo -e "构建目录: ${BLUE}$RELEASE_DIR/${NC}"
    echo ""
    
    # 检查生成的文件
    if [ -d "$RELEASE_DIR/web-app" ]; then
        WEB_SIZE=$(du -sh "$RELEASE_DIR/web-app" | cut -f1)
        echo -e "${GREEN}✅ Web 应用: web-app/ (${WEB_SIZE})${NC}"
    fi
    
    if [ -f "$RELEASE_DIR/EduPX_${RELEASE_DATE}_debug.apk" ]; then
        DEBUG_APK_SIZE=$(ls -lh "$RELEASE_DIR/EduPX_${RELEASE_DATE}_debug.apk" | awk '{print $5}')
        echo -e "${GREEN}✅ Android Debug APK: EduPX_${RELEASE_DATE}_debug.apk (${DEBUG_APK_SIZE})${NC}"
    fi
    
    if [ -f "$RELEASE_DIR/EduPX_${RELEASE_DATE}_release.apk" ]; then
        RELEASE_APK_SIZE=$(ls -lh "$RELEASE_DIR/EduPX_${RELEASE_DATE}_release.apk" | awk '{print $5}')
        echo -e "${GREEN}✅ Android Release APK: EduPX_${RELEASE_DATE}_release.apk (${RELEASE_APK_SIZE})${NC}"
    fi
    
    if [ -f "$RELEASE_DIR/EduPX_${RELEASE_DATE}_dev.ipa" ]; then
        DEV_IPA_SIZE=$(ls -lh "$RELEASE_DIR/EduPX_${RELEASE_DATE}_dev.ipa" | awk '{print $5}')
        echo -e "${GREEN}✅ iOS 开发版 IPA: EduPX_${RELEASE_DATE}_dev.ipa (${DEV_IPA_SIZE})${NC}"
    fi
    
    if [ -f "$RELEASE_DIR/EduPX_${RELEASE_DATE}_release.ipa" ]; then
        RELEASE_IPA_SIZE=$(ls -lh "$RELEASE_DIR/EduPX_${RELEASE_DATE}_release.ipa" | awk '{print $5}')
        echo -e "${GREEN}✅ iOS 发布版 IPA: EduPX_${RELEASE_DATE}_release.ipa (${RELEASE_IPA_SIZE})${NC}"
    fi
    
    echo ""
    echo -e "${PURPLE}📋 使用说明${NC}"
    echo "============="
    echo "• Web 应用: 部署 web-app/ 文件夹到 Web 服务器"
    echo "• Android APK: 直接安装到设备"
    echo "• iOS IPA: 使用 Xcode 或 iTunes 安装到设备"
    echo ""
    echo -e "${GREEN}🎉 构建流程完成！${NC}"
    echo ""
}

# 主构建流程
main() {
    check_tools
    
    case $BUILD_TYPE in
        "web")
            create_release_dir "Web"
            cleanup_build
            build_web
            ;;
        "dev")
            create_release_dir "Dev"
            cleanup_build
            build_web
            sync_platforms
            build_ios_ipa "Debug"
            ;;
        "debug")
            create_release_dir "Debug"
            cleanup_build
            build_web
            sync_platforms
            build_android_apk "debug"
            build_ios_ipa "Debug"
            ;;
        "release")
            create_release_dir "Release"
            cleanup_build
            build_web
            sync_platforms
            build_android_apk "release"
            build_ios_ipa "Release"
            ;;
        "all")
            create_release_dir "All"
            cleanup_build
            build_web
            sync_platforms
            build_android_apk "debug"
            build_android_apk "release"
            build_ios_ipa "Debug"
            build_ios_ipa "Release"
            ;;
    esac
    
    show_summary
}

# 执行主函数
main
