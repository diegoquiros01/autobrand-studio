"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function Biblioteca() {
  const router = useRouter();
  const [assets, setAssets] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) loadAssets(user.id);
      else setLoading(false);
    };
    getUser();
  }, []);

  const loadAssets = async (userId) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from("assets")
        .list(userId + "/resultados/", { sortBy: { column: "created_at", order: "desc" } });
      if (data && data.length > 0) {
        const withUrls = await Promise.all(data.map(async (file) => {
          const { data: urlData } = supabase.storage.from("assets").getPublicUrl(userId + "/resultados/" + file.name);
          return { ...file, url: urlData.publicUrl };
        }));
        setAssets(withUrls.filter(a => a.url));
      } else {
        setAssets([]);
      }
    } catch (e) {
      setAssets([]);
    }
    setLoading(false);
  };

  const uploadFile = async (file) => {
    if (!user) { router.push("/login"); return; }
    if (!file.type.startsWith("image/")) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const fileName = user.id + "/" + Date.now() + "." + ext;
    const { error } = await supabase.storage.from("assets").upload(fileName, file);
    if (!error) loadAssets(user.id);
    setUploading(false);
  };

  const handleFiles = (files) => {
    Array.from(files).forEach(uploadFile);
  };

  const deleteAsset = async (fileName) => {
    if (!user) return;
    const path = user.id + "/resultados/" + fileName;
    await supabase.storage.from("assets").remove([path]);
    loadAssets(user.id);
  };

  const nav = { display:"flex", alignItems:"center", padding:"0 28px", height:60, borderBottom:"1px solid rgba(255,255,255,0.08)", background:"#111122", position:"sticky", top:0, zIndex:100 };

  return (
    <div style={{ minHeight:"100vh", background:"#0D0D1F", fontFamily:"Inter, sans-serif" }}>
      <nav style={nav}>
        <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }} onClick={() => router.push("/")}>
          <div style={{ width:32, height:32, background:"linear-gradient(135deg,#7950F2,#4C6EF5)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:500, fontSize:13 }}>Ai</div>
          <span style={{ fontSize:16, fontWeight:500, color:"#fff" }}>Ai<span style={{ color:"#7950F2" }}>Studio</span>Brand</span>
        </div>
        <div style={{ display:"flex", gap:8, marginLeft:"auto", alignItems:"center" }}>
          <button onClick={() => router.push("/")} style={{ padding:"7px 14px", borderRadius:8, fontSize:13, color:"rgba(255,255,255,0.55)", cursor:"pointer", background:"none", border:"none" }}>Generador</button>
          <button onClick={() => router.push("/brand-profile")} style={{ padding:"7px 14px", borderRadius:8, fontSize:13, color:"rgba(255,255,255,0.55)", cursor:"pointer", background:"none", border:"none" }}>Brand Profile</button>
        </div>
      </nav>

      <div style={{ maxWidth:900, margin:"0 auto", padding:"40px 28px" }}>
        <div style={{ marginBottom:32, display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
          <div>
            <h1 style={{ fontSize:26, fontWeight:500, color:"#fff", marginBottom:6, letterSpacing:"-0.02em" }}>Biblioteca de assets</h1>
            <p style={{ fontSize:14, color:"rgba(255,255,255,0.4)" }}>Tus fotos, logos y referencias visuales. AiStudioBrand los usa al generar contenido.</p>
          </div>
  
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display:"none" }}
          onChange={e => handleFiles(e.target.files)}
        />

        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
          onClick={() => fileRef.current.click()}
          style={{ border: dragOver ? "2px dashed #7950F2" : "2px dashed #E0E0E0", borderRadius:14, padding:"36px 24px", textAlign:"center", marginBottom:28, cursor:"pointer", background: dragOver ? "#F3F0FF" : "#fff", transition:"all 0.15s" }}
        >
          {uploading ? (
            <div>
              <div style={{ fontSize:24, marginBottom:8, opacity:0.4 }}>⬆</div>
              <div style={{ fontSize:14, color:"#7950F2", fontWeight:500 }}>Subiendo...</div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize:24, marginBottom:8, opacity:0.3 }}>+</div>
              <div style={{ fontSize:14, color:"rgba(255,255,255,0.55)", fontWeight:500 }}>Arrastra tus fotos aquí o haz clic para seleccionar</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.3)", marginTop:4 }}>PNG, JPG, WEBP · Múltiples archivos</div>
            </div>
          )}
        </div>

        {!user && (
          <div style={{ background:"#FFFBEB", border:"1px solid #F0C040", borderRadius:12, padding:"16px 20px", marginBottom:24, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <span style={{ fontSize:14, color:"#92400E" }}>Inicia sesión para guardar tus assets</span>
            <button onClick={() => router.push("/login")} style={{ padding:"8px 16px", background:"#7950F2", color:"#fff", border:"none", borderRadius:8, fontSize:13, fontWeight:500, cursor:"pointer" }}>Iniciar sesión</button>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign:"center", padding:"40px 0", color:"rgba(255,255,255,0.3)" }}>Cargando assets...</div>
        ) : assets.length === 0 ? (
          <div style={{ textAlign:"center", padding:"60px 0" }}>
            <div style={{ fontSize:40, opacity:0.15, marginBottom:12 }}>◉</div>
            <div style={{ fontSize:15, color:"rgba(255,255,255,0.4)", fontWeight:500 }}>No tienes assets todavia</div>
            <div style={{ fontSize:13, color:"rgba(255,255,255,0.25)", marginTop:6 }}>Sube tus fotos, logos y referencias para que AiStudioBrand los use al generar contenido</div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize:12, fontWeight:500, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:16 }}>{assets.length} assets</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(160px, 1fr))", gap:12 }}>
              {assets.map((asset, i) => (
                <div key={i} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, overflow:"hidden", position:"relative" }}>
                  <img src={asset.url} alt={asset.name} style={{ width:"100%", aspectRatio:"1", objectFit:"cover", display:"block" }} />
                  <div style={{ padding:"10px 12px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:100 }}>{asset.name}</div>
                    <button
                      onClick={() => deleteAsset(asset.name)}
                      style={{ fontSize:12, color:"#FCA5A5", background:"none", border:"none", cursor:"pointer", padding:"2px 6px" }}
                    >
                      x
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}