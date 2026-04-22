export const metadata = {
  title: 'Realistic Flight Sim',
  description: 'Pro GeoFS Clone',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, overflow: 'hidden', background: '#000' }}>
        {children}
      </body>
    </html>
  )
}
