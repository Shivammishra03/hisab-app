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
  
      <!-- Single Share button -->
      <div class="share-actions">
        <button @click="shareNote">Share Note</button>
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
  
  // Share note using Web Share API
  const shareNote = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: noteCopy.title || 'Hisab Note',
          text: `${noteCopy.body}\n\nCalculation Result: ${noteCopy.calculationResult}`,
        //   url: window.location.href // Optional: include current page URL if needed
        });
        console.log('Note shared successfully');
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      alert('Your browser does not support the Web Share API.');
    }
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
  .share-actions {
    margin-top: 15px;
    text-align: right;
  }
  button {
    padding: 8px 12px;
    cursor: pointer;
  }
  </style>
  