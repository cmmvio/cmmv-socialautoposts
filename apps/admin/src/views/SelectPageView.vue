<template>
    <div class="container mx-auto p-6 max-w-4xl">
        <div class="bg-neutral-800 rounded-lg p-6">
            <div class="flex justify-between items-center mb-6">
                <h1 class="text-2xl font-bold text-white">Select Facebook Page</h1>
                <button
                    @click="goBack"
                    class="px-3 py-1 bg-neutral-700 hover:bg-neutral-600 text-white text-sm font-medium rounded-md transition-colors"
                >
                    Cancel
                </button>
            </div>

            <!-- Loading state -->
            <div v-if="loading" class="bg-neutral-700 rounded-lg p-8 flex justify-center items-center">
                <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                <span class="ml-3 text-neutral-300">Loading your Facebook pages...</span>
            </div>

            <!-- Error state -->
            <div v-else-if="error" class="bg-neutral-700 rounded-lg p-8 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-white text-lg mb-2">Failed to load pages</p>
                <p class="text-neutral-300 mb-4">{{ error }}</p>
                <button @click="loadPages" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md">
                    Try Again
                </button>
            </div>

            <!-- Empty state -->
            <div v-else-if="pagesList.length === 0" class="bg-neutral-700 rounded-lg p-8 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-neutral-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-white text-lg mb-2">No Facebook Pages Found</p>
                <p class="text-neutral-300 mb-4">You don't have any Facebook pages or you need to grant more permissions.</p>
                <button @click="goBack" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md">
                    Go Back
                </button>
            </div>

            <!-- Pages list with radio buttons -->
            <div v-else>
                <div class="bg-neutral-700 rounded-lg overflow-hidden mb-6">
                    <ul class="divide-y divide-neutral-600">
                        <li
                            v-for="page in pagesList"
                            :key="page.id"
                            class="p-4 hover:bg-neutral-650"
                        >
                            <label class="flex items-start cursor-pointer w-full">
                                <div class="flex-shrink-0 mt-1">
                                    <input
                                        type="radio"
                                        :value="page.id"
                                        v-model="selectedPageId"
                                        class="h-5 w-5 text-blue-600 bg-neutral-800 border-neutral-500 focus:ring-blue-500 focus:ring-offset-neutral-700"
                                    >
                                </div>
                                <div class="ml-3 flex-grow">
                                    <div class="flex items-center mb-2">
                                        <div class="h-10 w-10 rounded-full flex-shrink-0 mr-3 overflow-hidden">
                                            <img
                                                v-if="page.avatar"
                                                :src="page.avatar"
                                                :alt="page.name"
                                                class="h-full w-full object-cover"
                                                @error="handleAvatarError($event, page.id)"
                                            >
                                            <div
                                                v-else
                                                class="h-full w-full bg-blue-600 flex items-center justify-center"
                                            >
                                                <span class="text-white text-sm font-bold">{{ page.name.charAt(0) }}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 class="text-base font-medium text-white">{{ page.name }}</h3>
                                            <p class="text-xs text-neutral-400">{{ page.category }}</p>
                                        </div>
                                    </div>

                                    <div class="text-xs text-neutral-400 mb-2">
                                        ID: {{ page.id }}
                                    </div>

                                    <div class="flex flex-wrap gap-1">
                                        <span
                                            v-for="task in page.tasks.slice(0, 3)"
                                            :key="task"
                                            class="px-2 py-0.5 text-xs bg-neutral-800 text-neutral-300 rounded"
                                        >
                                            {{ task }}
                                        </span>
                                        <span
                                            v-if="page.tasks.length > 3"
                                            class="px-2 py-0.5 text-xs bg-neutral-800 text-neutral-300 rounded"
                                        >
                                            +{{ page.tasks.length - 3 }} more
                                        </span>
                                    </div>
                                </div>
                            </label>
                        </li>
                    </ul>
                </div>

                <!-- Confirm button -->
                <div class="flex justify-end mt-4">
                    <button
                        @click="confirmSelection"
                        class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                        :disabled="!selectedPageId"
                    >
                        Confirm Selection
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAdminClient } from '../composable/useAdminClient';

const adminClient = useAdminClient();
const route = useRoute();
const router = useRouter();

const accessToken = route.query.accessToken as string;
const state = route.query.state as string;
const uuid = route.query.uuid as string;

const pagesList = ref<any[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const selectedPageId = ref<string>("");
const failedAvatars = ref<Set<string>>(new Set());

const handleAvatarError = (event: Event, pageId: string) => {
    failedAvatars.value.add(pageId);

    if (event.target)
        (event.target as HTMLImageElement).src = '';
};

const loadPages = async () => {
    try {
        loading.value = true;
        error.value = null;

        const response = await adminClient.facebook.listPages(accessToken, state, uuid);

        if (response && response.data) {
            pagesList.value = response.data;
        } else {
            pagesList.value = [];
        }

        loading.value = false;
    } catch (err: any) {
        loading.value = false;
        error.value = err.message || 'Failed to load Facebook pages';
        console.error('Error loading Facebook pages:', err);
    }
};

const confirmSelection = async () => {
    if (!selectedPageId.value) return;

    try {
        loading.value = true;

        const selectedPage = pagesList.value.find(page => page.id === selectedPageId.value);

        if (!selectedPage)
            throw new Error('Selected page not found');

       try {
            await adminClient.facebook.savePage({
                pageId: selectedPage.id,
                pageName: selectedPage.name,
                accessToken: selectedPage.access_token,
                avatar: selectedPage.avatar,
                uuid
            });

            window.close();
        } catch (saveErr) {}

        router.push({
            path: '/social-accounts',
            query: {
                success: 'true',
                message: `Successfully connected to Facebook page: ${selectedPage.name}`
            }
        });
    } catch (err: any) {
        loading.value = false;
        error.value = err.message || 'Failed to save selected page';
        console.error('Error saving Facebook page:', err);
    }
};

const goBack = () => {
    router.push('/social-accounts');
};

onMounted(() => {
    if (!accessToken || !state || !uuid) {
        error.value = 'Missing required parameters';
        loading.value = false;
        return;
    }

    loadPages();
});
</script>
