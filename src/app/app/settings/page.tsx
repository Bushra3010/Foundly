import { ActionForm } from "@/components/action-form";
import { SubmitButton } from "@/components/submit-button";
import { Badge, Card, PageHeader, TextField } from "@/components/ui";
import { getDb } from "@/db";
import { requireCtx } from "@/lib/auth/session";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { signOut } from "@/app/login/actions";
import { can } from "@/server/context";
import { listMembers, listPendingInvites } from "@/server/team";
import { hasPassword } from "@/server/auth";
import {
  changeRoleAction,
  inviteAction,
  removeMemberAction,
  revokeInviteAction,
  setLanguageAction,
  setPasswordAction,
  signOutEverywhereAction,
  transferOwnershipAction,
} from "./actions";
import { AccountSection } from "./account-section";

export const metadata = { title: "Settings" };

const ROLE_TEXT = { owner: "Owner", editor: "Editor", viewer: "Viewer" } as const;
const select = "block min-h-11 rounded-lg border border-border bg-surface px-3";

export default async function SettingsPage() {
  const ctx = await requireCtx();
  const locale = await getLocale();
  const db = await getDb();
  const [members, invites, passwordSet] = await Promise.all([
    listMembers(db, ctx),
    can(ctx, "owner") ? listPendingInvites(db, ctx) : [],
    hasPassword(db, ctx.userId),
  ]);
  const isOwner = can(ctx, "owner");

  return (
    <>
      <PageHeader icon="settings" title={t(locale, "nav.settings")} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-semibold">Your account</h2>
          <p className="mt-2 break-all">{ctx.user.email}</p>
          <p className="mt-1">
            <Badge tone="info">{ROLE_TEXT[ctx.role]}</Badge>
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <form action={signOut}>
              <SubmitButton variant="secondary">Sign out</SubmitButton>
            </form>
            <form action={signOutEverywhereAction}>
              <SubmitButton variant="secondary">Sign out on all devices</SubmitButton>
            </form>
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold">Password</h2>
          <p className="mt-1 mb-3 text-sm text-muted">
            {passwordSet ? "Change the password you use to log in." : "Add a password so you can log in with your email and password."}
          </p>
          <ActionForm action={setPasswordAction} submitLabel={passwordSet ? "Change password" : "Save password"} variant="secondary">
            {passwordSet && <TextField label="Current password" name="currentPassword" type="password" autoComplete="current-password" />}
            <TextField label="New password" name="newPassword" type="password" autoComplete="new-password" hint="At least 8 characters" />
            <TextField label="Confirm new password" name="confirmPassword" type="password" autoComplete="new-password" />
          </ActionForm>
        </Card>

        <Card>
          <h2 className="font-semibold">{t(locale, "common.language")}</h2>
          <p className="mt-1 mb-3 text-sm text-muted">{t(locale, "settings.languageHint")}</p>
          <ActionForm action={setLanguageAction} submitLabel={t(locale, "common.save")} variant="secondary" inline>
            <label className="sr-only" htmlFor="locale">
              {t(locale, "common.language")}
            </label>
            <select id="locale" name="locale" defaultValue={locale} className={select}>
              <option value="en">English</option>
              <option value="hi">हिन्दी (Hindi)</option>
            </select>
          </ActionForm>
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="font-semibold">Team</h2>
          <p className="mt-1 text-sm text-muted">Owners manage billing and publishing. Editors edit drafts and prepare actions. Viewers can read reports.</p>
          <ul className="mt-3 divide-y divide-border">
            {members.map((m) => (
              <li key={m.userId} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <span className="min-w-0 break-all">
                  {m.email} {m.userId === ctx.userId && <span className="text-muted">(you)</span>}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {isOwner ? (
                    <ActionForm action={changeRoleAction} submitLabel="Change" variant="secondary" inline>
                      <input type="hidden" name="userId" value={m.userId} />
                      <label className="sr-only" htmlFor={`role-${m.userId}`}>
                        Role for {m.email}
                      </label>
                      <select id={`role-${m.userId}`} name="role" defaultValue={m.role} className={select}>
                        <option value="owner">Owner</option>
                        <option value="editor">Editor</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    </ActionForm>
                  ) : (
                    <Badge>{ROLE_TEXT[m.role]}</Badge>
                  )}
                  {(isOwner || m.userId === ctx.userId) && (
                    <ActionForm action={removeMemberAction} submitLabel={m.userId === ctx.userId ? "Leave" : "Remove"} variant="ghost" inline>
                      <input type="hidden" name="userId" value={m.userId} />
                    </ActionForm>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {isOwner && (
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="font-semibold">Invite someone</h3>
                <ActionForm action={inviteAction} submitLabel="Send invitation">
                  <TextField label="Email" name="email" type="email" autoComplete="off" />
                  <div>
                    <label htmlFor="invite-role" className="block text-sm font-semibold">
                      Role
                    </label>
                    <select id="invite-role" name="role" defaultValue="editor" className={`${select} mt-1 w-full`}>
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                      <option value="owner">Owner</option>
                    </select>
                  </div>
                </ActionForm>
                {invites.length > 0 && (
                  <ul className="mt-4 space-y-2 text-sm">
                    {invites.map((i) => (
                      <li key={i.id} className="flex flex-wrap items-center justify-between gap-2">
                        <span>
                          {i.email} · {ROLE_TEXT[i.role]} · pending
                        </span>
                        <ActionForm action={revokeInviteAction} submitLabel="Cancel" variant="ghost" inline>
                          <input type="hidden" name="inviteId" value={i.id} />
                        </ActionForm>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {members.length > 1 && (
                <div>
                  <h3 className="font-semibold">Transfer ownership</h3>
                  <p className="mt-1 mb-3 text-sm text-muted">The new owner gets billing and publishing. You become an editor.</p>
                  <ActionForm action={transferOwnershipAction} submitLabel="Transfer ownership" variant="danger">
                    <label htmlFor="transfer-to" className="block text-sm font-semibold">
                      New owner
                    </label>
                    <select id="transfer-to" name="userId" className={`${select} w-full`}>
                      {members
                        .filter((m) => m.userId !== ctx.userId)
                        .map((m) => (
                          <option key={m.userId} value={m.userId}>
                            {m.email}
                          </option>
                        ))}
                    </select>
                    <label className="flex min-h-11 items-center gap-3">
                      <input type="checkbox" name="confirm" className="size-5" /> I understand I&apos;ll lose owner access
                    </label>
                  </ActionForm>
                </div>
              )}
            </div>
          )}
        </Card>
        <AccountSection />
      </div>
    </>
  );
}
