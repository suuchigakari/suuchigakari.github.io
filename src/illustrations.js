/**
 * 商品の種類ごとのイラスト（自前の SVG）。
 *
 * 商品画像は PA-API か公式ウィジェット経由でしか使えないため、商品そのものの絵ではなく
 * 「種類」の図を描く。実物の形・色・ロゴは写さない。記事には「図は種類のイメージ」と書く。
 * 素材の色（アルミの銀、樹脂の白など）と陰影で描く。陰影の定義は illustrationDefs() でページに1回だけ置く。
 */

/** 図で共通に使う陰影（グラデーション）。ページに1回だけ埋め込む。 */
const GRADIENTS = {
  shadow: '<radialGradient id="il-shadow"><stop offset="0" stop-color="#000" stop-opacity=".22"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>',
  glow: '<radialGradient id="il-glow"><stop offset="0" stop-color="#ffe066" stop-opacity=".55"/><stop offset="1" stop-color="#ffe066" stop-opacity="0"/></radialGradient>',
  alu: '<linearGradient id="il-alu" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8d959e"/><stop offset=".35" stop-color="#eef1f4"/><stop offset=".6" stop-color="#c3c9cf"/><stop offset="1" stop-color="#7c848d"/></linearGradient>',
  aluV: '<linearGradient id="il-aluV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1f3f5"/><stop offset=".5" stop-color="#ced4da"/><stop offset="1" stop-color="#868e96"/></linearGradient>',
  white: '<linearGradient id="il-white" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#eceff1"/><stop offset="1" stop-color="#bcc3c9"/></linearGradient>',
  black: '<linearGradient id="il-black" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5c636b"/><stop offset="1" stop-color="#212529"/></linearGradient>',
  gray: '<linearGradient id="il-gray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dee2e6"/><stop offset="1" stop-color="#868e96"/></linearGradient>',
  yellow: '<linearGradient id="il-yellow" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff59a"/><stop offset=".45" stop-color="#ffd43b"/><stop offset="1" stop-color="#e0a800"/></linearGradient>',
  yellowV: '<linearGradient id="il-yellowV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe066"/><stop offset="1" stop-color="#d49a00"/></linearGradient>',
  blue: '<linearGradient id="il-blue" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4dabf7"/><stop offset="1" stop-color="#1864ab"/></linearGradient>',
  navy: '<linearGradient id="il-navy" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3b5b85"/><stop offset="1" stop-color="#14263d"/></linearGradient>',
  teal: '<linearGradient id="il-teal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4dd4e8"/><stop offset="1" stop-color="#0b7285"/></linearGradient>',
  red: '<linearGradient id="il-red" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff8787"/><stop offset="1" stop-color="#c92a2a"/></linearGradient>',
  orange: '<linearGradient id="il-orange" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffa94d"/><stop offset="1" stop-color="#e8590c"/></linearGradient>',
  green: '<linearGradient id="il-green" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a9a5b"/><stop offset="1" stop-color="#4b5a2a"/></linearGradient>',
  pink: '<linearGradient id="il-pink" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fcc2d7"/><stop offset="1" stop-color="#e64980"/></linearGradient>',
  wood: '<linearGradient id="il-wood" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f3d9b1"/><stop offset=".5" stop-color="#e2b77d"/><stop offset="1" stop-color="#c18a4a"/></linearGradient>',
  glass: '<linearGradient id="il-glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e7f5ff" stop-opacity=".95"/><stop offset=".5" stop-color="#d0ebff" stop-opacity=".7"/><stop offset="1" stop-color="#a5d8ff" stop-opacity=".85"/></linearGradient>',
  mirror: '<linearGradient id="il-mirror" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f8f9fa"/><stop offset=".45" stop-color="#d0ebff"/><stop offset=".55" stop-color="#e7f5ff"/><stop offset="1" stop-color="#a5b4c3"/></linearGradient>',
  lamp: '<linearGradient id="il-lamp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffdf0"/><stop offset="1" stop-color="#ffe8a3"/></linearGradient>',
  amber: '<linearGradient id="il-amber" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe8a3"/><stop offset="1" stop-color="#f0a92e"/></linearGradient>',
  screen: '<linearGradient id="il-screen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4c6ef5"/><stop offset="1" stop-color="#1b2a6b"/></linearGradient>',
};

