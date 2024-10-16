<script setup>
  import { ref } from 'vue'
  
  const title = ref('')
  const content = ref('')
  const isEdit = ref(false)
  
  const saveHisab = () => {
    const newEntry = {
      title: title.value,
      content: content.value,
      createdAt: new Date().toLocaleString(),
    }
  
    let savedHisab = localStorage.getItem('hisabEntries')
    savedHisab = savedHisab ? JSON.parse(savedHisab) : []
    
    if (isEdit.value) {
      // Update existing entry
    } else {
      savedHisab.push(newEntry)
    }
  
    localStorage.setItem('hisabEntries', JSON.stringify(savedHisab))
    // Navigate back to the list page
  };
</script>
<template>
    <div>
      <h1>{{ isEdit ? 'Edit Hisab' : 'New Hisab' }}</h1>
      <input v-model="title" placeholder="Enter title" />
      <tiptap-editor v-model="content" />
      <button @click="saveHisab">Save</button>
    </div>
</template>
  