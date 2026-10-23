"use client";

import { useState } from "react";
import { Icon } from "./icon";

/** Shows a public link with one-tap copy, WhatsApp share and open. */
export function ShareLink({ url, label = "Your website", shareText, live = true }: { url: string; label?: string; shareText?: string; live?: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const t = document.createElement("textarea");
      t.value = url;
      document.body.appendChild(t);
      t.select();
      document.execCommand("copy");
      t.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };
  const text = encodeURIComponent(`${shareText ?? "Take a look at our website"}: ${url}`);
  return (
    <div className="share-link">
      <span className="share-label">{label}</span>
      <div className="share-row">
        <code className="share-url" title={url}>{url.replace(/^https?:\/\//, "")}</code>
        <button type="button" onClick={copy} className="share-btn" aria-live="polite">
          <Icon name={copied ? "check" : "reports"} size={15} /> {copied ? "Copied" : "Copy"}
        </button>
      </div>
      {live && (
        <div className="share-actions">
          <a className="share-btn wa" href={`https://wa.me/?text=${text}`} target="_blank" rel="noopener noreferrer">
            Share on WhatsApp
          </a>
          <a className="share-btn" href={url} target="_blank" rel="noopener noreferrer">
            Open <Icon name="arrow" size={14} />
          </a>
        </div>
      )}
    </div>
  );
}
