<template>
    <div class="hisab-editor">
      <textarea v-model="hisabText" placeholder="Write your hisab here..."></textarea>
      <button @click="calculateHisab">Calculate</button>
      <div v-if="result !== null">
        <p>Result: {{ result }}</p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  const hisabText = ref('')
  const result = ref(null)
  
  const calculateHisab = () => {
    try {
      // Extract numbers and operations, then calculate
      const sanitizedText = hisabText.value.replace(/[^0-9+\-*/]/g, '') // Simple sanitization
      result.value = eval(sanitizedText) // Caution: eval has security implications, consider a safer approach for production
    } catch (error) {
      result.value = 'Invalid input'
    }
  }
  </script>
  
  <style scoped>
  .hisab-editor {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  textarea {
    width: 100%;
    height: 100px;
    padding: 10px;
    font-size: 1.2rem;
  }
  button {
    padding: 10px;
    font-size: 1rem;
    cursor: pointer;
  }
  </style>
  