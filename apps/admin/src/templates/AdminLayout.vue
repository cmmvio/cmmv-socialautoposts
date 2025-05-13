<template>
    <div class="min-h-screen bg-neutral-900 flex">
        <aside
            class="fixed h-full z-30 transition-all duration-300 ease-in-out bg-neutral-900 border-r border-neutral-800 shadow-md"
            :class="{ 'w-20': isCollapsed, 'w-50': !isCollapsed, '-translate-x-full md:translate-x-0': isMobileMenuHidden }">

            <div class="h-[calc(100%-144px)] py-4 overflow-y-auto">
                <nav class="space-y-1 px-2">
                    <router-link
                        v-for="item in navbarItems"
                        :key="item.to"
                        :to="item.to"
                        class="flex items-center px-4 py-1.5 text-neutral-300 hover:bg-neutral-700 hover:text-white rounded-md group transition-all duration-200 text-sm"
                        :class="{ 'justify-center': isCollapsed }"
                        :title="isCollapsed ? item.label : ''"
                    >
                        <i v-if="typeof item.icon === 'string' && item.icon.includes('fa-')"
                           :class="[item.icon, 'h-5 w-5 text-neutral-400 group-hover:text-white flex-shrink-0 flex items-center justify-center']"
                           style="min-width: 1.25rem; display: inline-flex;"></i>

                        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-neutral-400 group-hover:text-white"
                            fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path v-if="typeof item.icon === 'string'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon" />
                            <path v-else v-for="icon in item.icon" :key="icon" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="icon" />
                        </svg>

                        <span class="ml-3 transition-opacity duration-200 text-xs"
                            :class="isCollapsed ? 'opacity-0 absolute' : 'opacity-100'">{{ item.label }}</span>
                    </router-link>
                </nav>
            </div>

            <div class="absolute bottom-0 left-0 right-0 border-t border-neutral-800 p-4 bg-neutral-800 transition-all duration-300">
                <div class="flex items-center" :class="{ 'justify-center': isCollapsed }">
                    <div v-if="user" class="h-8 w-8 rounded-full flex items-center justify-center overflow-hidden bg-blue-600 text-white">
                        <img
                            v-if="userAvatar"
                            :src="userAvatar"
                            :alt="userDisplayName"
                            class="h-full w-full object-cover"
                        />
                        <span v-else class="text-sm font-medium">{{ userInitials }}</span>
                    </div>
                    <div v-else class="h-8 w-8 rounded-full bg-neutral-600"></div>

                    <div class="ml-3 transition-opacity duration-200"
                        :class="isCollapsed ? 'opacity-0 absolute' : 'opacity-100'">
                        <p class="text-sm font-medium text-neutral-200">{{ userDisplayName }}</p>
                        <p class="text-xs text-neutral-400"><a href="/logout">Logout</a></p>
                    </div>
                </div>
            </div>
        </aside>

        <div class="flex-1 flex flex-col transition-all duration-300 overflow-hidden"
            :class="{ 'md:ml-20': isCollapsed, 'md:ml-50': !isCollapsed }">
            <div class="lg:hidden absolute top-4 left-4 z-50">
                <button @click="toggleMobileMenu"
                    class="p-2 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>

            <main class="flex-1 bg-neutral-900 p-4 overflow-y-auto">
                <router-view />
            </main>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router'
import { useAdminClient } from '../composable/useAdminClient';

const api = useAdminClient()
api.session.check();

const route = useRoute()
const isCollapsed = ref(false)
const isMobileMenuHidden = ref(true)
const user = ref(null)
const userDisplayName = computed(() => {
    if (!user.value) return 'User'

    if (user.value.name)
        return user.value.name

    return user.value.email || 'User'
})

const navbarItems = ref([
    {
        label: 'Dashboard',
        icon: 'fas fa-home',
        to: '/'
    },
    {
        label: 'Feeds',
        icon: 'fas fa-rss',
        to: '/feeds'
    },
    {
        label: 'Queue',
        icon: 'fas fa-tasks',
        to: '/queue'
    },
    {
        label: 'Short Links',
        icon: 'fas fa-link',
        to: '/short-links'
    },
    {
        label: 'Sociais',
        icon: 'fas fa-share-alt',
        to: '/sociais'
    },
    /*{
        label: 'API',
        icon: 'fas fa-code',
        to: '/api'
    }*/
])

const userInitials = computed(() => {
    if (!user.value) return '?'

    if (user.value && user.value.name)
        return user.value.name.substring(0, 1).toUpperCase()

    return user.value.email ? user.value.email.substring(0, 1).toUpperCase() : '?'
})

const userAvatar = computed(() => {
    if (user.value && user.value.avatar)
        return user.value.avatar

    return null
})

const refreshUserProfile = async () => {
    try {
        user.value = await api.profile.get()
    } catch (error) {}
}

function toggleSidebar() {
    isCollapsed.value = !isCollapsed.value
    localStorage.setItem('sidebarCollapsed', isCollapsed.value)
}

function toggleMobileMenu() {
    isMobileMenuHidden.value = !isMobileMenuHidden.value
}

onMounted(async () => {
    const savedPreference = localStorage.getItem('sidebarCollapsed')

    if (savedPreference !== null)
        isCollapsed.value = savedPreference === 'true'

    try {
        user.value = await api.profile.get()

        watch(() => route.path, (newPath, oldPath) => {
            if (oldPath.includes('/profile'))
                refreshUserProfile()
        })
    } catch (error) {}
})
</script>
