<template>
  <div class="max-w-4xl mx-auto p-6">
    <h1 class="text-3xl font-bold text-center mb-6 text-blue-600">Hisab Notes</h1>
    <div class="text-center mb-6">
      <button @click="addNote" class="bg-blue-500 text-white px-6 py-3 rounded-md shadow-lg hover:bg-blue-600 transition duration-300">
        Add New Note
      </button>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
