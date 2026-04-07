import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
 
export const size = {
  width: 180,
  height: 180,
}
export const contentType = 'image/png'
 
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: '#09090b',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '22%',
          border: '4px solid #27272a',
        }}
      >
        <div style={{
          width: '80px',
          height: '80px',
          background: '#3b82f6',
          borderRadius: '50%',
          boxShadow: '0 0 40px #3b82f6',
        }} />
      </div>
    ),
    {
      ...size,
    }
  )
}
