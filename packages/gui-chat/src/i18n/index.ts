import { createI18n } from 'vue-i18n';

import zh_cn from './lang/zh-cn';
import en from './lang/en';
import ja from './lang/ja';

export type Language = 'en' | 'zh-cn' | 'ja';

const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
        "zh-cn": zh_cn,
        "en": en,
        "ja": ja,
    }
});

export default i18n;
