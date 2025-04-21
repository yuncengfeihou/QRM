// settings.js
import { extension_settings } from "./index.js"; 
import * as Constants from './constants.js';
import { sharedState, setMenuVisible } from './state.js';
import { updateMenuVisibilityUI } from './ui.js';

// 在settings.js中添加自己的updateIconDisplay实现，避免循环依赖
function updateIconDisplay() {
    const button = sharedState.domElements.rocketButton;
    if (!button) return;
    
    const settings = extension_settings[Constants.EXTENSION_NAME];
    const iconType = settings.iconType || Constants.ICON_TYPES.ROCKET;
    
    // 清除按钮内容和样式
    button.innerHTML = '';
    button.className = 'interactable secondary-button';
    button.style.backgroundImage = '';
    button.style.backgroundSize = '';
    button.style.backgroundPosition = '';
    button.style.backgroundRepeat = '';
    
    // 根据图标类型设置内容
    if (iconType === Constants.ICON_TYPES.CUSTOM && settings.customIconUrl) {
        const customContent = settings.customIconUrl.trim();
        
        // 使用CSS背景图像显示
        if (customContent.startsWith('<svg') && customContent.includes('</svg>')) {
            // SVG代码 - 转换为Data URL
            const svgDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(customContent);
            button.style.backgroundImage = `url('${svgDataUrl}')`;
            button.style.backgroundSize = '20px 20px';
            button.style.backgroundPosition = 'center';
            button.style.backgroundRepeat = 'no-repeat';
        } 
        else if (customContent.startsWith('data:') || 
                customContent.startsWith('http') || 
                customContent.endsWith('.png') || 
                customContent.endsWith('.jpg') || 
                customContent.endsWith('.svg') ||
                customContent.endsWith('.gif')) {
            // URL或完整的Data URL
            button.style.backgroundImage = `url('${customContent}')`;
            button.style.backgroundSize = '20px 20px';
            button.style.backgroundPosition = 'center';
            button.style.backgroundRepeat = 'no-repeat';
        } 
        else if (customContent.includes('base64,')) {
            // 不完整的base64，尝试补全
            let imgUrl = customContent;
            if (!customContent.startsWith('data:')) {
                imgUrl = 'data:image/png;base64,' + customContent.split('base64,')[1];
            }
            button.style.backgroundImage = `url('${imgUrl}')`;
            button.style.backgroundSize = '20px 20px';
            button.style.backgroundPosition = 'center';
            button.style.backgroundRepeat = 'no-repeat';
        } else {
            // 不是可识别的格式，使用文本显示
            button.textContent = '?';
            console.warn(`[${Constants.EXTENSION_NAME}] 无法识别的图标格式`);
        }
    } else {
        // 使用FontAwesome图标
        const iconClass = Constants.ICON_CLASS_MAP[iconType] || Constants.ICON_CLASS_MAP[Constants.ICON_TYPES.ROCKET];
        button.classList.add('fa-solid', iconClass);
    }
    
    // 应用颜色匹配设置
    if (settings.matchButtonColors) {
        // 从发送按钮获取CSS变量并应用到我们的按钮
        const sendButton = document.getElementById('send_but');
        if (sendButton) {
            // 获取计算后的样式
            const sendButtonStyle = getComputedStyle(sendButton);
            
            // 应用颜色
            button.style.color = sendButtonStyle.color;
            
            // 添加额外的CSS类以匹配发送按钮
            if (sendButton.classList.contains('primary-button')) {
                button.classList.remove('secondary-button');
                button.classList.add('primary-button');
            }
        }
    }
}

/**
 * Creates the HTML for the settings panel.
 * @returns {string} HTML string for the settings.
 */
