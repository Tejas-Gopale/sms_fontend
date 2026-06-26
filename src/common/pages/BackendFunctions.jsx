import { useMemo, useState } from "react";
import { Search, Send, SlidersHorizontal } from "lucide-react";
import RoleSidebar from "../components/RoleSidebar";
import apiClient from "../utils/apiClient";
import { getUserData } from "../utils/tokenStorage";
import { BACKEND_FEATURE_CATALOG } from "../data/backendFeatureCatalog";

const METHOD_STYLES = {
  GET: "bg-emerald-50 text-emerald-700 border-emerald-200",
  POST: "bg-blue-50 text-blue-700 border-blue-200",
  PUT: "bg-amber-50 text-amber-700 border-amber-200",
  PATCH: "bg-purple-50 text-purple-700 border-purple-200",
  DELETE: "bg-red-50 text-red-700 border-red-200",
  ANY: "bg-gray-50 text-gray-700 border-gray-200",
};

const EMPTY_JSON = "{}";

function parseJsonField(value, label) {
  if (!value.trim()) return {};
  try {
    return JSON.parse(value);
  } catch {
    throw new Error(`${label} must be valid JSON.`);
  }
}

function fillPath(path, params) {
  return path.replace(/\{([^}]+)\}/g, (_, key) => {
    const value = params[key];
    if (value === undefined || value === "") throw new Error(`Missing path value: ${key}`);
    return encodeURIComponent(value);
  });
}

