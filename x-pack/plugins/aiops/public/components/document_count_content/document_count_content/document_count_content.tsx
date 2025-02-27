/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useEffect, useState, FC } from 'react';

import { EuiButtonEmpty, EuiFlexGroup, EuiFlexItem } from '@elastic/eui';

import { i18n } from '@kbn/i18n';
import type { WindowParameters } from '@kbn/aiops-utils';

import { DocumentCountStats } from '../../../get_document_stats';

import { DocumentCountChart, DocumentCountChartPoint } from '../document_count_chart';
import { TotalCountHeader } from '../total_count_header';

const clearSelectionLabel = i18n.translate(
  'xpack.aiops.documentCountContent.clearSelectionAriaLabel',
  {
    defaultMessage: 'Clear selection',
  }
);

export interface DocumentCountContentProps {
  brushSelectionUpdateHandler: (d: WindowParameters) => void;
  clearSelectionHandler: () => void;
  documentCountStats?: DocumentCountStats;
  documentCountStatsSplit?: DocumentCountStats;
  documentCountStatsSplitLabel?: string;
  totalCount: number;
  sampleProbability: number;
  windowParameters?: WindowParameters;
  incomingInitialAnalysisStart?: number | WindowParameters;
}

export const DocumentCountContent: FC<DocumentCountContentProps> = ({
  brushSelectionUpdateHandler,
  clearSelectionHandler,
  documentCountStats,
  documentCountStatsSplit,
  documentCountStatsSplitLabel = '',
  totalCount,
  sampleProbability,
  windowParameters,
  incomingInitialAnalysisStart,
}) => {
  const [isBrushCleared, setIsBrushCleared] = useState(true);
  const [initialAnalysisStart, setInitialAnalysisStart] = useState<
    number | WindowParameters | undefined
  >(incomingInitialAnalysisStart);

  useEffect(() => {
    setIsBrushCleared(windowParameters === undefined);
  }, [windowParameters]);

  const bucketTimestamps = Object.keys(documentCountStats?.buckets ?? {}).map((time) => +time);
  const splitBucketTimestamps = Object.keys(documentCountStatsSplit?.buckets ?? {}).map(
    (time) => +time
  );
  const timeRangeEarliest = Math.min(...[...bucketTimestamps, ...splitBucketTimestamps]);
  const timeRangeLatest = Math.max(...[...bucketTimestamps, ...splitBucketTimestamps]);

  if (
    documentCountStats === undefined ||
    documentCountStats.buckets === undefined ||
    timeRangeEarliest === undefined ||
    timeRangeLatest === undefined
  ) {
    return totalCount !== undefined ? (
      <TotalCountHeader totalCount={totalCount} sampleProbability={sampleProbability} />
    ) : null;
  }

  const chartPoints: DocumentCountChartPoint[] = Object.entries(documentCountStats.buckets).map(
    ([time, value]) => ({
      time: +time,
      value,
    })
  );

  let chartPointsSplit: DocumentCountChartPoint[] | undefined;
  if (documentCountStatsSplit?.buckets !== undefined) {
    chartPointsSplit = Object.entries(documentCountStatsSplit?.buckets).map(([time, value]) => ({
      time: +time,
      value,
    }));
  }

  function brushSelectionUpdate(d: WindowParameters, force: boolean) {
    if (!isBrushCleared || force) {
      brushSelectionUpdateHandler(d);
    }
    if (force) {
      setIsBrushCleared(false);
    }
  }

  function clearSelection() {
    setIsBrushCleared(true);
    setInitialAnalysisStart(undefined);
    clearSelectionHandler();
  }

  return (
    <>
      <EuiFlexGroup gutterSize="xs">
        <EuiFlexItem>
          <TotalCountHeader totalCount={totalCount} sampleProbability={sampleProbability} />
        </EuiFlexItem>
        {!isBrushCleared && (
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty
              onClick={clearSelection}
              size="xs"
              data-test-subj="aiopsClearSelectionBadge"
            >
              {clearSelectionLabel}
            </EuiButtonEmpty>
          </EuiFlexItem>
        )}
      </EuiFlexGroup>
      {documentCountStats.interval !== undefined && (
        <DocumentCountChart
          brushSelectionUpdateHandler={brushSelectionUpdate}
          chartPoints={chartPoints}
          chartPointsSplit={chartPointsSplit}
          timeRangeEarliest={timeRangeEarliest}
          timeRangeLatest={timeRangeLatest}
          interval={documentCountStats.interval}
          chartPointsSplitLabel={documentCountStatsSplitLabel}
          isBrushCleared={isBrushCleared}
          autoAnalysisStart={initialAnalysisStart}
        />
      )}
    </>
  );
};
