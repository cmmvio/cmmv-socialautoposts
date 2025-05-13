<template>Redirecting...</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAdminClient } from '../composable/useAdminClient';

const router = useRouter();
const adminClient = useAdminClient();

onMounted(() => {
    adminClient.session.logout();
    router.push('/login');
});
</script>