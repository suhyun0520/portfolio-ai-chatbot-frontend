const API_BASE_URL = import.meta.env.VITE_API_BASE_URL


function getVisitorId() {
    const key = "portfolio_chat_visitor_id"

    let visitorId = localStorage.getItem(key);

    if (!visitorId) {
        visitorId = crypto.randomUUID();
        localStorage.setItem(key, visitorId);
    }

    return visitorId;
}

export async function uploadDocx(file) {
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch(`${API_BASE_URL}/v1/ingest/docx`, {
        method: "POST",
        body: fd,
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
    }
    return res.json();
}

export async function sendChat(question, { top_k = 10, dist_threshold = 2.0 } = {}) {
    const res = await fetch(`${API_BASE_URL}/v1/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json",
            "X-Visitor-Id": getVisitorId(),
         },
        body: JSON.stringify({ question, top_k, dist_threshold }),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
    }
    return res.json();
}
