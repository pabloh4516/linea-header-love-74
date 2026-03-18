import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const getVisitorId = () => {
  let id = localStorage.getItem("linea_visitor_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("linea_visitor_id", id);
  }
  return id;
};

const getSessionId = () => {
  let id = sessionStorage.getItem("linea_session_id");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("linea_session_id", id);
  }
  return id;
};

export const usePageViewTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Don't track admin pages
    if (location.pathname.startsWith("/admin")) return;

    const visitorId = getVisitorId();
    const sessionId = getSessionId();
    const params = new URLSearchParams(window.location.search);

    supabase.from("page_views").insert({
      page_path: location.pathname,
      visitor_id: visitorId,
      session_id: sessionId,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
      utm_source: params.get("utm_source") || null,
      utm_medium: params.get("utm_medium") || null,
      utm_campaign: params.get("utm_campaign") || null,
      utm_content: params.get("utm_content") || null,
      utm_term: params.get("utm_term") || null,
    }).then(() => {});
  }, [location.pathname]);
};
