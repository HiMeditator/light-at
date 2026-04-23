import { defineStore } from 'pinia';
import { ref } from 'vue';
import i18n from '@/i18n';
import type { Language } from '@/i18n';

export const useConfigStore = defineStore('config', () => {
    const welcomeInfo = ref(true);
    const sendShortcut = ref('Ctrl+Enter');

    function setLanguage(lang: Language){
        i18n.global.locale.value = lang;
    }

    function updateSettings(settingsStr: string){
        const settings = JSON.parse(settingsStr);
        welcomeInfo.value = settings.welcomeInfo;
        sendShortcut.value = settings.sendShortcut;
        if(settings?.codeTheme){
            import(`@/assets/css/highlight.js/${settings.codeTheme}.css`)
        }
    }

    return {
        welcomeInfo,
        sendShortcut,
        setLanguage,
        updateSettings
    };
})
