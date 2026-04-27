const BASE_URL = "http://127.0.0.1:8000";

export async function uploadDocx(file) {
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch(`${BASE_URL}/v1/ingest/docx`, {
        method: "POST",
        body: fd,
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
    }
    return res.json();
}

export async function sendChat(question, { top_k = 7, dist_threshold = 2.0 } = {}) {
    const res = await fetch(`${BASE_URL}/v1/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, top_k, dist_threshold }),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
    }
    return res.json();
}
