import { redirect } from "next/navigation";
import { ProfileSettingsForm } from "@/components/settings/profile-settings-form";
import { getCurrentStudentSession } from "@/lib/auth/session";
import { Card, PageHeader } from "@/components/ui";

export const instant = false;

export default async function SettingsPage() {
  const current = await getCurrentStudentSession();
  if (!current) redirect("/login");

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader eyebrow="ACCOUNT" first="Your campus" second="profile." description="Keep the account details connected to your FindIt profile current." />
      <Card className="mt-8 p-5 sm:p-8">
        <ProfileSettingsForm
          displayName={current.profile.displayName}
          email={current.profile.email}
          srn={current.profile.normalizedSrn}
        />
      </Card>
    </div>
  );
}
