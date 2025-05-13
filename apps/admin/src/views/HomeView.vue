<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <h1 class="text-2xl font-bold text-white">Dashboard</h1>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="bg-neutral-800 rounded-lg shadow-md p-6">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-neutral-400 text-sm">Shortened Links</p>
                        <h2 class="text-2xl font-bold text-white mt-1">{{ summary.shortlinks || 0 }}</h2>
                    </div>
                    <div class="bg-blue-600/20 p-3 rounded-full">
                        <i class="fas fa-link text-blue-500"></i>
                    </div>
                </div>
            </div>

            <div class="bg-neutral-800 rounded-lg shadow-md p-6">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-neutral-400 text-sm">Queue Items</p>
                        <h2 class="text-2xl font-bold text-white mt-1">{{ summary.queueItems || 0 }}</h2>
                    </div>
                    <div class="bg-purple-600/20 p-3 rounded-full">
                        <i class="fas fa-list-alt text-purple-500"></i>
                    </div>
                </div>
            </div>

            <div class="bg-neutral-800 rounded-lg shadow-md p-6">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-neutral-400 text-sm">Total Clicks</p>
                        <h2 class="text-2xl font-bold text-white mt-1">{{ formatNumber(summary.totalClicks || 0) }}</h2>
                    </div>
                    <div class="bg-green-600/20 p-3 rounded-full">
                        <i class="fas fa-mouse-pointer text-green-500"></i>
                    </div>
                </div>
            </div>

            <div class="bg-neutral-800 rounded-lg shadow-md p-6">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-neutral-400 text-sm">Social Accounts</p>
                        <h2 class="text-2xl font-bold text-white mt-1">{{ summary.socialAccounts || 0 }}</h2>
                    </div>
                    <div class="bg-amber-600/20 p-3 rounded-full">
                        <i class="fas fa-share-alt text-amber-500"></i>
                    </div>
                </div>
            </div>
        </div>

        <div class="space-y-6">
            <div class="bg-neutral-800 rounded-lg shadow-md">
                <div class="p-6 border-b border-neutral-700">
                    <h3 class="text-lg font-medium text-white">Traffic Overview</h3>
                </div>
                <div class="p-6">
                    <div class="h-72 bg-neutral-800 rounded-md">
                        <canvas ref="trafficChart" class="w-full h-full"></canvas>
                    </div>
                    <div class="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                            <p class="text-sm text-neutral-400">Total Clicks</p>
                            <p class="text-xl font-semibold text-white">{{ formatNumber(summary.totalClicks || 0) }}</p>
                        </div>
                        <div>
                            <p class="text-sm text-neutral-400">Unique Visitors</p>
                            <p class="text-xl font-semibold text-white">{{ formatNumber(summary.uniqueVisitors || 0) }}</p>
                        </div>
                        <div>
                            <p class="text-sm text-neutral-400">Conversion Rate</p>
                            <p class="text-xl font-semibold text-white">{{ summary.conversionRate || 0 }}%</p>
                        </div>
                        <div>
                            <p class="text-sm text-neutral-400">Avg. CTR</p>
                            <p class="text-xl font-semibold text-white">{{ summary.avgCTR || 0 }}%</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="bg-neutral-800 rounded-lg shadow-md">
                    <div class="p-6 border-b border-neutral-700">
                        <h3 class="text-lg font-medium text-white">Top Performing Links</h3>
                    </div>
                    <div class="p-6">
                        <div class="space-y-4">
                            <div v-for="(link, index) in topLinks" :key="index" class="flex items-start gap-4">
                                <div class="flex-shrink-0 h-10 w-10 bg-blue-600/20 rounded-md flex items-center justify-center text-blue-500">
                                    <i class="fas fa-link"></i>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <h4 class="text-base font-medium text-white truncate">{{ link.title }}</h4>
                                    <div class="flex items-center mt-1">
                                        <span class="text-neutral-400 text-xs">{{ link.shortUrl }}</span>
                                    </div>
                                    <div class="flex items-center mt-2 text-sm">
                                        <div class="flex items-center text-neutral-400 mr-4">
                                            <i class="fas fa-mouse-pointer text-xs mr-1"></i>
                                            {{ formatNumber(link.clicks || 0) }} clicks
                                        </div>
                                        <div class="flex items-center text-neutral-400">
                                            <i class="fas fa-chart-line text-xs mr-1"></i>
                                            {{ link.ctr || 0 }}% CTR
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div v-if="topLinks.length === 0" class="p-4 bg-neutral-700/20 rounded-lg">
                                <p class="text-sm text-neutral-400 text-center">No links available yet.</p>
                            </div>
                        </div>
                    </div>
                    <div class="px-6 py-4 border-t border-neutral-700">
                        <a href="/shortlinks" class="text-blue-500 hover:text-blue-400 text-sm font-medium">View all links →</a>
                    </div>
                </div>

                <div class="bg-neutral-800 rounded-lg shadow-md">
                    <div class="p-6 border-b border-neutral-700">
                        <h3 class="text-lg font-medium text-white">Recent Queue Items</h3>
                    </div>
                    <div class="p-6">
                        <div class="space-y-4">
                            <div v-for="(item, index) in recentQueueItems" :key="index" class="flex items-start gap-4">
                                <div class="flex-shrink-0 h-10 w-10 bg-purple-600/20 rounded-md flex items-center justify-center text-purple-500">
                                    <i class="fas fa-list-alt"></i>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <h4 class="text-base font-medium text-white truncate">{{ item.title }}</h4>
                                    <div class="flex items-center mt-1">
                                        <span class="text-neutral-400 text-xs">{{ formatDate(item.pubDate) }}</span>
                                    </div>
                                    <div class="flex items-center mt-2">
                                        <span
                                            class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                                            :class="{
                                                'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': item.processed,
                                                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': !item.processed
                                            }"
                                        >
                                            {{ item.processed ? 'Processed' : 'Pending' }}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div v-if="recentQueueItems.length === 0" class="p-4 bg-neutral-700/20 rounded-lg">
                                <p class="text-sm text-neutral-400 text-center">No queue items available yet.</p>
                            </div>
                        </div>
                    </div>
                    <div class="px-6 py-4 border-t border-neutral-700">
                        <a href="/queue" class="text-blue-500 hover:text-blue-400 text-sm font-medium">View all queue items →</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Chart from 'chart.js/auto';
