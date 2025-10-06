"use client";

import { createGetCardUseCase } from "@/src/app/services/get-card.use-case";
import { ScryfallCard } from "@/src/app/services/scryfall.service";
import Image from "next/image";
import { useState } from "react";

export default function CardViewer() {
  const [card, setCard] = useState<ScryfallCard | null>(null);
  const [versions, setVersions] = useState<ScryfallCard[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<ScryfallCard | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("Lightning Bolt");

  const getCardUseCase = createGetCardUseCase();

  const fetchCard = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);
    setVersions([]);
    setSelectedVersion(null);

    try {
      const cardData = await getCardUseCase.getCardByName(searchTerm);
      setCard(cardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch card");
    } finally {
      setLoading(false);
    }
  };

  const fetchVersions = async () => {
    if (!card?.oracle_id) return;

    setLoadingVersions(true);
    setError(null);

    try {
      const versionsData = await getCardUseCase.getCardVersions(card.oracle_id);
      setVersions(versionsData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch card versions"
      );
    } finally {
      setLoadingVersions(false);
    }
  };

  const handleVersionSelect = (version: ScryfallCard) => {
    setSelectedVersion(version);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCard();
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">MTG Card Viewer</h1>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="mb-8 w-full max-w-md">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter card name..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !searchTerm.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Loading..." : "Search"}
          </button>
        </div>
      </form>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Card Display */}
      {card && (
        <div className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Card Image */}
            <div className="flex flex-col items-center">
              <h2 className="text-2xl font-semibold mb-4">
                {selectedVersion ? selectedVersion.name : card.name}
              </h2>
              {selectedVersion?.image_uris || card.image_uris ? (
                <Image
                  src={
                    selectedVersion?.image_uris?.large ||
                    card.image_uris?.large ||
                    (card.card_faces &&
                      card.card_faces[0]?.image_uris?.large) ||
                    ""
                  }
                  alt={selectedVersion ? selectedVersion.name : card.name}
                  width={488}
                  height={680}
                  className="max-w-full h-auto rounded-lg shadow-lg"
                  unoptimized
                />
              ) : (
                <div className="w-64 h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">No image available</p>
                </div>
              )}

              {/* Card Details */}
              <div className="mt-4 text-center">
                <p className="text-lg font-medium">
                  {selectedVersion ? selectedVersion.type_line : card.type_line}
                </p>
                {(selectedVersion?.mana_cost || card.mana_cost) && (
                  <p className="text-sm text-gray-600 mt-1">
                    Cost: {selectedVersion?.mana_cost || card.mana_cost}
                  </p>
                )}
                {(selectedVersion?.set_name || card.set_name) && (
                  <p className="text-sm text-gray-600">
                    Set: {selectedVersion?.set_name || card.set_name}
                  </p>
                )}
                {(selectedVersion?.artist || card.artist) && (
                  <p className="text-sm text-gray-600">
                    Artist: {selectedVersion?.artist || card.artist}
                  </p>
                )}
                {selectedVersion && (
                  <p className="text-sm text-gray-600">
                    Collector #: {selectedVersion.collector_number}
                  </p>
                )}
              </div>
            </div>

            {/* JSON Data */}
            <div className="flex flex-col">
              <h3 className="text-xl font-semibold mb-4">
                Full Card Data (JSON)
              </h3>
              <div className="bg-gray-100 rounded-lg p-4 overflow-auto max-h-96">
                <pre className="text-sm whitespace-pre-wrap">
                  {JSON.stringify(selectedVersion || card, null, 2)}
                </pre>
              </div>
            </div>
          </div>

          {/* Version Selection Section - Moved Below */}
          <div className="w-full p-6 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Card Versions</h3>
              <button
                onClick={fetchVersions}
                disabled={loadingVersions}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                {loadingVersions ? "Loading..." : "Load All Versions"}
              </button>
            </div>

            {versions.length > 0 && (
              <div>
                <p className="text-lg text-gray-600 mb-4">
                  Found {versions.length} versions. Select one to view:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 max-h-96 overflow-y-auto">
                  {versions.map((version) => (
                    <button
                      key={version.id}
                      onClick={() => handleVersionSelect(version)}
                      className={`p-3 rounded-lg border transition-colors flex flex-col items-center ${
                        selectedVersion?.id === version.id
                          ? "bg-blue-200 border-blue-400 shadow-md"
                          : "bg-white border-gray-300 hover:bg-gray-50 hover:shadow-sm"
                      }`}
                    >
                      {/* Thumbnail Image */}
                      <div className="w-24 h-32 mb-3 relative">
                        {version.image_uris ? (
                          <Image
                            src={version.image_uris.small}
                            alt={version.name}
                            fill
                            className="object-cover rounded"
                            unoptimized
                          />
                        ) : version.card_faces &&
                          version.card_faces[0]?.image_uris ? (
                          <Image
                            src={version.card_faces[0].image_uris.small}
                            alt={version.name}
                            fill
                            className="object-cover rounded"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-xs text-gray-500">
                              No image
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Version Info */}
                      <div className="text-center">
                        <div className="text-sm font-medium mb-1">
                          {version.set_name}
                        </div>
                        <div className="text-xs text-gray-600 mb-1">
                          #{version.collector_number}
                        </div>
                        <div className="text-xs text-gray-500">
                          {version.rarity}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      {!card && !loading && !error && (
        <div className="text-center text-gray-600 mt-8">
          <p>Enter a card name above to view its details and full JSON data.</p>
          <p className="mt-2 text-sm">
            Try searching for popular cards like &quot;Lightning Bolt&quot;,
            &quot;Black Lotus&quot;, or &quot;Jace, the Mind Sculptor&quot;
          </p>
        </div>
      )}
    </div>
  );
}
