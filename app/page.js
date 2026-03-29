"use client";
import { useRouter } from "next/navigation";

export default function Landing() {
  const router = useRouter();

  const S = {
    nav: { display:"flex", alignItems:"center", padding:"0 32px", height:62, borderBottom:"1px solid #F0F0F0", background:"#fff", position:"sticky", top:0, zIndex:100 },
    logoIcon: { width:30, height:30, background:"#7950F2", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:12, fontWeight:500 },
    logoText: { fontSize:15, fontWeight:500, color:"#0A0A0A" },
    navLink: { padding:"6px 13px", borderRadius:8, fontSize:13, color:"#555", cursor:"pointer", background:"none", border:"none", fontFamily:"Inter, sans-serif" },
    navCta: { padding:"8px 18px", background:"#7950F2", color:"#fff", border:"none", borderRadius:8, fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"Inter, sans-serif" },
    heroBadge: { display:"inline-flex", alignItems:"center", gap:6, background:"#F3F0FF", color:"#5B21B6", fontSize:12, fontWeight:500, padding:"5px 13px", borderRadius:20, marginBottom:22 },
    btnPrimary: { padding:"13px 28px", background:"#7950F2", color:"#fff", border:"none", borderRadius:10, fontSize:15, fontWeight:500, cursor:"pointer", fontFamily:"Inter, sans-serif" },
    btnSecondary: { padding:"12px 24px", background:"#fff", color:"#0A0A0A", border:"1.5px solid #E0E0E0", borderRadius:10, fontSize:15, fontWeight:500, cursor:"pointer", fontFamily:"Inter, sans-serif" },
    sectionBadge: { display:"inline-block", background:"#F3F0FF", color:"#5B21B6", fontSize:11, fontWeight:500, padding:"4px 12px", borderRadius:20, marginBottom:12 },
    featCard: { background:"#fff", border:"0.5px solid #E8E8E8", borderRadius:14, padding:22 },
    howStep: { padding:"28px 24px", borderRight:"0.5px solid #F0F0F0" },
    priceCard: { background:"#fff", border:"0.5px solid #E8E8E8", borderRadius:16, padding:24, position:"relative" },
    priceCardFeat: { background:"#fff", border:"2px solid #7950F2", borderRadius:16, padding:24, position:"relative" },
    priceFeat: { fontSize:12.5, color:"#555", padding:"4px 0", display:"flex", alignItems:"flex-start", gap:7 },
    priceBtn: { width:"100%", padding:11, borderRadius:9, fontSize:13.5, fontWeight:500, cursor:"pointer", fontFamily:"Inter, sans-serif", marginTop:16, border:"1.5px solid #E0E0E0", background:"#fff", color:"#333" },
    priceBtnP: { width:"100%", padding:11, borderRadius:9, fontSize:13.5, fontWeight:500, cursor:"pointer", fontFamily:"Inter, sans-serif", marginTop:16, border:"none", background:"#7950F2", color:"#fff" },
  };

  const features = [
    { icon:"◉", color:"#F3F0FF", tc:"#7950F2", title:"Aprende tu marca", desc:"Analiza tu Instagram y assets para entender tu estilo visual, tono y audiencia automáticamente." },
    { icon:"✦", color:"#F0FFF4", tc:"#16A34A", title:"Genera en segundos", desc:"Escribe tu idea en una frase y recibe 5 propuestas de copy + imagen alineadas a tu marca." },
    { icon:"⬚", color:"#FFF7ED", tc:"#EA580C", title:"Biblioteca de assets", desc:"Sube tus fotos y logos. El sistema los usa automáticamente en cada generación." },
    { icon:"◫", color:"#FDF2F8", tc:"#DB2777", title:"Calendario de contenido", desc:"Define una campaña y obtén un calendario semanal completo generado automáticamente." },
    { icon:"◈", color:"#EFF6FF", tc:"#2563EB", title:"Analytics e insights", desc:"Identifica qué contenido funciona mejor y alimenta futuras generaciones con esos datos." },
    { icon:"◎", color:"#F3F0FF", tc:"#7950F2", title:"Bicultural por diseño", desc:"Español, inglés o Spanglish. Tu identidad dual es tu ventaja competitiva, no una complicación." },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"#fff", fontFamily:"Inter, sans-serif" }}>
      <nav style={S.nav}>
        <div style={{ display:"flex", alignItems:"center", gap:9, cursor:"pointer" }} onClick={() => router.push("/generar")}>
          <div style={S.logoIcon}>Ai</div>
          <span style={S.logoText}>Ai<span style={{ color:"#7950F2" }}>Studio</span>Brand</span>
        </div>
        <div style={{ display:"flex", gap:6, marginLeft:"auto", alignItems:"center" }}>
          <button style={S.navLink} onClick={() => document.getElementById("features").scrollIntoView({behavior:"smooth"})}>Funcionalidades</button>
          <button style={S.navLink} onClick={() => document.getElementById("pricing").scrollIntoView({behavior:"smooth"})}>Precios</button>
          <button style={S.navCta} onClick={() => router.push("/login")}>Empieza gratis</button>
        </div>
      </nav>

      <div style={{ padding:"72px 32px 56px", textAlign:"center", maxWidth:780, margin:"0 auto" }}>
        <div style={S.heroBadge}><span style={{ width:6, height:6, borderRadius:"50%", background:"#7950F2", display:"inline-block" }}></span> IA que aprende tu marca</div>
        <h1 style={{ fontSize:42, fontWeight:500, color:"#0A0A0A", lineHeight:1.12, letterSpacing:"-0.03em", marginBottom:16 }}>
          Contenido que suena<br /><span style={{ color:"#7950F2" }}>exactamente como tú</span>
        </h1>
        <p style={{ fontSize:16, color:"#666", lineHeight:1.7, maxWidth:520, margin:"0 auto 32px" }}>
          AiStudioBrand aprende el ADN de tu marca y genera contenido para Instagram en segundos — alineado a tu estilo, tono y audiencia bicultural.
        </p>
        <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap", marginBottom:14 }}>
          <button style={S.btnPrimary} onClick={() => router.push("/login")}>Empieza gratis</button>
          <button style={S.btnSecondary} onClick={() => router.push("/generar")}>Ver el generador</button>
        </div>
        <div style={{ fontSize:12, color:"#999" }}>20 generaciones gratis · Sin tarjeta de crédito</div>
      </div>

      <div style={{ maxWidth:680, margin:"0 auto", padding:"0 32px 64px" }}>
        <div style={{ border:"1.5px solid #EAEAEA", borderRadius:16, overflow:"hidden", boxShadow:"0 4px 24px rgba(0,0,0,0.06)" }}>
          <div style={{ background:"#F8F8F8", borderBottom:"1px solid #EAEAEA", padding:"10px 16px", display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:10, height:10, borderRadius:"50%", background:"#FF5F57" }}></div>
            <div style={{ width:10, height:10, borderRadius:"50%", background:"#FFBD2E" }}></div>
            <div style={{ width:10, height:10, borderRadius:"50%", background:"#28C840" }}></div>
            <span style={{ marginLeft:8, fontSize:12, color:"#999" }}>aistudiobrand.com</span>
          </div>
          <div style={{ padding:20, background:"#fff" }}>
            <div style={{ fontSize:11, fontWeight:500, color:"#999", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8 }}>Qué quieres comunicar hoy</div>
            <div style={{ width:"100%", border:"1.5px solid #E8E8E8", borderRadius:8, padding:"11px 13px", fontSize:13, color:"#555", background:"#FAFAFA", marginBottom:12 }}>
              Quiero anunciar 3 nuevos spots de coaching 1:1 para este mes...
            </div>
            <div style={{ display:"flex", gap:6, marginBottom:14 }}>
              <div style={{ padding:"5px 12px", borderRadius:20, fontSize:12, border:"1.5px solid #7950F2", color:"#6741D9", background:"#F3F0FF", fontWeight:500 }}>Comercial</div>
              <div style={{ padding:"5px 12px", borderRadius:20, fontSize:12, border:"1.5px solid #E0E0E0", color:"#888", background:"#fff" }}>Branding</div>
              <div style={{ padding:"5px 12px", borderRadius:20, fontSize:12, border:"1.5px solid #E0E0E0", color:"#888", background:"#fff" }}>Educativo</div>
            </div>
            <div style={{ width:"100%", padding:12, background:"#7950F2", color:"#fff", border:"none", borderRadius:9, fontSize:14, fontWeight:500, textAlign:"center", marginBottom:16 }}>
              Generar 5 versiones
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              <div style={{ border:"1.5px solid #7950F2", borderRadius:10, padding:14, background:"#FDFCFF" }}>
                <div style={{ fontSize:10, fontWeight:500, color:"#9775FA", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:5 }}>Propuesta 1 · Hook emocional</div>
                <div style={{ fontSize:14, fontWeight:500, color:"#0A0A0A", marginBottom:4 }}>Mami, ya no mas stress por el dinner tonight!</div>
                <div style={{ fontSize:12, color:"#777", lineHeight:1.55, marginBottom:5 }}>Our NEW coaching program es literally a lifesaver para todas las mujeres que want to build their business pero do not have tiempo.</div>
                <div style={{ fontSize:11.5, color:"#7950F2", fontWeight:500 }}>DM con LISTA y te cuento todo</div>
              </div>
              <div style={{ border:"1.5px solid #EAEAEA", borderRadius:10, padding:14 }}>
                <div style={{ fontSize:10, fontWeight:500, color:"#9775FA", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:5 }}>Propuesta 2 · Hook directo</div>
                <div style={{ fontSize:14, fontWeight:500, color:"#0A0A0A", marginBottom:4 }}>3 spots disponibles. Solo 3. Este mes.</div>
                <div style={{ fontSize:12, color:"#777", lineHeight:1.55, marginBottom:5 }}>Coaching 1:1 para creadoras que quieren monetizar su contenido sin perder su esencia.</div>
                <div style={{ fontSize:11.5, color:"#7950F2", fontWeight:500 }}>Link en bio para agendar tu llamada gratuita</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="features" style={{ padding:"64px 32px", background:"#FAFAFA" }}>
        <div style={{ maxWidth:900, margin:"0 auto" }}>
          <div style={S.sectionBadge}>Funcionalidades</div>
          <h2 style={{ fontSize:28, fontWeight:500, color:"#0A0A0A", letterSpacing:"-0.02em", marginBottom:10 }}>Todo lo que necesitas para escalar</h2>
          <p style={{ fontSize:15, color:"#666", lineHeight:1.65, maxWidth:500, marginBottom:40 }}>Disenado para creadoras biculturales que quieren producir contenido profesional sin depender de un equipo.</p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3, minmax(0,1fr))", gap:12 }}>
            {features.map((f, i) => (
              <div key={i} style={S.featCard}>
                <div style={{ width:36, height:36, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, marginBottom:12, background:f.color, color:f.tc }}>{f.icon}</div>
                <div style={{ fontSize:14, fontWeight:500, color:"#0A0A0A", marginBottom:6 }}>{f.title}</div>
                <div style={{ fontSize:13, color:"#666", lineHeight:1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding:"64px 32px", background:"#fff" }}>
        <div style={{ maxWidth:900, margin:"0 auto" }}>
          <div style={S.sectionBadge}>Como funciona</div>
          <h2 style={{ fontSize:28, fontWeight:500, color:"#0A0A0A", letterSpacing:"-0.02em", marginBottom:0 }}>Tres pasos para empezar</h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3, minmax(0,1fr))", gap:0, marginTop:40 }}>
            {[
              { n:"01", t:"Conecta tu marca", d:"Vincula tu Instagram o sube tu contenido existente. AiStudioBrand analiza todo y construye tu perfil de marca automáticamente." },
              { n:"02", t:"Sube tus assets", d:"Tus fotos, productos y referencias van a tu biblioteca. El sistema los usa automáticamente en cada generacion." },
              { n:"03", t:"Genera y publica", d:"Escribe tu idea, elige el tipo de pieza y obtén 5 propuestas de copy + imagen listas para publicar en segundos." },
            ].map((s, i) => (
              <div key={i} style={{ ...S.howStep, borderRight: i < 2 ? "0.5px solid #F0F0F0" : "none" }}>
                <div style={{ fontSize:36, fontWeight:500, color:"#E8E4FE", letterSpacing:"-0.04em", marginBottom:14 }}>{s.n}</div>
                <div style={{ fontSize:15, fontWeight:500, color:"#0A0A0A", marginBottom:8 }}>{s.t}</div>
                <div style={{ fontSize:13, color:"#777", lineHeight:1.65 }}>{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div id="pricing" style={{ padding:"64px 32px", background:"#FAFAFA" }}>
        <div style={{ maxWidth:860, margin:"0 auto" }}>
          <div style={{ textAlign:"center" }}>
            <div style={S.sectionBadge}>Precios</div>
            <h2 style={{ fontSize:28, fontWeight:500, color:"#0A0A0A", letterSpacing:"-0.02em", marginBottom:8 }}>Elige tu plan</h2>
            <p style={{ fontSize:14, color:"#777" }}>Empieza gratis. Escala cuando lo necesites.</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3, minmax(0,1fr))", gap:12, marginTop:40 }}>
            {[
              { name:"Free", price:"$0", per:"para siempre", gens:"100 generaciones / mes", feats:["Brand Profile basico","5 propuestas por prompt","Biblioteca de assets","Soporte por email"], featured:false },
              { name:"Professional", price:"$149", per:"por mes", gens:"500 generaciones / mes", feats:["Todo lo del plan Free","Brand Profile avanzado con IA","Generacion de imagenes","Calendario de contenido","Soporte prioritario"], featured:true },
              { name:"Enterprise", price:"$199", per:"por mes", gens:"5,000 generaciones / mes", feats:["Todo lo del Professional","Hasta 10 marcas activas","API access","Account manager dedicado","Onboarding personalizado"], featured:false },
            ].map((p, i) => (
              <div key={i} style={p.featured ? S.priceCardFeat : S.priceCard}>
                {p.featured && <div style={{ position:"absolute", top:-11, left:"50%", transform:"translateX(-50%)", background:"#7950F2", color:"#fff", fontSize:11, fontWeight:500, padding:"3px 12px", borderRadius:20, whiteSpace:"nowrap" }}>Mas popular</div>}
                <div style={{ fontSize:12, fontWeight:500, color:"#888", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>{p.name}</div>
                <div style={{ fontSize:32, fontWeight:500, color:"#0A0A0A", letterSpacing:"-0.04em", marginBottom:4 }}>{p.price}</div>
                <div style={{ fontSize:13, color:"#999", marginBottom:10 }}>{p.per}</div>
                <div style={{ display:"inline-block", background:"#F3F0FF", color:"#5B21B6", fontSize:11, fontWeight:500, padding:"3px 10px", borderRadius:20, marginBottom:16 }}>{p.gens}</div>
                <div style={{ height:"0.5px", background:"#F0F0F0", margin:"14px 0" }}></div>
                {p.feats.map((f, j) => (
                  <div key={j} style={S.priceFeat}><span style={{ color:"#40C057" }}>checkmark</span> {f}</div>
                ))}
                <button style={p.featured ? S.priceBtnP : S.priceBtn} onClick={() => router.push("/login")}>
                  {p.featured ? "Empezar prueba gratis" : p.name === "Free" ? "Empezar gratis" : "Contactar ventas"}
                </button>
              </div>
            ))}
          </div>
          <div style={{ textAlign:"center", fontSize:12, color:"#999", marginTop:20 }}>Las primeras 20 generaciones son gratis sin registro · Sin tarjeta de credito</div>
        </div>
      </div>

      <div style={{ padding:"72px 32px", background:"#7950F2", textAlign:"center" }}>
        <h2 style={{ fontSize:32, fontWeight:500, color:"#fff", letterSpacing:"-0.02em", marginBottom:12 }}>Lista para empezar?</h2>
        <p style={{ fontSize:15, color:"rgba(255,255,255,0.75)", marginBottom:28 }}>Unete a las primeras creadoras que estan usando AiStudioBrand para escalar su contenido.</p>
        <button style={{ padding:"14px 32px", background:"#fff", color:"#7950F2", border:"none", borderRadius:10, fontSize:15, fontWeight:500, cursor:"pointer", fontFamily:"Inter, sans-serif" }} onClick={() => router.push("/login")}>
          Crear cuenta gratis
        </button>
        <div style={{ fontSize:12, color:"rgba(255,255,255,0.55)", marginTop:12 }}>20 generaciones gratis · Sin tarjeta de credito</div>
      </div>

      <div style={{ padding:32, borderTop:"0.5px solid #F0F0F0", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <div style={{ width:26, height:26, background:"#7950F2", borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:11, fontWeight:500 }}>Ai</div>
          <div>
            <div style={{ fontSize:13, fontWeight:500, color:"#0A0A0A" }}>Ai<span style={{ color:"#7950F2" }}>Studio</span>Brand</div>
            <div style={{ fontSize:12, color:"#999", marginTop:2 }}>Contenido que suena como tú.</div>
          </div>
        </div>
        <div style={{ fontSize:12, color:"#bbb" }}>2025 AiStudioBrand. Todos los derechos reservados.</div>
      </div>
    </div>
  );
}