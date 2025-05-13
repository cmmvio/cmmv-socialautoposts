<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <h1 class="text-2xl font-bold text-white">Social Media Access</h1>
            <div class="flex flex-wrap gap-2 mt-2 sm:mt-0">
                <button @click="refreshData" class="px-2.5 py-1 bg-neutral-700 hover:bg-neutral-600 text-white text-xs font-medium rounded-md transition-colors flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                </button>

                <button @click="openSocialMediaModal" class="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Social Media
                </button>
            </div>
        </div>

        <!-- Loading state -->
        <div v-if="loading" class="bg-neutral-800 rounded-lg p-12 flex justify-center items-center">
            <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            <span class="ml-3 text-neutral-400">Loading social media accounts...</span>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="bg-neutral-800 rounded-lg p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-neutral-300 mb-2">Failed to load social media accounts</p>
            <p class="text-neutral-400 text-sm mb-4">{{ error }}</p>
            <button @click="refreshData" class="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors">
                Try Again
            </button>
        </div>

        <!-- Empty state -->
        <div v-else-if="socialAccounts.length === 0" class="bg-neutral-800 rounded-lg p-12 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-neutral-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-neutral-300 mb-2">No social media accounts</p>
            <p class="text-neutral-400 text-sm mb-4">Connect your social media accounts to start posting</p>
            <button @click="openSocialMediaModal" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors flex items-center mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Social Media Account
            </button>
        </div>

        <!-- Social Media Accounts table -->
        <div v-else class="bg-neutral-800 rounded-lg overflow-hidden">
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-neutral-700">
                    <thead class="bg-neutral-700">
                        <tr>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                                Platform
                            </th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                                Account
                            </th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                                Status
                            </th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody class="bg-neutral-800 divide-y divide-neutral-700">
                        <tr v-for="account in socialAccounts" :key="account.id" class="hover:bg-neutral-750">
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-white">
                                <div class="flex items-center">
                                    <span class="font-medium">{{ formatPlatformName(account.type) }}</span>
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-white">
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
                                                'bg-black': account.type === 'x',
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
                                    <div class="flex flex-col">
                                        <div class="text-white flex-1">{{ account.name }}</div>
                                        <div v-if="account.pageId" class="text-neutral-400 text-xs">{{ account.pageId }}</div>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-neutral-400">
                                {{ formatDate(account.updatedAt) }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div class="flex space-x-2">
                                    <button
                                        @click="confirmDeleteAccount(account)"
                                        class="text-gray-500 hover:text-gray-700"
                                        title="Delete account"
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
                itemName="social accounts"
                @pageChange="handlePageChange"
            />
        </div>

        <!-- Social Media Selection Modal -->
        <div v-if="showSocialMediaModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" style="backdrop-filter: blur(4px);">
            <div class="bg-neutral-800 rounded-lg max-w-lg w-full p-6 shadow-xl">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-lg font-medium text-white">Connect Social Media</h3>
                    <button @click="showSocialMediaModal = false" class="text-neutral-400 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <!-- Facebook -->
                    <button
                        @click="startOAuthFlow('facebook')"
                        class="bg-neutral-700 hover:bg-neutral-600 rounded-lg p-4 flex flex-col items-center transition-colors"
                    >
                        <div class="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-2">
                            <i class="fab fa-facebook-f text-2xl text-white"></i>
                        </div>
                        <span class="text-white">Facebook</span>
                    </button>

                    <!-- Instagram -->
                    <div
                        class="bg-neutral-700 rounded-lg p-4 flex flex-col items-center relative overflow-hidden"
                    >
                        <div class="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
                            <span class="text-white font-medium text-lg">Em Breve</span>
                        </div>
                        <div class="h-16 w-16 rounded-full flex items-center justify-center mb-2 bg-gradient-to-r from-purple-500 to-pink-500">
                            <i class="fab fa-instagram text-2xl text-white"></i>
                        </div>
                        <span class="text-white">Instagram</span>
                    </div>

                    <!-- X -->
                    <button
                        @click="startOAuthFlow('x')"
                        class="bg-neutral-700 hover:bg-neutral-600 rounded-lg p-4 flex flex-col items-center transition-colors"
                    >
                        <div class="h-16 w-16 bg-black rounded-full flex items-center justify-center mb-2">
                            <i class="fab fa-x-twitter text-2xl text-white"></i>
                        </div>
                        <span class="text-white">X</span>
                    </button>

                    <!-- LinkedIn -->
                    <div
                        class="bg-neutral-700 rounded-lg p-4 flex flex-col items-center relative overflow-hidden"
                    >
                        <div class="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
                            <span class="text-white font-medium text-lg">Em Breve</span>
                        </div>
                        <div class="h-16 w-16 bg-blue-800 rounded-full flex items-center justify-center mb-2">
                            <i class="fab fa-linkedin-in text-2xl text-white"></i>
                        </div>
                        <span class="text-white">LinkedIn</span>
                    </div>

                    <!-- Reddit -->
                    <div
                        class="bg-neutral-700 rounded-lg p-4 flex flex-col items-center relative overflow-hidden"
                    >
                        <div class="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
                            <span class="text-white font-medium text-lg">Em Breve</span>
                        </div>
                        <div class="h-16 w-16 bg-orange-600 rounded-full flex items-center justify-center mb-2">
                            <i class="fab fa-reddit-alien text-2xl text-white"></i>
                        </div>
                        <span class="text-white">Reddit</span>
                    </div>

                    <!-- Threads -->
                    <div
                        class="bg-neutral-700 rounded-lg p-4 flex flex-col items-center relative overflow-hidden"
                    >
                        <div class="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
                            <span class="text-white font-medium text-lg">Em Breve</span>
                        </div>
                        <div class="h-16 w-16 bg-black rounded-full flex items-center justify-center mb-2">
                            <i class="fab fa-threads text-2xl text-white"></i>
                        </div>
                        <span class="text-white">Threads</span>
                    </div>

                    <!-- TikTok -->
                    <div
                        class="bg-neutral-700 rounded-lg p-4 flex flex-col items-center relative overflow-hidden"
                    >
                        <div class="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
                            <span class="text-white font-medium text-lg">Em Breve</span>
                        </div>
                        <div class="h-16 w-16 bg-black rounded-full flex items-center justify-center mb-2">
                            <i class="fab fa-tiktok text-2xl text-white"></i>
                        </div>
                        <span class="text-white">TikTok</span>
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

        <!-- Delete Confirmation Dialog -->
        <DeleteDialog
            :show="showDeleteDialog"
            :title="'Delete Social Media Account'"
            :message="'Are you sure you want to delete this social media account'"
            :item-name="accountToDelete ? `${formatPlatformName(accountToDelete.type)} - ${accountToDelete.name}` : ''"
            :warning-text="'This action cannot be undone. You will need to reconnect your account to use it again.'"
            :loading="deleteLoading"
            @confirm="executeDelete"
            @cancel="cancelDelete"
        />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useAdminClient } from '../composable/useAdminClient'
