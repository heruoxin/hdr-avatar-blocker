// ==UserScript==
// @name         HDR Avatar Blocker
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Disables HDR for small images (like avatars) by applying a CSS filter
// @author       Claude 4 Sonnet
// @match        *://*/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    // 默认尺寸阈值
    let sizeThreshold = GM_getValue('sizeThreshold', 160);

    // 注册菜单命令来配置设置
    GM_registerMenuCommand('设置尺寸阈值', function () {
        const newThreshold = prompt('请输入图片尺寸阈值（像素）：\n小于此尺寸的图片将禁用 HDR', sizeThreshold);
        if (newThreshold !== null && !isNaN(newThreshold) && newThreshold > 0) {
            sizeThreshold = parseInt(newThreshold, 10);
            GM_setValue('sizeThreshold', sizeThreshold);
            alert('保存成功！请手动刷新页面。');
        }
    });

    GM_registerMenuCommand('重置为默认设置', function () {
        sizeThreshold = 160;
        GM_setValue('sizeThreshold', sizeThreshold);
        alert('已重置为默认设置（160px）！刷新页面生效。');
    });

    // 应用 HDR 滤镜的函数
    function applyHdrFilter(img) {
        // 检查图片的渲染尺寸是否小于阈值
        if (
            img.clientWidth > 0 &&
            img.clientHeight > 0 &&
            img.clientWidth < sizeThreshold &&
            img.clientHeight < sizeThreshold
        ) {
            img.style.filter = 'contrast(100%) saturate(100%)';
        }
    }

    // 处理页面中的图片
    function processImages() {
        document.querySelectorAll('img').forEach((img) => {
            if (img.complete) {
                // 如果图片已经加载完成，立即处理
                applyHdrFilter(img);
            } else {
                // 否则等待加载完成
                img.addEventListener('load', () => applyHdrFilter(img), { once: true });
            }
        });
    }

    // 在页面初始加载时运行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', processImages);
    } else {
        processImages();
    }

    // 使用 MutationObserver 检测后续添加到 DOM 的图片
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                // 只处理元素节点
                if (node.nodeType === Node.ELEMENT_NODE) {
                    // 检查添加的节点是否为图片
                    if (node.tagName === 'IMG') {
                        const img = node;
                        if (img.complete) {
                            applyHdrFilter(img);
                        } else {
                            img.addEventListener('load', () => applyHdrFilter(img), { once: true });
                        }
                    }
                    // 检查添加的节点是否包含图片
                    else {
                        node.querySelectorAll('img').forEach((img) => {
                            if (img.complete) {
                                applyHdrFilter(img);
                            } else {
                                img.addEventListener('load', () => applyHdrFilter(img), { once: true });
                            }
                        });
                    }
                }
            }
        }
    });

    // 开始观察文档根元素的子节点变化
    observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
    });
})();
