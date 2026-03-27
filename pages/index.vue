<template>
  <div class="app-wrapper">
    <!-- Paper texture overlay -->
    <div class="paper-texture" aria-hidden="true" />

    <!-- Header -->
    <header class="app-header">
      <div class="header-inner">
        <div class="logo-block">
          <span class="logo-icon">🧾</span>
          <div>
            <h1 class="app-title">Hisab Notes</h1>
            <p class="app-subtitle">Your personal ledger</p>
          </div>
        </div>
        <div class="header-actions">
          <button class="btn-primary" @click="addNote">+ New Note</button>
          <button class="btn-secondary" @click="exportAll" title="Export all notes as JSON">↓ Export All</button>
        </div>
      </div>
    </header>

    <!-- Toolbar: search + filters -->
    <div class="toolbar">
      <div class="search-wrap">
        <span class="search-icon">🔍</span>
        <input
          v-model="searchQuery"
          class="search-input"
          placeholder="Search notes..."
          @input="debouncedSearch"
        />
        <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''">✕</button>
      </div>

      <div class="filter-row">
        <button
          v-for="f in filters"
          :key="f.id"
          class="filter-chip"
          :class="{ active: activeFilter === f.id }"
          @click="activeFilter = f.id"
        >
          {{ f.label }}
        </button>

        <div class="sort-wrap">
          <select v-model="sortBy" class="sort-select">
            <option value="updatedAt">Recent first</option>
            <option value="title">A → Z</option>
            <option value="color">By color</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Stats bar -->
    <div class="stats-bar">
      <span>{{ filteredNotes.length }} note{{ filteredNotes.length !== 1 ? 's' : '' }}</span>
      <span v-if="pinnedCount">· {{ pinnedCount }} pinned</span>
      <span v-if="archivedCount">· {{ archivedCount }} archived</span>
    </div>

    <!-- Empty state -->
    <div v-if="filteredNotes.length === 0" class="empty-state">
      <span class="empty-icon">📭</span>
      <p>{{ searchQuery ? 'No notes match your search.' : 'No notes yet. Click "+ New Note" to start.' }}</p>
    </div>

    <!-- Notes grid -->
    <main class="notes-grid">
      <NoteCard
        v-for="(note, index) in filteredNotes"
        :key="note._id"
        :note="note"
        :index="getRealIndex(note)"
        @save="saveNote"
        @delete="deleteNote"
      />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import NoteCard from '~/components/NoteCard.vue'

// ─── Composable: useNotes ───────────────────────────────────────────────────

function useNotes() {
  const notes = ref([])

  function load() {
    try {
      notes.value = JSON.parse(localStorage.getItem('hisabNotes')) || []
      // Back-fill _id for old notes
      notes.value.forEach((n, i) => { if (!n._id) n._id = `note_${Date.now()}_${i}` })
    } catch { notes.value = [] }
  }

  function persist() {
    localStorage.setItem('hisabNotes', JSON.stringify(notes.value))
  }

  watch(notes, persist, { deep: true })
  onMounted(load)

  function add() {
    notes.value.unshift({
      _id: `note_${Date.now()}`,
      title: '',
      body: '',
      calculationResult: null,
      color: 'default',
      tags: [],
      pinned: false,
      archived: false,
      updatedAt: Date.now(),
    })
  }

  function save(payload) {
    const { index, ...data } = payload
    if (index >= 0 && index < notes.value.length) {
      notes.value[index] = { ...notes.value[index], ...data }
    }
  }

  function remove(index) {
    notes.value.splice(index, 1)
  }

  return { notes, add, save, remove }
}

// ─── Setup ──────────────────────────────────────────────────────────────────

const { notes, add: addNote, save: saveNote, remove: deleteNote } = useNotes()

const searchQuery = ref('')
const activeFilter = ref('all')
const sortBy = ref('updatedAt')

