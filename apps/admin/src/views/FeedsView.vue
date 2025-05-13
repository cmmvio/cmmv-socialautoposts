<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <h1 class="text-2xl font-bold text-white">Feeds</h1>
            <div class="flex flex-wrap gap-2 mt-2 sm:mt-0">
                <button @click="refreshData" class="px-2.5 py-1 bg-neutral-700 hover:bg-neutral-600 text-white text-xs font-medium rounded-md transition-colors flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                </button>
                <div class="relative">
                    <button @click="toggleSearchDropdown" data-search-toggle
                        class="px-2.5 py-1 bg-neutral-700 hover:bg-neutral-600 text-white text-xs font-medium rounded-md transition-colors flex items-center relative">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Search
                        <span
                            v-if="filters.search.trim()"
                            class="absolute -top-1 -right-1 h-2.5 w-2.5 bg-blue-500 rounded-full"
                            title="Search filter active">
                        </span>
                    </button>
                    <div v-if="showSearchDropdown" class="absolute right-0 mt-2 w-64 bg-neutral-800 border border-neutral-700 rounded-md shadow-lg z-10">
                        <div class="p-3 space-y-2">
                            <div class="relative">
                                <input
                                    v-model="filters.search"
                                    type="text"
                                    placeholder="Search feeds..."
                                    class="bg-neutral-700 h-9 border border-neutral-600 text-white pl-3 pr-8 py-2 rounded-md w-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    @keydown.esc="showSearchDropdown = false"
                                    ref="searchInput"
                                >
                                <button
                                    v-if="filters.search.trim()"
                                    @click="clearSearch"
                                    class="absolute right-2 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-white"
                                    title="Clear search">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div>
                                <label class="block text-xs text-neutral-400 mb-1">Search in field:</label>
                                <select
                                    v-model="filters.searchField"
                                    class="bg-neutral-700 w-full h-8 border border-neutral-600 text-white px-3 py-1 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value="name">Name</option>
                                    <option value="link">Link</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                <button @click="openAddDialog" class="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-md transition-colors flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Feed
                </button>
            </div>
        </div>

        <!-- Loading state -->
        <div v-if="loading" class="bg-neutral-800 rounded-lg p-12 flex justify-center items-center">
            <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            <span class="ml-3 text-neutral-400">Loading feeds...</span>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="bg-neutral-800 rounded-lg p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-neutral-300 mb-2">Failed to load feeds</p>
            <p class="text-neutral-400 text-sm mb-4">{{ error }}</p>
            <button @click="refreshData" class="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors">
                Try Again
            </button>
        </div>

        <!-- Empty state -->
        <div v-else-if="feeds.length === 0" class="bg-neutral-800 rounded-lg p-12 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-neutral-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
            <p class="text-neutral-300 mb-2">No feeds found</p>
            <p class="text-neutral-400 text-sm mb-4">Get started by creating your first feed</p>
            <button @click="openAddDialog" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors">
                Add Feed
            </button>
        </div>

        <!-- Feeds table -->
        <div v-else class="bg-neutral-800 rounded-lg overflow-hidden">
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-neutral-700">
                    <thead class="bg-neutral-700">
                        <tr>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider w-16">
                                ID
                            </th>
                            <th
                                @click="toggleSort('name')"
                                scope="col"
                                class="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider cursor-pointer hover:text-white"
                            >
                                Name
                                <span v-if="filters.sortBy === 'name'" class="ml-1">
                                    {{ filters.sortOrder === 'asc' ? '↑' : '↓' }}
                                </span>
                            </th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                                Share Type
                            </th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                                Link
                            </th>
                            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-neutral-300 uppercase tracking-wider w-24">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody class="bg-neutral-800 divide-y divide-neutral-700">
                        <tr v-for="feed in feeds" :key="feed.id" class="hover:bg-neutral-750">
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-400" :title="feed.id">
                                {{ feed.id.substring(0, 6) }}...
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-white">
                                {{ feed.name }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-400">
                                <span
                                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                    :class="{
                                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': feed.shareType === 'immediately',
                                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': feed.shareType === 'scheduled',
                                        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200': feed.shareType === 'manual'
                                    }"
                                >
                                    {{ feed.shareType }}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-400 truncate max-w-xs">
                                <a :href="feed.link" target="_blank" class="hover:text-blue-400 truncate block">
                                    {{ formatUrl(feed.link) }}
                                </a>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div class="flex justify-end space-x-2">
                                    <button
                                        @click="openEditDialog(feed)"
                                        title="Edit"
                                        class="text-neutral-400 hover:text-white transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <button
                                        @click="confirmDelete(feed)"
                                        title="Delete"
                                        class="text-neutral-400 hover:text-red-500 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Pagination -->
        <div class="mt-6">
            <Pagination
                :pagination="pagination"
                itemName="feeds"
                @pageChange="handlePageChange"
            />
        </div>

        <!-- Add/Edit Feed Dialog -->
        <div v-if="showDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4" style="backdrop-filter: blur(4px);">
            <div class="bg-neutral-800 rounded-lg shadow-lg w-full max-w-md mx-auto">
                <div class="p-6 border-b border-neutral-700 flex justify-between items-center">
                    <h3 class="text-lg font-medium text-white">{{ isEditing ? 'Edit Feed' : 'Add Feed' }}</h3>
                    <button @click="closeDialog" class="text-neutral-400 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div class="p-6">
                    <form @submit.prevent="saveFeed">
                        <div class="mb-4">
                            <label for="feedName" class="block text-sm font-medium text-neutral-300 mb-1">Feed Name</label>
                            <input
                                id="feedName"
                                v-model="feedForm.name"
                                type="text"
                                class="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="Feed name"
                                required
                            />
                            <p v-if="formErrors.name" class="mt-1 text-sm text-red-500">{{ formErrors.name }}</p>
                        </div>

                        <div class="mb-4">
                            <label for="feedLink" class="block text-sm font-medium text-neutral-300 mb-1">Feed URL</label>
                            <input
                                id="feedLink"
                                v-model="feedForm.link"
                                type="url"
                                class="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="https://example.com/feed"
                                required
                            />
                            <p v-if="formErrors.link" class="mt-1 text-sm text-red-500">{{ formErrors.link }}</p>
                        </div>

                        <div class="mb-4">
                            <label for="feedShareType" class="block text-sm font-medium text-neutral-300 mb-1">Share Type</label>
                            <select
                                id="feedShareType"
                                v-model="feedForm.shareType"
                                class="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                required
                            >
                                <option value="immediately">Immediately</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="manual">Manual</option>
                            </select>
                            <p v-if="formErrors.shareType" class="mt-1 text-sm text-red-500">{{ formErrors.shareType }}</p>
                            <p class="mt-1 text-sm text-neutral-500">
                                <span v-if="feedForm.shareType === 'immediately'">Posts will be shared as soon as they are fetched</span>
                                <span v-else-if="feedForm.shareType === 'scheduled'">Posts will be queued for scheduled sharing</span>
                                <span v-else-if="feedForm.shareType === 'manual'">Posts will require manual approval before sharing</span>
                            </p>
                        </div>

                        <!-- Social Media Selection -->
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-neutral-300 mb-2">Post to Social Media</label>

                            <div v-if="loadingSocials" class="py-2 flex items-center text-neutral-400 text-sm">
                                <svg class="animate-spin h-4 w-4 mr-2 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Loading social media accounts...
                            </div>

                            <div v-else-if="socialAccounts.length === 0" class="py-2 text-neutral-400 text-sm">
                                No social media accounts connected. <a href="/social-accounts" class="text-blue-500 hover:text-blue-400">Connect accounts</a>
                            </div>

                            <div v-else class="space-y-2 max-h-48 overflow-y-auto pr-2 py-1">
                                <div
                                    v-for="account in socialAccounts"
                                    :key="account.id"
                                    class="flex items-center space-x-3 p-2 rounded-md hover:bg-neutral-750"
                                >
                                    <input
                                        type="checkbox"
                                        :id="`social-${account.id}`"
                                        :value="account.id"
                                        v-model="feedForm.socials"
                                        class="h-4 w-4 rounded border-neutral-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-neutral-800"
                                    >
                                    <label :for="`social-${account.id}`" class="flex items-center cursor-pointer flex-1">
                                        <div class="flex items-center">
                                            <div class="h-8 w-8 flex-shrink-0 mr-3 overflow-hidden">
                                                <!-- Show avatar image if available -->
                                                <img
                                                    v-if="account.image"
                                                    :src="account.image"
                                                    :alt="account.name"
                                                    class="h-full w-full object-cover rounded-full"
                                                    @error="handleAvatarError"
                                                >
                                                <!-- Fallback to platform icon if no avatar -->
                                                <div
                                                    v-else
                                                    class="h-full w-full rounded-full flex items-center justify-center"
                                                    :class="{
                                                        'bg-blue-600': account.type === 'facebook',
                                                        'bg-gradient-to-r from-purple-500 to-pink-500': account.type === 'instagram',
                                                        'bg-black': account.type === 'x' || account.type === 'twitter',
                                                        'bg-blue-800': account.type === 'linkedin',
                                                        'bg-orange-600': account.type === 'reddit',
                                                        'bg-black': account.type === 'threads',
                                                        'bg-black': account.type === 'tiktok',
                                                    }"
                                                >
                                                    <span class="text-white text-xs font-bold uppercase">
                                                        {{ getPlatformInitial(account.type) }}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <div class="text-white text-sm">{{ formatPlatformName(account.type) }}</div>
                                                <div class="text-neutral-400 text-xs">{{ account.name }}</div>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <p v-if="formErrors.socials" class="mt-1 text-sm text-red-500">{{ formErrors.socials }}</p>
                        </div>

                        <div class="flex justify-end space-x-3 mt-6">
                            <button
                                type="button"
                                @click="closeDialog"
                                class="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-md transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                                :disabled="formLoading"
                            >
                                <span v-if="formLoading" class="flex items-center">
                                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </span>
                                <span v-else>
                                    {{ isEditing ? 'Update' : 'Create' }}
                                </span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- Delete Confirmation Dialog -->
        <div v-if="showDeleteDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4" style="backdrop-filter: blur(4px);">
            <div class="bg-neutral-800 rounded-lg shadow-lg w-full max-w-md mx-auto">
                <div class="p-6 border-b border-neutral-700">
                    <h3 class="text-lg font-medium text-white">Delete Feed</h3>
                </div>
                <div class="p-6">
                    <p class="text-neutral-300">Are you sure you want to delete the feed "{{ feedToDelete?.name }}"?</p>
                    <p class="mt-2 text-sm text-red-400">This action cannot be undone.</p>

                    <div class="flex justify-end space-x-3 mt-6">
                        <button
                            @click="closeDeleteDialog"
                            class="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-md transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            @click="deleteFeed"
                            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                            :disabled="deleteLoading"
                        >
                            <span v-if="deleteLoading" class="flex items-center">
                                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Deleting...
                            </span>
                            <span v-else>Delete</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Toast notification -->
        <div
            v-if="notification.show"
            class="fixed bottom-4 right-4 px-4 py-3 rounded-md shadow-lg flex items-center z-50"
            :class="{
                'bg-green-600 text-white': notification.type === 'success',
                'bg-red-600 text-white': notification.type === 'error',
                'bg-blue-600 text-white': notification.type === 'info'
            }"
        >
            <span>{{ notification.message }}</span>
            <button
                @click="notification.show = false"
                class="ml-4 text-white hover:text-gray-200"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useAdminClient } from '../composable/useAdminClient'
