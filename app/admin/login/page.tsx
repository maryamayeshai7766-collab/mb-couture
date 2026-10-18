"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const password = String(new FormData(event.currentTarget).get("password") || "");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Owner sign-in failed.");
      router.replace("/admin/orders");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Owner sign-in failed.");
      setSubmitting(false);
    }
  }

  return (
    <main className="admin-login-page">
      <form className="admin-login-card" onSubmit={login}>
        <Link href="/" className="admin-login-brand">MB COUTURE</Link>
        <p>STORE OWNER ACCESS</p>
        <h1>Orders dashboard</h1>
        <label htmlFor="admin-password">Owner password</label>
        <input id="admin-password" name="password" type="password" autoComplete="current-password" required />
        {error && <div className="admin-login-error" role="alert">{error}</div>}
        <button type="submit" disabled={submitting}>{submitting ? "Signing in…" : "Sign in"}</button>
      </form>
      <style jsx global>{`
        .admin-login-page { min-height:100vh; display:grid; place-items:center; padding:20px; background:#f8f3eb; color:#4b382b; font-family:Arial,Helvetica,sans-serif; }
        .admin-login-card { width:min(420px,100%); padding:35px; background:#fffdf9; border:1px solid #e7dccb; }
        .admin-login-brand { color:#4b382b; font:700 19px Georgia,serif; letter-spacing:3px; text-decoration:none; }
        .admin-login-card > p { margin:24px 0 8px; color:#b18a4b; font-size:10px; letter-spacing:2px; }
        .admin-login-card h1 { margin:0 0 24px; font:400 30px Georgia,serif; }
        .admin-login-card label { display:block; margin-bottom:8px; font-size:12px; }
        .admin-login-card input { width:100%; padding:12px; border:1px solid #e2d6c6; background:white; color:#4b382b; }
        .admin-login-card button { width:100%; margin-top:16px; padding:14px; border:0; background:#4b382b; color:white; cursor:pointer; }
        .admin-login-card button:disabled { opacity:.6; cursor:wait; }
        .admin-login-error { margin-top:12px; color:#8e352b; font-size:12px; }
      `}</style>
    </main>
  );
}
