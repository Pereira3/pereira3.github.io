import { profile } from "src/data/profile";
import page from "src/styles/Page.module.css";
import styles from "src/pages/Introduction/Introduction.module.css";
import { pageTitle } from "src/utils/pageTitle";

export function Introduction() {
  return (
    <article>
      <title>{pageTitle("Introduction")}</title>

      <h1 className={styles.name}>{profile.name}</h1>
      <p className={styles.role}>{profile.role}</p>

      <div className={styles.intro}>{profile.intro}</div>

      <ul className={styles.links}>
        {profile.links.map((link) => {
          const external = link.url.startsWith("http");
          return (
            <li key={link.url}>
              <a
                className={page.textLink}
                href={link.url}
                target={external ? "_blank" : undefined}
                rel={external ? "noreferrer" : undefined}
              >
                {link.label}
                {external && (
                  <span className="visually-hidden"> (opens in a new tab)</span>
                )}
              </a>
            </li>
          );
        })}
      </ul>
    </article>
  );
}