/** 陰影の定義をまとめた、表示しない SVG。ページの body の先頭に1回だけ置く。 */
export function illustrationDefs() {
  return `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>${Object.values(GRADIENTS).join('')}</defs></svg>`;
}

const SHADOW = (cy = 112, rx = 52) => `<ellipse cx="64" cy="${cy}" rx="${rx}" ry="6" fill="url(#il-shadow)"/>`;
const LADDER = (top) =>
  `${SHADOW(118, 50)}<path d="M76 20 100 116h-5L72 22z" fill="#9aa1a8"/><path d="M50 20 26 116h7l22-94z" fill="url(#il-alu)" stroke="#6b737b" stroke-width=".8"/><path d="M76 20l24 96h-7L71 22z" fill="url(#il-alu)" stroke="#6b737b" stroke-width=".8"/><g fill="url(#il-alu)" stroke="#6b737b" stroke-width=".8"><rect x="43" y="44" width="42" height="6" rx="1"/><rect x="37" y="68" width="54" height="6" rx="1"/><rect x="31" y="92" width="66" height="6" rx="1"/></g><rect x="44" y="12" width="40" height="10" rx="2" fill="url(#il-black)"/><rect x="46" y="13" width="36" height="2" rx="1" fill="#fff" opacity=".25"/><rect x="24" y="112" width="11" height="5" rx="2" fill="#333"/><rect x="92" y="112" width="11" height="5" rx="2" fill="#333"/>${top}`;