export function createSettingsHtml() {
    // 菜单样式设置面板
    const stylePanel = `
    <div id="${Constants.ID_MENU_STYLE_PANEL}">
        <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
            <h3>菜单样式设置</h3>
            <button class="menu_button" id="${Constants.ID_MENU_STYLE_PANEL}-close" style="width:auto; padding:0 10px;">
                <i class="fa-solid fa-times"></i>
            </button>
        </div>
        
        <div class="quick-reply-style-group">
            <h4>菜单项样式</h4>
            <div class="quick-reply-settings-row">
                <label>菜单项背景:</label>
                <div class="color-picker-container">
                    <input type="color" id="qr-item-bgcolor-picker" class="qr-color-picker">
                    <input type="text" id="qr-item-bgcolor-text" class="qr-color-text-input" placeholder="#RRGGBB">
                </div>
                <div class="slider-container">
                    <input type="range" id="qr-item-opacity" min="0" max="1" step="0.1" value="0.7" class="qr-opacity-slider">
                    <span id="qr-item-opacity-value" class="opacity-value">0.7</span>
                </div>
            </div>
            <div class="quick-reply-settings-row">
                <label>菜单项文字:</label>
                <div class="color-picker-container">
                    <input type="color" id="qr-item-color-picker" class="qr-color-picker">
                    <input type="text" id="qr-item-color-text" class="qr-color-text-input" placeholder="#RRGGBB">
                </div>
            </div>
        </div>
        
        <div class="quick-reply-style-group">
            <h4>标题样式</h4>
            <div class="quick-reply-settings-row">
                <label>标题文字:</label>
                <div class="color-picker-container">
                    <input type="color" id="qr-title-color-picker" class="qr-color-picker">
                    <input type="text" id="qr-title-color-text" class="qr-color-text-input" placeholder="#RRGGBB">
                </div>
            </div>
            <div class="quick-reply-settings-row">
                <label>分割线:</label>
                <div class="color-picker-container">
                    <input type="color" id="qr-title-border-picker" class="qr-color-picker">
                    <input type="text" id="qr-title-border-text" class="qr-color-text-input" placeholder="#RRGGBB">
                </div>
            </div>
        </div>
        
        <div class="quick-reply-style-group">
            <h4>空提示样式</h4>
            <div class="quick-reply-settings-row">
                <label>提示文字:</label>
                <div class="color-picker-container">
                    <input type="color" id="qr-empty-color-picker" class="qr-color-picker">
                    <input type="text" id="qr-empty-color-text" class="qr-color-text-input" placeholder="#RRGGBB">
                </div>
            </div>
        </div>
        
        <div class="quick-reply-style-group">
            <h4>菜单面板样式</h4>
            <div class="quick-reply-settings-row">
                <label>菜单背景:</label>
                <div class="color-picker-container">
                    <input type="color" id="qr-menu-bgcolor-picker" class="qr-color-picker">
                    <input type="text" id="qr-menu-bgcolor-text" class="qr-color-text-input" placeholder="#RRGGBB">
                </div>
                <div class="slider-container">
                    <input type="range" id="qr-menu-opacity" min="0" max="1" step="0.1" value="0.85" class="qr-opacity-slider">
                    <span id="qr-menu-opacity-value" class="opacity-value">0.85</span>
                </div>
            </div>
            <div class="quick-reply-settings-row">
                <label>菜单边框:</label>
                <div class="color-picker-container">
                    <input type="color" id="qr-menu-border-picker" class="qr-color-picker">
                    <input type="text" id="qr-menu-border-text" class="qr-color-text-input" placeholder="#RRGGBB">
                </div>
            </div>
        </div>
        
        <div style="display:flex; justify-content:space-between; margin-top:20px;">
            <button class="menu_button" id="${Constants.ID_RESET_STYLE_BUTTON}" style="width:auto; padding:0 10px;">
                <i class="fa-solid fa-rotate-left"></i> 恢复默认
            </button>
            <button class="menu_button" id="${Constants.ID_MENU_STYLE_PANEL}-apply" style="width:auto; padding:0 10px;">
                <i class="fa-solid fa-check"></i> 应用样式
            </button>
        </div>
    </div>
    `;
    
    // 使用说明面板
    const usagePanel = `
    <div id="${Constants.ID_USAGE_PANEL}" class="qr-usage-panel">
        <div style="margin-bottom:7px;">
            <h3 style="color: white; font-weight: bold; margin: 0 0 7px 0;">使用说明</h3>
        </div>
        
        <div class="quick-reply-usage-content">
            <p><strong>该插件主要提供以下基本功能：</strong></p>
            <ul>
                <li>通过点击发送按钮旁边的小图标，快速打开或关闭快捷回复菜单。</li>
                <li>支持两种快捷回复类型：“聊天快捷回复”（针对当前聊天）和“全局快捷回复”（适用于所有聊天），方便分类管理。</li>
            </ul>
        
            <p><strong>以下是关于插件的详细设置</strong></p>
        
            <p><strong>首先，在基本设置中，你可以：</strong></p>
            <ul>
                <li>选择“启用”或“禁用”来控制插件的整体开关状态。</li>
                <li>选择显示在发送按钮旁边的图标样式，可选项包括：
                    <ul>
                        <li>小火箭（默认）</li>
                        <li>调色盘</li>
                        <li>星月</li>
                        <li>五芒星</li>
                        <li>自定义图标</li>
                    </ul>
                </li>
            </ul>
        
            <p><strong>其次，在图标设置部分：</strong></p>
            <ul>
                <li>可以点击“预览”按钮查看当前所选图标的效果。</li>
                <li>若选择“自定义图标”，可以通过以下方式设置：
                    <ul>
                        <li>输入图标的URL（如使用图床）或其base64编码。</li>
                        <li>输入SVG代码（适用于SVG图标）。</li>
                        <li>点击“选择文件”上传本地图片（支持png, jpg, svg等常见格式）。</li>
                    </ul>
                </li>
                <li>可以勾选“使用与发送按钮相匹配的颜色风格”，让图标颜色自动适配发送按钮（目前此功能尚有瑕疵，待修复）。</li>
            </ul>
        
            <p><strong>然后，你可以通过点击“菜单样式”按钮，来自定义快捷回复菜单的外观：</strong></p>
            <ul>
                <li><strong>菜单项样式：</strong>
                    <ul>
                        <li>设置菜单项的背景颜色和透明度（通过滑动条调节）。</li>
                        <li>设置菜单项的文字颜色。</li>
                    </ul>
                </li>
                <li><strong>标题样式：</strong>
                    <ul>
                        <li>设置标题文字的颜色。</li>
                        <li>设置分割线的颜色。</li>
                    </ul>
                </li>
                <li><strong>其他样式设置：</strong>
                    <ul>
                        <li>设置无快捷回复项时提示文字的颜色。</li>
                        <li>设置整个菜单面板的背景颜色、透明度和边框颜色。</li>
                    </ul>
                </li>
            </ul>
        
            <p><strong>调整样式后，有两个控制按钮可供使用：</strong></p>
            <ul>
                <li>恢复默认：将所有样式设置还原为初始状态。</li>
                <li>应用样式：保存并应用当前的样式修改。</li>
            </ul>
        
            <p><strong>这里有一些使用这款插件的小技巧：</strong></p>
            <ul>
                <li>点击菜单外部的任意区域可以关闭菜单。</li>
                <li>你可以通过更改图标类型和颜色，使其更好地匹配你的界面主题。</li>
                <li>对于经常在各种聊天中使用的回复，建议添加到“全局快捷回复”中。</li>
                <li>对于只在特定聊天场景下使用的回复，则更适合添加到“聊天快捷回复”中。</li>
            </ul>
        
            <p><strong>最后是关于数据保存：</strong></p>
            <p>完成所有配置（包括样式设置）后，记得点击“保存设置”按钮来手动保存，以确保你的设置不会丢失。另外，如果你需要SVG图标素材，可以考虑访问 Font Awesome 网站 (fontawesome.com/search) 查找免费图标，或者自己下载、制作SVG图标。</p>
        </div>
        
        <div style="text-align:center; margin-top:10px;">
            <button class="menu_button" id="${Constants.ID_USAGE_PANEL}-close" style="width:auto; padding:0 10px;">
                确定
            </button>
        </div>
    </div>
    `;

    return `
    <div id="${Constants.ID_SETTINGS_CONTAINER}" class="extension-settings">
        <div class="inline-drawer">
            <div class="inline-drawer-toggle inline-drawer-header">
                <b>QR助手</b>
                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down"></div>
            </div>
            <div class="inline-drawer-content">
                <div class="flex-container flexGap5">
                    <label for="${Constants.ID_SETTINGS_ENABLED_DROPDOWN}">插件状态:</label>
                    <select id="${Constants.ID_SETTINGS_ENABLED_DROPDOWN}" class="text_pole">
                        <option value="true">启用</option>
                        <option value="false">禁用</option>
                    </select>
                </div>
                
                <hr class="sysHR">
                <div class="flex-container flexGap5">
                    <label for="${Constants.ID_ICON_TYPE_DROPDOWN}">图标类型:</label>
                    <select id="${Constants.ID_ICON_TYPE_DROPDOWN}" class="text_pole transparent-select" style="width:120px;">
                        <option value="${Constants.ICON_TYPES.ROCKET}">小火箭</option>
                        <option value="${Constants.ICON_TYPES.COMMENT}">调色盘</option>
                        <option value="${Constants.ICON_TYPES.STAR}">星月</option>
                        <option value="${Constants.ICON_TYPES.BOLT}">五芒星</option>
                        <option value="${Constants.ICON_TYPES.CUSTOM}">自定义图标</option>
                    </select>
                </div>
                
                <div class="flex-container flexGap5 custom-icon-container" style="display: none; margin-top:10px;">
                    <label for="${Constants.ID_CUSTOM_ICON_URL}">自定义图标:</label>
                    <div style="display:flex; flex-grow:1; gap:5px;">
                        <input type="text" id="${Constants.ID_CUSTOM_ICON_URL}" class="text_pole" style="flex-grow:1;"
                               placeholder="支持URL、base64编码图片或SVG代码" />
                        <input type="file" id="icon-file-upload" accept="image/*" style="display:none" />
                        <button class="menu_button" style="width:auto; padding:0 10px;" 
                                onclick="document.getElementById('icon-file-upload').click()">
                            选择文件
                        </button>
                    </div>
                </div>
                
                <div class="flex-container flexGap5" style="margin:10px 0; align-items:center;">
                    <input type="checkbox" id="${Constants.ID_COLOR_MATCH_CHECKBOX}" style="margin-right:5px;" />
                    <label for="${Constants.ID_COLOR_MATCH_CHECKBOX}">
                        使用与发送按钮相匹配的颜色风格
                    </label>
                </div>
                
                <div style="display:flex; justify-content:space-between; margin-top:15px;">
                    <button id="${Constants.ID_MENU_STYLE_BUTTON}" class="menu_button" style="width:auto; padding:0 10px;">
                        <i class="fa-solid fa-palette"></i> 菜单样式
                    </button>
                    <button id="quick-reply-menu-usage-button" class="menu_button" style="width:auto; padding:0 10px;">
                        <i class="fa-solid fa-circle-info"></i> 使用说明
                    </button>
                    <button id="qr-save-settings" class="menu_button" style="width:auto; padding:0 10px;" onclick="window.quickReplyMenu.saveSettings()">
                        <i class="fa-solid fa-floppy-disk"></i> 保存设置
                    </button>
                </div>
                
                <hr class="sysHR">
                <div id="qr-save-status" style="text-align: center; color: #4caf50; height: 20px; margin-top: 5px;"></div>
            </div>
        </div>
    </div>${stylePanel}${usagePanel}`;
}

