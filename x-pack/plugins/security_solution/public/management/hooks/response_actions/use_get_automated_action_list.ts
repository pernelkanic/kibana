/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { lastValueFrom } from 'rxjs';

import { compact, filter, map } from 'lodash';
import { expandDottedObject } from '../../../../common/utils/expand_dotted';
import type { ActionDetails, LogsEndpointActionWithHosts } from '../../../../common/endpoint/types';
import type { ResponseActionsSearchHit } from '../../../../common/search_strategy/security_solution/response_actions/types';
import { SortOrder } from '../../../../common/search_strategy/security_solution/response_actions/types';
import type {
  ActionResponsesRequestOptions,
  ActionRequestOptions,
  ActionRequestStrategyResponse,
  ActionResponsesRequestStrategyResponse,
} from '../../../../common/search_strategy/security_solution/response_actions';
import { ResponseActionsQueries } from '../../../../common/search_strategy/security_solution/response_actions';
import { useKibana } from '../../../common/lib/kibana';
import type {
  EndpointAutomatedActionListRequestQuery,
  EndpointAutomatedActionResponseRequestQuery,
} from '../../../../common/endpoint/schema/automated_actions';

interface GetAutomatedActionsListOptions {
  enabled: boolean;
}

export const useGetAutomatedActionList = (
  query: EndpointAutomatedActionListRequestQuery,
  { enabled }: GetAutomatedActionsListOptions
): UseQueryResult<ActionRequestStrategyResponse & { items: LogsEndpointActionWithHosts[] }> => {
  const { data } = useKibana().services;

  const { alertIds } = query;
  return useQuery({
    queryKey: ['get-automated-action-list', { alertIds }],
    queryFn: async () => {
      const responseData = await lastValueFrom(
        data.search.search<ActionRequestOptions, ActionRequestStrategyResponse>(
          {
            alertIds,
            sort: {
              order: SortOrder.desc,
              field: '@timestamp',
            },
            factoryQueryType: ResponseActionsQueries.actions,
          },
          {
            strategy: 'securitySolutionSearchStrategy',
          }
        )
      );

      // fields have to firstly be expanded from dotted object to kind of normal nested object
      const items = map(
        filter(responseData.edges, 'fields'),
        (
          edge: ResponseActionsSearchHit & {
            fields: object;
          }
        ) => {
          return expandDottedObject(edge.fields, true);
        }
      );

      return {
        ...responseData,
        items: compact(items),
      };
    },
    enabled,
    keepPreviousData: true,
  });
};

interface GetAutomatedActionResponseListOptions {
  enabled: boolean;
  action: LogsEndpointActionWithHosts;
  isLive?: boolean;
}

type GetAutomatedActionResponseListResponse = Pick<
  ActionDetails,
  'completedAt' | 'isExpired' | 'wasSuccessful' | 'isCompleted' | 'status'
> & {
  action_id: string;
};

export const useGetAutomatedActionResponseList = (
  query: EndpointAutomatedActionResponseRequestQuery,
  { enabled, action: requestAction, isLive = false }: GetAutomatedActionResponseListOptions
): UseQueryResult<ActionDetails> => {
  const { data } = useKibana().services;
  const { expiration, actionId, agent } = query;

  return useQuery({
    queryKey: ['allResponsesResults', { actionId }],
    queryFn: async (): Promise<GetAutomatedActionResponseListResponse> => {
      const responseData = await lastValueFrom(
        data.search.search<ActionResponsesRequestOptions, ActionResponsesRequestStrategyResponse>(
          {
            actionId,
            expiration,
            sort: {
              order: SortOrder.desc,
              field: '@timestamp',
            },
            agents: (Array.isArray(agent.id) ? agent.id : [agent.id]).length,
            factoryQueryType: ResponseActionsQueries.results,
          },
          {
            strategy: 'securitySolutionSearchStrategy',
          }
        )
      );

      const action = responseData.edges[0]?._source;

      return {
        action_id: actionId,
        completedAt: action?.EndpointActions.completed_at,
        isExpired: responseData.isExpired,
        wasSuccessful: responseData.wasSuccessful,
        isCompleted: responseData.isCompleted,
        status: responseData.status,
      };
    },
    select: (response) => combineResponse(requestAction, response),
    keepPreviousData: true,
    enabled,
    refetchInterval: isLive ? 5000 : false,
  });
};

const combineResponse = (
  action: LogsEndpointActionWithHosts,
  responseData: GetAutomatedActionResponseListResponse
): ActionDetails => {
  const { rule } = action;
  const { parameters, alert_id: alertId, comment, command, hosts } = action.EndpointActions.data;

  return {
    id: action.EndpointActions.action_id,
    agents: action.agent.id as string[],
    parameters,
    ...(alertId?.length ? { alertIds: alertId } : {}),
    ...(rule
      ? {
          ruleId: rule.id,
          ruleName: rule.name,
        }
      : {}),
    createdBy: action.rule?.name || 'unknown',
    comment,
    command,
    hosts,
    startedAt: action['@timestamp'],
    completedAt: responseData?.completedAt,
    isCompleted: !!responseData?.isCompleted,
    isExpired: !!responseData?.isExpired,
    wasSuccessful: !!responseData?.isCompleted,
    status: responseData.status,
    agentState: {},
    errors: action.error ? [action.error.message as string] : undefined,
  };
};
