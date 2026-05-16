function updateApertureScale() {
    const viewport = document.getElementById('aperture-viewport');
    if (!viewport) return;
    
    const scale = Math.min(window.innerWidth / 1920, window.innerHeight / 876);
    viewport.style.transform = `scale(${scale})`;
}

window.addEventListener('resize', updateApertureScale);
document.addEventListener('DOMContentLoaded', updateApertureScale);
updateApertureScale();
