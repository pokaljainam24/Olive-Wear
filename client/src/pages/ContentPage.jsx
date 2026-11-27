import { shopApi } from "../api/shop";
import useFetch from "../hooks/useFetch";
import LegalPage from "../components/LegalPage";
import PageHeader from "../components/PageHeader";
import Loader from "../components/ui/Loader";

// Policy pages and size guide, written in the admin panel (CMS).
export default function ContentPage({ type, pageKey }) {
  const { data, loading } = useFetch(
    () => shopApi.content(type).then((list) => list.find((c) => c.key === pageKey) || null),
    [type, pageKey]
  );

  if (loading) return <div className="page-top container"><Loader /></div>;
  if (!data) return <PageHeader title="Page not available" text="This page has not been published yet." />;

  return (
    <LegalPage
      title={data.title}
      text={data.subtitle}
      updated={new Date(data.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
      sections={data.items.map((it, i) => ({ id: `s${i}`, title: it.title, text: it.text }))}
    />
  );
}
