<template>
  <div class="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-300">
    <input v-model="noteCopy.title" placeholder="Title" class="w-full p-2 text-lg font-semibold mb-4 border rounded-md focus:ring-2 focus:ring-blue-500" />
    <textarea v-model="noteCopy.body" placeholder="Write your hisab here..." class="w-full p-3 text-sm mb-4 border rounded-md focus:ring-2 focus:ring-blue-500 h-32 resize-none"></textarea>

    <!-- Calculation Result -->
    <div v-if="noteCopy.calculationResult !== null" class="mt-4 text-blue-500 font-medium">
      <p>Calculation Result: {{ noteCopy.calculationResult }}</p>
    </div>

    <div class="flex justify-between items-center mt-4">
      <button @click="calculateAndSave" class="bg-green-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-600 transition duration-300">
        Calculate
      </button>
      <button @click="deleteNote" class="bg-red-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-red-600 transition duration-300">
        Delete
      </button>
      <button @click="saveNote" class="bg-blue-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-600 transition duration-300">
        Save
      </button>
    </div>

    <!-- Share button -->
    <div class="text-right mt-4">
      <button @click="shareNote" class="bg-purple-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-purple-600 transition duration-300">
        Share Note
      </button>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const props = defineProps({
  note: Object,
  index: Number,
})

const emit = defineEmits(['delete', 'save'])

const noteCopy = reactive({ ...props.note })

const calculateAndSave = () => {
  try {
    const numbers = noteCopy.body.match(/-?\d+(\.\d+)?/g) || []
    const sum = numbers.reduce((acc, num) => acc + parseFloat(num), 0)

    noteCopy.calculationResult = sum
    saveNote()
  } catch (error) {
    noteCopy.calculationResult = 'Invalid input for calculation'
  }
}

const saveNote = () => {
  emit('save', { ...noteCopy, index: props.index })
}

const deleteNote = () => {
  emit('delete', props.index)
}

const shareNote = async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: noteCopy.title || 'Hisab Note',
        text: `${noteCopy.body}\n\nCalculation Result: ${noteCopy.calculationResult}`,
      })
      console.log('Note shared successfully')
    } catch (error) {
      console.error('Error sharing:', error)
    }
  } else {
    alert('Your browser does not support the Web Share API.')
  }
};
</script>