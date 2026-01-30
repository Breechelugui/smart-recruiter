import { useState, useEffect } from "react";
import { useAppDispatch } from "../../../app/hooks";
import apiClient from "../../../services/apiClient";

export default function CodeWarsBrowser({ onImportKata }) {
  const dispatch = useAppDispatch();
  const [katas, setKatas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchKatas = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get("/api/codewars/katas/search", {
        params: { query: searchQuery }
      });
      setKatas(data);
    } catch (err) {
      console.error("Error fetching katas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKatas();
  }, []);

  const handleImport = (kata) => {
    onImportKata({
      title: kata.title,
      description: kata.description,
      type: "coding",
      points: 10,
      time_limit: 30,
      languages: kata.languages || ["javascript"],
      codewars_kata_id: kata.codewars_kata_id,
      difficulty: kata.difficulty,
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <h3 className="font-semibold text-slate-900 mb-4">Browse CodeWars Katas</h3>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Search katas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          onClick={fetchKatas}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {katas.map((kata, idx) => (
          <div key={idx} className="border border-slate-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-slate-900">{kata.title}</h4>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                {kata.difficulty}
              </span>
            </div>
            <p className="text-sm text-slate-600 mb-3 line-clamp-3">{kata.description}</p>
            <div className="flex justify-between items-center">
              <div className="flex gap-1">
                {(kata.tags || []).slice(0, 3).map((tag, i) => (
                  <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>
              <button
                onClick={() => handleImport(kata)}
                className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
              >
                Import
              </button>
            </div>
          </div>
        ))}
      </div>

      {!loading && katas.length === 0 && (
        <div className="text-center py-8 text-sm text-slate-500">
          No katas found. Try a different search term.
        </div>
      )}
    </div>
  );
}