/**
 * 处理使用说明按钮点击
 */
export function handleUsageButtonClick() {
    // 检查是否已存在使用说明面板
    let usagePanel = document.getElementById(Constants.ID_USAGE_PANEL);
    
    // 如果不存在，则创建面板
    if (!usagePanel) {
        usagePanel = document.createElement('div');
        usagePanel.id = Constants.ID_USAGE_PANEL;
        usagePanel.className = 'qr-usage-panel';
        usagePanel.innerHTML = `
            <div style="margin-bottom:7px;">
                <h3 style="color: white; font-weight: bold; margin: 0 0 7px 0;">使用说明</h3>
            </div>
            
            <div class="quick-reply-usage-content">
                <p><strong>该插件主要提供以下基本功能：</strong></p>
                <ul>
                    <li>通过点击发送按钮旁边的小图标，快速打开或关闭快捷回复菜单。</li>
                    <li>支持两种快捷回复类型：“聊天快捷回复”（针对当前聊天）和“全局快捷回复”（适用于所有聊天），方便分类管理。</li>
                </ul>
            
                <p><strong>以下是关于插件的详细设置</strong></p>
            
                <p><strong>首先，在基本设置中，你可以：</strong></p>
                <ul>
                    <li>选择“启用”或“禁用”来控制插件的整体开关状态。</li>
                    <li>选择显示在发送按钮旁边的图标样式，可选项包括：
                        <ul>
                            <li>小火箭（默认）</li>
                            <li>调色盘</li>
                            <li>星月</li>
                            <li>五芒星</li>
                            <li>自定义图标</li>
                        </ul>
                    </li>
                </ul>
            
                <p><strong>其次，在图标设置部分：</strong></p>
                <ul>
                    <li>可以点击“预览”按钮查看当前所选图标的效果。</li>
                    <li>若选择“自定义图标”，可以通过以下方式设置：
                        <ul>
                            <li>输入图标的URL（如使用图床）或其base64编码。</li>
                            <li>输入SVG代码（适用于SVG图标）。</li>
                            <li>点击“选择文件”上传本地图片（支持png, jpg, svg等常见格式）。</li>
                        </ul>
                    </li>
                    <li>可以勾选“使用与发送按钮相匹配的颜色风格”，让图标颜色自动适配发送按钮（目前此功能尚有瑕疵，待修复）。</li>
                </ul>
            
                <p><strong>然后，你可以通过点击“菜单样式”按钮，来自定义快捷回复菜单的外观：</strong></p>
                <ul>
                    <li><strong>菜单项样式：</strong>
                        <ul>
                            <li>设置菜单项的背景颜色和透明度（通过滑动条调节）。</li>
                            <li>设置菜单项的文字颜色。</li>
                        </ul>
                    </li>
                    <li><strong>标题样式：</strong>
                        <ul>
                            <li>设置标题文字的颜色。</li>
                            <li>设置分割线的颜色。</li>
                        </ul>
                    </li>
                    <li><strong>其他样式设置：</strong>
                        <ul>
                            <li>设置无快捷回复项时提示文字的颜色。</li>
                            <li>设置整个菜单面板的背景颜色、透明度和边框颜色。</li>
                        </ul>
                    </li>
                </ul>
            
                <p><strong>调整样式后，有两个控制按钮可供使用：</strong></p>
                <ul>
                    <li>恢复默认：将所有样式设置还原为初始状态。</li>
                    <li>应用样式：保存并应用当前的样式修改。</li>
                </ul>
            
                <p><strong>这里有一些使用这款插件的小技巧：</strong></p>
                <ul>
                    <li>点击菜单外部的任意区域可以关闭菜单。</li>
                    <li>你可以通过更改图标类型和颜色，使其更好地匹配你的界面主题。</li>
                    <li>对于经常在各种聊天中使用的回复，建议添加到“全局快捷回复”中。</li>
                    <li>对于只在特定聊天场景下使用的回复，则更适合添加到“聊天快捷回复”中。</li>
                </ul>
            
                <p><strong>最后是关于数据保存：</strong></p>
                <p>完成所有配置（包括样式设置）后，记得点击“保存设置”按钮来手动保存，以确保你的设置不会丢失。另外，如果你需要SVG图标素材，可以考虑访问 Font Awesome 网站 (fontawesome.com/search) 查找免费图标，或者自己下载、制作SVG图标。</p>
            </div>
            
            <div style="text-align:center; margin-top:10px;">
                <button class="menu_button" id="${Constants.ID_USAGE_PANEL}-close" style="width:auto; padding:0 10px;">
                    确定
                </button>
            </div>
        `;
        
        // 将面板添加到body中
        document.body.appendChild(usagePanel);
        
        // 添加关闭按钮事件监听器
        const closeButton = document.getElementById(`${Constants.ID_USAGE_PANEL}-close`);
        if (closeButton) {
            closeButton.addEventListener('click', closeUsagePanel);
        }
    }
    
    // 显示面板
    usagePanel.style.display = 'block';
    
    // 计算并设置面板位置
    const windowHeight = window.innerHeight;
    const panelHeight = usagePanel.offsetHeight;
    
    // 计算垂直位置，确保面板完全在可视区域内
    const topPosition = Math.max(50, windowHeight * 0.3);
    usagePanel.style.top = `${topPosition}px`;
    usagePanel.style.transform = 'translateX(-50%)';
}

