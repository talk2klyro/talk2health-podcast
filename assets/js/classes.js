import { formatCurrency, debounce, escapeHtml } from './utils.js';
import { CONFIG } from './config/settings.js';

function createClassCard(c, tutor){
  const card = document.createElement('article');
  card.className = 'card';
  card.setAttribute('role', 'listitem');
  
  const tutorName = tutor?.name || 'Tutor';
  const classroomUrl = c.classroomUrl || '';
  
  card.innerHTML = `
    <div class="meta">
      <div>
        <h3>${escapeHtml(c.title)}</h3>
        <p class="muted">${escapeHtml(tutorName)} • ${escapeHtml(c.schedule)}</p>
      </div>
      <div class="price">${formatCurrency(c.price)}</div>
    </div>
    <p class="muted">${escapeHtml(c.short || c.description)}</p>
    <div class="actions">
      <a class="btn btn-primary" href="enroll.html?classId=${encodeURIComponent(c.id)}&amount=${encodeURIComponent(c.price)}">Enroll</a>
      <button class="btn btn-outline gc-btn" data-url="${escapeHtml(classroomUrl)}">Google Classroom</button>
    </div>
  `;
  
  card.querySelector('.gc-btn').addEventListener('click', (e)=>{
    const url = e.currentTarget.dataset.url;
    if(!url) return alert('No Google Classroom URL configured for this class.');
    window.Edubridge?.openGoogleClassroomShare(url);
  });
  
  return card;
}

export async function loadFeatured(coursesConfig, tutorsConfig){
  const target = document.getElementById('featured-grid');
  if(!target) return;
  
  try {
    const courses = coursesConfig?.courses || [];
    const tutors = tutorsConfig?.tutors || [];
    const featuredIds = coursesConfig?.featured || [1, 2, 3];
    
    target.innerHTML = '';
    
    const featuredCourses = courses.filter(c => featuredIds.includes(c.id)).slice(0, 3);
    
    if (featuredCourses.length === 0) {
      target.innerHTML = '<p class="muted">No featured classes available.</p>';
      return;
    }
    
    featuredCourses.forEach(c => {
      const tutor = tutors.find(t => t.id === c.tutorId);
      target.appendChild(createClassCard(c, tutor));
    });
    
  } catch(e){
    console.error(e);
    target.innerHTML = '<p class="muted">Failed to load featured classes.</p>';
  }
}

export async function initClasses(coursesConfig, tutorsConfig){
  const grid = document.getElementById('classes-grid');
  const searchEl = document.getElementById('search');
  if(!grid) return;
  
  try {
    const courses = coursesConfig?.courses || [];
    const tutors = tutorsConfig?.tutors || [];
    
    function render(list){
      grid.innerHTML = '';
      if (list.length === 0) {
        grid.innerHTML = '<p class="muted">No classes found.</p>';
        return;
      }
      list.forEach(c => {
        const tutor = tutors.find(t => t.id === c.tutorId);
        grid.appendChild(createClassCard(c, tutor));
      });
    }
    
    render(courses);

    if(searchEl){
      const onInput = debounce(()=> {
        const q = searchEl.value.trim().toLowerCase();
        if(!q) return render(courses);
        const filtered = courses.filter(c => 
          (c.title + ' ' + (tutors.find(t => t.id === c.tutorId)?.name || '') + ' ' + c.subject).toLowerCase().includes(q)
        );
        render(filtered);
      }, 200);
      searchEl.addEventListener('input', onInput);
    }
  } catch(e){
    grid.innerHTML = '<p class="muted">Failed to load classes.</p>';
    console.error(e);
  }
}
