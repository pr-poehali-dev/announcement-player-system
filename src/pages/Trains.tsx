import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import func2url from "../../backend/func2url.json";

interface Train {
  id?: number;
  train_number: string;
  direction: string;
  type: "departure" | "arrival";
  departure_time: string;
  arrival_time: string;
  platform: string;
  wagons: string;
  status: "active" | "cancelled" | "departed";
  notes: string;
}

interface Template {
  id: number;
  name: string;
  category: string;
  text_template: string;
  variables: { key: string; label: string; type: string }[];
  voice: string;
  zone: string;
  speed: number;
}

interface Announcement {
  id: number;
  train_id: number;
  template_id: number | null;
  text_rendered: string;
  voice: string;
  zone: string;
  speed: number;
  repeat_offsets: number[];
  is_active: boolean;
  template_name?: string;
}

const EMPTY_TRAIN: Train = {
  train_number: "",
  direction: "",
  type: "departure",
  departure_time: "",
  arrival_time: "",
  platform: "",
  wagons: "",
  status: "active",
  notes: "",
};

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: "Активен", color: "#34d399", bg: "rgba(16,185,129,0.15)" },
  departed: { label: "Убыл", color: "#94a3b8", bg: "rgba(100,116,139,0.15)" },
  cancelled: { label: "Отменён", color: "#f87171", bg: "rgba(239,68,68,0.15)" },
};

const REPEAT_PRESETS = [
  { label: "За 30, 10, 5 мин", offsets: [30, 10, 5] },
  { label: "За 30, 15, 5 мин", offsets: [30, 15, 5] },
  { label: "За 60, 30, 10, 5 мин", offsets: [60, 30, 10, 5] },
  { label: "Только за 5 мин", offsets: [5] },
  { label: "Однократно", offsets: [0] },
];

