import { useState } from "react";
import Icon from "@/components/ui/icon";
import Trains from "./Trains";

type Section = "dashboard" | "trains" | "templates" | "history" | "library" | "settings";

const NAV_ITEMS = [
  { id: "dashboard" as Section, icon: "LayoutDashboard", label: "Панель управления" },
  { id: "trains" as Section, icon: "Train", label: "Рейсы" },
  { id: "templates" as Section, icon: "LayoutTemplate", label: "Шаблоны" },
  { id: "history" as Section, icon: "History", label: "История" },
  { id: "library" as Section, icon: "Library", label: "Библиотека" },
  { id: "settings" as Section, icon: "Settings2", label: "Настройки" },
];

const HISTORY_DATA = [
  { id: 1, text: "Внимание! Рейс SU 145 на Москву задерживается на 40 минут.", time: "14:32", zone: "Все зоны", voice: "Алина" },
  { id: 2, text: "Посадка на рейс EK 007 начинается у выхода B12.", time: "13:58", zone: "Терминал B", voice: "Максим" },
  { id: 3, text: "Уважаемые пассажиры, просьба не оставлять багаж без присмотра.", time: "13:15", zone: "Прилёт", voice: "Алина" },
  { id: 4, text: "Объявляется финальная посадка на рейс TK 412.", time: "12:44", zone: "Выход C5", voice: "Дмитрий" },
  { id: 5, text: "Добро пожаловать в аэропорт. Желаем вам приятного путешествия.", time: "11:00", zone: "Все зоны", voice: "Алина" },
];

const TEMPLATES = [
  { id: 1, name: "Задержка рейса", text: "Уважаемые пассажиры, рейс {номер} задержан на {минуты} минут.", category: "Срочное" },
  { id: 2, name: "Начало посадки", text: "Объявляется посадка на рейс {номер} у выхода {выход}.", category: "Стандарт" },
  { id: 3, name: "Финальная посадка", text: "Финальная посадка на рейс {номер}! Пассажиры, пройдите на посадку.", category: "Срочное" },
  { id: 4, name: "Приветствие", text: "Добро пожаловать! Приятного путешествия.", category: "Общее" },
  { id: 5, name: "Потерянная вещь", text: "В зале найдена вещь. Просим обратиться к стойке информации.", category: "Общее" },
  { id: 6, name: "Закрытие выхода", text: "Выход {номер} временно закрыт. Просьба пройти к выходу {альт}.", category: "Стандарт" },
];

const LIBRARY = [
  { id: 1, name: "Сигнал внимания", duration: "0:03", type: "Звук", size: "48 KB" },
  { id: 2, name: "Тревога - короткая", duration: "0:05", type: "Звук", size: "72 KB" },
  { id: 3, name: "Приветствие EN", duration: "0:08", type: "Запись", size: "210 KB" },
  { id: 4, name: "Приветствие RU", duration: "0:07", type: "Запись", size: "195 KB" },
  { id: 5, name: "Музыкальная подложка", duration: "1:20", type: "Музыка", size: "1.8 MB" },
];