import Pagination from '../components/Pagination.vue'
import DeleteDialog from '../components/DeleteDialog.vue'

const adminClient = useAdminClient()

const socialAccounts = ref([])
const loading = ref(true)
const error = ref(null)
const token = ref(localStorage.getItem('token'))

// Delete dialog state
const showDeleteDialog = ref(false)
const accountToDelete = ref(null)
const deleteLoading = ref(false)

// Social media modal
const showSocialMediaModal = ref(false)

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

const loadSocialAccounts = async () => {
    try {
        loading.value = true
        error.value = null

        const params = {
            limit: pagination.value.perPage,
            offset: (filters.value.page - 1) * pagination.value.perPage
        }

        const response = await adminClient.socials.list(params)

        if (response && response.data) {
            socialAccounts.value = response.data

            pagination.value = {
                current: Math.floor(params.offset / params.limit) + 1,
                lastPage: Math.ceil(response.count / params.limit),
                perPage: params.limit,
                total: response.count,
                from: params.offset + 1,
                to: Math.min(params.offset + params.limit, response.count)
            }
        } else {
            socialAccounts.value = []
        }

        loading.value = false
    } catch (err) {
        loading.value = false
        error.value = err.message || 'Failed to load social media accounts'
        showNotification('error', 'Failed to load social media accounts')
    }
}

const refreshData = () => {
    loadSocialAccounts()
}

const handlePageChange = (newPage) => {
    filters.value.page = newPage
}

