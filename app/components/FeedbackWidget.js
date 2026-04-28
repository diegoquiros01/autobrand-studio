"use client";
import { useState } from "react";

const TAGS_ES = ["Tono perfecto", "Colores", "Composición", "Copy largo", "Copy corto", "Muy genérico", "Muy formal", "Muy casual", "Fuera de marca"];
const TAGS_EN = ["Tone on point", "Colors", "Composition", "Copy too long", "Copy too short", "Too generic", "Too formal", "Too casual", "Off-brand"];

export default function FeedbackWidget({ generacionId, en, onSaved, initialRating, initialTags, initialText }) {
  const [rating, setRating] = useState(initialRating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState(initialTags || []);
  const [text, setText] = useState(initialText || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(!!initialRating);

  const tags = en ? TAGS_EN : TAGS_ES;

  const toggleTag = (tag) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    if (saved) setSaved(false);
  };

  const save = async () => {
    if (!rating || !generacionId) return;
    setSaving(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generacionId,
          rating,
          feedbackText: text.trim() || null,
          feedbackTags: selectedTags.length > 0 ? selectedTags : null,
        }),
      });
      if (res.ok) {
        setSaved(true);
        if (onSaved) onSaved({ rating, feedbackText: text, feedbackTags: selectedTags });
      }
    } catch (e) {
      console.error("Feedback save error:", e);
    }
    setSaving(false);
  };

  const D = {
    purple: "#7950F2",
    purpleLight: "#A78BFA",
    text: "#fff",
    text2: "rgba(255,255,255,0.65)",
    text3: "rgba(255,255,255,0.4)",
    border: "rgba(255,255,255,0.08)",
  };

  return (
    <div style={{ background: "rgba(121,80,242,0.04)", border: "0.5px solid rgba(121,80,242,0.15)", borderRadius: 10, padding: "14px 16px" }}>
      <div style={{ fontSize: 11, fontWeight: 500, color: D.purpleLight, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
        {en ? "Rate this piece" : "Califica esta pieza"}
      </div>

      {/* Stars */}
      <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => { setRating(star); if (saved) setSaved(false); }}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            style={{
              background: "none", border: "none", cursor: "pointer", padding: 2,
              fontSize: 22, lineHeight: 1,
              color: star <= (hoverRating || rating) ? "#FBBF24" : "rgba(255,255,255,0.15)",
              transition: "color 0.15s, transform 0.1s",
              transform: star <= hoverRating ? "scale(1.15)" : "scale(1)",
            }}
          >
            ★
          </button>
        ))}
        {rating > 0 && (
          <span style={{ fontSize: 11, color: D.text3, alignSelf: "center", marginLeft: 6 }}>
            {rating <= 2 ? (en ? "Needs work" : "Necesita mejoras") : rating <= 3 ? "OK" : rating === 4 ? (en ? "Good" : "Buena") : (en ? "Excellent!" : "¡Excelente!")}
          </span>
        )}
      </div>

      {/* Tags */}
      {rating > 0 && (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
            {tags.map(tag => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  style={{
                    padding: "4px 10px", borderRadius: 12, fontSize: 10.5, fontWeight: 400,
                    border: active ? "0.5px solid rgba(121,80,242,0.4)" : "0.5px solid rgba(255,255,255,0.1)",
                    background: active ? "rgba(121,80,242,0.15)" : "transparent",
                    color: active ? D.purpleLight : D.text3,
                    cursor: "pointer", transition: "all 0.15s",
                  }}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          {/* Free text */}
          <textarea
            value={text}
            onChange={e => { setText(e.target.value); if (saved) setSaved(false); }}
            placeholder={en ? "What would you change? (optional)" : "¿Qué cambiarías? (opcional)"}
            rows={2}
            style={{
              width: "100%", resize: "vertical",
              background: "rgba(255,255,255,0.02)", border: "0.5px solid " + D.border,
              borderRadius: 7, padding: "8px 10px", fontSize: 11.5, color: D.text,
              outline: "none", fontFamily: "inherit", marginBottom: 10,
            }}
            onFocus={e => e.target.style.borderColor = D.purple}
            onBlur={e => e.target.style.borderColor = D.border}
          />

          {/* Save button */}
          <button
            type="button"
            onClick={save}
            disabled={saving || saved}
            style={{
              width: "100%", padding: 9,
              background: saved ? "rgba(64,192,87,0.12)" : D.purple,
              color: saved ? "#40C057" : "#fff",
              border: saved ? "1px solid rgba(64,192,87,0.3)" : "none",
              borderRadius: 8, fontSize: 12, fontWeight: 500,
              cursor: saving || saved ? "default" : "pointer",
              transition: "all 0.2s",
            }}
          >
            {saving ? (en ? "Saving..." : "Guardando...") : saved ? (en ? "✓ Feedback saved — we'll learn from this" : "✓ Feedback guardado — aprenderemos de esto") : (en ? "Save feedback" : "Guardar feedback")}
          </button>
        </>
      )}
    </div>
  );
}
