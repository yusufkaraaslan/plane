/**
 * Lazy Bird project settings page.
 *
 * Route: /[workspaceSlug]/settings/projects/[projectId]/lazy-bird
 */

import { observer } from "mobx-react";
import { EUserPermissions, EUserPermissionsLevel } from "@plane/constants";
import { NotAuthorizedView } from "@/components/auth-screens/not-authorized-view";
import { PageHead } from "@/components/core/page-title";
import { SettingsContentWrapper } from "@/components/settings/content-wrapper";
import { useProject } from "@/hooks/store/use-project";
import { useUserPermissions } from "@/hooks/store/user";
import { LazyBirdSettings } from "@/ce/components/lazy-bird";
import type { Route } from "./+types/page";
import { LazyBirdProjectSettingsHeader } from "./header";

function LazyBirdSettingsPage({ params }: Route.ComponentProps) {
  const { workspaceSlug, projectId } = params;
  const { workspaceUserInfo, allowPermissions } = useUserPermissions();
  const { currentProjectDetails: projectDetails } = useProject();

  const canPerformProjectAdminActions = allowPermissions(
    [EUserPermissions.ADMIN],
    EUserPermissionsLevel.PROJECT
  );

  const pageTitle = projectDetails?.name
    ? `${projectDetails.name} - Lazy Bird`
    : undefined;

  if (workspaceUserInfo && !canPerformProjectAdminActions) {
    return <NotAuthorizedView section="settings" isProjectView className="h-auto" />;
  }

  return (
    <SettingsContentWrapper header={<LazyBirdProjectSettingsHeader />} hugging>
      <PageHead title={pageTitle} />
      <section className={`w-full ${canPerformProjectAdminActions ? "" : "opacity-60"}`}>
        <LazyBirdSettings
          projectId={projectId}
          workspaceSlug={workspaceSlug}
          disabled={!canPerformProjectAdminActions}
        />
      </section>
    </SettingsContentWrapper>
  );
}

export default observer(LazyBirdSettingsPage);