import Pagination from '../components/Pagination.vue'

const adminClient = useAdminClient()

const feeds = ref([])
const loading = ref(true)
const error = ref(null)

const showDialog = ref(false)
const isEditing = ref(false)
const feedForm = ref({
    name: '',
    link: '',
    shareType: 'immediately',
    socials: []
})
const feedToEdit = ref(null)
const formErrors = ref({})
const formLoading = ref(false)

const showDeleteDialog = ref(false)
const feedToDelete = ref(null)
const deleteLoading = ref(false)

const notification = ref({
    show: false,
    type: 'success',
    message: '',
    duration: 3000
})

const pagination = ref({
    current: 1,
    lastPage: 1,
    perPage: 10,
    total: 0,
    from: 1,
    to: 10
})

const filters = ref({
    search: '',
    searchField: 'name',
    sortBy: 'name',
    sortOrder: 'asc',
    page: 1
})

const showSearchDropdown = ref(false)
const searchInput = ref(null)

// Social media accounts
const socialAccounts = ref([])
const loadingSocials = ref(false)

const loadFeeds = async () => {
    try {
        loading.value = true
        error.value = null

        const params = {
            limit: pagination.value.perPage,
            offset: (filters.value.page - 1) * pagination.value.perPage,
            sortBy: filters.value.sortBy,
            sort: filters.value.sortOrder,
        }

        if (filters.value.search) {
            params.search = filters.value.search
            params.searchField = filters.value.searchField
        }

        const response = await adminClient.feeds.list(params)

        if (response && response.data) {
            feeds.value = response.data

            pagination.value = {
                current: Math.floor(params.offset / params.limit) + 1,
                lastPage: Math.ceil(response.count / params.limit),
                perPage: params.limit,
                total: response.count,
                from: params.offset + 1,
                to: Math.min(params.offset + params.limit, response.count)
            }
        } else {
            feeds.value = []
        }

        loading.value = false
    } catch (err) {
        loading.value = false
        error.value = err.message || 'Failed to load feeds'
        showNotification('error', 'Failed to load feeds')
    }
}

