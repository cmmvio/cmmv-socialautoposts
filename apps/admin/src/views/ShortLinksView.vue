<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <h1 class="text-2xl font-bold text-white">Short Links</h1>
            <div class="flex flex-wrap gap-2 mt-2 sm:mt-0">
                <button @click="refreshData" class="px-2.5 py-1 bg-neutral-700 hover:bg-neutral-600 text-white text-xs font-medium rounded-md transition-colors flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                </button>

                <button @click="openAddDialog" class="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-md transition-colors flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Short Link
                </button>
            </div>
        </div>

        <!-- Loading state -->
        <div v-if="loading" class="bg-neutral-800 rounded-lg p-12 flex justify-center items-center">
            <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            <span class="ml-3 text-neutral-400">Loading short links...</span>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="bg-neutral-800 rounded-lg p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-neutral-300 mb-2">Failed to load short links</p>
            <p class="text-neutral-400 text-sm mb-4">{{ error }}</p>
            <button @click="refreshData" class="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors">
                Try Again
            </button>
        </div>

        <!-- Empty state -->
        <div v-else-if="shortLinks.length === 0" class="bg-neutral-800 rounded-lg p-12 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-neutral-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 010-5.656l4-4a4 4 0 015.656 5.656l-1.1 1.1" />
            </svg>
            <p class="text-neutral-300 mb-2">No short links found</p>
            <p class="text-neutral-400 text-sm mb-4">Get started by creating your first short link</p>
            <button @click="openAddDialog" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors">
                Add Short Link
            </button>
        </div>

        <!-- Short Links table -->
        <div v-else class="bg-neutral-800 rounded-lg overflow-hidden">
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-neutral-700">
                    <thead class="bg-neutral-700">
                        <tr>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider w-16">
                                ID
                            </th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                                Original URL
                            </th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                                Short URL
                            </th>
                            <th
                                @click="toggleSort('clicks')"
                                scope="col"
                                class="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider cursor-pointer hover:text-white w-24"
                            >
                                Clicks
                                <span v-if="filters.sortBy === 'clicks'" class="ml-1">
                                    {{ filters.sortOrder === 'asc' ? '↑' : '↓' }}
                                </span>
                            </th>
                            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-neutral-300 uppercase tracking-wider w-24">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody class="bg-neutral-800 divide-y divide-neutral-700">
                        <tr v-for="link in shortLinks" :key="link.id" class="hover:bg-neutral-750">
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-400" :title="link.id">
                                {{ link.id.substring(0, 6) }}...
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-400 truncate max-w-xs">
                                <a :href="link.originalUrl" target="_blank" class="hover:text-blue-400 truncate block" :title="link.originalLink">
                                    {{ formatUrl(link.originalLink) }}
                                </a>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-400">
                                <div class="flex items-center">
                                    <a :href="getFullShortUrl(link)" target="_blank" class="text-blue-400 hover:underline mr-2">
                                        {{ getFullShortUrl(link) }}
                                    </a>
                                    <button
                                        @click="copyToClipboard(getFullShortUrl(link))"
                                        class="text-neutral-500 hover:text-white"
                                        title="Copy to clipboard"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-400">
                                {{ link.clicks || 0 }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div class="flex justify-end space-x-2">
                                    <button
                                        @click="openEditDialog(link)"
                                        title="Edit"
                                        class="text-neutral-400 hover:text-white transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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
                itemName="short links"
                @pageChange="handlePageChange"
            />
        </div>

        <!-- Add/Edit Short Link Dialog -->
        <div v-if="showDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4" style="backdrop-filter: blur(4px);">
            <div class="bg-neutral-800 rounded-lg shadow-lg w-full max-w-md mx-auto">
                <div class="p-6 border-b border-neutral-700 flex justify-between items-center">
                    <h3 class="text-lg font-medium text-white">{{ isEditing ? 'Edit Short Link' : 'Add Short Link' }}</h3>
                    <button @click="closeDialog" class="text-neutral-400 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div class="p-6">
                    <form @submit.prevent="saveShortLink">
                        <div class="mb-4">
                            <label for="linkOriginalUrl" class="block text-sm font-medium text-neutral-300 mb-1">Original URL</label>
                            <input
                                id="linkOriginalUrl"
                                v-model="linkForm.originalUrl"
                                type="url"
                                class="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="https://example.com/your-long-url"
                                required
                            />
                            <p v-if="formErrors.originalUrl" class="mt-1 text-sm text-red-500">{{ formErrors.originalUrl }}</p>
                        </div>

                        <div class="mb-4">
                            <label for="linkDomain" class="block text-sm font-medium text-neutral-300 mb-1">Domain</label>
                            <select
                                id="linkDomain"
                                v-model="linkForm.domain"
                                class="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                required
                            >
                                <option value="autop.click">autop.click</option>
                            </select>
                            <p v-if="formErrors.domain" class="mt-1 text-sm text-red-500">{{ formErrors.domain }}</p>
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

const shortLinks = ref([])
const loading = ref(true)
const error = ref(null)

const showDialog = ref(false)
const isEditing = ref(false)
const linkForm = ref({
    originalUrl: '',
    domain: 'autop.click'
})
const linkToEdit = ref(null)
const formErrors = ref({})
const formLoading = ref(false)

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
    page: 1
})

