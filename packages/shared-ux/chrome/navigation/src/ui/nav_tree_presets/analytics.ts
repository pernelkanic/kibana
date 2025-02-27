/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type { NodeDefinitionWithChildren } from '.';

export type ID = 'sharedux:analytics' | 'root' | 'discover' | 'dashboard' | 'visualize_library';

export const analytics: NodeDefinitionWithChildren<ID> = {
  // Make sure we have a unique id otherwise it might override a custom id from the project
  id: 'sharedux:analytics',
  title: 'Data exploration',
  icon: 'stats',
  children: [
    {
      id: 'root',
      children: [
        {
          title: 'Discover',
          id: 'discover',
          href: '/app/discover',
        },
        {
          title: 'Dashboard',
          id: 'dashboard',
          href: '/app/dashboards',
        },
        {
          id: 'visualize_library',
          title: 'Visualize Library',
          href: '/app/visualize',
        },
      ],
    },
  ],
};