/** 128×128 の図。素材の色と陰影で描き、ロゴや商品名は入れない。 */
export const ILLUSTRATIONS = {
  sneaker:
    `${SHADOW(110, 58)}<path d="M10 96c0-12 6-20 16-24l10-34c1-3 3-4 6-4h18c3 0 4 2 5 4l4 14c12 2 22 6 32 12 12 4 22 10 24 20v6H10z" fill="url(#il-navy)" stroke="#14263d" stroke-width="1.2"/><path d="M92 70c12 4 22 10 24 20v6H86c-2-10 0-20 6-26z" fill="url(#il-black)"/><path d="M36 34h10l-4 14h-9z" fill="url(#il-orange)"/><path d="M48 48l12 4M46 56l13 4M44 64l14 4" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/><path d="M18 84h56" stroke="#ced4da" stroke-width="3"/><path d="M8 96h112c2 0 3 2 3 4v4c0 2-2 4-4 4H10c-2 0-3-2-3-4v-4c0-2 0-4 1-4z" fill="url(#il-white)" stroke="#9aa3ab"/><path d="M14 104h100" stroke="#adb5bd" stroke-width="1.5"/>`,
  helmet:
    `${SHADOW(104)}<path d="M18 86c0-30 20-52 46-52s46 22 46 52z" fill="url(#il-yellow)" stroke="#b78a00" stroke-width="1.5"/><path d="M56 35c2-1 14-1 16 0l3 51H53z" fill="#ffe680" stroke="#c99a00" stroke-width="1.2"/><path d="M32 60c6-14 16-20 24-22-6 6-12 14-14 26z" fill="#fff" opacity=".55"/><path d="M8 86h112c2 0 3 2 2 4l-4 6H10l-4-6c-1-2 0-4 2-4z" fill="url(#il-yellowV)" stroke="#a87b00" stroke-width="1.5"/><path d="M30 96c4 4 10 6 16 6M98 96c-4 4-10 6-16 6" stroke="#555" stroke-width="2" fill="none"/>`,
  glasses:
    `${SHADOW(98, 50)}<path d="M8 44 2 38M120 44l6-6" stroke="#343a40" stroke-width="4" stroke-linecap="round"/><path d="M10 44c18-6 90-6 108 0l-4 20c-2 12-14 20-26 20-10 0-16-6-20-14-2-4-6-4-8 0-4 8-10 14-20 14-12 0-24-8-26-20z" fill="url(#il-glass)" stroke="#495057" stroke-width="2"/><path d="M8 42c20-8 92-8 112 0l-1 6c-20-6-90-6-110 0z" fill="url(#il-black)"/><path d="M56 66c2-6 14-6 16 0" stroke="#495057" fill="none" stroke-width="2"/><path d="M20 54c8-3 18-3 26-1M82 53c8-2 18-2 26 1" stroke="#fff" stroke-width="3" opacity=".75" stroke-linecap="round" fill="none"/>`,
  mask:
    `${SHADOW(112, 44)}<path d="M20 50C8 40 8 30 14 24M108 50c12-10 12-20 6-26M22 78C10 86 8 94 12 100M106 78c12 8 14 16 10 22" stroke="#e8590c" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M22 46c8-18 24-26 42-26s34 8 42 26c4 14 2 30-8 42-10 10-22 14-34 14s-24-4-34-14c-10-12-12-28-8-42z" fill="url(#il-white)" stroke="#adb5bd" stroke-width="1.5"/><path d="M38 36c17-7 35-7 52 0" stroke="#dee2e6" fill="none" stroke-width="2"/><path d="M48 30c10-4 22-4 32 0" stroke="#adb5bd" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="64" cy="70" r="15" fill="url(#il-gray)" stroke="#495057" stroke-width="1.5"/><circle cx="64" cy="70" r="9" fill="url(#il-black)"/><path d="M58 70h12M64 64v12" stroke="#868e96" stroke-width="1.5"/>`,
  stepladder: LADDER(''),
  'ladder-combo': LADDER('<rect x="42" y="18" width="8" height="8" rx="1.5" fill="url(#il-orange)"/><rect x="78" y="18" width="8" height="8" rx="1.5" fill="url(#il-orange)"/>'),
  'step-stool':
    `${SHADOW(118, 50)}<path d="M86 30l14 82h-5L82 32z" fill="#9aa1a8"/><path d="M40 12h48v18" fill="none" stroke="#adb5bd" stroke-width="6" stroke-linejoin="round"/><path d="M40 12v18" stroke="#adb5bd" stroke-width="6"/><rect x="54" y="7" width="20" height="9" rx="3" fill="url(#il-black)"/><path d="M38 30 30 112h7l7-82z" fill="url(#il-alu)" stroke="#6b737b" stroke-width=".8"/><path d="M84 30l4 82h7l-5-82z" fill="url(#il-alu)" stroke="#6b737b" stroke-width=".8"/><g fill="url(#il-aluV)" stroke="#6b737b" stroke-width=".8"><rect x="34" y="44" width="58" height="8" rx="2"/><rect x="32" y="70" width="62" height="8" rx="2"/><rect x="30" y="96" width="66" height="8" rx="2"/></g><rect x="28" y="110" width="11" height="5" rx="2" fill="#333"/><rect x="86" y="110" width="11" height="5" rx="2" fill="#333"/>`,
  tube:
    `${SHADOW(92, 56)}<path d="M8 46h70l14 8v20l-14 8H8l6-18z" fill="url(#il-white)" stroke="#9aa3ab" stroke-width="1.2"/><path d="M11 48v32M15 48v32" stroke="#ced4da" stroke-width="1.5"/><path d="M26 50h40v28H26z" fill="url(#il-blue)"/><rect x="31" y="58" width="26" height="3" rx="1" fill="#fff" opacity=".9"/><rect x="31" y="65" width="18" height="3" rx="1" fill="#fff" opacity=".7"/><rect x="92" y="56" width="8" height="16" fill="url(#il-aluV)"/><rect x="100" y="52" width="20" height="24" rx="3" fill="url(#il-red)" stroke="#a61e1e"/><path d="M106 54v20M112 54v20" stroke="#fff" opacity=".35" stroke-width="1.5"/><rect x="10" y="49" width="66" height="3" rx="1.5" fill="#fff" opacity=".8"/>`,
  cartridge:
    `${SHADOW(92, 54)}<rect x="8" y="48" width="78" height="38" rx="5" fill="url(#il-white)" stroke="#9aa3ab" stroke-width="1.2"/><rect x="24" y="52" width="46" height="30" fill="url(#il-blue)"/><rect x="28" y="60" width="30" height="3" rx="1" fill="#fff" opacity=".9"/><rect x="28" y="67" width="20" height="3" rx="1" fill="#fff" opacity=".7"/><rect x="10" y="51" width="74" height="4" rx="2" fill="#fff" opacity=".8"/><path d="M86 56h8v22h-8z" fill="url(#il-aluV)" stroke="#9aa3ab"/><path d="M94 60l28 3.5v3L94 74z" fill="url(#il-aluV)" stroke="#9aa3ab"/><rect x="4" y="52" width="5" height="30" rx="2" fill="#ced4da" stroke="#9aa3ab"/>`,
  'twin-tube':
    `${SHADOW(118, 30)}<rect x="36" y="14" width="56" height="8" rx="3" fill="url(#il-blue)"/><rect x="47" y="22" width="6" height="12" fill="#339af0"/><rect x="75" y="22" width="6" height="12" fill="#339af0"/><rect x="38" y="32" width="24" height="62" rx="4" fill="url(#il-glass)" stroke="#868e96"/><rect x="41" y="44" width="18" height="48" rx="3" fill="#f1f3f5"/><rect x="66" y="32" width="24" height="62" rx="4" fill="url(#il-glass)" stroke="#868e96"/><rect x="69" y="44" width="18" height="48" rx="3" fill="url(#il-amber)"/><path d="M40 94h48l-8 10H48z" fill="url(#il-gray)" stroke="#868e96"/><rect x="60" y="104" width="8" height="12" rx="2" fill="url(#il-gray)" stroke="#868e96"/><rect x="41" y="36" width="3" height="54" rx="1.5" fill="#fff" opacity=".6"/>`,
  bottle:
    `${SHADOW(114, 30)}<path d="M60 6h8l3 22H57z" fill="url(#il-aluV)" stroke="#868e96"/><rect x="50" y="26" width="28" height="14" rx="3" fill="url(#il-red)" stroke="#a61e1e"/><path d="M42 40h44c4 0 6 3 6 6v56c0 5-4 8-8 8H44c-4 0-8-3-8-8V46c0-3 2-6 6-6z" fill="url(#il-white)" stroke="#9aa3ab" stroke-width="1.2"/><rect x="42" y="58" width="44" height="30" fill="url(#il-yellowV)"/><rect x="48" y="66" width="24" height="3" rx="1" fill="#fff" opacity=".9"/><rect x="48" y="73" width="16" height="3" rx="1" fill="#fff" opacity=".7"/><rect x="40" y="44" width="4" height="60" rx="2" fill="#fff" opacity=".8"/>`,
  'pressure-cooker':
    `${SHADOW(112)}<rect x="2" y="56" width="18" height="6" rx="3" fill="url(#il-black)"/><path d="M22 60h76v34c0 8-6 14-14 14H36c-8 0-14-6-14-14z" fill="url(#il-alu)" stroke="#6b737b"/><path d="M18 52c0-8 20-14 46-14s46 6 46 14v8H18z" fill="url(#il-aluV)" stroke="#6b737b"/><rect x="100" y="47" width="26" height="9" rx="4.5" fill="url(#il-black)"/><rect x="58" y="28" width="12" height="10" rx="2" fill="url(#il-black)"/><circle cx="64" cy="25" r="4" fill="#fa5252"/><rect x="30" y="64" width="6" height="36" rx="3" fill="#fff" opacity=".55"/>`,
  'cutting-board':
    `${SHADOW(110, 56)}<path d="M10 74v7l52 24v-7zM62 98v7l60-32v-7z" fill="#c48a49"/><path d="M10 74 70 44l52 22-60 32z" fill="url(#il-wood)" stroke="#a9773c"/><path d="M28 72l50-24M40 78l50-24M52 84l46-22" stroke="#d4a56a" stroke-width="1.5" fill="none"/><ellipse cx="104" cy="66" rx="5" ry="3" fill="#8a5a2b"/>`,
  container:
    `${SHADOW(112)}<path d="M18 54h92l-4 46c0 4-3 6-6 6H28c-3 0-6-2-6-6z" fill="url(#il-glass)" stroke="#868e96" stroke-width="1.2"/><rect x="14" y="42" width="100" height="14" rx="4" fill="url(#il-blue)" stroke="#1864ab"/><rect x="20" y="54" width="14" height="12" rx="2" fill="#339af0"/><rect x="94" y="54" width="14" height="12" rx="2" fill="#339af0"/><rect x="28" y="62" width="5" height="38" rx="2.5" fill="#fff" opacity=".7"/><rect x="18" y="44" width="92" height="3" rx="1.5" fill="#fff" opacity=".35"/>`,
  'kitchen-scale':
    `${SHADOW(104)}<rect x="12" y="62" width="104" height="34" rx="10" fill="url(#il-white)" stroke="#adb5bd" stroke-width="1.2"/><rect x="18" y="54" width="92" height="12" rx="6" fill="url(#il-aluV)" stroke="#868e96"/><rect x="40" y="73" width="48" height="16" rx="3" fill="#212529"/><text x="64" y="85" text-anchor="middle" font-size="11" fill="#8ce99a" font-family="monospace">0.0 g</text><circle cx="98" cy="81" r="4" fill="url(#il-gray)"/><circle cx="28" cy="81" r="4" fill="url(#il-gray)"/>`,
  cooler:
    `${SHADOW(114)}<path d="M30 38c0-16 68-16 68 0" fill="none" stroke="#495057" stroke-width="5" stroke-linecap="round"/><rect x="14" y="48" width="100" height="62" rx="8" fill="url(#il-white)" stroke="#adb5bd" stroke-width="1.2"/><rect x="10" y="38" width="108" height="16" rx="5" fill="url(#il-teal)" stroke="#0b6b7c" stroke-width="1.2"/><rect x="14" y="40" width="100" height="4" rx="2" fill="#fff" opacity=".35"/><rect x="44" y="70" width="40" height="8" rx="3" fill="#e9ecef" stroke="#adb5bd"/><rect x="18" y="52" width="6" height="54" rx="3" fill="#fff" opacity=".6"/>`,
  jug:
    `${SHADOW(114)}<path d="M44 30c0-12 32-12 32 0" stroke="#495057" stroke-width="6" fill="none" stroke-linecap="round"/><rect x="24" y="30" width="72" height="80" rx="10" fill="url(#il-white)" stroke="#adb5bd" stroke-width="1.2"/><rect x="74" y="20" width="14" height="10" rx="2" fill="url(#il-blue)"/><rect x="32" y="48" width="8" height="54" rx="4" fill="#a5d8ff" opacity=".8"/><rect x="96" y="88" width="18" height="12" rx="3" fill="url(#il-blue)" stroke="#1864ab"/><rect x="104" y="80" width="6" height="8" rx="2" fill="url(#il-gray)"/><rect x="28" y="36" width="64" height="4" rx="2" fill="#fff" opacity=".7"/>`,
  chair:
    `${SHADOW(116)}<path d="M30 84 20 112M98 84l10 28M30 84l72 28M98 84 26 112" stroke="#343a40" stroke-width="4" stroke-linecap="round"/><path d="M34 22 30 68M94 22l4 46" stroke="#343a40" stroke-width="4" stroke-linecap="round"/><path d="M34 20h60l-4 50H38z" fill="url(#il-green)" stroke="#2b3a1c"/><path d="M24 66h80l-8 18H32z" fill="url(#il-green)" stroke="#2b3a1c"/><path d="M40 28h48" stroke="#fff" opacity=".25" stroke-width="3"/><rect x="12" y="56" width="24" height="7" rx="3.5" fill="url(#il-wood)"/><rect x="92" y="56" width="24" height="7" rx="3.5" fill="url(#il-wood)"/>`,
  table:
    `${SHADOW(114, 56)}<path d="M20 54 36 110M108 54 92 110M36 54l-16 56M92 54l16 56" stroke="#adb5bd" stroke-width="4" stroke-linecap="round"/><path d="M28 82h72" stroke="#868e96" stroke-width="3"/><rect x="6" y="42" width="116" height="12" rx="2" fill="url(#il-wood)" stroke="#a9773c"/><path d="M30 42v12M54 42v12M78 42v12M102 42v12" stroke="#c18a4a" stroke-width="1.5"/><rect x="8" y="43" width="112" height="2" fill="#fff" opacity=".35"/>`,
  'sleeping-bag':
    `${SHADOW(118, 34)}<path d="M44 14c8-6 32-6 40 0 8 6 10 18 8 30l-6 60c-1 6-6 10-12 10H54c-6 0-11-4-12-10l-6-60c-2-12 0-24 8-30z" fill="url(#il-red)" stroke="#a61e1e" stroke-width="1.2"/><ellipse cx="64" cy="28" rx="16" ry="10" fill="#343a40"/><ellipse cx="64" cy="29" rx="11" ry="6" fill="#868e96"/><path d="M40 50q24 6 48 0M41 64q23 6 46 0M42 78q22 6 44 0M44 92q20 6 40 0" stroke="#c92a2a" stroke-width="2" fill="none"/><path d="M80 42l-6 66" stroke="#212529" stroke-width="2" stroke-dasharray="2 2"/><path d="M46 40l2 60" stroke="#fff" opacity=".3" stroke-width="3"/>`,
  lantern:
    `<circle cx="64" cy="60" r="46" fill="url(#il-glow)"/>${SHADOW(112, 34)}<path d="M48 22c0-14 32-14 32 0" stroke="#343a40" stroke-width="4" fill="none"/><rect x="40" y="22" width="48" height="12" rx="4" fill="url(#il-black)"/><rect x="44" y="34" width="40" height="50" rx="8" fill="url(#il-lamp)" stroke="#ced4da"/><rect x="50" y="40" width="5" height="38" rx="2.5" fill="#fff" opacity=".8"/><rect x="38" y="84" width="52" height="22" rx="5" fill="url(#il-black)"/><circle cx="64" cy="95" r="5" fill="url(#il-aluV)"/>`,
  gate:
    `${SHADOW(112, 56)}<rect x="6" y="34" width="8" height="12" rx="2" fill="url(#il-gray)"/><rect x="6" y="90" width="8" height="12" rx="2" fill="url(#il-gray)"/><rect x="114" y="34" width="8" height="12" rx="2" fill="url(#il-gray)"/><rect x="114" y="90" width="8" height="12" rx="2" fill="url(#il-gray)"/><rect x="14" y="26" width="100" height="82" rx="4" fill="none" stroke="#adb5bd" stroke-width="7"/><rect x="14" y="26" width="100" height="82" rx="4" fill="none" stroke="#f8f9fa" stroke-width="4"/><path d="M28 30v74M40 30v74M52 30v74M76 30v74M88 30v74M100 30v74" stroke="#ced4da" stroke-width="4"/><path d="M64 30v74" stroke="#adb5bd" stroke-width="3"/><rect x="58" y="40" width="12" height="16" rx="3" fill="url(#il-gray)" stroke="#868e96"/>`,
  'high-chair':
    `${SHADOW(116, 44)}<path d="M42 72 28 114M86 72l14 42M48 72l-4 42M80 72l4 42M34 98h60" stroke="#adb5bd" stroke-width="4" stroke-linecap="round"/><path d="M42 18h44c2 0 4 2 4 4v42H38V22c0-2 2-4 4-4z" fill="url(#il-white)" stroke="#adb5bd" stroke-width="1.2"/><rect x="44" y="24" width="40" height="34" rx="6" fill="url(#il-pink)"/><rect x="36" y="62" width="56" height="12" rx="4" fill="url(#il-white)" stroke="#adb5bd"/><rect x="26" y="50" width="76" height="8" rx="4" fill="url(#il-teal)"/>`,
  shelf:
    `${SHADOW(114)}<rect x="16" y="18" width="96" height="92" rx="3" fill="url(#il-wood)" stroke="#a9773c" stroke-width="1.2"/><rect x="22" y="24" width="84" height="24" fill="#ecd0a6"/><rect x="22" y="54" width="84" height="22" fill="#ecd0a6"/><rect x="22" y="82" width="84" height="22" fill="#ecd0a6"/><g><rect x="26" y="30" width="10" height="18" fill="url(#il-red)"/><rect x="38" y="28" width="8" height="20" fill="url(#il-blue)"/><rect x="48" y="32" width="12" height="16" fill="url(#il-yellowV)"/><rect x="62" y="29" width="9" height="19" fill="url(#il-green)"/></g><rect x="26" y="58" width="36" height="18" rx="2" fill="url(#il-teal)"/><rect x="66" y="58" width="36" height="18" rx="2" fill="url(#il-pink)"/><rect x="24" y="84" width="38" height="20" rx="3" fill="url(#il-blue)"/><rect x="66" y="84" width="38" height="20" rx="3" fill="url(#il-orange)"/>`,
  'kids-table':
    `${SHADOW(114, 58)}<rect x="12" y="66" width="5" height="44" fill="#d4a56a"/><rect x="66" y="66" width="5" height="44" fill="#d4a56a"/><rect x="6" y="58" width="72" height="9" rx="3" fill="url(#il-wood)" stroke="#a9773c"/><rect x="86" y="84" width="4" height="26" fill="#d4a56a"/><rect x="112" y="84" width="4" height="26" fill="#d4a56a"/><rect x="108" y="40" width="4" height="40" fill="#d4a56a"/><rect x="92" y="40" width="24" height="22" rx="4" fill="url(#il-wood)" stroke="#a9773c"/><rect x="84" y="76" width="34" height="8" rx="2" fill="url(#il-wood)" stroke="#a9773c"/><rect x="8" y="59" width="68" height="2" fill="#fff" opacity=".4"/>`,
  suitcase:
    `${SHADOW(118, 40)}<path d="M50 30V8h28v22" stroke="#868e96" stroke-width="4" fill="none"/><rect x="48" y="4" width="32" height="8" rx="3" fill="url(#il-black)"/><rect x="28" y="28" width="72" height="80" rx="10" fill="url(#il-navy)" stroke="#14263d" stroke-width="1.2"/><path d="M46 34v68M64 34v68M82 34v68" stroke="#fff" opacity=".18" stroke-width="4"/><rect x="32" y="34" width="4" height="66" rx="2" fill="#fff" opacity=".25"/><circle cx="38" cy="112" r="5" fill="#212529"/><circle cx="90" cy="112" r="5" fill="#212529"/>`,
  backpack:
    `${SHADOW(116, 44)}<path d="M54 16c0-8 20-8 20 0" stroke="#343a40" stroke-width="4" fill="none"/><path d="M28 40c0-16 16-26 36-26s36 10 36 26v62c0 6-4 10-10 10H38c-6 0-10-4-10-10z" fill="url(#il-black)" stroke="#212529"/><path d="M38 70h52v30c0 4-3 6-6 6H44c-3 0-6-2-6-6z" fill="#495057" stroke="#212529"/><path d="M40 72h48" stroke="#ced4da" stroke-width="1.5" stroke-dasharray="2 2"/><path d="M36 42c4-14 14-20 28-20" stroke="#fff" opacity=".2" stroke-width="4" fill="none"/><rect x="56" y="80" width="16" height="4" rx="2" fill="url(#il-orange)"/>`,
  'luggage-scale':
    `${SHADOW(118, 30)}<rect x="40" y="10" width="48" height="40" rx="12" fill="url(#il-black)" stroke="#212529"/><rect x="50" y="20" width="28" height="14" rx="2" fill="#c0eb75"/><text x="64" y="31" text-anchor="middle" font-size="10" fill="#2b3a1c" font-family="monospace">0.0</text><circle cx="64" cy="42" r="3" fill="url(#il-aluV)"/><rect x="60" y="50" width="8" height="16" fill="#343a40"/><path d="M64 66c-10 0-12 14-2 16 6 1 8 8 2 10" stroke="#adb5bd" stroke-width="4" fill="none" stroke-linecap="round"/><rect x="44" y="94" width="40" height="18" rx="4" fill="url(#il-orange)"/>`,
  'power-bank':
    `${SHADOW(116, 34)}<rect x="34" y="12" width="60" height="100" rx="10" fill="url(#il-black)" stroke="#212529"/><rect x="38" y="16" width="6" height="90" rx="3" fill="#fff" opacity=".18"/><rect x="54" y="6" width="20" height="6" rx="2" fill="#868e96"/><circle cx="56" cy="92" r="2.5" fill="#51cf66"/><circle cx="64" cy="92" r="2.5" fill="#51cf66"/><circle cx="72" cy="92" r="2.5" fill="#51cf66"/><circle cx="80" cy="92" r="2.5" fill="#495057"/><path d="M68 40l-10 16h10l-8 16" stroke="#adb5bd" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
  mirror:
    `${SHADOW(118, 30)}<path d="M64 108 88 118" stroke="#a9773c" stroke-width="4" stroke-linecap="round"/><rect x="40" y="6" width="48" height="108" rx="3" fill="url(#il-wood)" stroke="#a9773c"/><rect x="45" y="11" width="38" height="98" fill="url(#il-mirror)"/><path d="M50 40 72 14M50 58 80 24" stroke="#fff" stroke-width="4" opacity=".7" stroke-linecap="round"/>`,
  'monitor-arm':
    `<rect x="0" y="104" width="128" height="8" fill="url(#il-wood)"/><rect x="14" y="96" width="14" height="24" rx="2" fill="url(#il-black)"/><rect x="18" y="54" width="6" height="44" fill="url(#il-alu)"/><path d="M21 58 54 46" stroke="#495057" stroke-width="7" stroke-linecap="round"/><path d="M54 46 70 40" stroke="#495057" stroke-width="5" stroke-linecap="round"/><rect x="58" y="12" width="66" height="42" rx="3" fill="url(#il-black)"/><rect x="61" y="15" width="60" height="36" fill="url(#il-screen)"/><path d="M66 46 90 18" stroke="#fff" opacity=".15" stroke-width="6"/>`,
};

/** 記事ごとの既定の図と、仕様から図を選び分ける規則。 */
const BY_ARTICLE = {
  'safety-sneaker': () => 'sneaker',
  'work-helmet': () => 'helmet',
  'safety-glasses': () => 'glasses',
  'dust-mask': () => 'mask',
  stepladder: (specs) => {
    const type = specs?.type ?? '';
    if (/はしご兼用/.test(type)) return 'ladder-combo';
    if (/踏み台|ステップ/.test(type)) return 'step-stool';
    return 'stepladder';
  },
  caulking: (specs) => (/^[^、]*チューブ/.test(specs?.volume ?? '') ? 'tube' : 'cartridge'),
  adhesive: (specs) => {
    const type = specs?.type ?? '';
    if (/2液/.test(type)) return 'twin-tube';
    if (/瞬間/.test(type)) return 'bottle';
    return 'tube';
  },
  'pressure-cooker': () => 'pressure-cooker',
  'cutting-board': () => 'cutting-board',
  'food-container': () => 'container',
  'kitchen-scale': () => 'kitchen-scale',
  'cooler-box': () => 'cooler',
  'water-jug': () => 'jug',
  'outdoor-chair': () => 'chair',
  'outdoor-table': () => 'table',
  'sleeping-bag': () => 'sleeping-bag',
  'led-lantern': () => 'lantern',
  'baby-gate': () => 'gate',
  'baby-high-chair': () => 'high-chair',
  'kids-storage': () => 'shelf',
  'kids-table-chair': () => 'kids-table',
  'lcc-carrycase': () => 'suitcase',
  'lcc-backpack': () => 'backpack',
  'luggage-scale': () => 'luggage-scale',
  'mobile-battery': () => 'power-bank',
  'full-length-mirror': () => 'mirror',
  'monitor-arm': () => 'monitor-arm',
};

/** 記事と商品の仕様から、図の名前を決める。 */
export function illustrationKey(slug, specs) {
  const rule = BY_ARTICLE[slug];
  if (!rule) throw new Error(`イラストが未設定の記事: ${slug}（src/illustrations.js の BY_ARTICLE に足す）`);
  return rule(specs);
}

/** 図を SVG で返す。装飾なので読み上げない。 */
export function illustration(key, size = 56) {
  const body = ILLUSTRATIONS[key];
  if (!body) throw new Error(`未定義のイラスト: ${key}`);
  return `<svg class="ill" width="${size}" height="${size}" viewBox="0 0 128 128" aria-hidden="true">${body}</svg>`;
}
