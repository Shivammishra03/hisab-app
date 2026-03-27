<template>
  <div
    class="note-card"
    :class="[`color-${noteCopy.color}`, { 'is-pinned': noteCopy.pinned, 'is-archived': noteCopy.archived }]"
  >
    <!-- Pin ribbon -->
    <div v-if="noteCopy.pinned" class="pin-ribbon">📌 Pinned</div>

    <!-- Header: title + action icons -->
    <div class="card-header">
      <input
        v-model="noteCopy.title"
        placeholder="Title..."
        class="title-input"
        @input="saveNote"
      />
      <div class="icon-actions">
        <button class="icon-btn" :title="noteCopy.pinned ? 'Unpin' : 'Pin'" @click="togglePin">
          {{ noteCopy.pinned ? '📍' : '📌' }}
        </button>
        <button class="icon-btn" :title="noteCopy.archived ? 'Unarchive' : 'Archive'" @click="toggleArchive">
          {{ noteCopy.archived ? '📂' : '🗃️' }}
        </button>
        <button class="icon-btn danger" title="Delete" @click="deleteNote">✕</button>
      </div>
    </div>

    <!-- Color label picker -->
    <div class="color-picker">
      <button
        v-for="c in colorOptions"
        :key="c.id"
        class="color-dot"
        :class="{ active: noteCopy.color === c.id }"
        :style="{ background: c.hex }"
        :title="c.label"
        @click="setColor(c.id)"
      />
    </div>

    <!-- Tags row -->
    <div class="tags-row">
      <span v-for="(tag, i) in noteCopy.tags" :key="i" class="tag">
        {{ tag }}
        <button class="tag-remove" @click="removeTag(i)">×</button>
      </span>
      <input
        v-if="addingTag"
        ref="tagInputRef"
        v-model="newTag"
        class="tag-input"
        placeholder="new tag..."
        @keydown.enter="confirmTag"
        @keydown.escape="addingTag = false"
        @blur="confirmTag"
      />
      <button v-else class="add-tag-btn" @click="startAddTag">+ tag</button>
    </div>

    <!-- Body textarea -->
    <textarea
      v-model="noteCopy.body"
      placeholder="Write your hisab here...&#10;Tip: end any line with = to auto-calculate e.g. 500 + 250 ="
      class="body-textarea"
      @input="handleBodyInput"
    />

    <!-- Calculation result -->
    <div v-if="noteCopy.calculationResult !== null" class="calc-result">
      <span class="calc-label">Result</span>
      <span class="calc-value">{{ noteCopy.calculationResult }}</span>
      <button class="copy-btn" title="Copy" @click="copyResult">📋</button>
    </div>

    <!-- Action buttons -->
    <div class="action-row">
      <button class="btn btn-calculate" @click="calculateAndSave">∑ Calculate</button>
      <button class="btn btn-save" @click="saveNote">💾 Save</button>
      <button class="btn btn-share" @click="shareNote">↗ Share</button>
      <button class="btn btn-export" @click="exportNote">↓ Export</button>
    </div>

    <!-- Footer timestamp -->
    <div class="card-footer">
      <span class="timestamp">{{ formattedDate }}</span>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, nextTick, watch } from 'vue'

const props = defineProps({
  note: { type: Object, required: true },
  index: { type: Number, required: true },
})

const emit = defineEmits(['save', 'delete'])

const noteCopy = reactive({
  title: props.note.title ?? '',
  body: props.note.body ?? '',
  calculationResult: props.note.calculationResult ?? null,
  color: props.note.color ?? 'default',
  tags: props.note.tags ? [...props.note.tags] : [],
  pinned: props.note.pinned ?? false,
  archived: props.note.archived ?? false,
  updatedAt: props.note.updatedAt ?? Date.now(),
})

watch(() => props.note, (n) => {
  Object.assign(noteCopy, {
    title: n.title ?? '',
    body: n.body ?? '',
    calculationResult: n.calculationResult ?? null,
    color: n.color ?? 'default',
    tags: n.tags ? [...n.tags] : [],
    pinned: n.pinned ?? false,
    archived: n.archived ?? false,
    updatedAt: n.updatedAt ?? Date.now(),
  })
}, { deep: true })

const colorOptions = [
  { id: 'default', hex: '#ffffff', label: 'White' },
  { id: 'rose',    hex: '#fecaca', label: 'Rose' },
  { id: 'amber',   hex: '#fde68a', label: 'Amber' },
  { id: 'green',   hex: '#bbf7d0', label: 'Green' },
  { id: 'sky',     hex: '#bae6fd', label: 'Sky' },
  { id: 'violet',  hex: '#ddd6fe', label: 'Violet' },
]

