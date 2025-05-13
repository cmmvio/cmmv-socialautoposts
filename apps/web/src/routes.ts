import {
    createMemoryHistory, createWebHistory,
    createRouter as _createRouter
} from 'vue-router';

import IndexView from './views/IndexView.vue';

export function createRouter() {
    return _createRouter({
        history: import.meta.env.SSR ? createMemoryHistory() : createWebHistory(),
        routes: [
            {
                path: '/',
                component: IndexView,
                children: []
            }
        ]
    });
}

