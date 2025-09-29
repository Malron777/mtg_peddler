export default function ColourPallette() {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4 text-center">Color Palette</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-center space-x-3">
          <div
            className="w-8 h-8 rounded border border-gray-300"
            style={{ backgroundColor: "#71984b" }}
          ></div>
          <span className="text-sm">Green Primary</span>
        </div>
        <div className="flex items-center space-x-3">
          <div
            className="w-8 h-8 rounded border border-gray-300"
            style={{ backgroundColor: "#624226" }}
          ></div>
          <span className="text-sm">Brown Primary</span>
        </div>
        <div className="flex items-center space-x-3">
          <div
            className="w-8 h-8 rounded border border-gray-300"
            style={{ backgroundColor: "#FFFBD5" }}
          ></div>
          <span className="text-sm">White Primary</span>
        </div>
        <div className="flex items-center space-x-3">
          <div
            className="w-8 h-8 rounded border border-gray-300"
            style={{ backgroundColor: "#0E68AB" }}
          ></div>
          <span className="text-sm">Blue Primary</span>
        </div>
        <div className="flex items-center space-x-3">
          <div
            className="w-8 h-8 rounded border border-gray-300"
            style={{ backgroundColor: "#150B00" }}
          ></div>
          <span className="text-sm">Black Primary</span>
        </div>
        <div className="flex items-center space-x-3">
          <div
            className="w-8 h-8 rounded border border-gray-300"
            style={{ backgroundColor: "#D3202A" }}
          ></div>
          <span className="text-sm">Red Primary</span>
        </div>
        <div className="flex items-center space-x-3">
          <div
            className="w-8 h-8 rounded border border-gray-300"
            style={{ backgroundColor: "#00733E" }}
          ></div>
          <span className="text-sm">Green Primary (Alt)</span>
        </div>
        <div className="flex items-center space-x-3">
          <div
            className="w-8 h-8 rounded border border-gray-300"
            style={{ backgroundColor: "#000000" }}
          ></div>
          <span className="text-sm">Common Primary</span>
        </div>
        <div className="flex items-center space-x-3">
          <div
            className="w-8 h-8 rounded border border-gray-300"
            style={{ backgroundColor: "#708090" }}
          ></div>
          <span className="text-sm">Uncommon Primary</span>
        </div>
        <div className="flex items-center space-x-3">
          <div
            className="w-8 h-8 rounded border border-gray-300"
            style={{ backgroundColor: "#FFD700" }}
          ></div>
          <span className="text-sm">Rare Primary</span>
        </div>
        <div className="flex items-center space-x-3">
          <div
            className="w-8 h-8 rounded border border-gray-300"
            style={{ backgroundColor: "#FF4500" }}
          ></div>
          <span className="text-sm">Mythic Primary</span>
        </div>
      </div>
    </div>
  );
}
