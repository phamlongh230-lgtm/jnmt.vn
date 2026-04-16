export default function NotFound() {
  return (
    <div style={{ minHeight: "100vh", width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="glass" style={{ width: "100%", maxWidth: 420, margin: "0 1rem", borderRadius: 22, padding: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
          <span style={{ fontSize: "2rem", color: "#ef4444" }}>⚠️</span>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>404 Page Not Found</h1>
        </div>
        <p style={{ fontSize: "0.9rem", color: "#64748b" }}>
          Did you forget to add the page to the router?
        </p>
      </div>
    </div>
  );
}
