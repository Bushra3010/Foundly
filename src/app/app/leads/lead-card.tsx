"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { Badge, Card } from "@/components/ui";
import { phoneDigits } from "@/lib/profile";
import { updateLeadAction } from "./actions";

const STATUS = { new: ["info", "New"], contacted: ["warn", "Contacted"], qualified: ["ok", "Qualified"], closed: ["neutral", "Closed"] } as const;

export type LeadView = {
  id: string;
  name: string;
  contact: string;
  message: string;
  status: keyof typeof STATUS;
  notes: string | null;
  source: string | null;
  createdAt: string;
};

/** One-tap ways to answer, based on what the customer left: email, or a phone number for WhatsApp and calls. */
function ReplyActions({ lead }: { lead: LeadView }) {
  const contact = lead.contact.trim();
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
  const digits = isEmail ? "" : phoneDigits(contact, "IN");
  const isPhone = !isEmail && /^\d{8,15}$/.test(digits);
  if (!isEmail && !isPhone) return null;
  const first = lead.name.trim().split(/\s+/)[0] || "there";
  const hello = `Hi ${first}, thanks for your enquiry. `;
  return (
    <div className="lead-reply">
      {isEmail && (
        <a className="share-btn" href={`mailto:${contact}?subject=${encodeURIComponent("Re: your enquiry")}&body=${encodeURIComponent(`${hello}\n\n`)}`}>
          Reply by email
        </a>
      )}
      {isPhone && (
        <>
          <a className="share-btn wa" href={`https://wa.me/${digits}?text=${encodeURIComponent(hello)}`} target="_blank" rel="noopener noreferrer">
            Reply on WhatsApp
          </a>
          <a className="share-btn" href={`tel:+${digits}`}>Call</a>
        </>
      )}
    </div>
  );
}

export function LeadCard({ lead, canEdit }: { lead: LeadView; canEdit: boolean }) {
  const [state, action] = useActionState(updateLeadAction, {});
  const [tone, label] = STATUS[lead.status];
  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-semibold">{lead.name}</h2>
          <p className="text-sm break-all">{lead.contact}</p>
        </div>
        <Badge tone={tone}>{label}</Badge>
      </div>
      <p className="mt-3 whitespace-pre-line">{lead.message}</p>
      <ReplyActions lead={lead} />
      <p className="mt-2 text-xs text-muted">
        {new Date(lead.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
        {lead.source ? ` · ${lead.source}` : ""}
      </p>
      {canEdit && (
        <form action={action} className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-[12rem_1fr_auto] sm:items-end">
          <input type="hidden" name="leadId" value={lead.id} />
          <div>
            <label htmlFor={`status-${lead.id}`} className="block text-sm font-semibold">
              Status
            </label>
            <select id={`status-${lead.id}`} name="status" defaultValue={lead.status} className="mt-1 block min-h-11 w-full rounded-lg border border-border bg-surface px-3">
              {Object.entries(STATUS).map(([value, [, text]]) => (
                <option key={value} value={value}>
                  {text}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={`notes-${lead.id}`} className="block text-sm font-semibold">
              Notes
            </label>
            <input id={`notes-${lead.id}`} name="notes" defaultValue={lead.notes ?? ""} className="mt-1 block min-h-11 w-full rounded-lg border border-border bg-surface px-3" />
          </div>
          <SubmitButton variant="secondary">Save</SubmitButton>
          {state.message && (
            <p role="status" className={`text-sm sm:col-span-3 ${state.ok ? "text-ok-fg" : "text-err-fg"}`}>
              {state.message}
            </p>
          )}
        </form>
      )}
    </Card>
  );
}
