 const baseURL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

 const buildHeaders = (headers = {}) => {
   const token = localStorage.getItem("access_token");
   const out = { ...headers };
   if (token) {
     out.Authorization = `Bearer ${token}`;
   }
   return out;
 };

 const request = async (method, url, options = {}) => {
   let body = options.body;
   let headers = options.headers || {};

   const isBodyPlainObject =
     body &&
     typeof body === "object" &&
     !(body instanceof FormData) &&
     !(body instanceof URLSearchParams) &&
     !(body instanceof Blob);

   if (isBodyPlainObject) {
     body = JSON.stringify(body);
     if (!headers["Content-Type"]) {
       headers = { ...headers, "Content-Type": "application/json" };
     }
   }

   const res = await fetch(`${baseURL}${url}`, {
     method,
     headers: buildHeaders(headers),
     body,
   });

   const contentType = res.headers.get("content-type") || "";
   const isJson = contentType.includes("application/json");
   const data = isJson ? await res.json() : await res.text();

   if (!res.ok) {
     const message = data?.detail || data?.message || "Request failed";
     const error = new Error(message);
     error.response = { data };
     throw error;
   }

   return { data };
 };

 const apiClient = {
   get: (url, options) => request("GET", url, options),
   post: (url, body, options = {}) =>
     request("POST", url, { ...options, body }),
   put: (url, body, options = {}) => request("PUT", url, { ...options, body }),
   delete: (url, options) => request("DELETE", url, options),
 };

 export default apiClient;

