export class ConfigLoader {
  static async loadAll() {
    try {
      const [site, courses, tutors, payments] = await Promise.all([
        this.loadConfig('../config/site-settings.json'),
        this.loadConfig('../config/courses.json'),
        this.loadConfig('../config/tutors.json'), 
        this.loadConfig('../config/payments.json')
      ]);
      
      window.APP_CONFIG = { site, courses, tutors, payments };
      console.log('✅ All configurations loaded successfully');
      return window.APP_CONFIG;
    } catch (error) {
      console.error('❌ Failed to load configurations:', error);
      return this.getFallbackConfig();
    }
  }

  static async loadConfig(path) {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Failed to load ${path}`);
    return response.json();
  }

  static getFallbackConfig() {
    return {
      site: { 
        site: { name: 'EduBridge' }, 
        hero: { title: 'Educational Platform' },
        navigation: { links: [] }
      },
      courses: { courses: [], featured: [] },
      tutors: { tutors: [] },
      payments: { currency: '₦' }
    };
  }

  static applySiteSettings(siteConfig) {
    document.title = siteConfig.site?.name || 'Educational Platform';
    
    const brandElements = document.querySelectorAll('.brand');
    brandElements.forEach(el => {
      el.textContent = siteConfig.site?.name || 'EduBridge';
    });
    
    const heroTitle = document.getElementById('hero-heading');
    if (heroTitle && siteConfig.hero?.title) {
      heroTitle.textContent = siteConfig.hero.title;
    }
    
    const heroDesc = document.querySelector('.hero-left p');
    if (heroDesc && siteConfig.hero?.description) {
      heroDesc.textContent = siteConfig.hero.description;
    }
    
    const footerText = document.querySelector('.site-footer p');
    if (footerText && siteConfig.footer?.text) {
      const currentYear = new Date().getFullYear();
      footerText.innerHTML = siteConfig.footer.text.replace('[year]', currentYear);
    }
    
    this.updateNavigation(siteConfig.navigation);
  }

  static updateNavigation(navConfig) {
    const navElement = document.querySelector('.main-nav');
    if (!navElement || !navConfig?.links) return;
    
    const buttons = navElement.querySelectorAll('button');
    navElement.innerHTML = '';
    
    navConfig.links.forEach(link => {
      const a = document.createElement('a');
      a.href = link.url;
      a.textContent = link.name;
      navElement.appendChild(a);
    });
    
    buttons.forEach(button => navElement.appendChild(button));
    
    const gcButton = document.getElementById('gc-nav-btn') || document.getElementById('gc-nav-btn-2');
    if (gcButton) {
      gcButton.style.display = navConfig.showGoogleClassroom ? 'block' : 'none';
    }
    
    const darkModeButton = document.getElementById('toggle-dark');
    if (darkModeButton) {
      darkModeButton.style.display = navConfig.showDarkMode ? 'block' : 'none';
    }
  }
}