import { useAdminClient } from '../composable/useAdminClient';

const adminClient = useAdminClient();
const trafficChart = ref<HTMLCanvasElement | null>(null);
let chart: any = null;

const summary = ref({
    shortlinks: 0,
    queueItems: 0,
    totalClicks: 0,
    socialAccounts: 0,
    uniqueVisitors: 0,
    conversionRate: 0,
    avgCTR: 0,
    trafficData: []
});

const topLinks = ref<any[]>([]);
const recentQueueItems = ref<any[]>([]);

const createTrafficChart = () => {
    if (!trafficChart.value) return;

    const ctx = trafficChart.value.getContext('2d');
    if (!ctx) return;

    if (chart) {
        chart.destroy();
    }

    const trafficData = summary.value.trafficData || [];

    if (trafficData.length > 0) {
        const labels = trafficData.map(item => {
            const date = new Date(item.date);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });

        const clicksData = trafficData.map(item => item.clicks || 0);
        const visitorsData = trafficData.map(item => item.visitors || 0);

        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Total Clicks',
                        data: clicksData,
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderColor: 'rgba(59, 130, 246, 1)',
                        borderWidth: 2,
                        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 1,
                        pointRadius: 4,
                        tension: 0.3,
                        fill: true
                    },
                    {
                        label: 'Unique Visitors',
                        data: visitorsData,
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderColor: 'rgba(16, 185, 129, 1)',
                        borderWidth: 2,
                        pointBackgroundColor: 'rgba(16, 185, 129, 1)',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 1,
                        pointRadius: 4,
                        tension: 0.3,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            font: {
                                family: 'system-ui'
                            },
                            boxWidth: 12,
                            padding: 15
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(30, 41, 59, 0.9)',
                        titleColor: 'rgba(255, 255, 255, 0.9)',
                        bodyColor: 'rgba(255, 255, 255, 0.7)',
                        borderColor: 'rgba(71, 85, 105, 0.5)',
                        borderWidth: 1,
                        padding: 10,
                        displayColors: true,
                        boxWidth: 8,
                        boxHeight: 8,
                        callbacks: {
                            label: function(context: any) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += formatNumber(context.parsed.y);
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(71, 85, 105, 0.2)',
                            drawBorder: false
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.6)',
                            font: {
                                family: 'system-ui',
                                size: 11
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(71, 85, 105, 0.2)',
                            drawBorder: false
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.6)',
                            font: {
                                family: 'system-ui',
                                size: 11
                            },
                            callback: function(value: any) {
                                return formatNumber(value);
                            }
                        }
                    }
                },
                interaction: {
                    mode: 'index',
                    intersect: false
                }
            }
        });
    } else {
        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['No Data Available'],
                datasets: [
                    {
                        data: [0],
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderColor: 'rgba(59, 130, 246, 1)',
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    }
                },
                scales: {
                    x: {
                        display: true,
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        display: false,
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }
};

onMounted(async () => {
    try {
        // In a real implementation, these would be actual API calls
        // For demo purposes, we'll use mock data

        // Mock data for summary stats
        summary.value = {
            shortlinks: 24,
            queueItems: 12,
            totalClicks: 1483,
            socialAccounts: 3,
            uniqueVisitors: 856,
            conversionRate: 4.8,
            avgCTR: 2.7,
            trafficData: Array.from({ length: 14 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (13 - i));
                return {
                    date: date.toISOString(),
                    clicks: Math.floor(Math.random() * 100) + 50,
                    visitors: Math.floor(Math.random() * 60) + 30
                };
            })
        };

        // Mock data for top links
        topLinks.value = [
            {
                title: "New Product Launch: Social Media Tools",
                shortUrl: "autop.click/r/prod-launch",
                clicks: 245,
                ctr: 7.2
            },
            {
                title: "10 Ways to Improve Your Social Media Strategy",
                shortUrl: "autop.click/r/10ways",
                clicks: 187,
                ctr: 5.4
            },
            {
                title: "Social Media Analytics Workshop",
                shortUrl: "autop.click/r/workshop",
                clicks: 142,
                ctr: 4.8
            },
            {
                title: "Instagram Marketing Guide for 2023",
                shortUrl: "autop.click/r/insta-guide",
                clicks: 128,
                ctr: 3.9
            }
        ];

        // Mock data for recent queue items
        recentQueueItems.value = [
            {
                title: "How AI Is Changing Social Media Management",
                pubDate: new Date().toISOString(),
                processed: false
            },
            {
                title: "Best Times to Post on Social Media in 2023",
                pubDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                processed: true
            },
            {
                title: "Facebook Algorithm Changes: What You Need to Know",
                pubDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                processed: true
            },
            {
                title: "Building Your Brand on Twitter/X: Step-by-Step Guide",
                pubDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                processed: true
            }
        ];

        // In a real implementation, you'd make actual API calls:
        // const shortlinkStats = await adminClient.shortlinks.getStats();
        // const queueStats = await adminClient.queue.getStats();
        // const socialStats = await adminClient.socials.getStats();

        createTrafficChart();
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
    }
});

const formatNumber = (num: number): string => {
    if (num >= 1000000)
        return (num / 1000000).toFixed(1) + 'M';
    else if (num >= 1000)
        return (num / 1000).toFixed(1) + 'k';

    return num.toString();
};

const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
};
</script>