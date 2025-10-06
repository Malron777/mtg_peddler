export default function ColourPallette() {
  return (
    <div className="mb-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Color Palette</h1>

      {/* Original Colors */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold mb-3">Original Colors</h1>
        <div className="flex">
          <div className="w-20 h-20 flex flex-col items-center justify-center border border-gray-200">
            <div
              className="w-8 h-8 rounded border border-gray-300 mb-1"
              style={{ backgroundColor: "#71984b" }}
            ></div>
            <span className="text-xs text-center px-1">Green</span>
          </div>
          <div className="w-20 h-20 flex flex-col items-center justify-center border border-gray-200">
            <div
              className="w-8 h-8 rounded border border-gray-300 mb-1"
              style={{ backgroundColor: "#624226" }}
            ></div>
            <span className="text-xs text-center px-1">Brown</span>
          </div>
          <div className="w-20 h-20 flex flex-col items-center justify-center border border-gray-200">
            <div
              className="w-8 h-8 rounded border border-gray-300 mb-1"
              style={{ backgroundColor: "#FFFBD5" }}
            ></div>
            <span className="text-xs text-center px-1">White</span>
          </div>
          <div className="w-20 h-20 flex flex-col items-center justify-center border border-gray-200">
            <div
              className="w-8 h-8 rounded border border-gray-300 mb-1"
              style={{ backgroundColor: "#0E68AB" }}
            ></div>
            <span className="text-xs text-center px-1">Blue</span>
          </div>
          <div className="w-20 h-20 flex flex-col items-center justify-center border border-gray-200">
            <div
              className="w-8 h-8 rounded border border-gray-300 mb-1"
              style={{ backgroundColor: "#150B00" }}
            ></div>
            <span className="text-xs text-center px-1">Black</span>
          </div>
          <div className="w-20 h-20 flex flex-col items-center justify-center border border-gray-200">
            <div
              className="w-8 h-8 rounded border border-gray-300 mb-1"
              style={{ backgroundColor: "#D3202A" }}
            ></div>
            <span className="text-xs text-center px-1">Red</span>
          </div>
          <div className="w-20 h-20 flex flex-col items-center justify-center border border-gray-200">
            <div
              className="w-8 h-8 rounded border border-gray-300 mb-1"
              style={{ backgroundColor: "#00733E" }}
            ></div>
            <span className="text-xs text-center px-1">Green Alt</span>
          </div>
        </div>
      </div>

      {/* Olive Palette */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold mb-3">
          Olive Palette (Primary Brand)
        </h1>
        <div className="flex">
          <div className="w-16 h-16 flex flex-col items-center justify-center border border-gray-200">
            <div
              className="w-6 h-6 rounded border border-gray-300 mb-1"
              style={{ backgroundColor: "#f6f7f3" }}
            ></div>
            <span className="text-xs text-center px-1">50</span>
          </div>
          <div className="w-16 h-16 flex flex-col items-center justify-center border border-gray-200">
            <div
              className="w-6 h-6 rounded border border-gray-300 mb-1"
              style={{ backgroundColor: "#e8eadc" }}
            ></div>
            <span className="text-xs text-center px-1">100</span>
          </div>
          <div className="w-16 h-16 flex flex-col items-center justify-center border border-gray-200">
            <div
              className="w-6 h-6 rounded border border-gray-300 mb-1"
              style={{ backgroundColor: "#d4d7c2" }}
            ></div>
            <span className="text-xs text-center px-1">200</span>
          </div>
          <div className="w-16 h-16 flex flex-col items-center justify-center border border-gray-200">
            <div
              className="w-6 h-6 rounded border border-gray-300 mb-1"
              style={{ backgroundColor: "#b3b896" }}
            ></div>
            <span className="text-xs text-center px-1">300</span>
          </div>
          <div className="w-16 h-16 flex flex-col items-center justify-center border border-gray-200">
            <div
              className="w-6 h-6 rounded border border-gray-300 mb-1"
              style={{ backgroundColor: "#94996e" }}
            ></div>
            <span className="text-xs text-center px-1">400*</span>
          </div>
          <div className="w-16 h-16 flex flex-col items-center justify-center border border-gray-200">
            <div
              className="w-6 h-6 rounded border border-gray-300 mb-1"
              style={{ backgroundColor: "#7a8057" }}
            ></div>
            <span className="text-xs text-center px-1">500</span>
          </div>
          <div className="w-16 h-16 flex flex-col items-center justify-center border border-gray-200">
            <div
              className="w-6 h-6 rounded border border-gray-300 mb-1"
              style={{ backgroundColor: "#626745" }}
            ></div>
            <span className="text-xs text-center px-1">600</span>
          </div>
          <div className="w-16 h-16 flex flex-col items-center justify-center border border-gray-200">
            <div
              className="w-6 h-6 rounded border border-gray-300 mb-1"
              style={{ backgroundColor: "#4e5238" }}
            ></div>
            <span className="text-xs text-center px-1">700</span>
          </div>
          <div className="w-16 h-16 flex flex-col items-center justify-center border border-gray-200">
            <div
              className="w-6 h-6 rounded border border-gray-300 mb-1"
              style={{ backgroundColor: "#3f432f" }}
            ></div>
            <span className="text-xs text-center px-1">800</span>
          </div>
          <div className="w-16 h-16 flex flex-col items-center justify-center border border-gray-200">
            <div
              className="w-6 h-6 rounded border border-gray-300 mb-1"
              style={{ backgroundColor: "#353829" }}
            ></div>
            <span className="text-xs text-center px-1">900</span>
          </div>
        </div>
      </div>

      {/* Gold Palette */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold mb-3">Gold Palette (Accent)</h1>
        <div className="flex">
          <div className="w-16 h-16 flex flex-col items-center justify-center border border-gray-200">
            <div
              className="w-6 h-6 rounded border border-gray-300 mb-1"
              style={{ backgroundColor: "#fffef5" }}
            ></div>
            <span className="text-xs text-center px-1">50</span>
          </div>
          <div className="w-16 h-16 flex flex-col items-center justify-center border border-gray-200">
            <div
              className="w-6 h-6 rounded border border-gray-300 mb-1"
              style={{ backgroundColor: "#fff9db" }}
            ></div>
            <span className="text-xs text-center px-1">100</span>
          </div>
          <div className="w-16 h-16 flex flex-col items-center justify-center border border-gray-200">
            <div
              className="w-6 h-6 rounded border border-gray-300 mb-1"
              style={{ backgroundColor: "#ffeeb3" }}
            ></div>
            <span className="text-xs text-center px-1">200</span>
          </div>
          <div className="w-16 h-16 flex flex-col items-center justify-center border border-gray-200">
            <div
              className="w-6 h-6 rounded border border-gray-300 mb-1"
              style={{ backgroundColor: "#ffdd80" }}
            ></div>
            <span className="text-xs text-center px-1">300</span>
          </div>
          <div className="w-16 h-16 flex flex-col items-center justify-center border border-gray-200">
            <div
              className="w-6 h-6 rounded border border-gray-300 mb-1"
              style={{ backgroundColor: "#ffc94d" }}
            ></div>
            <span className="text-xs text-center px-1">400</span>
          </div>
          <div className="w-16 h-16 flex flex-col items-center justify-center border border-gray-200">
            <div
              className="w-6 h-6 rounded border border-gray-300 mb-1"
              style={{ backgroundColor: "#ffb01f" }}
            ></div>
            <span className="text-xs text-center px-1">500</span>
          </div>
          <div className="w-16 h-16 flex flex-col items-center justify-center border border-gray-200">
            <div
              className="w-6 h-6 rounded border border-gray-300 mb-1"
              style={{ backgroundColor: "#e6960a" }}
            ></div>
            <span className="text-xs text-center px-1">600</span>
          </div>
          <div className="w-16 h-16 flex flex-col items-center justify-center border border-gray-200">
            <div
              className="w-6 h-6 rounded border border-gray-300 mb-1"
              style={{ backgroundColor: "#bf7a0a" }}
            ></div>
            <span className="text-xs text-center px-1">700</span>
          </div>
        </div>
      </div>

      {/* Slate Palette */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold mb-3">Slate Palette (Neutral)</h1>
        <div className="flex">
          <div className="w-16 h-16 flex flex-col items-center justify-center border border-gray-200">
            <div
              className="w-6 h-6 rounded border border-gray-300 mb-1"
              style={{ backgroundColor: "#f8fafc" }}
            ></div>
            <span className="text-xs text-center px-1">50</span>
          </div>
          <div className="w-16 h-16 flex flex-col items-center justify-center border border-gray-200">
            <div
              className="w-6 h-6 rounded border border-gray-300 mb-1"
              style={{ backgroundColor: "#f1f5f9" }}
            ></div>
            <span className="text-xs text-center px-1">100</span>
          </div>
          <div className="w-16 h-16 flex flex-col items-center justify-center border border-gray-200">
            <div
              className="w-6 h-6 rounded border border-gray-300 mb-1"
              style={{ backgroundColor: "#e2e8f0" }}
            ></div>
            <span className="text-xs text-center px-1">200</span>
          </div>
          <div className="w-16 h-16 flex flex-col items-center justify-center border border-gray-200">
            <div
              className="w-6 h-6 rounded border border-gray-300 mb-1"
              style={{ backgroundColor: "#cbd5e1" }}
            ></div>
            <span className="text-xs text-center px-1">300</span>
          </div>
          <div className="w-16 h-16 flex flex-col items-center justify-center border border-gray-200">
            <div
              className="w-6 h-6 rounded border border-gray-300 mb-1"
              style={{ backgroundColor: "#94a3b8" }}
            ></div>
            <span className="text-xs text-center px-1">400</span>
          </div>
          <div className="w-16 h-16 flex flex-col items-center justify-center border border-gray-200">
            <div
              className="w-6 h-6 rounded border border-gray-300 mb-1"
              style={{ backgroundColor: "#64748b" }}
            ></div>
            <span className="text-xs text-center px-1">500</span>
          </div>
          <div className="w-16 h-16 flex flex-col items-center justify-center border border-gray-200">
            <div
              className="w-6 h-6 rounded border border-gray-300 mb-1"
              style={{ backgroundColor: "#475569" }}
            ></div>
            <span className="text-xs text-center px-1">600</span>
          </div>
          <div className="w-16 h-16 flex flex-col items-center justify-center border border-gray-200">
            <div
              className="w-6 h-6 rounded border border-gray-300 mb-1"
              style={{ backgroundColor: "#334155" }}
            ></div>
            <span className="text-xs text-center px-1">700</span>
          </div>
          <div className="w-16 h-16 flex flex-col items-center justify-center border border-gray-200">
            <div
              className="w-6 h-6 rounded border border-gray-300 mb-1"
              style={{ backgroundColor: "#1e293b" }}
            ></div>
            <span className="text-xs text-center px-1">800</span>
          </div>
          <div className="w-16 h-16 flex flex-col items-center justify-center border border-gray-200">
            <div
              className="w-6 h-6 rounded border border-gray-300 mb-1"
              style={{ backgroundColor: "#0f172a" }}
            ></div>
            <span className="text-xs text-center px-1">900</span>
          </div>
          <div className="w-16 h-16 flex flex-col items-center justify-center border border-gray-200">
            <div
              className="w-6 h-6 rounded border border-gray-300 mb-1"
              style={{ backgroundColor: "#020617" }}
            ></div>
            <span className="text-xs text-center px-1">950</span>
          </div>
        </div>
      </div>

      {/* Card Rarity Colors */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold mb-3">Card Rarity Colors</h1>
        <div className="flex">
          <div className="w-20 h-20 flex flex-col items-center justify-center border border-gray-200">
            <div
              className="w-8 h-8 rounded border border-gray-300 mb-1"
              style={{ backgroundColor: "#1e293b" }}
            ></div>
            <span className="text-xs text-center px-1">Common</span>
          </div>
          <div className="w-20 h-20 flex flex-col items-center justify-center border border-gray-200">
            <div
              className="w-8 h-8 rounded border border-gray-300 mb-1"
              style={{ backgroundColor: "#71717a" }}
            ></div>
            <span className="text-xs text-center px-1">Uncommon</span>
          </div>
          <div className="w-20 h-20 flex flex-col items-center justify-center border border-gray-200">
            <div
              className="w-8 h-8 rounded border border-gray-300 mb-1"
              style={{ backgroundColor: "#eab308" }}
            ></div>
            <span className="text-xs text-center px-1">Rare</span>
          </div>
          <div className="w-20 h-20 flex flex-col items-center justify-center border border-gray-200">
            <div
              className="w-8 h-8 rounded border border-gray-300 mb-1"
              style={{ backgroundColor: "#ea580c" }}
            ></div>
            <span className="text-xs text-center px-1">Mythic</span>
          </div>
          <div className="w-20 h-20 flex flex-col items-center justify-center border border-gray-200">
            <div
              className="w-8 h-8 rounded border border-gray-300 mb-1"
              style={{ backgroundColor: "#a855f7" }}
            ></div>
            <span className="text-xs text-center px-1">Special</span>
          </div>
        </div>
      </div>

      {/* Trading Status Colors */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold mb-3">Trading Status Colors</h1>
        <div className="flex">
          <div className="w-20 h-20 flex flex-col items-center justify-center border border-gray-200">
            <div
              className="w-8 h-8 rounded border border-gray-300 mb-1"
              style={{ backgroundColor: "#7a8057" }}
            ></div>
            <span className="text-xs text-center px-1">Trade</span>
          </div>
          <div className="w-20 h-20 flex flex-col items-center justify-center border border-gray-200">
            <div
              className="w-8 h-8 rounded border border-gray-300 mb-1"
              style={{ backgroundColor: "#0891b2" }}
            ></div>
            <span className="text-xs text-center px-1">Sale</span>
          </div>
          <div className="w-20 h-20 flex flex-col items-center justify-center border border-gray-200">
            <div
              className="w-8 h-8 rounded border border-gray-300 mb-1"
              style={{ backgroundColor: "#7c3aed" }}
            ></div>
            <span className="text-xs text-center px-1">Both</span>
          </div>
          <div className="w-20 h-20 flex flex-col items-center justify-center border border-gray-200">
            <div
              className="w-8 h-8 rounded border border-gray-300 mb-1"
              style={{ backgroundColor: "#dc2626" }}
            ></div>
            <span className="text-xs text-center px-1">Reserved</span>
          </div>
        </div>
      </div>

      {/* Condition Colors */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold mb-3">Condition Colors</h1>
        <div className="flex">
          <div className="w-24 h-24 flex flex-col items-center justify-center border border-gray-200">
            <div
              className="w-8 h-8 rounded border border-gray-300 mb-1"
              style={{ backgroundColor: "#16a34a" }}
            ></div>
            <span className="text-xs text-center px-1 leading-tight">
              Near Mint
            </span>
          </div>
          <div className="w-24 h-24 flex flex-col items-center justify-center border border-gray-200">
            <div
              className="w-8 h-8 rounded border border-gray-300 mb-1"
              style={{ backgroundColor: "#0891b2" }}
            ></div>
            <span className="text-xs text-center px-1 leading-tight">
              Lightly Played
            </span>
          </div>
          <div className="w-24 h-24 flex flex-col items-center justify-center border border-gray-200">
            <div
              className="w-8 h-8 rounded border border-gray-300 mb-1"
              style={{ backgroundColor: "#eab308" }}
            ></div>
            <span className="text-xs text-center px-1 leading-tight">
              Moderately Played
            </span>
          </div>
          <div className="w-24 h-24 flex flex-col items-center justify-center border border-gray-200">
            <div
              className="w-8 h-8 rounded border border-gray-300 mb-1"
              style={{ backgroundColor: "#ea580c" }}
            ></div>
            <span className="text-xs text-center px-1 leading-tight">
              Heavily Played
            </span>
          </div>
          <div className="w-24 h-24 flex flex-col items-center justify-center border border-gray-200">
            <div
              className="w-8 h-8 rounded border border-gray-300 mb-1"
              style={{ backgroundColor: "#dc2626" }}
            ></div>
            <span className="text-xs text-center px-1 leading-tight">
              Damaged
            </span>
          </div>
        </div>
      </div>

      {/* System Status Colors */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold mb-3">System Status Colors</h1>
        <div className="flex">
          <div className="w-20 h-20 flex flex-col items-center justify-center border border-gray-200">
            <div
              className="w-8 h-8 rounded border border-gray-300 mb-1"
              style={{ backgroundColor: "#16a34a" }}
            ></div>
            <span className="text-xs text-center px-1">Success</span>
          </div>
          <div className="w-20 h-20 flex flex-col items-center justify-center border border-gray-200">
            <div
              className="w-8 h-8 rounded border border-gray-300 mb-1"
              style={{ backgroundColor: "#f59e0b" }}
            ></div>
            <span className="text-xs text-center px-1">Warning</span>
          </div>
          <div className="w-20 h-20 flex flex-col items-center justify-center border border-gray-200">
            <div
              className="w-8 h-8 rounded border border-gray-300 mb-1"
              style={{ backgroundColor: "#dc2626" }}
            ></div>
            <span className="text-xs text-center px-1">Error</span>
          </div>
          <div className="w-20 h-20 flex flex-col items-center justify-center border border-gray-200">
            <div
              className="w-8 h-8 rounded border border-gray-300 mb-1"
              style={{ backgroundColor: "#0891b2" }}
            ></div>
            <span className="text-xs text-center px-1">Info</span>
          </div>
        </div>
      </div>
    </div>
  );
}
