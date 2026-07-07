import React, { useState, useEffect, useCallback, useRef } from "react";

// ─── SUPABASE CONFIG ─────────────────────────────────────────────
const SUPABASE_URL = "https://rhkwznrvbglgzxtvpwmz.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoa3d6bnJ2YmdsZ3p4dHZwd216Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MDc0NDQsImV4cCI6MjA5MTM4MzQ0NH0.q7BZyt3OGCRu55Py0k_KzHREUgrTyg2yCMX31mGk1vQ";
async function saveToSupabase(table, data) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method:"POST",
      headers:{"Content-Type":"application/json","apikey":SUPABASE_KEY,"Authorization":`Bearer ${SUPABASE_KEY}`,"Prefer":"return=minimal"},
      body:JSON.stringify(data)
    });
  } catch(e) { console.log("Supabase save:", e); }
}
// ─────────────────────────────────────────────────────────────────

const C = {
  forest: "#2C4A3E", forestLight: "#3D6B5C", forestDark: "#1A2E26",
  tan: "#C4A882", tanLight: "#DEC9A8", gold: "#B8955A",
  cream: "#F5F0E8", creamDark: "#EDE5D5",
  charcoal: "#2A2A2A", gray: "#6B6B6B", white: "#FAFAF7",
  green: "#16A34A", red: "#DC2626", amber: "#D97706", blue: "#2563EB",
};

function useW() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => { const h = () => setW(window.innerWidth); window.addEventListener("resize", h); return () => window.removeEventListener("resize", h); }, []);
  return w;
}

// ─── DATA ────────────────────────────────────────────────────────────
const PROPS = [
  // ── Loaded from Supabase at runtime (see useEffect in App) ──
  // Fallback shown while loading
];

// ── SUPABASE PROPERTY LOADER ─────────────────────────────────
async function loadPropertiesFromDB() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/properties?order=is_featured.desc,created_at.asc`,
      { headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` } }
    );
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data.map((p, i) => ({
        id:           p.id || i + 1,
        title:        p.title || "Property",
        location:     p.location || "Indore",
        price:        p.price_label || "₹Price on Request",
        priceNum:     p.price_value ? Math.round(p.price_value / 100000) : 100,
        type:         p.type || "Plot",
        yield:        p.rental_yield ? String(p.rental_yield) : null,
        area:         p.area_sqft ? `${p.area_sqft.toLocaleString()} sq ft` : p.land_size || "—",
        tag:          p.tag || "Listed",
        tagColor:     p.tag_color || "#2C4A3E",
        amenities:    Array.isArray(p.amenities) ? p.amenities : [],
        img:          p.img || "🏡",
        status:       p.status || "Ready",
        beds:         p.beds || null,
        baths:        p.baths || null,
        facing:       p.facing || null,
        floor:        p.floor_info || null,
        monthlyRent:  p.monthly_rent || null,
        loanRate:     8.75,
        brokerSaving: p.price_value ? Math.round(p.price_value * 0.025) : 0,
        legal: {
          status:      p.rera_status?.toLowerCase().includes("registered") ? "green"
                     : p.rera_status?.toLowerCase().includes("applied")    ? "amber" : "amber",
          rera:        p.rera_number || p.rera_status || "Verification Pending",
          title:       p.title_status || "Verification Pending",
          encumbrance: p.encumbrance  || "Verification Pending",
          landType:    p.land_type    || "—",
        },
        desc:          p.description || "",
        highlights:    Array.isArray(p.highlights) ? p.highlights : [],
        micro:         (p.micro_market || "rau").toLowerCase().replace(/\s+/g,"-"),
        lifestyle:     (p.suited_for   || []).map(s => s.toLowerCase().includes("invest") ? "investment"
                       : s.toLowerCase().includes("spiritual") ? "spiritual"
                       : s.toLowerCase().includes("luxury")    ? "luxury"
                       : s.toLowerCase().includes("nature")    ? "nature" : "investment"),
        budget:        p.price_value >= 20000000 ? "high"
                     : p.price_value >= 10000000 ? "medium" : "low",
        developer_company: p.developer_company || null,
        developer_website: p.developer_website || null,
        contact_phone:     p.contact_phone || null,
        maps_link:         p.maps_link    || null,
      }));
    }
  } catch(e) { console.log("Property load error:", e); }
  return [];
}

// ─── DEVELOPER BACKGROUND DATA ────────────────────────────────
const DEVELOPERS = {
  1: { company:"Prestige Highlands Pvt Ltd", since:"2018", projects:"12", city:"Indore, MP", mcaReg:"U45200MP2018PTC045231", gst:"23AABCP1234F1Z5", rera_dev:"MP/RERA/DEV/2021/001", erth_verified:true, past:["Green Valley Villas (2021)","Mhow Heights Phase 1 (2022)","Cantonment Residences (2023)"], contact:"Vikram Sharma", rating:4.8, reviews:47 },
  2: { company:"Narmada Homes & Estates", since:"2015", projects:"8", city:"Bhopal, MP", mcaReg:"U45200MP2015PTC032100", gst:"23AABCN9876G1Z2", rera_dev:"MP/RERA/DEV/2019/042", erth_verified:true, past:["River View Retreat (2020)","Omkareshwar Bliss (2022)"], contact:"Ramesh Patel", rating:4.5, reviews:28 },
  3: { company:"Skyline Developers Ltd", since:"2010", projects:"24", city:"Indore, MP", mcaReg:"U45200MP2010PLC021789", gst:"23AABCS4567H1Z8", rera_dev:"MP/RERA/DEV/2018/007", erth_verified:true, past:["Palasia Grandeur (2019)","Sky One Indore (2021)","Pinnacle Palasia (2023)"], contact:"Ankit Jain", rating:4.9, reviews:112 },
  4: { company:"Malwa Farm Estates LLP", since:"2020", projects:"4", city:"Indore, MP", mcaReg:"AAD-1234", gst:"23AABCM2345I1Z6", rera_dev:"Applied — in progress", erth_verified:false, past:["Simrol Green Acres (2022)","Malwa Retreat (2023)"], contact:"Suresh Verma", rating:4.2, reviews:14 },
  5: { company:"Waterfront Living Pvt Ltd", since:"2017", projects:"9", city:"Indore, MP", mcaReg:"U45200MP2017PTC039812", gst:"23AABCW6789J1Z4", rera_dev:"MP/RERA/DEV/2020/031", erth_verified:true, past:["Tigaria Lakeview (2020)","Dam Residences (2022)"], contact:"Priya Singh", rating:4.7, reviews:63 },
  6: { company:"EcoVerde Constructions", since:"2019", projects:"6", city:"Indore, MP", mcaReg:"U45200MP2019PTC042567", gst:"23AABCE3456K1Z1", rera_dev:"MP/RERA/DEV/2022/089", erth_verified:true, past:["Rau Greens Phase 1 (2022)","IIM Road Cabins (2023)"], contact:"Deepak Gupta", rating:4.4, reviews:22 },
};


// ─── AI MATCHMAKER DATA ────────────────────────────────────────────
const QUIZ = [
  {
    id: "q1", question: "What's your primary goal?", emoji: "🎯",
    options: [
      { label: "Weekend escape", sub: "A place to unwind with family", value: "lifestyle", icon: "🏖️" },
      { label: "Rental income", sub: "Monthly cash flow + appreciation", value: "investment", icon: "💰" },
      { label: "Both equally", sub: "Lifestyle + smart investment", value: "both", icon: "⚖️" },
    ]
  },
  {
    id: "q2", question: "What's your budget?", emoji: "💵",
    options: [
      { label: "Under ₹1 Cr", sub: "Rau, Omkareshwar belt", value: "low", icon: "🌿" },
      { label: "₹1–2 Cr", sub: "Simrol, Mhow, Tigaria", value: "medium", icon: "🏡" },
      { label: "₹2 Cr+", sub: "Palasia, premium villas", value: "high", icon: "✨" },
    ]
  },
  {
    id: "q3", question: "What setting do you prefer?", emoji: "🌄",
    options: [
      { label: "Nature & hills", sub: "Farms, valleys, dam views", value: "nature", icon: "🌾" },
      { label: "Spiritual / heritage", sub: "River, temple towns", value: "spiritual", icon: "🌅" },
      { label: "City premium", sub: "Penthouse, urban luxury", value: "luxury", icon: "🏙️" },
    ]
  },
  {
    id: "q4", question: "When do you want to buy?", emoji: "📅",
    options: [
      { label: "Ready now", sub: "Looking to invest this month", value: "now", icon: "⚡" },
      { label: "Next 3–6 months", sub: "Researching seriously", value: "soon", icon: "🔍" },
      { label: "Just exploring", sub: "Early stage, learning the market", value: "later", icon: "👀" },
    ]
  },
];

function matchProperties(answers) {
  return PROPS.filter(p => {
    const goalMatch = answers.q1 === "both" || p.lifestyle.includes(answers.q1);
    const budgetMatch = !answers.q2 || p.budget === answers.q2;
    const settingMap = { nature: ["nature"], spiritual: ["spiritual"], luxury: ["luxury", "investment"] };
    const settingMatch = !answers.q3 || (settingMap[answers.q3] || []).some(s => p.lifestyle.includes(s));
    return goalMatch && budgetMatch && settingMatch;
  }).slice(0, 3);
}

// ─── HELPERS ──────────────────────────────────────────────────────
const fmt = n => n >= 10000000 ? `₹${(n / 10000000).toFixed(2)} Cr` : n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${Math.round(n).toLocaleString()}`;
const aiSearch = (q) => {
  const s = q.toLowerCase();
  if (s.includes("mhow") || s.includes("valley")) return { text: `Valley estates in Mhow for "${q}"`, ids: [0] };
  if (s.includes("farm") || s.includes("simrol")) return { text: `Farmhouses near Indore for "${q}"`, ids: [3, 5] };
  if (s.includes("invest") || s.includes("yield") || s.includes("roi")) return { text: `Top ROI picks in Indore for "${q}"`, ids: [3, 0, 2] };
  if (s.includes("omkareshwar") || s.includes("river")) return { text: `River retreats near Indore for "${q}"`, ids: [1] };
  if (s.includes("luxury") || s.includes("penthouse")) return { text: `Luxury properties in Indore for "${q}"`, ids: [2, 4] };
  if (s.includes("budget") || s.includes("cheap") || s.includes("affordable")) return { text: `Affordable picks for "${q}"`, ids: [5, 3, 1] };
  return { text: `${PROPS.length} second homes in Indore matching "${q}"`, ids: [0, 1, 2, 3, 4, 5] };
};


// ══════════════════════════════════════════════════════
// NRI CORNER — DATA
// ══════════════════════════════════════════════════════
const NAVY = "#0F2544"; const NAVYL = "#1E3A5F";

const NRI_COUNTRIES = [
  { flag:"🇺🇸", name:"USA",       currency:"USD", rate:83.5  },
  { flag:"🇦🇪", name:"UAE",       currency:"AED", rate:22.7  },
  { flag:"🇬🇧", name:"UK",        currency:"GBP", rate:105.2 },
  { flag:"🇨🇦", name:"Canada",    currency:"CAD", rate:61.4  },
  { flag:"🇦🇺", name:"Australia", currency:"AUD", rate:54.8  },
  { flag:"🇸🇬", name:"Singapore", currency:"SGD", rate:62.1  },
];

const FEMA_RULES = [
  { icon:"✅", title:"Who Can Buy", color:C.green, bg:"#F0FDF4",
    points:["NRI (Non-Resident Indian) — Indian passport holder living abroad","OCI (Overseas Citizen of India) — foreign national of Indian origin","No RBI permission needed for residential or commercial property","Both NRI and OCI can purchase freely under FEMA 1999"] },
  { icon:"🏠", title:"What You Can Buy", color:"#2563EB", bg:"#EFF6FF",
    points:["Residential properties — villas, apartments, farmhouses ✅","Commercial properties — offices, shops ✅","Agricultural / plantation land — NOT allowed without RBI ⚠️","ERTH Simrol Farmhouse: NA-converted land — fully NRI eligible ✅"] },
  { icon:"💳", title:"How to Pay", color:C.amber, bg:"#FFFBEB",
    points:["Via NRE account — remit from abroad, tax-free in India","Via NRO account — for India-sourced funds, taxed in India","Foreign currency remittance via normal banking channels","Home loan from Indian bank in ₹ (NRI eligible up to 80% LTV)"] },
  { icon:"🔄", title:"Repatriation", color:"#7C3AED", bg:"#F5F3FF",
    points:["Up to USD 1 million per financial year can be repatriated","NRE account principal: fully repatriable without limit","Rental income (NRO): repatriable after tax deduction","Capital gains: repatriable after paying applicable taxes"] },
];

const TAX_SECTIONS = [
  { label:"Purchase", items:[
    { k:"Stamp Duty (MP)", v:"5–7%", c:C.amber },
    { k:"Registration Fee", v:"1%", c:C.amber },
    { k:"TDS by Buyer", v:"1%", c:C.amber, n:"if price > ₹50L" },
    { k:"GST (if UC)",   v:"5%", c:C.amber, n:"under-construction only" },
  ]},
  { label:"Rental Income", items:[
    { k:"TDS on Rent (NRI)", v:"30%", c:C.red, n:"deducted at source" },
    { k:"Net Tax (w/ deductions)", v:"~20%", c:C.red, n:"after standard deduction" },
    { k:"DTAA Benefit", v:"Varies", c:C.green, n:"India treaty with your country" },
    { k:"Repatriate via NRO", v:"✓", c:C.green, n:"up to USD 1M/yr" },
  ]},
  { label:"Capital Gains", items:[
    { k:"Short Term (< 2 yrs)", v:"30%", c:C.red, n:"per income slab" },
    { k:"Long Term (> 2 yrs)",  v:"20%", c:C.amber, n:"with indexation" },
    { k:"TDS by Buyer",         v:"20–30%", c:C.amber, n:"withheld at source" },
    { k:"54EC Bond Reinvest",   v:"Exempt", c:C.green, n:"within 6 months" },
  ]},
];

const NRI_BANKS = [
  { name:"State Bank of India", badge:"Most Popular",    rate:"8.50%", color:"#1B3A8A",
    features:["NRI Home Loans up to 80% LTV","Remittance in 190+ countries","NRE/NRO accounts globally"] },
  { name:"HDFC Bank",           badge:"Fastest Digital", rate:"8.75%", color:"#004C8F",
    features:["Video KYC — no India visit needed","Digital NRI application","Dedicated NRI RM"] },
  { name:"ICICI Bank",          badge:"Best App",        rate:"8.90%", color:"#B02A30",
    features:["iMobile app for NRIs","Wire transfer < 24 hrs","Pre-approved for existing customers"] },
  { name:"Axis Bank",           badge:"Gulf Friendly",   rate:"8.85%", color:"#800000",
    features:["Dedicated Gulf NRI desk","Linked to UAE Exchange","Arabic-speaking advisors"] },
];

const NRI_STEPS = [
  { n:"01", icon:"🔍", title:"Choose Your Property",    time:"Week 1",   desc:"Browse ERTH listings from anywhere. Our AI advisor works across your timezone — WhatsApp or video call at your convenience." },
  { n:"02", icon:"📱", title:"WhatsApp Video Tour",      time:"Week 1–2", desc:"Can't fly in? Our advisor does a live video walk-through on WhatsApp. See every corner, ask questions in real time." },
  { n:"03", icon:"⚖️", title:"Legal Due Diligence",     time:"Week 2–3", desc:"ERTH's empanelled lawyer verifies RERA, title, encumbrance, and land conversion. Full legal report shared digitally." },
  { n:"04", icon:"🏦", title:"NRE / NRO Account Setup", time:"Week 2–3", desc:"If you don't have one, we'll connect you with SBI or HDFC for fast NRI account opening — most banks now do video KYC." },
  { n:"05", icon:"✍️", title:"Booking & Agreement",     time:"Week 3–4", desc:"Pay 10% booking via wire transfer. Sale agreement executed digitally — no India visit required at this stage." },
  { n:"06", icon:"💰", title:"Home Loan (If Needed)",   time:"Week 4–6", desc:"ERTH partners with SBI, HDFC, ICICI for NRI home loans. Video KYC available. Sanction in 7–10 working days." },
  { n:"07", icon:"📋", title:"Registration via PoA",    time:"Week 5–7", desc:"Give Power of Attorney to a trusted person in India. They complete sub-registrar registration — you stay in your country." },
  { n:"08", icon:"🏆", title:"Start Earning Rent",      time:"Month 2+", desc:"ERTH manages the property, lists on Airbnb, handles maintenance. Rental income credited to your NRO account monthly." },
];

const NRI_FAQS = [
  { q:"Can I buy property in India from abroad without visiting?",
    a:"Yes. ERTH facilitates the entire purchase remotely — virtual site tour via WhatsApp video, digital legal due diligence, and Power of Attorney for registration. You never need to visit India until you want to." },
  { q:"Can an NRI buy the Simrol Farmhouse (agricultural land)?",
    a:"Yes. The Simrol Farmhouse land has been NA-converted (Non-Agricultural) to Residential use, making it fully NRI-eligible without special RBI permission. ERTH verifies this as part of Legal Clarity on every listing." },
  { q:"How does rental income reach me abroad?",
    a:"Rental income is credited to your NRO account after 30% TDS. You can then repatriate up to USD 1 million per year after taxes. ERTH coordinates with your CA for efficient tax planning." },
  { q:"What is Power of Attorney and do I need it?",
    a:"PoA authorises a trusted person in India to sign documents on your behalf. It's executed at the Indian Embassy/Consulate in your country and registered in India. ERTH provides a PoA template and full guidance." },
  { q:"What home loan options exist for NRIs?",
    a:"SBI, HDFC, ICICI, and Axis Bank all offer NRI home loans up to 80% LTV at 8.5–9% p.a. Video KYC means no India visit needed. ERTH has direct relationships with all four banks." },
  { q:"Is my investment safe? What if the developer defaults?",
    a:"All ERTH properties are RERA-registered (or applied), legally mandating developer accountability. We verify title, encumbrance, and land conversion before listing. MP RERA oversees all projects." },
];

// ══════════════════════════════════════════════════════
// LEGAL CLARITY BADGE
// ══════════════════════════════════════════════════════
function LegalBadge({ legal, small }) {
  const [tip, setTip] = useState(false);
  const cfg = {
    green: { bg: "#DCFCE7", color: "#16A34A", icon: "✓", label: "Legal Clarity", dot: "#16A34A" },
    amber: { bg: "#FEF3C7", color: "#D97706", icon: "⚠", label: "Review Needed", dot: "#D97706" },
    red: { bg: "#FEE2E2", color: "#DC2626", icon: "✗", label: "Legal Query", dot: "#DC2626" },
  }[legal.status] || {};

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <div onClick={() => setTip(t => !t)} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: cfg.bg, color: cfg.color, fontSize: small ? 10 : 11, fontWeight: 700, padding: small ? "3px 8px" : "4px 10px", borderRadius: 20, cursor: "pointer", border: `1px solid ${cfg.color}30`, userSelect: "none" }}>
        <span>{cfg.icon}</span> {cfg.label}
      </div>
      {tip && (
        <div onClick={() => setTip(false)} style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 999, background: C.charcoal, color: "#fff", borderRadius: 10, padding: "12px 14px", minWidth: 220, boxShadow: "0 8px 24px rgba(0,0,0,0.25)", fontSize: 12, lineHeight: 1.7 }}>
          <div style={{ fontWeight: 700, marginBottom: 7, color: cfg.dot }}>Legal Status Details</div>
          {[["RERA", legal.rera], ["Title", legal.title], ["Encumbrance", legal.encumbrance], ["Land Type", legal.landType]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 10, borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 5, marginBottom: 5 }}>
              <span style={{ color: "rgba(255,255,255,0.5)" }}>{k}</span>
              <span style={{ fontWeight: 600, textAlign: "right" }}>{v}</span>
            </div>
          ))}
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 6 }}>Tap anywhere to close</div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════
// VERIFIED YIELD BADGE
// ══════════════════════════════════════════════════════
function YieldBadge({ yieldPct, small }) {
  const [tip, setTip] = useState(false);
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <div onClick={() => setTip(t => !t)} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: `${C.gold}18`, color: C.gold, fontSize: small ? 11 : 12, fontWeight: 800, padding: small ? "3px 9px" : "5px 11px", borderRadius: 20, cursor: "pointer", border: `1px solid ${C.gold}40`, userSelect: "none" }}>
        <span style={{ fontSize: 10 }}>✓</span> {yieldPct}% Verified Yield
      </div>
      {tip && (
        <div onClick={() => setTip(false)} style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 999, background: C.charcoal, color: "#fff", borderRadius: 10, padding: "14px 16px", minWidth: 240, boxShadow: "0 8px 24px rgba(0,0,0,0.25)", fontSize: 12, lineHeight: 1.7 }}>
          <div style={{ fontWeight: 700, color: C.gold, marginBottom: 8 }}>How We Verify Yield</div>
          {["Based on comparable Airbnb & long-term rentals in this micro-market", "Cross-verified with 3+ active listings in the same locality", "75% occupancy assumption (industry conservative standard)", "Updated quarterly by ERTH research team"].map((t, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 5 }}>
              <span style={{ color: C.gold, flexShrink: 0 }}>✓</span><span style={{ color: "rgba(255,255,255,0.75)" }}>{t}</span>
            </div>
          ))}
          <div style={{ marginTop: 10, padding: "8px 10px", background: "rgba(184,149,90,0.15)", borderRadius: 7, fontSize: 11, color: C.gold }}>
            Unlike broker claims, ERTH yield is independently verified. Not a projection — a range.
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 8 }}>Tap to close</div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════
// NO BROKER FEE TRUST BAR
// ══════════════════════════════════════════════════════
// NAV_H = nav height. TRUST_H = trust bar height (desktop only).
const NAV_H_MOB  = 56;   // px
const NAV_H_DESK = 64;   // px
const TRUST_H    = 36;   // px — desktop only

function TrustBar() {
  const w = useW(); const mob = w < 768;
  // Hidden on mobile — shown as part of hero badge instead
  if (mob) return null;
  const items = [
    { icon: "🚫", text: "Zero Broker Commission", sub: "Save ₹1.5L–5L" },
    { icon: "✓",  text: "Verified Yields",        sub: "ERTH-verified data" },
    { icon: "⚖️", text: "Legal Clarity",          sub: "RERA & title checked" },
    { icon: "🚗", text: "Free Site Visit",         sub: "Advisor drives you" },
  ];
  return (
    <div style={{
      position: "fixed", top: NAV_H_DESK, left: 0, right: 0, zIndex: 190,
      height: TRUST_H, background: C.forestDark,
      borderBottom: `1.5px solid ${C.gold}44`,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ display: "flex", alignItems: "center", height: "100%", overflowX: "auto", scrollbarWidth: "none" }}>
        {items.map((item, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "0 22px",
            borderRight: i < items.length - 1 ? "1px solid rgba(196,168,130,0.15)" : "none",
            height: "100%", flexShrink: 0,
          }}>
            <span style={{ fontSize: 13 }}>{item.icon}</span>
            <div>
              <span style={{ color: C.tan, fontSize: 11, fontWeight: 700 }}>{item.text}</span>
              <span style={{ color: "rgba(255,255,255,0.38)", fontSize: 10, marginLeft: 5 }}>{item.sub}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// EMI VS RENT PANEL (inside property modal)
// ══════════════════════════════════════════════════════
function EmiVsRent({ prop }) {
  const w = useW(); const mob = w < 768;
  const [dp, setDp] = useState(20);
  const [tenure, setTenure] = useState(20);
  const rate = prop.loanRate / 100 / 12;
  const loanAmt = (prop.priceNum * 100000) * (1 - dp / 100);
  const n = tenure * 12;
  const emi = Math.round(loanAmt * rate * Math.pow(1 + rate, n) / (Math.pow(1 + rate, n) - 1));
  const netCost = Math.max(0, emi - prop.monthlyRent);
  const coveragePct = Math.min(100, Math.round((prop.monthlyRent / emi) * 100));

  return (
    <div style={{ background: `linear-gradient(135deg,${C.forestDark},${C.forest})`, borderRadius: 14, padding: mob ? "18px 16px" : "22px 24px", margin: "20px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 20 }}>🏦</span>
        <div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 15, fontFamily: "Georgia,serif" }}>EMI vs Rent Calculator</div>
          <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11 }}>How much does this property actually cost you per month?</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: 14, marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 5 }}>Down Payment: {dp}%</div>
          <input type="range" min={10} max={50} step={5} value={dp} onChange={e => setDp(Number(e.target.value))} style={{ width: "100%", accentColor: C.tan }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "rgba(255,255,255,0.3)" }}><span>10%</span><span style={{ color: C.tan, fontWeight: 700 }}>{fmt(loanAmt)}</span><span>50%</span></div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 5 }}>Loan Tenure: {tenure} years</div>
          <input type="range" min={10} max={30} step={5} value={tenure} onChange={e => setTenure(Number(e.target.value))} style={{ width: "100%", accentColor: C.tan }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "rgba(255,255,255,0.3)" }}><span>10 yrs</span><span>30 yrs</span></div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 14 }}>
        {[
          { label: "Monthly EMI", val: fmt(emi), color: "#fff" },
          { label: "Rental Income", val: fmt(prop.monthlyRent), color: "#4ADE80" },
          { label: "Your Net Cost", val: netCost === 0 ? "₹0 🎉" : fmt(netCost), color: netCost === 0 ? "#4ADE80" : C.tan },
        ].map((s, i) => (
          <div key={i} style={{ background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: "12px 10px", textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", letterSpacing: 0.5, marginBottom: 5 }}>{s.label}</div>
            <div style={{ fontSize: mob ? 15 : 18, fontWeight: 800, color: s.color, fontFamily: "Georgia,serif" }}>{s.val}</div>
          </div>
        ))}
      </div>
      <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "12px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>Rental covers your EMI</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: coveragePct >= 80 ? "#4ADE80" : C.tan }}>{coveragePct}%</span>
        </div>
        <div style={{ height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${coveragePct}%`, background: coveragePct >= 80 ? "#4ADE80" : C.tan, borderRadius: 3, transition: "width 0.4s" }} />
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 7 }}>
          {coveragePct >= 80 ? `🎉 Rental income nearly covers your full EMI. Effective monthly cost: ${fmt(netCost)}` : `Rental covers ${coveragePct}% of your EMI. Increase down payment to reduce net cost.`}
        </div>
      </div>
      <div style={{ marginTop: 12, padding: "10px 12px", background: "rgba(196,168,130,0.12)", borderRadius: 8, border: `1px solid rgba(196,168,130,0.2)` }}>
        <div style={{ fontSize: 11, color: C.tan, fontWeight: 700, marginBottom: 3 }}>🚫 No Broker Commission = Save {fmt(prop.brokerSaving)}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>Traditional brokers charge 2–3% on this property. With ERTH, that saving is yours.</div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// AI MATCHMAKER QUIZ