/**
 * 关闭使用说明面板
 */
export function closeUsagePanel() {
    const usagePanel = document.getElementById(Constants.ID_USAGE_PANEL);
    if (usagePanel) {
        usagePanel.style.display = 'none';
    }
}

// 统一处理设置变更的函数
export function handleSettingsChange(event) {
    const settings = extension_settings[Constants.EXTENSION_NAME];
    
    // 处理不同控件的设置变更
    if (event.target.id === Constants.ID_SETTINGS_ENABLED_DROPDOWN) {
        const enabled = event.target.value === 'true';
        settings.enabled = enabled;
        
        // 更新body类控制显示状态
        document.body.classList.remove('qra-enabled', 'qra-disabled');
        document.body.classList.add(enabled ? 'qra-enabled' : 'qra-disabled');
        
        // 更新火箭按钮显示
        const rocketButton = document.getElementById(Constants.ID_ROCKET_BUTTON);
        if (rocketButton) {
            rocketButton.style.display = enabled ? 'flex' : 'none';
        }
    } 
    else if (event.target.id === Constants.ID_ICON_TYPE_DROPDOWN) {
        // 图标类型下拉框变更
        settings.iconType = event.target.value;
        
        // 显示/隐藏自定义图标输入
        const customIconContainer = document.querySelector('.custom-icon-container');
        if (customIconContainer) {
            customIconContainer.style.display = 
                settings.iconType === Constants.ICON_TYPES.CUSTOM ? 'flex' : 'none';
        }
    } 
    else if (event.target.id === Constants.ID_CUSTOM_ICON_URL) {
        // 自定义图标URL输入
        settings.customIconUrl = event.target.value;
    } 
    else if (event.target.id === Constants.ID_COLOR_MATCH_CHECKBOX) {
        // 颜色匹配复选框
        settings.matchButtonColors = event.target.checked;
    }
    
    // 更新火箭按钮图标
    const updateButtonFunction = window.updateIconDisplay || updateIconDisplay;
    if (typeof updateButtonFunction === 'function') {
        try {
            updateButtonFunction();
        } catch (e) {
            console.error(`[${Constants.EXTENSION_NAME}] 更新图标失败:`, e);
        }
    }
    
    // 保存设置
    if (typeof window.quickReplyMenu !== 'undefined' && window.quickReplyMenu.saveSettings) {
        window.quickReplyMenu.saveSettings();
    } else {
        saveSettings();
    }
}

