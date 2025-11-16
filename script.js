// notes app script — single clean copy
const NOTES_KEY = 'notesApp.notes';
let notes = JSON.parse(localStorage.getItem(NOTES_KEY) || '[]');
const grid = document.getElementById('grid');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const newNoteBtn = document.getElementById('newNoteBtn');
const editorOverlay = document.getElementById('editorOverlay');
const titleInput = document.getElementById('titleInput');
const bodyInput = document.getElementById('bodyInput');
const dateTimeStamp = document.getElementById('dateTimeStamp');
const saveNoteBtn = document.getElementById('saveNoteBtn');
const closeEditorBtn = document.getElementById('closeEditorBtn');
const cancelEditorBtn = document.getElementById('cancelEditorBtn');
let editingId = null;
function saveNotes() { localStorage.setItem(NOTES_KEY, JSON.stringify(notes)); }
function formatDateTime(ts = Date.now()) {
  const d = new Date(ts);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2,'0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${day} ${month} ${year} • ${hours}:${minutes} ${ampm}`;
}
function render() {
  const q = (searchInput.value || '').trim().toLowerCase();
  const visible = notes.filter(n => {
    const t = (n.title || '').toLowerCase();
    const b = (n.content || '').toLowerCase();
    return t.includes(q) || b.includes(q);
  });
  renderNotes(visible);
}
function renderNotes(list) {
  grid.innerHTML = '';
  if (!list.length) { emptyState.style.display = 'block'; }
  else { emptyState.style.display = 'none'; }
  list.forEach(note => {
    const card = document.createElement('div');
    card.className = 'note-card';
    const title = document.createElement('h3'); title.className = 'note-title'; title.textContent = note.title || 'Untitled';
    const date = document.createElement('div'); date.className = 'note-date'; date.textContent = formatDateTime(note.updated || note.created);
    const body = document.createElement('div'); body.className = 'note-body'; body.textContent = (note.content || '').slice(0,200);
    const actions = document.createElement('div'); actions.style.marginTop = '12px'; actions.style.display = 'flex'; actions.style.gap = '8px';
    const openBtn = document.createElement('button'); openBtn.className = 'btn'; openBtn.textContent = 'Open'; openBtn.addEventListener('click', (e) => { e.stopPropagation(); openEditor(note.id); });
    const del = document.createElement('button'); del.className = 'btn'; del.textContent = 'Delete'; del.addEventListener('click', (e) => { e.stopPropagation(); deleteNote(note.id); });
    actions.appendChild(openBtn); actions.appendChild(del);
    card.appendChild(title); card.appendChild(date); card.appendChild(body); card.appendChild(actions);
    card.addEventListener('click', () => openEditor(note.id));
    grid.appendChild(card);
  });
}
function createNote(title, content) {
  const now = Date.now();
  const note = { id: now, title: title || '', content: content || '', created: now, updated: now };
  notes.unshift(note); saveNotes(); render(); return note.id;
}
function deleteNote(id) { notes = notes.filter(n => n.id !== id); saveNotes(); render(); }
function openEditor(id = null) {
  editingId = id;
  if (id) {
    const note = notes.find(n => n.id === id) || { title:'', content:'' };
    titleInput.value = note.title; bodyInput.value = note.content; dateTimeStamp.textContent = formatDateTime(note.updated || note.created);
  } else { titleInput.value = ''; bodyInput.value = ''; dateTimeStamp.textContent = formatDateTime(); }
  editorOverlay.classList.add('active');
}
function closeEditor() { editingId = null; editorOverlay.classList.remove('active'); }
newNoteBtn.addEventListener('click', () => openEditor());
saveNoteBtn.addEventListener('click', () => {
  const title = titleInput.value.trim(); const content = bodyInput.value.trim();
  if (editingId) {
    const note = notes.find(n => n.id === editingId); if (note) { note.title = title; note.content = content; note.updated = Date.now(); }
  } else { createNote(title, content); }
  saveNotes(); closeEditor(); render();
});
closeEditorBtn.addEventListener('click', closeEditor);
cancelEditorBtn.addEventListener('click', closeEditor);
searchInput.addEventListener('input', render);
render();
