'use client'

export default function LogoBackground() {
  return (
    <>
      {/* Background Logo */}
      <div className="absolute inset-0 opacity-[0.04] flex items-center justify-center pointer-events-none">
        <img 
          src="/images/products/logo.jpg"
          alt="NetApps Development"
          className="object-contain w-[70%] h-[70%] max-w-5xl mx-auto"
        />
      </div>
      
      {/* Decorative Circles */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-blue-400 rounded-full opacity-5 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-green-400 rounded-full opacity-5 blur-3xl pointer-events-none"></div>
    </>
  )
}