// 保存设置
function saveSettings() {
    // 确保所有设置都已经更新到 extension_settings 对象
    const settings = extension_settings[Constants.EXTENSION_NAME];
    
    // 从 DOM 元素获取最新值
    const enabledDropdown = document.getElementById(Constants.ID_SETTINGS_ENABLED_DROPDOWN);
    const iconTypeDropdown = document.getElementById(Constants.ID_ICON_TYPE_DROPDOWN);
    const customIconUrl = document.getElementById(Constants.ID_CUSTOM_ICON_URL);
    const colorMatchCheckbox = document.getElementById(Constants.ID_COLOR_MATCH_CHECKBOX);
    
    if (enabledDropdown) settings.enabled = enabledDropdown.value === 'true';
    if (iconTypeDropdown) settings.iconType = iconTypeDropdown.value;
    if (customIconUrl) settings.customIconUrl = customIconUrl.value;
    if (colorMatchCheckbox) settings.matchButtonColors = colorMatchCheckbox.checked;
    
    // 保存设置
    if (typeof context !== 'undefined' && context.saveExtensionSettings) {
        try {
            context.saveExtensionSettings();
            console.log(`[${Constants.EXTENSION_NAME}] 设置已保存成功`);
            return true;
        } catch (error) {
            console.error(`[${Constants.EXTENSION_NAME}] 保存设置失败:`, error);
            return false;
        }
    } else {
        // 模拟保存
        console.log(`[${Constants.EXTENSION_NAME}] 设置已更新（模拟保存）`);
        localStorage.setItem(`${Constants.EXTENSION_NAME}_settings`, JSON.stringify(settings));
        return true;
    }
}

