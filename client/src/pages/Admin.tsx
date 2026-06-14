/**
 * TrendMagazine.cz – Admin Panel
 * Manage articles, sources, and trigger scraping runs.
 * Only accessible to admin users.
 */
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  Newspaper, RefreshCw, Star, Trash2, Archive, Send,
  FileText, Eye, Clock, AlertCircle, CheckCircle, ChevronLeft,
  Loader2, Globe, Database, Pencil, Plus, X, Power, Save, Lock, LogOut
} from "lucide-react";
import { toast } from "sonner";

function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        onSuccess();
      } else {
        toast.error("Špatné heslo");
      }
    } catch {
      toast.error("Chyba přihlášení");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white px-4">
      <form onSubmit={submit} className="bg-slate-800 border border-slate-700 rounded-xl p-8 w-full max-w-sm">
        <div className="flex justify-center mb-4"><Lock className="w-10 h-10 text-blue-400" /></div>
        <h1 className="text-xl font-bold text-center mb-1">TrendMagazine Admin</h1>
        <p className="text-sm text-slate-400 text-center mb-6">Zadejte heslo pro přístup</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          placeholder="Heslo"
          className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 mb-4 focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={loading || !password}
          className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 font-medium transition-colors"
        >
          {loading ? "Přihlašuji…" : "Přihlásit"}
        </button>
        <Link href="/" className="block text-center text-sm text-slate-400 hover:text-white mt-4">← Zpět na web</Link>
      </form>
    </div>
  );
}