function roleLabel(role) {
  return role.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function BackendFunctions() {
  const userData = getUserData();
  const currentRole = userData?.roles?.[0] || "SCHOOL_ADMIN";
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("All modules");
  const [selected, setSelected] = useState(null);
  const [pathValues, setPathValues] = useState({});
  const [queryJson, setQueryJson] = useState(EMPTY_JSON);
  const [bodyJson, setBodyJson] = useState(EMPTY_JSON);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const roleFeatures = useMemo(() => {
    const scoped = BACKEND_FEATURE_CATALOG.filter((feature) => feature.roles.includes(currentRole));
    return scoped.length ? scoped : BACKEND_FEATURE_CATALOG;
  }, [currentRole]);

  const modules = useMemo(
    () => ["All modules", ...Array.from(new Set(roleFeatures.map((feature) => feature.module))).sort()],
    [roleFeatures]
  );

  const filteredFeatures = useMemo(() => {
    const term = search.trim().toLowerCase();
    return roleFeatures.filter((feature) => {
      const matchesModule = moduleFilter === "All modules" || feature.module === moduleFilter;
      const haystack = `${feature.module} ${feature.operation} ${feature.method} ${feature.path}`.toLowerCase();
      return matchesModule && (!term || haystack.includes(term));
    });
  }, [moduleFilter, roleFeatures, search]);

  const selectFeature = (feature) => {
    setSelected(feature);
    setPathValues(Object.fromEntries(feature.pathParams.map((param) => [param, ""])));
    setQueryJson(EMPTY_JSON);
    setBodyJson(EMPTY_JSON);
    setResult(null);
    setError("");
  };

  const submit = async () => {
    if (!selected) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const url = fillPath(selected.path, pathValues);
      const params = parseJsonField(queryJson, "Query params");
      const data = ["POST", "PUT", "PATCH", "DELETE"].includes(selected.method)
        ? parseJsonField(bodyJson, "Request body")
        : undefined;
      const response = await apiClient.request({
        url,
        method: selected.method === "ANY" ? "GET" : selected.method.toLowerCase(),
        params,
        data,
      });
      setResult({ status: response.status, data: response.data });
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.response?.data?.error ||
          requestError.message ||
          "Request failed."
      );
      if (requestError?.response) {
        setResult({ status: requestError.response.status, data: requestError.response.data });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <RoleSidebar />
      <main className="flex-1 min-w-0 p-6">
        <div className="mx-auto max-w-7xl space-y-5">
          <header className="flex flex-col gap-3 border-b border-slate-200 pb-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-700">{roleLabel(currentRole)}</p>
              <h1 className="text-2xl font-bold text-slate-900">Backend Functions</h1>
              <p className="mt-1 max-w-3xl text-sm text-slate-600">
                Role-filtered access to backend operations generated from the Spring controllers.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-center shadow-sm">
              <div>
                <p className="text-lg font-bold text-slate-900">{roleFeatures.length}</p>
                <p className="text-xs text-slate-500">Operations</p>
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">{modules.length - 1}</p>
                <p className="text-xs text-slate-500">Modules</p>
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">{currentRole === "SUPER_ADMIN" ? "All" : "Role"}</p>
                <p className="text-xs text-slate-500">Scope</p>
              </div>
            </div>
          </header>

          <section className="grid gap-5 xl:grid-cols-[minmax(360px,440px),1fr]">
            <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="space-y-3 border-b border-slate-200 p-4">
                <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
                  <Search size={16} className="text-slate-400" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search operation or endpoint"
                    className="w-full border-0 bg-transparent text-sm outline-none"
                  />
                </label>
                <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
                  <SlidersHorizontal size={16} className="text-slate-400" />
                  <select
                    value={moduleFilter}
                    onChange={(event) => setModuleFilter(event.target.value)}
                    className="w-full bg-transparent text-sm outline-none"
                  >
                    {modules.map((module) => (
                      <option key={module} value={module}>{module}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="max-h-[calc(100vh-260px)] overflow-y-auto p-3">
                {filteredFeatures.map((feature) => (
                  <button
                    key={feature.id}
                    type="button"
                    onClick={() => selectFeature(feature)}
                    className={`mb-2 w-full rounded-lg border p-3 text-left transition ${
                      selected?.id === feature.id
                        ? "border-blue-300 bg-blue-50"
                        : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{feature.operation}</p>
                        <p className="mt-1 truncate text-xs text-slate-500">{feature.module}</p>
                      </div>
                      <span className={`rounded border px-2 py-1 text-[11px] font-bold ${METHOD_STYLES[feature.method]}`}>
                        {feature.method}
                      </span>
                    </div>
                    <code className="mt-2 block truncate text-xs text-slate-500">{feature.path}</code>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
              {selected ? (
                <div className="p-5">
                  <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded border px-2 py-1 text-xs font-bold ${METHOD_STYLES[selected.method]}`}>
                          {selected.method}
                        </span>
                        <span className="text-sm font-semibold text-blue-700">{selected.module}</span>
                      </div>
                      <h2 className="mt-2 text-xl font-bold text-slate-900">{selected.operation}</h2>
                      <code className="mt-2 block break-all rounded bg-slate-100 px-3 py-2 text-sm text-slate-700">
                        {selected.path}
                      </code>
                    </div>
                    <button
                      type="button"
                      onClick={submit}
                      disabled={loading}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Send size={16} />
                      {loading ? "Sending" : "Send Request"}
                    </button>
                  </div>

                  <div className="mt-5 grid gap-4 lg:grid-cols-2">
                    <div className="space-y-4">
                      {selected.pathParams.length > 0 && (
                        <div>
                          <h3 className="mb-2 text-sm font-bold text-slate-800">Path Values</h3>
                          <div className="grid gap-2">
                            {selected.pathParams.map((param) => (
                              <label key={param} className="grid gap-1 text-sm">
                                <span className="font-medium text-slate-600">{param}</span>
                                <input
                                  value={pathValues[param] || ""}
                                  onChange={(event) => setPathValues((current) => ({ ...current, [param]: event.target.value }))}
                                  className="rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-blue-400"
                                />
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      <label className="grid gap-2 text-sm">
                        <span className="font-bold text-slate-800">Query Params JSON</span>
                        <textarea
                          value={queryJson}
                          onChange={(event) => setQueryJson(event.target.value)}
                          rows={5}
                          className="rounded-lg border border-slate-200 px-3 py-2 font-mono text-xs outline-none focus:border-blue-400"
                        />
                      </label>

                      {["POST", "PUT", "PATCH", "DELETE"].includes(selected.method) && (
                        <label className="grid gap-2 text-sm">
                          <span className="font-bold text-slate-800">Request Body JSON</span>
                          <textarea
                            value={bodyJson}
                            onChange={(event) => setBodyJson(event.target.value)}
                            rows={10}
                            className="rounded-lg border border-slate-200 px-3 py-2 font-mono text-xs outline-none focus:border-blue-400"
                          />
                        </label>
                      )}
                    </div>

                    <div>
                      <h3 className="mb-2 text-sm font-bold text-slate-800">Response</h3>
                      {error && (
                        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                          {error}
                        </div>
                      )}
                      <pre className="min-h-[360px] overflow-auto rounded-lg border border-slate-200 bg-slate-950 p-4 text-xs text-slate-100">
                        {result ? JSON.stringify(result, null, 2) : "No request sent yet."}
                      </pre>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[520px] items-center justify-center p-8 text-center">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Select a backend operation</h2>
                    <p className="mt-2 max-w-md text-sm text-slate-600">
                      Choose a function from the list to enter parameters, send the request, and inspect the response.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
