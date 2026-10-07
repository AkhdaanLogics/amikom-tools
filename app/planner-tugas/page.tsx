"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Circle,
  ListTodo,
  Plus,
  Trash2,
} from "lucide-react";
import Toast from "@/components/toast";

type Assignment = {
  id: string;
  title: string;
  course: string;
  dueDate: string;
  completed: boolean;
};

const STORAGE_KEY = "amikom-tools.assignments.v1";

function isAssignmentList(value: unknown): value is Assignment[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        "id" in item &&
        typeof item.id === "string" &&
        "title" in item &&
        typeof item.title === "string" &&
        "course" in item &&
        typeof item.course === "string" &&
        "dueDate" in item &&
        typeof item.dueDate === "string" &&
        isValidDateString(item.dueDate) &&
        "completed" in item &&
        typeof item.completed === "boolean",
    )
  );
}

function isValidDateString(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseLocalDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatLocalDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  return `${day} ${monthNames[month - 1]} ${year}`;
}

function getDueLabel(dueDate: string) {
  const daysLeft = Math.round(
    (parseLocalDate(dueDate).getTime() -
      parseLocalDate(getLocalDateString()).getTime()) /
      86_400_000,
  );

  if (daysLeft < 0) return `Terlambat ${Math.abs(daysLeft)} hari`;
  if (daysLeft === 0) return "Tenggat hari ini";
  if (daysLeft === 1) return "Tenggat besok";
  return `${daysLeft} hari lagi`;
}

