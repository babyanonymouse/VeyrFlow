<svg 
  width="256" 
  height="256" 
  viewBox="0 0 100 100" 
  fill="none" 
  xmlns="http://www.w3.org/2000/svg"
>
  <defs>
    <linearGradient id="veyrGradient" x1="20" y1="80" x2="80" y2="20" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#818cf8" />   {/* Indigo-400 */}
      <stop offset="50%" stopColor="#2dd4bf" />  {/* Teal-400 */}
    </linearGradient>
  </defs>

  {/* The Main Vertex Track */}
  <path 
    d="M20 35 L45 80 L80 25" 
    stroke="url(#veyrGradient)" 
    strokeWidth="10" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
  />
  
  {/* The Forward Arrowhead */}
  <path 
    d="M55 25 L80 25 L80 50" 
    stroke="url(#veyrGradient)" 
    strokeWidth="10" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
  />

  {/* The System Nodes */}
  <circle cx="32.5" cy="57.5" r="6" fill="#09090b" stroke="url(#veyrGradient)" strokeWidth="3" />
  <circle cx="62.5" cy="50" r="6" fill="#09090b" stroke="url(#veyrGradient)" strokeWidth="3" />
</svg>