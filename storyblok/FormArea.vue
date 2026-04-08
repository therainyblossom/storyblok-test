<script setup lang="ts">
defineProps({
    blok: {
        type: Object,
        required: true
    }
})

</script>

<template>
    <div v-editable="blok">
        <template v-for="formItem in blok.form" :key="formItem.uuid || formItem._uid">
            <StoryblokComponent :blok="formItem.content" />
        </template>
    </div>
</template>
