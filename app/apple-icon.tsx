import { ImageResponse } from "next/og"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 50%, #6D28D9 100%)",
          borderRadius: "37px",
        }}
      >
        <svg
          width="120"
          height="120"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="15" y="30" width="16" height="42" fill="white" opacity="0.75" rx="2" />
          <rect x="31" y="18" width="16" height="54" fill="white" rx="2" />
          <rect x="47" y="35" width="16" height="37" fill="white" opacity="0.9" rx="2" />
          <rect x="63" y="24" width="16" height="48" fill="white" opacity="0.8" rx="2" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}
