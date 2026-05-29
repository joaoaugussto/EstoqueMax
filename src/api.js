const BASE = import.meta.env.VITE_API_URL;

function headers() {
  const token = localStorage.getItem("token");
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, { ...options, headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.erro || "Erro na requisição");
  return data;
}
