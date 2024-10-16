<script setup>
  import { ref, onMounted } from 'vue';
  const hisabEntries = ref([])

  onMounted(() => {
    const savedHisab = localStorage.getItem('hisabEntries')
    if (savedHisab) {
      hisabEntries.value = JSON.parse(savedHisab)
    }
  });
  
  const addNewHisab = () => {
    // Navigate to the editor page
  };
  
  const editHisab = (index) => {
    // Open editor with the selected entry
  };
  
  const deleteHisab = (index) => {
    hisabEntries.value.splice(index, 1)
    localStorage.setItem('hisabEntries', JSON.stringify(hisabEntries.value))
  };
  async function addHisab(entry) {
  await db.hisabs.add(entry)
}

async function getAllHisabs() {
  return await db.hisabs.toArray()
}
</script>
<template>
    <div>
      <h1>Hisab List</h1>
      <div v-for="(entry, index) in hisabEntries" :key="index">
        <div>
          <h2>{{ entry.title }}</h2>
          <p>{{ entry.createdAt }}</p>
          <button @click="editHisab(index)">Edit</button>
          <button @click="deleteHisab(index)">Delete</button>
        </div>
      </div>
      <button @click="addNewHisab">Add New Hisab</button>
    </div>
</template>