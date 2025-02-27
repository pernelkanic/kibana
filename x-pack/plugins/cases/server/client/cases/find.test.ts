/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import { v1 as uuidv1 } from 'uuid';

import type { Case } from '../../../common/api';

import { flattenCaseSavedObject } from '../../common/utils';
import { mockCases } from '../../mocks';
import { createCasesClientMockArgs, createCasesClientMockFindRequest } from '../mocks';
import { find } from './find';

describe('find', () => {
  describe('constructSearch', () => {
    const clientArgs = createCasesClientMockArgs();
    const casesMap = new Map<string, Case>(
      mockCases.map((obj) => {
        return [obj.id, flattenCaseSavedObject({ savedObject: obj, totalComment: 2 })];
      })
    );
    clientArgs.services.caseService.findCasesGroupedByID.mockResolvedValue({
      page: 1,
      perPage: 10,
      total: casesMap.size,
      casesMap,
    });
    clientArgs.services.caseService.getCaseStatusStats.mockResolvedValue({
      open: 1,
      'in-progress': 2,
      closed: 3,
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('search by uuid updates search term and adds rootSearchFields', async () => {
      const search = uuidv1();
      const findRequest = createCasesClientMockFindRequest({ search });

      await find(findRequest, clientArgs);
      await expect(clientArgs.services.caseService.findCasesGroupedByID).toHaveBeenCalled();

      const call = clientArgs.services.caseService.findCasesGroupedByID.mock.calls[0][0];

      expect(call.caseOptions.search).toBe(`"${search}" "cases:${search}"`);
      expect(call.caseOptions).toHaveProperty('rootSearchFields');
      expect(call.caseOptions.rootSearchFields).toStrictEqual(['_id']);
    });

    it('regular search term does not cause rootSearchFields to be appended', async () => {
      const search = 'foobar';
      const findRequest = createCasesClientMockFindRequest({ search });
      await find(findRequest, clientArgs);
      await expect(clientArgs.services.caseService.findCasesGroupedByID).toHaveBeenCalled();

      const call = clientArgs.services.caseService.findCasesGroupedByID.mock.calls[0][0];

      expect(call.caseOptions.search).toBe(search);
      expect(call.caseOptions).not.toHaveProperty('rootSearchFields');
    });

    it('should not have foo:bar attribute in request payload', async () => {
      const search = 'sample_text';
      const findRequest = createCasesClientMockFindRequest({ search });
      await expect(
        // @ts-expect-error foo is an invalid field
        find({ ...findRequest, foo: 'bar' }, clientArgs)
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"Failed to find cases: {\\"search\\":\\"sample_text\\",\\"searchFields\\":[\\"title\\",\\"description\\"],\\"severity\\":\\"low\\",\\"assignees\\":[],\\"reporters\\":[],\\"status\\":\\"open\\",\\"tags\\":[],\\"owner\\":[],\\"sortField\\":\\"createdAt\\",\\"sortOrder\\":\\"desc\\",\\"foo\\":\\"bar\\"}: Error: invalid keys \\"foo\\""`
      );
    });
  });

  describe('searchFields errors', () => {
    const clientArgs = createCasesClientMockArgs();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('invalid searchFields with array', async () => {
      const searchFields = ['foobar'];

      // @ts-expect-error
      const findRequest = createCasesClientMockFindRequest({ searchFields });

      await expect(find(findRequest, clientArgs)).rejects.toThrow(
        'Error: Invalid value "foobar" supplied to "searchFields"'
      );
    });

    it('invalid searchFields with single string', async () => {
      const searchFields = 'foobar';

      // @ts-expect-error
      const findRequest = createCasesClientMockFindRequest({ searchFields });

      await expect(find(findRequest, clientArgs)).rejects.toThrow(
        'Error: Invalid value "foobar" supplied to "searchFields"'
      );
    });
  });
});
