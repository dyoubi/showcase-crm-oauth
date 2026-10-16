import siteMap from "~/site-map";
import type { Route } from "./+types/home";
import { useText } from "~/domain/i18n";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

const orgName = "OrgName.";
export default function Home({ loaderData }: Route.ComponentProps) {
  const text = useText();
  return (
    <div className="widget">
      <h2>
        {orgName}
      </h2>
      <p>
        {text('welcome')}
      </p>
      <div>
        <a
          href={siteMap.pages.signIn}
          className="button-primary"
        >
          {text('loginLabel')}{' '}
        </a>
        <a href={siteMap.pages.signUp} className="button-secondary">
          {text('signUpSubmitLabel')}
          <span aria-hidden="true">→</span>
        </a>
      </div>
    </div>
  );
}