export default function Index() {
  const [section, setSection] = useState<Section>("dashboard");
  const [text, setText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("Алина");
  const [selectedZone, setSelectedZone] = useState("Все зоны");
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [speed, setSpeed] = useState(1.0);
  const [language, setLanguage] = useState("Русский");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [signalEnabled, setSignalEnabled] = useState(true);

  const handlePlay = () => {
    if (!text.trim()) return;
    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), 4000);
  };

  return (
    <div className="flex h-screen bg-background mesh-bg overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`flex flex-col transition-all duration-300 border-r border-border/40 flex-shrink-0 ${sidebarOpen ? "w-60" : "w-16"}`}
        style={{ background: "hsl(var(--sidebar-background))" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-border/30">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, var(--neon-blue), var(--neon-violet))" }}>
            <Icon name="Radio" size={16} className="text-white" />
          </div>
          {sidebarOpen && (
            <div className="animate-fade-in overflow-hidden">
              <div className="font-oswald font-bold text-base text-white tracking-wide leading-none">АнонсПро</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Диспетчерская</div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 ${sidebarOpen ? "ml-auto" : "mx-auto"}`}
          >
            <Icon name={sidebarOpen ? "PanelLeftClose" : "PanelLeftOpen"} size={16} />
          </button>
        </div>

        {/* Status badge */}
        {sidebarOpen && (
          <div className="mx-3 mt-3 px-3 py-2 rounded-lg flex items-center gap-2 animate-fade-in"
            style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)" }}>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-blink flex-shrink-0" />
            <span className="text-xs text-emerald-400 font-medium">Система активна</span>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item, i) => (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
                ${section === item.id ? "nav-active text-white" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}
                animate-fade-in stagger-${i + 1}`}
            >
              <Icon name={item.icon} size={18} className={section === item.id ? "text-blue-400 flex-shrink-0" : "group-hover:text-foreground flex-shrink-0"} />
              {sidebarOpen && (
                <span className="text-sm font-medium truncate">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom user */}
        {sidebarOpen && (
          <div className="p-3 border-t border-border/30 animate-fade-in">
            <div className="flex items-center gap-2 px-2 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.04)" }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, var(--neon-blue), var(--neon-violet))" }}>
                <Icon name="User" size={14} className="text-white" />
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-semibold text-foreground">Диспетчер</div>
                <div className="text-[10px] text-muted-foreground">Смена активна</div>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="flex items-center gap-4 px-6 py-4 border-b border-border/40 flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.02)" }}>
          <div>
            <h1 className="font-oswald text-xl font-semibold text-white tracking-wide">
              {NAV_ITEMS.find(n => n.id === section)?.label}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date().toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
              style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", color: "var(--neon-blue)" }}>
              <Icon name="Volume2" size={13} />
              <span>{volume}%</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
              style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", color: "#a78bfa" }}>
              <Icon name="Globe" size={13} />
              <span>{language}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* === DASHBOARD === */}
          {section === "dashboard" && (
            <div className="space-y-6 animate-fade-in">
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Объявлений сегодня", value: "24", icon: "Megaphone", color: "var(--neon-blue)" },
                  { label: "Активных зон", value: "6", icon: "MapPin", color: "var(--neon-violet)" },
                  { label: "Среднее время", value: "0:12", icon: "Clock", color: "var(--neon-cyan)" },
                  { label: "Шаблонов", value: "6", icon: "LayoutTemplate", color: "var(--neon-green)" },
                ].map((stat, i) => (
                  <div key={i} className={`gradient-border rounded-xl p-4 glass animate-fade-in stagger-${i + 1}`}>
                    <div className="flex items-start justify-between mb-3">
                      <p className="text-xs text-muted-foreground font-medium leading-tight">{stat.label}</p>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ml-2"
                        style={{ background: `${stat.color}22` }}>
                        <Icon name={stat.icon} size={16} style={{ color: stat.color }} />
                      </div>
                    </div>
                    <p className="font-oswald text-3xl font-bold text-white">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Main panel */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* TTS Editor */}
                <div className="lg:col-span-2 gradient-border rounded-2xl p-6 glass space-y-5">
                  <div className="flex items-center justify-between">
                    <h2 className="font-oswald text-base font-semibold text-white tracking-wide flex items-center gap-2">
                      <Icon name="Mic" size={18} className="text-blue-400" />
                      Синтез речи
                    </h2>
                    {isPlaying && (
                      <div className="flex items-center gap-2 animate-fade-in">
                        <div className="flex gap-1 items-end">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className="wave-bar" />
                          ))}
                        </div>
                        <span className="text-xs text-blue-400 font-medium">Воспроизведение...</span>
                      </div>
                    )}
                  </div>

                  <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="Введите текст объявления..."
                    rows={4}
                    className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none transition-colors placeholder:text-muted-foreground/50"
                    style={{
                      background: "hsl(var(--muted))",
                      border: "1px solid hsl(var(--border))",
                      color: "hsl(var(--foreground))",
                    }}
                    onFocus={e => (e.target.style.borderColor = "var(--neon-blue)")}
                    onBlur={e => (e.target.style.borderColor = "hsl(var(--border))")}
                  />

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Голос</label>
                      <select value={selectedVoice} onChange={e => setSelectedVoice(e.target.value)}
                        className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                        style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}>
                        <option>Алина</option><option>Максим</option><option>Дмитрий</option><option>Екатерина</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Зона вещания</label>
                      <select value={selectedZone} onChange={e => setSelectedZone(e.target.value)}
                        className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                        style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}>
                        <option>Все зоны</option><option>Терминал A</option><option>Терминал B</option><option>Прилёт</option><option>Вылет</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Скорость: {speed.toFixed(1)}x</label>
                      <input type="range" min={0.5} max={2} step={0.1} value={speed}
                        onChange={e => setSpeed(parseFloat(e.target.value))}
                        className="w-full accent-blue-500 mt-3" />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handlePlay}
                      disabled={!text.trim() || isPlaying}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-40 text-white"
                      style={{ background: "linear-gradient(135deg, var(--neon-blue), var(--neon-violet))" }}
                    >
                      <Icon name={isPlaying ? "Square" : "Play"} size={16} />
                      {isPlaying ? "Остановить" : "Запустить объявление"}
                    </button>
                    <button onClick={() => setText("")}
                      className="px-4 py-3 rounded-xl text-sm transition-all text-muted-foreground hover:text-foreground"
                      style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))" }}>
                      <Icon name="Trash2" size={16} />
                    </button>
                    <button className="px-4 py-3 rounded-xl text-sm transition-all text-muted-foreground hover:text-foreground"
                      style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))" }}>
                      <Icon name="Save" size={16} />
                    </button>
                  </div>
                </div>

                {/* Quick templates */}
                <div className="gradient-border rounded-2xl p-5 glass space-y-3">
                  <h2 className="font-oswald text-base font-semibold text-white tracking-wide flex items-center gap-2">
                    <Icon name="Zap" size={18} className="text-yellow-400" />
                    Быстрые шаблоны
                  </h2>
                  <div className="space-y-2">
                    {TEMPLATES.slice(0, 4).map((t, i) => (
                      <button key={t.id} onClick={() => setText(t.text)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg transition-all hover:opacity-90 animate-fade-in stagger-${i + 1}`}
                        style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))" }}>
                        <div className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${t.category === "Срочное" ? "text-red-400" : t.category === "Стандарт" ? "text-blue-400" : "text-green-400"}`}>
                          {t.category}
                        </div>
                        <div className="text-xs font-semibold text-foreground">{t.name}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{t.text}</div>
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setSection("templates")}
                    className="w-full py-2 text-xs text-blue-400 hover:text-blue-300 transition-colors text-center">
                    Все шаблоны →
                  </button>
                </div>
              </div>

              {/* Recent history */}
              <div className="gradient-border rounded-2xl p-5 glass">
                <h2 className="font-oswald text-base font-semibold text-white tracking-wide flex items-center gap-2 mb-4">
                  <Icon name="History" size={18} className="text-violet-400" />
                  Последние объявления
                </h2>
                <div className="space-y-2">
                  {HISTORY_DATA.slice(0, 3).map((item, i) => (
                    <div key={item.id}
                      className={`flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-muted/30 transition-all animate-fade-in stagger-${i + 1}`}
                      style={{ background: "rgba(255,255,255,0.03)" }}>
                      <span className="text-xs font-mono text-muted-foreground w-10 flex-shrink-0">{item.time}</span>
                      <span className="flex-1 text-sm text-foreground line-clamp-1 min-w-0">{item.text}</span>
                      <span className="text-xs px-2 py-1 rounded-full flex-shrink-0"
                        style={{ background: "rgba(59,130,246,0.15)", color: "var(--neon-blue)" }}>
                        {item.zone}
                      </span>
                      <span className="text-xs text-muted-foreground flex-shrink-0 flex items-center gap-1">
                        <Icon name="User" size={11} /> {item.voice}
                      </span>
                      <button onClick={() => setText(item.text)}
                        className="text-muted-foreground hover:text-blue-400 transition-colors flex-shrink-0">
                        <Icon name="RotateCcw" size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* === TEMPLATES === */}
          {/* === TRAINS === */}
          {section === "trains" && <Trains />}

          {section === "templates" && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{TEMPLATES.length} шаблонов сохранено</p>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
                  style={{ background: "linear-gradient(135deg, var(--neon-blue), var(--neon-violet))" }}>
                  <Icon name="Plus" size={15} /> Новый шаблон
                </button>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {TEMPLATES.map((t, i) => (
                  <div key={t.id}
                    className={`gradient-border rounded-2xl p-5 glass space-y-3 hover:scale-[1.01] transition-all cursor-pointer animate-fade-in stagger-${(i % 5) + 1}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2 ${t.category === "Срочное" ? "bg-red-500/20 text-red-400" : t.category === "Стандарт" ? "bg-blue-500/20 text-blue-400" : "bg-green-500/20 text-green-400"}`}>
                          {t.category}
                        </div>
                        <h3 className="font-oswald text-lg font-semibold text-white">{t.name}</h3>
                      </div>
                      <Icon name="FileText" size={20} className="text-muted-foreground/40 mt-1" />
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{t.text}</p>
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => { setText(t.text); setSection("dashboard"); }}
                        className="flex-1 py-2 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90"
                        style={{ background: "linear-gradient(135deg, var(--neon-blue), var(--neon-violet))" }}>
                        Использовать
                      </button>
                      <button className="px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors"
                        style={{ background: "hsl(var(--muted))" }}>
                        <Icon name="Pencil" size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* === HISTORY === */}
          {section === "history" && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input placeholder="Поиск по тексту объявления..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }} />
                </div>
                <button className="px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                  style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))" }}>
                  <Icon name="Filter" size={15} /> Фильтр
                </button>
                <button className="px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                  style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))" }}>
                  <Icon name="Download" size={15} /> Экспорт
                </button>
              </div>

              <div className="gradient-border rounded-2xl glass overflow-hidden">
                <div className="flex items-center gap-4 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/40">
                  <span className="w-10 flex-shrink-0">Время</span>
                  <span className="flex-1">Текст</span>
                  <span className="w-28 flex-shrink-0">Зона</span>
                  <span className="w-24 flex-shrink-0">Голос</span>
                  <span className="w-14 flex-shrink-0">Длит.</span>
                  <span className="w-8 flex-shrink-0"></span>
                </div>
                {HISTORY_DATA.map((item, i) => (
                  <div key={item.id}
                    className={`flex items-center gap-4 px-5 py-4 border-b border-border/20 hover:bg-muted/20 transition-all animate-fade-in stagger-${(i % 5) + 1}`}>
                    <span className="text-xs font-mono text-muted-foreground w-10 flex-shrink-0">{item.time}</span>
                    <span className="flex-1 text-sm text-foreground line-clamp-1 min-w-0">{item.text}</span>
                    <span className="w-28 flex-shrink-0">
                      <span className="text-xs px-2 py-1 rounded-full"
                        style={{ background: "rgba(59,130,246,0.15)", color: "var(--neon-blue)" }}>
                        {item.zone}
                      </span>
                    </span>
                    <span className="text-xs text-muted-foreground w-24 flex-shrink-0 flex items-center gap-1">
                      <Icon name="User" size={11} /> {item.voice}
                    </span>
                    <span className="text-xs text-muted-foreground w-14 flex-shrink-0">0:{8 + i * 3}с</span>
                    <div className="w-8 flex-shrink-0">
                      <button onClick={() => { setText(item.text); setSection("dashboard"); }}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-blue-400 transition-colors">
                        <Icon name="RotateCcw" size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-xs text-muted-foreground text-center py-2">
                Показано {HISTORY_DATA.length} из {HISTORY_DATA.length} записей
              </div>
            </div>
          )}

          {/* === LIBRARY === */}
          {section === "library" && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{LIBRARY.length} файлов в библиотеке</p>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    style={{ border: "1px solid hsl(var(--border))" }}>
                    <Icon name="Upload" size={15} /> Загрузить
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
                    style={{ background: "linear-gradient(135deg, var(--neon-blue), var(--neon-violet))" }}>
                    <Icon name="Mic" size={15} /> Записать
                  </button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {LIBRARY.map((item, i) => {
                  const isSound = item.type === "Звук";
                  const isMusic = item.type === "Музыка";
                  const iconColor = isSound ? "var(--neon-cyan)" : isMusic ? "var(--neon-violet)" : "var(--neon-blue)";
                  const iconBg = isSound ? "rgba(6,182,212,0.18)" : isMusic ? "rgba(139,92,246,0.18)" : "rgba(59,130,246,0.18)";
                  const iconName = isSound ? "Bell" : isMusic ? "Music" : "Mic2";
                  return (
                    <div key={item.id}
                      className={`gradient-border rounded-2xl p-5 glass space-y-4 hover:scale-[1.01] transition-all animate-fade-in stagger-${(i % 5) + 1}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: iconBg }}>
                          <Icon name={iconName} size={20} style={{ color: iconColor }} />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-sm text-foreground truncate">{item.name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{item.type} · {item.size}</div>
                        </div>
                      </div>

                      {/* Fake waveform */}
                      <div className="flex items-center gap-0.5 h-8">
                        {[...Array(30)].map((_, j) => (
                          <div key={j} className="flex-1 rounded-full"
                            style={{
                              height: `${16 + Math.sin(j * 0.9 + i * 1.5) * 10}px`,
                              background: `linear-gradient(to top, ${iconColor}88, ${iconColor}33)`
                            }} />
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Icon name="Clock" size={11} /> {item.duration}
                        </span>
                        <div className="flex gap-1">
                          <button className="p-2 rounded-lg text-muted-foreground hover:text-blue-400 transition-colors"
                            style={{ background: "hsl(var(--muted))" }}>
                            <Icon name="Play" size={13} />
                          </button>
                          <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                            style={{ background: "hsl(var(--muted))" }}>
                            <Icon name="Download" size={13} />
                          </button>
                          <button className="p-2 rounded-lg text-muted-foreground hover:text-red-400 transition-colors"
                            style={{ background: "hsl(var(--muted))" }}>
                            <Icon name="Trash2" size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* === SETTINGS === */}
          {section === "settings" && (
            <div className="max-w-2xl space-y-5 animate-fade-in">
              {/* TTS settings */}
              <div className="gradient-border rounded-2xl p-6 glass animate-fade-in stagger-1">
                <h2 className="font-oswald text-base font-semibold text-white tracking-wide flex items-center gap-2 mb-5">
                  <Icon name="Mic" size={18} className="text-blue-400" />
                  Синтез речи
                </h2>
                <div className="space-y-5">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">Голос по умолчанию</label>
                    <select value={selectedVoice} onChange={e => setSelectedVoice(e.target.value)}
                      className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                      style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}>
                      <option>Алина</option><option>Максим</option><option>Дмитрий</option><option>Екатерина</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">Язык объявлений</label>
                    <div className="flex gap-2">
                      {["Русский", "English", "Deutsch"].map(l => (
                        <button key={l} onClick={() => setLanguage(l)}
                          className="px-4 py-2 rounded-lg text-sm transition-all font-medium"
                          style={{
                            background: language === l ? "linear-gradient(135deg, var(--neon-blue), var(--neon-violet))" : "hsl(var(--muted))",
                            color: language === l ? "white" : "hsl(var(--muted-foreground))",
                            border: `1px solid ${language === l ? "transparent" : "hsl(var(--border))"}`,
                          }}>
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">Скорость речи: {speed.toFixed(1)}x</label>
                    <input type="range" min={0.5} max={2} step={0.1} value={speed}
                      onChange={e => setSpeed(parseFloat(e.target.value))}
                      className="w-full accent-blue-500" />
                  </div>
                </div>
              </div>

              {/* Volume settings */}
              <div className="gradient-border rounded-2xl p-6 glass animate-fade-in stagger-2">
                <h2 className="font-oswald text-base font-semibold text-white tracking-wide flex items-center gap-2 mb-5">
                  <Icon name="Volume2" size={18} className="text-blue-400" />
                  Звук и громкость
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">Громкость: {volume}%</label>
                    <input type="range" min={0} max={100} value={volume}
                      onChange={e => setVolume(parseInt(e.target.value))}
                      className="w-full accent-blue-500" />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl cursor-pointer"
                    style={{ background: "hsl(var(--muted))" }}
                    onClick={() => setSignalEnabled(!signalEnabled)}>
                    <div>
                      <div className="text-sm font-medium text-foreground">Сигнал перед объявлением</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Короткий звуковой сигнал</div>
                    </div>
                    <div className="w-11 h-6 rounded-full relative transition-colors flex-shrink-0"
                      style={{ background: signalEnabled ? "linear-gradient(135deg, var(--neon-blue), var(--neon-violet))" : "hsl(var(--border))" }}>
                      <div className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
                        style={{ left: signalEnabled ? "calc(100% - 20px)" : "4px" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Zones */}
              <div className="gradient-border rounded-2xl p-6 glass animate-fade-in stagger-3">
                <h2 className="font-oswald text-base font-semibold text-white tracking-wide flex items-center gap-2 mb-5">
                  <Icon name="MapPin" size={18} className="text-blue-400" />
                  Зоны вещания
                </h2>
                <div className="space-y-2">
                  {["Все зоны", "Терминал A", "Терминал B", "Прилёт", "Вылет", "VIP-зал"].map((zone, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid hsl(var(--border)/0.5)" }}>
                      <div className="flex items-center gap-2">
                        <Icon name="MapPin" size={14} className="text-blue-400" />
                        <span className="text-sm text-foreground">{zone}</span>
                      </div>
                      <div className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: i < 5 ? "rgba(16,185,129,0.15)" : "rgba(100,100,100,0.15)",
                          color: i < 5 ? "#34d399" : "hsl(var(--muted-foreground))"
                        }}>
                        {i < 5 ? "Активна" : "Откл."}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, var(--neon-blue), var(--neon-violet))" }}>
                Сохранить настройки
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}