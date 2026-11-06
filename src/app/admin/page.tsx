import { RosterImportForm } from "@/components/admin/roster-import-form";
import { PageHeader } from "@/components/ui";

export default function AdminPage() {
  return (
    <div className="shell py-12 sm:py-16">
      <div className="mx-auto max-w-4xl">
        <PageHeader
          eyebrow="ADMIN WORKSPACE"
          first="Keep campus"
          second="records current."
          description="Import an authorized student roster for campus eligibility and account review workflows."
        />
        <div className="mt-8">
          <RosterImportForm />
        </div>
      </div>
    </div>
  );
}
