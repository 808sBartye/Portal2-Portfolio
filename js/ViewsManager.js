class ViewsManager {
    constructor() {
        this.currentView = 'menu';
        this.views = {
            menu: document.getElementById('view-menu'),
            education: document.getElementById('view-education'),
            projects: document.getElementById('view-projects'),
            social: document.getElementById('view-social')
        };
        this.isTransitioning = false;
    }

    transitionTo(viewName) {
        if (this.isTransitioning || viewName === this.currentView) return;
        
        this.isTransitioning = true;
        const currentViewEl = this.views[this.currentView];
        const targetViewEl = this.views[viewName];
        
        if (!targetViewEl) {
            console.warn(`View "${viewName}" not found`);
            this.isTransitioning = false;
            return;
        }

        gsap.to(currentViewEl, {
            opacity: 0,
            duration: 0.5,
            ease: "power2.inOut",
            onComplete: () => {
                currentViewEl.classList.remove('active');
                currentViewEl.style.display = 'none';
                
                targetViewEl.style.display = 'block';
                targetViewEl.classList.add('active');
                
                gsap.fromTo(targetViewEl, 
                    { opacity: 0 },
                    { opacity: 1, duration: 0.5, ease: "power2.out", onComplete: () => {
                        this.currentView = viewName;
                        this.isTransitioning = false;
                    }}
                );
            }
        });
    }

    getCurrentView() {
        return this.currentView;
    }
}

export default ViewsManager;
