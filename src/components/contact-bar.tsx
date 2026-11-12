import { Icon } from "@/components/icon";
import { COMPANY, whatsappLink } from "@/lib/site-schema";

/** A bar fixed to the bottom of software pages, so a visitor can message or call from anywhere on the page. */
export function ContactBar({ what, message }: { what: string; message: string }) {
  return (
    <aside className="contact-bar" aria-label="Contact Foundly">
      <p><b>Need {what}?</b> <span>Free consultation and a live demo. We reply within working hours.</span></p>
      <div>
        <a className="contact-bar-wa" href={whatsappLink(message)} target="_blank" rel="noopener">WhatsApp us <Icon name="arrow" size={15} /></a>
        <a className="contact-bar-call" href={`tel:${COMPANY.telephone}`}>Call {COMPANY.telephoneDisplay}</a>
      </div>
    </aside>
  );
}
