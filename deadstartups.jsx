import { useState, useRef, useEffect } from "react";

const FAILED_STARTUPS = [
  { name: "Quibi", year: "2018–2020", raised: "$1.75B", tagline: "Quick bites of premium video", category: "Entertainment", founder: "Jeffrey Katzenberg" },
  { name: "Juicero", year: "2013–2017", raised: "$120M", tagline: "Press-based juice from proprietary packs", category: "Hardware/Food", founder: "Doug Evans" },
  { name: "Theranos", year: "2003–2018", raised: "$700M", tagline: "Revolutionary blood testing", category: "HealthTech", founder: "Elizabeth Holmes" },
  { name: "Vine", year: "2012–2017", raised: "Acquired by Twitter", tagline: "6-second looping videos", category: "Social Media", founder: "Dom Hofmann" },
  { name: "Google+", year: "2011–2019", raised: "Internal Google", tagline: "Google's social network", category: "Social Media", founder: "Vic Gundotra" },
  { name: "MoviePass", year: "2011–2019", raised: "$68M", tagline: "Unlimited movies for $10/mo", category: "Entertainment", founder: "Stacy Spikes" },
  { name: "Jawbone", year: "1999–2017", raised: "$930M", tagline: "Wearable fitness trackers", category: "Hardware", founder: "Alexander Asseily" },
  { name: "Pets.com", year: "1998–2000", raised: "$110M", tagline: "Pet supplies delivered online", category: "E-commerce", founder: "Julie Wainwright" },
  { name: "Wework (OG)", year: "2010–2019 (IPO fail)", raised: "$12.8B", tagline: "Elevate the world's consciousness... with desks", category: "Real Estate", founder: "Adam Neumann" },
  { name: "Clubhouse", year: "2020–2023", raised: "$110M", tagline: "Drop-in audio conversations", category: "Social Media", founder: "Paul Davison" },
  { name: "Yik Yak", year: "2013–2017", raised: "$73.5M", tagline: "Anonymous local social feed", category: "Social Media", founder: "Tyler Droll" },
  { name: "Rdio", year: "2010–2015", raised: "$125M", tagline: "Social music streaming", category: "Music", founder: "Janus Friis" },
];

const SKULL = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="10" r="8"/>
    <circle cx="9" cy="9" r="1.5" fill="currentColor"/>
    <circle cx="15" cy="9" r="1.5" fill="currentColor"/>
    <path d="M9 18v3M12 18v3M15 18v3"/>
    <path d="M8 14c0 0 2 2 4 2s4-2 4-2"/>
  </svg>
);

const BOLT = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
  </svg>
);

const SHARE = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/>
  </svg>
);

const ROAST_RATINGS = ["GENTLE SIMMER", "MEDIUM RARE", "WELL DONE", "EXTRA CRISPY", "THERMONUCLEAR"];

