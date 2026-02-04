"use client";

export function isStudentEmail(email: string | null): boolean {
  if (!email) return false;
  return email.endsWith("@students.amikom.ac.id");
}

export function validateStudentAccess(
  userEmail: string | null,
  onError: (message: string) => void,
): boolean {
  if (!userEmail) {
    onError("Kamu harus login terlebih dahulu untuk mengakses fitur ini.");
    return false;
  }

  if (!isStudentEmail(userEmail)) {
    onError(
      "Fitur ini hanya untuk mahasiswa AMIKOM. Gunakan email dengan format @students.amikom.ac.id",
    );
    return false;
  }

  return true;
}
