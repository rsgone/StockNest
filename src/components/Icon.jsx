const PATHS = {
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" />
    </>
  ),
  sort: <path d="M7 3v18M7 3L3 7M7 3l4 4M17 21V3M17 21l4-4M17 21l-4-4" />,
  edit: <path d="M4 20h4L20 8a2.83 2.83 0 00-4-4L4 16v4z" />,
  trash: <path d="M4 7h16M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2m2 0v13a2 2 0 01-2 2H9a2 2 0 01-2-2V7h10z" />,
  home: (
    <>
      <path d="M4 10.5L12 4l8 6.5" />
      <path d="M6 9v10a1 1 0 001 1h4v-6h2v6h4a1 1 0 001-1V9" />
    </>
  ),
  bag: (
    <>
      <path d="M6 8h12l-1 13H7L6 8z" />
      <path d="M9 8V6a3 3 0 016 0v2" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  filter: <path d="M4 5h16l-6 8v6l-4-2v-4z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  settings: (
    <>
      <path d="M4 7h16M4 12h10M4 17h13" />
      <circle cx="16" cy="7" r="2" fill="#fff" />
      <circle cx="9" cy="12" r="2" fill="#fff" />
      <circle cx="17" cy="17" r="2" fill="#fff" />
    </>
  ),
}

export default function Icon({ name, size = 20, className }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  )
}