function setColor(id) { noteCopy.color = id; saveNote() }

const formattedDate = computed(() =>
  new Date(noteCopy.updatedAt).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
)

function saveNote() {
  noteCopy.updatedAt = Date.now()
  emit('save', { ...noteCopy, index: props.index })
}

function deleteNote() {
  emit('delete', props.index)
}

// Button: sum all numbers in body
function calculateAndSave() {
  try {
    const numbers = noteCopy.body.match(/-?\d+(\.\d+)?/g) || []
    const sum = numbers.reduce((acc, num) => acc + parseFloat(num), 0)
    noteCopy.calculationResult = sum.toLocaleString('en-IN', { maximumFractionDigits: 4 })
    saveNote()
  } catch {
    noteCopy.calculationResult = 'Invalid input'
  }
}

// Auto-eval: line ending with "="
function handleBodyInput() {
  const lines = noteCopy.body.split('\n')
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim()
    if (line.endsWith('=')) {
      const expr = line.slice(0, -1).trim()
      if (/^[\d\s+\-*/().,%]+$/.test(expr)) {
        try {
          const val = Function('"use strict"; return (' + expr + ')')()
          if (typeof val === 'number' && isFinite(val)) {
            noteCopy.calculationResult = val.toLocaleString('en-IN', { maximumFractionDigits: 4 })
            saveNote()
            return
          }
        } catch {}
      }
      break
    }
  }
  saveNote()
}

function copyResult() {
  if (noteCopy.calculationResult !== null)
    navigator.clipboard.writeText(String(noteCopy.calculationResult))
}

// Tags
const addingTag = ref(false)
const newTag = ref('')
const tagInputRef = ref(null)

async function startAddTag() {
  addingTag.value = true
  await nextTick()
  tagInputRef.value?.focus()
}

function confirmTag() {
  const t = newTag.value.trim()
  if (t && !noteCopy.tags.includes(t)) noteCopy.tags.push(t)
  newTag.value = ''
  addingTag.value = false
  saveNote()
}

function removeTag(i) {
  noteCopy.tags.splice(i, 1)
  saveNote()
}

function togglePin() { noteCopy.pinned = !noteCopy.pinned; saveNote() }
function toggleArchive() { noteCopy.archived = !noteCopy.archived; saveNote() }

async function shareNote() {
  const text = [
    noteCopy.title ? `*${noteCopy.title}*` : '',
    noteCopy.body,
    noteCopy.calculationResult !== null ? `\nResult: ${noteCopy.calculationResult}` : '',
  ].filter(Boolean).join('\n')

  if (navigator.share) {
    try { await navigator.share({ title: noteCopy.title || 'Hisab Note', text }) } catch {}
  } else {
    await navigator.clipboard.writeText(text)
    alert('Copied to clipboard! (Web Share not supported here)')
  }
}

function exportNote() {
  const content = [
    'HISAB NOTE', '==========',
    `Title : ${noteCopy.title || '(untitled)'}`,
    `Date  : ${formattedDate.value}`,
    `Tags  : ${noteCopy.tags.join(', ') || '—'}`,
    '', noteCopy.body,
    noteCopy.calculationResult !== null ? `\nResult: ${noteCopy.calculationResult}` : '',
  ].join('\n')
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(new Blob([content], { type: 'text/plain' })),
    download: `${(noteCopy.title || 'note').replace(/\s+/g, '_')}.txt`,
  })
  a.click()
}
</script>

<style scoped>
.note-card {
  position: relative;
  background: var(--note-bg, #ffffff);
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.05);
  transition: box-shadow 0.2s, transform 0.2s;
}

