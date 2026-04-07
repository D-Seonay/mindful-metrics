import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
 
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'
 
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: '#09090b', // zinc-950
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '20%',
          border: '1px solid #27272a', // zinc-800
        }}
      >
        <div style={{
          width: '14px',
          height: '14px',
          background: '#3b82f6', // blue-500
          borderRadius: '50%',
          boxShadow: '0 0 10px #3b82f6',
        }} />
      </div>
    ),
    {
      ...size,
    }
  )
}
