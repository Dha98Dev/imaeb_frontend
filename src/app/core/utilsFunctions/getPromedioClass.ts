export function getPromedioClass(value: any): string {
    const promedio = Number(value);

    if (promedio >= 90) return 'bg-emerald-100 text-emerald-700';
    if (promedio >= 80) return 'bg-green-100 text-green-700';
    if (promedio >= 70) return 'bg-yellow-100 text-yellow-700';
    if (promedio >= 60) return 'bg-orange-100 text-orange-700';

    return 'bg-red-100 text-red-700';
  }