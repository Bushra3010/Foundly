import Link from "next/link";
import { Icon } from "./icon";

const tools = [
  {
    key: "website",
    title: "Your website",
    description: "Create, edit and publish",
    icon: "website",
  },
  {
    key: "business",
    title: "Business profile",
    description: "Keep your details up to date",
    icon: "business",
  },
  {
    key: "visibility",
    title: "AI visibility",
    description: "See how AI mentions you",
    icon: "visibility",
  },
];
const shortcuts = [
  { key: "business", label: "Business", icon: "business" },
  { key: "website", label: "Website", icon: "website" },
  { key: "visibility", label: "Visibility", icon: "visibility" },
  { key: "improve", label: "Improve", icon: "improve" },
  { key: "leads", label: "Leads", icon: "leads" },
  { key: "reports", label: "Reports", icon: "reports" },
];

export function WorkspaceTools({ signedIn = true }: { signedIn?: boolean }) {
  const href = (key: string) => (signedIn ? `/app/${key}` : "/login");
  return (
    <>
      <div className="tool-grid">
        {tools.map((tool) => (
          <Link key={tool.key} href={href(tool.key)} className="tool-card">
            <div
              className={`tool-preview tool-preview-${tool.key}`}
              aria-hidden="true"
            >
              {tool.key === "website" ? (
                <div className="mini-browser">
                  <span className="mini-browser-bar">
                    <i />
                    <i />
                    <i />
                  </span>
                  <div className="mini-browser-content">
                    <span className="mini-browser-heading" />
                    <span className="mini-browser-line" />
                    <span className="mini-browser-button" />
                    <span className="mini-browser-image">
                      <Icon name="globe" size={28} />
                    </span>
                  </div>
                </div>
              ) : tool.key === "business" ? (
                <div className="mini-profile">
                  <span className="mini-profile-avatar">
                    <Icon name="business" size={25} />
                  </span>
                  <span className="mini-profile-line" />
                  <span className="mini-profile-line short" />
                  <span className="mini-profile-check">
                    <Icon name="check" size={12} />
                  </span>
                </div>
              ) : (
                <div className="mini-sources">
                  <span>
                    <Icon name="spark" size={23} />
                  </span>
                  <span>
                    <Icon name="visibility" size={27} />
                  </span>
                  <span>
                    <Icon name="globe" size={20} />
                  </span>
                </div>
              )}
            </div>
            <div className="tool-caption">
              <span>
                <strong>{tool.title}</strong>
                <span>{tool.description}</span>
              </span>
              <Icon name="arrow" size={15} />
            </div>
          </Link>
        ))}
      </div>
      <nav aria-label="Quick actions" className="quick-actions">
        {shortcuts.map((item) => (
          <Link href={href(item.key)} key={item.key}>
            <Icon name={item.icon} size={15} />
            {item.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
