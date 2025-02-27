/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { Exception } from '../objects/exception';
import {
  FIELD_INPUT,
  OPERATOR_INPUT,
  CANCEL_BTN,
  EXCEPTION_ITEM_CONTAINER,
  EXCEPTION_FLYOUT_TITLE,
  VALUES_INPUT,
  VALUES_MATCH_ANY_INPUT,
  EXCEPTION_EDIT_FLYOUT_SAVE_BTN,
  CLOSE_ALERTS_CHECKBOX,
  CONFIRM_BTN,
  EXCEPTION_ITEM_NAME_INPUT,
  CLOSE_SINGLE_ALERT_CHECKBOX,
  ADD_TO_RULE_RADIO_LABEL,
  ADD_TO_SHARED_LIST_RADIO_LABEL,
  SHARED_LIST_SWITCH,
  OS_SELECTION_SECTION,
  OS_INPUT,
  EXCEPTION_FIELD_MAPPING_CONFLICTS_ICON,
  EXCEPTION_FIELD_MAPPING_CONFLICTS_TOOLTIP,
  EXCEPTION_FIELD_MAPPING_CONFLICTS_ACCORDION_ICON,
  EXCEPTION_FIELD_MAPPING_CONFLICTS_DESCRIPTION,
  EXCEPTION_ITEM_VIEWER_CONTAINER,
} from '../screens/exceptions';

export const assertNumberOfExceptionItemsExists = (numberOfItems: number) => {
  cy.get(EXCEPTION_ITEM_VIEWER_CONTAINER).should('have.length', numberOfItems);
};

export const expectToContainItem = (container: string, itemName: string) => {
  cy.log(`Expecting exception items table to contain '${itemName}'`);
  cy.get(container).should('include.text', itemName);
};

export const assertExceptionItemsExists = (container: string, itemNames: string[]) => {
  for (const itemName of itemNames) {
    expectToContainItem(container, itemName);
  }
};

export const addExceptionEntryFieldValueOfItemX = (
  field: string,
  itemIndex = 0,
  fieldIndex = 0
) => {
  cy.get(EXCEPTION_ITEM_CONTAINER)
    .eq(itemIndex)
    .find(FIELD_INPUT)
    .eq(fieldIndex)
    .type(`${field}{enter}`);
  cy.get(EXCEPTION_FLYOUT_TITLE).click();
};

export const searchExceptionEntryFieldWithPrefix = (fieldPrefix: string, index = 0) => {
  cy.get(FIELD_INPUT).eq(index).click({ force: true });
  cy.get(FIELD_INPUT).eq(index).type(fieldPrefix);
};

export const showFieldConflictsWarningTooltipWithMessage = (message: string, index = 0) => {
  cy.get(EXCEPTION_FIELD_MAPPING_CONFLICTS_ICON).eq(index).realHover();
  cy.get(EXCEPTION_FIELD_MAPPING_CONFLICTS_TOOLTIP).should('be.visible');
  cy.get(EXCEPTION_FIELD_MAPPING_CONFLICTS_TOOLTIP).should('have.text', message);
};

export const showMappingConflictsWarningMessage = (message: string, index = 0) => {
  cy.get(EXCEPTION_FIELD_MAPPING_CONFLICTS_ACCORDION_ICON).eq(index).click({ force: true });
  cy.get(EXCEPTION_FIELD_MAPPING_CONFLICTS_DESCRIPTION).eq(index).should('have.text', message);
};

export const selectCurrentEntryField = (index = 0) => {
  cy.get(FIELD_INPUT).eq(index).type(`{downarrow}{enter}`);
};

export const addExceptionEntryFieldValue = (field: string, index = 0) => {
  cy.get(FIELD_INPUT).eq(index).type(`${field}{enter}`);
  cy.get(EXCEPTION_FLYOUT_TITLE).click();
};

export const addExceptionEntryOperatorValue = (operator: string, index = 0) => {
  cy.get(OPERATOR_INPUT).eq(index).type(`${operator}{enter}`);
  cy.get(EXCEPTION_FLYOUT_TITLE).click();
};

