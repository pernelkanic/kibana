/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { EuiCode, EuiEmptyPrompt, EuiLink, EuiTitle } from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n-react';

import React from 'react';

import { useKibana } from '@kbn/kibana-react-plugin/public';
import { useTrackPageview } from '@kbn/observability-shared-plugin/public';
import { useBreadcrumbs } from '../hooks/use_breadcrumbs';

export const MappingErrorPage = () => {
  useTrackPageview({ app: 'uptime', path: 'mapping-error' });
  useTrackPageview({ app: 'uptime', path: 'mapping-error', delay: 15000 });

  const docLinks = useKibana().services.docLinks;

  useBreadcrumbs([
    {
      text: i18n.translate('xpack.synthetics.mappingErrorRoute.breadcrumb', {
        defaultMessage: 'Mapping error',
      }),
    },
  ]);

  return (
    <EuiEmptyPrompt
      data-test-subj="xpack.synthetics.mappingsErrorPage"
      iconColor="danger"
      iconType="cross"
      title={
        <EuiTitle>
          <h3>
            <FormattedMessage
              id="xpack.synthetics.public.pages.mappingError.title"
              defaultMessage="Heartbeat mappings missing"
            />
          </h3>
        </EuiTitle>
      }
      body={
        <div>
          <p>
            <FormattedMessage
              id="xpack.synthetics.public.pages.mappingError.bodyMessage"
              defaultMessage="Incorrect mappings detected! Perhaps you forgot to run the heartbeat {setup} command?"
              values={{ setup: <EuiCode>setup</EuiCode> }}
            />
          </p>
          {docLinks && (
            <p>
              <FormattedMessage
                id="xpack.synthetics.public.pages.mappingError.bodyDocsLink"
                defaultMessage="You can learn how to troubleshoot this issue in the {docsLink}."
                values={{
                  docsLink: (
                    <EuiLink
                      data-test-subj="syntheticsMappingErrorPageDocsLink"
                      href={`${docLinks.ELASTIC_WEBSITE_URL}guide/en/observability/${docLinks.DOC_LINK_VERSION}/troubleshoot-uptime-mapping-issues.html`}
                      target="_blank"
                    >
                      docs
                    </EuiLink>
                  ),
                }}
              />
            </p>
          )}
        </div>
      }
    />
  );
};
