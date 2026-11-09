import Link from "next/link";
import { Card, PageHeader } from "@/components/ui";
import { requireAdminPage } from "@/lib/admin-guard";
import { ProjectForm } from "../project-form";

export const metadata = { title: "Add portfolio project" };

export default async function NewPortfolioProject() {
  await requireAdminPage();
  return (
    <>
      <PageHeader icon="reports" title="Add project" description="It stays hidden from /work until you tick Published." actions={<Link href="/admin/portfolio" className="text-sm font-semibold underline">Back to portfolio</Link>} />
      <Card>
        <ProjectForm />
      </Card>
    </>
  );
}