watch(filters, () => {
    loadSocialAccounts()
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

const formatPlatformName = (platform) => {
    if (!platform) return '';

    const names = {
        'facebook': 'Facebook',
        'instagram': 'Instagram',
        'x': 'X',
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
        'linkedin': 'in',
        'reddit': 'R',
        'threads': 'T',
        'tiktok': 'TT'
    };

    return initials[platform] || platform.charAt(0).toUpperCase();
}

const openSocialMediaModal = () => {
    showSocialMediaModal.value = true
}

const addNewSocialAccount = () => {
    openSocialMediaModal()
}

const startOAuthFlow = (platform) => {
    showSocialMediaModal.value = false

    // For Facebook, open in a new window
    if (platform === 'facebook') {
        startFacebookIntegration();
        return;
    }

    // For Instagram, open in a new window
    if (platform === 'instagram') {
        startInstagramIntegration();
        return;
    }

    // For Twitter/X, open in a new window
    if (platform === 'x') {
        startTwitterIntegration();
        return;
    }

    // Handle other platforms
    showNotification('info', `Redirecting to ${formatPlatformName(platform)} for authorization...`);

    // Simulating OAuth callback for other platforms
    setTimeout(() => {
        showNotification('success', `Successfully connected to ${formatPlatformName(platform)}`);
        refreshData();
    }, 1500);
}

const startFacebookIntegration = () => {
    showNotification('info', 'Opening Facebook authorization window...');

    const state = Math.random().toString(36).substring(2, 15);

    localStorage.setItem('facebook_auth_state', state);

    const width = 800;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const authWindow = window.open(
        `/api/integration/facebook/access?state=${state}&token=${token.value}`,
        'FacebookAuth',
        `width=${width},height=${height},top=${top},left=${left},scrollbars=yes`
    );

    const messageListener = (event) => {
        if (event.origin !== window.location.origin) return;

        try {
            const data = typeof event.data === 'string'
                ? JSON.parse(event.data)
                : event.data;

            if (data.type === 'facebook_auth_callback') {
                if (data.state !== localStorage.getItem('facebook_auth_state')) {
                    showNotification('error', 'Authentication failed: Invalid state parameter');
                    return;
                }

                window.removeEventListener('message', messageListener);
                localStorage.removeItem('facebook_auth_state');

                if (data.success) {
                    showNotification('success', 'Successfully connected to Facebook');
                    refreshData();
                } else {
                    showNotification('error', data.error || 'Failed to connect to Facebook');
                }

                if (authWindow && !authWindow.closed) {
                    authWindow.close();
                }
            }
        } catch (err) {
            console.error('Error processing auth callback', err);
        }
    };

    window.addEventListener('message', messageListener);

    const checkClosed = setInterval(() => {
        if (authWindow && authWindow.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageListener);
            localStorage.removeItem('facebook_auth_state');
        }
    }, 500);
}

const startInstagramIntegration = () => {
    showNotification('info', 'Opening Instagram authorization window...');

    const state = Math.random().toString(36).substring(2, 15);

    localStorage.setItem('instagram_auth_state', state);

    const authWindow = window.open(
        `/api/integration/instagram/access?state=${state}&token=${token.value}`,
        '_blank'
    );

    const messageListener = (event) => {
        if (event.origin !== window.location.origin) return;

        try {
            const data = typeof event.data === 'string'
                ? JSON.parse(event.data)
                : event.data;

            if (data.type === 'instagram_auth_callback') {
                if (data.state !== localStorage.getItem('instagram_auth_state')) {
                    showNotification('error', 'Authentication failed: Invalid state parameter');
                    return;
                }

                window.removeEventListener('message', messageListener);
                localStorage.removeItem('instagram_auth_state');

                if (data.success) {
                    showNotification('success', 'Successfully connected to Instagram');
                    refreshData();
                } else {
                    showNotification('error', data.error || 'Failed to connect to Instagram');
                }

                if (authWindow && !authWindow.closed) {
                    authWindow.close();
                }
            }
        } catch (err) {
            console.error('Error processing auth callback', err);
        }
    };

    window.addEventListener('message', messageListener);

    const checkClosed = setInterval(() => {
        if (authWindow && authWindow.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageListener);
            localStorage.removeItem('instagram_auth_state');
        }
    }, 500);
}

const startTwitterIntegration = () => {
    showNotification('info', 'Opening Twitter/X authorization window...');

    const state = Math.random().toString(36).substring(2, 15);

    localStorage.setItem('twitter_auth_state', state);

    const authWindow = window.open(
        `/api/integration/twitter/access?state=${state}&token=${token.value}`,
        '_blank'
    );

    const messageListener = (event) => {
        if (event.origin !== window.location.origin) return;

        try {
            const data = typeof event.data === 'string'
                ? JSON.parse(event.data)
                : event.data;

            if (data.type === 'twitter_auth_callback') {
                if (data.state !== localStorage.getItem('twitter_auth_state')) {
                    showNotification('error', 'Authentication failed: Invalid state parameter');
                    return;
                }

                window.removeEventListener('message', messageListener);
                localStorage.removeItem('twitter_auth_state');

                if (data.success) {
                    showNotification('success', 'Successfully connected to Twitter/X');
                    refreshData();
                } else {
                    showNotification('error', data.error || 'Failed to connect to Twitter/X');
                }

                if (authWindow && !authWindow.closed) {
                    authWindow.close();
                }
            }
        } catch (err) {
            console.error('Error processing auth callback', err);
        }
    };

    window.addEventListener('message', messageListener);

    const checkClosed = setInterval(() => {
        if (authWindow && authWindow.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageListener);
            localStorage.removeItem('twitter_auth_state');
        }
    }, 500);
}

// Show delete confirmation dialog
const confirmDeleteAccount = (account) => {
    accountToDelete.value = account
    showDeleteDialog.value = true
}

// Cancel delete operation
const cancelDelete = () => {
    showDeleteDialog.value = false
    accountToDelete.value = null
}

// Execute delete after confirmation
const executeDelete = async () => {
    if (!accountToDelete.value) return

    try {
        deleteLoading.value = true
        await adminClient.socials.delete(accountToDelete.value.id)
        showNotification('success', `${formatPlatformName(accountToDelete.value.type)} account removed successfully`)

        // Close dialog and refresh data
        showDeleteDialog.value = false
        accountToDelete.value = null
        refreshData()
    } catch (error) {
        showNotification('error', `Failed to delete account: ${error.message || 'Unknown error'}`)
    } finally {
        deleteLoading.value = false
    }
}

// Handle avatar loading errors
const handleAvatarError = (event) => {
    if (event.target) {
        event.target.style.display = 'none';
    }
}

onMounted(() => {
    loadSocialAccounts()
})
</script>