/**
 * 设置事件监听器
 */
export function setupSettingsEventListeners() {
    // 使用说明按钮监听器
    const usageButton = document.getElementById('quick-reply-menu-usage-button');
    if (usageButton) {
        usageButton.addEventListener('click', handleUsageButtonClick);
    }
    
    // 使用说明面板关闭按钮监听器
    const usageCloseButton = document.getElementById(`${Constants.ID_USAGE_PANEL}-close`);
    if (usageCloseButton) {
        usageCloseButton.addEventListener('click', closeUsagePanel);
    }
    
    // 文件上传监听器
    const fileUpload = document.getElementById('icon-file-upload');
    if (fileUpload) {
        fileUpload.addEventListener('change', handleFileUpload);
    }
    
    // 添加保存按钮监听器
    const saveButton = document.getElementById('qr-save-settings');
    if (saveButton) {
        saveButton.addEventListener('click', () => {
            saveSettings();
            // 显示保存成功提示
            const settings = extension_settings[Constants.EXTENSION_NAME];
            // 更新图标显示
            updateIconDisplay();
            
            // 显示保存成功的临时提示
            saveButton.innerHTML = '<i class="fa-solid fa-check"></i> 已保存';
            saveButton.style.backgroundColor = '#4caf50';
            setTimeout(() => {
                saveButton.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> 保存设置';
                saveButton.style.backgroundColor = '';
            }, 2000);
        });
    }
}