.note-card:hover {
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

.color-default { --note-bg: #ffffff; }
.color-rose     { --note-bg: #fff5f5; border-color: #fecaca; }
.color-amber    { --note-bg: #fffbeb; border-color: #fde68a; }
.color-green    { --note-bg: #f0fdf4; border-color: #bbf7d0; }
.color-sky      { --note-bg: #f0f9ff; border-color: #bae6fd; }
.color-violet   { --note-bg: #faf5ff; border-color: #ddd6fe; }

.is-pinned  { border-color: #6366f1; box-shadow: 0 0 0 2px #e0e7ff, 0 2px 8px rgba(0,0,0,0.07); }
.is-archived { opacity: 0.6; }

.pin-ribbon {
  position: absolute;
  top: -10px; left: 14px;
  background: #6366f1;
  color: #fff;
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  padding: 2px 9px;
  border-radius: 4px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.2rem;
}

.title-input {
  flex: 1;
  min-width: 0;
  border: none;
  border-bottom: 1.5px solid #e2e8f0;
  background: transparent;
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  outline: none;
  padding: 2px 4px;
  transition: border-color 0.2s;
}
.title-input:focus { border-color: #6366f1; }
.title-input::placeholder { color: #94a3b8; font-weight: 400; }

.icon-actions { display: flex; gap: 3px; flex-shrink: 0; }

.icon-btn {
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  padding: 3px 6px;
  font-size: 0.82rem;
  cursor: pointer;
  transition: background 0.15s;
  min-width: 30px;
  min-height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon-btn:hover { background: #f1f5f9; }
.icon-btn.danger:hover { background: #fee2e2; color: #dc2626; }

.color-picker { display: flex; gap: 7px; flex-wrap: wrap; }

.color-dot {
  width: 17px;
  height: 17px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  outline: 1px solid rgba(0,0,0,0.12);
  transition: transform 0.15s, border-color 0.15s;
}
.color-dot:hover { transform: scale(1.25); }
.color-dot.active { border-color: #1e293b; transform: scale(1.2); }

.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  align-items: center;
  min-height: 26px;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  background: #ede9fe;
  color: #5b21b6;
  border-radius: 99px;
  font-size: 0.7rem;
  font-weight: 500;
  padding: 2px 9px;
}

.tag-remove {
  background: none;
  border: none;
  cursor: pointer;
  color: #7c3aed;
  font-size: 0.85rem;
  line-height: 1;
  padding: 0;
}

.tag-input {
  border: 1px dashed #c4b5fd;
  border-radius: 99px;
  font-size: 0.7rem;
  padding: 2px 9px;
  background: transparent;
  outline: none;
  width: 80px;
  color: #1e293b;
}

.add-tag-btn {
  background: none;
  border: 1px dashed #cbd5e1;
  border-radius: 99px;
  font-size: 0.7rem;
  color: #64748b;
  padding: 2px 9px;
  cursor: pointer;
  min-height: 26px;
  transition: background 0.15s, border-color 0.15s;
}
.add-tag-btn:hover { background: #f1f5f9; border-color: #94a3b8; }

.body-textarea {
  width: 100%;
  min-height: 110px;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.6rem 0.75rem;
  font-size: 0.85rem;
  color: #334155;
  background: rgba(255,255,255,0.6);
  resize: vertical;
  outline: none;
  line-height: 1.65;
  transition: border-color 0.2s;
  box-sizing: border-box;
  font-family: inherit;
}
.body-textarea:focus { border-color: #6366f1; }
.body-textarea::placeholder { color: #94a3b8; font-style: italic; font-size: 0.8rem; }

.calc-result {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  border-radius: 8px;
  padding: 0.45rem 0.8rem;
}

.calc-label {
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.8;
  white-space: nowrap;
}

.calc-value { flex: 1; font-size: 1rem; font-weight: 700; }

.copy-btn {
  background: rgba(255,255,255,0.2);
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.8rem;
  padding: 2px 6px;
  transition: background 0.15s;
}
.copy-btn:hover { background: rgba(255,255,255,0.35); }

.action-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.btn {
  border: none;
  border-radius: 8px;
  padding: 0.5rem 0.4rem;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: filter 0.15s, transform 0.1s;
  white-space: nowrap;
}
.btn:hover  { filter: brightness(1.06); transform: translateY(-1px); }
.btn:active { transform: translateY(0); }

.btn-calculate { background: #d1fae5; color: #065f46; }
.btn-save      { background: #dbeafe; color: #1e40af; }
.btn-share     { background: #ede9fe; color: #5b21b6; }
.btn-export    { background: #f1f5f9; color: #334155; }

.card-footer { display: flex; justify-content: flex-end; }

.timestamp { font-size: 0.62rem; color: #94a3b8; }

/* ── Responsive ── */
@media (max-width: 768px) {
  .note-card { padding: 0.95rem; gap: 0.55rem; }
  .body-textarea { min-height: 95px; }
}

@media (max-width: 560px) {
  .note-card {
    padding: 0.85rem 0.9rem;
    border-radius: 10px;
    transform: none !important;
  }
  .icon-btn { min-width: 34px; min-height: 34px; font-size: 0.95rem; }
  .color-dot { width: 20px; height: 20px; }
  .body-textarea { min-height: 100px; font-size: 0.9rem; }
  .btn { padding: 0.6rem 0.4rem; font-size: 0.76rem; min-height: 38px; }
  .tag { padding: 4px 10px; font-size: 0.73rem; }
  .add-tag-btn { min-height: 28px; font-size: 0.73rem; }
}

@media (max-width: 360px) {
  .note-card { padding: 0.7rem 0.75rem; }
  .action-row { gap: 0.4rem; }
  .btn { font-size: 0.72rem; }
  .icon-btn { padding: 3px 5px; }
}
</style>