const filters = [
  { id: 'all',      label: '📋 All' },
  { id: 'pinned',   label: '📌 Pinned' },
  { id: 'archived', label: '🗃️ Archived' },
  { id: 'tagged',   label: '🏷️ Tagged' },
]

// Debounce helper (lightweight, no lodash)
let searchTimer = null
function debouncedSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {}, 150)
}

const filteredNotes = computed(() => {
  let result = [...notes.value]

  // Filter
  if (activeFilter.value === 'pinned')   result = result.filter(n => n.pinned && !n.archived)
  if (activeFilter.value === 'archived') result = result.filter(n => n.archived)
  if (activeFilter.value === 'tagged')   result = result.filter(n => n.tags && n.tags.length > 0)
  if (activeFilter.value === 'all')      result = result.filter(n => !n.archived)

  // Search
  const q = searchQuery.value.toLowerCase().trim()
  if (q) {
    result = result.filter(n =>
      (n.title || '').toLowerCase().includes(q) ||
      (n.body  || '').toLowerCase().includes(q) ||
      (n.tags  || []).some(t => t.toLowerCase().includes(q))
    )
  }

  // Sort: pinned always first within group
  result.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    if (sortBy.value === 'title') return (a.title || '').localeCompare(b.title || '')
    if (sortBy.value === 'color') return (a.color || '').localeCompare(b.color || '')
    return (b.updatedAt || 0) - (a.updatedAt || 0)
  })

  return result
})

const pinnedCount   = computed(() => notes.value.filter(n => n.pinned && !n.archived).length)
const archivedCount = computed(() => notes.value.filter(n => n.archived).length)

// Map filtered note back to its real index in notes.value
function getRealIndex(note) {
  return notes.value.findIndex(n => n._id === note._id)
}