export default function PlannerTugasPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "info" | "success" | "error";
  } | null>(null);

  const showToast = (
    message: string,
    type: "info" | "success" | "error" = "info",
  ) => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        setDueDate(getLocalDateString());
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: unknown = JSON.parse(stored);
          if (!isAssignmentList(parsed)) {
            throw new Error("Format data planner tidak valid.");
          }
          setAssignments(parsed);
        }
      } catch (error) {
        console.error("Gagal memuat data planner tugas:", error);
        setToast({
          message: "Data tugas gagal dimuat dari browser.",
          type: "error",
        });
      } finally {
        setIsLoaded(true);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
    } catch (error) {
      console.error("Gagal menyimpan data planner tugas:", error);
      setToast({
        message: "Data tugas gagal disimpan. Periksa ruang penyimpanan browser.",
        type: "error",
      });
    }
  }, [assignments, isLoaded]);

  const visibleAssignments = useMemo(
    () =>
      assignments
        .filter((assignment) => showCompleted || !assignment.completed)
        .sort((a, b) => {
          if (a.completed !== b.completed) return a.completed ? 1 : -1;
          return a.dueDate.localeCompare(b.dueDate);
        }),
    [assignments, showCompleted],
  );

  const pendingCount = assignments.filter(
    (assignment) => !assignment.completed,
  ).length;
  const overdueCount = assignments.filter(
    (assignment) =>
      !assignment.completed && assignment.dueDate < getLocalDateString(),
  ).length;

  const addAssignment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanTitle = title.trim();
    const cleanCourse = course.trim();

    if (!cleanTitle || !cleanCourse || !dueDate) {
      showToast("Lengkapi nama tugas, mata kuliah, dan tenggat.", "error");
      return;
    }

    setAssignments((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        title: cleanTitle,
        course: cleanCourse,
        dueDate,
        completed: false,
      },
    ]);
    setTitle("");
    setCourse("");
    setDueDate(getLocalDateString());
    showToast("Tugas berhasil ditambahkan.", "success");
  };

  const toggleAssignment = (id: string) => {
    setAssignments((current) =>
      current.map((assignment) =>
        assignment.id === id
          ? { ...assignment, completed: !assignment.completed }
          : assignment,
      ),
    );
  };

  const deleteAssignment = (id: string) => {
    setAssignments((current) =>
      current.filter((assignment) => assignment.id !== id),
    );
    showToast("Tugas dihapus.", "info");
  };

  return (
    <main className="min-h-screen bg-transparent px-4 pb-16 pt-24 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-6xl">
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 rounded-xl border border-orange-200 bg-white px-4 py-2.5 text-sm font-semibold text-orange-800 transition hover:border-orange-400 hover:bg-orange-50"
        >
          <ArrowLeft size={16} />
          Kembali ke Beranda
        </Link>

        <header className="mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
            <ListTodo size={24} />
          </div>
          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-orange-700">
            Biar deadline tidak terlewat
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
            Planner Tugas
          </h1>
          <p className="mt-3 max-w-2xl leading-7 text-slate-600">
            Catat tugas kuliah, pantau tenggat, lalu tandai setelah selesai.
            Data tersimpan di browser yang sedang kamu gunakan.
          </p>
        </header>

        <section className="mb-6 grid gap-4 sm:grid-cols-2">
          <SummaryCard label="Tugas belum selesai" value={pendingCount} />
          <SummaryCard
            label="Tugas terlambat"
            value={overdueCount}
            warning={overdueCount > 0}
          />
        </section>

        <div className="grid items-start gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <form
            onSubmit={addAssignment}
            className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm sm:p-6"
          >
            <h2 className="text-lg font-semibold text-slate-950">
              Tambah tugas
            </h2>
            <label className="mt-5 block text-sm font-medium text-slate-700">
              Nama tugas
              <input
                required
                maxLength={120}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Contoh: Makalah etika profesi"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              />
            </label>
            <label className="mt-4 block text-sm font-medium text-slate-700">
              Mata kuliah
              <input
                required
                maxLength={80}
                value={course}
                onChange={(event) => setCourse(event.target.value)}
                placeholder="Contoh: Etika Profesi"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              />
            </label>
            <label className="mt-4 block text-sm font-medium text-slate-700">
              Tenggat
              <input
                required
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              />
            </label>
            <button
              type="submit"
              disabled={!isLoaded}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
            >
              <Plus size={17} />
              Tambahkan tugas
            </button>
          </form>

          <section className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  Daftar tugas
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Urut berdasarkan tenggat terdekat.
                </p>
              </div>
              <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={showCompleted}
                  onChange={(event) => setShowCompleted(event.target.checked)}
                  className="h-4 w-4 accent-orange-600"
                />
                Tampilkan selesai
              </label>
            </div>

            {!isLoaded ? (
              <p className="mt-8 text-center text-sm text-slate-500">
                Memuat tugas...
              </p>
            ) : visibleAssignments.length === 0 ? (
              <div className="mt-8 rounded-xl border border-dashed border-slate-200 px-5 py-10 text-center">
                <CalendarDays className="mx-auto text-orange-500" size={26} />
                <p className="mt-3 font-medium text-slate-800">
                  {assignments.length === 0
                    ? "Belum ada tugas dicatat."
                    : "Tidak ada tugas di daftar ini."}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Tambahkan tugas dan tenggatnya agar mudah dipantau.
                </p>
              </div>
            ) : (
              <ul className="mt-5 space-y-3">
                {visibleAssignments.map((assignment) => {
                  const isOverdue =
                    !assignment.completed &&
                    assignment.dueDate < getLocalDateString();

                  return (
                    <li
                      key={assignment.id}
                      className={`flex items-start gap-3 rounded-xl border p-4 ${
                        assignment.completed
                          ? "border-slate-200 bg-slate-50"
                          : isOverdue
                            ? "border-red-200 bg-red-50/60"
                            : "border-slate-200 bg-white"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleAssignment(assignment.id)}
                        aria-label={
                          assignment.completed
                            ? `Tandai ${assignment.title} belum selesai`
                            : `Tandai ${assignment.title} selesai`
                        }
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition ${
                          assignment.completed
                            ? "border-green-600 bg-green-600 text-white"
                            : "border-slate-300 text-transparent hover:border-orange-500"
                        }`}
                      >
                        {assignment.completed ? (
                          <Check size={14} />
                        ) : (
                          <Circle size={14} />
                        )}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p
                          className={`break-words font-medium ${
                            assignment.completed
                              ? "text-slate-500 line-through"
                              : "text-slate-900"
                          }`}
                        >
                          {assignment.title}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {assignment.course}
                        </p>
                        <p
                          className={`mt-2 text-xs font-medium ${
                            isOverdue ? "text-red-700" : "text-slate-500"
                          }`}
                        >
                          {formatLocalDate(assignment.dueDate)}
                          {" · "}
                          {assignment.completed
                            ? "Selesai"
                            : getDueLabel(assignment.dueDate)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteAssignment(assignment.id)}
                        aria-label={`Hapus ${assignment.title}`}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={17} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function SummaryCard({
  label,
  value,
  warning = false,
}: {
  label: string;
  value: number;
  warning?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-600">{label}</p>
      <p
        className={`mt-2 text-3xl font-bold ${
          warning ? "text-red-700" : "text-slate-950"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