/**
 * 处理文件上传事件
 * @param {Event} event 文件上传事件
 */
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const customIconUrl = document.getElementById(Constants.ID_CUSTOM_ICON_URL);
        if (customIconUrl) {
            customIconUrl.value = e.target.result; // 将文件转为base64
            
            // 更新设置
            const settings = extension_settings[Constants.EXTENSION_NAME];
            settings.customIconUrl = e.target.result;
            
            // 更新图标显示
            updateIconDisplay();
            
            // 保存设置
            saveSettings();
        }
    };
    reader.readAsDataURL(file);
}

/**
 * Loads initial settings and applies them.
 */
export function loadAndApplySettings() {
    // 确保设置对象存在并设置默认值
    const settings = extension_settings[Constants.EXTENSION_NAME] = extension_settings[Constants.EXTENSION_NAME] || {};
    
    // 设置默认值
    settings.enabled = settings.enabled !== false; // 默认启用
    settings.iconType = settings.iconType || Constants.ICON_TYPES.ROCKET; // 默认火箭图标
    settings.customIconUrl = settings.customIconUrl || ''; // 默认空URL
    settings.matchButtonColors = settings.matchButtonColors !== false; // 默认匹配颜色

    // 应用设置到UI元素
    const dropdown = sharedState.domElements.settingsDropdown;
    if (dropdown) {
        dropdown.value = String(settings.enabled);
    }
    
    // 设置图标类型下拉框
    const iconTypeDropdown = document.getElementById(Constants.ID_ICON_TYPE_DROPDOWN);
    if (iconTypeDropdown) {
        iconTypeDropdown.value = settings.iconType;
        
        // 显示或隐藏自定义图标URL输入框
        const customIconContainer = document.querySelector('.custom-icon-container');
        if (customIconContainer) {
            customIconContainer.style.display = settings.iconType === Constants.ICON_TYPES.CUSTOM ? 'flex' : 'none';
        }
    }
    
    // 设置自定义图标URL
    const customIconUrl = document.getElementById(Constants.ID_CUSTOM_ICON_URL);
    if (customIconUrl) {
        customIconUrl.value = settings.customIconUrl;
    }
    
    // 设置颜色匹配复选框
    const colorMatchCheckbox = document.getElementById(Constants.ID_COLOR_MATCH_CHECKBOX);
    if (colorMatchCheckbox) {
        colorMatchCheckbox.checked = settings.matchButtonColors;
    }
    
    // 设置文件上传事件监听器
    setupSettingsEventListeners();
    
    // 如果禁用则隐藏按钮
    if (!settings.enabled && sharedState.domElements.rocketButton) {
        sharedState.domElements.rocketButton.style.display = 'none';
    }

    // 更新图标显示
    updateIconDisplay();

    console.log(`[${Constants.EXTENSION_NAME}] Settings loaded and applied.`);
}
