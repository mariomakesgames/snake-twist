// Canvas size fix script
(function() {
    'use strict';
    
    // Wait for DOM to load
    function waitForCanvas() {
        const canvas = document.querySelector('#gameCanvas canvas');
        if (canvas) {
            fixCanvasSize(canvas);
            observeCanvasChanges();
        } else {
            setTimeout(waitForCanvas, 100);
        }
    }
    
    // Fix canvas size
    function fixCanvasSize(canvas) {
        console.log('Fixing canvas size...');
        
        // Set fixed size
        canvas.style.width = '600px';
        canvas.style.height = '800px';
        canvas.style.minWidth = '600px';
        canvas.style.minHeight = '800px';
        canvas.style.maxWidth = '600px';
        canvas.style.maxHeight = '800px';
        canvas.style.display = 'block';
        canvas.style.margin = '0 auto';
        
        // Set container size
        const container = document.getElementById('gameCanvas');
        if (container) {
            container.style.width = '600px';
            container.style.height = '800px';
            container.style.minWidth = '600px';
            container.style.minHeight = '800px';
            container.style.maxWidth = '600px';
            container.style.maxHeight = '800px';
            container.style.display = 'flex';
            container.style.justifyContent = 'center';
            container.style.alignItems = 'center';
            container.style.overflow = 'hidden';
        }
        
        console.log('Canvas size fixed');
    }
    
    // Observe canvas changes
    function observeCanvasChanges() {
        const canvas = document.querySelector('#gameCanvas canvas');
        if (!canvas) return;
        
        // Create MutationObserver to watch DOM changes
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && 
                    (mutation.attributeName === 'style' || mutation.attributeName === 'width' || mutation.attributeName === 'height')) {
                    // Delay fix to ensure Phaser's settings are applied
                    setTimeout(() => fixCanvasSize(canvas), 50);
                }
            });
        });
        
        // Start observing
        observer.observe(canvas, {
            attributes: true,
            attributeFilter: ['style', 'width', 'height']
        });
        
        // Listen for window resize
        window.addEventListener('resize', function() {
            setTimeout(() => fixCanvasSize(canvas), 100);
        });
        
        console.log('Canvas observer started');
    }
    
    // Mobile adaptation
    function handleMobileResize() {
        if (window.innerWidth <= 768) {
            const canvas = document.querySelector('#gameCanvas canvas');
            const container = document.getElementById('gameCanvas');
            
            if (canvas && container) {
                const maxWidth = Math.min(600, window.innerWidth - 40);
                const maxHeight = Math.min(800, window.innerHeight - 200);
                const width = maxWidth;
                const height = Math.min(maxHeight, width * 4/3); // Maintain 3:4 aspect ratio
                
                canvas.style.width = width + 'px';
                canvas.style.height = height + 'px';
                canvas.style.minWidth = width + 'px';
                canvas.style.minHeight = height + 'px';
                canvas.style.maxWidth = width + 'px';
                canvas.style.maxHeight = height + 'px';
                
                container.style.width = width + 'px';
                container.style.height = height + 'px';
                container.style.minWidth = width + 'px';
                container.style.minHeight = height + 'px';
                container.style.maxWidth = width + 'px';
                container.style.maxHeight = height + 'px';
            }
        }
    }
    
    // Initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(waitForCanvas, 100);
            window.addEventListener('resize', handleMobileResize);
        });
    } else {
        setTimeout(waitForCanvas, 100);
        window.addEventListener('resize', handleMobileResize);
    }
    
    // Periodically check canvas size
    setInterval(function() {
        const canvas = document.querySelector('#gameCanvas canvas');
        if (canvas) {
            const computedStyle = window.getComputedStyle(canvas);
            const width = parseInt(computedStyle.width);
            const height = parseInt(computedStyle.height);
            
            if (width !== 600 || height !== 800) {
                console.log('Canvas size changed, fixing...', width, height);
                fixCanvasSize(canvas);
            }
        }
    }, 1000);
    
})(); 