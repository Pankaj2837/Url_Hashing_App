import { useState, useEffect } from "react";
import { urlService } from "../services/urlService";
import { BarChart, Server, Globe } from "lucide-react";

const Dashboard = () => {
  const [urls, setUrls] = useState([]);
  const [inputUrl, setInputUrl] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUrls = async () => {
      try {
        const data = await urlService.getUrls();
        setUrls(data);
      } catch (err) {
        console.error("Failed to load URLs", err);
      }
    };
    fetchUrls();
  }, []);
  const handleShorten = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const newUrl = await urlService.shorten(inputUrl);
      setUrls([newUrl, ...urls]); // Optimistic update
      setInputUrl("");
    } catch (err) {
      console.error("Error shortening URL", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      {/* Header section */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          System Dashboard
        </h1>
        <div className="flex gap-4">
          <span className="flex items-center gap-2 text-xs font-semibold bg-green-100 text-green-700 px-3 py-1 rounded-full border border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Redis Active
          </span>
          <span className="flex items-center gap-2 text-xs font-semibold bg-blue-100 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
            <Server size={14} />
            Shards: 2 Online
          </span>
        </div>
      </div>

      {/* Input Section */}
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-10">
        <form onSubmit={handleShorten} className="flex gap-4">
          <div className="relative flex-1">
            <Globe className="absolute left-4 top-4 text-slate-400" size={20} />
            <input
              type="url"
              placeholder="Enter long URL (https://...)"
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Shorten"}
          </button>
        </form>
      </div>

      {/* URL List Section */}
      <div className="max-w-6xl mx-auto overflow-hidden bg-white rounded-2xl shadow-sm border border-slate-200">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 uppercase tracking-wider">
                Short URL
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 uppercase tracking-wider">
                Clicks
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 uppercase tracking-wider">
                Mapped Shard
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {urls.map((u, i) => (
              <tr key={i} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-blue-600">
                  <a
                    href={`http://localhost:3000/api/url/${u.short_code}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {u.short_code}
                  </a>
                </td>
                <td className="px-6 py-4 text-slate-600">
                  <span className="flex items-center gap-2">
                    <BarChart size={16} /> {u.clicks || 0}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    <Server size={12} /> {u.shardId || "Shard-0"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
