import { createRouter, createWebHistory } from 'vue-router'
import UserDashboard from '@/views/UserDashboard.vue'
import HostAuth from '@/views/HostAuth.vue'
import HostDashboard from '@/views/HostDashboard.vue'
import { useHostStore } from '@/stores/host'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'UserDashboard',
      component: UserDashboard,
      meta: { title: 'Karaoke - Add Songs' }
    },
    {
      path: '/host-auth',
      name: 'HostAuth',
      component: HostAuth,
      meta: { title: 'Karaoke - Host Login' }
    },
    {
      path: '/host',
      name: 'HostDashboard',
      component: HostDashboard,
      meta: {
        title: 'Karaoke - Host Control',
        requiresHost: true
      }
    },
    // Catch all route - redirect to home
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

// Navigation guard for host routes
router.beforeEach((to, from, next) => {
  // Set page title
  if (to.meta.title) {
    document.title = to.meta.title as string
  }

  // Check if route requires host authentication
  if (to.meta.requiresHost) {
    const hostStore = useHostStore()

    if (!hostStore.isAuthenticated) {
      // Redirect to host auth if not authenticated
      next('/host-auth')
      return
    }
  }

  next()
})

export default router
