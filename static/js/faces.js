/* Hand-drawn SVG emoji faces, one per emotion plus a neutral "idle" face. */
const FACE_COLORS = {
  idle: "#EDE6D3",
  sadness: "#79B4F0",
  joy: "#FFCB3D",
  love: "#FF8FB5",
  anger: "#FF6A55",
  fear: "#B79CF0",
  surprise: "#4FD6C8",
};

const INK = "#1b1b2f";
const stroke = `stroke="${INK}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"`;
const dot = (x, y, r = 3.6) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${INK}"/>`;
const heart = (x, y) =>
  `<path transform="translate(${x} ${y}) scale(1.05)" d="M0 -3 C-6 -11 -15 -2 0 9 C15 -2 6 -11 0 -3Z" fill="#E5234B" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>`;

const FEATURES = {
  idle: `
    ${dot(36, 44)}${dot(64, 44)}
    <path d="M38 68 H62" fill="none" ${stroke}/>`,
  joy: `
    <path d="M28 46 Q35 34 42 46" fill="none" ${stroke}/>
    <path d="M58 46 Q65 34 72 46" fill="none" ${stroke}/>
    <path d="M26 58 Q50 90 74 58 Z" fill="#fff" ${stroke}/>
    <path d="M36 66 Q50 76 64 66" fill="#FF7A7A" stroke="none"/>`,
  sadness: `
    <path d="M26 38 L42 33" fill="none" ${stroke}/>
    <path d="M74 38 L58 33" fill="none" ${stroke}/>
    ${dot(36, 46)}${dot(64, 46)}
    <path d="M36 72 Q50 58 64 72" fill="none" ${stroke}/>
    <path d="M30 54 Q23 64 30 68 Q37 64 30 54Z" fill="#CFEBFF" ${stroke} stroke-width="2"/>`,
  love: `
    ${heart(36, 44)}${heart(64, 44)}
    <circle cx="25" cy="60" r="6" fill="#FF5E8A" opacity=".45"/>
    <circle cx="75" cy="60" r="6" fill="#FF5E8A" opacity=".45"/>
    <path d="M34 62 Q50 82 66 62" fill="none" ${stroke}/>`,
  anger: `
    <path d="M26 32 L45 42" fill="none" ${stroke} stroke-width="4"/>
    <path d="M74 32 L55 42" fill="none" ${stroke} stroke-width="4"/>
    ${dot(37, 49)}${dot(63, 49)}
    <path d="M35 74 Q50 60 65 74" fill="none" ${stroke}/>
    <path d="M76 16 l4 8 l-8 0 l5 8" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`,
  fear: `
    <path d="M26 30 Q36 24 44 32" fill="none" ${stroke} stroke-width="2.6"/>
    <path d="M74 30 Q64 24 56 32" fill="none" ${stroke} stroke-width="2.6"/>
    <circle cx="36" cy="46" r="9" fill="#fff" ${stroke} stroke-width="2.6"/>
    <circle cx="64" cy="46" r="9" fill="#fff" ${stroke} stroke-width="2.6"/>
    ${dot(37, 48, 3)}${dot(63, 48, 3)}
    <path d="M34 72 Q39 66 44 72 T54 72 T66 72" fill="none" ${stroke}/>
    <path d="M82 28 Q75 38 82 42 Q89 38 82 28Z" fill="#CFEBFF" ${stroke} stroke-width="2"/>`,
  surprise: `
    <path d="M27 28 Q36 20 45 28" fill="none" ${stroke} stroke-width="2.6"/>
    <path d="M55 28 Q64 20 73 28" fill="none" ${stroke} stroke-width="2.6"/>
    <circle cx="36" cy="46" r="8" fill="#fff" ${stroke} stroke-width="2.6"/>
    <circle cx="64" cy="46" r="8" fill="#fff" ${stroke} stroke-width="2.6"/>
    ${dot(36, 46, 3.4)}${dot(64, 46, 3.4)}
    <ellipse cx="50" cy="72" rx="8" ry="10" fill="${INK}"/>`,
};

function faceSVG(emotion) {
  const key = FEATURES[emotion] ? emotion : "idle";
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="46" fill="${FACE_COLORS[key]}" ${stroke}/>
    <path d="M20 30 Q28 14 44 10" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".55"/>
    ${FEATURES[key]}
  </svg>`;
}
