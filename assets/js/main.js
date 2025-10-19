import { ConfigLoader } from './config-loader.js';
import { CONFIG } from './config/settings.js';

async function initializeApp() {
  try {
    const config = await ConfigLoader.loadAll();
    ConfigLoader.applySiteSettings(config.site);
    
    initNavGCButtons();
    initLazyImages();
    await loadPageSpecificContent(config);
    
  } catch (error) {
    console.error('Error initializing app:', error);
  }
}

function openGoogleClassroomShare(url){
  if(!url) url = window.location.href;
  const shareUrl = CONFIG.GOOGLE_CLASSROOM_SHARE_BASE + encodeURIComponent(url);
  window.open(shareUrl, '_blank', 'noopener,noreferrer');
}

function initNavGCButtons(){
  const btn = document.getElementById('gc-nav-btn') || document.getElementById('gc-nav-btn-2');
  if(btn) btn.addEventListener('click', ()=> openGoogleClassroomShare(window.location.href));
}

function initLazyImages(){
  if('IntersectionObserver' in window){
    const imgs = document.querySelectorAll('img[loading="lazy"]');
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if(e.isIntersecting){
          const img = e.target;
          if(img.dataset.src){
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          io.unobserve(img);
        }
      });
    }, {rootMargin: '200px'});
    imgs.forEach(i => io.observe(i));
  }
}

async function loadPageSpecificContent(config) {
  try {
    if(document.getElementById('classes-grid')){
      const module = await import('./classes.js');
      module.initClasses(config.courses, config.tutors);
    }
    if(document.getElementById('tutors-grid') && !document.querySelector('main.enroll-page')){
      const module = await import('./tutors.js');
      module.initTutors(config.tutors);
    }
    if(document.getElementById('class-summary') || document.getElementById('jotform-embed')){
      const module = await import('./enroll.js');
      module.initEnrollPage(config.courses, config.payments);
    }
    if(document.getElementById('featured-grid')){
      const module = await import('./classes.js');
      if(module.loadFeatured) module.loadFeatured(config.courses, config.tutors);
    }
  } catch(err){
    console.error('Error loading page modules', err);
  }
}

document.addEventListener('DOMContentLoaded', initializeApp);

window.Edubridge = {
  openGoogleClassroomShare
};