// ══════════════════════════════════════════════════════
function MatchmakerQuiz({ onClose, onEnquire }) {
  const w = useW(); const mob = w < 768;
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [matches, setMatches] = useState(null);
  const [selectedProp, setSelectedProp] = useState(null);

  useEffect(() => { document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = ""; }; }, []);

  const answer = (val) => {
    const newAnswers = { ...answers, [QUIZ[step].id]: val };
    setAnswers(newAnswers);
    if (step < QUIZ.length - 1) {
      setStep(s => s + 1);
    } else {
      setMatches(matchProperties(newAnswers));
    }
  };

  const pct = Math.round(((step) / QUIZ.length) * 100);
  const q = QUIZ[step];

  return (
    <div onClick={matches ? undefined : undefined} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 700, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: mob ? "flex-end" : "center", justifyContent: "center", padding: mob ? 0 : 24, backdropFilter: "blur(6px)" }}>
      <div style={{ background: C.white, borderRadius: mob ? "20px 20px 0 0" : 20, width: "100%", maxWidth: 520, maxHeight: mob ? "90vh" : "auto", overflowY: "auto" }}>
        {!matches ? (
          <>
            {/* Quiz header */}
            <div style={{ background: `linear-gradient(135deg,${C.forest},${C.forestDark})`, padding: "20px 22px 16px", borderRadius: mob ? "20px 20px 0 0" : "20px 20px 0 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div>
                  <div style={{ color: C.tan, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700, marginBottom: 3 }}>AI MATCHMAKER</div>
                  <div style={{ color: "#fff", fontSize: 16, fontWeight: 700, fontFamily: "Georgia,serif" }}>Find Your Perfect Property</div>
                </div>
                <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", color: "#fff", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
              </div>
              <div style={{ height: 4, background: "rgba(255,255,255,0.15)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: C.tan, borderRadius: 2, transition: "width 0.4s" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Question {step + 1} of {QUIZ.length}</span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{pct}% complete</span>
              </div>
            </div>

            {/* Question */}
            <div style={{ padding: "24px 22px" }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>{q.emoji}</div>
              <h2 style={{ fontFamily: "Georgia,serif", fontSize: 20, fontWeight: 700, color: C.charcoal, marginBottom: 20 }}>{q.question}</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {q.options.map(opt => (
                  <button key={opt.value} onClick={() => answer(opt.value)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", background: answers[q.id] === opt.value ? `${C.forest}12` : C.cream, border: `2px solid ${answers[q.id] === opt.value ? C.forest : "#E0D8CC"}`, borderRadius: 12, cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}>
                    <span style={{ fontSize: 24, flexShrink: 0 }}>{opt.icon}</span>
                    <div>
                      <div style={{ fontFamily: "Georgia,serif", fontSize: 15, fontWeight: 700, color: C.charcoal, marginBottom: 2 }}>{opt.label}</div>
                      <div style={{ fontSize: 12, color: C.gray }}>{opt.sub}</div>
                    </div>
                    <span style={{ marginLeft: "auto", color: C.forest, fontSize: 18 }}>→</span>
                  </button>
                ))}
              </div>
              {step > 0 && <button onClick={() => setStep(s => s - 1)} style={{ marginTop: 16, background: "none", border: "none", color: C.gray, cursor: "pointer", fontSize: 13, fontFamily: "Georgia,serif" }}>← Back</button>}
            </div>
          </>
        ) : (
          /* Results */
          <div>
            <div style={{ background: `linear-gradient(135deg,${C.forest},${C.forestDark})`, padding: "20px 22px", borderRadius: mob ? "20px 20px 0 0" : "20px 20px 0 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ color: C.tan, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700, marginBottom: 3 }}>AI MATCHED</div>
                  <div style={{ color: "#fff", fontSize: 16, fontWeight: 700, fontFamily: "Georgia,serif" }}>
                    {matches.length > 0 ? `${matches.length} Properties Perfect for You` : "Let's Widen Your Search"}
                  </div>
                </div>
                <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", color: "#fff", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
              </div>
            </div>
            <div style={{ padding: "16px 18px" }}>
              {(matches.length > 0 ? matches : PROPS.slice(0, 3)).map((p, i) => (
                <div key={p.id} onClick={() => setSelectedProp(selectedProp?.id === p.id ? null : p)} style={{ background: selectedProp?.id === p.id ? `${C.forest}08` : C.cream, border: `2px solid ${selectedProp?.id === p.id ? C.forest : "#E0D8CC"}`, borderRadius: 12, padding: "14px 16px", marginBottom: 10, cursor: "pointer", transition: "all 0.2s" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ fontSize: 36, flexShrink: 0 }}>{p.img}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                        <span style={{ fontFamily: "Georgia,serif", fontSize: 14, fontWeight: 700, color: C.charcoal }}>{p.title}</span>
                        {i === 0 && <span style={{ background: C.forest, color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 10 }}>TOP MATCH</span>}
                      </div>
                      <div style={{ fontSize: 11, color: C.gray, marginBottom: 5 }}>📍 {p.location}</div>
                      <div style={{ display: "flex", gap: 10 }}>
                        <span style={{ fontFamily: "Georgia,serif", fontSize: 15, fontWeight: 800, color: C.forest }}>{p.price}</span>
                        <span style={{ fontSize: 11, color: C.gold, fontWeight: 700 }}>✓ {p.yield}% yield</span>
                      </div>
                    </div>
                    <span style={{ color: C.forest, fontSize: 18 }}>{selectedProp?.id === p.id ? "▲" : "▼"}</span>
                  </div>
                  {selectedProp?.id === p.id && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #E0D8CC" }}>
                      <div style={{ fontSize: 12, color: C.gray, lineHeight: 1.7, marginBottom: 10 }}>{p.desc}</div>
                      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                        <YieldBadge yieldPct={p.yield} small />
                        <LegalBadge legal={p.legal} small />
                      </div>
                      <div style={{ background: `${C.gold}12`, border: `1px solid ${C.gold}30`, borderRadius: 8, padding: "8px 12px", fontSize: 12, color: C.charcoal, marginBottom: 12 }}>
                        🚫 No broker fee — save <strong>{fmt(p.brokerSaving)}</strong> vs traditional purchase
                      </div>
                      <button onClick={() => { onEnquire(p); onClose(); }} style={{ width: "100%", background: `linear-gradient(135deg,${C.forest},${C.forestLight})`, border: "none", borderRadius: 9, padding: "13px", cursor: "pointer", color: "#fff", fontFamily: "Georgia,serif", fontWeight: 700, fontSize: 14 }}>
                        📋 Enquire About This Property
                      </button>
                    </div>
                  )}
                </div>
              ))}
              <button onClick={() => { setStep(0); setAnswers({}); setMatches(null); }} style={{ width: "100%", background: "transparent", border: `1.5px solid ${C.forest}`, borderRadius: 9, padding: "11px", cursor: "pointer", color: C.forest, fontFamily: "Georgia,serif", fontWeight: 600, fontSize: 13, marginTop: 4 }}>
                ← Retake Quiz
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


// ══════════════════════════════════════════════════════
// DEVELOPER BACKGROUND CHECK COMPONENT
// ══════════════════════════════════════════════════════
function DeveloperSection({ propId, mob }) {
  const [expanded, setExpanded] = useState(false);
  const dev = DEVELOPERS[propId];
  if (!dev) return null;

  const checks = [
    { label: "MCA Company Registration", value: dev.mcaReg, verified: !!dev.mcaReg, icon: "🏛️" },
    { label: "GSTIN Verified", value: dev.gst, verified: !!dev.gst, icon: "📋" },
    { label: "RERA Developer Reg.", value: dev.rera_dev, verified: !dev.rera_dev.includes("Applied"), icon: "✅" },
    { label: "ERTH Background Check", value: dev.erth_verified ? "Verified by ERTH team" : "Verification pending", verified: dev.erth_verified, icon: "🔍" },
  ];
  const verifiedCount = checks.filter(c => c.verified).length;
  const scoreColor = verifiedCount === 4 ? C.green : verifiedCount >= 3 ? C.amber : C.red;
  const scoreLabel = verifiedCount === 4 ? "Fully Verified" : verifiedCount >= 3 ? "Mostly Verified" : "Under Review";

  return (
    <div style={{ background: verifiedCount >= 3 ? "#F8FFF8" : "#FFFBEB", border: `1.5px solid ${scoreColor}25`, borderRadius: 14, overflow: "hidden", margin: "20px 0" }}>
      {/* Header */}
      <div onClick={() => setExpanded(e => !e)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: mob ? "14px 16px" : "16px 20px", cursor: "pointer" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg,${C.forest},${C.forestLight})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🏢</div>
          <div>
            <div style={{ fontFamily: "Georgia,serif", fontSize: mob ? 13 : 15, fontWeight: 700, color: C.charcoal, marginBottom: 2 }}>{dev.company}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, background: `${scoreColor}15`, color: scoreColor, fontWeight: 700, padding: "2px 9px", borderRadius: 10, border: `1px solid ${scoreColor}30` }}>
                {verifiedCount}/4 ✓ {scoreLabel}
              </span>
              <span style={{ fontSize: 10, color: C.gray }}>Since {dev.since} · {dev.projects} projects</span>
            </div>
          </div>
        </div>
        <span style={{ color: C.gray, fontSize: 12, flexShrink: 0 }}>{expanded ? "▲ Less" : "▼ More"}</span>
      </div>

      {/* Score bar */}
      <div style={{ height: 4, background: "#E8E0D0", margin: "0 16px 14px" }}>
        <div style={{ height: "100%", width: `${(verifiedCount / 4) * 100}%`, background: `linear-gradient(90deg,${scoreColor},${scoreColor}bb)`, borderRadius: 2, transition: "width 0.6s" }} />
      </div>

      {/* Quick checks always visible */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8, padding: mob ? "0 14px 14px" : "0 18px 16px" }}>
        {checks.map((chk, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 7, padding: "8px 10px", background: "#fff", borderRadius: 8, border: `1px solid ${chk.verified ? C.green + "25" : C.amber + "30"}` }}>
            <span style={{ fontSize: 14, flexShrink: 0 }}>{chk.verified ? "✅" : "⏳"}</span>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.charcoal, marginBottom: 1 }}>{chk.label}</div>
              <div style={{ fontSize: 10, color: chk.verified ? C.green : C.amber, fontWeight: 600 }}>{chk.verified ? "Verified" : "Pending"}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{ borderTop: "1px solid #E8E0D0", padding: mob ? "14px 14px" : "18px 20px" }}>

          {/* Registration numbers */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.gray, textTransform: "uppercase", letterSpacing: .5, marginBottom: 9 }}>Registration Details</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {checks.map((chk, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "9px 12px", background: C.cream, borderRadius: 8, gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ fontSize: 14 }}>{chk.icon}</span>
                    <span style={{ fontSize: 12, color: C.charcoal, fontWeight: 600 }}>{chk.label}</span>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 11, color: chk.verified ? C.green : C.amber, fontWeight: 700 }}>{chk.verified ? "✓ Verified" : "⏳ Pending"}</div>
                    <div style={{ fontSize: 10, color: C.gray, maxWidth: 160, textAlign: "right" }}>{chk.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Past Projects */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.gray, textTransform: "uppercase", letterSpacing: .5, marginBottom: 9 }}>Past Projects Delivered</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {dev.past.map((p, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#fff", borderRadius: 8, border: "1px solid #E8E0D0" }}>
                  <span style={{ color: C.green, fontWeight: 800, fontSize: 13, flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: 12, color: C.charcoal }}>{p}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Developer stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 14 }}>
            {[
              { l: "Years Active", v: `${new Date().getFullYear() - parseInt(dev.since)} yrs` },
              { l: "Projects Done", v: dev.projects + "+" },
              { l: "ERTH Rating", v: `${dev.rating}⭐` },
            ].map((s, i) => (
              <div key={i} style={{ background: C.cream, borderRadius: 9, padding: "10px 8px", textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: C.forest, fontFamily: "Georgia,serif", marginBottom: 2 }}>{s.v}</div>
                <div style={{ fontSize: 9, color: C.gray, textTransform: "uppercase", letterSpacing: .4, fontWeight: 600 }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* ERTH disclaimer */}
          <div style={{ background: `${C.forest}08`, border: `1px solid ${C.forest}18`, borderRadius: 9, padding: "10px 13px", display: "flex", gap: 8 }}>
            <span style={{ fontSize: 14, flexShrink: 0 }}>🔍</span>
            <div style={{ fontSize: 11, color: C.forest, lineHeight: 1.6 }}>
              <strong>ERTH Verification Process:</strong> We check MCA registration, RERA compliance, GST filing history, past project delivery record, and buyer reviews before listing any developer on our platform.
              {!dev.erth_verified && <span style={{ color: C.amber, display: "block", marginTop: 4 }}>⏳ Full verification in progress. Data shared is self-declared by developer.</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════
// PROPERTY DETAIL MODAL
// ══════════════════════════════════════════════════════
function PropertyModal({ prop, onClose, onEnquire }) {
  const w = useW(); const mob = w < 768;
  useEffect(() => { document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = ""; }; }, []);
  return (
    <div onClick={onClose} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 500, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: mob ? "flex-end" : "center", justifyContent: "center", padding: mob ? 0 : 24, backdropFilter: "blur(4px)" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.white, borderRadius: mob ? "20px 20px 0 0" : 18, width: "100%", maxWidth: 860, maxHeight: mob ? "92vh" : "88vh", overflowY: "auto" }}>
        <div style={{ height: mob ? 180 : 240, background: `linear-gradient(135deg,${C.forest}33,${C.forestDark}66)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: mob ? 72 : 96, position: "relative", borderRadius: mob ? "20px 20px 0 0" : "18px 18px 0 0" }}>
          {prop.img}
          <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", fontSize: 17, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: C.charcoal }}>×</button>
          <div style={{ position: "absolute", top: 14, left: 14, background: prop.tagColor, color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", padding: "4px 10px", borderRadius: 5 }}>{prop.tag}</div>
          <div style={{ position: "absolute", bottom: 14, right: 14, background: "rgba(255,255,255,0.92)", fontSize: 11, color: C.forest, fontWeight: 600, padding: "4px 10px", borderRadius: 5 }}>{prop.status}</div>
        </div>
        <div style={{ padding: mob ? "18px 16px 28px" : "28px 32px 36px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: mob ? "flex-start" : "center", flexDirection: mob ? "column" : "row", gap: 12, marginBottom: 12 }}>
            <div>
              <h2 style={{ fontFamily: "Georgia,serif", fontSize: mob ? 20 : 26, fontWeight: 700, color: C.charcoal, marginBottom: 3 }}>{prop.title}</h2>
              <p style={{ color: C.gray, fontSize: 13 }}>📍 {prop.location}</p>
            </div>
            <div style={{ textAlign: mob ? "left" : "right" }}>
              <div style={{ fontFamily: "Georgia,serif", fontSize: mob ? 24 : 30, fontWeight: 800, color: C.forest }}>{prop.price}</div>
              <div style={{ fontSize: 11, color: C.gray }}>{prop.area} · {prop.type}</div>
            </div>
          </div>

          {/* Trust badges row */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16, padding: "12px 14px", background: C.cream, borderRadius: 10 }}>
            <YieldBadge yieldPct={prop.yield} />
            <LegalBadge legal={prop.legal} />
            <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#FEE2E2", color: C.red, fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, border: `1px solid ${C.red}20` }}>
              🚫 Save {fmt(prop.brokerSaving)} — No Broker Fee
            </div>
          </div>

          {/* Quick stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 16, background: C.cream, borderRadius: 12, padding: "14px 12px" }}>
            {[{ l: "Beds", v: prop.beds + " BHK" }, { l: "Baths", v: prop.baths }, { l: "Area", v: prop.area }, { l: "Facing", v: prop.facing }].map((s, i) => (
              <div key={i} style={{ textAlign: "center", borderRight: i < 3 ? "1px solid #DDD" : "none" }}>
                <div style={{ fontSize: 10, color: C.gray, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>{s.l}</div>
                <div style={{ fontSize: mob ? 13 : 15, fontWeight: 700, color: C.forest, fontFamily: "Georgia,serif" }}>{s.v}</div>
              </div>
            ))}
          </div>

          <p style={{ color: C.gray, fontSize: 13, lineHeight: 1.8, marginBottom: 16 }}>{prop.desc}</p>

          {/* Amenities */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: "Georgia,serif", fontSize: 14, fontWeight: 700, color: C.charcoal, marginBottom: 10 }}>Amenities</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {prop.amenities.map(a => <span key={a} style={{ background: `${C.forest}10`, color: C.forest, fontSize: 11, padding: "5px 12px", borderRadius: 20, border: `1px solid ${C.forest}20` }}>✓ {a}</span>)}
            </div>
          </div>

          {/* EMI vs Rent */}
          <EmiVsRent prop={prop} />

          {/* Legal detail */}
          <div style={{ background: prop.legal.status === "green" ? "#F0FDF4" : "#FFFBEB", border: `1px solid ${prop.legal.status === "green" ? "#BBF7D0" : "#FDE68A"}`, borderRadius: 12, padding: "14px 16px", marginBottom: 20 }}>
            <div style={{ fontFamily: "Georgia,serif", fontSize: 14, fontWeight: 700, color: C.charcoal, marginBottom: 10 }}>⚖️ Legal Transparency Report</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[["RERA Number", prop.legal.rera], ["Title Status", prop.legal.title], ["Encumbrance", prop.legal.encumbrance], ["Land Type", prop.legal.landType]].map(([k, v]) => (
                <div key={k} style={{ background: "#fff", borderRadius: 8, padding: "9px 12px" }}>
                  <div style={{ fontSize: 10, color: C.gray, marginBottom: 3 }}>{k}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.charcoal }}>{v}</div>
                </div>
              ))}
            </div>
            {prop.legal.status === "amber" && <div style={{ marginTop: 10, fontSize: 11, color: C.amber }}>⚠️ Land conversion in progress. Our legal team will share the full timeline on request.</div>}
          </div>

          {/* Developer Background Check */}
          <DeveloperSection propId={prop.id} mob={mob} />

          {/* CTA */}
          <div style={{ display: "flex", gap: 10, flexDirection: mob ? "column" : "row" }}>
            <button onClick={onEnquire} style={{ flex: 1, background: `linear-gradient(135deg,${C.forest},${C.forestLight})`, border: "none", borderRadius: 10, cursor: "pointer", color: "#fff", padding: "15px", fontFamily: "Georgia,serif", fontWeight: 700, fontSize: 15 }}>
              📋 Book Free Consultation
            </button>
            <a href={`https://wa.me/919004343267?text=Hi ERTH! I'm interested in ${encodeURIComponent(prop.title + " (" + prop.price + ") — no broker fee deal!")}`} target="_blank" rel="noreferrer" style={{ flex: mob ? "none" : 1, background: "#25D366", border: "none", borderRadius: 10, cursor: "pointer", color: "#fff", padding: "15px", fontFamily: "Georgia,serif", fontWeight: 700, fontSize: 15, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              💬 WhatsApp Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// ENQUIRY MODAL
// ══════════════════════════════════════════════════════
function EnquiryModal({ prop, onClose }) {
  const w = useW(); const mob = w < 768;
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: prop ? `I'm interested in ${prop.title} (${prop.price}) — please share details.` : "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => { document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = ""; }; }, []);

  const handleSubmit = () => {
    if (!form.name || !form.phone) return;
    setLoading(true);
    // Save lead to Supabase
    saveToSupabase("leads", {
      name: form.name, phone: form.phone, email: form.email,
      message: form.message, source: "Enquiry Form",
      property_name: prop ? prop.title : null,
      status: "New", lead_score: "warm",
    }).then(() => { setLoading(false); setSubmitted(true); });
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 600, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: mob ? "flex-end" : "center", justifyContent: "center", padding: mob ? 0 : 24, backdropFilter: "blur(4px)" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.white, borderRadius: mob ? "20px 20px 0 0" : 18, width: "100%", maxWidth: 500, maxHeight: mob ? "90vh" : "auto", overflowY: "auto" }}>
        {submitted ? (
          <div style={{ padding: mob ? "40px 24px" : "52px 44px", textAlign: "center" }}>
            <div style={{ fontSize: 56, marginBottom: 14 }}>✅</div>
            <h2 style={{ fontFamily: "Georgia,serif", fontSize: 22, fontWeight: 700, color: C.forest, marginBottom: 8 }}>Enquiry Received!</h2>
            <p style={{ color: C.gray, fontSize: 14, lineHeight: 1.7, marginBottom: 6 }}>Our advisor will call <strong>{form.phone}</strong> within 2 hours.</p>
            <p style={{ color: C.gray, fontSize: 13, marginBottom: 24 }}>Property details + ROI report will be sent on WhatsApp.</p>
            {prop && <div style={{ background: `${C.gold}12`, border: `1px solid ${C.gold}30`, borderRadius: 10, padding: "12px 16px", marginBottom: 24, fontSize: 13, color: C.charcoal }}>
              🚫 You'll save <strong>{fmt(prop.brokerSaving)}</strong> in broker commission with ERTH.
            </div>}
            <button onClick={onClose} style={{ background: `linear-gradient(135deg,${C.forest},${C.forestLight})`, border: "none", borderRadius: 8, cursor: "pointer", color: "#fff", padding: "12px 32px", fontFamily: "Georgia,serif", fontWeight: 700, fontSize: 15 }}>Done</button>
          </div>
        ) : (
          <div style={{ padding: mob ? "22px 18px 32px" : "32px 34px 38px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <h2 style={{ fontFamily: "Georgia,serif", fontSize: mob ? 19 : 22, fontWeight: 700, color: C.charcoal, marginBottom: 4 }}>Book Free Consultation</h2>
                {prop && <p style={{ color: C.forest, fontSize: 12, fontWeight: 600 }}>{prop.title} · {prop.price}</p>}
              </div>
              <button onClick={onClose} style={{ background: C.cream, border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontSize: 17, display: "flex", alignItems: "center", justifyContent: "center", color: C.charcoal, flexShrink: 0 }}>×</button>
            </div>
            <div style={{ background: `${C.forest}08`, border: `1px solid ${C.forest}18`, borderRadius: 10, padding: "11px 14px", marginBottom: 18, display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: 16 }}>⚡</span>
              <span style={{ fontSize: 12, color: C.forest, fontWeight: 600 }}>Advisor calls within 2 hours · Free site visit arranged · Zero broker fee</span>
            </div>
            {[["Full Name *", "name", "text", "Rahul Sharma"], ["Mobile Number *", "phone", "tel", "+91 98765 43210"], ["Email", "email", "email", "rahul@example.com"]].map(([label, key, type, ph]) => (
              <div key={key} style={{ marginBottom: 13 }}>
                <label style={{ display: "block", fontSize: 11, color: C.gray, letterSpacing: 0.5, marginBottom: 5, fontWeight: 600, textTransform: "uppercase" }}>{label}</label>
                <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={ph} style={{ width: "100%", background: C.cream, border: "1.5px solid #DDD", borderRadius: 8, padding: "10px 13px", fontSize: 14, fontFamily: "Georgia,serif", color: C.charcoal, outline: "none", boxSizing: "border-box" }} />
              </div>
            ))}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 11, color: C.gray, letterSpacing: 0.5, marginBottom: 5, fontWeight: 600, textTransform: "uppercase" }}>Message</label>
              <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={2} style={{ width: "100%", background: C.cream, border: "1.5px solid #DDD", borderRadius: 8, padding: "10px 13px", fontSize: 13, fontFamily: "Georgia,serif", color: C.charcoal, outline: "none", resize: "none", boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
              {["This week", "Next 3 months", "Just exploring", "Ready to invest"].map(t => (
                <label key={t} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: C.gray, cursor: "pointer", background: C.cream, borderRadius: 8, padding: "9px 11px", border: "1px solid #E0D8CC" }}>
                  <input type="radio" name="timeline" value={t} style={{ accentColor: C.forest }} /> {t}
                </label>
              ))}
            </div>
            <button onClick={handleSubmit} disabled={loading || !form.name || !form.phone} style={{ width: "100%", background: !form.name || !form.phone ? "#CCC" : `linear-gradient(135deg,${C.forest},${C.forestLight})`, border: "none", borderRadius: 10, cursor: !form.name || !form.phone ? "not-allowed" : "pointer", color: "#fff", padding: "14px", fontFamily: "Georgia,serif", fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              {loading ? <><div style={{ width: 15, height: 15, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin .7s linear infinite" }} />Submitting…</> : "📋 Book Free Consultation"}
            </button>
            <p style={{ textAlign: "center", fontSize: 11, color: C.gray, marginTop: 10 }}>No spam. We call once within 2 hours.</p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// PROPERTY CARD
// ══════════════════════════════════════════════════════
function Card({ p, onOpen, onEnquire }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ background: hov ? C.white : C.cream, borderRadius: 14, overflow: "hidden", border: `1px solid ${hov ? C.tan : "#E0D8CC"}`, transition: "all 0.25s", transform: hov ? "translateY(-4px)" : "none", boxShadow: hov ? "0 18px 36px rgba(44,74,62,0.12)" : "0 2px 8px rgba(44,74,62,0.05)", cursor: "pointer" }}>
      <div onClick={() => onOpen(p)} style={{ height: 170, background: `linear-gradient(135deg,${C.forest}22,${C.forestDark}44)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52, position: "relative", borderBottom: "1px solid #E0D8CC" }}>
        {p.img}
        <div style={{ position: "absolute", top: 11, left: 11, background: p.tagColor, color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", padding: "3px 9px", borderRadius: 4 }}>{p.tag}</div>
        <div style={{ position: "absolute", top: 11, right: 11, background: "rgba(255,255,255,0.92)", fontSize: 10, color: C.forest, fontWeight: 600, padding: "3px 8px", borderRadius: 4 }}>{p.status}</div>
        {/* Legal dot */}
        <div style={{ position: "absolute", bottom: 11, left: 11, width: 8, height: 8, borderRadius: "50%", background: p.legal.status === "green" ? C.green : C.amber, border: "2px solid #fff", title: p.legal.status === "green" ? "Legally Clear" : "Legal Review" }} />
      </div>
      <div style={{ padding: "14px 15px 16px" }}>
        <div onClick={() => onOpen(p)} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <div>
            <h3 style={{ fontFamily: "Georgia,serif", fontSize: 15, fontWeight: 700, color: C.charcoal, marginBottom: 2 }}>{p.title}</h3>
            <p style={{ color: C.gray, fontSize: 11 }}>📍 {p.location}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "Georgia,serif", fontSize: 16, fontWeight: 700, color: C.forest }}>{p.price}</div>
            <div style={{ fontSize: 10, color: C.gray }}>{p.area}</div>
          </div>
        </div>
        {/* Verified yield badge on card */}
        <div style={{ marginBottom: 10 }}>
          <YieldBadge yieldPct={p.yield} small />
        </div>
        <div style={{ display: "flex", gap: 5, marginBottom: 12, flexWrap: "wrap" }}>
          {p.amenities.slice(0, 3).map(a => <span key={a} style={{ background: `${C.forest}10`, color: C.forest, fontSize: 9, padding: "3px 8px", borderRadius: 20, border: `1px solid ${C.forest}18` }}>{a}</span>)}
        </div>
        {/* Broker saving */}
        <div style={{ background: "#FEF2F2", borderRadius: 7, padding: "6px 10px", marginBottom: 11, fontSize: 11, color: C.red, fontWeight: 600 }}>
          🚫 Save {fmt(p.brokerSaving)} — No Broker Fee
        </div>
        <div style={{ display: "flex", gap: 6, borderTop: "1px solid #E0D8CC", paddingTop: 11 }}>
          <button onClick={() => onOpen(p)} style={{ flex: 1, background: "transparent", border: `1.5px solid ${C.forest}`, borderRadius: 7, cursor: "pointer", color: C.forest, padding: "8px", fontSize: 12, fontFamily: "Georgia,serif", fontWeight: 600 }}>View →</button>
          <button onClick={() => onEnquire(p)} style={{ flex: 2, background: `linear-gradient(135deg,${C.forest},${C.forestLight})`, border: "none", borderRadius: 7, cursor: "pointer", color: "#fff", padding: "8px", fontSize: 12, fontFamily: "Georgia,serif", fontWeight: 700 }}>📋 Enquire Free</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// NAV
// ══════════════════════════════════════════════════════
function Nav({ page, go, onEnquire }) {
  const w = useW(); const mob = w < 768;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const h = () => setScrolled(window.scrollY > 40); window.addEventListener("scroll", h); return () => window.removeEventListener("scroll", h); }, []);
  const nav = (p) => { go(p); setOpen(false); };
  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        height: mob ? NAV_H_MOB : NAV_H_DESK,
        padding: mob ? "0 18px" : "0 44px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: (scrolled || open || page !== "home") ? "rgba(22,38,30,0.97)" : "transparent",
        backdropFilter: (scrolled || page !== "home") ? "blur(14px)" : "none",
        borderBottom: (scrolled || page !== "home") ? `1px solid rgba(196,168,130,0.2)` : "none",
        transition: "all 0.3s",
      }}>
        {/* Logo */}
        <div onClick={() => nav("home")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 9, flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg,${C.forest},${C.tan})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 13, letterSpacing: 0 }}>E</span>
          </div>
          <span style={{ color: "#fff", fontFamily: "Georgia,serif", fontSize: mob ? 18 : 20, fontWeight: 700, letterSpacing: 2 }}>ERTH</span>
        </div>

        {/* Desktop nav */}
        {!mob && (
          <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
            {["Properties", "Market Intelligence", "Calculator", "NRI", "About"].map(l => (
              <button key={l} onClick={() => nav(l === "Market Intelligence" ? "market" : l === "About" ? "about" : l.toLowerCase())} style={{
                background: "none", border: "none", cursor: "pointer",
                color: page === l.toLowerCase() ? C.tan : "rgba(255,255,255,0.65)",
                fontFamily: "Georgia,serif", fontSize: 13, letterSpacing: 1.5,
                textTransform: "uppercase", padding: "4px 0",
                borderBottom: page === l.toLowerCase() ? `1.5px solid ${C.tan}` : "1.5px solid transparent",
                transition: "all 0.2s",
              }}>{l}</button>
            ))}
            <button onClick={() => onEnquire(null)} style={{
              background: `linear-gradient(135deg,${C.tan},${C.gold})`,
              border: "none", borderRadius: 6, cursor: "pointer",
              color: C.charcoal, padding: "9px 22px",
              fontFamily: "Georgia,serif", fontSize: 12, fontWeight: 700,
              letterSpacing: 1, textTransform: "uppercase", whiteSpace: "nowrap",
              boxShadow: `0 2px 10px ${C.gold}40`,
            }}>Free Consultation</button>
          </div>
        )}

        {/* Mobile hamburger */}
        {mob && (
          <button onClick={() => setOpen(o => !o)} style={{ background: "none", border: "none", cursor: "pointer", padding: 8, display: "flex", flexDirection: "column", gap: 5, flexShrink: 0 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width: 22, height: 2, background: C.tan, borderRadius: 1, transition: "all 0.3s",
                transform: open ? (["rotate(45deg) translate(5px,5px)","scaleX(0)","rotate(-45deg) translate(5px,-5px)"][i]) : "none",
                opacity: open && i===1 ? 0 : 1,
              }} />
            ))}
          </button>
        )}
      </nav>

      {/* Mobile menu drawer */}
      {mob && open && (
        <div style={{
          position: "fixed", top: NAV_H_MOB, left: 0, right: 0, zIndex: 199,
          background: "rgba(22,38,30,0.98)", backdropFilter: "blur(18px)",
          padding: "8px 0 24px", borderBottom: `1px solid rgba(196,168,130,0.2)`,
        }}>
          {/* Trust pills on mobile — inside drawer */}
          <div style={{ display: "flex", gap: 8, padding: "12px 20px 14px", overflowX: "auto", scrollbarWidth: "none", borderBottom: "1px solid rgba(196,168,130,0.12)" }}>
            {[["🚫","Zero Broker Fee"],["✓","Verified Yields"],["⚖️","Legal Clarity"],["🚗","Free Visit"]].map(([icon,label]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(196,168,130,0.1)", borderRadius: 20, padding: "5px 11px", flexShrink: 0 }}>
                <span style={{ fontSize: 11 }}>{icon}</span>
                <span style={{ color: C.tan, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>{label}</span>
              </div>
            ))}
          </div>
          {["Properties", "Market Intelligence", "Calculator", "NRI", "About"].map(l => (
            <button key={l} onClick={() => nav(l === "Market Intelligence" ? "market" : l === "About" ? "about" : l.toLowerCase())} style={{
              display: "block", width: "100%", background: "none", border: "none",
              borderBottom: "1px solid rgba(196,168,130,0.08)",
              cursor: "pointer", color: page===l.toLowerCase() ? C.tan : "rgba(255,255,255,0.8)",
              fontFamily: "Georgia,serif", fontSize: 16, textAlign: "left", padding: "15px 22px",
              letterSpacing: 0.5,
            }}>{l}</button>
          ))}
          <div style={{ padding: "14px 20px 0" }}>
            <button onClick={() => { onEnquire(null); setOpen(false); }} style={{
              display: "block", width: "100%",
              background: `linear-gradient(135deg,${C.tan},${C.gold})`,
              border: "none", borderRadius: 10, cursor: "pointer",
              color: C.charcoal, padding: "14px",
              fontFamily: "Georgia,serif", fontSize: 15, fontWeight: 700,
            }}>Book Free Consultation</button>
          </div>
        </div>
      )}
    </>
  );
}

// ══════════════════════════════════════════════════════
// HERO
// ══════════════════════════════════════════════════════
function Hero({ go, setSQ, onEnquire, onMatchmaker }) {
  const w = useW(); const mob = w < 768; const tab = w < 1024;
  const [q, setQ] = useState("");
  const [listening, setListening] = useState(false);
  const [typed, setTyped] = useState("");
  const [si, setSi] = useState(0); const [ci, setCi] = useState(0); const [del, setDel] = useState(false);
  const sugg = ["3BHK farmhouse in Simrol under ₹1.5Cr", "High yield property near Indore", "Luxury penthouse Palasia with city view", "River view retreat Omkareshwar"];
  useEffect(() => {
    const t = setTimeout(() => {
      const s = sugg[si];
      if (!del) { if (ci < s.length) { setTyped(s.slice(0, ci + 1)); setCi(c => c + 1); } else setTimeout(() => setDel(true), 1600); }
      else { if (ci > 0) { setTyped(s.slice(0, ci - 1)); setCi(c => c - 1); } else { setDel(false); setSi(i => (i + 1) % sugg.length); } }
    }, del ? 28 : 60);
    return () => clearTimeout(t);
  }, [ci, del, si]);
  const search = () => { const v = q || typed; setSQ(v); go("properties"); };
  const voice = () => { setListening(true); setTimeout(() => { setListening(false); setQ("3BHK farmhouse in Simrol under ₹1.5Cr"); }, 1800); };

  return (
    <section style={{ minHeight: "100vh", background: `linear-gradient(160deg,${C.forestDark} 0%,${C.forest} 50%,#1E3830 100%)`, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: mob ? "72px 16px 52px" : "116px 24px 72px", position: "relative", overflow: "hidden" }}>
      {!mob && [500, 340, 200].map((s, i) => <div key={i} style={{ position: "absolute", width: s, height: s, borderRadius: "50%", border: `1px solid rgba(196,168,130,${0.05 + i * 0.02})`, top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }} />)}

      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: mob ? 16 : 22, background: "rgba(196,168,130,0.1)", border: "1px solid rgba(196,168,130,0.25)", borderRadius: 40, padding: mob ? "6px 14px" : "7px 18px" }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.tan }} />
        <span style={{ color: C.tanLight, fontSize: mob ? 10 : 11, letterSpacing: 2, textTransform: "uppercase", fontFamily: "Georgia,serif" }}>{mob ? "AI-Powered · Zero Broker Fee" : "India's First AI-Powered Second Home Marketplace · Zero Broker Fee · Indore"}</span>
      </div>

      <h1 style={{ fontFamily: "Georgia,serif", fontSize: mob ? 32 : tab ? 50 : 72, fontWeight: 700, lineHeight: 1.08, color: C.white, textAlign: "center", maxWidth: mob ? "100%" : 820, marginBottom: mob ? 12 : 18, letterSpacing: mob ? -0.5 : -1 }}>
        Your Second Home,<br />
        <span style={{ background: `linear-gradient(135deg,${C.tan},${C.gold})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Zero Broker Fee</span>
      </h1>

      <p style={{ color: "rgba(245,240,232,0.58)", fontSize: mob ? 13 : 16, lineHeight: 1.7, textAlign: "center", maxWidth: 480, marginBottom: mob ? 28 : 40, fontFamily: "Georgia,serif" }}>
        AI-powered search · Verified rental yields · Legal clarity on every property · Free site visits across Indore
      </p>

      {/* AI Matchmaker CTA */}
      <button onClick={onMatchmaker} style={{ marginBottom: 18, background: `linear-gradient(135deg,${C.tan},${C.gold})`, border: "none", borderRadius: 50, cursor: "pointer", color: C.charcoal, padding: mob ? "12px 24px" : "14px 32px", fontFamily: "Georgia,serif", fontWeight: 700, fontSize: mob ? 14 : 15, display: "flex", alignItems: "center", gap: 8, boxShadow: `0 8px 32px ${C.gold}40` }}>
        <span style={{ fontSize: 18 }}>🤖</span>
        Take the 60-Second AI Matchmaker Quiz
        <span style={{ background: "rgba(0,0,0,0.12)", borderRadius: 20, padding: "2px 8px", fontSize: 11 }}>FREE</span>
      </button>

      {/* Search */}
      <div style={{ width: "100%", maxWidth: 660, background: "rgba(255,255,255,0.08)", backdropFilter: "blur(20px)", border: "1px solid rgba(196,168,130,0.3)", borderRadius: 12, padding: mob ? "10px" : "6px 6px 6px 18px", display: "flex", flexDirection: mob ? "column" : "row", alignItems: mob ? "stretch" : "center", gap: mob ? 8 : 10, boxShadow: "0 20px 50px rgba(0,0,0,0.25)", marginBottom: 14 }}>
        {!mob && <span style={{ fontSize: 15 }}>🔍</span>}
        <input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === "Enter" && search()} placeholder={typed || "Ask anything — in Hindi or English…"} style={{ flex: 1, background: mob ? "rgba(255,255,255,0.06)" : "none", border: mob ? "1px solid rgba(196,168,130,0.2)" : "none", borderRadius: mob ? 8 : 0, padding: mob ? "10px 13px" : 0, outline: "none", color: C.white, fontSize: 14, fontFamily: "Georgia,serif", caretColor: C.tan }} />
        <div style={{ display: "flex", gap: 7 }}>
          <button onClick={voice} style={{ flex: mob ? 1 : "none", background: listening ? "rgba(196,168,130,0.3)" : "rgba(196,168,130,0.12)", border: "1px solid rgba(196,168,130,0.3)", borderRadius: 8, cursor: "pointer", padding: mob ? "10px" : "9px 13px", color: C.tanLight, fontSize: 15 }}>{listening ? "🎙️" : "🎤"}</button>
          <button onClick={search} style={{ flex: mob ? 2 : "none", background: `linear-gradient(135deg,${C.tan},${C.gold})`, border: "none", borderRadius: 8, cursor: "pointer", color: C.charcoal, padding: mob ? "10px 14px" : "11px 24px", fontFamily: "Georgia,serif", fontWeight: 700, fontSize: 13 }}>Search</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", justifyContent: "center", marginBottom: mob ? 32 : 44 }}>
        {["🏡 Mhow", "🌾 Simrol", "💰 High Yield", "🌅 Omkareshwar", "🏙️ Palasia"].map(t => (
          <button key={t} onClick={() => { setSQ(t); go("properties"); }} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(196,168,130,0.2)", borderRadius: 24, padding: mob ? "5px 12px" : "6px 15px", cursor: "pointer", color: "rgba(245,240,232,0.7)", fontSize: mob ? 11 : 12, fontFamily: "Georgia,serif" }}>{t}</button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: mob ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: 1, width: "100%", maxWidth: 700, background: "rgba(196,168,130,0.15)", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(196,168,130,0.2)" }}>
        {[{ v: "₹0", l: "Broker Fee" }, { v: "14.1%", l: "Peak Yield" }, { v: "9+", l: "Live Projects" }, { v: "Free", l: "Site Visit" }].map((s, i) => (
          <div key={i} style={{ padding: mob ? "14px 8px" : "18px 16px", textAlign: "center", borderRight: !mob && i < 3 ? "1px solid rgba(196,168,130,0.2)" : "none", borderBottom: mob && i < 2 ? "1px solid rgba(196,168,130,0.2)" : "none", background: "rgba(28,42,35,0.5)" }}>
            <div style={{ color: s.l === "Broker Fee" ? "#FF6B6B" : C.tan, fontSize: mob ? 17 : 21, fontWeight: 700, fontFamily: "Georgia,serif" }}>{s.v}</div>
            <div style={{ color: "rgba(245,240,232,0.45)", fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase", marginTop: 3 }}>{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════
// PROPERTIES PAGE
// ══════════════════════════════════════════════════════
function PropertiesPage({ sq, onOpen, onEnquire, props = PROPS, loading: propsLoading = false }) {
  const w = useW(); const mob = w < 768;
  const [f, setF] = useState("All"); const [ai, setAi] = useState(null); const [loading, setLoading] = useState(false);
  const filters = ["All", "Mhow", "Palasia", "Simrol", "Rau", "High Yield", "Under ₹1Cr"];
  useEffect(() => { if (sq) { setLoading(true); setTimeout(() => { setAi(aiSearch(sq)); setLoading(false); }, 1100); } }, [sq]);
  const list = ai ? ai.ids.map(i => props[i]).filter(Boolean) : f === "All" ? props : props.filter(p =>
    p.location.includes(f) ||
    (f === "High Yield" && parseFloat(p.yield) > 13.5) ||
    (f === "Under ₹1Cr" && p.priceNum < 100)
  );
  return (
    <section style={{ minHeight: "100vh", background: C.creamDark, paddingTop: mob ? 62 : 106, paddingBottom: 80 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: mob ? "0 14px" : "0 32px" }}>
        <div style={{ marginBottom: mob ? 20 : 30 }}>
          <p style={{ color: C.forest, fontSize: 10, letterSpacing: 3, textTransform: "uppercase", marginBottom: 5, fontWeight: 700 }}>MARKETPLACE · INDORE</p>
          <h2 style={{ fontFamily: "Georgia,serif", fontSize: mob ? 26 : 38, fontWeight: 700, color: C.charcoal }}>Curated Second Homes</h2>
          <p style={{ color: C.gray, fontSize: 13, marginTop: 4 }}>All properties carry Verified Yields, Legal Clarity, and Zero Broker Fee</p>
        </div>
        {loading && <div style={{ background: `${C.forest}10`, border: `1px solid ${C.forest}28`, borderRadius: 10, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}><div style={{ width: 14, height: 14, border: `2px solid ${C.forest}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin .7s linear infinite", flexShrink: 0 }} /><span style={{ color: C.forest, fontFamily: "Georgia,serif", fontSize: 13 }}>AI analysing <em>"{sq}"</em>…</span><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>}
        {ai && !loading && <div style={{ background: C.forest, borderRadius: 10, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}><span>🤖</span><span style={{ color: "#fff", fontFamily: "Georgia,serif", fontSize: 13, flex: 1 }}>{ai.text}</span><button onClick={() => setAi(null)} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 6, color: "#fff", padding: "4px 10px", cursor: "pointer", fontSize: 12 }}>Clear</button></div>}
        <div style={{ display: "flex", gap: 7, marginBottom: mob ? 20 : 26, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
          {filters.map(item => <button key={item} onClick={() => { setF(item); setAi(null); }} style={{ background: f === item ? C.forest : C.white, border: `1.5px solid ${f === item ? C.forest : "#D0C8B8"}`, borderRadius: 24, padding: "7px 15px", cursor: "pointer", whiteSpace: "nowrap", color: f === item ? "#fff" : C.gray, fontSize: 12, fontFamily: "Georgia,serif", flexShrink: 0 }}>{item}</button>)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : w < 1024 ? "1fr 1fr" : "repeat(3,1fr)", gap: mob ? 14 : 22 }}>
          {list.map(p => <Card key={p.id} p={p} onOpen={onOpen} onEnquire={onEnquire} />)}
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════
// MARKET PAGE (abbreviated for length)
// ══════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════
// MARKET INTELLIGENCE PAGE — Full Data Dashboard
// ══════════════════════════════════════════════════════
const MICRO_MARKETS = [
  {
    name: "Mhow & Surrounds", emoji: "🏔️", color: C.forest,
    priceRange: "₹80L – ₹2.2Cr", pricePerSqft: "₹2,800–3,400",
    yield: "13.8%", appreciation: "+21%", occupancy: "78%",
    distance: "35 km", highway: "NH-3", demand: "High",
    buyers: "Defence families, HNI investors",
    drivers: ["Mhow Cantonment", "Pristine valley views", "NH-3 connectivity", "Clean air & nature"],
    forecast: "+24% next 2 yrs",
    inventory: "Low — only 40 units available",
    bestFor: "Weekend home + rental income",
  },
  {
    name: "Simrol & Tigaria", emoji: "🌾", color: C.gold,
    priceRange: "₹72L – ₹1.6Cr", pricePerSqft: "₹2,200–2,900",
    yield: "14.1%", appreciation: "+26%", occupancy: "82%",
    distance: "28 km", highway: "Simrol Road", demand: "Very High",
    buyers: "Young investors, NRIs, first-time buyers",
    drivers: ["IIM Indore proximity", "Tigaria Dam views", "Fastest growth belt", "Farm land available"],
    forecast: "+28% next 2 yrs",
    inventory: "Very Low — pre-launch phase",
    bestFor: "Pure investment + Airbnb income",
  },
  {
    name: "Omkareshwar Belt", emoji: "🌅", color: "#16A34A",
    priceRange: "₹60L – ₹1.2Cr", pricePerSqft: "₹1,800–2,400",
    yield: "12.5%", appreciation: "+18%", occupancy: "85%",
    distance: "75 km", highway: "Omkareshwar Road", demand: "High",
    buyers: "Spiritual seekers, NRIs, retirees",
    drivers: ["Narmada river views", "Religious tourism", "High Airbnb occupancy", "Peaceful lifestyle"],
    forecast: "+20% next 2 yrs",
    inventory: "Moderate — limited riverside plots",
    bestFor: "High Airbnb occupancy + spiritual living",
  },
  {
    name: "Palasia & Rau", emoji: "🏙️", color: "#8B6914",
    priceRange: "₹72L – ₹2.5Cr", pricePerSqft: "₹3,500–5,200",
    yield: "13.2%", appreciation: "+16%", occupancy: "72%",
    distance: "5–15 km", highway: "Ring Road", demand: "Moderate",
    buyers: "Business professionals, premium buyers",
    drivers: ["City access", "Premium lifestyle", "IIM & corporate proximity", "Established infrastructure"],
    forecast: "+18% next 2 yrs",
    inventory: "Good availability",
    bestFor: "Premium lifestyle + corporate rentals",
  },
];

const PRICE_TREND = [
  { year: "2020", mhow: 1800, simrol: 1400, omk: 1200, pal: 2800 },
  { year: "2021", mhow: 2000, simrol: 1600, omk: 1350, pal: 3100 },
  { year: "2022", mhow: 2300, simrol: 1900, omk: 1550, pal: 3400 },
  { year: "2023", mhow: 2700, simrol: 2300, omk: 1800, pal: 3800 },
  { year: "2024", mhow: 3100, simrol: 2600, omk: 2100, pal: 4300 },
  { year: "2025", mhow: 3400, simrol: 2900, omk: 2400, pal: 5200 },
];

const INFRA_PIPELINE = [
  { project: "Indore–Mhow 6-Lane Expressway", status: "Under Construction", impact: "↑ 30% appreciation expected", timeline: "2025–26", color: C.green },
  { project: "New Indore Ring Road Phase 2", status: "Approved", impact: "↑ Better connectivity to Simrol belt", timeline: "2026", color: C.amber },
  { project: "Simhastha Kumbh Mela 2028", status: "Confirmed", impact: "↑ Tourism & hospitality boom in Ujjain–Indore", timeline: "2028", color: "#7C3AED" },
  { project: "IIM Indore Campus Expansion", status: "Ongoing", impact: "↑ Premium rental demand near Simrol", timeline: "2024–27", color: C.forest },
  { project: "Devi Ahilya Airport Terminal 2", status: "Under Construction", impact: "↑ NRI & business travel access", timeline: "2025", color: C.blue },
  { project: "Smart City Mission — Indore", status: "Active", impact: "↑ Infrastructure upgrades across city", timeline: "Ongoing", color: "#0F2544" },
];

const INVEST_COMPARISON = [
  { asset: "ERTH Second Home", ret: 14.1, color: C.forest, note: "Rental yield + 21% appreciation" },
  { asset: "Urban Apartment", ret: 6.5, color: "#6B7280", note: "Rental yield only" },
  { asset: "Fixed Deposit", ret: 7.1, color: C.amber, note: "SBI FD rate 2024" },
  { asset: "Gold", ret: 9.2, color: C.gold, note: "5yr avg annual return" },
  { asset: "Nifty 50", ret: 11.8, color: "#2563EB", note: "5yr avg, with volatility" },
];

function MiniBarChart({ value, max, color }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ flex: 1, height: 8, background: "#E8E0D0", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg,${color},${color}bb)`, borderRadius: 4, transition: "width 1s" }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 800, color, fontFamily: "Georgia,serif", minWidth: 36 }}>{value}%</span>
    </div>
  );
}

function PriceTrendChart({ mob }) {
  const maxVal = 5500;
  const colors = { mhow: C.forest, simrol: C.gold, omk: "#16A34A", pal: "#8B6914" };
  const labels = { mhow: "Mhow", simrol: "Simrol", omk: "Omkareshwar", pal: "Palasia" };
  const h = mob ? 140 : 180;
  return (
    <div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 14 }}>
        {Object.entries(colors).map(([k, c]) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
            <span style={{ fontSize: 11, color: C.gray }}>{labels[k]}</span>
          </div>
        ))}
      </div>
      <div style={{ position: "relative", height: h, marginBottom: 8 }}>
        {/* Y-axis grid lines */}
        {[1000,2000,3000,4000,5000].map(v => (
          <div key={v} style={{ position: "absolute", left: 0, right: 0, bottom: `${(v/maxVal)*100}%`, borderTop: "1px dashed #E8E0D0", display: "flex", alignItems: "flex-start" }}>
            <span style={{ fontSize: 9, color: "#CCC", marginTop: -6, background: C.white, paddingRight: 4 }}>₹{v}</span>
          </div>
        ))}
        {/* Data lines */}
        {Object.entries(colors).map(([k, color]) => {
          const pts = PRICE_TREND.map((d, i) => ({
            x: (i / (PRICE_TREND.length - 1)) * 100,
            y: 100 - (d[k] / maxVal) * 100,
          }));
          const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x}% ${p.y * h / 100}px`).join(" ");
          return (
            <svg key={k} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}>
              <polyline
                points={pts.map(p => `${p.x * (mob ? 280 : 580) / 100},${p.y * h / 100}`).join(" ")}
                fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
              />
              {pts.map((p, i) => (
                <circle key={i} cx={`${p.x * (mob ? 280 : 580) / 100}`} cy={`${p.y * h / 100}`} r="4" fill={color} />
              ))}
            </svg>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {PRICE_TREND.map(d => <span key={d.year} style={{ fontSize: 10, color: C.gray }}>{d.year}</span>)}
      </div>
      <div style={{ fontSize: 10, color: C.gray, marginTop: 6, textAlign: "right" }}>Price per sq ft (₹) · ERTH Research</div>
    </div>
  );
}

function MarketPage({ onEnquire }) {
  const w = useW(); const mob = w < 768;
  const [activeMarket, setActiveMarket] = useState(0);
  const mkt = MICRO_MARKETS[activeMarket];

  return (
    <section style={{ minHeight: "100vh", background: C.cream, paddingTop: mob ? 62 : 106, paddingBottom: 80 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: mob ? "0 14px" : "0 32px" }}>

        {/* Header */}
        <p style={{ color: C.forest, fontSize: 10, letterSpacing: 3, textTransform: "uppercase", marginBottom: 5, fontWeight: 700 }}>INTELLIGENCE · INDORE 2026</p>
        <h2 style={{ fontFamily: "Georgia,serif", fontSize: mob ? 26 : 38, fontWeight: 700, color: C.charcoal, marginBottom: 5 }}>Market Intelligence</h2>
        <p style={{ color: C.gray, fontSize: 13, marginBottom: mob ? 22 : 32, maxWidth: 540 }}>ERTH-verified data — price trends, rental yields, occupancy rates, infrastructure pipeline, and investment comparison. Not broker estimates.</p>

        {/* ── KEY STATS ROW ── */}
        <div style={{ display: "grid", gridTemplateColumns: mob ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: mob ? 8 : 12, marginBottom: mob ? 20 : 28 }}>
          {[
            { v: "₹3.2B", l: "Market Size", s: "India second home market", c: C.forest, hi: true },
            { v: "22%", l: "CAGR Growth", s: "Annual market expansion", c: C.gold },
            { v: "14.1%", l: "Peak Yield", s: "Simrol Farmhouses", c: C.green },
            { v: "26%", l: "Top Appreciation", s: "YoY · Simrol belt 2024", c: "#7C3AED" },
            { v: "₹0", l: "Broker Fee", s: "Save ₹1.5–5L per deal", c: C.red },
            { v: "82%", l: "Occupancy Rate", s: "Simrol Airbnb average", c: C.forest },
            { v: "₹8,000Cr", l: "Infra Pipeline", s: "Road, airport, smart city", c: C.amber },
            { v: "2028", l: "Simhastha Catalyst", s: "Kumbh Mela — 10Cr visitors", c: "#0F2544" },
          ].map((d, i) => (
            <div key={i} style={{ background: d.hi ? C.forest : C.white, borderRadius: 12, padding: mob ? "14px 12px" : "18px 16px", border: `1px solid ${d.hi ? "transparent" : "#E0D8CC"}` }}>
              <div style={{ fontSize: mob ? 20 : 26, fontWeight: 800, fontFamily: "Georgia,serif", color: d.hi ? C.tan : d.c, marginBottom: 3 }}>{d.v}</div>
              <div style={{ fontSize: mob ? 11 : 12, fontWeight: 700, color: d.hi ? "#fff" : C.charcoal, marginBottom: 2 }}>{d.l}</div>
              <div style={{ fontSize: 10, color: d.hi ? "rgba(255,255,255,0.45)" : C.gray, lineHeight: 1.4 }}>{d.s}</div>
            </div>
          ))}
        </div>

        {/* ── PRICE TREND CHART ── */}
        <div style={{ background: C.white, borderRadius: 14, padding: mob ? "18px 14px" : "24px 26px", border: "1px solid #E0D8CC", marginBottom: mob ? 16 : 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18, flexWrap: "wrap", gap: 8 }}>
            <div>
              <h3 style={{ fontFamily: "Georgia,serif", fontSize: mob ? 16 : 20, fontWeight: 700, color: C.charcoal, marginBottom: 3 }}>Price Per Sq Ft — 5 Year Trend</h3>
              <p style={{ fontSize: 12, color: C.gray }}>All Indore micro-markets · 2020–2025</p>
            </div>
            <div style={{ background: `${C.green}12`, border: `1px solid ${C.green}30`, borderRadius: 8, padding: "6px 12px", fontSize: 12, color: C.green, fontWeight: 700 }}>↑ Simrol +107% in 5 years</div>
          </div>
          <PriceTrendChart mob={mob} />
        </div>

        {/* ── MICRO MARKET DEEP DIVE ── */}
        <div style={{ background: C.white, borderRadius: 14, border: "1px solid #E0D8CC", overflow: "hidden", marginBottom: mob ? 16 : 20 }}>
          <div style={{ padding: mob ? "16px 14px 0" : "20px 24px 0" }}>
            <h3 style={{ fontFamily: "Georgia,serif", fontSize: mob ? 16 : 20, fontWeight: 700, color: C.charcoal, marginBottom: 14 }}>Micro-Market Deep Dive</h3>
            <div style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 14, borderBottom: "1px solid #F0EAE0" }}>
              {MICRO_MARKETS.map((m, i) => (
                <button key={i} onClick={() => setActiveMarket(i)} style={{ display: "flex", alignItems: "center", gap: 6, padding: mob ? "7px 12px" : "8px 16px", background: activeMarket === i ? m.color : C.cream, border: `1.5px solid ${activeMarket === i ? m.color : "#D5CBBB"}`, borderRadius: 24, cursor: "pointer", color: activeMarket === i ? "#fff" : C.gray, fontSize: mob ? 11 : 12, fontFamily: "Georgia,serif", fontWeight: activeMarket === i ? 700 : 400, flexShrink: 0, whiteSpace: "nowrap" }}>
                  {m.emoji} {m.name.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>
          <div style={{ padding: mob ? "16px 14px" : "20px 24px" }}>
            <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: 16 }}>
              {/* Left col — key numbers */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <span style={{ fontSize: 28 }}>{mkt.emoji}</span>
                  <div>
                    <div style={{ fontFamily: "Georgia,serif", fontSize: mob ? 16 : 18, fontWeight: 700, color: C.charcoal }}>{mkt.name}</div>
                    <div style={{ fontSize: 11, color: C.gray }}>{mkt.distance} from Indore · via {mkt.highway}</div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8, marginBottom: 14 }}>
                  {[
                    { l: "Price Range", v: mkt.priceRange, c: C.charcoal },
                    { l: "Price/sq ft", v: mkt.pricePerSqft, c: C.charcoal },
                    { l: "Rental Yield", v: mkt.yield, c: C.gold },
                    { l: "Appreciation", v: mkt.appreciation, c: C.green },
                    { l: "Avg Occupancy", v: mkt.occupancy, c: C.forest },
                    { l: "Demand Level", v: mkt.demand, c: mkt.demand === "Very High" ? C.red : C.amber },
                  ].map((s, i) => (
                    <div key={i} style={{ background: C.cream, borderRadius: 9, padding: "10px 12px" }}>
                      <div style={{ fontSize: 10, color: C.gray, marginBottom: 3, textTransform: "uppercase", letterSpacing: .5, fontWeight: 600 }}>{s.l}</div>
                      <div style={{ fontSize: mob ? 13 : 14, fontWeight: 800, color: s.c, fontFamily: "Georgia,serif" }}>{s.v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: `${mkt.color}10`, border: `1px solid ${mkt.color}25`, borderRadius: 10, padding: "10px 13px", marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: mkt.color, marginBottom: 3 }}>📈 2-Year Forecast</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.charcoal }}>{mkt.forecast}</div>
                </div>
                <div style={{ fontSize: 12, color: C.gray, lineHeight: 1.6 }}>
                  <strong style={{ color: C.charcoal }}>Inventory:</strong> {mkt.inventory}
                </div>
              </div>
              {/* Right col — drivers */}
              <div>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.gray, textTransform: "uppercase", letterSpacing: .5, marginBottom: 8 }}>Key Growth Drivers</div>
                  {mkt.drivers.map((d, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7, fontSize: 12, color: C.charcoal }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: mkt.color, flexShrink: 0 }} /> {d}
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.gray, textTransform: "uppercase", letterSpacing: .5, marginBottom: 8 }}>Who's Buying</div>
                  <div style={{ fontSize: 12, color: C.charcoal, background: C.cream, borderRadius: 8, padding: "9px 12px" }}>{mkt.buyers}</div>
                </div>
                <div style={{ background: `linear-gradient(135deg,${mkt.color},${mkt.color}bb)`, borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", marginBottom: 3 }}>BEST FOR</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{mkt.bestFor}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── INVESTMENT COMPARISON ── */}
        <div style={{ background: C.white, borderRadius: 14, padding: mob ? "18px 14px" : "24px 26px", border: "1px solid #E0D8CC", marginBottom: mob ? 16 : 20 }}>
          <h3 style={{ fontFamily: "Georgia,serif", fontSize: mob ? 16 : 20, fontWeight: 700, color: C.charcoal, marginBottom: 5 }}>Investment Comparison</h3>
          <p style={{ fontSize: 12, color: C.gray, marginBottom: 18 }}>Annual returns — ERTH second home vs other asset classes</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {INVEST_COMPARISON.map((item, i) => (
              <div key={i} style={{ background: i === 0 ? `${C.forest}06` : "transparent", border: `1px solid ${i === 0 ? C.forest + "25" : "#F0EAE0"}`, borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: i === 0 ? 700 : 600, color: C.charcoal }}>{item.asset}</span>
                    {i === 0 && <span style={{ marginLeft: 8, background: C.forest, color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 10 }}>ERTH</span>}
                    <div style={{ fontSize: 10, color: C.gray, marginTop: 2 }}>{item.note}</div>
                  </div>
                </div>
                <MiniBarChart value={item.ret} max={16} color={item.color} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, background: `${C.forest}08`, border: `1px solid ${C.forest}18`, borderRadius: 8, padding: "10px 13px", fontSize: 12, color: C.forest }}>
            💡 ERTH second home delivers <strong>14.1% rental yield + 21% appreciation</strong> — combined returns significantly higher than any single asset class.
          </div>
        </div>

        {/* ── INFRA PIPELINE ── */}
        <div style={{ background: C.white, borderRadius: 14, padding: mob ? "18px 14px" : "24px 26px", border: "1px solid #E0D8CC", marginBottom: mob ? 16 : 20 }}>
          <h3 style={{ fontFamily: "Georgia,serif", fontSize: mob ? 16 : 20, fontWeight: 700, color: C.charcoal, marginBottom: 5 }}>Infrastructure Pipeline</h3>
          <p style={{ fontSize: 12, color: C.gray, marginBottom: 18 }}>Upcoming projects that will drive appreciation across Indore micro-markets</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {INFRA_PIPELINE.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 13, alignItems: "flex-start", padding: "12px 14px", background: C.cream, borderRadius: 10, borderLeft: `3px solid ${item.color}` }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.charcoal, marginBottom: 3 }}>{item.project}</div>
                  <div style={{ fontSize: 12, color: C.forest, fontWeight: 600, marginBottom: 2 }}>{item.impact}</div>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 10, color: C.gray }}>📅 {item.timeline}</span>
                    <span style={{ fontSize: 10, background: item.color + "20", color: item.color, padding: "1px 7px", borderRadius: 8, fontWeight: 700 }}>{item.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── BUYER PROFILE ── */}
        <div style={{ background: C.white, borderRadius: 14, padding: mob ? "18px 14px" : "24px 26px", border: "1px solid #E0D8CC", marginBottom: mob ? 16 : 20 }}>
          <h3 style={{ fontFamily: "Georgia,serif", fontSize: mob ? 16 : 20, fontWeight: 700, color: C.charcoal, marginBottom: 18 }}>Who's Buying in Indore</h3>
          <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr 1fr" : "repeat(4,1fr)", gap: 10 }}>
            {[
              { icon: "💼", type: "Urban Professionals", pct: "38%", detail: "Mumbai, Delhi, Pune — seeking weekend escape" },
              { icon: "✈️", type: "NRI Investors", pct: "27%", detail: "UAE, USA, UK — ₹13.1B annual RE investment" },
              { icon: "💰", type: "HNI Investors", pct: "22%", detail: "Indore-based — portfolio diversification" },
              { icon: "🏠", type: "Retirees", pct: "13%", detail: "Seeking peaceful, managed lifestyle" },
            ].map((b, i) => (
              <div key={i} style={{ background: C.cream, borderRadius: 11, padding: "14px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 26, marginBottom: 6 }}>{b.icon}</div>
                <div style={{ fontSize: mob ? 18 : 22, fontWeight: 800, color: C.forest, fontFamily: "Georgia,serif", marginBottom: 4 }}>{b.pct}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.charcoal, marginBottom: 4 }}>{b.type}</div>
                <div style={{ fontSize: 10, color: C.gray, lineHeight: 1.5 }}>{b.detail}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ── */}
        <div style={{ background: `linear-gradient(135deg,${C.forest},${C.forestDark})`, borderRadius: 14, padding: mob ? "22px 16px" : "28px 32px", textAlign: "center" }}>
          <div style={{ fontSize: 11, color: C.tan, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700, marginBottom: 10 }}>READY TO INVEST</div>
          <h3 style={{ fontFamily: "Georgia,serif", fontSize: mob ? 20 : 26, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Get a Personalised Market Report</h3>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 20 }}>Based on your budget, timeline, and goals — our advisor will share a tailored investment analysis for free.</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => onEnquire && onEnquire(null)} style={{ background: `linear-gradient(135deg,${C.tan},${C.gold})`, border: "none", borderRadius: 8, cursor: "pointer", color: C.charcoal, padding: mob ? "12px 22px" : "13px 28px", fontFamily: "Georgia,serif", fontWeight: 700, fontSize: 14 }}>📋 Get Free Market Report</button>
            <a href={`https://wa.me/919004343267?text=${encodeURIComponent("Hi ERTH! I'd like a market intelligence report for Indore second homes.")}`} target="_blank" rel="noreferrer" style={{ background: "#25D366", border: "none", borderRadius: 8, cursor: "pointer", color: "#fff", padding: mob ? "12px 22px" : "13px 28px", fontFamily: "Georgia,serif", fontWeight: 700, fontSize: 14, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>💬 WhatsApp Us</a>
          </div>
        </div>

      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════
// CALCULATOR PAGE
// ══════════════════════════════════════════════════════
function CalculatorPage({ onEnquire }) {
  const w = useW(); const mob = w < 768;
  const [inv, setInv] = useState(150); const [yld, setYld] = useState(13.5); const [yrs, setYrs] = useState(5); const [app, setApp] = useState(10);
  const annual = inv * 100000 * yld / 100;
  const appr = inv * 100000 * (Math.pow(1 + app / 100, yrs) - 1);
  const total = annual * yrs + appr;
  const roi = ((total / (inv * 100000)) * 100).toFixed(1);
  const closestProp = PROPS.reduce((a, b) => Math.abs(b.priceNum - inv) < Math.abs(a.priceNum - inv) ? b : a);
  const Sl = ({ label, value, min, max, step, unit, set }) => (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <label style={{ fontSize: 12, color: C.gray }}>{label}</label>
        <span style={{ fontSize: 15, fontWeight: 700, color: C.forest, fontFamily: "Georgia,serif" }}>{unit === "₹" ? fmt(value * 100000) : `${value}${unit}`}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => set(Number(e.target.value))} style={{ width: "100%", accentColor: C.forest, cursor: "pointer" }} />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#BBB", marginTop: 2 }}><span>{unit === "₹" ? fmt(min * 100000) : `${min}${unit}`}</span><span>{unit === "₹" ? fmt(max * 100000) : `${max}${unit}`}</span></div>
    </div>
  );
  return (
    <section style={{ minHeight: "100vh", background: C.cream, paddingTop: mob ? 62 : 106, paddingBottom: 80 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: mob ? "0 14px" : "0 32px" }}>
        <p style={{ color: C.forest, fontSize: 10, letterSpacing: 3, textTransform: "uppercase", marginBottom: 5, fontWeight: 700 }}>ROI TOOLS</p>
        <h2 style={{ fontFamily: "Georgia,serif", fontSize: mob ? 26 : 38, fontWeight: 700, color: C.charcoal, marginBottom: 5 }}>Investment Calculator</h2>
        <p style={{ color: C.gray, fontSize: 13, marginBottom: mob ? 22 : 36 }}>ERTH-verified yield data — not broker projections.</p>
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: mob ? 16 : 24 }}>
          <div style={{ background: C.white, borderRadius: 14, padding: mob ? "20px 16px" : "28px", border: "1px solid #E0D8CC" }}>
            <h3 style={{ fontFamily: "Georgia,serif", fontSize: 16, fontWeight: 700, color: C.charcoal, marginBottom: 20 }}>Parameters</h3>
            <Sl label="Property Value" value={inv} min={70} max={250} step={5} unit="₹" set={setInv} />
            <Sl label="Rental Yield (ERTH Verified)" value={yld} min={10} max={16} step={0.5} unit="%" set={setYld} />
            <Sl label="Investment Horizon" value={yrs} min={1} max={15} step={1} unit=" yrs" set={setYrs} />
            <Sl label="Annual Appreciation" value={app} min={5} max={20} step={0.5} unit="%" set={setApp} />
            <div style={{ background: `${C.forest}08`, borderRadius: 10, padding: "12px 14px", border: `1px solid ${C.forest}16` }}>
              <div style={{ fontSize: 11, color: C.forest, fontWeight: 700, marginBottom: 4 }}>🤖 AI Match for Your Budget</div>
              <div style={{ fontSize: 13, color: C.charcoal, fontWeight: 600, marginBottom: 2 }}>{closestProp.title}</div>
              <div style={{ fontSize: 11, color: C.gray }}>{closestProp.price} · {closestProp.yield}% verified yield · {closestProp.status}</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: mob ? 10 : 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: mob ? 8 : 11 }}>
              {[{ l: "Annual Rental", v: fmt(annual) }, { l: `Total Rental (${yrs}Y)`, v: fmt(annual * yrs) }, { l: "Appreciation", v: fmt(appr) }, { l: "Total ROI", v: `${roi}%`, hi: true }].map((r, i) => (
                <div key={i} style={{ background: r.hi ? C.forest : C.white, borderRadius: 10, padding: mob ? "14px 11px" : "16px 14px", border: `1px solid ${r.hi ? "transparent" : "#E0D8CC"}`, textAlign: "center" }}>
                  <div style={{ fontSize: 9, letterSpacing: 1, textTransform: "uppercase", color: r.hi ? "rgba(255,255,255,0.5)" : C.gray, marginBottom: 5 }}>{r.l}</div>
                  <div style={{ fontSize: mob ? 16 : 19, fontWeight: 800, fontFamily: "Georgia,serif", color: r.hi ? C.tan : C.forest }}>{r.v}</div>
                </div>
              ))}
            </div>
            <div style={{ background: `linear-gradient(135deg,${C.forest},${C.forestDark})`, borderRadius: 14, padding: mob ? "20px 16px" : "24px 22px" }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 5 }}>Total Returns in {yrs} Years</div>
              <div style={{ fontSize: mob ? 30 : 38, fontWeight: 800, fontFamily: "Georgia,serif", color: C.tan, marginBottom: 4 }}>{fmt(total)}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>on {fmt(inv * 100000)} invested</div>
              <div style={{ display: "flex", gap: 20 }}>
                <div><div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>MULTIPLIER</div><div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{((total / (inv * 100000)) + 1).toFixed(2)}x</div></div>
                <div><div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>MONTHLY RENTAL</div><div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{fmt(annual / 12)}</div></div>
              </div>
            </div>
            <button onClick={() => onEnquire(closestProp)} style={{ width: "100%", background: `linear-gradient(135deg,${C.tan},${C.gold})`, border: "none", borderRadius: 10, cursor: "pointer", color: C.charcoal, padding: 13, fontFamily: "Georgia,serif", fontWeight: 700, fontSize: 14 }}>
              📋 Enquire — Zero Broker Fee
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════
// AI CHAT + WHATSAPP FLOATING BUTTONS
// ══════════════════════════════════════════════════════
function FloatingButtons({ onEnquire }) {
  const w = useW(); const mob = w < 768;
  const [chatOpen, setChatOpen] = useState(false);
  const [msgs, setMsgs] = useState([{ role: "assistant", text: "Hi! I'm ERTH's AI advisor 👋\n\nI help investors find the best second homes in Indore — with verified yields and zero broker commission.\n\nWhat's your budget or preferred location?" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pulse, setPulse] = useState(true);
  const endRef = useRef(null);
  useEffect(() => { if (chatOpen) endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, chatOpen]);
  useEffect(() => { const t = setTimeout(() => setPulse(false), 5000); return () => clearTimeout(t); }, []);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim(); setInput("");
    setMsgs(m => [...m, { role: "user", text: userMsg }]);
    setLoading(true);
    try {
      const history = msgs.map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.text }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          system: `You are ERTH's AI property advisor — helping investors find second homes in Indore with the best ROI.

ERTH's key differentiators:
- ZERO broker commission (saves buyers ₹1.5L–5L per deal)
- ERTH-verified rental yields (not broker projections)
- Legal clarity on every property (RERA, title, encumbrance)
- Free site visits arranged by our team

Current Indore portfolio:
1. Mhow Valley Estate — 4BHK Villa, ₹1.8Cr, 13.8% verified yield, Ready, save ₹3.6L broker fee
2. Omkareshwar Retreat — 3BHK, ₹95L, 12.5% yield, River View, Ready, save ₹1.9L
3. Palasia Heights — 4BHK Penthouse, ₹2.4Cr, 13.2% yield, City View, Ready, save ₹4.8L
4. Simrol Farmhouse — 3BHK, ₹1.2Cr, 14.1% yield (highest), 1 acre land, Ready, save ₹2.4L
5. Tigaria Dam Villa — 3BHK, ₹1.5Cr, 13.5% yield, Dam View, UC Q3 2025, save ₹3L
6. Rau Township Cabin — 2BHK, ₹72L, 12.8% yield, Pre-Launch, save ₹1.44L

Keep replies short (2-4 sentences). Be warm and helpful. Always mention the broker fee saving for any property you recommend. Encourage them to submit an enquiry or book a free site visit.`,
          messages: [...history, { role: "user", content: userMsg }],
        }),
      });
      const data = await res.json();
      setMsgs(m => [...m, { role: "assistant", text: data.content?.[0]?.text || "Sorry, let me connect you with our team directly. Please WhatsApp us!" }]);
    } catch { setMsgs(m => [...m, { role: "assistant", text: "Having trouble connecting. Please WhatsApp us at +91 90043 43267 🙏" }]); }
    setLoading(false);
  };

  return (
    <>
      {/* Chat window */}
      {chatOpen && (
        <div style={{ position: "fixed", bottom: mob ? 0 : 86, right: mob ? 0 : 24, left: mob ? 0 : "auto", zIndex: 400, width: mob ? "100%" : 340, height: mob ? "72vh" : 500, background: C.white, borderRadius: mob ? "20px 20px 0 0" : 16, boxShadow: "0 24px 64px rgba(0,0,0,0.25)", display: "flex", flexDirection: "column", border: "1px solid rgba(44,74,62,0.15)", overflow: "hidden" }}>
          <div style={{ background: `linear-gradient(135deg,${C.forest},${C.forestDark})`, padding: "13px 16px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: `linear-gradient(135deg,${C.tan},${C.gold})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🤖</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>ERTH AI Advisor</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 5, height: 5, borderRadius: "50%", background: "#4ADE80" }} />Online · Zero broker fee deals</div>
            </div>
            <button onClick={() => onEnquire(null)} style={{ background: `${C.tan}33`, border: "none", borderRadius: 6, cursor: "pointer", color: C.tan, fontSize: 10, padding: "5px 9px", fontWeight: 700 }}>Enquire</button>
            <button onClick={() => setChatOpen(false)} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 6, cursor: "pointer", color: "#fff", fontSize: 15, width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "14px 12px", display: "flex", flexDirection: "column", gap: 10, background: C.cream }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ display: "flex", flexDirection: m.role === "user" ? "row-reverse" : "row", gap: 7, alignItems: "flex-end" }}>
                {m.role === "assistant" && <div style={{ width: 26, height: 26, borderRadius: "50%", background: `linear-gradient(135deg,${C.forest},${C.tan})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flexShrink: 0, color: "#fff", fontWeight: 800 }}>E</div>}
                <div style={{ maxWidth: "80%", background: m.role === "user" ? C.forest : C.white, color: m.role === "user" ? "#fff" : C.charcoal, padding: "9px 12px", borderRadius: m.role === "user" ? "12px 12px 3px 12px" : "12px 12px 12px 3px", fontSize: 12, lineHeight: 1.65, fontFamily: "Georgia,serif", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", whiteSpace: "pre-wrap" }}>{m.text}</div>
              </div>
            ))}
            {loading && <div style={{ display: "flex", gap: 7, alignItems: "flex-end" }}><div style={{ width: 26, height: 26, borderRadius: "50%", background: `linear-gradient(135deg,${C.forest},${C.tan})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flexShrink: 0, color: "#fff", fontWeight: 800 }}>E</div><div style={{ background: C.white, padding: "10px 14px", borderRadius: "12px 12px 12px 3px", display: "flex", gap: 3 }}>{[0, 1, 2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: C.forest, animation: `bounce .9s ${i * 0.2}s infinite` }} />)}</div></div>}
            <div ref={endRef} />
          </div>
          {msgs.length <= 1 && (
            <div style={{ padding: "7px 12px", borderTop: "1px solid #E0D8CC", display: "flex", gap: 5, overflowX: "auto", background: C.white, scrollbarWidth: "none" }}>
              {["Best ROI property?", "Under ₹1Cr options", "Legal status?"].map(s => <button key={s} onClick={() => setInput(s)} style={{ background: `${C.forest}10`, border: `1px solid ${C.forest}22`, borderRadius: 20, padding: "5px 10px", cursor: "pointer", whiteSpace: "nowrap", color: C.forest, fontSize: 10, fontFamily: "Georgia,serif", flexShrink: 0 }}>{s}</button>)}
            </div>
          )}
          <div style={{ padding: "9px 10px", borderTop: "1px solid #E0D8CC", display: "flex", gap: 7, background: C.white }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask about properties, yields, legal…" style={{ flex: 1, background: C.cream, border: "1.5px solid #DDD", borderRadius: 24, padding: "9px 14px", fontSize: 12, fontFamily: "Georgia,serif", outline: "none", color: C.charcoal }} />
            <button onClick={send} disabled={loading || !input.trim()} style={{ background: input.trim() ? `linear-gradient(135deg,${C.forest},${C.forestLight})` : "#CCC", border: "none", borderRadius: "50%", width: 36, height: 36, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 14 }}>➤</button>
          </div>
        </div>
      )}
      {/* WhatsApp */}
      <a href="https://wa.me/919004343267?text=Hi ERTH! I'm looking for a zero-broker-fee second home in Indore." target="_blank" rel="noreferrer" style={{ position: "fixed", bottom: mob ? 22 : 90, right: 24, zIndex: 398, width: 52, height: 52, borderRadius: "50%", background: "#25D366", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, textDecoration: "none", boxShadow: "0 8px 24px rgba(37,211,102,0.4)", transition: "all 0.3s" }}>💬</a>
      {/* AI Chat FAB */}
      <button onClick={() => setChatOpen(o => !o)} style={{ position: "fixed", bottom: mob ? 82 : 24, right: 24, zIndex: 399, width: 52, height: 52, borderRadius: "50%", background: chatOpen ? C.charcoal : `linear-gradient(135deg,${C.forest},${C.forestLight})`, border: "none", cursor: "pointer", boxShadow: "0 8px 24px rgba(44,74,62,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, transition: "all 0.3s" }}>
        {chatOpen ? "×" : "🤖"}
        {pulse && !chatOpen && <div style={{ position: "absolute", top: -2, right: -2, width: 14, height: 14, borderRadius: "50%", background: "#FF4444", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: "#fff", fontWeight: 700 }}>1</div>}
      </button>
      <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}`}</style>
    </>
  );
}

// ══════════════════════════════════════════════════════
// FEATURES + FOOTER
// ══════════════════════════════════════════════════════
function Features() {
  const w = useW(); const mob = w < 768;
  const feats = [
    { icon: "🚫", title: "Zero Broker Fee", desc: "Save ₹1.5–5L on every deal. No middlemen, no hidden charges.", c: C.red },
    { icon: "✓", title: "Verified Yields", desc: "ERTH-verified rental data — not broker projections. Cross-checked against real Airbnb & rental comps.", c: C.gold },
    { icon: "⚖️", title: "Legal Clarity", desc: "RERA number, title status, encumbrance report, and land type on every listing.", c: C.blue },
    { icon: "🤖", title: "AI Matchmaker", desc: "60-second quiz. AI matches you to your top 3 properties based on budget, lifestyle, and ROI goals.", c: C.forest },
    { icon: "🚗", title: "Free Site Visit", desc: "Our advisor drives you to any shortlisted property — no commitment needed.", c: C.green },
    { icon: "🏦", title: "EMI vs Rent Tool", desc: "See your real monthly cost after rental income offsets your EMI. One number, full clarity.", c: "#7C3AED" },
  ];
  return (
    <section style={{ background: C.charcoal, padding: mob ? "52px 14px" : "80px 32px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: mob ? 32 : 50 }}>
          <p style={{ color: C.tan, fontSize: 10, letterSpacing: 3, textTransform: "uppercase", marginBottom: 10, fontWeight: 700 }}>WHY ERTH</p>
          <h2 style={{ fontFamily: "Georgia,serif", fontSize: mob ? 26 : 40, fontWeight: 700, color: C.white, marginBottom: 8 }}>Everything a Broker Hides. We Show It All.</h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: mob ? 13 : 15, maxWidth: 400, margin: "0 auto" }}>Transparency, AI, and zero commission — that's the ERTH difference.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr 1fr" : "repeat(3,1fr)", gap: mob ? 10 : 18 }}>
          {feats.map((f, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: mob ? "16px 13px" : "24px 20px", borderTop: `3px solid ${f.c}` }}>
              <div style={{ fontSize: mob ? 22 : 26, marginBottom: 10 }}>{f.icon}</div>
              <h3 style={{ fontFamily: "Georgia,serif", fontSize: mob ? 13 : 15, fontWeight: 700, color: C.white, marginBottom: 6 }}>{f.title}</h3>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: mob ? 11 : 12, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer({ go }) {
  const w = useW(); const mob = w < 768;
  return (
    <footer style={{ background: C.forestDark, padding: mob ? "36px 16px 22px" : "52px 48px 22px", borderTop: "1px solid rgba(196,168,130,0.15)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr 1fr" : "2fr 1fr 1fr 1fr", gap: mob ? 22 : 36, marginBottom: mob ? 28 : 44 }}>
          <div style={{ gridColumn: mob ? "1/-1" : "auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: `linear-gradient(135deg,${C.forest},${C.tan})`, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#fff", fontWeight: 800, fontSize: 10 }}>E</span></div>
              <span onClick={() => { const c = parseInt(sessionStorage.getItem("ec")||0)+1; sessionStorage.setItem("ec",c); if(c>=5){sessionStorage.removeItem("ec"); setShowAdmin(true);} }} style={{ color: "#fff", fontFamily: "Georgia,serif", fontSize: 16, fontWeight: 700, letterSpacing: 2, cursor:"default", userSelect:"none" }}>ERTH</span>
            </div>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, lineHeight: 1.7, maxWidth: 220, marginBottom: 10 }}>India's first AI-powered second home marketplace. Zero broker fee. Now live in Indore.</p>
            <div style={{ color: C.tan, fontSize: 11 }}>founders@erthreality.com</div>
          </div>
          {[{ h: "Platform", i: ["Properties", "Market Intel", "Calculator", "NRI Corner"] }, { h: "Locations", i: ["Mhow", "Simrol", "Omkareshwar", "Rau & Palasia"] }, { h: "Company", i: ["About Us", "Zero Broker Promise", "Investors", "Press"] }].map(col => (
            <div key={col.h}>
              <h4 style={{ color: C.tan, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12, fontWeight: 600 }}>{col.h}</h4>
              {col.i.map(item => <div key={item} onClick={() => item==="NRI Corner" ? go("nri") : null} style={{ color: item==="NRI Corner"?C.tan:"rgba(255,255,255,0.35)", fontSize: 11, marginBottom: 7, cursor: "pointer" }}>{item}</div>)}
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid rgba(196,168,130,0.1)", paddingTop: 16, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
          <span style={{ color: "rgba(255,255,255,0.22)", fontSize: 11 }}>© 2025 ERTH Reality · erthreality.com · Zero Broker Fee</span>
          <span style={{ color: "rgba(255,255,255,0.22)", fontSize: 11 }}>www.erthreality.com</span>
        </div>
      </div>
    </footer>
  );
}


// ══════════════════════════════════════════════════════
// NRI CORNER PAGE
// ══════════════════════════════════════════════════════
function NRIPage({ onEnquire, go }) {
  const w = useW(); const mob = w < 768;
  const [tab, setTab]       = useState("overview");
  const [fema, setFema]     = useState(0);
  const [taxTab, setTaxTab] = useState(0);
  const [cur, setCur]       = useState("USD");
  const [amt, setAmt]       = useState(200000);
  const [nriForm, setNriForm] = useState({ name:"", email:"", phone:"", country:"UAE", budget:"", msg:"" });
  const [nriSent, setNriSent] = useState(false);
  const setF = (k,v) => setNriForm(f=>({...f,[k]:v}));

  const sel   = NRI_COUNTRIES.find(c=>c.currency===cur)||NRI_COUNTRIES[0];
  const inrAmt = Math.round(amt * sel.rate);
  const fmt2   = n => n>=10000000?`₹${(n/10000000).toFixed(2)} Cr`:n>=100000?`₹${(n/100000).toFixed(1)}L`:`₹${Math.round(n).toLocaleString()}`;

  const TABS = [
    {id:"overview",   label:"Overview",    icon:"🌏"},
    {id:"fema",       label:"FEMA Rules",  icon:"⚖️"},
    {id:"tax",        label:"Tax Guide",   icon:"📊"},
    {id:"banks",      label:"Banking",     icon:"🏦"},
    {id:"process",    label:"How to Buy",  icon:"📋"},
    {id:"faq",        label:"FAQs",        icon:"❓"},
  ];

  return (
    <div style={{ background:C.cream, minHeight:"100vh" }}>

      {/* HERO */}
      <div style={{ background:`linear-gradient(135deg,${NAVY} 0%,${NAVYL} 60%,#0F3460 100%)`, padding:mob?"78px 16px 44px":"106px 32px 56px", textAlign:"center", position:"relative", overflow:"hidden" }}>
        {[380,260,160].map((s,i)=>(
          <div key={i} style={{ position:"absolute", width:s, height:s, borderRadius:"50%", border:`1px solid rgba(196,168,130,${0.05+i*0.03})`, top:"50%", left:"50%", transform:"translate(-50%,-50%)", pointerEvents:"none" }} />
        ))}
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(196,168,130,0.12)", border:"1px solid rgba(196,168,130,0.28)", borderRadius:40, padding:mob?"6px 14px":"7px 18px", marginBottom:16 }}>
          <span style={{ fontSize:14 }}>🌏</span>
          <span style={{ color:C.tan, fontSize:mob?10:11, letterSpacing:2, textTransform:"uppercase", fontWeight:700 }}>ERTH NRI Corner · For Indians Abroad</span>
        </div>
        <h1 style={{ fontFamily:"Georgia,serif", fontSize:mob?28:48, fontWeight:700, color:"#fff", lineHeight:1.1, marginBottom:12, maxWidth:680, margin:"0 auto 12px" }}>
          Your Roots.{" "}
          <span style={{ background:`linear-gradient(135deg,${C.tan},${C.gold})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Your Second Home.</span>
          {" "}Your Returns.
        </h1>
        <p style={{ color:"rgba(255,255,255,0.52)", fontSize:mob?13:15, lineHeight:1.75, maxWidth:520, margin:"0 auto 24px" }}>
          Buy in Indore from the USA, UAE, UK or anywhere. Complete FEMA guidance, NRI banking, tax rules, and full remote purchase support.
        </p>
        <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap", marginBottom:28 }}>
          {NRI_COUNTRIES.map(c=>(
            <div key={c.currency} style={{ display:"flex", alignItems:"center", gap:5, background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:24, padding:mob?"5px 11px":"6px 13px" }}>
              <span style={{ fontSize:mob?15:17 }}>{c.flag}</span>
              <span style={{ color:"rgba(255,255,255,0.72)", fontSize:mob?11:12 }}>{c.name}</span>
            </div>
          ))}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:mob?"repeat(2,1fr)":"repeat(4,1fr)", gap:1, maxWidth:680, margin:"0 auto", background:"rgba(196,168,130,0.15)", borderRadius:12, overflow:"hidden", border:"1px solid rgba(196,168,130,0.2)" }}>
          {[{v:"$13.1B",l:"NRI RE/yr"},{v:"₹0",l:"Broker Fee"},{v:"100%",l:"Remote Buy"},{v:"4 hrs",l:"Response"}].map((s,i)=>(
            <div key={i} style={{ padding:mob?"13px 8px":"17px 14px", textAlign:"center", borderRight:!mob&&i<3?"1px solid rgba(196,168,130,0.2)":"none", borderBottom:mob&&i<2?"1px solid rgba(196,168,130,0.2)":"none", background:"rgba(15,37,68,0.5)" }}>
              <div style={{ color:C.tan, fontSize:mob?16:20, fontWeight:800, fontFamily:"Georgia,serif" }}>{s.v}</div>
              <div style={{ color:"rgba(255,255,255,0.38)", fontSize:9, letterSpacing:1.2, textTransform:"uppercase", marginTop:3 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* STICKY TABS */}
      <div style={{ position:"sticky", top:mob?56:100, zIndex:90, background:C.white, borderBottom:"1px solid #E0D8CC", boxShadow:"0 2px 10px rgba(0,0,0,0.05)" }}>
        <div style={{ display:"flex", overflowX:"auto", scrollbarWidth:"none", maxWidth:1000, margin:"0 auto", padding:"0 14px" }}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{ display:"flex", alignItems:"center", gap:5, padding:mob?"11px 12px":"13px 18px", background:"none", border:"none", borderBottom:tab===t.id?`2.5px solid ${NAVY}`:"2.5px solid transparent", cursor:"pointer", whiteSpace:"nowrap", color:tab===t.id?NAVY:C.gray, fontFamily:"Georgia,serif", fontSize:mob?11:12, fontWeight:tab===t.id?700:400, flexShrink:0, transition:"all 0.2s" }}>
              <span style={{ fontSize:mob?13:14 }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:980, margin:"0 auto", padding:mob?"24px 14px 60px":"36px 32px 72px" }}>

        {/* ── OVERVIEW ── */}
        {tab==="overview" && (
          <div>
            <div style={{ marginBottom:28 }}>
              <p style={{ color:NAVY, fontSize:10, letterSpacing:3, textTransform:"uppercase", fontWeight:700, marginBottom:5 }}>WHY INDORE FOR NRIs</p>
              <h2 style={{ fontFamily:"Georgia,serif", fontSize:mob?24:32, fontWeight:700, color:C.charcoal, marginBottom:6 }}>The Smart NRI Investment</h2>
              <p style={{ color:C.gray, fontSize:13, lineHeight:1.8, maxWidth:580 }}>Indore is India's cleanest city (7× Swachh Survekshan), fastest-growing Tier-2 economy, and home to IIM Indore — making it one of the best second home markets in Central India.</p>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:mob?"1fr":"repeat(3,1fr)", gap:12, marginBottom:28 }}>
              {[
                {icon:"🏆",title:"Cleanest City × 7",sub:"Swachh Survekshan, 7 consecutive years",c:NAVY},
                {icon:"📈",title:"26% YoY Growth",sub:"Simrol belt — fastest appreciation in MP",c:C.forest},
                {icon:"💰",title:"14.1% Yield",sub:"3× better than urban apartments",c:C.gold},
                {icon:"✈️",title:"Direct Flights",sub:"Devi Ahilya Airport — Dubai route proposed",c:"#7C3AED"},
                {icon:"🎓",title:"IIM Indore",sub:"Premium rental demand near campus",c:C.green},
                {icon:"🏗️",title:"₹8,000Cr Infra",sub:"BRTS, ring road, smart city pipeline",c:C.red},
              ].map((item,i)=>(
                <div key={i} style={{ background:C.white, borderRadius:12, padding:mob?"16px 14px":"20px 16px", border:"1px solid #E0D8CC", borderTop:`3px solid ${item.c}` }}>
                  <div style={{ fontSize:24, marginBottom:8 }}>{item.icon}</div>
                  <div style={{ fontFamily:"Georgia,serif", fontSize:14, fontWeight:700, color:C.charcoal, marginBottom:3 }}>{item.title}</div>
                  <div style={{ fontSize:11, color:C.gray, lineHeight:1.5 }}>{item.sub}</div>
                </div>
              ))}
            </div>

            {/* Currency converter */}
            <div style={{ background:C.white, borderRadius:14, border:"1px solid #E0D8CC", overflow:"hidden", marginBottom:28 }}>
              <div style={{ background:`linear-gradient(135deg,${NAVY},${NAVYL})`, padding:mob?"14px 16px":"16px 22px" }}>
                <div style={{ color:C.tan, fontSize:10, letterSpacing:2, textTransform:"uppercase", fontWeight:700, marginBottom:3 }}>BUYING POWER CALCULATOR</div>
                <div style={{ color:"#fff", fontSize:14, fontFamily:"Georgia,serif" }}>How much property can you buy from abroad?</div>
              </div>
              <div style={{ padding:mob?"16px 14px":"20px 22px" }}>
                <div style={{ display:"grid", gridTemplateColumns:mob?"1fr":"1fr 1fr", gap:12, marginBottom:16 }}>
                  <div>
                    <label style={{ fontSize:11, color:C.gray, fontWeight:600, textTransform:"uppercase", letterSpacing:0.5, display:"block", marginBottom:7 }}>Your Currency</label>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                      {NRI_COUNTRIES.map(c=>(
                        <button key={c.currency} onClick={()=>setCur(c.currency)} style={{ background:cur===c.currency?NAVY:C.cream, border:`1.5px solid ${cur===c.currency?NAVY:"#D5CBBB"}`, borderRadius:7, padding:"5px 11px", cursor:"pointer", fontSize:12, color:cur===c.currency?"#fff":C.charcoal, fontFamily:"Georgia,serif", fontWeight:cur===c.currency?700:400 }}>
                          {c.flag} {c.currency}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize:11, color:C.gray, fontWeight:600, textTransform:"uppercase", letterSpacing:0.5, display:"block", marginBottom:7 }}>Amount in {cur}</label>
                    <input type="number" value={amt} onChange={e=>setAmt(Number(e.target.value))} style={{ width:"100%", background:C.cream, border:"1.5px solid #D5CBBB", borderRadius:8, padding:"10px 13px", fontSize:16, fontFamily:"Georgia,serif", fontWeight:700, color:C.charcoal, outline:"none", boxSizing:"border-box" }} />
                    <div style={{ fontSize:11, color:C.gray, marginTop:3 }}>Rate: 1 {cur} = ₹{sel.rate}</div>
                  </div>
                </div>
                <div style={{ background:`linear-gradient(135deg,${NAVY},${NAVYL})`, borderRadius:11, padding:"14px 18px", marginBottom:14, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
                  <div>
                    <div style={{ color:"rgba(255,255,255,0.45)", fontSize:11, marginBottom:2 }}>{cur} {Number(amt).toLocaleString()} converts to</div>
                    <div style={{ color:C.tan, fontSize:mob?26:32, fontWeight:800, fontFamily:"Georgia,serif" }}>{fmt2(inrAmt)}</div>
                  </div>
                  <div style={{ color:"rgba(255,255,255,0.6)", fontSize:12 }}>
                    {inrAmt>=24000000?"All ERTH properties in budget":inrAmt>=18000000?"4+ properties in range":inrAmt>=12000000?"3 properties in range":inrAmt>=9500000?"2 properties in range":"1 property in range"}
                  </div>
                </div>
                {PROPS.slice(0,3).map((p,i)=>{
                  const pInr = p.priceNum * 100000;
                  const pct  = Math.min(100,Math.round((inrAmt/pInr)*100));
                  return (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:11, padding:"9px 12px", background:inrAmt>=pInr?"#F0FDF4":C.cream, border:`1px solid ${inrAmt>=pInr?"#BBF7D0":"#E0D8CC"}`, borderRadius:9, marginBottom:7 }}>
                      <span style={{ fontSize:22, flexShrink:0 }}>{p.img}</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:12, fontWeight:700, color:C.charcoal, marginBottom:3 }}>{p.title}</div>
                        <div style={{ height:4, background:"#E0D8CC", borderRadius:2, overflow:"hidden" }}>
                          <div style={{ height:"100%", width:`${pct}%`, background:inrAmt>=pInr?C.green:NAVY, borderRadius:2, transition:"width 0.5s" }} />
                        </div>
                      </div>
                      <div style={{ textAlign:"right", flexShrink:0 }}>
                        <div style={{ fontSize:12, fontWeight:700, color:C.forest }}>{p.price}</div>
                        <div style={{ fontSize:10, color:inrAmt>=pInr?C.green:C.gray, fontWeight:600 }}>{inrAmt>=pInr?"✓ In budget":"Need more"}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ERTH NRI promise */}
            <div style={{ background:`linear-gradient(135deg,${NAVY},${NAVYL})`, borderRadius:14, padding:mob?"20px 16px":"26px 28px" }}>
              <div style={{ color:C.tan, fontSize:10, letterSpacing:2, textTransform:"uppercase", fontWeight:700, marginBottom:14 }}>ERTH NRI PROMISE</div>
              <div style={{ display:"grid", gridTemplateColumns:mob?"1fr":"repeat(2,1fr)", gap:14 }}>
                {[
                  ["🌐","Advisor in your timezone","US / UK / UAE / Singapore time zones covered."],
                  ["📱","WhatsApp video site tour","Live walk-through before you commit a single rupee."],
                  ["📄","Digital legal report","RERA, title, encumbrance — PDF shared before booking."],
                  ["🏦","NRI banking connections","SBI, HDFC, ICICI — NRE/NRO account + home loan."],
                  ["⚡","PoA-based remote purchase","No India visit needed — full PoA guidance provided."],
                  ["🔄","Rental management","ERTH manages property, credits rent to NRO monthly."],
                ].map(([icon,title,desc],i)=>(
                  <div key={i} style={{ display:"flex", gap:11 }}>
                    <span style={{ fontSize:20, flexShrink:0 }}>{icon}</span>
                    <div>
                      <div style={{ color:"#fff", fontSize:13, fontWeight:700, marginBottom:2 }}>{title}</div>
                      <div style={{ color:"rgba(255,255,255,0.42)", fontSize:12, lineHeight:1.6 }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── FEMA ── */}
        {tab==="fema" && (
          <div>
            <p style={{ color:NAVY, fontSize:10, letterSpacing:3, textTransform:"uppercase", fontWeight:700, marginBottom:5 }}>FEMA 1999</p>
            <h2 style={{ fontFamily:"Georgia,serif", fontSize:mob?24:32, fontWeight:700, color:C.charcoal, marginBottom:8 }}>Legal Rules for NRI Purchase</h2>
            <div style={{ background:"#FFFBEB", border:"1px solid #FDE68A", borderRadius:10, padding:"11px 15px", display:"flex", gap:8, marginBottom:20 }}>
              <span style={{ flexShrink:0 }}>⚠️</span>
              <span style={{ fontSize:12, color:"#92400E", lineHeight:1.6 }}>For informational purposes only. Consult a qualified CA and lawyer before investing.</span>
            </div>
            <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:18 }}>
              {FEMA_RULES.map((r,i)=>(
                <button key={i} onClick={()=>setFema(i)} style={{ background:fema===i?NAVY:C.white, border:`1.5px solid ${fema===i?NAVY:"#D5CBBB"}`, borderRadius:24, padding:"6px 15px", cursor:"pointer", color:fema===i?"#fff":C.gray, fontSize:12, fontFamily:"Georgia,serif", fontWeight:fema===i?700:400 }}>
                  {r.icon} {r.title}
                </button>
              ))}
            </div>
            {(()=>{const r=FEMA_RULES[fema]; return (
              <div style={{ background:r.bg, border:`1.5px solid ${r.color}28`, borderRadius:14, padding:mob?"18px 14px":"24px 26px", marginBottom:22 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
                  <span style={{ fontSize:26 }}>{r.icon}</span>
                  <h3 style={{ fontFamily:"Georgia,serif", fontSize:mob?17:20, fontWeight:700, color:C.charcoal }}>{r.title}</h3>
                </div>
                {r.points.map((p,i)=>(
                  <div key={i} style={{ display:"flex", gap:11, alignItems:"flex-start", padding:"11px 14px", background:"#fff", borderRadius:9, marginBottom:9, boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
                    <div style={{ width:20, height:20, borderRadius:"50%", background:r.color, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:10, color:"#fff", fontWeight:800, marginTop:1 }}>{i+1}</div>
                    <div style={{ fontSize:13, color:C.charcoal, lineHeight:1.7 }}>{p}</div>
                  </div>
                ))}
              </div>
            );})()}
            <div style={{ background:C.white, borderRadius:14, border:"1px solid #E0D8CC", padding:mob?"16px 14px":"22px 22px" }}>
              <h3 style={{ fontFamily:"Georgia,serif", fontSize:16, fontWeight:700, color:C.charcoal, marginBottom:14 }}>📋 Documents Needed</h3>
              <div style={{ display:"grid", gridTemplateColumns:mob?"1fr":"1fr 1fr", gap:8 }}>
                {[["Indian Passport / OCI","Identity proof"],["Overseas Address Proof","Utility bill or bank statement"],["PAN Card","Mandatory if purchase > ₹50L"],["NRE/NRO Account","For fund transfer"],["Power of Attorney","If not visiting India"],["Passport Photos","For registration"],["Source of Funds Proof","Bank statements from abroad"],["Income Proof","For home loan application"]].map(([d,s],i)=>(
                  <div key={i} style={{ display:"flex", gap:9, padding:"9px 11px", background:C.cream, borderRadius:8 }}>
                    <span style={{ color:C.green, fontWeight:800, fontSize:13, flexShrink:0 }}>✓</span>
                    <div>
                      <div style={{ fontSize:12, fontWeight:600, color:C.charcoal }}>{d}</div>
                      <div style={{ fontSize:11, color:C.gray }}>{s}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAX ── */}
        {tab==="tax" && (
          <div>
            <p style={{ color:NAVY, fontSize:10, letterSpacing:3, textTransform:"uppercase", fontWeight:700, marginBottom:5 }}>TAX GUIDE 2024–25</p>
            <h2 style={{ fontFamily:"Georgia,serif", fontSize:mob?24:32, fontWeight:700, color:C.charcoal, marginBottom:6 }}>NRI Property Tax in India</h2>
            <p style={{ color:C.gray, fontSize:13, lineHeight:1.7, marginBottom:18 }}>Taxes apply at 3 stages — purchase, rental income, and sale. Every number you need.</p>
            <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:18 }}>
              {TAX_SECTIONS.map((t,i)=>(
                <button key={i} onClick={()=>setTaxTab(i)} style={{ background:taxTab===i?NAVY:C.white, border:`1.5px solid ${taxTab===i?NAVY:"#D5CBBB"}`, borderRadius:24, padding:"6px 15px", cursor:"pointer", color:taxTab===i?"#fff":C.gray, fontSize:12, fontFamily:"Georgia,serif", fontWeight:taxTab===i?700:400 }}>{t.label}</button>
              ))}
            </div>
            <div style={{ background:C.white, borderRadius:14, border:"1px solid #E0D8CC", overflow:"hidden", marginBottom:22 }}>
              <div style={{ background:`linear-gradient(135deg,${NAVY},${NAVYL})`, padding:"12px 18px" }}>
                <h3 style={{ color:"#fff", fontFamily:"Georgia,serif", fontSize:15, fontWeight:700 }}>{TAX_SECTIONS[taxTab].label} — Tax Breakdown</h3>
              </div>
              <div style={{ padding:mob?"14px 16px":"16px 20px" }}>
                {TAX_SECTIONS[taxTab].items.map((item,i)=>(
                  <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 0", borderBottom:i<TAX_SECTIONS[taxTab].items.length-1?"1px solid #F0EAE0":"none", gap:12 }}>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color:C.charcoal }}>{item.k}</div>
                      {item.n && <div style={{ fontSize:11, color:C.gray }}>{item.n}</div>}
                    </div>
                    <div style={{ fontSize:20, fontWeight:800, fontFamily:"Georgia,serif", color:item.c, flexShrink:0 }}>{item.v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background:"#F0FDF4", border:"1px solid #BBF7D0", borderRadius:12, padding:mob?"16px 14px":"20px 22px" }}>
              <h3 style={{ fontFamily:"Georgia,serif", fontSize:15, fontWeight:700, color:C.charcoal, marginBottom:10 }}>🤝 DTAA — Double Taxation Relief</h3>
              <p style={{ fontSize:13, color:C.gray, lineHeight:1.7, marginBottom:12 }}>India has DTAA agreements with 90+ countries. You may get a credit for Indian taxes in your resident country — avoiding double taxation on rental income.</p>
              <div style={{ display:"grid", gridTemplateColumns:mob?"1fr 1fr":"repeat(3,1fr)", gap:8 }}>
                {[["🇺🇸 USA","Credit method"],["🇦🇪 UAE","Exemption"],["🇬🇧 UK","Credit method"],["🇨🇦 Canada","Exemption"],["🇦🇺 Australia","Credit method"],["🇸🇬 Singapore","Exemption"]].map(([country,method])=>(
                  <div key={country} style={{ background:"#fff", borderRadius:8, padding:"9px 11px" }}>
                    <div style={{ fontSize:12, fontWeight:700, color:C.charcoal, marginBottom:2 }}>{country}</div>
                    <div style={{ fontSize:10, color:C.green, fontWeight:600 }}>DTAA Active · {method}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── BANKING ── */}
        {tab==="banks" && (
          <div>
            <p style={{ color:NAVY, fontSize:10, letterSpacing:3, textTransform:"uppercase", fontWeight:700, marginBottom:5 }}>NRI BANKING</p>
            <h2 style={{ fontFamily:"Georgia,serif", fontSize:mob?24:32, fontWeight:700, color:C.charcoal, marginBottom:6 }}>Best Banks for NRI Purchase</h2>
            <p style={{ color:C.gray, fontSize:13, lineHeight:1.7, marginBottom:20 }}>You'll need an NRE or NRO account to remit funds and receive rental income.</p>
            <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:24 }}>
              {NRI_BANKS.map((bank,i)=>(
                <div key={i} style={{ background:C.white, borderRadius:14, border:"1px solid #E0D8CC", overflow:"hidden" }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:mob?"14px 14px":"16px 22px", borderBottom:"1px solid #F0EAE0", flexWrap:"wrap", gap:10 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:11 }}>
                      <div style={{ width:40, height:40, borderRadius:9, background:bank.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>🏦</div>
                      <div>
                        <div style={{ fontFamily:"Georgia,serif", fontSize:15, fontWeight:700, color:C.charcoal }}>{bank.name}</div>
                        <span style={{ fontSize:10, background:`${bank.color}18`, color:bank.color, padding:"2px 8px", borderRadius:10, display:"inline-block", fontWeight:700 }}>{bank.badge}</span>
                      </div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontSize:10, color:C.gray }}>NRI Home Loan Rate</div>
                      <div style={{ fontSize:20, fontWeight:800, fontFamily:"Georgia,serif", color:C.forest }}>{bank.rate}</div>
                    </div>
                  </div>
                  <div style={{ padding:mob?"11px 14px":"12px 22px", display:"flex", gap:18, flexWrap:"wrap" }}>
                    {bank.features.map((f,j)=>(
                      <div key={j} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:C.charcoal }}>
                        <span style={{ color:C.green, fontWeight:800 }}>✓</span>{f}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {/* NRE vs NRO */}
            <div style={{ background:C.white, borderRadius:14, border:"1px solid #E0D8CC", overflow:"hidden" }}>
              <div style={{ background:`linear-gradient(135deg,${NAVY},${NAVYL})`, padding:"12px 18px" }}>
                <h3 style={{ color:"#fff", fontFamily:"Georgia,serif", fontSize:15, fontWeight:700 }}>NRE vs NRO Account — Which Do You Need?</h3>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:mob?"1fr":"1fr 1fr", gap:0 }}>
                {[
                  {type:"NRE Account", color:NAVY, bg:"#EFF6FF", pts:["Money from abroad only","Interest: tax-free in India","Fully repatriable","Use for: purchase payment","Joint with resident: NOT allowed"]},
                  {type:"NRO Account", color:C.forest, bg:"#F0FDF4", pts:["India income (rent, dividends)","Interest: taxable in India","Repatriate up to USD 1M/yr","Use for: receiving rental income","Joint with resident: Allowed"]},
                ].map((acc,i)=>(
                  <div key={i} style={{ padding:mob?"16px 14px":"20px 20px", background:acc.bg, borderRight:!mob&&i===0?"1px solid #E0D8CC":"none" }}>
                    <h4 style={{ fontFamily:"Georgia,serif", fontSize:14, fontWeight:700, color:acc.color, marginBottom:11 }}>{acc.type}</h4>
                    {acc.pts.map((p,j)=>(
                      <div key={j} style={{ display:"flex", gap:7, marginBottom:7, fontSize:12, color:C.charcoal, lineHeight:1.5 }}>
                        <span style={{ color:acc.color, fontWeight:800, flexShrink:0 }}>•</span>{p}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── HOW TO BUY ── */}
        {tab==="process" && (
          <div>
            <p style={{ color:NAVY, fontSize:10, letterSpacing:3, textTransform:"uppercase", fontWeight:700, marginBottom:5 }}>STEP-BY-STEP</p>
            <h2 style={{ fontFamily:"Georgia,serif", fontSize:mob?24:32, fontWeight:700, color:C.charcoal, marginBottom:5 }}>How to Buy from Abroad</h2>
            <p style={{ color:C.gray, fontSize:13, marginBottom:22 }}>Complete remote purchase in 6–8 weeks. No India visit required.</p>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {NRI_STEPS.map((step,i)=>(
                <div key={i} style={{ display:"flex", gap:mob?13:18, alignItems:"flex-start", background:C.white, borderRadius:13, padding:mob?"14px 14px":"18px 22px", border:"1px solid #E0D8CC" }}>
                  <div style={{ flexShrink:0, textAlign:"center" }}>
                    <div style={{ width:mob?38:46, height:mob?38:46, borderRadius:11, background:`linear-gradient(135deg,${NAVY},${NAVYL})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:mob?9:11, color:C.tan, fontWeight:800, letterSpacing:0.5, marginBottom:4 }}>{step.n}</div>
                    <span style={{ fontSize:mob?18:22 }}>{step.icon}</span>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:4, flexWrap:"wrap" }}>
                      <h3 style={{ fontFamily:"Georgia,serif", fontSize:mob?13:15, fontWeight:700, color:C.charcoal }}>{step.title}</h3>
                      <span style={{ background:`${NAVY}12`, color:NAVY, fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:10 }}>{step.time}</span>
                    </div>
                    <p style={{ fontSize:12, color:C.gray, lineHeight:1.7 }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── FAQs ── */}
        {tab==="faq" && (
          <div>
            <p style={{ color:NAVY, fontSize:10, letterSpacing:3, textTransform:"uppercase", fontWeight:700, marginBottom:5 }}>FREQUENTLY ASKED</p>
            <h2 style={{ fontFamily:"Georgia,serif", fontSize:mob?24:32, fontWeight:700, color:C.charcoal, marginBottom:6 }}>NRI Property Questions</h2>
            <p style={{ color:C.gray, fontSize:13, marginBottom:20 }}>Every question NRIs ask before investing — answered honestly.</p>
            <div style={{ background:C.white, borderRadius:14, border:"1px solid #E0D8CC", overflow:"hidden" }}>
              {NRI_FAQS.map((faq,i)=>{
                const [open,setOpen] = useState(false);
                return (
                  <div key={i} style={{ borderBottom:i<NRI_FAQS.length-1?"1px solid #E8E0D0":"none" }}>
                    <button onClick={()=>setOpen(o=>!o)} style={{ width:"100%", background:"none", border:"none", cursor:"pointer", padding:"15px 18px", display:"flex", alignItems:"flex-start", gap:12, textAlign:"left" }}>
                      <span style={{ color:NAVY, fontSize:15, flexShrink:0, marginTop:1, transition:"transform 0.2s", transform:open?"rotate(45deg)":"none" }}>+</span>
                      <span style={{ fontFamily:"Georgia,serif", fontSize:13, fontWeight:600, color:C.charcoal, lineHeight:1.5 }}>{faq.q}</span>
                    </button>
                    {open && <div style={{ padding:"0 18px 16px 45px", fontSize:12, color:C.gray, lineHeight:1.8 }}>{faq.a}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* NRI ENQUIRY FORM — shown on all tabs */}
        <div style={{ marginTop:36, background:C.white, borderRadius:16, border:"1px solid #E0D8CC", overflow:"hidden" }}>
          <div style={{ background:`linear-gradient(135deg,${NAVY},${NAVYL})`, padding:mob?"18px 16px":"22px 26px" }}>
            <p style={{ color:C.tan, fontSize:10, letterSpacing:2, textTransform:"uppercase", fontWeight:700, marginBottom:4 }}>NRI CONNECT</p>
            <h2 style={{ color:"#fff", fontFamily:"Georgia,serif", fontSize:mob?18:22, fontWeight:700, marginBottom:4 }}>Talk to an NRI Property Advisor</h2>
            <p style={{ color:"rgba(255,255,255,0.45)", fontSize:12 }}>Response within 4 hours · Your timezone · Zero broker fee · No obligation</p>
          </div>
          {nriSent ? (
            <div style={{ padding:mob?"32px 20px":"44px 40px", textAlign:"center" }}>
              <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
              <h3 style={{ fontFamily:"Georgia,serif", fontSize:20, fontWeight:700, color:NAVY, marginBottom:8 }}>Welcome to ERTH NRI Club!</h3>
              <p style={{ color:C.gray, fontSize:13, lineHeight:1.7 }}>Your NRI advisor will reach out within <strong>4 hours</strong> in your timezone. Check email for the NRI Buying Guide PDF.</p>
            </div>
          ) : (
            <div style={{ padding:mob?"20px 16px 28px":"28px 32px 34px" }}>
              <div style={{ display:"grid", gridTemplateColumns:mob?"1fr":"1fr 1fr", gap:"12px 16px", marginBottom:12 }}>
                {[["Full Name *","name","text","Rajesh Kumar"],["Email *","email","email","rajesh@email.com"],["WhatsApp / Phone","phone","tel","+1 201 555 0123"]].map(([label,key,type,ph])=>(
                  <div key={key}>
                    <label style={{ display:"block", fontSize:11, color:C.gray, letterSpacing:0.5, marginBottom:5, fontWeight:600, textTransform:"uppercase" }}>{label}</label>
                    <input type={type} value={nriForm[key]} onChange={e=>setF(key,e.target.value)} placeholder={ph} style={{ width:"100%", background:C.cream, border:"1.5px solid #DDD", borderRadius:8, padding:"10px 12px", fontSize:13, fontFamily:"Georgia,serif", color:C.charcoal, outline:"none", boxSizing:"border-box" }} />
                  </div>
                ))}
                <div>
                  <label style={{ display:"block", fontSize:11, color:C.gray, letterSpacing:0.5, marginBottom:5, fontWeight:600, textTransform:"uppercase" }}>Country</label>
                  <select value={nriForm.country} onChange={e=>setF("country",e.target.value)} style={{ width:"100%", background:C.cream, border:"1.5px solid #DDD", borderRadius:8, padding:"10px 12px", fontSize:13, fontFamily:"Georgia,serif", color:C.charcoal, outline:"none", boxSizing:"border-box" }}>
                    {NRI_COUNTRIES.map(c=><option key={c.currency} value={c.name}>{c.flag} {c.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom:14 }}>
                <label style={{ display:"block", fontSize:11, color:C.gray, letterSpacing:0.5, marginBottom:6, fontWeight:600, textTransform:"uppercase" }}>Investment Budget</label>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:7 }}>
                  {["Under ₹1 Cr","₹1–2 Cr","₹2 Cr+"].map(b=>(
                    <button key={b} onClick={()=>setF("budget",b)} style={{ background:nriForm.budget===b?NAVY:C.cream, border:`1.5px solid ${nriForm.budget===b?NAVY:"#DDD"}`, borderRadius:8, padding:"9px 6px", cursor:"pointer", fontFamily:"Georgia,serif", fontSize:12, color:nriForm.budget===b?"#fff":C.charcoal, fontWeight:nriForm.budget===b?700:400 }}>{b}</button>
                  ))}
                </div>
              </div>
              <button onClick={()=>{ if(!nriForm.name||!nriForm.email)return; setNriSent(true); }} disabled={!nriForm.name||!nriForm.email} style={{ width:"100%", background:!nriForm.name||!nriForm.email?"#CCC":`linear-gradient(135deg,${NAVY},${NAVYL})`, border:"none", borderRadius:10, cursor:!nriForm.name||!nriForm.email?"not-allowed":"pointer", color:"#fff", padding:14, fontFamily:"Georgia,serif", fontWeight:700, fontSize:14 }}>
                🌏 Connect with NRI Advisor
              </button>
              <p style={{ textAlign:"center", fontSize:11, color:C.gray, marginTop:8 }}>No spam · We respond within 4 hours in your timezone</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}


// ══════════════════════════════════════════════════════
// ABOUT US PAGE
// ══════════════════════════════════════════════════════
function AboutPage({ go, onEnquire }) {
  const w = useW(); const mob = w < 768;

  const TIMELINE = [
    { year:"2023", title:"The Idea", desc:"Nitish, frustrated with broker opacity while searching for a farmhouse near Indore, realised no platform existed for second homes with verified data. ERTH was born on a napkin." },
    { year:"2024", title:"Building the Foundation", desc:"Platform architecture built on Supabase + Next.js. Arya AI agent developed. First 6 Indore micro-markets mapped with verified yield data." },
    { year:"2025", title:"Going Live", desc:"erthreality.com launched. AI Matchmaker, Verified Yield badges, Legal Clarity reports, and NRI Corner built. First developer partnerships signed." },
    { year:"2026", title:"Scaling", desc:"ERTH Stays hospitality arm launching in Ujjain. Core by ERTH B2B managed AI service for developers. Seed funding round open." },
  ];

  const VALUES = [
    { icon:"🔍", title:"Radical Transparency", desc:"Every yield is verified. Every legal status is checked. Every broker saving is calculated and shown. No hidden numbers, ever." },
    { icon:"🤖", title:"AI-First, Always", desc:"Arya qualifies leads. The Matchmaker finds your property. Market Intelligence updates automatically. We don't use AI as a feature — it's our infrastructure." },
    { icon:"🤝", title:"Honest Over Popular", desc:"We'll tell you if a property's legal status is amber. We'll show you a 2/4 developer score. Trust is worth more than a sale." },
    { icon:"🌱", title:"Indore-First Depth", desc:"We know every micro-market, every developer, every yield curve in Indore. Deep before wide. We'd rather own one city than be average in ten." },
  ];

  const ARMS = [
    { icon:"🏡", name:"ERTH Marketplace", color:C.forest, desc:"India's first AI-powered second home marketplace. AI search, verified yields, legal clarity, zero broker fee. Live at erthreality.com." },
    { icon:"🤖", name:"Arya — AI Sales Agent", color:"#7C3AED", desc:"WhatsApp AI that qualifies leads in Hinglish, scores them Hot/Warm/Cold, and alerts the advisor in real time. Available 24/7." },
    { icon:"🏨", name:"ERTH Stays", color:C.gold, desc:"Professionally managed short-stay hospitality in spiritual cities. Ujjain anchor, scaling to Varanasi, Ayodhya, Tirupati. 65/35 revenue share." },
    { icon:"⚙️", name:"Core by ERTH", color:"#0F2544", desc:"B2B managed AI operations for real estate developers. Full AI infrastructure — not ads, not software — we run your business." },
  ];

  return (
    <div style={{ background:C.cream, minHeight:"100vh" }}>

      {/* ── HERO ── */}
      <div style={{ background:`linear-gradient(135deg,${C.forestDark} 0%,${C.forest} 60%,#1E3830 100%)`, padding:mob?"78px 16px 52px":"106px 32px 64px", position:"relative", overflow:"hidden" }}>
        {[400,280,180].map((s,i)=>(
          <div key={i} style={{ position:"absolute", width:s, height:s, borderRadius:"50%", border:`1px solid rgba(196,168,130,${0.04+i*0.03})`, top:"50%", left:"50%", transform:"translate(-50%,-50%)", pointerEvents:"none" }} />
        ))}
        <div style={{ maxWidth:780, margin:"0 auto", textAlign:"center" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(196,168,130,0.12)", border:"1px solid rgba(196,168,130,0.28)", borderRadius:40, padding:mob?"6px 14px":"7px 18px", marginBottom:18 }}>
            <span style={{ fontSize:14 }}>🌱</span>
            <span style={{ color:C.tan, fontSize:mob?10:11, letterSpacing:2, textTransform:"uppercase", fontWeight:700 }}>BUILT IN INDORE · FOR INDIA</span>
          </div>
          <h1 style={{ fontFamily:"Georgia,serif", fontSize:mob?28:52, fontWeight:700, color:"#fff", lineHeight:1.1, marginBottom:14 }}>
            We Exist Because<br/>
            <span style={{ background:`linear-gradient(135deg,${C.tan},${C.gold})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Brokers Shouldn't</span>
          </h1>
          <p style={{ color:"rgba(255,255,255,0.55)", fontSize:mob?13:16, lineHeight:1.8, maxWidth:560, margin:"0 auto 32px" }}>
            ERTH was built out of a simple frustration — buying a second home in India is unnecessarily complicated, opaque, and expensive. We're fixing that with AI, verified data, and radical transparency.
          </p>
          <div style={{ display:"grid", gridTemplateColumns:mob?"repeat(2,1fr)":"repeat(4,1fr)", gap:1, maxWidth:640, margin:"0 auto", background:"rgba(196,168,130,0.15)", borderRadius:12, overflow:"hidden", border:"1px solid rgba(196,168,130,0.2)" }}>
            {[{v:"₹0",l:"Broker Fee"},{v:"14.1%",l:"Peak Yield"},{v:"6",l:"Micro-Markets"},{v:"2026",l:"Founded"}].map((s,i)=>(
              <div key={i} style={{ padding:mob?"13px 8px":"17px 14px", textAlign:"center", borderRight:!mob&&i<3?"1px solid rgba(196,168,130,0.2)":"none", borderBottom:mob&&i<2?"1px solid rgba(196,168,130,0.2)":"none", background:"rgba(26,46,38,0.5)" }}>
                <div style={{ color:C.tan, fontSize:mob?17:22, fontWeight:800, fontFamily:"Georgia,serif" }}>{s.v}</div>
                <div style={{ color:"rgba(255,255,255,0.38)", fontSize:9, letterSpacing:1.2, textTransform:"uppercase", marginTop:3 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:960, margin:"0 auto", padding:mob?"24px 14px 60px":"40px 32px 80px" }}>

        {/* ── OUR STORY ── */}
        <div style={{ marginBottom:mob?32:48 }}>
          <p style={{ color:C.forest, fontSize:10, letterSpacing:3, textTransform:"uppercase", fontWeight:700, marginBottom:6 }}>OUR STORY</p>
          <h2 style={{ fontFamily:"Georgia,serif", fontSize:mob?24:36, fontWeight:700, color:C.charcoal, marginBottom:16 }}>Why We Built ERTH</h2>
          <div style={{ display:"grid", gridTemplateColumns:mob?"1fr":"1fr 1fr", gap:mob?14:28 }}>
            <div>
              <p style={{ color:C.gray, fontSize:mob?13:15, lineHeight:1.85, marginBottom:14 }}>
                In 2023, our founder Nitish was looking for a farmhouse near Indore. What he found was a market built entirely on broker trust — opaque pricing, unverifiable rental claims, zero legal clarity, and a 2–3% commission for the privilege of confusion.
              </p>
              <p style={{ color:C.gray, fontSize:mob?13:15, lineHeight:1.85 }}>
                No platform existed that said: "Here's the RERA number. Here's the verified yield based on actual comparable rentals. Here's exactly how much you save by not paying a broker." So we built it.
              </p>
            </div>
            <div style={{ background:C.white, borderRadius:14, padding:mob?"18px 16px":"24px 22px", border:"1px solid #E0D8CC" }}>
              <div style={{ fontFamily:"Georgia,serif", fontSize:mob?15:18, fontWeight:700, color:C.charcoal, marginBottom:12 }}>The ERTH Promise</div>
              {[
                "Every yield is verified against real rental comps — not broker projections",
                "Every property shows RERA status, title clarity, and encumbrance",
                "Zero broker commission for buyers — savings shown on every listing",
                "Free site visit arranged by our advisor — no commitment needed",
                "AI that qualifies your needs, not a salesperson pushing quota",
              ].map((p,i)=>(
                <div key={i} style={{ display:"flex", gap:10, marginBottom:10, fontSize:mob?12:13, color:C.charcoal, lineHeight:1.6 }}>
                  <span style={{ color:C.green, fontWeight:800, flexShrink:0 }}>✓</span>{p}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── FOUNDER ── */}
        <div style={{ background:`linear-gradient(135deg,${C.forest},${C.forestDark})`, borderRadius:16, padding:mob?"22px 18px":"32px 36px", marginBottom:mob?32:48, display:"flex", gap:mob?16:28, flexDirection:mob?"column":"row", alignItems:mob?"flex-start":"center" }}>
          <div style={{ width:mob?64:88, height:mob?64:88, borderRadius:"50%", background:`linear-gradient(135deg,${C.tan},${C.gold})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:mob?28:38, flexShrink:0, border:"3px solid rgba(255,255,255,0.2)" }}>👨‍💼</div>
          <div style={{ flex:1 }}>
            <div style={{ color:C.tan, fontSize:10, letterSpacing:2, textTransform:"uppercase", fontWeight:700, marginBottom:6 }}>FOUNDER & CEO</div>
            <h3 style={{ fontFamily:"Georgia,serif", fontSize:mob?18:24, fontWeight:700, color:"#fff", marginBottom:6 }}>Nitish Saxena</h3>
            <p style={{ color:"rgba(255,255,255,0.55)", fontSize:mob?12:14, lineHeight:1.75, marginBottom:14 }}>
              Based in Indore. Obsessed with making second home investment as transparent and accessible as buying a mutual fund. Building ERTH as India's most trusted property platform — one verified listing at a time.
            </p>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              <a href="https://wa.me/919004343267" target="_blank" rel="noreferrer" style={{ display:"inline-flex", alignItems:"center", gap:6, background:"#25D366", border:"none", borderRadius:7, padding:"8px 16px", cursor:"pointer", color:"#fff", fontFamily:"Georgia,serif", fontWeight:700, fontSize:12, textDecoration:"none" }}>💬 WhatsApp</a>
              <a href="mailto:founders@erthreality.com" style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:7, padding:"8px 16px", cursor:"pointer", color:"#fff", fontFamily:"Georgia,serif", fontWeight:600, fontSize:12, textDecoration:"none" }}>✉️ Email Us</a>
            </div>
          </div>
        </div>

        {/* ── 4 ARMS ── */}
        <div style={{ marginBottom:mob?32:48 }}>
          <p style={{ color:C.forest, fontSize:10, letterSpacing:3, textTransform:"uppercase", fontWeight:700, marginBottom:6 }}>THE ERTH ECOSYSTEM</p>
          <h2 style={{ fontFamily:"Georgia,serif", fontSize:mob?24:34, fontWeight:700, color:C.charcoal, marginBottom:16 }}>Four Arms, One Vision</h2>
          <div style={{ display:"grid", gridTemplateColumns:mob?"1fr":"1fr 1fr", gap:12 }}>
            {ARMS.map((arm,i)=>(
              <div key={i} style={{ background:C.white, borderRadius:13, padding:mob?"16px 14px":"20px 20px", border:"1px solid #E0D8CC", borderTop:`3px solid ${arm.color}` }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                  <div style={{ width:38, height:38, borderRadius:9, background:`${arm.color}15`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{arm.icon}</div>
                  <div style={{ fontFamily:"Georgia,serif", fontSize:mob?14:16, fontWeight:700, color:C.charcoal }}>{arm.name}</div>
                </div>
                <p style={{ fontSize:mob?12:13, color:C.gray, lineHeight:1.7 }}>{arm.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── VALUES ── */}
        <div style={{ marginBottom:mob?32:48 }}>
          <p style={{ color:C.forest, fontSize:10, letterSpacing:3, textTransform:"uppercase", fontWeight:700, marginBottom:6 }}>WHAT WE STAND FOR</p>
          <h2 style={{ fontFamily:"Georgia,serif", fontSize:mob?24:34, fontWeight:700, color:C.charcoal, marginBottom:16 }}>Our Values</h2>
          <div style={{ display:"grid", gridTemplateColumns:mob?"1fr":"repeat(2,1fr)", gap:12 }}>
            {VALUES.map((v,i)=>(
              <div key={i} style={{ background:C.white, borderRadius:13, padding:mob?"16px 14px":"20px 20px", border:"1px solid #E0D8CC", display:"flex", gap:14 }}>
                <span style={{ fontSize:28, flexShrink:0 }}>{v.icon}</span>
                <div>
                  <div style={{ fontFamily:"Georgia,serif", fontSize:mob?14:16, fontWeight:700, color:C.charcoal, marginBottom:5 }}>{v.title}</div>
                  <p style={{ fontSize:mob?12:13, color:C.gray, lineHeight:1.7 }}>{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── TIMELINE ── */}
        <div style={{ marginBottom:mob?32:48 }}>
          <p style={{ color:C.forest, fontSize:10, letterSpacing:3, textTransform:"uppercase", fontWeight:700, marginBottom:6 }}>JOURNEY</p>
          <h2 style={{ fontFamily:"Georgia,serif", fontSize:mob?24:34, fontWeight:700, color:C.charcoal, marginBottom:20 }}>How We Got Here</h2>
          <div style={{ position:"relative" }}>
            <div style={{ position:"absolute", left:mob?16:24, top:0, bottom:0, width:2, background:`linear-gradient(180deg,${C.forest},${C.tan})`, borderRadius:2 }} />
            {TIMELINE.map((t,i)=>(
              <div key={i} style={{ display:"flex", gap:mob?16:24, marginBottom:24, position:"relative" }}>
                <div style={{ width:mob?32:48, height:mob?32:48, borderRadius:"50%", background:`linear-gradient(135deg,${C.forest},${C.forestLight})`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, zIndex:1, border:"3px solid #F5F0E8" }}>
                  <span style={{ color:C.tan, fontSize:mob?9:10, fontWeight:800 }}>{t.year}</span>
                </div>
                <div style={{ background:C.white, borderRadius:12, padding:mob?"14px 14px":"16px 18px", border:"1px solid #E0D8CC", flex:1, marginTop:4 }}>
                  <div style={{ fontFamily:"Georgia,serif", fontSize:mob?14:16, fontWeight:700, color:C.charcoal, marginBottom:5 }}>{t.title}</div>
                  <p style={{ fontSize:mob?12:13, color:C.gray, lineHeight:1.7 }}>{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── WHAT MAKES US DIFFERENT ── */}
        <div style={{ background:C.charcoal, borderRadius:16, padding:mob?"22px 16px":"32px 32px", marginBottom:mob?24:36 }}>
          <p style={{ color:C.tan, fontSize:10, letterSpacing:3, textTransform:"uppercase", fontWeight:700, marginBottom:6 }}>VS TRADITIONAL BROKERS</p>
          <h2 style={{ fontFamily:"Georgia,serif", fontSize:mob?22:32, fontWeight:700, color:"#fff", marginBottom:20 }}>ERTH vs Everyone Else</h2>
          <div style={{ overflow:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:mob?11:13 }}>
              <thead>
                <tr>
                  {["What Matters","Traditional Broker","ERTH"].map((h,i)=>(
                    <th key={i} style={{ textAlign:i===0?"left":"center", padding:"10px 12px", background:i===2?`${C.forest}`:i===1?"rgba(255,255,255,0.05)":"transparent", color:i===2?C.tan:i===1?"rgba(255,255,255,0.5)":"rgba(255,255,255,0.4)", fontSize:10, letterSpacing:1, textTransform:"uppercase", borderRadius:i===2?"8px 8px 0 0":0 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Rental Yield Data","Self-claimed, unverified","ERTH-verified vs real comps"],
                  ["Commission","2–3% from buyer","₹0 from buyer"],
                  ["Legal Clarity","'Trust me bhai'","RERA, title, encumbrance report"],
                  ["Response Time","Miss 40–60% of leads","Arya replies in 60 seconds"],
                  ["Language","English only","Hindi, Hinglish, English"],
                  ["Site Visit","Paid, sometimes","Always free"],
                  ["Developer Background","Unknown","MCA, RERA, ERTH verified"],
                  ["Available 24/7","Never","Always (AI + WhatsApp)"],
                ].map((row,i)=>(
                  <tr key={i} style={{ borderTop:"1px solid rgba(255,255,255,0.06)" }}>
                    <td style={{ padding:"10px 12px", color:"rgba(255,255,255,0.7)", fontWeight:600 }}>{row[0]}</td>
                    <td style={{ padding:"10px 12px", textAlign:"center", color:"rgba(255,255,255,0.35)" }}>{row[1]}</td>
                    <td style={{ padding:"10px 12px", textAlign:"center", color:"#4ADE80", fontWeight:700, background:"rgba(44,74,62,0.25)" }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── CTA ── */}
        <div style={{ display:"grid", gridTemplateColumns:mob?"1fr":"repeat(3,1fr)", gap:10 }}>
          {[
            { icon:"🏡", title:"Browse Properties", desc:"Explore verified second homes in Indore", btn:"View Properties", action:()=>go("properties"), bg:C.forest },
            { icon:"📋", title:"Book Consultation", desc:"Free call with our property advisor", btn:"Book Free Call", action:()=>onEnquire(null), bg:C.gold },
            { icon:"🏗️", title:"List Your Project", desc:"Developer? Partner with ERTH today", btn:"Partner With Us", action:()=>go("properties"), bg:"#0F2544" },
          ].map((c,i)=>(
            <div key={i} style={{ background:c.bg, borderRadius:13, padding:mob?"18px 16px":"22px 20px", textAlign:"center" }}>
              <div style={{ fontSize:28, marginBottom:10 }}>{c.icon}</div>
              <div style={{ fontFamily:"Georgia,serif", fontSize:mob?15:17, fontWeight:700, color:"#fff", marginBottom:6 }}>{c.title}</div>
              <p style={{ fontSize:11, color:"rgba(255,255,255,0.5)", lineHeight:1.6, marginBottom:14 }}>{c.desc}</p>
              <button onClick={c.action} style={{ background:"rgba(255,255,255,0.15)", border:"1.5px solid rgba(255,255,255,0.3)", borderRadius:8, padding:"9px 18px", cursor:"pointer", color:"#fff", fontFamily:"Georgia,serif", fontWeight:700, fontSize:12 }}>{c.btn}</button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}


// ══════════════════════════════════════════════════════
// ADMIN GATE — PIN PROTECTED
// ══════════════════════════════════════════════════════
const ADMIN_PIN = "ERTH2026"; // ← change this to your secret PIN

function AdminGate({ onClose }) {
  const w = useW(); const mob = w < 768;
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem("erth_admin") === "yes");

  const tryPin = () => {
    if (pin === ADMIN_PIN) {
      sessionStorage.setItem("erth_admin", "yes");
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
      setPin("");
      setTimeout(() => setError(false), 2000);
    }
  };

  if (unlocked) return <AdminDashboard onClose={onClose} />;

  return (
    <div style={{ position:"fixed", inset:0, zIndex:900, background:`linear-gradient(135deg,${C.forestDark},${C.forest})`, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:C.white, borderRadius:18, padding:mob?"28px 22px":"40px 44px", maxWidth:380, width:"100%", textAlign:"center", boxShadow:"0 24px 64px rgba(0,0,0,0.3)" }}>
        <div style={{ width:60, height:60, borderRadius:"50%", background:`linear-gradient(135deg,${C.forest},${C.tan})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, margin:"0 auto 16px" }}>🔐</div>
        <h2 style={{ fontFamily:"Georgia,serif", fontSize:22, fontWeight:700, color:C.charcoal, marginBottom:6 }}>ERTH Admin</h2>
        <p style={{ color:C.gray, fontSize:13, marginBottom:22 }}>Enter your admin PIN to continue</p>
        <input
          type="password"
          value={pin}
          onChange={e => setPin(e.target.value)}
          onKeyDown={e => e.key === "Enter" && tryPin()}
          placeholder="Enter PIN"
          autoFocus
          style={{ width:"100%", background:error?"#FEF2F2":C.cream, border:`2px solid ${error?C.red:pin.length>0?C.forest:"#D5CBBB"}`, borderRadius:10, padding:"13px 16px", fontSize:18, fontFamily:"Georgia,serif", textAlign:"center", letterSpacing:4, outline:"none", marginBottom:12, boxSizing:"border-box", transition:"border-color .2s, background .2s" }}
        />
        {error && <p style={{ color:C.red, fontSize:12, marginBottom:10, fontWeight:600 }}>❌ Incorrect PIN — try again</p>}
        <button onClick={tryPin} style={{ width:"100%", background:`linear-gradient(135deg,${C.forest},${C.forestLight})`, border:"none", borderRadius:10, padding:"13px", cursor:"pointer", color:"#fff", fontFamily:"Georgia,serif", fontWeight:700, fontSize:15, marginBottom:10 }}>
          Unlock Dashboard
        </button>
        <button onClick={onClose} style={{ background:"none", border:"none", color:C.gray, cursor:"pointer", fontSize:13, fontFamily:"Georgia,serif" }}>← Back to website</button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// ADMIN DASHBOARD (inline version)
// ══════════════════════════════════════════════════════
function AdminDashboard({ onClose }) {
  const w = useW(); const mob = w < 768;
  const [leads, setLeads] = useState([]);
  const [props, setProps] = useState([]);
  const [tab, setTab] = useState("leads");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total:0, hot:0, warm:0, cold:0, properties:0 });

  const SUPA_URL = "https://rhkwznrvbglgzxtvpwmz.supabase.co";
  const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoa3d6bnJ2YmdsZ3p4dHZwd216Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MDc0NDQsImV4cCI6MjA5MTM4MzQ0NH0.q7BZyt3OGCRu55Py0k_KzHREUgrTyg2yCMX31mGk1vQ";
  const headers = { "apikey": SUPA_KEY, "Authorization": `Bearer ${SUPA_KEY}` };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [leadsRes, propsRes] = await Promise.all([
        fetch(`${SUPA_URL}/rest/v1/leads?order=created_at.desc&limit=50`, { headers }),
        fetch(`${SUPA_URL}/rest/v1/properties?order=created_at.desc`, { headers }),
      ]);
      const leadsData = await leadsRes.json();
      const propsData = await propsRes.json();
      const l = Array.isArray(leadsData) ? leadsData : [];
      const p = Array.isArray(propsData) ? propsData : [];
      setLeads(l);
      setProps(p);
      setStats({ total:l.length, hot:l.filter(x=>x.lead_score==="hot").length, warm:l.filter(x=>x.lead_score==="warm").length, cold:l.filter(x=>x.lead_score==="cold").length, properties:p.length });
    } catch(e) { console.log("Admin fetch error:", e); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const updateLeadStatus = async (id, status) => {
    await fetch(`${SUPA_URL}/rest/v1/leads?id=eq.${id}`, { method:"PATCH", headers:{...headers,"Content-Type":"application/json","Prefer":"return=minimal"}, body:JSON.stringify({status}) });
    setLeads(l => l.map(x => x.id === id ? {...x, status} : x));
  };

  const SCORE_CFG = { hot:{bg:"#FEF2F2",c:"#EF4444",label:"🔥 Hot"}, warm:{bg:"#FFFBEB",c:"#F59E0B",label:"🌤 Warm"}, cold:{bg:"#F9FAFB",c:"#6B7280",label:"❄️ Cold"} };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:800, background:C.cream, overflowY:"auto" }}>
      {/* Header */}
      <div style={{ background:`linear-gradient(135deg,${C.forestDark},${C.forest})`, padding:mob?"14px 16px":"16px 28px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:"50%", background:`linear-gradient(135deg,${C.tan},${C.gold})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>E</div>
          <div>
            <div style={{ color:"#fff", fontFamily:"Georgia,serif", fontWeight:700, fontSize:mob?14:16 }}>ERTH Admin</div>
            <div style={{ color:"rgba(255,255,255,0.45)", fontSize:10 }}>Property & Lead Management</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={fetchData} style={{ background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:7, padding:"7px 13px", cursor:"pointer", color:"#fff", fontSize:11, fontFamily:"Georgia,serif" }}>🔄 Refresh</button>
          <button onClick={() => { sessionStorage.removeItem("erth_admin"); onClose(); }} style={{ background:"rgba(220,38,38,0.2)", border:"1px solid rgba(220,38,38,0.3)", borderRadius:7, padding:"7px 13px", cursor:"pointer", color:"#ff9999", fontSize:11, fontFamily:"Georgia,serif" }}>🔐 Lock</button>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:mob?"14px 12px":"20px 24px" }}>
        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:mob?"repeat(3,1fr)":"repeat(5,1fr)", gap:8, marginBottom:18 }}>
          {[
            {v:stats.total,l:"Total Leads",c:C.forest},
            {v:stats.hot,l:"🔥 Hot",c:"#EF4444"},
            {v:stats.warm,l:"🌤 Warm",c:"#F59E0B"},
            {v:stats.cold,l:"❄️ Cold",c:"#6B7280"},
            {v:stats.properties,l:"Properties",c:"#7C3AED"},
          ].map((s,i)=>(
            <div key={i} style={{ background:C.white, borderRadius:10, padding:mob?"12px 10px":"14px 16px", border:"1px solid #E8E0D0", textAlign:"center" }}>
              <div style={{ fontSize:mob?20:24, fontWeight:800, color:s.c, fontFamily:"Georgia,serif" }}>{loading?"…":s.v}</div>
              <div style={{ fontSize:10, color:C.gray, marginTop:2 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:8, marginBottom:16 }}>
          {[["leads","📋 Leads"],["properties","🏡 Properties"]].map(([id,label])=>(
            <button key={id} onClick={()=>setTab(id)} style={{ background:tab===id?C.forest:C.white, border:`1.5px solid ${tab===id?C.forest:"#D5CBBB"}`, borderRadius:24, padding:"7px 18px", cursor:"pointer", color:tab===id?"#fff":C.gray, fontSize:12, fontFamily:"Georgia,serif", fontWeight:tab===id?700:400 }}>{label}</button>
          ))}
        </div>

        {/* LEADS TAB */}
        {tab==="leads" && (
          <div>
            {loading ? <div style={{ textAlign:"center", padding:40, color:C.gray }}>Loading leads…</div> :
            leads.length === 0 ? <div style={{ textAlign:"center", padding:40, color:C.gray, background:C.white, borderRadius:12, border:"1px solid #E0D8CC" }}>No leads yet. Enquiries will appear here.</div> :
            leads.map(lead => {
              const sc = SCORE_CFG[lead.lead_score] || SCORE_CFG.cold;
              return (
                <div key={lead.id} style={{ background:C.white, borderRadius:11, border:"1px solid #E8E0D0", marginBottom:9, padding:mob?"12px 13px":"14px 18px" }}>
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:10, flexWrap:"wrap" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:11 }}>
                      <div style={{ width:36, height:36, borderRadius:"50%", background:sc.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0, border:`1.5px solid ${sc.c}25` }}>
                        {lead.lead_score==="hot"?"🔥":lead.lead_score==="warm"?"🌤":"❄️"}
                      </div>
                      <div>
                        <div style={{ fontSize:13, fontWeight:700, color:C.charcoal }}>{lead.name || "Unknown"}</div>
                        <div style={{ fontSize:11, color:C.gray }}>
                          {lead.phone && `📱 ${lead.phone}`}
                          {lead.budget && ` · 💰 ${lead.budget}`}
                          {lead.property_name && ` · 🏡 ${lead.property_name}`}
                        </div>
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap", alignItems:"center" }}>
                      <span style={{ fontSize:10, background:sc.bg, color:sc.c, padding:"2px 9px", borderRadius:10, fontWeight:700, border:`1px solid ${sc.c}25` }}>{sc.label}</span>
                      <span style={{ fontSize:10, color:C.gray }}>{new Date(lead.created_at).toLocaleDateString("en-IN")}</span>
                    </div>
                  </div>
                  {/* Actions */}
                  <div style={{ display:"flex", gap:6, marginTop:10, flexWrap:"wrap" }}>
                    {lead.phone && <>
                      <a href={`tel:${lead.phone}`} style={{ background:C.forest, color:"#fff", borderRadius:7, padding:"6px 12px", fontSize:11, fontWeight:700, textDecoration:"none", fontFamily:"Georgia,serif" }}>📞 Call</a>
                      <a href={`https://wa.me/${lead.phone.replace(/\D/g,"")}?text=${encodeURIComponent(`Hi ${lead.name||"there"}! This is ERTH. Following up on your property enquiry.`)}`} target="_blank" rel="noreferrer" style={{ background:"#25D366", color:"#fff", borderRadius:7, padding:"6px 12px", fontSize:11, fontWeight:700, textDecoration:"none", fontFamily:"Georgia,serif" }}>💬 WA</a>
                    </>}
                    {["Contacted","Site Visit Scheduled","Closed Won","Closed Lost"].map(s=>(
                      <button key={s} onClick={()=>updateLeadStatus(lead.id,s)} style={{ background:lead.status===s?C.forest:C.cream, border:`1px solid ${lead.status===s?C.forest:"#D5CBBB"}`, borderRadius:7, padding:"5px 10px", cursor:"pointer", color:lead.status===s?"#fff":C.gray, fontSize:10, fontFamily:"Georgia,serif" }}>{s}</button>
                    ))}
                  </div>
                  {lead.message && <div style={{ marginTop:8, fontSize:11, color:C.gray, background:C.cream, borderRadius:7, padding:"7px 10px", lineHeight:1.5 }}>"{lead.message.slice(0,120)}{lead.message.length>120?"…":""}"</div>}
                </div>
              );
            })}
          </div>
        )}

        {/* PROPERTIES TAB */}
        {tab==="properties" && (
          <div>
            {loading ? <div style={{ textAlign:"center", padding:40, color:C.gray }}>Loading properties…</div> :
            props.length === 0 ? <div style={{ textAlign:"center", padding:40, color:C.gray, background:C.white, borderRadius:12, border:"1px solid #E0D8CC" }}>No properties in database yet. Add via the developer form or Supabase directly.</div> :
            props.map(p=>(
              <div key={p.id} style={{ background:C.white, borderRadius:11, border:"1px solid #E8E0D0", marginBottom:9, padding:mob?"12px 13px":"14px 18px", display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
                <div style={{ fontSize:32 }}>{p.img || "🏡"}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:C.charcoal }}>{p.title}</div>
                  <div style={{ fontSize:11, color:C.gray }}>{p.location} · {p.type} · {p.price_label || p.price}</div>
                  <div style={{ fontSize:11, color:C.gold, fontWeight:600, marginTop:2 }}>✓ {p.rental_yield || p.yield}% yield · {p.status}</div>
                </div>
                <div style={{ display:"flex", gap:6 }}>
                  <span style={{ fontSize:10, background:p.is_featured?"#FEF3C7":"#F0FDF4", color:p.is_featured?"#D97706":"#16A34A", padding:"3px 9px", borderRadius:10, fontWeight:700, border:`1px solid ${p.is_featured?"#FDE68A":"#BBF7D0"}` }}>{p.is_featured?"⭐ Featured":"✓ Listed"}</span>
                </div>
              </div>
            ))}
            <div style={{ background:`${C.forest}08`, border:`1px solid ${C.forest}20`, borderRadius:10, padding:"12px 16px", marginTop:10 }}>
              <div style={{ fontSize:12, color:C.forest, fontWeight:600, marginBottom:4 }}>💡 To add/edit properties:</div>
              <div style={{ fontSize:11, color:C.gray, lineHeight:1.7 }}>Go to your Supabase dashboard → Table Editor → properties table → Insert row. Changes appear here immediately.</div>
              <a href="https://supabase.com/dashboard/project/rhkwznrvbglgzxtvpwmz/editor" target="_blank" rel="noreferrer" style={{ display:"inline-block", marginTop:8, background:C.forest, color:"#fff", borderRadius:7, padding:"7px 14px", fontSize:11, fontWeight:700, textDecoration:"none", fontFamily:"Georgia,serif" }}>Open Supabase Table Editor →</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// APP ROOT
// ══════════════════════════════════════════════════════
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#F5F0E8", flexDirection:"column", gap:16, padding:24, textAlign:"center" }}>
          <div style={{ fontSize:48 }}>🏡</div>
          <h2 style={{ fontFamily:"Georgia,serif", color:"#2C4A3E", fontSize:24 }}>Something went wrong</h2>
          <pre style={{ fontSize:10, color:"#999", maxWidth:500, overflow:"auto", textAlign:"left", background:"#fff", padding:12, borderRadius:8 }}>{String(this.state.error)}</pre>
          <button onClick={() => window.location.reload()} style={{ background:"#2C4A3E", color:"#fff", border:"none", borderRadius:8, padding:"10px 24px", cursor:"pointer", fontFamily:"Georgia,serif", fontWeight:700 }}>Refresh Page</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [page, setPage] = useState("home");
  const [sq, setSQ] = useState("");
  const [modalProp, setModalProp] = useState(null);
  const [enquiryProp, setEnquiryProp] = useState(undefined);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [liveProps, setLiveProps] = useState([]);
  const [propsLoading, setPropsLoading] = useState(true);

  useEffect(() => {
    loadPropertiesFromDB().then(data => {
      setLiveProps(data);
      setPropsLoading(false);
    });
  }, []);

  // Use live props if available, else fallback to empty
  const ACTIVE_PROPS = liveProps.length > 0 ? liveProps : PROPS;
  const w = useW(); const mob = w < 768;

  const go = useCallback((p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }, []);
  const openModal = (p) => setModalProp(p);
  const openEnquiry = (p) => { setModalProp(null); setEnquiryProp(p === undefined ? null : p); };

  return (
    <div style={{ fontFamily: "Georgia,serif", overflowX: "hidden", background: C.cream }}>
      <Nav page={page} go={go} onEnquire={openEnquiry} />
      <TrustBar />

      {page === "home" && <>
        <Hero go={go} setSQ={setSQ} onEnquire={openEnquiry} onMatchmaker={() => setShowQuiz(true)} />
        <Features />
        <section style={{ background: C.cream, padding: mob ? "52px 14px" : "80px 32px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: mob ? "flex-start" : "flex-end", marginBottom: mob ? 22 : 36, flexDirection: mob ? "column" : "row", gap: 12 }}>
              <div>
                <p style={{ color: C.forest, fontSize: 10, letterSpacing: 3, textTransform: "uppercase", marginBottom: 5, fontWeight: 700 }}>FEATURED · ZERO BROKER FEE</p>
                <h2 style={{ fontFamily: "Georgia,serif", fontSize: mob ? 24 : 36, fontWeight: 700, color: C.charcoal }}>AI-Picked For You</h2>
              </div>
              <button onClick={() => go("properties")} style={{ background: "transparent", border: `1.5px solid ${C.forest}`, borderRadius: 6, padding: "9px 18px", cursor: "pointer", color: C.forest, fontFamily: "Georgia,serif", fontSize: 12, fontWeight: 600 }}>View All 10 →</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : w < 1024 ? "1fr 1fr" : "repeat(3,1fr)", gap: mob ? 14 : 22 }}>
              {ACTIVE_PROPS.slice(0, 3).map(p => <Card key={p.id} p={p} onOpen={openModal} onEnquire={openEnquiry} />)}
            </div>
          </div>
        </section>

        {/* Lead CTA */}
        <section style={{ background: `linear-gradient(135deg,${C.forest},${C.forestDark})`, padding: mob ? "44px 16px" : "72px 32px", textAlign: "center" }}>
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            <p style={{ color: C.tan, fontSize: 10, letterSpacing: 3, textTransform: "uppercase", marginBottom: 12, fontWeight: 700 }}>FREE CONSULTATION</p>
            <h2 style={{ fontFamily: "Georgia,serif", fontSize: mob ? 24 : 38, fontWeight: 700, color: C.white, marginBottom: 10 }}>Save ₹1.5L–5L on Your Next Property</h2>
            <p style={{ color: "rgba(255,255,255,0.48)", fontSize: mob ? 13 : 15, marginBottom: 28, maxWidth: 440, margin: "0 auto 28px" }}>
              Zero broker commission. Verified yields. Legal clarity. Free site visit. Our advisor calls within 2 hours.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 16 }}>
              <button onClick={() => openEnquiry(null)} style={{ background: `linear-gradient(135deg,${C.tan},${C.gold})`, border: "none", borderRadius: 8, cursor: "pointer", color: C.charcoal, padding: mob ? "13px 26px" : "14px 36px", fontFamily: "Georgia,serif", fontWeight: 700, fontSize: mob ? 14 : 15 }}>📋 Book Free Consultation</button>
              <button onClick={() => setShowQuiz(true)} style={{ background: "rgba(255,255,255,0.1)", border: "1.5px solid rgba(255,255,255,0.25)", borderRadius: 8, cursor: "pointer", color: C.white, padding: mob ? "13px 26px" : "14px 36px", fontFamily: "Georgia,serif", fontWeight: 600, fontSize: mob ? 14 : 15 }}>🤖 AI Matchmaker Quiz</button>
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
              {["✓ Zero broker fee", "✓ 2-hour callback", "✓ Free site visit", "✓ No obligation"].map(t => (
                <span key={t} style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>{t}</span>
              ))}
            </div>
          </div>
        </section>
        <Footer go={go} />
      </>}

      {page === "properties" && <><PropertiesPage sq={sq} onOpen={openModal} onEnquire={openEnquiry} props={ACTIVE_PROPS} loading={propsLoading} /><Footer go={go} /></>}
      {page === "market" && <><MarketPage onEnquire={openEnquiry} /><Footer go={go} /></>}
      {page === "calculator" && <><CalculatorPage onEnquire={openEnquiry} /><Footer go={go} /></>}
      {page === "nri" && <><NRIPage onEnquire={openEnquiry} go={go} /><Footer go={go} /></>}
      {page === "about" && <><AboutPage go={go} onEnquire={openEnquiry} /><Footer go={go} /></>}

      {/* Modals */}
      {modalProp && <PropertyModal prop={modalProp} onClose={() => setModalProp(null)} onEnquire={() => openEnquiry(modalProp)} />}
      {enquiryProp !== undefined && <EnquiryModal prop={enquiryProp} onClose={() => setEnquiryProp(undefined)} />}
      {showQuiz && <MatchmakerQuiz onClose={() => setShowQuiz(false)} onEnquire={openEnquiry} />}

      <FloatingButtons onEnquire={openEnquiry} />
      {showAdmin && <AdminGate onClose={() => setShowAdmin(false)} />}
    </div>
  );
}
