"use client";
import { useState, FormEvent } from "react";
export default function Contact(){
  const [sent,setSent] = useState(false);
  function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name")||"");
    const email = String(fd.get("email")||"");
    const msg = String(fd.get("message")||"");
    window.location.href = `mailto:hello@oramax.space?subject=Orama%20X%20Contact%20(${encodeURIComponent(name)})&body=${encodeURIComponent(msg)}%0A%0AFrom:%20${encodeURIComponent(email)}`;
    setSent(true);
  }
  return (
    <section className="hero" style={{gridTemplateColumns:"1fr 1fr"}}>
      <div>
        <h1>Contact</h1>
        <p style={{color:"var(--muted)"}}>Email us for partnerships, datasets, and demos.</p>
        <p>Email: <a href="mailto:hello@oramax.space">hello@oramax.space</a></p>
      </div>
      <form onSubmit={submit} className="card" style={{display:"grid", gap:10}}>
        <input name="name" placeholder="Your name" required style={{padding:"10px", borderRadius:10, background:"#ffffff14", color:"#fff", border:"1px solid #ffffff2a"}}/>
        <input type="email" name="email" placeholder="Your email" required style={{padding:"10px", borderRadius:10, background:"#ffffff14", color:"#fff", border:"1px solid #ffffff2a"}}/>
        <textarea name="message" placeholder="Your message" required style={{minHeight:140, padding:"10px", borderRadius:10, background:"#ffffff14", color:"#fff", border:"1px solid #ffffff2a"}}/>
        <button className="btn" type="submit">Send</button>
        {sent && <div style={{color:"var(--brand)"}}>Opening your email client</div>}
      </form>
    </section>
  );
}
