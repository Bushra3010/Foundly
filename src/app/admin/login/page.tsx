import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Brand, Icon } from "@/components/icon";
import { isPlatformAdmin } from "@/lib/admin";
import { getCurrentUser } from "@/lib/auth/session";
import { AdminLoginForm } from "./admin-login-form";
import "../admin.css";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false, follow: false } };

export default async function AdminLoginPage() {
  const user = await getCurrentUser();
  if (user && isPlatformAdmin(user.email)) redirect("/admin");
  return (
    <main id="main" className="adm-login">
      <section className="adm-card">
        <div className="adm-brand">
          <Brand compact />
          <span className="adm-pill"><Icon name="shield" size={13} /> Admin</span>
        </div>
        <h1>Founder console</h1>
        <p>Sign in to see sign-ups, businesses and platform health. This area is only for the Foundly team.</p>
        <AdminLoginForm />
        <p className="adm-note"><Icon name="shield" size={14} /> Use the email and password of your Foundly account. Only approved admin emails can enter.</p>
      </section>
    </main>
  );
}