export default function DeadStartups() {
  const [selectedStartup, setSelectedStartup] = useState(null);
  const [roastResult, setRoastResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCard, setShowCard] = useState(false);
  const cardRef = useRef(null);

  const filteredStartups = FAILED_STARTUPS.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function roastStartup(startup) {
    setSelectedStartup(startup);
    setLoading(true);
    setRoastResult(null);
    setShowCard(false);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `You are DeadStartups.ai — a brutally honest, darkly funny startup post-mortem analyst.

Given this failed startup:
- Name: ${startup.name}
- Years active: ${startup.year}
- Money raised: ${startup.raised}
- What they did: ${startup.tagline}
- Category: ${startup.category}
- Founder: ${startup.founder}

Respond ONLY with a JSON object (no markdown, no backticks, no preamble):
{
  "roast": "A 2-3 sentence devastating but witty roast of what went wrong. Be specific, funny, and brutal. Reference actual facts about why they failed.",
  "cause_of_death": "One punchy phrase for how they died, like a death certificate (e.g., 'Death by hubris and juice packets')",
  "burn_rating": A number 1-5 representing how bad the failure was (5 = legendary),
  "rebuild_name": "A catchy name for the AI-rebuilt version",
  "rebuild_pitch": "A 2-sentence pitch for how you'd rebuild this today using AI/modern tech stack. Be specific about which AI tools or approaches you'd use.",
  "rebuild_stack": ["3-4 specific modern technologies or AI tools you'd use"],
  "tombstone_quote": "A funny fake quote that would go on the startup's tombstone"
}`
          }]
        })
      });

      const data = await response.json();
      const text = data.content?.find(b => b.type === "text")?.text || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setRoastResult(parsed);
      setTimeout(() => setShowCard(true), 100);
    } catch (err) {
      console.error(err);
      setRoastResult({
        roast: "Even our AI couldn't process this level of failure. That's saying something.",
        cause_of_death: "Death by technical difficulties",
        burn_rating: 3,
        rebuild_name: startup.name + " 2.0",
        rebuild_pitch: "Step 1: Don't do what they did. Step 2: Use AI. Step 3: Profit.",
        rebuild_stack: ["Claude", "Common Sense", "Actual Revenue"],
        tombstone_quote: "At least we tried... with other people's money."
      });
      setTimeout(() => setShowCard(true), 100);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setSelectedStartup(null);
    setRoastResult(null);
    setShowCard(false);
    setSearchQuery("");
  }

  const burnDots = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{
        display: "inline-block",
        width: 10,
        height: 10,
        borderRadius: "50%",
        background: i < rating
          ? `hsl(${12 - i * 3}, 90%, ${55 - i * 5}%)`
          : "rgba(255,255,255,0.15)",
        marginRight: 4,
        transition: "all 0.3s ease",
        transitionDelay: `${i * 0.1}s`,
      }} />
    ));
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0a",
      color: "#e8e4df",
      fontFamily: "'Courier New', Courier, monospace",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Grain overlay */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 50,
        background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
      }} />

      {/* Scanlines */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 49,
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
      }} />

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 20px", position: "relative", zIndex: 10 }}>
        {/* Header */}
        <header style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(220, 38, 38, 0.15)", border: "1px solid rgba(220, 38, 38, 0.3)",
            padding: "6px 16px", borderRadius: 4, marginBottom: 20,
            fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "#ef4444",
          }}>
            <SKULL /> POST-MORTEM DIVISION
          </div>

          <h1 style={{
            fontSize: "clamp(36px, 7vw, 56px)", fontWeight: 900, lineHeight: 1,
            margin: "0 0 8px 0", letterSpacing: -2,
            fontFamily: "'Courier New', monospace",
          }}>
            <span style={{ color: "#ef4444" }}>DEAD</span>STARTUPS
            <span style={{ color: "#ef4444", fontSize: "0.6em" }}>.ai</span>
          </h1>

          <p style={{
            fontSize: 14, color: "#737373", letterSpacing: 1, margin: 0,
            fontStyle: "italic",
          }}>
            Where failed startups get roasted — then resurrected with AI
          </p>

          <div style={{
            width: 60, height: 1, background: "linear-gradient(90deg, transparent, #ef4444, transparent)",
            margin: "24px auto 0",
          }} />
        </header>

        {/* Main content */}
        {!selectedStartup ? (
          <div>
            {/* Search */}
            <div style={{ position: "relative", marginBottom: 32 }}>
              <input
                type="text"
                placeholder="Search the graveyard..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%", padding: "14px 20px", boxSizing: "border-box",
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 6, color: "#e8e4df", fontSize: 15,
                  fontFamily: "'Courier New', monospace",
                  outline: "none", transition: "border-color 0.2s",
                }}
                onFocus={(e) => e.target.style.borderColor = "rgba(239,68,68,0.5)"}
                onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
              />
            </div>

            {/* Startup grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 12,
            }}>
              {filteredStartups.map((startup, i) => (
                <button
                  key={startup.name}
                  onClick={() => roastStartup(startup)}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 8, padding: "20px 16px",
                    cursor: "pointer", textAlign: "left",
                    transition: "all 0.25s ease",
                    fontFamily: "'Courier New', monospace",
                    color: "#e8e4df",
                    position: "relative", overflow: "hidden",
                    animation: `fadeSlideIn 0.4s ease ${i * 0.05}s both`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(239,68,68,0.08)";
                    e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div style={{
                    position: "absolute", top: 0, right: 0,
                    background: "rgba(239,68,68,0.15)", padding: "3px 10px",
                    borderBottomLeftRadius: 6, fontSize: 10, color: "#ef4444",
                    letterSpacing: 1,
                  }}>
                    RIP
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6, letterSpacing: -0.5 }}>
                    {startup.name}
                  </div>
                  <div style={{ fontSize: 11, color: "#737373", marginBottom: 8, letterSpacing: 0.5 }}>
                    {startup.year}
                  </div>
                  <div style={{
                    fontSize: 11, color: "#ef4444", fontWeight: 600,
                    letterSpacing: 0.5,
                  }}>
                    {startup.raised}
                  </div>
                </button>
              ))}
            </div>

            <div style={{
              textAlign: "center", marginTop: 48, padding: "24px",
              border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 8,
              color: "#525252", fontSize: 13,
            }}>
              More dead startups coming soon. Got a suggestion?<br/>
              <span style={{ color: "#ef4444" }}>Tweet @deadstartups_ai</span>
            </div>
          </div>
        ) : (
          <div>
            {/* Back button */}
            <button
              onClick={reset}
              style={{
                background: "none", border: "1px solid rgba(255,255,255,0.1)",
                color: "#737373", padding: "8px 16px", borderRadius: 4,
                cursor: "pointer", fontFamily: "'Courier New', monospace",
                fontSize: 12, marginBottom: 32, letterSpacing: 1,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#ef4444"; e.currentTarget.style.color = "#ef4444"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#737373"; }}
            >
              ← BACK TO GRAVEYARD
            </button>

            {/* Loading state */}
            {loading && (
              <div style={{ textAlign: "center", padding: "80px 20px" }}>
                <div style={{
                  display: "inline-block", fontSize: 40,
                  animation: "pulse 1.5s ease-in-out infinite",
                }}>
                  <SKULL />
                </div>
                <div style={{
                  marginTop: 24, fontSize: 14, color: "#737373",
                  letterSpacing: 2, textTransform: "uppercase",
                }}>
                  Performing autopsy on {selectedStartup.name}...
                </div>
                <div style={{
                  width: 200, height: 2, background: "rgba(255,255,255,0.05)",
                  margin: "20px auto", borderRadius: 2, overflow: "hidden",
                }}>
                  <div style={{
                    width: "40%", height: "100%",
                    background: "linear-gradient(90deg, #ef4444, #f97316)",
                    animation: "loadSlide 1.2s ease-in-out infinite",
                  }} />
                </div>
              </div>
            )}

            {/* Roast card */}
            {roastResult && (
              <div
                ref={cardRef}
                style={{
                  opacity: showCard ? 1 : 0,
                  transform: showCard ? "translateY(0)" : "translateY(20px)",
                  transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                {/* Death certificate header */}
                <div style={{
                  background: "linear-gradient(135deg, rgba(239,68,68,0.12), rgba(249,115,22,0.08))",
                  border: "1px solid rgba(239,68,68,0.2)",
                  borderRadius: "12px 12px 0 0",
                  padding: "28px 28px 20px",
                }}>
                  <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                    flexWrap: "wrap", gap: 16,
                  }}>
                    <div>
                      <div style={{
                        fontSize: 10, letterSpacing: 3, color: "#ef4444",
                        textTransform: "uppercase", marginBottom: 8,
                      }}>
                        CERTIFICATE OF STARTUP DEATH
                      </div>
                      <h2 style={{
                        fontSize: 32, fontWeight: 900, margin: 0, letterSpacing: -1,
                      }}>
                        {selectedStartup.name}
                      </h2>
                      <div style={{
                        fontSize: 13, color: "#737373", marginTop: 6,
                      }}>
                        {selectedStartup.tagline}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 11, color: "#525252", letterSpacing: 1 }}>
                        {selectedStartup.year}
                      </div>
                      <div style={{
                        fontSize: 20, fontWeight: 800, color: "#ef4444",
                        marginTop: 4,
                      }}>
                        {selectedStartup.raised}
                      </div>
                      <div style={{ fontSize: 10, color: "#525252", marginTop: 2 }}>
                        RAISED & BURNED
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main roast section */}
                <div style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderTop: "none",
                  padding: 28,
                }}>
                  {/* Cause of death */}
                  <div style={{
                    background: "rgba(0,0,0,0.3)", borderRadius: 8,
                    padding: "16px 20px", marginBottom: 24,
                    borderLeft: "3px solid #ef4444",
                  }}>
                    <div style={{
                      fontSize: 10, letterSpacing: 2, color: "#ef4444",
                      textTransform: "uppercase", marginBottom: 6,
                    }}>
                      CAUSE OF DEATH
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.4 }}>
                      {roastResult.cause_of_death}
                    </div>
                  </div>

                  {/* The roast */}
                  <div style={{ marginBottom: 24 }}>
                    <div style={{
                      fontSize: 10, letterSpacing: 2, color: "#737373",
                      textTransform: "uppercase", marginBottom: 10,
                      display: "flex", alignItems: "center", gap: 8,
                    }}>
                      <SKULL /> THE ROAST
                    </div>
                    <p style={{
                      fontSize: 15, lineHeight: 1.7, margin: 0, color: "#d4d0ca",
                      fontStyle: "italic",
                    }}>
                      "{roastResult.roast}"
                    </p>
                  </div>

                  {/* Burn rating */}
                  <div style={{
                    display: "flex", alignItems: "center", gap: 16,
                    marginBottom: 24, flexWrap: "wrap",
                  }}>
                    <div style={{
                      fontSize: 10, letterSpacing: 2, color: "#737373",
                      textTransform: "uppercase",
                    }}>
                      BURN RATING
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      {burnDots(roastResult.burn_rating)}
                    </div>
                    <div style={{
                      fontSize: 11, color: "#ef4444", fontWeight: 700,
                      letterSpacing: 1,
                    }}>
                      {ROAST_RATINGS[Math.min(roastResult.burn_rating - 1, 4)]}
                    </div>
                  </div>

                  {/* Tombstone quote */}
                  <div style={{
                    textAlign: "center", padding: "20px 24px",
                    background: "rgba(0,0,0,0.4)", borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}>
                    <div style={{
                      fontSize: 28, color: "#525252", lineHeight: 1, marginBottom: 8,
                    }}>⚰️</div>
                    <div style={{
                      fontSize: 13, color: "#a3a3a3", fontStyle: "italic",
                      lineHeight: 1.5,
                    }}>
                      "{roastResult.tombstone_quote}"
                    </div>
                    <div style={{
                      width: 40, height: 1,
                      background: "rgba(255,255,255,0.1)",
                      margin: "12px auto 0",
                    }} />
                  </div>
                </div>

                {/* Rebuild section */}
                <div style={{
                  background: "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(16,185,129,0.05))",
                  border: "1px solid rgba(34,197,94,0.15)",
                  borderTop: "none",
                  borderRadius: "0 0 12px 12px",
                  padding: 28,
                }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    fontSize: 10, letterSpacing: 3, color: "#22c55e",
                    textTransform: "uppercase", marginBottom: 16,
                  }}>
                    <BOLT /> AI RESURRECTION PLAN
                  </div>

                  <h3 style={{
                    fontSize: 22, fontWeight: 800, margin: "0 0 8px 0",
                    color: "#22c55e", letterSpacing: -0.5,
                  }}>
                    {roastResult.rebuild_name}
                  </h3>

                  <p style={{
                    fontSize: 14, lineHeight: 1.7, color: "#d4d0ca",
                    margin: "0 0 20px 0",
                  }}>
                    {roastResult.rebuild_pitch}
                  </p>

                  <div style={{
                    display: "flex", flexWrap: "wrap", gap: 8,
                  }}>
                    {roastResult.rebuild_stack?.map((tech, i) => (
                      <span key={i} style={{
                        background: "rgba(34,197,94,0.1)",
                        border: "1px solid rgba(34,197,94,0.2)",
                        padding: "5px 12px", borderRadius: 4,
                        fontSize: 11, color: "#22c55e",
                        letterSpacing: 0.5, fontWeight: 600,
                      }}>
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{
                  display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap",
                }}>
                  <button
                    onClick={reset}
                    style={{
                      flex: 1, minWidth: 140,
                      background: "rgba(239,68,68,0.1)",
                      border: "1px solid rgba(239,68,68,0.3)",
                      color: "#ef4444", padding: "14px 20px",
                      borderRadius: 8, cursor: "pointer",
                      fontFamily: "'Courier New', monospace",
                      fontSize: 13, fontWeight: 700,
                      letterSpacing: 1, textTransform: "uppercase",
                      transition: "all 0.2s",
                      display: "flex", alignItems: "center",
                      justifyContent: "center", gap: 8,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(239,68,68,0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(239,68,68,0.1)";
                    }}
                  >
                    <SKULL /> ROAST ANOTHER
                  </button>
                  <button
                    onClick={() => {
                      const text = `💀 ${selectedStartup.name} got roasted on DeadStartups.ai\n\nCause of death: ${roastResult.cause_of_death}\n\nAI Rebuild: ${roastResult.rebuild_name} — ${roastResult.rebuild_pitch}\n\nGet your startup roasted → deadstartups.ai`;
                      navigator.clipboard?.writeText(text);
                      alert("Copied to clipboard! Share it everywhere.");
                    }}
                    style={{
                      flex: 1, minWidth: 140,
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "#e8e4df", padding: "14px 20px",
                      borderRadius: 8, cursor: "pointer",
                      fontFamily: "'Courier New', monospace",
                      fontSize: 13, fontWeight: 700,
                      letterSpacing: 1, textTransform: "uppercase",
                      transition: "all 0.2s",
                      display: "flex", alignItems: "center",
                      justifyContent: "center", gap: 8,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    }}
                  >
                    <SHARE /> SHARE ROAST
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <footer style={{
          textAlign: "center", marginTop: 64, paddingTop: 24,
          borderTop: "1px solid rgba(255,255,255,0.05)",
          fontSize: 11, color: "#404040", letterSpacing: 1,
        }}>
          DEADSTARTUPS.AI — HONORING THE FALLEN SINCE 2025
        </footer>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes loadSlide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(350%); }
        }
        ::selection {
          background: rgba(239, 68, 68, 0.3);
          color: #fff;
        }
        input::placeholder {
          color: #525252;
        }
      `}</style>
    </div>
  );
}