const refreshData = () => {
    loadFeeds()
}

const handlePageChange = (newPage) => {
    filters.value.page = newPage
}

watch(filters, () => {
    loadFeeds()
}, { deep: true })

const openAddDialog = () => {
    isEditing.value = false
    feedForm.value = {
        name: '',
        link: '',
        shareType: 'immediately',
        socials: []
    }
    formErrors.value = {}
    loadSocialAccounts()
    showDialog.value = true
}

const openEditDialog = (feed) => {
    isEditing.value = true
    feedToEdit.value = feed

    feedForm.value = {
        name: feed.name,
        link: feed.link,
        shareType: feed.shareType || 'immediately',
        socials: feed.socials || []
    }
    formErrors.value = {}
    loadSocialAccounts()
    showDialog.value = true
}

const closeDialog = () => {
    showDialog.value = false
    feedForm.value = {
        name: '',
        link: '',
        shareType: 'immediately',
        socials: []
    }
    formErrors.value = {}
    feedToEdit.value = null
}

// Save feed
const saveFeed = async () => {
    try {
        formLoading.value = true
        formErrors.value = {}

        // Validate
        if (!feedForm.value.name.trim()) {
            formErrors.value.name = 'Feed name is required'
            formLoading.value = false
            return
        }

        if (!feedForm.value.link.trim()) {
            formErrors.value.link = 'Feed URL is required'
            formLoading.value = false
            return
        }

        if (!feedForm.value.shareType) {
            formErrors.value.shareType = 'Share type is required'
            formLoading.value = false
            return
        }

        const feedData = {
            name: feedForm.value.name.trim(),
            link: feedForm.value.link.trim(),
            shareType: feedForm.value.shareType,
            socials: feedForm.value.socials
        }

        if (isEditing.value && feedToEdit.value) {
            await adminClient.feeds.update(feedToEdit.value.id, feedData)
            showNotification('success', 'Feed updated successfully')
        } else {
            await adminClient.feeds.create(feedData)
            showNotification('success', 'Feed created successfully')
        }

        formLoading.value = false
        closeDialog()
        refreshData()
    } catch (err) {
        formLoading.value = false

        if (err.response?.data?.errors) {
            formErrors.value = err.response.data.errors
        } else {
            showNotification('error', err.message || 'Failed to save feed')
        }
    }
}

