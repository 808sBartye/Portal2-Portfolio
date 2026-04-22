import ViewsManager from './ViewsManager.js';

const viewsManager = new ViewsManager();

function initMenu() {
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
        const indicator = item.querySelector('.menu-indicator');
        const label = item.querySelector('.menu-label');
        const targetView = item.dataset.view;
        
        item.addEventListener('mouseenter', () => {
            gsap.to(indicator, {
                opacity: 1,
                x: 0,
                duration: 0.15,
                ease: "power2.out"
            });
            
            gsap.to(label, {
                color: '#ffffff',
                duration: 0.15,
                ease: "power2.out"
            });
        });
        
        item.addEventListener('mouseleave', () => {
            gsap.to(indicator, {
                opacity: 0,
                x: -10,
                duration: 0.15,
                ease: "power2.in"
            });
            
            gsap.to(label, {
                color: '#a0a0a0',
                duration: 0.15,
                ease: "power2.in"
            });
        });
        
        item.addEventListener('click', () => {
            viewsManager.transitionTo(targetView);
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const debug = document.getElementById('debug-info');
    
    console.log('DOM loaded, initializing menu...');
    initMenu();
    
    const gsapLoaded = typeof gsap !== 'undefined';
    if (debug) debug.innerHTML = `GSAP: ${gsapLoaded ? 'OK' : 'FAIL'}<br>`;
    
    const video = document.getElementById('bg-video');
    if (video) {
        video.addEventListener('loadeddata', () => {
            console.log('Video loaded');
            if (debug) debug.innerHTML += 'Video: loaded<br>';
        });
        video.addEventListener('error', (e) => {
            console.error('Video error:', e);
            if (debug) debug.innerHTML += 'Video: ERROR<br>';
        });
        video.addEventListener('playing', () => {
            console.log('Video playing');
            if (debug) debug.innerHTML += 'Video: playing<br>';
        });
        if (debug) debug.innerHTML += `Video paused: ${video.paused}<br>`;
    } else {
        if (debug) debug.innerHTML += 'Video: NOT FOUND<br>';
    }
});
