const monsters = [
  {
    monster_id: 1,
    name_en: 'Squidge',
  },
  {
    monster_id: 2,
    name_en: 'Jelly',
  },
  {
    monster_id: 3,
    name_en: 'Wiggles',
  },
  {
    monster_id: 1000,
    name_en: 'Springy',
  },
  {
    monster_id: 1001,
    name_en: 'Ami',
  },
  {
    monster_id: 1002,
    name_en: 'Squirmy',
  },
  {
    monster_id: 2000,
    name_en: 'Toddle',
  },
  {
    monster_id: 2001,
    name_en: 'Huskin',
  },
  {
    monster_id: 2002,
    name_en: 'Mucky',
  },
  {
    monster_id: 2003,
    name_en: 'Burrball',
  },
  {
    monster_id: 2004,
    name_en: 'Flare',
  },
  {
    monster_id: 2005,
    name_en: 'Rime',
  },
  {
    monster_id: 2006,
    name_en: 'Harmony',
  },
  {
    monster_id: 2007,
    name_en: 'Forte',
  },
  {
    monster_id: 2008,
    name_en: 'Umbra',
  },
  {
    monster_id: 3000,
    name_en: 'Pippin',
  },
  {
    monster_id: 3001,
    name_en: 'Scowler',
  },
  {
    monster_id: 3002,
    name_en: 'Peppy',
  },
  {
    monster_id: 3003,
    name_en: 'Mirth',
  },
  {
    monster_id: 3004,
    name_en: 'Ardentia',
  },
  {
    monster_id: 3005,
    name_en: 'Psyon',
  },
  {
    monster_id: 3006,
    name_en: 'Brawnio',
  },
  {
    monster_id: 3007,
    name_en: 'Adamante',
  },
  {
    monster_id: 3008,
    name_en: 'Dewy',
  },
  {
    monster_id: 3009,
    name_en: 'Twinkle',
  },
  {
    monster_id: 3010,
    name_en: 'Virtuoso',
  },
  {
    monster_id: 3011,
    name_en: 'Aloofonso',
  },
  {
    monster_id: 4000,
    name_en: 'Ryu',
    plan: 'W5BRP',
  },
  {
    monster_id: 4002,
    name_en: 'Violent Ken',
    plan: 'B5CRT',
  },
  {
    monster_id: 4003,
    name_en: 'Ken',
    plan: 'W5BRT',
  },
  {
    monster_id: 4004,
    name_en: 'Chun-Li',
  },
  {
    monster_id: 4005,
    name_en: 'Cammy',
  },
  {
    monster_id: 4006,
    name_en: 'Guile',
  },
  {
    monster_id: 4007,
    name_en: 'Blanka',
  },
  {
    monster_id: 4008,
    name_en: 'Dhalsim',
  },
  {
    monster_id: 4009,
    name_en: 'Zangief',
  },
  {
    monster_id: 4010,
    name_en: 'E. Honda',
    plan: 'Y5ALT',
    matchFever: [4030, 4005, 4092],
  },
  {
    monster_id: 4012,
    name_en: 'Balrog',
    plan: 'G5BLP',
    matchFever: [4083, 4004, 4008],
  },
  {
    monster_id: 4013,
    name_en: 'Vega',
  },
  {
    monster_id: 4014,
    name_en: 'Sagat',
  },
  {
    monster_id: 4015,
    name_en: 'M. Bison',
  },
  {
    monster_id: 4016,
    name_en: 'Dee Jay',
  },
  {
    monster_id: 4018,
    name_en: 'Fei Long',
  },
  {
    monster_id: 4022,
    name_en: 'R. Mika',
  },
  {
    monster_id: 4026,
    name_en: 'Juli',
  },
  {
    monster_id: 4029,
    name_en: 'Rolento',
  },
  {
    monster_id: 4030,
    name_en: 'Sodom',
  },
  {
    monster_id: 4033,
    name_en: 'Cody',
  },
  {
    monster_id: 4035,
    name_en: 'Guy',
  },
  {
    monster_id: 4040,
    name_en: 'Edi. E',
  },
  {
    monster_id: 4042,
    name_en: 'Joe',
  },
  {
    monster_id: 4044,
    name_en: 'Retsu',
  },
  {
    monster_id: 4049,
    name_en: 'Dudley',
  },
  {
    monster_id: 4051,
    name_en: 'Yang',
  },
  {
    monster_id: 4057,
    name_en: 'Urien',
  },
  {
    monster_id: 4065,
    name_en: 'Juri',
  },
  {
    monster_id: 4067,
    name_en: 'Kolin',
  },
  {
    monster_id: 4074,
    name_en: 'Crimson Viper',
  },
  {
    monster_id: 4079,
    name_en: 'Necalli',
  },
  {
    monster_id: 4082,
    name_en: 'Akira Kazama',
  },
  {
    monster_id: 4083,
    name_en: 'Luke',
  },
  {
    monster_id: 4084,
    name_en: 'Jamie',
  },
  {
    monster_id: 4085,
    name_en: 'Kimberly',
  },
  {
    monster_id: 4086,
    name_en: 'Manon',
  },
  {
    monster_id: 4087,
    name_en: 'Marisa',
  },
  {
    monster_id: 4088,
    name_en: 'Rashid',
  },
  {
    monster_id: 4089,
    name_en: 'Lily',
  },
  {
    monster_id: 4090,
    name_en: 'JP',
  },
  {
    monster_id: 4092,
    name_en: 'Captain Sawada',
  },
  {
    monster_id: 4096,
    name_en: 'Captain Commando',
  },
  {
    monster_id: 4115,
    name_en: 'Lilith',
  },
  {
    monster_id: 4119,
    name_en: 'Kenji',
  },
  {
    monster_id: 4120,
    name_en: 'Mai-Ling',
  },
  {
    monster_id: 4121,
    name_en: 'Tessa',
  },
  {
    monster_id: 4124,
    name_en: 'Carlos Miyamoto',
  },
];

export default monsters;