const confirmDelete = (feed) => {
    feedToDelete.value = feed
    showDeleteDialog.value = true
}

const closeDeleteDialog = () => {
    showDeleteDialog.value = false
    feedToDelete.value = null
}

const deleteFeed = async () => {
    if (!feedToDelete.value) return

    try {
        deleteLoading.value = true
        await adminClient.feeds.delete(feedToDelete.value.id)
        deleteLoading.value = false
        closeDeleteDialog()
        showNotification('success', 'Feed deleted successfully')
        refreshData()
    } catch (err) {
        deleteLoading.value = false
        showNotification('error', err.message || 'Failed to delete feed')
    }
}

const showNotification = (type, message) => {
    notification.value = {
        show: true,
        type,
        message,
        duration: 3000
    }

    setTimeout(() => {
        notification.value.show = false
    }, notification.value.duration)
}

const formatUrl = (url) => {
    if (!url) return '';

    try {
        const parsedUrl = new URL(url);
        // Return the hostname part plus path if it's not just '/'
        return parsedUrl.hostname + (parsedUrl.pathname !== '/' ? parsedUrl.pathname : '');
    } catch (e) {
        return url;
    }
}

const toggleSort = (column) => {
    if (filters.value.sortBy === column) {
        filters.value.sortOrder = filters.value.sortOrder === 'asc' ? 'desc' : 'asc'
    } else {
        filters.value.sortBy = column
        filters.value.sortOrder = 'asc'
    }
}

