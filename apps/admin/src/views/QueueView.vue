<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <h1 class="text-2xl font-bold text-white">Queue</h1>
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
                                    placeholder="Search queue..."
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
                                    <option value="title">Title</option>
                                    <option value="link">Link</option>
                                    <option value="description">Description</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs text-neutral-400 mb-1">Status:</label>
                                <select
                                    v-model="filters.status"
                                    class="bg-neutral-700 w-full h-8 border border-neutral-600 text-white px-3 py-1 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value="all">All</option>
                                    <option value="pending">Pending</option>
                                    <option value="processed">Processed</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-xs text-neutral-400">Filter:</span>
                    <div class="flex rounded-md overflow-hidden">
                        <button
                            @click="setStatusFilter('all')"
                            class="px-2.5 py-1 text-xs font-medium transition-colors"
                            :class="filters.status === 'all'
                                ? 'bg-blue-600 text-white'
                                : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'"
                        >
                            All
                        </button>
                        <button
                            @click="setStatusFilter('pending')"
                            class="px-2.5 py-1 text-xs font-medium transition-colors"
                            :class="filters.status === 'pending'
                                ? 'bg-blue-600 text-white'
                                : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'"
                        >
                            Pending
                        </button>
                        <button
                            @click="setStatusFilter('processed')"
                            class="px-2.5 py-1 text-xs font-medium transition-colors"
                            :class="filters.status === 'processed'
                                ? 'bg-blue-600 text-white'
                                : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'"
                        >
                            Processed
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Loading state -->
        <div v-if="loading" class="bg-neutral-800 rounded-lg p-12 flex justify-center items-center">
            <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            <span class="ml-3 text-neutral-400">Loading queue items...</span>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="bg-neutral-800 rounded-lg p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-neutral-300 mb-2">Failed to load queue</p>
            <p class="text-neutral-400 text-sm mb-4">{{ error }}</p>
            <button @click="refreshData" class="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors">
                Try Again
            </button>
        </div>

        <!-- Empty state -->
        <div v-else-if="queueItems.length === 0" class="bg-neutral-800 rounded-lg p-12 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-neutral-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p class="text-neutral-300 mb-2">No items in queue</p>
            <p class="text-neutral-400 text-sm mb-4">The queue is currently empty</p>
        </div>

        <!-- Queue table -->
        <div v-else class="bg-neutral-800 rounded-lg overflow-hidden">
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-neutral-700">
                    <thead class="bg-neutral-700">
                        <tr>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider w-16">
                                ID
                            </th>
                            <th
                                @click="toggleSort('title')"
                                scope="col"
                                class="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider cursor-pointer hover:text-white"
                            >
                                Title
                                <span v-if="filters.sortBy === 'title'" class="ml-1">
                                    {{ filters.sortOrder === 'asc' ? '↑' : '↓' }}
                                </span>
                            </th>
                            <th
                                @click="toggleSort('pubDate')"
                                scope="col"
                                class="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider cursor-pointer hover:text-white"
                            >
                                Pub Date
                                <span v-if="filters.sortBy === 'pubDate'" class="ml-1">
                                    {{ filters.sortOrder === 'asc' ? '↑' : '↓' }}
                                </span>
                            </th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody class="bg-neutral-800 divide-y divide-neutral-700">
                        <tr v-for="item in queueItems" :key="item.id" class="hover:bg-neutral-750">
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-400" :title="item.id">
                                {{ item.id.substring(0, 6) }}...
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-white">
                                <div class="flex items-center">
                                    <img v-if="item.image" :src="item.image" alt="Thumbnail" class="h-8 w-8 mr-3 object-cover rounded">
                                    <a :href="item.link" target="_blank" class="hover:text-blue-400 truncate max-w-xs">{{ item.title }}</a>
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-400">
                                {{ formatDate(item.pubDate) }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-400">
                                <span
                                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                    :class="{
                                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': item.processed,
                                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': !item.processed
                                    }"
                                >
                                    {{ item.processed ? 'Processed' : 'Pending' }}
                                </span>
                                <div v-if="item.processed && item.processedAt" class="mt-1 text-xs text-neutral-500">
                                    {{ formatDate(item.processedAt) }}
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
                itemName="queue items"
                @pageChange="handlePageChange"
            />
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

const queueItems = ref([])
const loading = ref(true)
const error = ref(null)

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
    searchField: 'title',
    sortBy: 'pubDate',
    sortOrder: 'desc',
    page: 1,
    status: 'all' // all, pending, processed
})

const showSearchDropdown = ref(false)
const searchInput = ref(null)

const loadQueueItems = async () => {
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

        // Apply status filter if not set to 'all'
        if (filters.value.status === 'pending') {
            params.processed = false
        } else if (filters.value.status === 'processed') {
            params.processed = true
        }

        const response = await adminClient.queue.list(params)

        if (response && response.data) {
            queueItems.value = response.data

            pagination.value = {
                current: Math.floor(params.offset / params.limit) + 1,
                lastPage: Math.ceil(response.count / params.limit),
                perPage: params.limit,
                total: response.count,
                from: params.offset + 1,
                to: Math.min(params.offset + params.limit, response.count)
            }
        } else {
            queueItems.value = []
        }

        loading.value = false
    } catch (err) {
        loading.value = false
        error.value = err.message || 'Failed to load queue items'
        showNotification('error', 'Failed to load queue items')
    }
}

const refreshData = () => {
    loadQueueItems()
}

const handlePageChange = (newPage) => {
    filters.value.page = newPage
}

const setStatusFilter = (status) => {
    filters.value.status = status
    filters.value.page = 1 // Reset to first page
}

watch(filters, () => {
    loadQueueItems()
}, { deep: true })

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
        return parsedUrl.hostname + (parsedUrl.pathname !== '/' ? parsedUrl.pathname : '');
    } catch (e) {
        return url;
    }
}

const formatDate = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

const toggleSort = (column) => {
    if (filters.value.sortBy === column) {
        filters.value.sortOrder = filters.value.sortOrder === 'asc' ? 'desc' : 'asc'
    } else {
        filters.value.sortBy = column
        filters.value.sortOrder = column === 'pubDate' ? 'desc' : 'asc'
    }
}

const toggleSearchDropdown = () => {
    showSearchDropdown.value = !showSearchDropdown.value

    if (showSearchDropdown.value) {
        nextTick(() => {
            searchInput.value?.focus()
        })
    }
}

const clearSearch = () => {
    filters.value.search = ''
    filters.value.page = 1
    loadQueueItems()
    showSearchDropdown.value = false
}

onMounted(() => {
    loadQueueItems()

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
