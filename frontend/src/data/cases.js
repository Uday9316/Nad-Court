// Real Monad Community Cases - 1 case per day to minimize AI costs
export const COMMUNITY_CASES = [
  {
    id: "BEEF-4760",
    day: 1,
    type: "Beef Resolution",
    plaintiff: {
      username: "Bitlover082",
      id: 138,
      description: "A long time OG member of the Monad Community, creating his own lore of Banana Milk. Accidentally purged by JWRK once but is a SURVIVOR!!"
    },
    defendant: {
      username: "0xCoha", 
      id: 747,
      description: "Contributing to the Nads and the Vietnads through different bots and a Nadlist"
    },
    summary: "@Bitlover082 and @0xCoha have been engaged in an ongoing beef. The court must determine who is in the right and resolve the conflict.",
    evidence: [
      "Plaintiff was previously purged but survived",
      "Defendant contributes via bots and Nadlist",
      "Both are active community members"
    ],
    status: "pending"
  },
  {
    id: "COMM-8792",
    day: 2,
    type: "Community Conflict",
    plaintiff: {
      username: "_gvan",
      id: 1,
      description: "Top Nadtard in house of molandak, helped found the Vans"
    },
    defendant: {
      username: "Anubiss29",
      id: 99,
      description: "frequently saying Fock the Vans and also apart of the Bikes, which spawned to take down the Vans. Apart of the growing Spanish Chad Nads"
    },
    summary: "@_gvan (Vans cult) and @Anubiss29 (Bikes) are in conflict over community resources and influence.",
    evidence: [
      "Plaintiff founded the Vans community",
      "Defendant leads Bikes which opposes Vans",
      "Dispute over community privileges"
    ],
    status: "pending"
  },
  {
    id: "ROLE-2341",
    day: 3,
    type: "Role Assignment Dispute",
    plaintiff: {
      username: "0xOlivia",
      id: 62,
      description: "Leader of the Benelux Nads and founding member of Birbie, one of the great MonAnimals"
    },
    defendant: {
      username: "xEfscarpmint",
      id: 779,
      description: "On the Kaito leaderboard as a top yappper in Monad, meeting the India Nads irl soon"
    },
    summary: "Both claim to be the leader of Benelux Nads. The court must determine who has the legitimate claim to leadership.",
    evidence: [
      "Plaintiff founded Benelux Nads and Birbie",
      "Defendant is top yapper on Kaito leaderboard",
      "Both claim leadership role"
    ],
    status: "pending"
  },
  {
    id: "ART-8323",
    day: 4,
    type: "Art Ownership Dispute",
    plaintiff: {
      username: "1Cilineth",
      id: 73,
      description: "Creating insanely degenerate memes and art of JWRK, in the Nads OG chat, and a great member of the VietNads community"
    },
    defendant: {
      username: "NikkiSixx_9",
      id: 451,
      description: "Rocking a really funny banner on twitter featuring the awkward meme, myself, JWRK and tunez. Apart of the growing TurkNads"
    },
    summary: "Plaintiff claims defendant stole their art concept for a community project. The court must determine the rightful owner.",
    evidence: [
      "Plaintiff is OG artist creating JWRK memes",
      "Defendant has banner with similar aesthetic",
      "Dispute over creative ownership"
    ],
    status: "pending"
  },
  {
    id: "PURGE-1948",
    day: 5,
    type: "Purge Appeal",
    plaintiff: {
      username: "BlurCrypto",
      id: 140,
      description: "once purged but made it back out of the trenches"
    },
    defendant: {
      username: "monadbull",
      id: 938,
      description: "in the OG telegram and a long time member of the community"
    },
    summary: "Plaintiff claims they were wrongfully purged from OG telegram chat. Court must determine if purge was justified.",
    evidence: [
      "Plaintiff was purged but survived",
      "Defendant is OG chat member",
      "Question of purge legitimacy"
    ],
    status: "pending"
  }
]

// Extended community members list (for future cases)
export const COMMUNITY_MEMBERS = [
  "keoneHD", "_gvan", "0xGleader", "0xGrimjow", "0xSkilly", "andalfthegreat",
  "berzan", "CosmaCloud", "doctorpreballin", "Evoyudhasamael", "fed_febri",
  "G_Or_well_1984", "gizmoatmidnight", "Hagen_web3", "jumplifey9", "kingloui",
  "leemo_nn", "mikeinweb", "mongdiny7", "port_dev", "saddamovic", "xyeraphim",
  "Andikur_x", "_Dreyville", "_Flasho_", "_kate_lv", "_maomao_zw", "_omgnicklachey",
  "_qudouz", "_Seven7777777", "_tolks", "_Uthmaan", "0x_luffya", "0x_PingPing",
  "0xAmne", "0xArich", "0xasnVn", "0xbaeksu", "0xBehnaZ1", "0xboba", "calwan",
  "0xCapybaraXBT", "0xChine", "0xdaniel", "0xDizzyLizzy", "0xDrewww", "0xEastofEden",
  "0xFerbs", "0xfs7", "0xh3xth", "0xKatev", "0xkaya_", "0xkaybu", "0xKemal1",
  "0xKika", "0xKulture", "0xlilmon", "0xlittlenada", "0xLivrein", "0xlKurosaki",
  "0xMike7", "0xneaf", "0xOlivia", "0xpotatoking", "0xRayJ", "0xsenjuro",
  "0xtequilaa", "0xunahh", "0xValeriee20", "0xWoah", "0xYowie", "0xZeydd",
  "zo_mon", "1Cilineth", "benjanad", "21stDaisy", "22cmdeamorrr", "2kayzee",
  "2red", "38kdotsol", "3isaak3", "3lphoe", "44inb4", "4y_ffff", "50tapanna",
  "a_aris_", "aadvark89", "adm1ralftw", "aedan_xyz", "Akichn_", "Akunwn",
  "alexDdopest", "alexi0s", "AlmonteAugustin", "alxxeth", "andybee_os",
  "Anna272493", "AnnafiWeb3", "antgeo13", "Anubiss29"
]

// Daily case processor - only runs 1 case per day
export function getTodayCase() {
  // In production, use actual date
  // const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24)
  // return COMMUNITY_CASES[dayOfYear % COMMUNITY_CASES.length]
  
  // For demo, return first case
  return COMMUNITY_CASES[0]
}

// Case status types
export const CASE_STATUS = {
  PENDING: 'pending',
  JUDGED: 'judged',
  VOTING: 'voting',
  RESOLVED: 'resolved',
  APPEALED: 'appealed'
}

// Verdict options
export const VERDICT_OPTIONS = [
  { value: 'plaintiff', label: 'Plaintiff Wins', color: '#22c55e' },
  { value: 'defendant', label: 'Defendant Wins', color: '#ef4444' },
  { value: 'dismissed', label: 'Case Dismissed', color: '#6b7280' },
  { value: 'settlement', label: 'Mutual Settlement', color: '#3b82f6' }
]