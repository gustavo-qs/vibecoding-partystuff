<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <Header />

    <!-- Main content -->
    <main class="flex-1">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <slot />
      </div>
    </main>

    <!-- Footer -->
    <Footer />

    <!-- Global toast notifications -->
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import Header from './Header.vue'
import Footer from './Footer.vue'
import ToastContainer from './ToastContainer.vue'
</script>
