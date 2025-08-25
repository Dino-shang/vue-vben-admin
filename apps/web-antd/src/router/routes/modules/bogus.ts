import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:database',
      order: 2,
      title: $t('page.bogus.title'),
    },
    name: 'Bogus',
    path: '/bogus',
    children: [
      {
        name: 'BogusSingle',
        path: '/bogus/single',
        component: () => import('#/views/bogus/single/index.vue'),
        meta: {
          icon: 'lucide:file-text',
          title: $t('page.bogus.single'),
        },
      },
      {
        name: 'BogusBatch',
        path: '/bogus/batch',
        component: () => import('#/views/bogus/batch/index.vue'),
        meta: {
          icon: 'lucide:layers',
          title: $t('page.bogus.batch'),
        },
      },
    ],
  },
];

export default routes; 