// Toggle search dropdown
const toggleSearchDropdown = () => {
    showSearchDropdown.value = !showSearchDropdown.value

    // Focus the search input when dropdown opens
    if (showSearchDropdown.value) {
        nextTick(() => {
            searchInput.value?.focus()
        })
    }
}

// Clear search
const clearSearch = () => {
    filters.value.search = ''
    filters.value.page = 1
    loadFeeds()
    showSearchDropdown.value = false
}

// Load social media accounts
const loadSocialAccounts = async () => {
    try {
        loadingSocials.value = true
        const response = await adminClient.socials.list({})

        if (response && response.data) {
            socialAccounts.value = response.data
        } else {
            socialAccounts.value = []
        }

        loadingSocials.value = false
    } catch (err) {
        console.error('Failed to load social media accounts:', err)
        loadingSocials.value = false
    }
}

// Platform formatting functions
const formatPlatformName = (platform) => {
    if (!platform) return '';

    const names = {
        'facebook': 'Facebook',
        'instagram': 'Instagram',
        'x': 'X',
        'twitter': 'Twitter',
        'linkedin': 'LinkedIn',
        'reddit': 'Reddit',
        'threads': 'Threads',
        'tiktok': 'TikTok'
    };

    return names[platform] || platform;
}

const getPlatformInitial = (platform) => {
    if (!platform) return '';

    const initials = {
        'facebook': 'F',
        'instagram': 'IG',
        'x': 'X',
        'twitter': 'X',
        'linkedin': 'in',
        'reddit': 'R',
        'threads': 'T',
        'tiktok': 'TT'
    };

    return initials[platform] || platform.charAt(0).toUpperCase();
}

// Handle avatar loading errors
const handleAvatarError = (event) => {
    if (event.target) {
        event.target.style.display = 'none';
    }
}

onMounted(() => {
    loadFeeds()

    // Close search dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (showSearchDropdown.value &&
            !e.target.closest('[data-search-toggle]') &&
            !e.target.closest('.absolute')) {
            showSearchDropdown.value = false
        }
    })
})
</script>