export default function Admin() {
  const meQuery = trpc.auth.me.useQuery();
  const user = meQuery.data;
  const [activeTab, setActiveTab] = useState<"articles" | "sources" | "scraper">("articles");
  const [statusFilter, setStatusFilter] = useState<"published" | "draft" | "archived" | undefined>(undefined);

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    meQuery.refetch();
  };

  if (meQuery.isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  // Not logged in (or not admin) → show password gate
  if (!user || user.role !== "admin") {
    return <AdminLogin onSuccess={() => meQuery.refetch()} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-slate-400 hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold">TrendMagazine Admin</h1>
              <p className="text-sm text-slate-400">Správa článků a zdrojů</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">{user.name || user.email}</span>
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">
              {(user.name || "A")[0].toUpperCase()}
            </div>
            <button
              onClick={logout}
              title="Odhlásit"
              className="text-slate-400 hover:text-white transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="bg-slate-800/50 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 flex gap-1">
          {[
            { id: "articles" as const, label: "Články", icon: Newspaper },
            { id: "sources" as const, label: "Zdroje", icon: Globe },
            { id: "scraper" as const, label: "Scraper", icon: Database },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {activeTab === "articles" && (
          <ArticlesPanel statusFilter={statusFilter} setStatusFilter={setStatusFilter} />
        )}
        {activeTab === "sources" && <SourcesPanel />}
        {activeTab === "scraper" && <ScraperPanel />}
      </main>
    </div>
  );
}

/* ===== Articles Panel ===== */
function ArticlesPanel({
  statusFilter,
  setStatusFilter,
}: {
  statusFilter: "published" | "draft" | "archived" | undefined;
  setStatusFilter: (f: "published" | "draft" | "archived" | undefined) => void;
}) {
  const utils = trpc.useUtils();
  const { data: counts } = trpc.admin.articleCounts.useQuery();
  const { data: articles, isLoading } = trpc.admin.articles.useQuery({
    status: statusFilter,
    limit: 50,
    offset: 0,
  });

  const [editingArticleId, setEditingArticleId] = useState<number | null>(null);

  const publishMutation = trpc.admin.publishArticle.useMutation({
    onSuccess: () => {
      utils.admin.articles.invalidate();
      utils.admin.articleCounts.invalidate();
      toast.success("Článek publikován");
    },
  });

  const archiveMutation = trpc.admin.archiveArticle.useMutation({
    onSuccess: () => {
      utils.admin.articles.invalidate();
      utils.admin.articleCounts.invalidate();
      toast.success("Článek archivován");
    },
  });

  const draftMutation = trpc.admin.draftArticle.useMutation({
    onSuccess: () => {
      utils.admin.articles.invalidate();
      utils.admin.articleCounts.invalidate();
      toast.success("Článek vrácen do konceptu");
    },
  });

  const toggleFeaturedMutation = trpc.admin.toggleFeatured.useMutation({
    onSuccess: () => {
      utils.admin.articles.invalidate();
      toast.success("Featured status změněn");
    },
  });

  const deleteMutation = trpc.admin.deleteArticle.useMutation({
    onSuccess: () => {
      utils.admin.articles.invalidate();
      utils.admin.articleCounts.invalidate();
      toast.success("Článek smazán");
    },
  });

  const replaceImageMutation = trpc.admin.replaceImage.useMutation({
    onSuccess: (res) => {
      utils.admin.articles.invalidate();
      if (res.success) toast.success("Obrázek nahrazen");
      else toast.error(res.error || "Nepodařilo se");
    },
    onError: () => toast.error("Chyba při nahrazování obrázku"),
  });

  return (
    <div>
      {/* Edit Dialog */}
      {editingArticleId && (
        <ArticleEditDialog
          articleId={editingArticleId}
          onClose={() => setEditingArticleId(null)}
        />
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Celkem", count: counts?.total ?? 0, color: "bg-slate-700", filter: undefined },
          { label: "Publikováno", count: counts?.published ?? 0, color: "bg-green-900/50", filter: "published" as const },
          { label: "Koncepty", count: counts?.draft ?? 0, color: "bg-yellow-900/50", filter: "draft" as const },
          { label: "Archivováno", count: counts?.archived ?? 0, color: "bg-red-900/50", filter: "archived" as const },
        ].map((stat) => (
          <button
            key={stat.label}
            onClick={() => setStatusFilter(stat.filter)}
            className={`${stat.color} rounded-lg p-4 text-left transition-all hover:ring-1 hover:ring-slate-500 ${
              statusFilter === stat.filter ? "ring-2 ring-blue-500" : ""
            }`}
          >
            <div className="text-2xl font-bold">{stat.count}</div>
            <div className="text-sm text-slate-400">{stat.label}</div>
          </button>
        ))}
      </div>

      {/* Article List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="space-y-2">
          {articles?.map((article: any) => (
            <div
              key={article.id}
              className="bg-slate-800 rounded-lg p-4 flex items-start gap-4 hover:bg-slate-750 transition-colors"
            >
              {/* Thumbnail */}
              {article.image && (
                <img
                  src={article.image}
                  alt=""
                  className="w-20 h-14 object-cover rounded flex-shrink-0"
                />
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <StatusBadge status={article.status} />
                  {article.featured && (
                    <span className="text-xs bg-yellow-900/50 text-yellow-400 px-2 py-0.5 rounded">
                      ⭐ Featured
                    </span>
                  )}
                  {article.category?.name && (
                    <span className="text-xs text-slate-500">{article.category.name}</span>
                  )}
                </div>
                <h3 className="font-medium text-sm line-clamp-1">{article.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{article.excerpt}</p>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                  <span>{article.author}</span>
                  <span>·</span>
                  <span>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString("cs-CZ") : "—"}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => setEditingArticleId(article.id)}
                  className="p-2 text-blue-400 hover:bg-blue-900/30 rounded transition-colors"
                  title="Upravit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => replaceImageMutation.mutate({ articleId: article.id, mode: "generate" })}
                  disabled={replaceImageMutation.isPending}
                  className="p-2 text-purple-400 hover:bg-purple-900/30 rounded transition-colors disabled:opacity-50"
                  title="Vygenerovat AI obrázek (Gemini)"
                >
                  {replaceImageMutation.isPending && replaceImageMutation.variables?.articleId === article.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => replaceImageMutation.mutate({ articleId: article.id, mode: "unsplash" })}
                  disabled={replaceImageMutation.isPending}
                  className="p-2 text-teal-400 hover:bg-teal-900/30 rounded transition-colors disabled:opacity-50"
                  title="Dohledat obrázek na Unsplash"
                >
                  <Globe className="w-4 h-4" />
                </button>
                {article.status !== "published" && (
                  <button
                    onClick={() => publishMutation.mutate({ articleId: article.id })}
                    className="p-2 text-green-400 hover:bg-green-900/30 rounded transition-colors"
                    title="Publikovat"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                )}
                {article.status === "published" && (
                  <button
                    onClick={() => draftMutation.mutate({ articleId: article.id })}
                    className="p-2 text-yellow-400 hover:bg-yellow-900/30 rounded transition-colors"
                    title="Vrátit do konceptu"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => toggleFeaturedMutation.mutate({ articleId: article.id, featured: !article.featured })}
                  className={`p-2 rounded transition-colors ${
                    article.featured ? "text-yellow-400 hover:bg-yellow-900/30" : "text-slate-500 hover:bg-slate-700"
                  }`}
                  title="Toggle Featured"
                >
                  <Star className="w-4 h-4" />
                </button>
                <button
                  onClick={() => archiveMutation.mutate({ articleId: article.id })}
                  className="p-2 text-slate-400 hover:bg-slate-700 rounded transition-colors"
                  title="Archivovat"
                >
                  <Archive className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm("Opravdu smazat tento článek?")) {
                      deleteMutation.mutate({ articleId: article.id });
                    }
                  }}
                  className="p-2 text-red-400 hover:bg-red-900/30 rounded transition-colors"
                  title="Smazat"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {articles?.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <Newspaper className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Žádné články v této kategorii</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ===== Article Edit Dialog ===== */
function ArticleEditDialog({ articleId, onClose }: { articleId: number; onClose: () => void }) {
  const utils = trpc.useUtils();
  const { data: article, isLoading } = trpc.admin.articleById.useQuery({ articleId });
  const { data: categoriesList } = trpc.categories.list.useQuery();

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [image, setImage] = useState("");
  const [readTime, setReadTime] = useState(5);
  const [tags, setTags] = useState("");
  const [categoryId, setCategoryId] = useState<number>(0);

  useEffect(() => {
    if (article) {
      setTitle(article.title);
      setExcerpt(article.excerpt || "");
      setContent(article.content || "");
      setAuthor(article.author);
      setImage(article.image || "");
      setReadTime(article.readTime);
      setTags(article.tags || "");
      setCategoryId(article.categoryId);
    }
  }, [article]);

  const updateMutation = trpc.admin.updateArticle.useMutation({
    onSuccess: () => {
      utils.admin.articles.invalidate();
      toast.success("Článek uložen");
      onClose();
    },
    onError: (err) => {
      toast.error(`Chyba: ${err.message}`);
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      articleId,
      title,
      excerpt,
      content,
      author,
      image,
      readTime,
      tags,
      categoryId,
    });
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Dialog Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700 sticky top-0 bg-slate-800 z-10">
          <h2 className="text-lg font-bold">Upravit článek</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Titulek</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Perex</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Obsah (Markdown)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-y"
            />
          </div>

          {/* Two columns: Author + Read Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Autor</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Doba čtení (min)</label>
              <input
                type="number"
                value={readTime}
                onChange={(e) => setReadTime(Number(e.target.value))}
                min={1}
                max={60}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">URL obrázku</label>
            <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            {image && (
              <img src={image} alt="Preview" className="mt-2 h-24 object-cover rounded" />
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Kategorie</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              {categoriesList?.map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Tagy (oddělené čárkou)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="ai, technologie, novinky"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-700 sticky bottom-0 bg-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            Zrušit
          </button>
          <button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
          >
            {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Uložit změny
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===== Sources Panel ===== */
function SourcesPanel() {
  const utils = trpc.useUtils();
  const { data: sources, isLoading } = trpc.admin.sources.useQuery();
  const { data: categoriesList } = trpc.categories.list.useQuery();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSourceId, setEditingSourceId] = useState<number | null>(null);

  // Add form state
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newRssUrl, setNewRssUrl] = useState("");
  const [newCategoryId, setNewCategoryId] = useState<number>(0);
  const [newLanguage, setNewLanguage] = useState("en");

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editRssUrl, setEditRssUrl] = useState("");
  const [editCategoryId, setEditCategoryId] = useState<number>(0);
  const [editLanguage, setEditLanguage] = useState("en");

  const createMutation = trpc.admin.createSource.useMutation({
    onSuccess: () => {
      utils.admin.sources.invalidate();
      toast.success("Zdroj přidán");
      setShowAddForm(false);
      resetAddForm();
    },
    onError: (err) => toast.error(`Chyba: ${err.message}`),
  });

  const updateMutation = trpc.admin.updateSource.useMutation({
    onSuccess: () => {
      utils.admin.sources.invalidate();
      toast.success("Zdroj upraven");
      setEditingSourceId(null);
    },
    onError: (err) => toast.error(`Chyba: ${err.message}`),
  });

  const toggleActiveMutation = trpc.admin.updateSource.useMutation({
    onSuccess: () => {
      utils.admin.sources.invalidate();
      toast.success("Status zdroje změněn");
    },
  });

  const deleteMutation = trpc.admin.deleteSource.useMutation({
    onSuccess: () => {
      utils.admin.sources.invalidate();
      toast.success("Zdroj smazán");
    },
  });

  const resetAddForm = () => {
    setNewName("");
    setNewUrl("");
    setNewRssUrl("");
    setNewCategoryId(categoriesList?.[0]?.id ?? 0);
    setNewLanguage("en");
  };

  const startEdit = (source: any) => {
    setEditingSourceId(source.id);
    setEditName(source.name);
    setEditUrl(source.url);
    setEditRssUrl(source.rssUrl || "");
    setEditCategoryId(source.categoryId);
    setEditLanguage(source.language || "en");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Nakonfigurované zdroje ({sources?.length ?? 0})</h2>
        <button
          onClick={() => {
            setShowAddForm(true);
            setNewCategoryId(categoriesList?.[0]?.id ?? 0);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Přidat zdroj
        </button>
      </div>

      {/* Add Source Form */}
      {showAddForm && (
        <div className="bg-slate-800 rounded-lg p-5 mb-4 border border-blue-500/30">
          <h3 className="font-medium mb-3 text-blue-400">Nový zdroj</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Název</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="BBC News"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">URL webu</label>
              <input
                type="text"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://www.bbc.com"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">RSS URL (volitelné)</label>
              <input
                type="text"
                value={newRssUrl}
                onChange={(e) => setNewRssUrl(e.target.value)}
                placeholder="https://feeds.bbci.co.uk/news/rss.xml"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Kategorie</label>
              <select
                value={newCategoryId}
                onChange={(e) => setNewCategoryId(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {categoriesList?.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Jazyk zdroje</label>
              <select
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="en">Angličtina</option>
                <option value="cs">Čeština</option>
                <option value="de">Němčina</option>
                <option value="fr">Francouzština</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={() => {
                if (!newName || !newUrl) {
                  toast.error("Vyplňte název a URL");
                  return;
                }
                createMutation.mutate({
                  name: newName,
                  url: newUrl,
                  rssUrl: newRssUrl || undefined,
                  categoryId: newCategoryId,
                  language: newLanguage,
                });
              }}
              disabled={createMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
            >
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Přidat
            </button>
            <button
              onClick={() => { setShowAddForm(false); resetAddForm(); }}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              Zrušit
            </button>
          </div>
        </div>
      )}

      {/* Source List */}
      <div className="grid gap-3">
        {sources?.map((source: any) => (
          <div key={source.id}>
            {editingSourceId === source.id ? (
              /* Edit Form */
              <div className="bg-slate-800 rounded-lg p-4 border border-yellow-500/30">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Název</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-yellow-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">URL webu</label>
                    <input
                      type="text"
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-yellow-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">RSS URL</label>
                    <input
                      type="text"
                      value={editRssUrl}
                      onChange={(e) => setEditRssUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-yellow-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Kategorie</label>
                    <select
                      value={editCategoryId}
                      onChange={(e) => setEditCategoryId(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-yellow-500 outline-none"
                    >
                      {categoriesList?.map((cat: any) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <button
                    onClick={() => {
                      updateMutation.mutate({
                        sourceId: source.id,
                        name: editName,
                        url: editUrl,
                        rssUrl: editRssUrl || undefined,
                        categoryId: editCategoryId,
                        language: editLanguage,
                      });
                    }}
                    disabled={updateMutation.isPending}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
                  >
                    {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Uložit
                  </button>
                  <button
                    onClick={() => setEditingSourceId(null)}
                    className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    Zrušit
                  </button>
                </div>
              </div>
            ) : (
              /* Display Row */
              <div className="bg-slate-800 rounded-lg p-4 flex items-center gap-4">
                <Globe className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm">{source.name}</h3>
                  <p className="text-xs text-slate-400 truncate">{source.url}</p>
                  {source.rssUrl && (
                    <p className="text-xs text-slate-500 truncate">RSS: {source.rssUrl}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs bg-slate-700 px-2 py-1 rounded">{source.categoryName || "—"}</span>
                  <span className={`text-xs px-2 py-1 rounded ${source.isActive ? "bg-green-900/50 text-green-400" : "bg-red-900/50 text-red-400"}`}>
                    {source.isActive ? "Aktivní" : "Neaktivní"}
                  </span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => startEdit(source)}
                    className="p-2 text-blue-400 hover:bg-blue-900/30 rounded transition-colors"
                    title="Upravit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleActiveMutation.mutate({ sourceId: source.id, isActive: !source.isActive })}
                    className={`p-2 rounded transition-colors ${source.isActive ? "text-green-400 hover:bg-green-900/30" : "text-red-400 hover:bg-red-900/30"}`}
                    title={source.isActive ? "Deaktivovat" : "Aktivovat"}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Opravdu smazat zdroj "${source.name}"?`)) {
                        deleteMutation.mutate({ sourceId: source.id });
                      }
                    }}
                    className="p-2 text-red-400 hover:bg-red-900/30 rounded transition-colors"
                    title="Smazat"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===== Scraper Panel ===== */
function ScraperPanel() {
  const utils = trpc.useUtils();
  const [isRunning, setIsRunning] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  const runScraperMutation = trpc.admin.runScraper.useMutation({
    onSuccess: (result) => {
      setLastResult(result);
      setIsRunning(false);
      utils.admin.articles.invalidate();
      utils.admin.articleCounts.invalidate();
      toast.success(`Scraper dokončen: ${result.saved} nových článků`);
    },
    onError: (error) => {
      setIsRunning(false);
      toast.error(`Chyba: ${error.message}`);
    },
  });

  const handleRun = (autoPublish: boolean) => {
    setIsRunning(true);
    runScraperMutation.mutate({
      maxArticlesPerSource: 3,
      autoPublish,
    });
  };

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Scraper & AI Pipeline</h2>

      <div className="bg-slate-800 rounded-lg p-6 mb-6">
        <h3 className="font-medium mb-2">Spustit scraping</h3>
        <p className="text-sm text-slate-400 mb-4">
          Scraper projde všechny nakonfigurované zdroje, stáhne nové články, přeloží je do češtiny pomocí AI a uloží do databáze.
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => handleRun(false)}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
          >
            {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Spustit (jako koncepty)
          </button>
          <button
            onClick={() => handleRun(true)}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
          >
            {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Spustit & publikovat
          </button>
        </div>
      </div>

      {lastResult && (
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="font-medium mb-3">Výsledek posledního běhu</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-700 rounded p-3 text-center">
              <div className="text-2xl font-bold text-blue-400">{lastResult.found}</div>
              <div className="text-xs text-slate-400">Nalezeno</div>
            </div>
            <div className="bg-slate-700 rounded p-3 text-center">
              <div className="text-2xl font-bold text-green-400">{lastResult.saved}</div>
              <div className="text-xs text-slate-400">Uloženo</div>
            </div>
            <div className="bg-slate-700 rounded p-3 text-center">
              <div className="text-2xl font-bold text-red-400">{lastResult.errors}</div>
              <div className="text-xs text-slate-400">Chyby</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== Status Badge ===== */
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; icon: typeof CheckCircle; label: string }> = {
    published: { bg: "bg-green-900/50", text: "text-green-400", icon: CheckCircle, label: "Publikováno" },
    draft: { bg: "bg-yellow-900/50", text: "text-yellow-400", icon: Clock, label: "Koncept" },
    archived: { bg: "bg-red-900/50", text: "text-red-400", icon: Archive, label: "Archivováno" },
  };

  const c = config[status] || config.draft;
  const Icon = c.icon;

  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded ${c.bg} ${c.text}`}>
      <Icon className="w-3 h-3" />
      {c.label}
    </span>
  );
}
