export default function SectionTitle({ title, text }) {
  return (
    <div className="section-title reveal text-center mb-5">
      <h2>{title}</h2>
      {text && <p className="text-muted-olive mx-auto">{text}</p>}
    </div>
  );
}