const showSearchDropdown = ref(false)
const searchInput = ref(null)

const loadShortLinks = async () => {
    try {
        loading.value = true
        error.value = null

        const params = {
            limit: pagination.value.perPage,
            offset: (filters.value.page - 1) * pagination.value.perPage,
        }

        const response = await adminClient.shortlinks.list(params)

        if (response && response.data) {
            shortLinks.value = response.data

            pagination.value = {
                current: Math.floor(params.offset / params.limit) + 1,
                lastPage: Math.ceil(response.count / params.limit),
                perPage: params.limit,
                total: response.count,
                from: params.offset + 1,
                to: Math.min(params.offset + params.limit, response.count)
            }
        } else {
            shortLinks.value = []
        }

        loading.value = false
    } catch (err) {
        loading.value = false
        error.value = err.message || 'Failed to load short links'
        showNotification('error', 'Failed to load short links')
    }
}

const refreshData = () => {
    loadShortLinks()
}

const handlePageChange = (newPage) => {
    filters.value.page = newPage
}

watch(filters, () => {
    loadShortLinks()
}, { deep: true })

const openAddDialog = () => {
    isEditing.value = false
    linkForm.value = {
        originalUrl: '',
        domain: 'autop.click'
    }
    formErrors.value = {}
    showDialog.value = true
}

const openEditDialog = (link) => {
    isEditing.value = true
    linkToEdit.value = link

    const shortUrlParts = link.shortUrl ? link.shortUrl.split('/') : []
    const domain = shortUrlParts.length > 0 ? shortUrlParts[0] : 'autop.click'

    linkForm.value = {
        originalUrl: link.originalUrl,
        domain: domain
    }
    formErrors.value = {}
    showDialog.value = true
}

const closeDialog = () => {
    showDialog.value = false
    linkForm.value = { originalUrl: '', domain: 'autop.click' }
    formErrors.value = {}
    linkToEdit.value = null
}

const saveShortLink = async () => {
    try {
        formLoading.value = true
        formErrors.value = {}

        // Validate
        if (!linkForm.value.originalUrl.trim()) {
            formErrors.value.originalUrl = 'Original URL is required'
            formLoading.value = false
            return
        }

        if (!linkForm.value.domain) {
            formErrors.value.domain = 'Domain is required'
            formLoading.value = false
            return
        }

        const linkData = {
            originalUrl: linkForm.value.originalUrl.trim(),
            shortUrl: `${linkForm.value.domain}/r/`
        }

        if (isEditing.value && linkToEdit.value) {
            await adminClient.shortlinks.update(linkToEdit.value.id, linkData)
            showNotification('success', 'Short link updated successfully')
        } else {
            await adminClient.shortlinks.create(linkData)
            showNotification('success', 'Short link created successfully')
        }

        formLoading.value = false
        closeDialog()
        refreshData()
    } catch (err) {
        formLoading.value = false

        if (err.response?.data?.errors)
            formErrors.value = err.response.data.errors
        else
            showNotification('error', err.message || 'Failed to save short link')
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
        return (parsedUrl.hostname + (parsedUrl.pathname !== '/' ? parsedUrl.pathname : '')).substring(0, 20);
    } catch (e) {
        return url;
    }
}

const getFullShortUrl = (link) => {
    if (!link.shortUrl) return '';

    if (link.shortUrl.startsWith('http'))
        return link.shortUrl;

    if (link.shortUrl.includes('/r/'))
        return `https://${link.shortUrl}`;

    const baseUrl = link.shortUrl.includes('/') ? link.shortUrl : `${link.shortUrl}/r/`;
    return `https://${baseUrl}`;
}

const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        showNotification('success', 'Copied to clipboard!');
    } catch (err) {
        showNotification('error', 'Failed to copy to clipboard');
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
    loadShortLinks()
    showSearchDropdown.value = false
}

onMounted(() => {
    loadShortLinks()

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
