"use client";

import { useState } from "react";
import { Calculator, Plus, Trash2, BarChart3, ArrowLeft } from "lucide-react";
import Toast from "@/components/toast";
import Link from "next/link";

type Course = {
  id: number;
  name: string;
  credits: number;
  grade: string;
};

type GradingSystem = "standard" | "amikom";

const gradePointsStandard: { [key: string]: number } = {
  A: 4.0,
  "A-": 3.7,
  "B+": 3.3,
  B: 3.0,
  "B-": 2.7,
  "C+": 2.3,
  C: 2.0,
  "C-": 1.7,
  D: 1.0,
  E: 0.0,
};

const gradePointsAmikom: { [key: string]: number } = {
  A: 4.0,
  B: 3.0,
  C: 2.0,
  D: 1.0,
  E: 0.0,
};

export default function KalkulatorIPKPage() {
  return <KalkulatorIPKContent />;
}

function KalkulatorIPKContent() {
  const [gradingSystem, setGradingSystem] = useState<GradingSystem>("amikom");
  const [courses, setCourses] = useState<Course[]>([
    { id: 1, name: "", credits: 3, grade: "A" },
  ]);
  const [toast, setToast] = useState<{
    message: string;
    type: "info" | "success" | "error";
  } | null>(null);

  const gradePoints =
    gradingSystem === "amikom" ? gradePointsAmikom : gradePointsStandard;

  const showToast = (
    message: string,
    type: "info" | "success" | "error" = "info",
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const addCourse = () => {
    const newId = Math.max(...courses.map((c) => c.id), 0) + 1;
    setCourses([...courses, { id: newId, name: "", credits: 3, grade: "A" }]);
  };

  const removeCourse = (id: number) => {
    if (courses.length === 1) {
      showToast("Minimal harus ada 1 mata kuliah", "error");
      return;
    }
    setCourses(courses.filter((c) => c.id !== id));
  };

  const updateCourse = (
    id: number,
    field: keyof Course,
    value: string | number,
  ) => {
    setCourses(
      courses.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    );
  };

  const calculateGPA = () => {
    const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);
    if (totalCredits === 0) return 0;

    const totalPoints = courses.reduce(
      (sum, c) => sum + c.credits * gradePoints[c.grade],
      0,
    );

    return parseFloat((totalPoints / totalCredits).toFixed(2));
  };

  const getTotalCredits = () => {
    return courses.reduce((sum, c) => sum + c.credits, 0);
  };

  const getGradeDistribution = () => {
    const distribution: { [key: string]: number } = {};
    courses.forEach((c) => {
      distribution[c.grade] = (distribution[c.grade] || 0) + 1;
    });
    return distribution;
  };

  const resetAll = () => {
    setCourses([{ id: 1, name: "", credits: 3, grade: "A" }]);
    showToast("Data berhasil direset", "success");
  };

  const gpa = calculateGPA().toFixed(2);
  const totalCredits = getTotalCredits();
  const gradeDistribution = getGradeDistribution();

  return (
    <main className="min-h-screen bg-slate-950 text-white pt-20">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.35),_transparent_55%)]" />
        <div className="absolute -top-32 right-0 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute top-40 -left-20 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative container mx-auto px-4 py-16">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white/90 transition-all hover:bg-white/10"
          >
            <ArrowLeft size={16} />
            Kembali ke Beranda
          </Link>
          <div className="mb-12 text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-purple-600/20 p-4">
                <Calculator size={48} className="text-purple-400" />
              </div>
            </div>
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">
              Kalkulator IPK
            </h1>
            <p className="text-purple-200">
              Hitung Indeks Prestasi Kumulatif dengan mudah dan akurat
            </p>
          </div>

          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_300px]">
            {/* Input Section */}
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 md:p-8">
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h2 className="text-2xl font-bold">Daftar Mata Kuliah</h2>
                <div className="flex items-center gap-3">
                  {/* Grading System Toggle */}
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-1">
                    <button
                      onClick={() => setGradingSystem("amikom")}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                        gradingSystem === "amikom"
                          ? "bg-purple-600 text-white"
                          : "text-white/70 hover:text-white"
                      }`}
                    >
                      AMIKOM
                    </button>
                    <button
                      onClick={() => setGradingSystem("standard")}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                        gradingSystem === "standard"
                          ? "bg-purple-600 text-white"
                          : "text-white/70 hover:text-white"
                      }`}
                    >
                      Standar
                    </button>
                  </div>
                  <button
                    onClick={resetAll}
                    className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white/90 transition-all hover:bg-white/10"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* System Info */}
              <div className="mb-4 rounded-xl border border-purple-400/20 bg-purple-400/10 p-3">
                <p className="text-xs text-purple-100">
                  <strong>Sistem:</strong>{" "}
                  {gradingSystem === "amikom"
                    ? "AMIKOM (A, B, C, D, E)"
                    : "Standar 4.0 (A, A-, B+, B, B-, C+, C, C-, D, E)"}
                </p>
              </div>

              {/* Table Header */}
              <div className="mb-3 grid grid-cols-[1fr_100px_120px_50px] gap-3 text-sm font-semibold text-purple-200">
                <div>Nama Mata Kuliah</div>
                <div className="text-center">SKS</div>
                <div className="text-center">Nilai</div>
                <div></div>
              </div>

              {/* Courses List */}
              <div className="space-y-3">
                {courses.map((course, index) => (
                  <div
                    key={course.id}
                    className="grid grid-cols-[1fr_100px_120px_50px] gap-3"
                  >
                    <input
                      type="text"
                      value={course.name}
                      onChange={(e) =>
                        updateCourse(course.id, "name", e.target.value)
                      }
                      placeholder={`Mata Kuliah ${index + 1}`}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-purple-300/50 focus:border-purple-400 focus:outline-none"
                    />
                    <input
                      type="number"
                      min="1"
                      max="6"
                      value={course.credits}
                      onChange={(e) =>
                        updateCourse(
                          course.id,
                          "credits",
                          parseInt(e.target.value) || 1,
                        )
                      }
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-center text-white focus:border-purple-400 focus:outline-none"
                    />
                    <select
                      value={course.grade}
                      onChange={(e) =>
                        updateCourse(course.id, "grade", e.target.value)
                      }
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-purple-400 focus:outline-none"
                    >
                      {Object.keys(gradePoints).map((grade) => (
                        <option
                          key={grade}
                          value={grade}
                          className="bg-slate-900"
                        >
                          {grade}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => removeCourse(course.id)}
                      className="flex items-center justify-center rounded-xl border border-white/20 text-white/90 transition-all hover:bg-red-500/20 hover:border-red-500/50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={addCourse}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 px-5 py-3 text-sm font-semibold text-white/90 transition-all hover:bg-white/10"
              >
                <Plus size={18} />
                Tambah Mata Kuliah
              </button>

              {/* Grade Legend */}
              <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="mb-3 text-sm font-semibold text-purple-200">
                  Skala Nilai:
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs text-purple-100/70 md:grid-cols-5">
                  {Object.entries(gradePoints).map(([grade, point]) => (
                    <div key={grade}>
                      <span className="font-semibold text-white">{grade}</span>{" "}
                      = {point.toFixed(1)}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Result Section */}
            <div className="space-y-6">
              {/* IPK Display */}
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
                <div className="mb-2 flex items-center gap-2 text-sm text-purple-200">
                  <BarChart3 size={16} />
                  <span>IPK Anda</span>
                </div>
                <div className="text-5xl font-bold text-white">{gpa}</div>
                <div className="mt-2 text-sm text-purple-100/70">dari 4.00</div>
                <div
                  className={`mt-4 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                    parseFloat(gpa) >= 3.5
                      ? "bg-green-500/20 text-green-300"
                      : parseFloat(gpa) >= 3.0
                        ? "bg-blue-500/20 text-blue-300"
                        : parseFloat(gpa) >= 2.5
                          ? "bg-yellow-500/20 text-yellow-300"
                          : "bg-red-500/20 text-red-300"
                  }`}
                >
                  {parseFloat(gpa) >= 3.5
                    ? "Cumlaude"
                    : parseFloat(gpa) >= 3.0
                      ? "Sangat Memuaskan"
                      : parseFloat(gpa) >= 2.5
                        ? "Memuaskan"
                        : "Perlu Peningkatan"}
                </div>
              </div>

              {/* Total Credits */}
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
                <div className="text-sm text-purple-200">Total SKS</div>
                <div className="mt-1 text-3xl font-bold text-white">
                  {totalCredits}
                </div>
                <div className="mt-2 text-xs text-purple-100/70">
                  SKS diambil semester ini
                </div>
              </div>

              {/* Grade Distribution */}
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
                <div className="mb-4 text-sm font-semibold text-purple-200">
                  Distribusi Nilai
                </div>
                <div className="space-y-2">
                  {Object.entries(gradeDistribution)
                    .sort((a, b) => gradePoints[b[0]] - gradePoints[a[0]])
                    .map(([grade, count]) => (
                      <div
                        key={grade}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="font-semibold text-white">
                          {grade}
                        </span>
                        <span className="text-purple-100/70">
                          {count} matkul
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="mx-auto mt-12 max-w-4xl">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
                <h3 className="mb-2 font-semibold">Akurat</h3>
                <p className="text-sm text-purple-100/70">
                  Perhitungan menggunakan skala 4.0 standar perguruan tinggi
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
                <h3 className="mb-2 font-semibold">Real-time</h3>
                <p className="text-sm text-purple-100/70">
                  Hasil IPK langsung dihitung saat input data
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
                <h3 className="mb-2 font-semibold">Privasi Aman</h3>
                <p className="text-sm text-purple-100/70">
                  Data tidak disimpan di server, hanya di browser Anda
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
