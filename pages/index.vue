<template>
  <div class="notes-app">
    <h1>Hisab Notes</h1>
    <div class="new-note">
      <button @click="addNote">Add New Note</button>
    </div>
    <div class="notes-grid">
      <NoteCard
        v-for="(note, index) in notes"
        :key="index"
        :note="note"
        :index="index"
        @save="saveNote"
        @delete="deleteNote"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import NoteCard from '~/components/NoteCard.vue'

const notes = ref([])

// Load notes from localStorage when the component is mounted
onMounted(() => {
  const savedNotes = JSON.parse(localStorage.getItem('hisabNotes')) || []
  notes.value = savedNotes
})

// Watch for changes in notes and save them to localStorage
watch(notes, (newNotes) => {
  localStorage.setItem('hisabNotes', JSON.stringify(newNotes))
}, { deep: true })

// Function to add a new note
const addNote = () => {
  notes.value.push({ title: '', body: '', calculationResult: null })
}

// Save the note when it's modified
const saveNote = (note) => {
  notes.value[note.index] = note // Update the note in the notes array
}

// Delete a note
const deleteNote = (index) => {
  notes.value.splice(index, 1) // Remove the note from the array
}
</script>

<style scoped>
.notes-app {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}
.new-note {
  margin-bottom: 20px;
  text-align: center;
}
.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}
button {
  padding: 10px 15px;
  cursor: pointer;
  background-color: #1976d2;
  color: #fff;
  border: none;
  border-radius: 5px;
}
</style>
