const DOCUMENT_RETURN_CONTEXT_KEY = "revupDocumentReturnPath";

export const saveDocumentReturnPath = (path) => {
  if (typeof window === "undefined" || !path?.startsWith("/booking/")) return;
  window.localStorage.setItem(DOCUMENT_RETURN_CONTEXT_KEY, path);
};

export const consumeDocumentReturnPath = () => {
  if (typeof window === "undefined") return null;

  const path = window.localStorage.getItem(DOCUMENT_RETURN_CONTEXT_KEY);
  window.localStorage.removeItem(DOCUMENT_RETURN_CONTEXT_KEY);
  return path?.startsWith("/booking/") ? path : null;
};
