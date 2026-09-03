export default function NotFound() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center' }}>
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <a href="/" style={{ marginTop: '20px', padding: '10px 20px', background: '#8b5cf6', color: '#fff', textDecoration: 'none', borderRadius: '8px' }}>
        Back to Home
      </a>
    </div>
  );
}
