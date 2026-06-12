type AppData = any;

export const computeGenderDistribution = (apps: AppData[]) => {
  const counts: Record<string, number> = {};
  for (const a of apps) {
    const g = a.user?.profile?.gender ?? "unknown";
    counts[g] = (counts[g] ?? 0) + 1;
  }
  return Object.entries(counts).map(([gender, count]) => ({ gender, count }));
};

export const computeAgeDistribution = (apps: AppData[]) => {
  const buckets: Record<string, number> = {
    "18-24": 0,
    "25-34": 0,
    "35-44": 0,
    "45+": 0,
    unknown: 0,
  };
  const today = new Date();
  for (const a of apps) {
    const bd = a.user?.profile?.birthDate;
    if (!bd) {
      buckets.unknown += 1;
      continue;
    }
    const age = today.getFullYear() - new Date(bd).getFullYear();
    if (age < 25) buckets["18-24"] += 1;
    else if (age < 35) buckets["25-34"] += 1;
    else if (age < 45) buckets["35-44"] += 1;
    else buckets["45+"] += 1;
  }
  return Object.entries(buckets).map(([ageGroup, count]) => ({
    ageGroup,
    count,
  }));
};

export const computeByCategory = (apps: AppData[]) => {
  const counts: Record<string, number> = {};
  for (const a of apps) {
    const cat = a.job?.category?.name ?? "Uncategorized";
    counts[cat] = (counts[cat] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([category, count]) => ({ category, count }))
    .sort((x, y) => y.count - x.count);
};

export const computeAvgSalaryByCategory = (apps: AppData[]) => {
  const sums: Record<string, { total: number; count: number }> = {};
  for (const a of apps) {
    if (!a.expectedSalary) continue;
    const cat = a.job?.category?.name ?? "Uncategorized";
    sums[cat] ??= { total: 0, count: 0 };
    sums[cat].total += Number(a.expectedSalary);
    sums[cat].count += 1;
  }
  return Object.entries(sums)
    .map(([category, { total, count }]) => ({
      category,
      avgExpectedSalary: Math.round(total / count),
    }))
    .sort((x, y) => y.avgExpectedSalary - x.avgExpectedSalary);
};

export const computeTopCities = (apps: AppData[]) => {
  const counts: Record<string, number> = {};
  for (const a of apps) {
    const city = a.job?.city ?? "Unknown";
    counts[city] = (counts[city] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([city, count]) => ({ city, count }))
    .sort((x, y) => y.count - x.count)
    .slice(0, 10);
};

export const computeEducationDistribution = (apps: AppData[]) => {
  const counts: Record<string, number> = {};
  for (const a of apps) {
    const edu = a.user?.profile?.education ?? "Not specified";
    counts[edu] = (counts[edu] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([education, count]) => ({ education, count }))
    .sort((x, y) => y.count - x.count);
};
