/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

// plane types
import type { TIssueServiceType, TWorkItemWidgets } from "@plane/types";
// lazy-bird integration
import { LazyBirdTaskPanel } from "@/plane-web/components/lazy-bird";

export type TWorkItemAdditionalWidgetCollapsiblesProps = {
  disabled: boolean;
  hideWidgets: TWorkItemWidgets[];
  issueServiceType: TIssueServiceType;
  projectId: string;
  workItemId: string;
  workspaceSlug: string;
};

export function WorkItemAdditionalWidgetCollapsibles(props: TWorkItemAdditionalWidgetCollapsiblesProps) {
  const { disabled, projectId, workItemId, workspaceSlug } = props;

  return (
    <LazyBirdTaskPanel issueId={workItemId} projectId={projectId} workspaceSlug={workspaceSlug} disabled={disabled} />
  );
}