// Export all as JSON
function exportAll() {
  const blob = new Blob([JSON.stringify(notes.value, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `hisab_notes_${new Date().toISOString().slice(0,10)}.json`
  a.click()
}
</script>

<style>
/* Google Fonts - load in nuxt.config or add to your HTML head:
   https://fonts.googleapis.com/css2?family=Lora:wght@400;700&family=IBM+Plex+Mono:wght@400;500&display=swap
*/

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background-color: #f5ead6;
  color: #3d2e1a;
  font-family: 'Lora', Georgia, serif;
  min-height: 100vh;
}

.app-wrapper {
  position: relative;
  min-height: 100vh;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem 4rem;
}

/* Subtle paper texture via CSS */
.paper-texture {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background-image:
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 27px,
      rgba(150,120,60,0.07) 27px,
      rgba(150,120,60,0.07) 28px
    );
}

.app-wrapper > * { position: relative; z-index: 1; }

/* ── Header ── */
.app-header {
  padding: 2rem 0 1.2rem;
  border-bottom: 2px solid #c9b99a;
  margin-bottom: 1.5rem;
}

.header-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.logo-block {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-icon { font-size: 2rem; }

.app-title {
  font-family: 'Lora', Georgia, serif;
  font-size: 2rem;
  font-weight: 700;
  color: #3d2e1a;
  letter-spacing: -0.02em;
  line-height: 1;
}

.app-subtitle {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.7rem;
  color: #9a7a4a;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-top: 2px;
}

.header-actions { display: flex; gap: 0.75rem; align-items: center; }

.btn-primary {
  background: #3d2e1a;
  color: #f6e8c4;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1.2rem;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
  box-shadow: 2px 2px 0 #9a7a4a;
}

.btn-primary:hover { background: #5a3e1b; transform: translateY(-1px); }
.btn-primary:active { transform: translateY(0); }

.btn-secondary {
  background: transparent;
  color: #7a5a2a;
  border: 1.5px solid #c9b99a;
  border-radius: 8px;
  padding: 0.55rem 1rem;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.82rem;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-secondary:hover { background: #e8d9b8; }

/* ── Toolbar ── */
.toolbar {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  margin-bottom: 1rem;
}

.search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  font-size: 0.85rem;
  pointer-events: none;
}

.search-input {
  width: 100%;
  border: 1.5px solid #c9b99a;
  border-radius: 10px;
  padding: 0.6rem 2.5rem 0.6rem 2.3rem;
  background: rgba(255,255,255,0.5);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.85rem;
  color: #3d2e1a;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus { border-color: #c0853a; background: rgba(255,255,255,0.75); }
.search-input::placeholder { color: #b0986a; }

.search-clear {
  position: absolute;
  right: 0.6rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.75rem;
  color: #9a7a4a;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.filter-chip {
  background: transparent;
  border: 1.5px solid #c9b99a;
  border-radius: 99px;
  padding: 0.3rem 0.85rem;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.75rem;
  color: #7a5a2a;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.filter-chip:hover { background: #e8d9b8; }

.filter-chip.active {
  background: #3d2e1a;
  border-color: #3d2e1a;
  color: #f6e8c4;
}

.sort-wrap { margin-left: auto; }

.sort-select {
  border: 1.5px solid #c9b99a;
  border-radius: 8px;
  background: transparent;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.75rem;
  color: #7a5a2a;
  padding: 0.3rem 0.6rem;
  cursor: pointer;
  outline: none;
}

/* ── Stats bar ── */
.stats-bar {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.72rem;
  color: #9a7a4a;
  margin-bottom: 1.25rem;
  display: flex;
  gap: 0.5rem;
}

/* ── Empty state ── */
.empty-state {
  text-align: center;
  padding: 5rem 2rem;
  color: #b0986a;
}

.empty-icon { font-size: 3rem; display: block; margin-bottom: 1rem; }

.empty-state p {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.9rem;
}

/* ── Notes grid ── */
.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  align-items: start;
}

/* ── Responsive ── */

/* Tablet (≤ 768px) */
@media (max-width: 768px) {
  .app-wrapper { padding: 0 1rem 3rem; }

  .app-header { padding: 1.5rem 0 1rem; }

  .app-title { font-size: 1.6rem; }

  .notes-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1.1rem;
  }

  .filter-row { gap: 0.4rem; }

  .filter-chip { padding: 0.28rem 0.7rem; font-size: 0.72rem; }
}

/* Mobile (≤ 560px) */
@media (max-width: 560px) {
  .app-wrapper { padding: 0 0.85rem 2.5rem; }

  /* Header stacks vertically */
  .header-inner {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.85rem;
  }

  /* Buttons stretch full width */
  .header-actions {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    text-align: center;
    justify-content: center;
    padding: 0.65rem 0.5rem;
    font-size: 0.8rem;
  }

  .app-title { font-size: 1.4rem; }
  .logo-icon { font-size: 1.6rem; }

  /* Single-column grid on small screens */
  .notes-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  /* Filter chips: scrollable single row */
  .filter-row {
    flex-wrap: nowrap;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    padding-bottom: 4px;
  }
  .filter-row::-webkit-scrollbar { display: none; }

  /* Sort dropdown goes below filters */
  .sort-wrap {
    margin-left: 0;
    flex-shrink: 0;
  }

  .filter-chip {
    white-space: nowrap;
    flex-shrink: 0;
    /* Bigger tap target */
    padding: 0.4rem 0.85rem;
    font-size: 0.73rem;
  }

  .sort-select { font-size: 0.73rem; padding: 0.38rem 0.6rem; }

  .search-input { font-size: 1rem; /* prevent iOS zoom on focus */ }

  .stats-bar { font-size: 0.68rem; }
}

/* Very small phones (≤ 360px) */
@media (max-width: 360px) {
  .app-wrapper { padding: 0 0.6rem 2rem; }
  .app-title { font-size: 1.2rem; }
  .logo-icon { font-size: 1.4rem; }
  .btn-primary, .btn-secondary { font-size: 0.75rem; }
}
</style>
