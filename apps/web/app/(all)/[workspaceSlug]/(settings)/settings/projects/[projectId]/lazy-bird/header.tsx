/**
 * Lazy Bird project settings page header.
 */

import { observer } from "mobx-react";
import { Bot } from "lucide-react";
import { Breadcrumbs } from "@plane/ui";
import { BreadcrumbLink } from "@/components/common/breadcrumb-link";
import { SettingsPageHeader } from "@/components/settings/page-header";

export const LazyBirdProjectSettingsHeader = observer(function LazyBirdProjectSettingsHeader() {
  return (
    <SettingsPageHeader
      leftItem={
        <div className="flex items-center gap-2">
          <Breadcrumbs>
            <Breadcrumbs.Item
              component={
                <BreadcrumbLink
                  label="Lazy Bird"
                  icon={<Bot className="size-4 text-tertiary" />}
                />
              }
            />
          </Breadcrumbs>
        </div>
      }
    />
  );
});
