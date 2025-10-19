import { escapeHtml } from './utils.js';

function createTutorCard(t){
  const el = document.createElement('div');
  el.className = 'card tutor';
  el.setAttribute('role', 'listitem');
  const photo = t.photo || 'assets/images/avatar-placeholder.png';
  el.innerHTML = `
    <img loading="lazy" src="${photo}" alt="${escapeHtml(t.name)}">
    <div>
      <h3>${escapeHtml(t.name)}</h3>
      <p class="muted">${escapeHtml((t.subjects || []).join(', '))}</p>
      <p class="muted">Rating: ${t.rating} ⭐</p>
    </div>
  `;
  return el;
}

export async function initTutors(tutorsConfig){
  const grid = document.getElementById('tutors-grid');
  if(!grid) return;
  
  try {
    const tutors = tutorsConfig?.tutors || [];
    grid.innerHTML = '';
    
    if (tutors.length === 0) {
      grid.innerHTML = '<p class="muted">No tutors available.</p>';
      return;
    }
    
    tutors.forEach(t => grid.appendChild(createTutorCard(t)));
  } catch(e){
    grid.innerHTML = '<p class="muted">Failed to load tutors.</p>';
    console.error(e);
  }
}
