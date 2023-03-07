import { createRouter, createWebHistory } from 'vue-router';
import TimerView from '../views/TimerView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: TimerView,
      meta: {
        title: 'Timer App'
      }
    }
  ]
})

router.beforeEach((to, from) => {
  document.title = to.meta?.title ?? 'Timer App'
})

export default router
