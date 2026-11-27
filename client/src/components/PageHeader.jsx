import { Link } from "react-router-dom";

// Shared title block for inner pages (Contact, FAQ, Terms, Privacy...).
export default function PageHeader({ title, text, crumb }) {
  return (
    <header className="page-header">
      <div className="container text-center">
        <nav className="small text-muted-olive mb-3">
          <Link to="/">Home</Link> <i className="bi bi-chevron-right mx-1" /> <span>{crumb || title}</span>
        </nav>
        <h1>{title}</h1>
        {text && <p className="text-muted-olive mx-auto mt-3 mb-0">{text}</p>}
      </div>
    </header>
  );
}
