import { ImageResponse } from "next/og"

export const size = { width: 32, height: 32 }
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
          borderRadius: "6px",
        }}
      >
        <svg
          width="24"
          height="24"
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
