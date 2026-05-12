document.addEventListener('click', e => {
    const link = e.target.closest('a');
    if (!link) return;
    
    // Ignorer les liens externes
    if (link.host && link.host !== window.location.host) return;
    if (link.getAttribute('target') === '_blank') return;
    
    const href = link.getAttribute('href');
    // Ignorer les ancres pures
    if (!href || href.startsWith('#')) return;
    
    e.preventDefault();
    const url = link.href;
    
    // Ne pas recharger si c'est la même page (sans ancre)
    if (url.split('#')[0] === window.location.href.split('#')[0]) {
        if(url.includes('#')) {
            window.location.hash = url.split('#')[1];
        }
        return;
    }
    
    loadPage(url);
});

window.addEventListener('popstate', () => {
    loadPage(window.location.href, true);
});

async function loadPage(url, isPopState = false) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Fetch failed");
        
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const newContent = doc.getElementById('app-content');
        if (newContent) {
            if (!isPopState) {
                history.pushState(null, '', url);
            }
            
            const currentContent = document.getElementById('app-content');
            
            // --- Swap page-specific <style> tags from <head> ---
            // Remove previously injected page styles
            document.querySelectorAll('style[data-spa-page]').forEach(s => s.remove());
            // Inject new page's <style> tags (skip shared theme.css etc.)
            doc.querySelectorAll('head style').forEach(style => {
                const clone = document.createElement('style');
                clone.setAttribute('data-spa-page', 'true');
                clone.textContent = style.textContent;
                document.head.appendChild(clone);
            });

            // Appliquer une animation de sortie rapide
            currentContent.style.opacity = '0';
            currentContent.style.transform = 'translateY(10px)';
            currentContent.style.transition = 'all 0.3s ease';
            
            setTimeout(() => {
                currentContent.innerHTML = newContent.innerHTML;
                
                // Update title
                document.title = doc.title;
                
                // Update active nav link
                document.querySelectorAll('.nav-link').forEach(nav => {
                    nav.classList.remove('active');
                    if (nav.href === url || url.endsWith(nav.getAttribute('href'))) {
                        nav.classList.add('active');
                    }
                });

                // Execute scripts inside app-content
                const scripts = currentContent.querySelectorAll('script');
                scripts.forEach(oldScript => {
                    const newScript = document.createElement('script');
                    Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                    newScript.appendChild(document.createTextNode(oldScript.innerHTML));
                    oldScript.parentNode.replaceChild(newScript, oldScript);
                });
                
                // Scroll to top and animate in
                window.scrollTo(0, 0);
                currentContent.style.opacity = '1';
                currentContent.style.transform = 'translateY(0)';
            }, 300);
            
        } else {
            window.location.assign(url); // Fallback
        }
    } catch (e) {
        // Fallback sur erreur (ex: CORS en local avec file://)
        window.location.assign(url);
    }
}
