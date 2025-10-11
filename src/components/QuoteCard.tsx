import { forwardRef } from "react";

interface QuoteCardProps {
  profileImage: string | null;
  name: string;
  username: string;
  quote: string;
  aspectRatio: "square" | "vertical";
  isBold: boolean;
  isItalic: boolean;
}

export const QuoteCard = forwardRef<HTMLDivElement, QuoteCardProps>(
  ({ profileImage, name, username, quote, aspectRatio, isBold, isItalic }, ref) => {
    const dimensions = aspectRatio === "square" 
      ? { width: "1080px", height: "1080px" }
      : { width: "1080px", height: "1920px" };

    return (
      <div
        ref={ref}
        className="bg-white"
        style={{
          width: dimensions.width,
          height: dimensions.height,
          fontFamily: "Inter, sans-serif",
          position: "relative",
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
          <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "60px" }}>
            {/* Profile Image */}
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                overflow: "hidden",
                backgroundColor: "#f0f0f0",
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
                    backgroundColor: "#e0e0e0",
                    color: "#999",
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
                  fontSize: "28px",
                  fontWeight: 600,
                  color: "#000000",
                  marginBottom: "4px",
                }}
              >
                {name || "Tu Nombre"}
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: 400,
                  color: "#5B7083",
                }}
              >
                @{username || "usuario"}
              </div>
            </div>
          </div>

          {/* Quote Text */}
          <div
            style={{
              fontSize: aspectRatio === "square" ? "42px" : "48px",
              fontWeight: isBold ? 700 : 500,
              fontStyle: isItalic ? "italic" : "normal",
              color: "#000000",
              lineHeight: "1.4",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {quote || "Escribe tu frase inspiradora aquí..."}
          </div>
        </div>
      </div>
    );
  }
);

QuoteCard.displayName = "QuoteCard";
