import { createRouter, createWebHistory } from 'vue-router';

import AdminLayout from './templates/AdminLayout.vue';
import LoginView from './views/LoginView.vue';
import LogoutView from './views/LogoutView.vue';
import HomeView from './views/HomeView.vue';
import FeedsView from './views/FeedsView.vue';
import ShortlinksView from './views/ShortlinksView.vue';
import QueueView from './views/QueueView.vue';
import SocialAccessView from './views/SocialAccessView.vue';
import SelectPageView from './views/SelectPageView.vue';

const router = createRouter({
    // @ts-ignore
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/login',
            name: 'login',
            component: LoginView
        },
        {
            path: '/logout',
            name: 'logout',
            component: LogoutView
        },
        {
            path: '/select-page',
            name: 'select-page',
            component: SelectPageView
        },
        {
            path: '/',
            name: 'admin',
            component: AdminLayout,
            children: [
                {
                    path: '',
                    name: 'home',
                    component: HomeView
                },
                {
                    path: 'feeds',
                    name: 'feeds',
                    component: FeedsView
                },
                {
                    path: 'short-links',
                    name: 'shortlinks',
                    component: ShortlinksView
                },
                {
                    path: 'queue',
                    name: 'queue',
                    component: QueueView
                },
                {
                    path: 'sociais',
                    name: 'sociais',
                    component: SocialAccessView
                }
            ]
        }
    ],
})

export default router
