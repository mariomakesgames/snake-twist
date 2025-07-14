// Canvas尺寸修复脚本
(function() {
    'use strict';
    
    // 等待DOM加载完成
    function waitForCanvas() {
        const canvas = document.querySelector('#gameCanvas canvas');
        if (canvas) {
            fixCanvasSize(canvas);
            observeCanvasChanges();
        } else {
            setTimeout(waitForCanvas, 100);
        }
    }
    
    // 修复canvas尺寸
    function fixCanvasSize(canvas) {
        console.log('Fixing canvas size...');
        
        // 设置固定尺寸
        canvas.style.width = '600px';
        canvas.style.height = '600px';
        canvas.style.minWidth = '600px';
        canvas.style.minHeight = '600px';
        canvas.style.maxWidth = '600px';
        canvas.style.maxHeight = '600px';
        canvas.style.display = 'block';
        canvas.style.margin = '0 auto';
        
        // 设置容器尺寸
        const container = document.getElementById('gameCanvas');
        if (container) {
            container.style.width = '600px';
            container.style.height = '600px';
            container.style.minWidth = '600px';
            container.style.minHeight = '600px';
            container.style.maxWidth = '600px';
            container.style.maxHeight = '600px';
            container.style.display = 'flex';
            container.style.justifyContent = 'center';
            container.style.alignItems = 'center';
            container.style.overflow = 'hidden';
        }
        
        console.log('Canvas size fixed');
    }
    
    // 监听canvas变化
    function observeCanvasChanges() {
        const canvas = document.querySelector('#gameCanvas canvas');
        if (!canvas) return;
        
        // 创建MutationObserver来监听DOM变化
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && 
                    (mutation.attributeName === 'style' || mutation.attributeName === 'width' || mutation.attributeName === 'height')) {
                    // 延迟修复，确保Phaser的设置完成
                    setTimeout(() => fixCanvasSize(canvas), 50);
                }
            });
        });
        
        // 开始监听
        observer.observe(canvas, {
            attributes: true,
            attributeFilter: ['style', 'width', 'height']
        });
        
        // 监听窗口大小变化
        window.addEventListener('resize', function() {
            setTimeout(() => fixCanvasSize(canvas), 100);
        });
        
        console.log('Canvas observer started');
    }
    
    // 移动端适配
    function handleMobileResize() {
        if (window.innerWidth <= 768) {
            const canvas = document.querySelector('#gameCanvas canvas');
            const container = document.getElementById('gameCanvas');
            
            if (canvas && container) {
                const maxWidth = Math.min(600, window.innerWidth - 40);
                const size = Math.min(maxWidth, window.innerHeight - 200);
                
                canvas.style.width = size + 'px';
                canvas.style.height = size + 'px';
                canvas.style.minWidth = size + 'px';
                canvas.style.minHeight = size + 'px';
                canvas.style.maxWidth = size + 'px';
                canvas.style.maxHeight = size + 'px';
                
                container.style.width = size + 'px';
                container.style.height = size + 'px';
                container.style.minWidth = size + 'px';
                container.style.minHeight = size + 'px';
                container.style.maxWidth = size + 'px';
                container.style.maxHeight = size + 'px';
            }
        }
    }
    
    // 初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(waitForCanvas, 100);
            window.addEventListener('resize', handleMobileResize);
        });
    } else {
        setTimeout(waitForCanvas, 100);
        window.addEventListener('resize', handleMobileResize);
    }
    
    // 定期检查canvas尺寸
    setInterval(function() {
        const canvas = document.querySelector('#gameCanvas canvas');
        if (canvas) {
            const computedStyle = window.getComputedStyle(canvas);
            const width = parseInt(computedStyle.width);
            const height = parseInt(computedStyle.height);
            
            if (width !== 600 || height !== 600) {
                console.log('Canvas size changed, fixing...', width, height);
                fixCanvasSize(canvas);
            }
        }
    }, 1000);
    
})(); 