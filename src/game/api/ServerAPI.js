const BASE_URL = "http://dev-taixe.bship.vn:8080/api/v1/app";

// Put token here or load dynamically later
const TOKEN = "23a3ee9d0ecce341cfaa6bda8cf173ce";

export default class FortuneAPI {

  static async request(endpoint, method, body = null) {
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${TOKEN}`
        },
        body: body ? JSON.stringify(body) : null
      });

      if (!res.ok) throw new Error("API request failed");

      return await res.json();

    } catch (err) {
      console.error("API Error:", err);
      return {
        status: "error",
        message: err.message
      };
    }
  }

  static get(endpoint) {
    return this.request(endpoint, "GET");
  }

  static post(endpoint, body = {}) {
    return this.request(endpoint, "POST", body);
  }

  static shakeEvent() {
    return this.post("/event-shake/shake");
  }

  static getInfo() {
    return this.get("/event-shake/info");
  }

  static submitSomething(data) {
    return this.post("/submit", data);
  }
}
