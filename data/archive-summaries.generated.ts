export type ArchiveSummary = {
  generation: number
  year: number
  submitters: number
  representativeSubmissions: number
  collectedFiles: number
  extras: number
  verificationBasis: string
  levelCounts: Record<string, number>
}

export const archiveSummaries: Record<number, ArchiveSummary> = {
  "1": {
    "generation": 1,
    "year": 2019,
    "submitters": 46,
    "representativeSubmissions": 181,
    "collectedFiles": 181,
    "extras": 0,
    "verificationBasis": "GitHub PR 기준",
    "levelCounts": {
      "level1": 46,
      "level2": 45,
      "level3": 45,
      "level4": 45
    }
  },
  "2": {
    "generation": 2,
    "year": 2020,
    "submitters": 47,
    "representativeSubmissions": 167,
    "collectedFiles": 190,
    "extras": 23,
    "verificationBasis": "브랜치 PR 커밋 로그 기준",
    "levelCounts": {
      "level1": 43,
      "level2": 42,
      "level3": 41,
      "level4": 40,
      "unclassified": 24
    }
  },
  "3": {
    "generation": 3,
    "year": 2021,
    "submitters": 67,
    "representativeSubmissions": 200,
    "collectedFiles": 232,
    "extras": 32,
    "verificationBasis": "브랜치 PR 커밋 로그 기준",
    "levelCounts": {
      "level1": 66,
      "level2": 65,
      "level3": 64,
      "level4": 24,
      "unclassified": 13
    }
  },
  "4": {
    "generation": 4,
    "year": 2022,
    "submitters": 114,
    "representativeSubmissions": 322,
    "collectedFiles": 351,
    "extras": 29,
    "verificationBasis": "브랜치 PR 커밋 로그 기준",
    "levelCounts": {
      "level1": 114,
      "level2": 112,
      "level3": 110,
      "level4": 10,
      "unclassified": 5
    }
  },
  "5": {
    "generation": 5,
    "year": 2023,
    "submitters": 163,
    "representativeSubmissions": 474,
    "collectedFiles": 522,
    "extras": 48,
    "verificationBasis": "브랜치 PR 커밋 로그 기준",
    "levelCounts": {
      "level1": 158,
      "level2": 155,
      "level3": 27,
      "level4": 144,
      "level5": 3,
      "unclassified": 35
    }
  },
  "6": {
    "generation": 6,
    "year": 2024,
    "submitters": 140,
    "representativeSubmissions": 545,
    "collectedFiles": 545,
    "extras": 0,
    "verificationBasis": "공유 저장소 브랜치 PR 커밋 로그 기준",
    "levelCounts": {
      "level1": 139,
      "level2": 138,
      "level3": 138,
      "technical-writing": 130
    }
  },
  "7": {
    "generation": 7,
    "year": 2025,
    "submitters": 144,
    "representativeSubmissions": 286,
    "collectedFiles": 286,
    "extras": 0,
    "verificationBasis": "공유 저장소 브랜치 PR 커밋 로그 기준",
    "levelCounts": {
      "level1": 144,
      "level2": 142
    }
  }
}