export const addExceptionEntryFieldValueValue = (value: string, index = 0) => {
  cy.get(VALUES_INPUT).eq(index).type(`${value}{enter}`);
  cy.get(EXCEPTION_FLYOUT_TITLE).click();
};

export const addExceptionEntryFieldMatchAnyValue = (value: string, index = 0) => {
  cy.get(VALUES_MATCH_ANY_INPUT).eq(index).type(`${value}{enter}`);
  cy.get(EXCEPTION_FLYOUT_TITLE).click();
};

export const closeExceptionBuilderFlyout = () => {
  cy.get(CANCEL_BTN).click();
};

export const editException = (updatedField: string, itemIndex = 0, fieldIndex = 0) => {
  addExceptionEntryFieldValueOfItemX(`${updatedField}{downarrow}{enter}`, itemIndex, fieldIndex);
  addExceptionEntryFieldValueValue('foo', itemIndex);
};

export const addExceptionFlyoutItemName = (name: string) => {
  // waitUntil reduces the flakiness of this task because sometimes
  // there are background process/events happening which prevents cypress
  // to completely write the name of the exception before it page re-renders
  // thereby cypress losing the focus on the input element.
  cy.waitUntil(() => cy.get(EXCEPTION_ITEM_NAME_INPUT).then(($el) => Cypress.dom.isAttached($el)));
  cy.get(EXCEPTION_ITEM_NAME_INPUT).should('exist');
  cy.get(EXCEPTION_ITEM_NAME_INPUT).scrollIntoView();
  cy.get(EXCEPTION_ITEM_NAME_INPUT).should('be.visible');
  cy.get(EXCEPTION_ITEM_NAME_INPUT).first().focus();
  cy.get(EXCEPTION_ITEM_NAME_INPUT).type(`${name}{enter}`, { force: true });
  cy.get(EXCEPTION_ITEM_NAME_INPUT).should('have.value', name);
};

export const editExceptionFlyoutItemName = (name: string) => {
  cy.get(EXCEPTION_ITEM_NAME_INPUT).clear();
  cy.get(EXCEPTION_ITEM_NAME_INPUT).type(`${name}{enter}`);
  cy.get(EXCEPTION_ITEM_NAME_INPUT).should('have.value', name);
};

export const selectBulkCloseAlerts = () => {
  cy.get(CLOSE_ALERTS_CHECKBOX).should('exist');
  cy.get(CLOSE_ALERTS_CHECKBOX).click({ force: true });
};

export const selectCloseSingleAlerts = () => {
  cy.get(CLOSE_SINGLE_ALERT_CHECKBOX).click({ force: true });
};

export const addExceptionConditions = (exception: Exception) => {
  cy.get(FIELD_INPUT).type(`${exception.field}{downArrow}{enter}`);
  cy.get(OPERATOR_INPUT).type(`${exception.operator}{enter}`);
  exception.values.forEach((value) => {
    cy.get(VALUES_INPUT).type(`${value}{enter}`);
  });
};

export const submitNewExceptionItem = () => {
  cy.get(CONFIRM_BTN).click();
  cy.get(CONFIRM_BTN).should('not.exist');
};

export const submitEditedExceptionItem = () => {
  cy.get(EXCEPTION_EDIT_FLYOUT_SAVE_BTN).click();
  cy.get(EXCEPTION_EDIT_FLYOUT_SAVE_BTN).should('not.exist');
};

export const selectAddToRuleRadio = () => {
  cy.get(ADD_TO_RULE_RADIO_LABEL).click();
};

export const selectSharedListToAddExceptionTo = (numListsToCheck = 1) => {
  cy.get(ADD_TO_SHARED_LIST_RADIO_LABEL).click();
  for (let i = 0; i < numListsToCheck; i++) {
    cy.get(SHARED_LIST_SWITCH).eq(i).click();
  }
};

export const selectOs = (os: string) => {
  cy.get(OS_SELECTION_SECTION).should('exist');
  cy.get(OS_INPUT).type(`${os}{downArrow}{enter}`);
};