export default function Trains() {
  const [trains, setTrains] = useState<Train[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTrain, setEditTrain] = useState<Train>(EMPTY_TRAIN);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Модал объявлений рейса
  const [selectedTrain, setSelectedTrain] = useState<Train | null>(null);
  const [trainAnnouncements, setTrainAnnouncements] = useState<Announcement[]>([]);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [templateVars, setTemplateVars] = useState<Record<string, string>>({});
  const [renderedText, setRenderedText] = useState("");
  const [repeatOffsets, setRepeatOffsets] = useState<number[]>([30, 10, 5]);
  const [selectedVoice, setSelectedVoice] = useState("Алина");
  const [selectedZone, setSelectedZone] = useState("Все зоны");
  const [addingAnn, setAddingAnn] = useState(false);

  useEffect(() => {
    loadTrains();
    loadTemplates();
  }, []);

  const loadTrains = async () => {
    setLoading(true);
    const res = await fetch(func2url.trains);
    const data = await res.json();
    setTrains(data);
    setLoading(false);
  };

  const loadTemplates = async () => {
    const res = await fetch(func2url.templates);
    const data = await res.json();
    setTemplates(data);
  };

  const loadTrainAnnouncements = async (trainId: number) => {
    const res = await fetch(`${func2url.trains}/announcements?train_id=${trainId}`);
    const data = await res.json();
    setTrainAnnouncements(data);
  };

  const openCreate = () => {
    setEditTrain(EMPTY_TRAIN);
    setIsEditing(false);
    setShowForm(true);
  };

  const openEdit = (train: Train) => {
    setEditTrain({
      ...train,
      departure_time: train.departure_time ? train.departure_time.slice(0, 16) : "",
      arrival_time: train.arrival_time ? train.arrival_time.slice(0, 16) : "",
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const saveTrain = async () => {
    if (!editTrain.train_number || !editTrain.direction) return;
    setSaving(true);
    const method = isEditing ? "PUT" : "POST";
    await fetch(func2url.trains, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...editTrain,
        departure_time: editTrain.departure_time || null,
        arrival_time: editTrain.arrival_time || null,
      }),
    });
    setSaving(false);
    setShowForm(false);
    loadTrains();
  };

  const openAnnouncementModal = async (train: Train) => {
    setSelectedTrain(train);
    setSelectedTemplate(null);
    setTemplateVars({});
    setRenderedText("");
    setRepeatOffsets([30, 10, 5]);
    setSelectedVoice("Алина");
    setSelectedZone("Все зоны");
    setShowAnnouncementModal(true);
    await loadTrainAnnouncements(train.id!);
  };

  const handleTemplateSelect = (tmpl: Template) => {
    setSelectedTemplate(tmpl);
    // Автозаполнение переменных из данных рейса
    const autoVars: Record<string, string> = {};
    if (selectedTrain) {
      tmpl.variables.forEach(v => {
        if (v.key === "train_number") autoVars[v.key] = selectedTrain.train_number;
        else if (v.key === "direction") autoVars[v.key] = selectedTrain.direction;
        else if (v.key === "platform") autoVars[v.key] = selectedTrain.platform || "";
        else if (v.key === "wagons") autoVars[v.key] = selectedTrain.wagons || "";
        else if (v.key === "departure_time" && selectedTrain.departure_time)
          autoVars[v.key] = selectedTrain.departure_time.slice(11, 16);
        else if (v.key === "arrival_time" && selectedTrain.arrival_time)
          autoVars[v.key] = selectedTrain.arrival_time.slice(11, 16);
        else autoVars[v.key] = "";
      });
    }
    setTemplateVars(autoVars);
    setSelectedVoice(tmpl.voice || "Алина");
    renderText(tmpl.text_template, autoVars);
  };

  const renderText = (tpl: string, vars: Record<string, string>) => {
    let result = tpl;
    Object.entries(vars).forEach(([k, v]) => {
      result = result.replace(new RegExp(`\\{${k}\\}`, "g"), v || `{${k}}`);
    });
    setRenderedText(result);
  };

  const handleVarChange = (key: string, value: string) => {
    const updated = { ...templateVars, [key]: value };
    setTemplateVars(updated);
    if (selectedTemplate) renderText(selectedTemplate.text_template, updated);
  };

  const saveAnnouncement = async () => {
    if (!selectedTrain || !renderedText.trim()) return;
    setAddingAnn(true);
    await fetch(`${func2url.trains}/announcements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        train_id: selectedTrain.id,
        template_id: selectedTemplate?.id || null,
        text_rendered: renderedText,
        voice: selectedVoice,
        zone: selectedZone,
        speed: 1.0,
        repeat_offsets: repeatOffsets,
        is_active: true,
      }),
    });
    setAddingAnn(false);
    setSelectedTemplate(null);
    setRenderedText("");
    loadTrainAnnouncements(selectedTrain.id!);
  };

  const formatTime = (dt: string | null | undefined) => {
    if (!dt) return "—";
    return dt.slice(11, 16);
  };

  const formatDate = (dt: string | null | undefined) => {
    if (!dt) return "";
    return new Date(dt).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{trains.length} рейсов на сегодня</p>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: "linear-gradient(135deg, var(--neon-blue), var(--neon-violet))" }}>
          <Icon name="Plus" size={15} /> Новый рейс
        </button>
      </div>

      {/* Trains list */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Icon name="Loader" size={24} className="animate-spin mr-2" /> Загрузка...
        </div>
      ) : trains.length === 0 ? (
        <div className="gradient-border rounded-2xl p-12 glass text-center space-y-3">
          <Icon name="Train" size={40} className="text-muted-foreground/40 mx-auto" />
          <p className="text-muted-foreground">Рейсов пока нет</p>
          <button onClick={openCreate}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, var(--neon-blue), var(--neon-violet))" }}>
            Создать первый рейс
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {trains.map((train, i) => {
            const st = STATUS_LABELS[train.status] || STATUS_LABELS.active;
            const time = train.type === "departure" ? formatTime(train.departure_time) : formatTime(train.arrival_time);
            const date = train.type === "departure" ? formatDate(train.departure_time) : formatDate(train.arrival_time);
            return (
              <div key={train.id ?? i}
                className={`gradient-border rounded-2xl p-5 glass flex items-center gap-5 hover:opacity-95 transition-all animate-fade-in stagger-${(i % 5) + 1}`}>
                {/* Type badge */}
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: train.type === "departure" ? "rgba(59,130,246,0.2)" : "rgba(139,92,246,0.2)" }}>
                  <Icon name={train.type === "departure" ? "ArrowRightFromLine" : "ArrowRightToLine"} size={22}
                    style={{ color: train.type === "departure" ? "var(--neon-blue)" : "var(--neon-violet)" }} />
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <span className="font-oswald text-xl font-bold text-white">№ {train.train_number}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: st.bg, color: st.color }}>
                      {st.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {train.type === "departure" ? "Отправление" : "Прибытие"}
                    </span>
                  </div>
                  <div className="text-sm text-foreground truncate">{train.direction}</div>
                  <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground flex-wrap">
                    {time !== "—" && (
                      <span className="flex items-center gap-1">
                        <Icon name="Clock" size={11} /> {time} {date && `· ${date}`}
                      </span>
                    )}
                    {train.platform && (
                      <span className="flex items-center gap-1">
                        <Icon name="MapPin" size={11} /> Платформа {train.platform}
                      </span>
                    )}
                    {train.wagons && (
                      <span className="flex items-center gap-1">
                        <Icon name="LayoutList" size={11} /> Вагоны: {train.wagons}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => openAnnouncementModal(train)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90"
                    style={{ background: "linear-gradient(135deg, var(--neon-blue), var(--neon-violet))" }}>
                    <Icon name="Megaphone" size={13} /> Объявления
                  </button>
                  <button onClick={() => openEdit(train)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                    style={{ background: "hsl(var(--muted))" }}>
                    <Icon name="Pencil" size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======= ФОРМА СОЗДАНИЯ/РЕДАКТИРОВАНИЯ ======= */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}>
          <div className="w-full max-w-lg rounded-2xl p-6 space-y-5 animate-fade-in"
            style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
            <div className="flex items-center justify-between">
              <h2 className="font-oswald text-xl font-bold text-white">
                {isEditing ? "Редактировать рейс" : "Новый рейс"}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
                <Icon name="X" size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">Номер поезда *</label>
                <input value={editTrain.train_number} onChange={e => setEditTrain({ ...editTrain, train_number: e.target.value })}
                  placeholder="142А" className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                  style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">Тип</label>
                <div className="flex gap-2">
                  {[{ v: "departure", l: "Отправление" }, { v: "arrival", l: "Прибытие" }].map(t => (
                    <button key={t.v} onClick={() => setEditTrain({ ...editTrain, type: t.v as "departure" | "arrival" })}
                      className="flex-1 py-2.5 rounded-xl text-xs font-medium transition-all"
                      style={{
                        background: editTrain.type === t.v ? "linear-gradient(135deg, var(--neon-blue), var(--neon-violet))" : "hsl(var(--muted))",
                        color: editTrain.type === t.v ? "white" : "hsl(var(--muted-foreground))",
                        border: `1px solid ${editTrain.type === t.v ? "transparent" : "hsl(var(--border))"}`,
                      }}>
                      {t.l}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Направление *</label>
              <input value={editTrain.direction} onChange={e => setEditTrain({ ...editTrain, direction: e.target.value })}
                placeholder="Москва — Санкт-Петербург" className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">
                  {editTrain.type === "departure" ? "Время отправления" : "Время прибытия"}
                </label>
                <input
                  type="datetime-local"
                  value={editTrain.type === "departure" ? editTrain.departure_time : editTrain.arrival_time}
                  onChange={e => setEditTrain(editTrain.type === "departure"
                    ? { ...editTrain, departure_time: e.target.value }
                    : { ...editTrain, arrival_time: e.target.value }
                  )}
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                  style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))", colorScheme: "dark" }} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">Платформа</label>
                <input value={editTrain.platform} onChange={e => setEditTrain({ ...editTrain, platform: e.target.value })}
                  placeholder="1, 2А..." className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                  style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">Нумерация вагонов</label>
                <input value={editTrain.wagons} onChange={e => setEditTrain({ ...editTrain, wagons: e.target.value })}
                  placeholder="с головы поезда" className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                  style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">Статус</label>
                <select value={editTrain.status} onChange={e => setEditTrain({ ...editTrain, status: e.target.value as Train["status"] })}
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                  style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}>
                  <option value="active">Активен</option>
                  <option value="departed">Убыл</option>
                  <option value="cancelled">Отменён</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Примечание</label>
              <input value={editTrain.notes} onChange={e => setEditTrain({ ...editTrain, notes: e.target.value })}
                placeholder="Дополнительная информация..." className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }} />
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={() => setShowForm(false)}
                className="flex-1 py-3 rounded-xl text-sm font-medium text-muted-foreground transition-all hover:text-foreground"
                style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))" }}>
                Отмена
              </button>
              <button onClick={saveTrain} disabled={saving || !editTrain.train_number || !editTrain.direction}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-all"
                style={{ background: "linear-gradient(135deg, var(--neon-blue), var(--neon-violet))" }}>
                {saving ? "Сохраняю..." : isEditing ? "Сохранить" : "Создать рейс"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======= МОДАЛ ОБЪЯВЛЕНИЙ РЕЙСА ======= */}
      {showAnnouncementModal && selectedTrain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}>
          <div className="w-full max-w-2xl rounded-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto animate-fade-in"
            style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-oswald text-xl font-bold text-white">
                  Объявления — Поезд № {selectedTrain.train_number}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">{selectedTrain.direction}</p>
              </div>
              <button onClick={() => setShowAnnouncementModal(false)} className="text-muted-foreground hover:text-foreground">
                <Icon name="X" size={20} />
              </button>
            </div>

            {/* Существующие объявления рейса */}
            {trainAnnouncements.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Прикреплённые объявления</p>
                {trainAnnouncements.map(ann => (
                  <div key={ann.id} className="flex items-start gap-3 p-3 rounded-xl"
                    style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))" }}>
                    <Icon name="Megaphone" size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{ann.text_rendered}</p>
                      <div className="flex gap-3 mt-1 flex-wrap">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Icon name="User" size={11} /> {ann.voice}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Icon name="MapPin" size={11} /> {ann.zone}
                        </span>
                        <span className="text-xs flex items-center gap-1" style={{ color: "var(--neon-blue)" }}>
                          <Icon name="RefreshCw" size={11} />
                          За {(ann.repeat_offsets || []).join(", ")} мин
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Добавить объявление */}
            <div className="space-y-4" style={{ borderTop: "1px solid hsl(var(--border))", paddingTop: "16px" }}>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Добавить объявление</p>

              {/* Выбор шаблона */}
              <div>
                <label className="text-xs text-muted-foreground block mb-2">Шаблон объявления</label>
                <div className="grid grid-cols-2 gap-2">
                  {templates.map(t => (
                    <button key={t.id} onClick={() => handleTemplateSelect(t)}
                      className="text-left px-3 py-2.5 rounded-xl transition-all"
                      style={{
                        background: selectedTemplate?.id === t.id
                          ? "linear-gradient(135deg, rgba(59,130,246,0.25), rgba(139,92,246,0.15))"
                          : "hsl(var(--muted))",
                        border: `1px solid ${selectedTemplate?.id === t.id ? "rgba(59,130,246,0.5)" : "hsl(var(--border))"}`,
                      }}>
                      <div className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${t.category === "urgent" ? "text-red-400" : "text-blue-400"}`}>
                        {t.category === "urgent" ? "Срочное" : "Стандарт"}
                      </div>
                      <div className="text-xs font-semibold text-foreground">{t.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Поля переменных — автозаполнены из рейса */}
              {selectedTemplate && selectedTemplate.variables.length > 0 && (
                <div className="space-y-3 p-4 rounded-xl" style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)" }}>
                  <p className="text-xs text-blue-400 font-semibold">Заполните поля (автоматически из данных рейса)</p>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedTemplate.variables.map(v => (
                      <div key={v.key}>
                        <label className="text-xs text-muted-foreground block mb-1">{v.label}</label>
                        <input
                          type={v.type === "number" ? "number" : "text"}
                          value={templateVars[v.key] || ""}
                          onChange={e => handleVarChange(v.key, e.target.value)}
                          className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                          style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Предпросмотр текста */}
              {renderedText && (
                <div className="p-4 rounded-xl" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)" }}>
                  <p className="text-xs text-emerald-400 font-semibold mb-2">Итоговый текст объявления</p>
                  <p className="text-sm text-foreground leading-relaxed">{renderedText}</p>
                </div>
              )}

              {/* Голос и зона */}
              {selectedTemplate && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1.5">Голос</label>
                    <select value={selectedVoice} onChange={e => setSelectedVoice(e.target.value)}
                      className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                      style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}>
                      <option>Алина</option><option>Максим</option><option>Дмитрий</option><option>Екатерина</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1.5">Зона вещания</label>
                    <select value={selectedZone} onChange={e => setSelectedZone(e.target.value)}
                      className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                      style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}>
                      <option>Все зоны</option><option>Перрон</option><option>Зал ожидания</option><option>Вход</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Повторы по расписанию */}
              {selectedTemplate && (
                <div>
                  <label className="text-xs text-muted-foreground block mb-2">Повторы (до отправления/прибытия)</label>
                  <div className="grid grid-cols-2 gap-2">
                    {REPEAT_PRESETS.map(p => (
                      <button key={p.label} onClick={() => setRepeatOffsets(p.offsets)}
                        className="px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left"
                        style={{
                          background: JSON.stringify(repeatOffsets) === JSON.stringify(p.offsets)
                            ? "linear-gradient(135deg, rgba(59,130,246,0.25), rgba(139,92,246,0.15))"
                            : "hsl(var(--muted))",
                          border: `1px solid ${JSON.stringify(repeatOffsets) === JSON.stringify(p.offsets) ? "rgba(59,130,246,0.5)" : "hsl(var(--border))"}`,
                          color: JSON.stringify(repeatOffsets) === JSON.stringify(p.offsets) ? "white" : "hsl(var(--muted-foreground))",
                        }}>
                        <Icon name="RefreshCw" size={11} className="inline mr-1.5" />
                        {p.label}
                      </button>
                    ))}
                  </div>
                  {repeatOffsets.length > 0 && repeatOffsets[0] !== 0 && (
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <Icon name="Info" size={11} />
                      Объявление прозвучит за {repeatOffsets.join(", ")} минут до события
                    </p>
                  )}
                </div>
              )}

              <button onClick={saveAnnouncement}
                disabled={addingAnn || !renderedText.trim()}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-all"
                style={{ background: "linear-gradient(135deg, var(--neon-blue), var(--neon-violet))" }}>
                {addingAnn ? "Сохраняю..." : "Прикрепить объявление к рейсу"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
