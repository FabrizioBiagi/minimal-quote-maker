import { forwardRef } from "react";

interface QuoteCardProps {
  profileImage: string | null;
  name: string;
  username: string;
  quote: string;
  aspectRatio: "square" | "vertical";
  isBold: boolean;
  isItalic: boolean;
  isDarkMode: boolean;
  stats?: {
    comments: string;
    retweets: string;
    likes: string;
    views: string;
  };
}

export const QuoteCard = forwardRef<HTMLDivElement, QuoteCardProps>(
  ({ profileImage, name, username, quote, aspectRatio, isBold, isItalic, isDarkMode, stats }, ref) => {
    const dimensions = aspectRatio === "square" 
      ? { width: "1080px", height: "1080px" }
      : { width: "1080px", height: "1920px" };

    return (
      <div
        ref={ref}
        style={{
          width: dimensions.width,
          height: dimensions.height,
          fontFamily: "Inter, sans-serif",
          position: "relative",
          backgroundColor: isDarkMode ? "#000000" : "#ffffff",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "0",
            right: "0",
            transform: "translateY(-50%)",
            padding: aspectRatio === "square" ? "80px" : "120px",
          }}
        >
          {/* Profile Section */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: "20px", marginBottom: "40px" }}>
            {/* Profile Image */}
            <div
              style={{
                marginTop: "18px",
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                overflow: "hidden",
                backgroundColor: isDarkMode ? "#1a1a1a" : "#f0f0f0",
                flexShrink: 0,
              }}
            >
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: isDarkMode ? "#333333" : "#e0e0e0",
                  color: isDarkMode ? "#999999" : "#999",
                  fontSize: "32px",
                  fontWeight: 600,
                  }}
                >
                  {name ? name[0].toUpperCase() : "?"}
                </div>
              )}
            </div>

            {/* Name and Username */}
            <div>
              <div
                style={{
                  fontSize: "33px",
                  fontWeight: 600,
                  color: isDarkMode ? "#ffffff" : "#000000",
                  marginBottom: "4px",
                }}
              >
                {name || "Tu Nombre"}
              </div>
              <div
                style={{
                  fontSize: "29px",
                  fontWeight: 400,
                  color: isDarkMode ? "#8B98A5" : "#5B7083",
                }}
              >
                @{username || "usuario"}
              </div>
            </div>
          </div>

          {/* Quote Text */}
          <div
            style={{
              fontSize: aspectRatio === "square" ? "49px" : "55px",
              fontWeight: isBold ? 700 : 500,
              fontStyle: isItalic ? "italic" : "normal",
              color: isDarkMode ? "#ffffff" : "#000000",
              lineHeight: "1.4",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {quote || "Escribe tu frase inspiradora aquí..."}
          </div>

          {/* Stats Section */}
          {stats && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "40px",
                marginTop: "70px",
              }}
            >
              {/* Comments */}
              <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={isDarkMode ? "#8B98A5" : "#536471"} strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span style={{ fontSize: "30px", color: isDarkMode ? "#8B98A5" : "#536471" }}>{stats.comments}</span>
              </div>

              {/* Retweets */}
              <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={isDarkMode ? "#8B98A5" : "#536471"} strokeWidth="2">
                  <path d="se M17 1l4 4-4 4" />
                  <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                  <path d="M7 23l-4-4 4-4" />
                  <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                </svg>
                <span style={{ fontSize: "30px", color: isDarkMode ? "#8B98A5" : "#536471" }}>{stats.retweets}</span>
              </div>

              {/* Likes */}
              <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={isDarkMode ? "#8B98A5" : "#536471"} strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <span style={{ fontSize: "30px", color: isDarkMode ? "#8B98A5" : "#536471" }}>{stats.likes}</span>
              </div>

              {/* Views */}
              <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={isDarkMode ? "#8B98A5" : "#536471"} strokeWidth="2">
                  <path d="M18 20V10" />
                  <path d="M12 20V4" />
                  <path d="M6 20v-6" />
                </svg>
                <span style={{ fontSize: "30px", color: isDarkMode ? "#8B98A5" : "#536471" }}>{stats.views}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

QuoteCard.displayName = "QuoteCard";
