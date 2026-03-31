export type ArchiveSummary = {
  generation: number
  year: number
  attendanceCount: number | null
  prSubmitters: number
  prSubmissionPairs: number
  archiveSubmitters: number
  archivePairs: number
  collectedFiles: number
  supplementalFiles: number
  verificationBasis: string
  prLevelCounts: Record<string, number>
  archiveLevelCounts: Record<string, number>
  missingPairs: number
  extraPairs: number
}

export const archiveSummaries: Record<number, ArchiveSummary> = {
  "1": {
    "generation": 1,
    "year": 2019,
    "attendanceCount": 45,
    "prSubmitters": 46,
    "prSubmissionPairs": 181,
    "archiveSubmitters": 46,
    "archivePairs": 181,
    "collectedFiles": 181,
    "supplementalFiles": 0,
    "verificationBasis": "GitHub merged PR 기준",
    "prLevelCounts": {
      "level1": 46,
      "level2": 45,
      "level3": 45,
      "level4": 45
    },
    "archiveLevelCounts": {
      "level1": 46,
      "level2": 45,
      "level3": 45,
      "level4": 45
    },
    "missingPairs": 0,
    "extraPairs": 0
  },
  "2": {
    "generation": 2,
    "year": 2020,
    "attendanceCount": 51,
    "prSubmitters": 50,
    "prSubmissionPairs": 195,
    "archiveSubmitters": 47,
    "archivePairs": 177,
    "collectedFiles": 190,
    "supplementalFiles": 13,
    "verificationBasis": "GitHub merged PR 기준",
    "prLevelCounts": {
      "level1": 50,
      "level2": 49,
      "level3": 48,
      "level4": 48
    },
    "archiveLevelCounts": {
      "level1": 43,
      "level2": 42,
      "level3": 41,
      "level4": 40,
      "unclassified": 24
    },
    "missingPairs": 57,
    "extraPairs": 39
  },
  "3": {
    "generation": 3,
    "year": 2021,
    "attendanceCount": 78,
    "prSubmitters": 77,
    "prSubmissionPairs": 257,
    "archiveSubmitters": 67,
    "archivePairs": 224,
    "collectedFiles": 232,
    "supplementalFiles": 8,
    "verificationBasis": "GitHub merged PR 기준",
    "prLevelCounts": {
      "level1": 75,
      "level2": 76,
      "level3": 75,
      "level4": 31
    },
    "archiveLevelCounts": {
      "level1": 66,
      "level2": 65,
      "level3": 64,
      "level4": 24,
      "unclassified": 13
    },
    "missingPairs": 55,
    "extraPairs": 22
  },
  "4": {
    "generation": 4,
    "year": 2022,
    "attendanceCount": 116,
    "prSubmitters": 116,
    "prSubmissionPairs": 354,
    "archiveSubmitters": 114,
    "archivePairs": 348,
    "collectedFiles": 351,
    "supplementalFiles": 3,
    "verificationBasis": "GitHub merged PR 기준",
    "prLevelCounts": {
      "level1": 116,
      "level2": 115,
      "level3": 115,
      "level4": 8
    },
    "archiveLevelCounts": {
      "level1": 114,
      "level2": 112,
      "level3": 110,
      "level4": 10,
      "unclassified": 5
    },
    "missingPairs": 26,
    "extraPairs": 20
  },
  "5": {
    "generation": 5,
    "year": 2023,
    "attendanceCount": 170,
    "prSubmitters": 170,
    "prSubmissionPairs": 524,
    "archiveSubmitters": 163,
    "archivePairs": 510,
    "collectedFiles": 522,
    "supplementalFiles": 12,
    "verificationBasis": "GitHub merged PR 기준",
    "prLevelCounts": {
      "level1": 169,
      "level2": 167,
      "level3": 25,
      "level4": 163
    },
    "archiveLevelCounts": {
      "level1": 158,
      "level2": 155,
      "level3": 27,
      "level4": 144,
      "level5": 3,
      "unclassified": 35
    },
    "missingPairs": 65,
    "extraPairs": 51
  },
  "6": {
    "generation": 6,
    "year": 2024,
    "attendanceCount": 140,
    "prSubmitters": 140,
    "prSubmissionPairs": 552,
    "archiveSubmitters": 140,
    "archivePairs": 545,
    "collectedFiles": 545,
    "supplementalFiles": 0,
    "verificationBasis": "GitHub merged PR 기준 (공유 저장소 연도 분리)",
    "prLevelCounts": {
      "level1": 139,
      "level2": 139,
      "level3": 137,
      "technical-writing": 137
    },
    "archiveLevelCounts": {
      "level1": 139,
      "level2": 138,
      "level3": 138,
      "technical-writing": 130
    },
    "missingPairs": 25,
    "extraPairs": 18
  },
  "7": {
    "generation": 7,
    "year": 2025,
    "attendanceCount": null,
    "prSubmitters": 144,
    "prSubmissionPairs": 285,
    "archiveSubmitters": 144,
    "archivePairs": 286,
    "collectedFiles": 286,
    "supplementalFiles": 0,
    "verificationBasis": "GitHub merged PR 기준 (공유 저장소 연도 분리)",
    "prLevelCounts": {
      "level1": 143,
      "level2": 142
    },
    "archiveLevelCounts": {
      "level1": 144,
      "level2": 142
    },
    "missingPairs": 8,
    "extraPairs": 9
  }
}
