<template>
    <div class="note-card">
      <input v-model="noteCopy.title" placeholder="Title" class="note-title" />
      <textarea v-model="noteCopy.body" placeholder="Write your hisab here..." class="note-body"></textarea>
      
      <!-- Calculation Result -->
      <div v-if="noteCopy.calculationResult !== null" class="calculation-result">
        <p>Calculation Result: {{ noteCopy.calculationResult }}</p>
      </div>
      
      <div class="actions">
        <button @click="calculateAndSave">Calculate</button>
        <button @click="deleteNote">Delete</button>
        <button @click="saveNote">Save</button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { reactive } from 'vue'
  
  // Accept props from parent component
  const props = defineProps({
    note: Object,
    index: Number,
  })
  
  const emit = defineEmits(['delete', 'save'])
  
  // Create a local reactive copy of the note prop, including calculationResult
  const noteCopy = reactive({ ...props.note })
  
  // Calculate and automatically save the note after calculation
  const calculateAndSave = () => {
    try {
      // Extract numbers from the note body and sum them
      const numbers = noteCopy.body.match(/-?\d+(\.\d+)?/g) || [] // Match all numbers including decimals
      const sum = numbers.reduce((acc, num) => acc + parseFloat(num), 0)
      
      noteCopy.calculationResult = sum
      
      // Automatically save the note after calculation
      saveNote()
    } catch (error) {
      noteCopy.calculationResult = 'Invalid input for calculation'
    }
  }
  
  // Save the note by emitting the save event to the parent
  const saveNote = () => {
    emit('save', { ...noteCopy, index: props.index })
  }
  
  const deleteNote = () => {
    emit('delete', props.index)
  }
  </script>
  
  <style scoped>
  .note-card {
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 8px;
    margin-bottom: 20px;
    background-color: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  .note-title {
    width: 100%;
    font-size: 1.2rem;
    margin-bottom: 10px;
    border: none;
    font-weight: bold;
  }
  .note-body {
    width: 100%;
    height: 100px;
    border: none;
    font-size: 1rem;
  }
  .calculation-result {
    margin-top: 10px;
    font-weight: bold;
    color: #1976d2;
  }
  .actions {
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
  }
  button {
    padding: 8px 12px;
    cursor: pointer;
  }
  </style>
  