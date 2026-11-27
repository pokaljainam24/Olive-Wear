import { useEffect, useState } from "react";
import { shopApi } from "../api/shop";
import { notify } from "../components/ui/notify";
import PageHeader from "../components/PageHeader";
import GlassCard from "../components/GlassCard";

const info = [
  { icon: "bi-envelope", title: "Email", text: "hello@olivewear.com" },
  { icon: "bi-telephone", title: "Phone", text: "+91 98765 43210" },
  { icon: "bi-geo-alt", title: "Studio", text: "21 Linen Lane, Your City, India" },
  { icon: "bi-clock", title: "Hours", text: "Mon to Sat, 10 am to 7 pm" },
];
const empty = { name: "", email: "", phone: "", topic: "Order help", message: "" };

// Step 1: form -> OTP mailed. Step 2: enter OTP -> query is sent.
export default function Contact() {
  const [values, setValues] = useState(empty);
  const [step, setStep] = useState("form");
  const [requestId, setRequestId] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(0);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));

  const sendOtp = async (e) => {
    e?.preventDefault();
    setBusy(true);
    try {
      const r = await shopApi.sendOtp(values);
      setRequestId(r.requestId);
      setOtp("");
      setStep("otp");
      setWait(30);
      notify.success(`OTP sent to ${values.email}`);
    } catch (err) {
      notify.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const verify = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await shopApi.verifyOtp({ requestId, otp });
      notify.success("Email verified. Your query has been sent and a confirmation email is on its way.");
      setValues(empty);
      setStep("form");
    } catch (err) {
      notify.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Contact us" text="Questions about an order, size or delivery? Send us a message and we reply within one working day." />
      <section className="pb-section">
        <div className="container">
          <div className="row g-4">
            <div className="col-12 col-lg-5">
              <div className="row g-3">
                {info.map((i) => (
                  <div className="col-12 col-sm-6 col-lg-12 reveal" key={i.title}>
                    <GlassCard className="info-card d-flex align-items-center gap-3 p-3 h-100">
                      <i className={`bi ${i.icon} feature-icon`} />
                      <div>
                        <h6 className="mb-1">{i.title}</h6>
                        <span className="text-muted-olive">{i.text}</span>
                      </div>
                    </GlassCard>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-12 col-lg-7 reveal">
              <GlassCard className="p-4 p-md-5">
                {step === "form" ? (
                  <>
                    <h4 className="mb-4">Send a message</h4>
                    <form onSubmit={sendOtp}>
                      <div className="row g-3">
                        <div className="col-12 col-md-6">
                          <label className="form-label" htmlFor="name">Name</label>
                          <input id="name" required className="form-control glass-input" placeholder="Your name" value={values.name} onChange={set("name")} />
                        </div>
                        <div className="col-12 col-md-6">
                          <label className="form-label" htmlFor="email">Email</label>
                          <input id="email" type="email" required className="form-control glass-input" placeholder="you@example.com" value={values.email} onChange={set("email")} />
                        </div>
                        <div className="col-12 col-md-6">
                          <label className="form-label" htmlFor="phone">Phone</label>
                          <input id="phone" type="tel" className="form-control glass-input" placeholder="Optional" value={values.phone} onChange={set("phone")} />
                        </div>
                        <div className="col-12 col-md-6">
                          <label className="form-label" htmlFor="topic">Topic</label>
                          <select id="topic" className="form-select glass-input" value={values.topic} onChange={set("topic")}>
                            <option>Order help</option><option>Returns and exchange</option>
                            <option>Size advice</option><option>Something else</option>
                          </select>
                        </div>
                        <div className="col-12">
                          <label className="form-label" htmlFor="msg">Message</label>
                          <textarea id="msg" rows="5" required className="form-control glass-input" placeholder="How can we help?" value={values.message} onChange={set("message")} />
                        </div>
                        <div className="col-12">
                          <button className="btn btn-olive btn-lg px-5 w-100 w-sm-auto" type="submit" disabled={busy}>
                            {busy ? "Sending OTP..." : "Send OTP"}
                          </button>
                        </div>
                      </div>
                    </form>
                  </>
                ) : (
                  <>
                    <h4 className="mb-2">Verify your email</h4>
                    <p className="text-muted-olive">We sent a 6-digit code to <strong>{values.email}</strong>. Enter it to send your message.</p>
                    <form onSubmit={verify}>
                      <label className="form-label" htmlFor="otp">OTP</label>
                      <input id="otp" required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoFocus
                        className="form-control glass-input otp-input mb-3" placeholder="------"
                        value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} />
                      <div className="d-flex flex-wrap gap-2">
                        <button className="btn btn-olive px-4" type="submit" disabled={busy || otp.length !== 6}>
                          {busy ? "Verifying..." : "Verify and send"}
                        </button>
                        <button className="btn btn-outline-olive" type="button" onClick={sendOtp} disabled={busy || wait > 0}>
                          {wait > 0 ? `Resend in ${wait}s` : "Resend OTP"}
                        </button>
                        <button className="btn btn-link text-muted-olive" type="button" onClick={() => setStep("form")}>Change details</button>
                      </div>
                    </form>
                  </>
                )}
              </GlassCard>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
